/**
 * AI Workout Generator Service
 * Uses OpenRouter API to generate personalized workouts
 */

const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';
const OPENROUTER_API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY;

/**
 * Convert camelCase keys to snake_case for Supabase compatibility
 * @param {Object} obj - Object with camelCase keys
 * @returns {Object} Object with snake_case keys
 */
function toSnakeCase(obj) {
  const result = {};
  for (const [key, value] of Object.entries(obj)) {
    // Convert camelCase to snake_case
    const snakeKey = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
    result[snakeKey] = value;
  }
  return result;
}

// Personal Trainer AI Agent System Prompt
const PERSONAL_TRAINER_PROMPT = `Você é um Personal Trainer experiente e certificado, especializado em criar treinos personalizados.

IMPORTANTE: Você DEVE retornar APENAS um JSON válido, sem texto adicional antes ou depois.

Sua tarefa é analisar os dados do usuário e criar um treino eficiente e seguro baseado nos exercícios disponíveis.

Diretrizes:
1. Respeite SEMPRE o nível de experiência do usuário
2. Use APENAS exercícios da lista fornecida
3. PRIORIDADE DE EQUIPAMENTO (quando o usuário tem acesso a academia/gym):
   - **PRIORIDADE MÁXIMA**: Exercícios em MÁQUINAS (especialmente exercícios com IDs que começam com "nk", que são máquinas Nakagym). Esses devem compor a MAIORIA do treino (60-70% dos exercícios).
   - **PRIORIDADE ALTA**: Exercícios com halteres (dumbbells) e barras (barbell). Complemente o treino com esses (20-30%).
   - **PRIORIDADE BAIXA**: Exercícios de peso corporal (bodyweight) como burpees, agachamentos livres, squats. Use apenas como complemento (0-10%), NÃO como base do treino quando o usuário tem academia.
   - Se o usuário tem "gym" ou "Academia completa", EVITE montar treinos baseados em peso corporal. O usuário está pagando academia para usar os equipamentos.
   - Se o usuário tem APENAS "peso corporal" ou "bodyweight", aí sim use exercícios de corpo livre.
4. Respeite lesões e restrições mencionadas
5. Ajuste volume e intensidade ao objetivo do usuário
6. Distribua exercícios de forma balanceada pelos grupos musculares solicitados
7. Quantidade de exercícios baseada no tempo disponível e nível:
   - 30 min: 4-5 exercícios (iniciante), 5-6 (intermediário), 6-7 (avançado)
   - 45 min: 5-7 exercícios (iniciante), 6-8 (intermediário), 7-9 (avançado)
   - 60 min: 6-8 exercícios (iniciante), 7-10 (intermediário), 8-12 (avançado)
   - 90 min: 8-10 exercícios (iniciante), 9-12 (intermediário), 10-14 (avançado)
8. Séries baseadas no nível:
   - Iniciantes: 2-3 séries
   - Intermediários: 3-4 séries
   - Avançados: 4-5 séries

Formato de resposta (JSON APENAS):
{
  "name": "Nome do treino",
  "description": "Descrição breve e motivadora",
  "category": "strength/cardio/hiit/flexibility",
  "difficulty": "beginner/intermediate/advanced",
  "estimatedDuration": número em minutos,
  "muscleGroups": ["grupo1", "grupo2"],
  "exercises": [
    {
      "exerciseId": "id_do_exercicio",
      "exerciseName": "Nome do exercício",
      "sets": número de séries,
      "reps": "número ou range (ex: 8-12)",
      "rest": segundos de descanso,
      "notes": "dicas específicas (opcional)"
    }
  ]
}`;

/**
 * Generate a single workout using AI
 * @param {Object} userData - User profile data
 * @param {Array} availableExercises - List of exercises from database
 * @param {Object} preferences - Additional preferences (optional)
 * @returns {Promise<Object>} Generated workout
 */
