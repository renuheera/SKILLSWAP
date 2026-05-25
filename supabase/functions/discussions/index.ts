import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.58.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, OPTIONS",
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

    // GET /discussions - List discussions
    if (method === "GET" && url.pathname.endsWith("/discussions")) {
      const category = url.searchParams.get("category");
      const limit = parseInt(url.searchParams.get("limit") || "20");
      const offset = parseInt(url.searchParams.get("offset") || "0");

      let query = supabase
        .from("discussions")
        .select(`
          id,
          title,
          content,
          category,
          likes,
          replies_count,
          created_at,
          author:profiles!discussions_author_id_fkey(id, full_name, avatar_url)
        `)
        .order("created_at", { ascending: false })
        .range(offset, offset + limit - 1);

      if (category && category !== "All") {
        query = query.eq("category", category);
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

    // GET /discussions/:id - Get single discussion with replies
    const singleMatch = url.pathname.match(/\/discussions\/([a-zA-Z0-9-]+)$/);
    if (method === "GET" && singleMatch) {
      const discId = singleMatch[1];

      const { data: discussion, error: discError } = await supabase
        .from("discussions")
        .select(`
          id,
          title,
          content,
          category,
          likes,
          replies_count,
          created_at,
          author:profiles!discussions_author_id_fkey(id, full_name, avatar_url)
        `)
        .eq("id", discId)
        .single();

      if (discError || !discussion) {
        return new Response(JSON.stringify({ error: "Discussion not found" }), {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const { data: replies } = await supabase
        .from("discussion_replies")
        .select(`
          id,
          content,
          likes,
          created_at,
          author:profiles!discussion_replies_author_id_fkey(id, full_name, avatar_url)
        `)
        .eq("discussion_id", discId)
        .order("created_at", { ascending: true });

      return new Response(JSON.stringify({ ...discussion, replies: replies || [] }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // POST /discussions - Create discussion
    if (method === "POST" && url.pathname.endsWith("/discussions")) {
      const body = await req.json();
      const { title, content, category } = body;

      if (!title || !content) {
        return new Response(JSON.stringify({ error: "Title and content required" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const { data, error } = await supabase
        .from("discussions")
        .insert({
          author_id: user.id,
          title,
          content,
          category: category || "General",
        })
        .select()
        .single();

      if (error) {
        return new Response(JSON.stringify({ error: error.message }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      return new Response(JSON.stringify(data), {
        status: 201,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // POST /discussions/:id/like - Like a discussion
    const likeMatch = url.pathname.match(/\/discussions\/([a-zA-Z0-9-]+)\/like$/);
    if (method === "POST" && likeMatch) {
      const discId = likeMatch[1];

      const { error } = await supabase.rpc("increment_discussion_likes", { disc_id: discId });

      if (error) {
        // Fallback: manual increment
        const { data: disc } = await supabase
          .from("discussions")
          .select("likes")
          .eq("id", discId)
          .single();

        if (disc) {
          await supabase
            .from("discussions")
            .update({ likes: (disc.likes || 0) + 1 })
            .eq("id", discId);
        }
      }

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // POST /discussions/:id/reply - Reply to discussion
    const replyMatch = url.pathname.match(/\/discussions\/([a-zA-Z0-9-]+)\/reply$/);
    if (method === "POST" && replyMatch) {
      const discId = replyMatch[1];
      const body = await req.json();
      const { content } = body;

      if (!content) {
        return new Response(JSON.stringify({ error: "Content required" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const { data, error } = await supabase
        .from("discussion_replies")
        .insert({
          discussion_id: discId,
          author_id: user.id,
          content,
        })
        .select()
        .single();

      if (error) {
        return new Response(JSON.stringify({ error: error.message }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Increment reply count
      const { data: disc } = await supabase
        .from("discussions")
        .select("replies_count")
        .eq("id", discId)
        .single();

      if (disc) {
        await supabase
          .from("discussions")
          .update({ replies_count: (disc.replies_count || 0) + 1 })
          .eq("id", discId);
      }

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
