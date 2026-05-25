import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.58.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, PUT, OPTIONS",
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

    // GET /users - List/search users
    if (method === "GET" && url.pathname.endsWith("/users")) {
      const search = url.searchParams.get("search");
      const skill = url.searchParams.get("skill");
      const limit = parseInt(url.searchParams.get("limit") || "20");
      const offset = parseInt(url.searchParams.get("offset") || "0");

      let query = supabase
        .from("profiles")
        .select("id, full_name, avatar_url, bio, location, skills_offered, skills_wanted, avg_rating, review_count, total_sessions, is_verified, learning_streak")
        .order("avg_rating", { ascending: false })
        .range(offset, offset + limit - 1);

      if (search) {
        query = query.or(`full_name.ilike.%${search}%,bio.ilike.%${search}%`);
      }

      if (skill) {
        query = query.contains("skills_offered", [skill]);
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

    // GET /users/:id - Get single user
    const singleMatch = url.pathname.match(/\/users\/([a-zA-Z0-9-]+)$/);
    if (method === "GET" && singleMatch) {
      const userId = singleMatch[1];

      const { data, error } = await supabase
        .from("profiles")
        .select("id, full_name, avatar_url, bio, location, skills_offered, skills_wanted, portfolio_links, avg_rating, review_count, total_sessions, is_verified, learning_streak, created_at")
        .eq("id", userId)
        .single();

      if (error || !data) {
        return new Response(JSON.stringify({ error: "User not found" }), {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // PUT /users/me - Update current user's profile
    if (method === "PUT" && url.pathname.endsWith("/users/me")) {
      const body = await req.json();
      const { full_name, bio, location, avatar_url, skills_offered, skills_wanted, portfolio_links } = body;

      const updateData: Record<string, unknown> = { updated_at: new Date().toISOString() };
      if (full_name !== undefined) updateData.full_name = full_name;
      if (bio !== undefined) updateData.bio = bio;
      if (location !== undefined) updateData.location = location;
      if (avatar_url !== undefined) updateData.avatar_url = avatar_url;
      if (skills_offered !== undefined) updateData.skills_offered = skills_offered;
      if (skills_wanted !== undefined) updateData.skills_wanted = skills_wanted;
      if (portfolio_links !== undefined) updateData.portfolio_links = portfolio_links;

      const { data, error } = await supabase
        .from("profiles")
        .update(updateData)
        .eq("id", user.id)
        .select()
        .single();

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
