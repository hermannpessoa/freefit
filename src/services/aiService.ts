import axios from 'axios';
import type { OnboardingData } from '@/types';

const OPENROUTER_API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY || '';
const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';
const MODEL = 'google/gemini-2.5-flash-lite';

interface GenerateWorkoutParams {
  onboardingData: OnboardingData;
  workoutDuration: number;
}

interface GenerateMultipleWorkoutsParams {
  onboardingData: OnboardingData;
  workoutDuration: number;
  numberOfWorkouts: number;
}

// Função para limpar e corrigir JSON malformado
function cleanAndParseJSON(jsonString: string): any {
  try {
    // Primeira tentativa: parse direto
    return JSON.parse(jsonString);
  } catch (e) {
    console.warn('Direct parse failed, attempting cleanup...');
  }

  // Remove markdown code blocks
  let cleaned = jsonString
    .replace(/^```json\n?/, '')
    .replace(/\n?```$/, '')
    .replace(/^```\n?/, '')
    .replace(/\n?```$/, '');

  try {
    // Segunda tentativa: após remover markdown
    return JSON.parse(cleaned);
  } catch (e) {
    console.warn('Markdown removal failed, attempting character fixes...');
  }

  // Tenta corrigir problemas comuns
  cleaned = cleaned
    // Remove comentários //
    .replace(/\/\/.*$/gm, '')
    // Corrige aspas simples para duplas (cuidado com contrações)
    .replace(/: '([^']*)'/g, ': "$1"')
    // Remove quebras de linha dentro de strings
    .replace(/(\r\n|\n|\r)/g, ' ')
    // Remove espaços extras
    .replace(/\s+/g, ' ')
    // Corrige vírgulas antes de }
    .replace(/,(\s*[}\]])/g, '$1');

  try {
    return JSON.parse(cleaned);
  } catch (e) {
    console.warn('Character fixes failed, attempting extraction...');
  }

  // Última tentativa: extrai apenas o primeiro objeto/array válido
  const objectMatch = cleaned.match(/\{[\s\S]*\}(?=\s*$|\s*,)/);
  const arrayMatch = cleaned.match(/\[[\s\S]*\](?=\s*$)/);
  
  const extracted = objectMatch?.[0] || arrayMatch?.[0];
  if (extracted) {
    try {
      return JSON.parse(extracted);
    } catch (e) {
      console.error('Could not parse extracted JSON:', e);
      throw new Error(`Could not parse JSON after all cleanup attempts. Original error: ${e instanceof Error ? e.message : String(e)}`);
    }
  }

  throw new Error('Could not parse JSON after all cleanup attempts');
}


