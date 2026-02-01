import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { aiService } from '@/services/aiService';
import { workoutService } from '@/services/workoutService';
import toast from 'react-hot-toast';
import { ChevronLeft, Zap } from 'lucide-react';

// Detailed exercise descriptions for accurate image generation
const exerciseDescriptions: Record<string, string> = {
  // Peito / Chest
  'supino': 'person lying flat on a weight bench, gripping a barbell with both hands shoulder-width apart, arms extended upward pushing the barbell, chest muscles contracted',
  'supino reto': 'person lying flat on a weight bench, gripping a barbell with both hands shoulder-width apart, arms extended upward pushing the barbell, chest muscles contracted',
  'supino inclinado': 'person lying on an inclined bench at 45 degrees, pushing a barbell upward with arms extended, upper chest engaged',
  'supino declinado': 'person lying on a declined bench head lower than feet, pushing a barbell upward, lower chest engaged',
  'supino máquina': 'person seated at chest press machine, pushing handles forward with arms extended, chest contracted',
  'crucifixo': 'person lying on bench holding dumbbells with arms extended to sides in a T-shape, then bringing weights together above chest in a hugging motion',
  'crucifixo máquina': 'person seated at pec deck machine, arms on padded levers, squeezing arms together in front of chest',
  'flexão': 'person in push-up position, hands on floor shoulder-width apart, body straight as a plank, lowering chest toward floor then pushing back up',
  'flexão de braço': 'person in push-up position, hands on floor shoulder-width apart, body straight as a plank, lowering chest toward floor then pushing back up',
  'push-up': 'person in push-up position, hands on floor shoulder-width apart, body straight as a plank, lowering chest toward floor then pushing back up',
  
  // Costas / Back
  'puxada frontal': 'person seated at lat pulldown machine, gripping wide bar overhead, pulling bar down to upper chest, back muscles engaged, elbows pointing down',
  'puxador frontal': 'person seated at lat pulldown machine, gripping wide bar overhead, pulling bar down to upper chest, back muscles engaged',
  'remada': 'person bent over at waist holding barbell or dumbbells, pulling weight toward lower chest, back flat, elbow pulled back',
  'remada curvada': 'person bent over at 45 degrees holding barbell with both hands, pulling weight toward lower chest, back flat parallel to ground',
  'remada baixa': 'person seated at cable row machine, feet on platform, pulling cable handle toward abdomen, back straight, squeezing shoulder blades',
  'remada máquina': 'person seated at rowing machine, chest against pad, pulling handles toward torso, back muscles contracted',
  'barra fixa': 'person hanging from pull-up bar with arms fully extended, pulling body upward until chin is above bar, back and biceps engaged',
  'pull-up': 'person hanging from pull-up bar with arms fully extended, pulling body upward until chin is above bar, wide grip, back muscles engaged',
  'levantamento terra': 'person standing with barbell on floor, bending at hips and knees to grip bar, then standing up straight lifting the barbell, back straight throughout',
  
  // Ombros / Shoulders
  'desenvolvimento': 'person seated or standing, pressing dumbbells or barbell overhead from shoulder level to full arm extension above head',
  'desenvolvimento máquina': 'person seated at shoulder press machine, pushing handles upward from shoulder level to full extension overhead',
  'elevação lateral': 'person standing holding dumbbells at sides, raising arms out to sides until parallel to floor forming a T-shape, slight bend in elbows',
  'elevação frontal': 'person standing holding dumbbells in front of thighs, raising one or both arms forward to shoulder height, arms straight',
  'crucifixo inverso': 'person bent over or on incline bench face down, raising dumbbells out to sides squeezing rear deltoids and upper back',
  
  // Braços / Arms
  'rosca direta': 'person standing holding barbell or dumbbells with palms facing up, curling weight toward shoulders by bending elbows, biceps contracted',
  'rosca alternada': 'person standing holding dumbbells at sides, alternating curling each arm up toward shoulder, biceps engaged',
  'rosca martelo': 'person standing holding dumbbells with palms facing each other (neutral grip), curling weights toward shoulders',
  'rosca concentrada': 'person seated on bench, elbow resting on inner thigh, curling dumbbell toward shoulder with one arm, bicep fully contracted',
  'rosca máquina': 'person seated at bicep curl machine, curling handles toward shoulders, biceps isolated',
  'tríceps pulley': 'person standing at cable machine, gripping rope or bar attachment, pushing down by extending arms while keeping elbows at sides',
  'tríceps corda': 'person standing at cable machine with rope attachment, pushing rope down and spreading ends apart at bottom, triceps engaged',
  'tríceps francês': 'person lying on bench or standing, holding dumbbell or barbell overhead, lowering weight behind head by bending elbows, then extending arms',
  'tríceps testa': 'person lying on bench holding barbell or dumbbells, lowering weight toward forehead by bending elbows, then extending arms up',
  'mergulho': 'person between parallel bars or on bench, lowering body by bending arms then pushing back up, triceps engaged',
  'dip': 'person between parallel bars, arms straight supporting body, lowering by bending elbows then pushing back up',
  
  // Pernas / Legs
  'agachamento': 'person standing with barbell on upper back or holding dumbbells, bending knees and hips to lower body as if sitting back into chair, thighs parallel to floor, then standing',
  'agachamento livre': 'person standing with barbell across upper back, feet shoulder-width apart, squatting down until thighs are parallel to floor, then standing up',
  'agachamento máquina': 'person in smith machine or hack squat, squatting down with back against pad, legs bending to 90 degrees',
  'leg press': 'person seated in leg press machine, feet on platform shoulder-width apart, pushing platform away by extending legs, then lowering with control',
  'cadeira extensora': 'person seated at leg extension machine, ankles behind padded roller, extending legs straight out by contracting quadriceps',
  'cadeira flexora': 'person lying face down or seated at leg curl machine, curling heels toward buttocks by contracting hamstrings',
  'mesa flexora': 'person lying face down on leg curl machine, ankles under padded roller, curling heels toward buttocks',
  'stiff': 'person standing holding barbell or dumbbells, hinging at hips with slight knee bend, lowering weight along legs while keeping back straight, feeling hamstring stretch',
  'afundo': 'person stepping forward into lunge position, front knee bent at 90 degrees over ankle, back knee almost touching floor, then pushing back to standing',
  'passada': 'person stepping forward into lunge position, front knee bent at 90 degrees over ankle, back knee almost touching floor',
  'panturrilha': 'person standing on edge of step or calf raise machine, raising up on toes then lowering heels below platform level',
  'elevação de panturrilha': 'person standing on edge of platform, raising up onto balls of feet by contracting calves, then lowering heels',
  
  // Core / Abdominais
  'abdominal': 'person lying on back with knees bent, hands behind head, curling upper body toward knees contracting abdominal muscles',
  'abdominal crunch': 'person lying on back with knees bent feet flat, curling shoulders off floor toward knees, contracting abs',
  'prancha': 'person in plank position, forearms on floor, body forming straight line from head to heels, core engaged, holding position',
  'plank': 'person in plank position, forearms on floor, body forming straight line from head to heels, core engaged',
  'prancha lateral': 'person on side with forearm on floor, body in straight line, hips raised off ground, obliques engaged',
  'elevação de pernas': 'person lying on back or hanging from bar, raising straight legs up toward ceiling, lower abs engaged',
  'mountain climber': 'person in push-up position, alternating bringing knees toward chest in running motion, core engaged',
  
  // Cardio
  'corrida': 'person running on treadmill or outdoors, arms swinging naturally, legs in running stride',
  'bicicleta': 'person on stationary bike, pedaling with legs, hands on handlebars, cardio exercise',
  'elíptico': 'person on elliptical machine, arms and legs moving in smooth elliptical motion',
  'burpee': 'person performing burpee: squatting down, jumping feet back to plank, doing push-up, jumping feet forward, then jumping up with arms overhead',
  'jumping jack': 'person jumping with legs spread wide and arms raised overhead, then jumping back to standing with arms at sides',
  'polichinelo': 'person jumping with legs spread wide and arms raised overhead, then jumping back to standing with arms at sides',
};