export async function generateWorkout(userData, availableExercises, preferences = {}) {
  if (!OPENROUTER_API_KEY) {
    throw new Error('OpenRouter API key não configurada. Adicione VITE_OPENROUTER_API_KEY ao .env.local');
  }

  // Don't filter exercises - let AI decide based on user's equipment
  const userEquipment = userData.equipment || [];

  // Build equipment description for AI
  const equipmentDescription = userEquipment.includes('gym')
    ? 'Academia completa (barras, halteres, cabos, máquinas, bancos, barra fixa)'
    : userEquipment.length > 0
    ? userEquipment.join(', ')
    : 'peso corporal apenas';

  // Build user context
  const userContext = `
DADOS DO USUÁRIO:
- Objetivo: ${userData.goal || 'não especificado'}
- Nível: ${userData.fitnessLevel || 'intermediate'}
- Dias por semana: ${userData.daysPerWeek || 3}
- Tempo de treino: ${userData.duration || 45} minutos
- Equipamentos disponíveis: ${equipmentDescription}
- Horário preferido: ${userData.preferredTime || 'não especificado'}
- Lesões/Restrições: ${userData.injuries?.length > 0 ? userData.injuries.join(', ') : 'nenhuma'}
- Idade: ${userData.age || 'não especificada'}
- Gênero: ${userData.gender || 'não especificado'}

${preferences.focusArea ? `FOCO ESPECÍFICO: ${preferences.focusArea}` : ''}
${preferences.category ? `CATEGORIA: ${preferences.category}` : ''}

EXERCÍCIOS DISPONÍVEIS (${availableExercises.length}):
${availableExercises.map(ex =>
  `- ID: "${ex.id}", Nome: "${ex.name}", Categoria: ${ex.category}, Equipamento: ${JSON.stringify(ex.equipment || [])}, Dificuldade: ${ex.difficulty}, Músculos: ${JSON.stringify(ex.primary_muscles || ex.primaryMuscles || [])}`
).join('\n')}
`;

  try {
    const response = await fetch(OPENROUTER_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'HTTP-Referer': window.location.origin,
        'X-Title': 'MyFit AI - Personal Trainer'
      },
      body: JSON.stringify({
        model: 'openai/gpt-4o-mini', // Use Claude for best results
        messages: [
          {
            role: 'system',
            content: PERSONAL_TRAINER_PROMPT
          },
          {
            role: 'user',
            content: userContext + '\n\nGere UM treino completo e retorne APENAS o JSON, sem texto adicional.'
          }
        ],
        temperature: 0.7,
        max_tokens: 2000
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`OpenRouter API Error: ${errorData.error?.message || response.statusText}`);
    }

    const data = await response.json();
    const aiResponse = data.choices?.[0]?.message?.content;

    if (!aiResponse) {
      throw new Error('Resposta vazia da IA');
    }

    // Parse JSON from response (remove markdown code blocks if present)
    let jsonStr = aiResponse.trim();
    if (jsonStr.startsWith('```')) {
      jsonStr = jsonStr.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    }

    const workout = JSON.parse(jsonStr);

    // Validate workout structure
    if (!workout.name || !workout.exercises || !Array.isArray(workout.exercises)) {
      throw new Error('Formato de treino inválido retornado pela IA');
    }

    // Convert workout keys to snake_case for Supabase compatibility
    const workoutSnakeCase = toSnakeCase(workout);

    // Add metadata (already in snake_case)
    workoutSnakeCase.workout_type = 'ai-generated';
    workoutSnakeCase.created_at = new Date().toISOString();
    workoutSnakeCase.ai_metadata = {
      model: 'claude-3.5-sonnet',
      generatedAt: new Date().toISOString(),
      userLevel: userData.fitnessLevel,
      userGoal: userData.goal
    };

    return workoutSnakeCase;

  } catch (error) {
    console.error('Error generating workout:', error);
    throw new Error(`Falha ao gerar treino: ${error.message}`);
  }
}

/**
 * Generate multiple workouts for a weekly schedule
 * @param {Object} userData - User profile data
 * @param {Array} availableExercises - List of exercises from database
 * @param {number} numberOfWorkouts - Number of workouts to generate
 * @returns {Promise<Array>} Array of generated workouts
 */
export async function generateWeeklyWorkouts(userData, availableExercises, numberOfWorkouts) {
  if (!numberOfWorkouts || numberOfWorkouts < 1) {
    numberOfWorkouts = userData.daysPerWeek || 3;
  }

  const workouts = [];

  // Define focus areas for variety
  const focusAreas = [
    'Upper Body (Peito, Costas, Ombros)',
    'Lower Body (Pernas e Glúteos)',
    'Full Body (Corpo todo)',
    'Core e Abdômen',
    'Arms (Braços - Bíceps e Tríceps)',
    'Back and Shoulders (Costas e Ombros)'
  ];

  // Categories rotation
  const categories = ['strength', 'strength', 'hiit'];

  for (let i = 0; i < numberOfWorkouts; i++) {
    try {
      const preferences = {
        focusArea: focusAreas[i % focusAreas.length],
        category: categories[i % categories.length]
      };

      console.log(`Gerando treino ${i + 1}/${numberOfWorkouts} - Foco: ${preferences.focusArea}`);

      const workout = await generateWorkout(userData, availableExercises, preferences);

      // Add day information
      workout.name = `${workout.name} - Dia ${i + 1}`;
      workout.day_of_week = i + 1;

      workouts.push(workout);

      // Add delay between requests to avoid rate limiting
      if (i < numberOfWorkouts - 1) {
        await new Promise(resolve => setTimeout(resolve, 1500));
      }

    } catch (error) {
      console.error(`Erro ao gerar treino ${i + 1}:`, error);
      throw new Error(`Falha ao gerar treino ${i + 1}: ${error.message}`);
    }
  }

  return workouts;
}

