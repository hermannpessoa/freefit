import { createClient } from "jsr:@supabase/supabase-js@2";

/**
 * Supabase Edge Function to generate and upload workout images
 * This solves CORS issues by running on the server side
 */

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Max-Age': '86400',
};

const REPLICATE_API_KEY = Deno.env.get('REPLICATE_API_KEY');
const REPLICATE_API_URL = 'https://api.replicate.com/v1/predictions';

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') || '',
  Deno.env.get('SUPABASE_ANON_KEY') || ''
);

interface GenerateImageRequest {
  imagePrompt: string;
  workoutName: string;
  userId: string;
}

async function generateWorkoutImage(req: GenerateImageRequest) {
  const { imagePrompt, workoutName, userId } = req;

  try {
    if (!REPLICATE_API_KEY) {
      throw new Error('REPLICATE_API_KEY not configured');
    }

    console.log('Starting image generation for:', workoutName);

    // Create prediction via Replicate API
    const predictionResponse = await fetch(REPLICATE_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Token ${REPLICATE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        version: '39ed52f2a60c3b36b96a16fb5c4c5479534ff685bb6c221by1bf2b4cbf490544',
        input: {
          prompt: imagePrompt,
          num_inference_steps: 30,
          guidance_scale: 7.5,
          scheduler: 'K_EULER',
          seed: Math.floor(Math.random() * 1000000),
        },
      }),
    });

    if (!predictionResponse.ok) {
      const error = await predictionResponse.text();
      throw new Error(`Replicate API error: ${error}`);
    }

    const prediction = await predictionResponse.json();
    const predictionId = prediction.id;

    // Poll for completion (max 10 minutes)
    let imageUrl: string | null = null;
    let attempts = 0;
    const maxAttempts = 120; // 120 * 5 seconds = 10 minutes

    while (attempts < maxAttempts && !imageUrl) {
      const statusResponse = await fetch(`${REPLICATE_API_URL}/${predictionId}`, {
        headers: {
          'Authorization': `Token ${REPLICATE_API_KEY}`,
        },
      });

      const status = await statusResponse.json();
      console.log(`Prediction status: ${status.status}`);

      if (status.status === 'succeeded') {
        const output = status.output;
        if (Array.isArray(output) && output.length > 0) {
          imageUrl = output[0];
        }
        break;
      } else if (status.status === 'failed') {
        throw new Error(`Image generation failed: ${status.error}`);
      }

      // Wait 5 seconds before polling again
      await new Promise((resolve) => setTimeout(resolve, 5000));
      attempts++;
    }

    if (!imageUrl) {
      throw new Error('Image generation timed out');
    }

    console.log('Image generated:', imageUrl);

    // Upload to Supabase Storage
    const timestamp = new Date().getTime();
    const sanitizedName = workoutName
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .slice(0, 30);
    const filename = `${userId}/${sanitizedName}-${timestamp}.jpg`;

    // Fetch the generated image
    const imageResponse = await fetch(imageUrl);
    if (!imageResponse.ok) {
      throw new Error('Failed to fetch generated image');
    }

    const blob = await imageResponse.arrayBuffer();

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from('workout-images')
      .upload(filename, blob, {
        contentType: 'image/jpeg',
        upsert: false,
      });

    if (error) {
      console.error('Error uploading to storage:', error);
      throw error;
    }

    // Get public URL
    const { data: publicUrlData } = supabase.storage
      .from('workout-images')
      .getPublicUrl(filename);

    return {
      success: true,
      imageUrl: publicUrlData.publicUrl,
      message: 'Image generated and uploaded successfully',
    };
  } catch (error) {
    console.error('Error generating image:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      imageUrl: null,
    };
  }
}

Deno.serve(async (req) => {
  // Always include CORS headers in response
  const responseHeaders = new Headers(corsHeaders);
  responseHeaders.set('Content-Type', 'application/json');

  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: responseHeaders,
    });
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: responseHeaders,
    });
  }

  try {
    const body = (await req.json()) as GenerateImageRequest;
    const result = await generateWorkoutImage(body);

    return new Response(JSON.stringify(result), {
      status: result.success ? 200 : 400,
      headers: responseHeaders,
    });
  } catch (error) {
    console.error('Edge function error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }),
      {
        status: 500,
        headers: responseHeaders,
      }
    );
  }
});
