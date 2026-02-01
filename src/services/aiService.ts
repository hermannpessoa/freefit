import axios from 'axios';
import type { OnboardingData } from '@/types';

const OPENROUTER_API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY || '';
const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';

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

    const prompt = `
You are a professional fitness trainer. Generate a personalized workout plan based on the following user profile:

- Gender: ${onboardingData.gender}
- Age: ${onboardingData.age}
- Weight: ${onboardingData.weight} kg
- Height: ${onboardingData.height} cm
- Objective: ${onboardingData.objective === 'weight_loss' ? 'Weight Loss' : onboardingData.objective === 'muscle_gain' ? 'Muscle Gain' : 'Maintenance'}
- Experience Level: ${onboardingData.level}
- Training Location: ${onboardingData.gym_type === 'gym' ? 'Gym' : 'Home'}
- Available Equipment: ${onboardingData.equipments?.join(', ') || 'Bodyweight only'}
- Available Time: ${onboardingData.available_time} minutes per session
- Workout Duration: ${workoutDuration} minutes

Generate a JSON response with the following structure:
{
  "name": "Workout name",
  "description": "Brief description",
  "exercises": [
    {
      "name": "Exercise name",
      "sets": number,
      "reps": "Reps range like 8-12",
      "rest_time": number in seconds,
      "notes": "Important tips"
    }
  ],
  "tips": ["General tips for this workout"]
}

Return only valid JSON, no markdown formatting.
`;

    try {
      const response = await axios.post(
        OPENROUTER_API_URL,
        {
          model: 'meta-llama/llama-2-70b-chat',
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
      const workoutData = JSON.parse(content);

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
Generate ${numberOfVariations} workout variations for "${workoutName}".
Each variation should be slightly different in terms of exercises, sets, and reps.
Return as a JSON array with each variation having: name, description, exercises array.
Each exercise should have: name, sets, reps, rest_time.

Return only valid JSON.
`;

    try {
      const response = await axios.post(
        OPENROUTER_API_URL,
        {
          model: 'meta-llama/llama-2-70b-chat',
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
      const variations = JSON.parse(content);
      return variations;
    } catch (error) {
      console.error('Error generating workout variations:', error);
      throw error;
    }
  },
};