/**
 * Check if OpenRouter API is configured
 * @returns {boolean}
 */
export function isAIConfigured() {
  return !!OPENROUTER_API_KEY;
}

/**
 * Ask AI to suggest a replacement exercise
 * @param {Object} exerciseToReplace - The exercise being replaced (with details)
 * @param {Array} currentWorkoutExercises - All exercises currently in the workout
 * @param {Array} availableExercises - Full list of available exercises from DB
 * @param {Object} userData - User profile data (optional, for context)
 * @returns {Promise<Object>} Suggested replacement { exerciseId, exerciseName, reason }
 */
export async function suggestExerciseSwap(exerciseToReplace, currentWorkoutExercises, availableExercises, userData = {}) {
  if (!OPENROUTER_API_KEY) {
    throw new Error('OpenRouter API key não configurada.');
  }

  // Exclude exercises already in the workout
  const currentIds = currentWorkoutExercises.map(e => e.exerciseId || e.id);
  const candidates = availableExercises.filter(e => !currentIds.includes(e.id));

  const prompt = `Você é um Personal Trainer experiente. O aluno quer SUBSTITUIR um exercício do treino por outro semelhante.

EXERCÍCIO A SUBSTITUIR:
- Nome: ${exerciseToReplace.name}
- Categoria: ${exerciseToReplace.category || 'N/A'}
- Músculos primários: ${JSON.stringify(exerciseToReplace.primary_muscles || exerciseToReplace.primaryMuscles || [])}
- Músculos secundários: ${JSON.stringify(exerciseToReplace.secondary_muscles || exerciseToReplace.secondaryMuscles || [])}
- Equipamento: ${JSON.stringify(exerciseToReplace.equipment || [])}
- Dificuldade: ${exerciseToReplace.difficulty || 'N/A'}

EXERCÍCIOS JÁ NO TREINO (não repetir):
${currentWorkoutExercises.map(e => `- ${e.name || e.exerciseName || 'Unknown'}`).join('\n')}

${userData.fitnessLevel ? `NÍVEL DO ALUNO: ${userData.fitnessLevel}` : ''}
${userData.injuries?.length ? `LESÕES/RESTRIÇÕES: ${userData.injuries.join(', ')}` : ''}
${userData.equipment?.length ? `EQUIPAMENTOS DISPONÍVEIS: ${userData.equipment.join(', ')}` : ''}

EXERCÍCIOS DISPONÍVEIS PARA SUBSTITUIÇÃO (${candidates.length}):
${candidates.map(ex =>
  `- ID: "${ex.id}", Nome: "${ex.name}", Categoria: ${ex.category}, Equipamento: ${JSON.stringify(ex.equipment || [])}, Músculos: ${JSON.stringify(ex.primary_muscles || ex.primaryMuscles || [])}`
).join('\n')}

Escolha o exercício mais adequado para substituir, priorizando:
1. Mesmos músculos trabalhados
2. Equipamento compatível com o que o aluno tem
3. Nível de dificuldade similar
4. Que complemente bem os demais exercícios do treino

Retorne APENAS um JSON:
{
  "exerciseId": "id_do_exercicio_escolhido",
  "exerciseName": "Nome do exercício",
  "reason": "Breve explicação de por que esta é uma boa substituição (1-2 frases em português)"
}`;

  try {
    const response = await fetch(OPENROUTER_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'HTTP-Referer': window.location.origin,
        'X-Title': 'MyFit AI - Personal Trainer'
      },
      body: JSON.stringify({
        model: 'openai/gpt-4o-mini',
        messages: [
          { role: 'system', content: 'Você é um Personal Trainer. Retorne APENAS JSON válido, sem texto adicional.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.5,
        max_tokens: 500
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`OpenRouter API Error: ${errorData.error?.message || response.statusText}`);
    }

    const data = await response.json();
    const aiResponse = data.choices?.[0]?.message?.content;

    if (!aiResponse) throw new Error('Resposta vazia da IA');

    let jsonStr = aiResponse.trim();
    if (jsonStr.startsWith('```')) {
      jsonStr = jsonStr.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    }

    const suggestion = JSON.parse(jsonStr);

    if (!suggestion.exerciseId || !suggestion.exerciseName) {
      throw new Error('Resposta da IA em formato inválido');
    }

    // Validate that the suggested exercise exists in candidates
    const validExercise = candidates.find(e => e.id === suggestion.exerciseId);
    if (!validExercise) {
      throw new Error('IA sugeriu um exercício inválido');
    }

    return suggestion;
  } catch (error) {
    console.error('Error suggesting exercise swap:', error);
    throw new Error(`Falha ao sugerir substituição: ${error.message}`);
  }
}
