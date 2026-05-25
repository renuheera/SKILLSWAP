import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.58.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const authHeader = req.headers.get("Authorization");

    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Missing authorization header" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Invalid token" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const url = new URL(req.url);
    const method = req.method;

    // GET /sessions - List user's sessions
    if (method === "GET" && url.pathname.endsWith("/sessions")) {
      const status = url.searchParams.get("status");

      let query = supabase
        .from("sessions")
        .select(`
          id,
          skill,
          skill_category,
          scheduled_at,
          duration_minutes,
          status,
          meeting_link,
          notes,
          created_at,
          mentor:profiles!sessions_mentor_id_fkey(id, full_name, avatar_url, location),
          learner:profiles!sessions_learner_id_fkey(id, full_name, avatar_url, location)
        `)
        .or(`mentor_id.eq.${user.id},learner_id.eq.${user.id}`)
        .order("scheduled_at", { ascending: true });

      if (status) {
        query = query.eq("status", status);
      }

      const { data, error } = await query;

      if (error) {
        return new Response(JSON.stringify({ error: error.message }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // POST /sessions - Create new session
    if (method === "POST" && url.pathname.endsWith("/sessions")) {
      const body = await req.json();
      const { mentor_id, skill, skill_category, scheduled_at, duration_minutes, notes } = body;

      if (!mentor_id || !skill || !scheduled_at) {
        return new Response(JSON.stringify({ error: "Missing required fields" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const { data, error } = await supabase
        .from("sessions")
        .insert({
          mentor_id,
          learner_id: user.id,
          skill,
          skill_category: skill_category || "",
          scheduled_at,
          duration_minutes: duration_minutes || 60,
          notes: notes || "",
          status: "pending",
        })
        .select()
        .single();

      if (error) {
        return new Response(JSON.stringify({ error: error.message }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Create notification for mentor
      await supabase.from("notifications").insert({
        user_id: mentor_id,
        type: "booking",
        title: "New booking request",
        message: `You have a new session request for ${skill}.`,
        related_id: data.id,
      });

      return new Response(JSON.stringify(data), {
        status: 201,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // PUT /sessions/:id - Update session status
    const match = url.pathname.match(/\/sessions\/([a-zA-Z0-9-]+)$/);
    if (method === "PUT" && match) {
      const sessionId = match[1];
      const body = await req.json();
      const { status, meeting_link, mentor_notes } = body;

      // Verify user is part of this session
      const { data: session, error: fetchError } = await supabase
        .from("sessions")
        .select("mentor_id, learner_id, skill")
        .eq("id", sessionId)
        .single();

      if (fetchError || !session) {
        return new Response(JSON.stringify({ error: "Session not found" }), {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      if (session.mentor_id !== user.id && session.learner_id !== user.id) {
        return new Response(JSON.stringify({ error: "Unauthorized" }), {
          status: 403,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const updateData: Record<string, unknown> = { updated_at: new Date().toISOString() };
      if (status) updateData.status = status;
      if (meeting_link) updateData.meeting_link = meeting_link;
      if (mentor_notes) updateData.mentor_notes = mentor_notes;

      const { data, error } = await supabase
        .from("sessions")
        .update(updateData)
        .eq("id", sessionId)
        .select()
        .single();

      if (error) {
        return new Response(JSON.stringify({ error: error.message }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Create notification for status change
      const notifyUserId = session.mentor_id === user.id ? session.learner_id : session.mentor_id;
      const statusMessages: Record<string, string> = {
        accepted: "Your session has been accepted!",
        rejected: "Your session request was declined.",
        completed: "Session completed. Don't forget to leave a review!",
        cancelled: "Session was cancelled.",
      };

      if (status && statusMessages[status]) {
        await supabase.from("notifications").insert({
          user_id: notifyUserId,
          type: "session",
          title: "Session update",
          message: statusMessages[status],
          related_id: sessionId,
        });
      }

      // Update total_sessions count for both parties if completed
      if (status === "completed") {
        await supabase.rpc("increment_session_count", { user_id: session.mentor_id });
        await supabase.rpc("increment_session_count", { user_id: session.learner_id });
      }

      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "Not found" }), {
      status: 404,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (err) {
    return new Response(JSON.stringify({ error: "Internal server error", details: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
