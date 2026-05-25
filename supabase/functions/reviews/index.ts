import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.58.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
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

    // GET /reviews - List reviews (optionally filtered by user)
    if (method === "GET" && url.pathname.endsWith("/reviews")) {
      const userId = url.searchParams.get("user_id");
      const type = url.searchParams.get("type"); // 'received' or 'given'

      let query = supabase
        .from("reviews")
        .select(`
          id,
          rating,
          comment,
          created_at,
          session_id,
          reviewer:profiles!reviews_reviewer_id_fkey(id, full_name, avatar_url),
          reviewee:profiles!reviews_reviewee_id_fkey(id, full_name, avatar_url)
        `)
        .order("created_at", { ascending: false });

      if (userId && type === "received") {
        query = query.eq("reviewee_id", userId);
      } else if (userId && type === "given") {
        query = query.eq("reviewer_id", userId);
      } else if (userId) {
        query = query.or(`reviewee_id.eq.${userId},reviewer_id.eq.${userId}`);
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

    // POST /reviews - Create review
    if (method === "POST" && url.pathname.endsWith("/reviews")) {
      const body = await req.json();
      const { session_id, reviewee_id, rating, comment } = body;

      if (!session_id || !reviewee_id || !rating) {
        return new Response(JSON.stringify({ error: "Missing required fields" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      if (rating < 1 || rating > 5) {
        return new Response(JSON.stringify({ error: "Rating must be between 1 and 5" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Verify session exists and user is part of it
      const { data: session, error: sessionError } = await supabase
        .from("sessions")
        .select("mentor_id, learner_id, status")
        .eq("id", session_id)
        .single();

      if (sessionError || !session) {
        return new Response(JSON.stringify({ error: "Session not found" }), {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      if (session.status !== "completed") {
        return new Response(JSON.stringify({ error: "Can only review completed sessions" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      if (session.mentor_id !== user.id && session.learner_id !== user.id) {
        return new Response(JSON.stringify({ error: "Unauthorized" }), {
          status: 403,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Check for existing review
      const { data: existing } = await supabase
        .from("reviews")
        .select("id")
        .eq("session_id", session_id)
        .eq("reviewer_id", user.id)
        .maybeSingle();

      if (existing) {
        return new Response(JSON.stringify({ error: "Review already exists for this session" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const { data, error } = await supabase
        .from("reviews")
        .insert({
          session_id,
          reviewer_id: user.id,
          reviewee_id,
          rating,
          comment: comment || "",
        })
        .select()
        .single();

      if (error) {
        return new Response(JSON.stringify({ error: error.message }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Update reviewee's average rating
      const { data: reviews } = await supabase
        .from("reviews")
        .select("rating")
        .eq("reviewee_id", reviewee_id);

      if (reviews && reviews.length > 0) {
        const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
        await supabase
          .from("profiles")
          .update({
            avg_rating: Math.round(avgRating * 100) / 100,
            review_count: reviews.length,
          })
          .eq("id", reviewee_id);
      }

      // Notify reviewee
      await supabase.from("notifications").insert({
        user_id: reviewee_id,
        type: "review",
        title: "New review received",
        message: `You received a ${rating}-star review.`,
        related_id: data.id,
      });

      return new Response(JSON.stringify(data), {
        status: 201,
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