function buildExerciseImagePrompt(exerciseName: string): string {
  const nameLower = exerciseName.toLowerCase().trim();
  
  // Try to find exact match first
  if (exerciseDescriptions[nameLower]) {
    return `Fitness photography, ${exerciseDescriptions[nameLower]}, professional gym environment, good lighting, athletic person, realistic, high quality, clear demonstration of proper form`;
  }
  
  // Try partial match
  for (const [key, description] of Object.entries(exerciseDescriptions)) {
    if (nameLower.includes(key) || key.includes(nameLower)) {
      return `Fitness photography, ${description}, professional gym environment, good lighting, athletic person, realistic, high quality, clear demonstration of proper form`;
    }
  }
  
  // Fallback to generic but detailed prompt
  return `Fitness photography, athletic person performing ${exerciseName} exercise with proper form and technique, professional gym environment with equipment, good lighting, realistic, high quality, clear demonstration of the movement, full body visible`;
}

interface GeneratedWorkout {
  name: string;
  description: string;
  image?: string;
  image_url?: string;
  exercises: Array<{
    name: string;
    sets: number;
    reps: string;
    rest_time: number;
    notes: string;
    image_url?: string;
    alternatives?: Array<{
      name: string;
      reason: string;
    }>;
  }>;
  tips: string[];
}

