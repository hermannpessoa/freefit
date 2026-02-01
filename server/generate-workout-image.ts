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

async function generateImageWithReplicate(prompt: string): Promise<string | null> {
  if (!replicate_api_key) {
    console.warn("REPLICATE_API_KEY not configured");
    return null;
  }

  try {
    console.log("Generating image for prompt:", prompt);

    // Using Flux model with proper API format
    const predictionResponse = await fetch(replicate_api_url, {
      method: "POST",
      headers: {
        Authorization: `Token ${replicate_api_key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "black-forest-labs/flux-1.1-pro",
        input: {
          prompt: prompt,
          aspect_ratio: "1:1",
          output_format: "jpg",
          output_quality: 80,
        },
      }),
    });

    if (!predictionResponse.ok) {
      const error = await predictionResponse.text();
      console.error("Replicate API error response:", predictionResponse.status, error);
      return null;
    }

    const prediction = await predictionResponse.json();
    console.log("Prediction response:", JSON.stringify(prediction));
    
    const predictionId = prediction.id;
    if (!predictionId) {
      console.error("No prediction ID returned:", prediction);
      return null;
    }
    
    console.log("Prediction created:", predictionId);

    // Poll for completion (max 5 minutes)
    let imageUrl: string | null = null;
    let attempts = 0;
    const maxAttempts = 60; // 60 * 5 seconds = 5 minutes

    while (attempts < maxAttempts && !imageUrl) {
      const statusResponse = await fetch(`${replicate_api_url}/${predictionId}`, {
        headers: {
          Authorization: `Token ${replicate_api_key}`,
        },
      });

      if (!statusResponse.ok) {
        console.error("Status check failed:", statusResponse.status);
        return null;
      }

      const status = await statusResponse.json();
      console.log(`Status: ${status.status} (attempt ${attempts + 1}/${maxAttempts})`);

      if (status.status === "succeeded") {
        const output = status.output;
        if (Array.isArray(output) && output.length > 0) {
          imageUrl = output[0];
        } else if (typeof output === "string") {
          imageUrl = output;
        }
        break;
      } else if (status.status === "failed") {
        console.error("Generation failed:", status.error);
        return null;
      }

      await new Promise((resolve) => setTimeout(resolve, 5000));
      attempts++;
    }

    if (!imageUrl) {
      console.warn("Generation timeout after", maxAttempts * 5, "seconds");
      return null;
    }

    console.log("Image generated successfully:", imageUrl);
    return imageUrl;
  } catch (error) {
    console.error("Error generating image:", error);
    return null;
  }
}

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

    // Try to generate real image
    const imageUrl = await generateImageWithReplicate(imagePrompt);

    return new Response(
      JSON.stringify({
        success: imageUrl ? true : false,
        imageUrl: imageUrl,
        message: imageUrl ? "Image generated successfully" : "Image generation failed",
      }),
      {
        status: imageUrl ? 200 : 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({
        success: false,
        imageUrl: null,
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
