import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const replicate_api_url = "https://api.replicate.com/v1/predictions";
const replicate_api_key = Deno.env.get("REPLICATE_API_KEY");

const supabase = createClient(
  Deno.env.get("SUPABASE_URL") || "",
  Deno.env.get("SUPABASE_ANON_KEY") || ""
);

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Only POST allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const body = await req.json();
    const { imagePrompt, workoutName, userId } = body;

    console.log("Image generation requested for:", workoutName);
    console.log("Prompt:", imagePrompt);

    // For now, return a placeholder image URL
    // You can update this later with a working Replicate model
    const placeholderImageUrl = `https://via.placeholder.com/600x400?text=${encodeURIComponent(workoutName)}`;

    return new Response(
      JSON.stringify({
        success: true,
        imageUrl: placeholderImageUrl,
        message: "Using placeholder image for now",
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