export const aiService = {
  async generatePersonalizedWorkout(params: GenerateWorkoutParams): Promise<any> {
    if (!OPENROUTER_API_KEY) {
      throw new Error('OpenRouter API key not configured');
    }

    const { onboardingData, workoutDuration } = params;

    const goalDifferenceKg = Math.abs((onboardingData.target_weight || onboardingData.weight) - onboardingData.weight);
    const goalTypeText = onboardingData.target_weight ? (onboardingData.target_weight > onboardingData.weight ? 'GAIN' : onboardingData.target_weight < onboardingData.weight ? 'LOSE' : 'MAINTAIN') : '';

    const targetWeightLine = onboardingData.target_weight ? `- Target Weight: ${onboardingData.target_weight} kg (${goalTypeText} ${goalDifferenceKg} kg)` : '';

    const gymInstructions = onboardingData.gym_type === 'gym' ? `

**REGRA OBRIGATÓRIA - ACADEMIA**:
O usuário treina em ACADEMIA. Você DEVE usar APENAS exercícios com EQUIPAMENTOS DE ACADEMIA:
- Máquinas: Leg Press, Supino Máquina, Puxador Frontal, Cadeira Extensora, Cadeira Flexora, Crucifixo Máquina, Remada Máquina, Desenvolvimento Máquina, Rosca Máquina, Tríceps Máquina
- Cabos/Polia: Tríceps Pulley, Tríceps Corda, Cross Over, Remada Baixa (cabo)
- Barras e Anilhas: Supino Reto com Barra, Agachamento Livre com Barra, Remada Curvada, Levantamento Terra, Rosca Direta com Barra
- Halteres: Rosca Alternada, Desenvolvimento com Halteres, Elevação Lateral

NÃO USE exercícios de peso corporal como: flexão, abdominal no chão, prancha, polichinelo, burpee.
TODOS os exercícios devem usar equipamentos de academia.
` : `

**REGRA OBRIGATÓRIA - CASA**:
O usuário treina em CASA. Use APENAS exercícios com peso corporal ou equipamentos simples de casa:
- Flexões, Agachamentos livres, Afundos, Prancha, Abdominais, Burpees, Mountain Climbers
- Se tiver halteres: Rosca, Elevação Lateral, etc.
NÃO USE máquinas de academia.
`;

    const prompt = `
Você é um treinador de fitness profissional especializado. Gere um plano de treino personalizado com base no seguinte perfil do usuário:

- Gênero: ${onboardingData.gender}
- Idade: ${onboardingData.age}
- Peso Atual: ${onboardingData.weight} kg
- Altura: ${onboardingData.height} cm
- Objetivo: ${onboardingData.objective === 'weight_loss' ? 'Perda de Peso' : onboardingData.objective === 'muscle_gain' ? 'Ganho Muscular' : 'Manutenção'}
${targetWeightLine}
- Nível de Experiência: ${onboardingData.level}
- Local de Treino: ${onboardingData.gym_type === 'gym' ? 'ACADEMIA (usar máquinas e equipamentos)' : 'CASA (peso corporal)'}
- Tempo Disponível: ${onboardingData.available_time} minutos por sessão
- Duração do Treino: ${workoutDuration} minutos
${gymInstructions}
Gere uma resposta JSON em PORTUGUÊS com a seguinte estrutura:
{
  "name": "Nome do treino",
  "description": "Descrição breve e motivadora",
  "image": "Uma descrição detalhada para gerar uma imagem do treino (ex: 'Pessoa fazendo leg press em uma academia moderna com iluminação azul neon')",
  "exercises": [
    {
      "name": "Nome do exercício principal",
      "sets": número,
      "reps": "Intervalo de repetições como 8-12",
      "rest_time": número em segundos,
      "notes": "Dicas importantes sobre a execução",
      "alternatives": [
        {
          "name": "Exercício alternativo 1",
          "reason": "Por que é uma boa alternativa"
        },
        {
          "name": "Exercício alternativo 2",
          "reason": "Por que é uma boa alternativa"
        }
      ]
    }
  ],
  "tips": ["Dica geral para este treino"]
}

REQUISITOS IMPORTANTES:
- Cada exercício deve ter exatamente 2 alternativas
- As alternativas devem ser realistas e trabalhar os mesmos músculos
- Se ACADEMIA: OBRIGATÓRIO usar máquinas, cabos, barras e halteres. PROIBIDO exercícios de peso corporal.
- Se CASA: use apenas peso corporal ou equipamentos simples domésticos
- Retorne APENAS JSON válido, sem formatação markdown
- Não inclua código, aspas extras ou caracteres especiais
`;

    try {
      const response = await axios.post(
        OPENROUTER_API_URL,
        {
          model: MODEL,
          messages: [
            {
              role: 'user',
              content: prompt,
            },
          ],
          temperature: 0.7,
          max_tokens: 2000,
        },
        {
          headers: {
            Authorization: `Bearer ${OPENROUTER_API_KEY}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': typeof window !== 'undefined' ? window.location.origin : 'https://freefit.app',
            'X-Title': 'FreeFit',
          },
        }
      );

      const content = response.data.choices[0].message.content;
      // Remove markdown code blocks if present
      let cleanContent = content.trim();
      if (cleanContent.startsWith('```json')) {
        cleanContent = cleanContent.replace(/^```json\n?/, '').replace(/\n?```$/, '');
      } else if (cleanContent.startsWith('```')) {
        cleanContent = cleanContent.replace(/^```\n?/, '').replace(/\n?```$/, '');
      }
      
      const workoutData = cleanAndParseJSON(cleanContent);
      return workoutData;
    } catch (error) {
      console.error('Error generating workout with AI:', error);
      throw error;
    }
  },

  async generateMultipleWorkouts(params: GenerateMultipleWorkoutsParams): Promise<any[]> {
    if (!OPENROUTER_API_KEY) {
      throw new Error('OpenRouter API key not configured');
    }

    const { onboardingData, workoutDuration, numberOfWorkouts } = params;

    // Gera o foco para cada dia (alternando entre perna e braço)
    const workoutFocuses = [];
    let legDays = Math.ceil(numberOfWorkouts / 2);
    let armDays = Math.floor(numberOfWorkouts / 2);
    
    for (let i = 0; i < numberOfWorkouts; i++) {
      if (i % 2 === 0 && legDays > 0) {
        workoutFocuses.push('PERNA (prioridade: perna, mas trabalhe peito, costas e braço também)');
        legDays--;
      } else if (armDays > 0) {
        workoutFocuses.push('BRAÇO (prioridade: braço, mas trabalhe peito, costas e perna também)');
        armDays--;
      } else {
        workoutFocuses.push('PERNA (prioridade: perna, mas trabalhe peito, costas e braço também)');
        legDays--;
      }
    }

    const goalDifferenceKg = Math.abs((onboardingData.target_weight || onboardingData.weight) - onboardingData.weight);
    const goalTypeText = onboardingData.target_weight ? (onboardingData.target_weight > onboardingData.weight ? 'GAIN' : onboardingData.target_weight < onboardingData.weight ? 'LOSE' : 'MAINTAIN') : '';

    const targetWeightLine = onboardingData.target_weight ? `- Target Weight: ${onboardingData.target_weight} kg (${goalTypeText} ${goalDifferenceKg} kg)` : '';

    const gymInstructions = onboardingData.gym_type === 'gym' ? `

**REGRA OBRIGATÓRIA - ACADEMIA**:
O usuário treina em ACADEMIA. Você DEVE usar APENAS exercícios com EQUIPAMENTOS DE ACADEMIA:
- Máquinas: Leg Press, Supino Máquina, Puxador Frontal, Cadeira Extensora, Cadeira Flexora, Crucifixo Máquina, Remada Máquina, Desenvolvimento Máquina, Rosca Máquina, Tríceps Máquina
- Cabos/Polia: Tríceps Pulley, Tríceps Corda, Cross Over, Remada Baixa (cabo)
- Barras e Anilhas: Supino Reto com Barra, Agachamento Livre com Barra, Remada Curvada, Levantamento Terra, Rosca Direta com Barra
- Halteres: Rosca Alternada, Desenvolvimento com Halteres, Elevação Lateral

NÃO USE exercícios de peso corporal como: flexão, abdominal no chão, prancha, polichinelo, burpee.
TODOS os exercícios devem usar equipamentos de academia.
` : `

**REGRA OBRIGATÓRIA - CASA**:
O usuário treina em CASA. Use APENAS exercícios com peso corporal ou equipamentos simples de casa:
- Flexões, Agachamentos livres, Afundos, Prancha, Abdominais, Burpees, Mountain Climbers
- Se tiver halteres: Rosca, Elevação Lateral, etc.
NÃO USE máquinas de academia.
`;

    const prompt = `
Você é um treinador de fitness profissional especializado. Gere ${numberOfWorkouts} planos de treino DIFERENTES e PERSONALIZADOS.

**PERFIL DO USUÁRIO:**
- Gênero: ${onboardingData.gender}
- Idade: ${onboardingData.age}
- Peso Atual: ${onboardingData.weight} kg
- Altura: ${onboardingData.height} cm
- Objetivo: ${onboardingData.objective === 'weight_loss' ? 'Perda de Peso' : onboardingData.objective === 'muscle_gain' ? 'Ganho Muscular' : 'Manutenção'}
${targetWeightLine}
- Nível de Experiência: ${onboardingData.level}
- Local de Treino: ${onboardingData.gym_type === 'gym' ? 'ACADEMIA (usar máquinas e equipamentos)' : 'CASA (peso corporal)'}
- Duração de cada Treino: ${workoutDuration} minutos
${gymInstructions}

**FOCOS DOS TREINOS (em ordem):**
${workoutFocuses.map((focus, idx) => `${idx + 1}. Dia ${idx + 1}: ${focus}`).join('\n')}

**IMPORTANTE:**
- Cada treino deve ter um foco diferente conforme listado acima
- Todos os treinos devem trabalhar o corpo TODO (perna + braço + peito + costas)
- O foco listado é a PRIORIDADE, não a exclusividade
- Os treinos devem ser variados e diferentes entre si
- Responda em JSON válido sem markdown

Gere uma resposta JSON em PORTUGUÊS com a seguinte estrutura para CADA um dos ${numberOfWorkouts} treinos:
{
  "workouts": [
    {
      "day": número do dia (1, 2, 3, etc),
      "name": "Nome único do treino (ex: Perna + Braço)",
      "focus": "O foco deste treino (ex: Perna)",
      "description": "Descrição breve e motivadora",
      "exercises": [
        {
          "name": "Nome do exercício",
          "sets": número,
          "reps": "Intervalo de repetições como 8-12",
          "rest_time": número em segundos,
          "notes": "Dicas sobre execução",
          "alternatives": [
            {
              "name": "Alternativa 1",
              "reason": "Por que é boa alternativa"
            },
            {
              "name": "Alternativa 2",
              "reason": "Por que é boa alternativa"
            }
          ]
        }
      ],
      "tips": ["Dica para este treino"]
    }
  ]
}

REQUISITOS IMPORTANTES:
- Cada exercício deve ter exatamente 2 alternativas
- Se ACADEMIA: OBRIGATÓRIO máquinas, cabos, barras e halteres. PROIBIDO peso corporal.
- Se CASA: OBRIGATÓRIO peso corporal ou equipamentos simples. PROIBIDO máquinas.
- TODOS os treinos devem trabalhar o corpo inteiro, não apenas o foco
- Retorne APENAS JSON válido, sem formatação markdown
`;

    try {
      const response = await axios.post(
        OPENROUTER_API_URL,
        {
          model: MODEL,
          messages: [
            {
              role: 'user',
              content: prompt,
            },
          ],
          temperature: 0.7,
          max_tokens: 4000,
        },
        {
          headers: {
            Authorization: `Bearer ${OPENROUTER_API_KEY}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': typeof window !== 'undefined' ? window.location.origin : 'https://freefit.app',
            'X-Title': 'FreeFit',
          },
        }
      );

      const content = response.data.choices[0].message.content;
      let cleanContent = content.trim();
      if (cleanContent.startsWith('```json')) {
        cleanContent = cleanContent.replace(/^```json\n?/, '').replace(/\n?```$/, '');
      } else if (cleanContent.startsWith('```')) {
        cleanContent = cleanContent.replace(/^```\n?/, '').replace(/\n?```$/, '');
      }
      
      const response_data = cleanAndParseJSON(cleanContent);
      return response_data.workouts || [response_data];
    } catch (error) {
      console.error('Error generating multiple workouts with AI:', error);
      throw error;
    }
  },

  async generateWorkoutVariations(
    workoutName: string,
    numberOfVariations: number
  ): Promise<any[]> {
    if (!OPENROUTER_API_KEY) {
      throw new Error('OpenRouter API key not configured');
    }

    const prompt = `
Gere ${numberOfVariations} variações de treino para "${workoutName}".
Cada variação deve ser ligeiramente diferente em termos de exercícios, séries e repetições.
Retorne como um array JSON com cada variação contendo: name, description, image, exercises array.
Cada exercício deve ter: name, sets, reps, rest_time.

Exemplo de image: "Uma descrição detalhada para gerar uma imagem (ex: 'Pessoa fazendo supino em uma academia com iluminação laranja')"

Retorne APENAS JSON válido, SEM formatação markdown.
`;

    try {
      const response = await axios.post(
        OPENROUTER_API_URL,
        {
          model: 'google/gemini-2.5-flash-lite',
          messages: [
            {
              role: 'user',
              content: prompt,
            },
          ],
          temperature: 0.8,
          max_tokens: 3000,
        },
        {
          headers: {
            Authorization: `Bearer ${OPENROUTER_API_KEY}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': typeof window !== 'undefined' ? window.location.origin : 'https://freefit.app',
            'X-Title': 'FreeFit',
          },
        }
      );

      const content = response.data.choices[0].message.content;
      // Remove markdown code blocks if present
      let cleanContent = content.trim();
      if (cleanContent.startsWith('```json')) {
        cleanContent = cleanContent.replace(/^```json\n?/, '').replace(/\n?```$/, '');
      } else if (cleanContent.startsWith('```')) {
        cleanContent = cleanContent.replace(/^```\n?/, '').replace(/\n?```$/, '');
      }
      
      const variations = cleanAndParseJSON(cleanContent);
      return Array.isArray(variations) ? variations : [variations];
    } catch (error) {
      console.error('Error generating workout variations:', error);
      throw error;
    }
  },

  async searchGoogleImage(exerciseName: string): Promise<string | null> {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      console.warn("Supabase configuration not found");
      return null;
    }

    if (!exerciseName || exerciseName.trim().length === 0) {
      console.warn("Exercise name is empty");
      return null;
    }

    try {
      console.log('Searching Google Images for exercise:', exerciseName);
      
      const response = await fetch(
        `${supabaseUrl}/functions/v1/search-exercise-image`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${supabaseAnonKey}`,
          },
          body: JSON.stringify({
            exerciseName,
          }),
        }
      );

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`API error: ${error}`);
      }

      const data = await response.json();

      if (data.success && data.imageUrl) {
        // Valida a URL antes de usar
        const imageUrl = data.imageUrl;
        if (typeof imageUrl === 'string' && imageUrl.startsWith('http')) {
          console.log('Image found successfully:', imageUrl);
          return imageUrl;
        } else {
          console.warn("Invalid image URL returned:", imageUrl);
          return null;
        }
      }

      console.warn("Image search failed:", data.error);
      return null;
    } catch (error) {
      console.error("Error searching Google Images:", error);
      return null;
    }
  },
  async generateWorkoutImage(
    _imagePrompt: string,
    workoutName: string,
    _userId: string
  ): Promise<string | null> {
    // Now uses Google Images search via SerpAPI instead of generation
    return this.searchGoogleImage(workoutName);
  },
};
