import axios from "npm:axios";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SERPAPI_API_KEY = Deno.env.get("SERPAPI_API_KEY");
const SERPAPI_URL = "https://serpapi.com/search";

// Mapeamento de exercícios em português para termos de busca mais específicos
const exerciseSearchTerms: Record<string, string[]> = {
  "leg press": ["leg press machine", "seated leg press", "leg press exercise"],
  "supino máquina": ["chest press machine", "machine chest press", "seated chest press"],
  "puxador frontal": ["lat pulldown exercise", "front pulldown machine", "latissimus dorsi"],
  "cadeira extensora": ["leg extension machine", "quadriceps exercise", "leg extension"],
  "cadeira flexora": ["leg curl machine", "hamstring curl", "seated leg curl"],
  "crucifixo máquina": ["machine fly", "pec fly machine", "chest fly exercise"],
  "remada máquina": ["rowing machine exercise", "seated row machine", "back rowing"],
  "desenvolvimento máquina": ["shoulder press machine", "seated shoulder press", "overhead press"],
  "rosca máquina": ["machine bicep curl", "arm curl machine", "biceps exercise"],
  "tríceps máquina": ["triceps machine", "triceps press machine", "triceps extension"],
  "tríceps pulley": ["triceps rope pulldown", "cable triceps", "triceps rope"],
  "tríceps corda": ["rope triceps pushdown", "cable triceps rope", "triceps rope exercise"],
  "cross over": ["cable crossover exercise", "chest crossover", "pec deck"],
  "remada baixa": ["low row cable", "cable row machine", "seated cable row"],
  "supino reto": ["barbell bench press", "chest press barbell", "flat bench press"],
  "agachamento livre": ["barbell squat", "free weight squat", "back squat exercise"],
  "remada curvada": ["barbell bent over row", "bent row", "barbell row"],
  "levantamento terra": ["deadlift exercise", "barbell deadlift", "conventional deadlift"],
  "rosca direta": ["barbell curl", "standing barbell curl", "bicep barbell curl"],
  "rosca alternada": ["dumbbell curl", "alternating dumbbell curl", "bicep dumbbell"],
  "desenvolvimento halteres": ["dumbbell shoulder press", "dumbbell overhead press", "seated dumbbell press"],
  "elevação lateral": ["lateral raise", "dumbbell lateral raise", "side raises"],
  "flexão": ["push up exercise", "chest push up", "bodyweight push up"],
  "agachamento": ["squat exercise", "free squat", "bodyweight squat"],
  "afundo": ["lunge exercise", "forward lunge", "walking lunge"],
  "prancha": ["plank exercise", "front plank", "bodyweight plank"],
  "abdominal": ["crunch exercise", "sit up exercise", "core exercise"],
  "burpee": ["burpee exercise", "full body burpee", "jump burpee"],
  "mountain climber": ["mountain climbers exercise", "core mountain climbers", "cardio exercise"],
  "corrida": ["running on treadmill", "treadmill exercise", "cardio running"],
  "bicicleta": ["stationary bike", "exercise bike", "cardio bike"],
  "elíptico": ["elliptical machine", "elliptical exercise", "cardio elliptical"],
};

async function searchWithRetry(
  exerciseName: string,
  searchQueries: string[],
  maxRetries: number = 3
): Promise<string | null> {
  for (let retryCount = 0; retryCount < maxRetries; retryCount++) {
    for (const query of searchQueries) {
      try {
        const response = await axios.get(SERPAPI_URL, {
          params: {
            q: query,
            engine: "google_images",
            api_key: SERPAPI_API_KEY,
            num: 5, // Pega mais resultados para selecionar o melhor
            country: "us",
          },
          timeout: 10000,
        });

        const imagesResults = response.data.images_results;

        if (imagesResults && imagesResults.length > 0) {
          // Filtra e pega a primeira imagem válida
          for (const imageResult of imagesResults) {
            const imageUrl = imageResult.original;
            
            // Validações básicas de URL
            if (imageUrl && 
                typeof imageUrl === 'string' && 
                imageUrl.startsWith('http') &&
                !imageUrl.includes('placeholder') &&
                !imageUrl.includes('loading')) {
              console.log(`Found image for "${exerciseName}" (${query}):`, imageUrl);
              return imageUrl;
            }
          }
        }
      } catch (error) {
        console.warn(`Retry ${retryCount + 1}: Query "${query}" failed:`, error instanceof Error ? error.message : error);
      }
    }
    
    // Aguarda um pouco antes de tentar novamente
    if (retryCount < maxRetries - 1) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }

  console.warn(`No valid images found for: ${exerciseName}`);
  return null;
}

async function searchGoogleImages(exerciseName: string): Promise<string | null> {
  if (!SERPAPI_API_KEY) {
    console.warn("SERPAPI_API_KEY not configured");
    return null;
  }

  if (!exerciseName || exerciseName.trim().length === 0) {
    console.warn("Exercise name is empty");
    return null;
  }

  try {
    console.log("Searching Google Images for exercise:", exerciseName);

    const normalizedName = exerciseName.toLowerCase().trim();
    
    // Tenta encontrar termos específicos no mapa
    let searchQueries: string[] = [];
    
    for (const [key, terms] of Object.entries(exerciseSearchTerms)) {
      if (normalizedName.includes(key) || key.includes(normalizedName)) {
        searchQueries = terms;
        break;
      }
    }
    
    // Se não encontrar no mapa, cria queries genéricas mas ainda específicas
    if (searchQueries.length === 0) {
      searchQueries = [
        `${exerciseName} exercise proper form fitness photo`,
        `${exerciseName} gym exercise technique`,
        `${exerciseName} workout form`,
      ];
    }

    return await searchWithRetry(exerciseName, searchQueries);
  } catch (error) {
    console.error("Error searching Google Images:", error);
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
    const { exerciseName } = body;

    console.log("Image search requested for:", exerciseName);

    // Search for image
    const imageUrl = await searchGoogleImages(exerciseName);

    return new Response(
      JSON.stringify({
        success: imageUrl ? true : false,
        imageUrl: imageUrl,
        message: imageUrl ? "Image found successfully" : "Image search failed",
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