export default function AIWorkoutPage() {
  const navigate = useNavigate();
  const { user, session } = useAuth();
  const [loading, setLoading] = useState(false);
  const [workoutDuration, setWorkoutDuration] = useState(60);
  const [generatedWorkout, setGeneratedWorkout] = useState<GeneratedWorkout | null>(null);

  const handleGenerateWorkout = async () => {
    // Check if user is authenticated (either has full profile or active session)
    if (!user && !session) {
      toast.error('Por favor, faça login para gerar um treino');
      navigate('/auth');
      return;
    }

    setLoading(true);
    try {
      console.log('User data:', user);
      console.log('Session:', session?.user?.email);
      
      // Use user data if available, otherwise use defaults
      const userId = user?.id || session?.user?.id;
      if (!userId) {
        toast.error('Erro: ID do usuário não encontrado');
        setLoading(false);
        return;
      }
      
      const onboardingData = {
        age: user?.age || 25,
        gender: user?.gender || 'male',
        weight: user?.weight || 70,
        height: user?.height || 170,
        objective: user?.objective || 'maintenance',
        level: user?.level || 'beginner',
        gym_type: user?.gym_type || 'home',
        equipments: user?.equipments || ['bodyweight'],
        available_time: user?.available_time || 60,
        target_weight: user?.target_weight,
      };

      console.log('Onboarding data:', onboardingData);

      const workout = await aiService.generatePersonalizedWorkout({
        onboardingData,
        workoutDuration,
      });

      console.log('Generated workout:', workout);
      setGeneratedWorkout(workout);

      // Generate images for each exercise
      if (workout.exercises && userId) {
        const updatedExercises = [...workout.exercises];
        
        for (let i = 0; i < updatedExercises.length; i++) {
          const exercise = updatedExercises[i];
          try {
            // Build a detailed, exercise-specific prompt
            const imagePrompt = buildExerciseImagePrompt(exercise.name);
            const imageUrl = await aiService.generateWorkoutImage(
              imagePrompt,
              exercise.name,
              userId
            );
            if (imageUrl) {
              updatedExercises[i].image_url = imageUrl;
              setGeneratedWorkout({ ...workout, exercises: updatedExercises });
            }
          } catch (error) {
            console.error(`Failed to generate image for ${exercise.name}:`, error);
          }
        }
      }

      // Generate main workout image
      if (workout.image && userId) {
        try {
          const imageUrl = await aiService.generateWorkoutImage(
            workout.image,
            workout.name,
            userId
          );
          if (imageUrl) {
            setGeneratedWorkout(prev => prev ? { ...prev, image_url: imageUrl } : null);
          }
        } catch (error) {
          console.error('Main image generation failed:', error);
        }
      }

      toast.success('Treino gerado com sucesso!');
    } catch (error: any) {
      console.error('Error generating workout:', error);
      toast.error(error.message || 'Erro ao gerar treino');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveWorkout = async () => {
    if (!generatedWorkout || !user) return;

    setLoading(true);
    try {
      await workoutService.createWorkout({
        user_id: user.id,
        name: generatedWorkout.name,
        description: generatedWorkout.description,
        duration: workoutDuration,
        difficulty: user.level,
        exercises: [],
        rest_days: [6],
        is_template: false,
        ai_generated: true,
      });

      toast.success('Treino salvo com sucesso!');
      navigate('/dashboard');
    } catch (error: any) {
      toast.error(error.message || 'Erro ao salvar treino');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#001317] via-[#0a2b31] to-[#001317]">
      {/* Navigation */}
      <nav className="border-b border-[#00fff3]/20 bg-[#0a2b31]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <button
              onClick={() => navigate('/dashboard')}
              className="flex items-center gap-2 text-[#00fff3] hover:bg-[#00fff3]/10 p-2 rounded-lg transition"
            >
              <ChevronLeft size={24} /> Voltar
            </button>
            <h1 className="text-2xl font-bold text-[#00fff3] flex items-center gap-2">
              <Zap size={28} /> Gerar Treino com IA
            </h1>
            <div className="w-10"></div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!generatedWorkout ? (
          <div className="bg-[#0a2b31] border-2 border-[#00fff3]/30 rounded-xl p-8 text-center">
            <Zap className="text-[#00fff3] mx-auto mb-4" size={48} />
            <h2 className="text-3xl font-bold text-white mb-4">
              Treino Personalizado com IA
            </h2>
            <p className="text-gray-400 mb-8 max-w-2xl mx-auto">
              Nossa inteligência artificial analisará seu perfil, objetivos e disponibilidade
              para criar um treino 100% personalizado e otimizado para seus resultados.
            </p>

            <div className="bg-[#001317] rounded-lg p-6 mb-8 max-w-md mx-auto">
              <label className="block text-[#00fff3] font-semibold mb-4">
                Duração do Treino: {workoutDuration} minutos
              </label>
              <input
                type="range"
                min="20"
                max="180"
                step="10"
                value={workoutDuration}
                onChange={(e) => setWorkoutDuration(parseInt(e.target.value))}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-gray-400 mt-2">
                <span>20 min</span>
                <span>180 min</span>
              </div>

              <div className="grid grid-cols-3 gap-2 mt-4">
                {[30, 60, 90].map((time) => (
                  <button
                    key={time}
                    onClick={() => setWorkoutDuration(time)}
                    className={`py-2 rounded-lg text-sm font-semibold transition ${
                      workoutDuration === time
                        ? 'bg-[#00fff3] text-[#001317]'
                        : 'bg-[#0a2b31] border-2 border-[#00fff3]/30 text-[#00fff3]'
                    }`}
                  >
                    {time}m
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={handleGenerateWorkout}
              disabled={loading}
              className="px-8 py-4 bg-[#00fff3] text-[#001317] rounded-lg font-bold text-lg hover:bg-[#00fff3]/90 disabled:opacity-50 transition flex items-center justify-center gap-2 mx-auto"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-[#001317]/30 border-t-[#001317] rounded-full animate-spin"></div>
                  Gerando...
                </>
              ) : (
                <>
                  <Zap size={20} /> Gerar Treino
                </>
              )}
            </button>
          </div>
        ) : (
          <div className="bg-[#0a2b31] border-2 border-[#00fff3]/30 rounded-xl p-8">
            {generatedWorkout.image_url && (
              <img
                src={generatedWorkout.image_url}
                alt={generatedWorkout.name}
                className="w-full h-96 object-cover rounded-lg mb-6"
              />
            )}
            <h2 className="text-3xl font-bold text-white mb-2">{generatedWorkout.name}</h2>
            <p className="text-gray-400 mb-6">{generatedWorkout.description}</p>

            {/* Exercises */}
            <div className="mb-8">
              <h3 className="text-xl font-bold text-[#00fff3] mb-4">Exercícios</h3>
              <div className="space-y-4">
                {generatedWorkout.exercises && generatedWorkout.exercises.map((exercise: any, index: number) => (
                  <div key={index} className="space-y-3">
                    <div className="p-4 bg-[#001317] rounded-lg border border-[#00fff3]/20">
                      <div className="flex gap-4">
                        {exercise.image_url && (
                          <img
                            src={exercise.image_url}
                            alt={exercise.name}
                            className="w-[250px] h-[250px] object-cover rounded-lg flex-shrink-0"
                          />
                        )}
                        <div className="flex-1">
                          <h4 className="text-white font-semibold mb-2">{index + 1}. {exercise.name}</h4>
                          <div className="grid grid-cols-3 gap-4 text-sm text-gray-400 mb-2">
                            <div>
                              <span className="text-[#00fff3]">Séries:</span> {exercise.sets}
                            </div>
                            <div>
                              <span className="text-[#00fff3]">Repetições:</span> {exercise.reps}
                            </div>
                            <div>
                              <span className="text-[#00fff3]">Descanso:</span> {exercise.rest_time}s
                            </div>
                          </div>
                          {exercise.notes && (
                            <p className="text-gray-400 text-sm">{exercise.notes}</p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Alternatives */}
                    {exercise.alternatives && exercise.alternatives.length > 0 && (
                      <div className="ml-4 space-y-2">
                        <p className="text-[#00fff3] text-sm font-semibold">💡 Alternativas:</p>
                        {exercise.alternatives.map((alt: any, altIndex: number) => (
                          <div
                            key={altIndex}
                            className="p-3 bg-[#001317]/60 rounded-lg border border-[#00fff3]/10 text-sm"
                          >
                            <p className="text-white font-medium">{alt.name}</p>
                            <p className="text-gray-400 text-xs mt-1">{alt.reason}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Tips */}
            {generatedWorkout.tips && generatedWorkout.tips.length > 0 && (
              <div className="mb-8 p-4 bg-[#001317] rounded-lg border border-[#00fff3]/20">
                <h3 className="text-[#00fff3] font-bold mb-3">💡 Dicas Importantes:</h3>
                <ul className="space-y-2">
                  {generatedWorkout.tips.map((tip: string, index: number) => (
                    <li key={index} className="flex gap-2 text-gray-300">
                      <span className="text-[#00fff3]">•</span>
                      {tip}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-4">
              <button
                onClick={() => setGeneratedWorkout(null)}
                className="flex-1 py-3 border-2 border-[#00fff3]/30 text-[#00fff3] rounded-lg font-bold hover:border-[#00fff3] transition"
              >
                Gerar Outro
              </button>
              <button
                onClick={handleSaveWorkout}
                disabled={loading}
                className="flex-1 py-3 bg-[#00fff3] text-[#001317] rounded-lg font-bold hover:bg-[#00fff3]/90 disabled:opacity-50 transition"
              >
                {loading ? 'Salvando...' : 'Salvar Treino'}
              </button>
            </div>
          </div>
        )}

        {/* AI Info */}
        <div className="mt-8 p-6 bg-[#0a2b31] border border-[#00fff3]/20 rounded-xl">
          <h3 className="text-[#00fff3] font-bold mb-3">🤖 Como funciona?</h3>
          <ul className="space-y-2 text-gray-400">
            <li>✓ A IA analisa seu perfil (idade, peso, objetivo, nível)</li>
            <li>✓ Gera exercícios personalizados com base no seu equipamento disponível</li>
            <li>✓ Otimiza séries, reps e descanso para seus objetivos</li>
            <li>✓ Oferece dicas profissionais para melhor desempenho</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
