import Replicate from 'replicate';
import { createClient } from '@supabase/supabase-js';

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

const replicate = new Replicate({
  auth: Deno.env.get('REPLICATE_API_KEY'),
});

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
    console.log('Starting image generation for:', workoutName);

    // Generate image using Replicate SDXL
    const output = await replicate.run(
      'stability-ai/sdxl:39ed52f2a60c3b36b96a16fb5c4c5479534ff685bb6c221by1bf2b4cbf490544',
      {
        input: {
          prompt: imagePrompt,
          num_inference_steps: 30,
          guidance_scale: 7.5,
          scheduler: 'K_EULER',
          seed: Math.floor(Math.random() * 1000000),
        },
      }
    );

    if (!output || !Array.isArray(output) || output.length === 0) {
      throw new Error('No image generated');
    }

    const imageUrl = output[0] as string;
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
    const response = await fetch(imageUrl);
    if (!response.ok) {
      throw new Error('Failed to fetch generated image');
    }

    const blob = await response.arrayBuffer();

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
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      status: 200,
      headers: corsHeaders,
    });
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  try {
    const body = (await req.json()) as GenerateImageRequest;
    const result = await generateWorkoutImage(body);

    return new Response(JSON.stringify(result), {
      status: result.success ? 200 : 400,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders,
      },
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
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      }
    );
  }
});
