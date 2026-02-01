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

    if (!replicate_api_key) {
      throw new Error("REPLICATE_API_KEY not configured");
    }

    console.log("Starting image generation for:", workoutName);

    // Create prediction
    const predictionResponse = await fetch(replicate_api_url, {
      method: "POST",
      headers: {
        Authorization: `Token ${replicate_api_key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        version: "d42d6f71d3ecbe61413ab7088859e418b435add4812424ae6e0d65f70b477143",
        input: {
          prompt: imagePrompt,
          num_inference_steps: 30,
          guidance_scale: 7.5,
          scheduler: "K_EULER",
          seed: Math.floor(Math.random() * 1000000),
        },
      }),
    });

    if (!predictionResponse.ok) {
      const error = await predictionResponse.text();
      throw new Error(`Replicate error: ${error}`);
    }

    const prediction = await predictionResponse.json();
    const predictionId = prediction.id;
    console.log("Prediction created:", predictionId);

    // Poll for completion
    let imageUrl: string | null = null;
    let attempts = 0;

    while (attempts < 120) {
      const statusResponse = await fetch(`${replicate_api_url}/${predictionId}`, {
        headers: {
          Authorization: `Token ${replicate_api_key}`,
        },
      });

      const status = await statusResponse.json();
      console.log(`Status: ${status.status}`);

      if (status.status === "succeeded") {
        const output = status.output;
        if (Array.isArray(output) && output.length > 0) {
          imageUrl = output[0];
        }
        break;
      } else if (status.status === "failed") {
        throw new Error(`Generation failed: ${status.error}`);
      }

      await new Promise((resolve) => setTimeout(resolve, 5000));
      attempts++;
    }

    if (!imageUrl) {
      throw new Error("Generation timeout");
    }

    console.log("Image generated:", imageUrl);

    return new Response(
      JSON.stringify({
        success: true,
        imageUrl: imageUrl,
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
