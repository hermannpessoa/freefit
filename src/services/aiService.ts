import axios from 'axios';
import type { OnboardingData } from '@/types';

const OPENROUTER_API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY || '';
const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';
const MODEL = 'google/gemini-2.5-flash-lite';

interface GenerateWorkoutParams {
  onboardingData: OnboardingData;
  workoutDuration: number;
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
**IMPORTANTE**: Como o usuário treina em ACADEMIA, dê preferência a exercícios com MÁQUINAS POPULARES de academia (leg press, supino máquina, puxador frontal, rosca máquina, etc). Use máquinas que existem em academias normais.
` : '';

    const prompt = `
Você é um treinador de fitness profissional especializado. Gere um plano de treino personalizado com base no seguinte perfil do usuário:

- Gênero: ${onboardingData.gender}
- Idade: ${onboardingData.age}
- Peso Atual: ${onboardingData.weight} kg
- Altura: ${onboardingData.height} cm
- Objetivo: ${onboardingData.objective === 'weight_loss' ? 'Perda de Peso' : onboardingData.objective === 'muscle_gain' ? 'Ganho Muscular' : 'Manutenção'}
${targetWeightLine}
- Nível de Experiência: ${onboardingData.level}
- Local de Treino: ${onboardingData.gym_type === 'gym' ? 'Academia' : 'Casa'}
- Equipamento Disponível: ${onboardingData.equipments?.join(', ') || 'Apenas peso corporal'}
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
- Se academia: use máquinas populares que existem em qualquer academia
- Se casa: use apenas peso corporal ou equipamentos simples
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
            'HTTP-Referer': typeof window !== 'undefined' ? window.location.origin : 'https://myfit.app',
            'X-Title': 'MyFit',
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
      const workoutData = JSON.parse(cleanContent);

      return workoutData;
    } catch (error) {
      console.error('Error generating workout with AI:', error);
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
            'HTTP-Referer': typeof window !== 'undefined' ? window.location.origin : 'https://myfit.app',
            'X-Title': 'MyFit',
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
      const variations = JSON.parse(cleanContent);
      return variations;
    } catch (error) {
      console.error('Error generating workout variations:', error);
      throw error;
    }
  },

  async generateWorkoutImage(
    imagePrompt: string,
    workoutName: string,
    userId: string
  ): Promise<string | null> {
    // Call Supabase Edge Function to generate and upload image
    // This avoids CORS issues by running on server
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    
    if (!supabaseUrl) {
      console.warn('Supabase URL not configured - skipping image generation');
      return null;
    }

    if (!imagePrompt || imagePrompt.trim().length === 0) {
      console.warn('Image prompt is empty - skipping image generation');
      return null;
    }

    try {
      const response = await axios.post(
        `${supabaseUrl}/functions/v1/generate-workout-image`,
        {
          imagePrompt,
          workoutName,
          userId,
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.data.success && response.data.imageUrl) {
        return response.data.imageUrl;
      }

      console.warn('Image generation failed:', response.data.error);
      return null;
    } catch (error) {
      console.error('Error calling image generation function:', error);
      return null;
    }
  },
};
