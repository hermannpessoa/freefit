import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { aiService } from '@/services/aiService';
import { workoutService } from '@/services/workoutService';
import { supabase } from '@/services/supabaseClient';
import toast from 'react-hot-toast';
import { ChevronLeft, Zap } from 'lucide-react';

// Ultra-detailed exercise descriptions for accurate image generation
// Focus: single person, correct anatomy, clear pose, professional quality
// NOTE: Currently unused, kept for future reference
/* const exerciseDescriptions: Record<string, string> = {
  // Peito / Chest
  'supino': 'single athletic man lying flat on weight bench, back flat against pad, both feet planted on floor, gripping barbell with two hands shoulder-width apart, arms fully extended upward, barbell directly above chest, side view angle showing proper form',
  'supino reto': 'single athletic man lying flat on weight bench, back flat against pad, both feet planted on floor, gripping barbell with two hands shoulder-width apart, arms fully extended pushing barbell upward, side profile view',
  'supino inclinado': 'single athletic man lying on inclined bench at 45 degree angle, back against pad, two feet on floor, pushing barbell upward with both arms extended, upper chest engaged, side view',
  'supino declinado': 'single athletic man lying on declined bench with head lower than feet, back flat on pad, pushing barbell upward with both arms, two hands gripping bar, side angle view',
  'supino máquina': 'single athletic man seated upright in chest press machine, back against pad, two hands gripping handles at chest level, pushing handles forward with arms extending, front angle view',
  'crucifixo': 'single athletic man lying flat on bench, two arms extended out to sides holding dumbbells, palms facing up, bringing weights together above chest in arc motion, overhead angle view',
  'crucifixo máquina': 'single athletic man seated at pec deck machine, back against pad, forearms on padded levers, squeezing arms together in front of chest, front view',
  'flexão': 'single athletic man in push-up position on floor, two hands flat on ground shoulder-width apart, body forming straight diagonal line, two feet together, lowering chest toward floor, side profile view',
  'flexão de braço': 'single athletic man in push-up position, two palms flat on floor, arms straight, body rigid and straight from head to heels, two feet together on floor, side view',
  'push-up': 'single athletic man performing push-up, two hands on floor shoulder-width apart, body straight as plank, two feet together, chest near floor, side profile showing form',
  
  // Costas / Back
  'puxada frontal': 'single athletic man seated at lat pulldown machine, two hands gripping wide bar overhead, pulling bar down toward upper chest, two elbows pointing down and back, front view showing back engagement',
  'puxador frontal': 'single athletic man seated at lat pulldown machine, thighs secured under pad, two hands on wide grip bar, pulling down to chest level, slight lean back, front view',
  'remada': 'single athletic man bent forward at waist, one knee and one hand on bench for support, other hand pulling dumbbell up toward hip, back flat and parallel to floor, side view',
  'remada curvada': 'single athletic man bent over at 45 degrees, two feet shoulder-width apart, two hands gripping barbell, pulling bar toward lower chest, back flat, side profile view',
  'remada baixa': 'single athletic man seated at cable row station, two feet on footplate, two hands pulling cable handle toward abdomen, back straight and upright, torso perpendicular to floor, side view',
  'remada máquina': 'single athletic man seated at rowing machine, chest against pad, two hands gripping handles, pulling toward torso, shoulder blades squeezed, side angle view',
  'barra fixa': 'single athletic man hanging from pull-up bar, two hands gripping bar with overhand wide grip, pulling body upward with chin above bar level, two arms bent, front view',
  'pull-up': 'single athletic man performing pull-up, hanging from bar with two hands in wide overhand grip, body pulled up with chin over bar, back muscles visible, rear view',
  'levantamento terra': 'single athletic man standing with barbell, two hands gripping bar outside knees, back straight, hips hinging, bar close to shins, standing up with weight, side profile view',
  
  // Ombros / Shoulders
  'desenvolvimento': 'single athletic man seated on bench with back support, two hands holding dumbbells at shoulder level palms facing forward, pressing weights overhead with arms extending, front view',
  'desenvolvimento máquina': 'single athletic man seated at shoulder press machine, back against pad, two hands gripping handles at shoulder height, pushing upward to full arm extension, side angle view',
  'elevação lateral': 'single athletic man standing upright, two feet shoulder-width apart, two arms raising dumbbells out to sides until parallel to floor forming T-shape, slight elbow bend, front view',
  'elevação frontal': 'single athletic man standing straight, two feet together, raising one dumbbell forward to shoulder height with straight arm, other arm at side, side profile view',
  'crucifixo inverso': 'single athletic man bent forward at waist, two feet planted, two arms raising dumbbells out to sides squeezing shoulder blades together, rear view showing back muscles',
  
  // Braços / Arms
  'rosca direta': 'single athletic man standing upright, two feet shoulder-width apart, two hands holding barbell with underhand grip, curling bar toward shoulders by bending elbows, front view',
  'rosca alternada': 'single athletic man standing straight, two feet planted, one arm curling dumbbell toward shoulder while other arm hangs at side holding dumbbell, front view',
  'rosca martelo': 'single athletic man standing, two hands holding dumbbells with neutral grip palms facing each other, curling weights toward shoulders, two elbows at sides, front view',
  'rosca concentrada': 'single athletic man seated on bench, one elbow braced against inner thigh, curling dumbbell toward shoulder with focused bicep contraction, side angle view',
  'rosca máquina': 'single athletic man seated at bicep curl machine, two arms on padded support, curling handles toward shoulders with biceps engaged, front view',
  'tríceps pulley': 'single athletic man standing at cable machine, two hands gripping straight bar attachment, pushing bar down by extending arms while two elbows stay fixed at sides, side view',
  'tríceps corda': 'single athletic man standing at cable machine, two hands gripping rope attachment, pushing down and spreading rope ends apart at bottom, two arms extended, front angle view',
  'tríceps francês': 'single athletic man seated or standing, two hands holding dumbbell overhead, lowering weight behind head by bending elbows then extending arms up, side profile view',
  'tríceps testa': 'single athletic man lying on bench, two hands holding barbell or EZ bar, lowering weight toward forehead by bending elbows then extending arms straight up, side view',
  'mergulho': 'single athletic man between two parallel bars, two hands gripping bars, two arms straight supporting body weight, lowering by bending elbows then pushing up, side profile view',
  'dip': 'single athletic man on parallel dip bars, two hands gripping bars, body vertical, bending two arms to lower body then pushing back up, side angle view',
  
  // Pernas / Legs
  'agachamento': 'single athletic man standing with barbell across upper back, two hands gripping bar wide, two feet shoulder-width apart, squatting down with thighs parallel to floor, side profile view',
  'agachamento livre': 'single athletic man performing barbell back squat, bar resting on upper traps, two feet flat on floor shoulder-width, descending into squat position, side view showing depth',
  'agachamento máquina': 'single athletic man in smith machine, back against bar pad, two feet forward, squatting down with knees bending to 90 degrees, side view',
  'leg press': 'single athletic man seated in leg press machine, back flat against pad, two feet on platform shoulder-width apart, two legs pushing platform away, side angle view',
  'cadeira extensora': 'single athletic man seated at leg extension machine, back against pad, two ankles behind padded roller, extending two legs straight out, side view',
  'cadeira flexora': 'single athletic man seated at leg curl machine, two legs extended, curling two heels toward buttocks by bending knees, side view',
  'mesa flexora': 'single athletic man lying face down on leg curl machine, two ankles under padded roller, curling two heels toward buttocks, side profile view',
  'stiff': 'single athletic man standing holding barbell with two hands, hinging forward at hips with slight knee bend, lowering bar along two legs keeping back straight, side profile view',
  'afundo': 'single athletic man performing forward lunge, one leg stepped forward with knee bent at 90 degrees, back leg with knee near floor, two arms at sides holding dumbbells, side view',
  'passada': 'single athletic man in lunge stance, front knee bent at 90 degrees directly over ankle, back knee close to floor, torso upright, two hands holding dumbbells, side profile',
  'panturrilha': 'single athletic man standing on calf raise machine, two feet on platform edge, rising up on toes with calves contracted, two hands holding support, side view',
  'elevação de panturrilha': 'single athletic man on calf raise platform, two heels hanging off edge, raising up onto balls of two feet, calves fully contracted, side profile view',
  
  // Core / Abdominais
  'abdominal': 'single athletic man lying on floor, two knees bent, two feet flat, two hands behind head, curling upper body toward knees with abs contracted, side profile view',
  'abdominal crunch': 'single athletic man lying on back, two knees bent at 90 degrees, two feet flat on floor, shoulders curling off floor toward knees, two hands beside head, side view',
  'prancha': 'single athletic man in plank position, two forearms flat on floor, two elbows under shoulders, body forming perfectly straight line from head to heels, side profile view',
  'plank': 'single athletic man holding plank position, two forearms on floor parallel, body rigid and straight as board, two feet together, core engaged, side view',
  'prancha lateral': 'single athletic man in side plank, one forearm on floor, body in straight diagonal line, hips raised, other arm extended up or on hip, front angle view',
  'elevação de pernas': 'single athletic man lying flat on back on floor, two arms at sides palms down, raising two straight legs together toward ceiling, lower abs engaged, side view',
  'mountain climber': 'single athletic man in push-up position, two hands flat on floor, one knee driving toward chest while other leg extended back, alternating running motion, side view',
}; */

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
  const [allWorkouts, setAllWorkouts] = useState<GeneratedWorkout[]>([]);
  const [currentWorkoutIndex, setCurrentWorkoutIndex] = useState(0);
  const [hasAutoGenerated, setHasAutoGenerated] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [imagesLoaded, setImagesLoaded] = useState<Record<number, boolean>>({});

  const handleGenerateWorkout = async () => {
    console.log('=== handleGenerateWorkout CALLED ===');
    console.log('loading state:', loading);
    
    // Check if user is authenticated (either has full profile or active session)
    if (!user && !session) {
      console.log('No user or session, redirecting to auth');
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
      
      // Store userId for later use (in save)
      setCurrentUserId(userId);
      
      // Se user está null, tentar buscar do banco com timeout
      let userData = user;
      if (!userData && userId) {
        console.log('User context is null, trying to fetch from database...');
        try {
          // Criar uma promise com timeout de 3 segundos
          const timeoutPromise = new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Timeout')), 3000)
          );
          
          const queryPromise = supabase
            .from('users')
            .select('*')
            .eq('id', userId)
            .single();
          
          const result = await Promise.race([queryPromise, timeoutPromise]) as any;
          
          console.log('DB query result:', result);
          
          if (result?.data && !result?.error) {
            userData = result.data;
            console.log('Fetched user from DB:', result.data.email, 'gym_type:', result.data.gym_type);
          } else {
            console.warn('Could not fetch user from DB, using defaults');
          }
        } catch (dbError: any) {
          console.warn('Database query failed or timed out:', dbError?.message || dbError);
          console.log('Continuing with default values...');
        }
      }
      
      console.log('Proceeding with userData:', userData);
      
      const onboardingData = {
        age: userData?.age || 25,
        gender: userData?.gender || 'male',
        weight: userData?.weight || 70,
        height: userData?.height || 170,
        objective: userData?.objective || 'maintenance',
        level: userData?.level || 'beginner',
        gym_type: userData?.gym_type || 'home',
        equipments: userData?.equipments || ['bodyweight'],
        available_time: userData?.available_time || 60,
        target_weight: userData?.target_weight,
        training_days: userData?.training_days || 4,
      };

      console.log('Onboarding data for AI:', onboardingData);
      console.log('GYM TYPE being sent:', onboardingData.gym_type);
      console.log('TRAINING DAYS:', onboardingData.training_days);

      // Gera múltiplos treinos se training_days está definido
      let workout: GeneratedWorkout;
      if (onboardingData.training_days && onboardingData.training_days > 1) {
        const workouts = await aiService.generateMultipleWorkouts({
          onboardingData,
          workoutDuration,
          numberOfWorkouts: onboardingData.training_days,
        });

        console.log('Generated multiple workouts:', workouts);
        
        // Armazenar todos os treinos
        setAllWorkouts(workouts);
        setCurrentWorkoutIndex(0);
        workout = workouts[0];
        setGeneratedWorkout(workout);
      } else {
        workout = await aiService.generatePersonalizedWorkout({
          onboardingData,
          workoutDuration,
        });

        console.log('Generated single workout:', workout);
        setGeneratedWorkout(workout);
      }

      // Search for images for each exercise with retry logic
      if (workout.exercises && userId) {
        const updatedExercises = [...workout.exercises];
        
        for (let i = 0; i < updatedExercises.length; i++) {
          const exercise = updatedExercises[i];
          try {
            console.log(`Searching image for exercise: ${exercise.name}`);
            
            // Try to get image with up to 2 retries
            let imageUrl: string | null = null;
            let retries = 0;
            const maxRetries = 2;
            
            while (!imageUrl && retries < maxRetries) {
              imageUrl = await aiService.generateWorkoutImage(
                '', // Not used anymore, kept for compatibility
                exercise.name,
                userId
              );
              
              if (!imageUrl) {
                retries++;
                if (retries < maxRetries) {
                  // Aguarda um pouco antes de tentar novamente
                  await new Promise(resolve => setTimeout(resolve, 1000));
                }
              }
            }
            
            if (imageUrl) {
              console.log(`✓ Image found for ${exercise.name}`);
              updatedExercises[i].image_url = imageUrl;
              setGeneratedWorkout({ ...workout, exercises: updatedExercises });
            } else {
              console.warn(`✗ No image found for ${exercise.name} after retries`);
            }
          } catch (error) {
            console.error(`Failed to fetch image for ${exercise.name}:`, error);
          }
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

  // Auto-generate workout when coming from onboarding (first visit)
  useEffect(() => {
    if (!hasAutoGenerated && !generatedWorkout && !loading && (user || session)) {
      console.log('Auto-generating workout on page load...');
      handleGenerateWorkout();
      setHasAutoGenerated(true); // Only auto-generate once
    }
  }, [hasAutoGenerated, generatedWorkout, loading, user, session]);

  // Sync generatedWorkout when currentWorkoutIndex changes
  useEffect(() => {
    if (allWorkouts.length > 0 && currentWorkoutIndex < allWorkouts.length) {
      setGeneratedWorkout(allWorkouts[currentWorkoutIndex]);
    }
  }, [currentWorkoutIndex, allWorkouts]);

  // Fetch images for current workout when switching between days
  useEffect(() => {
    const fetchImagesForCurrentWorkout = async () => {
      if (!generatedWorkout?.exercises || !currentUserId) return;

      // Skip if images for this workout index already loaded
      if (imagesLoaded[currentWorkoutIndex]) {
        console.log(`Images already loaded for workout ${currentWorkoutIndex + 1}`);
        return;
      }

      console.log(`Fetching images for workout ${currentWorkoutIndex + 1}...`);

      const updatedExercises = [...generatedWorkout.exercises];
      let anyImageMissing = false;

      for (let i = 0; i < updatedExercises.length; i++) {
        const exercise = updatedExercises[i];
        
        // Skip if image already loaded
        if (exercise.image_url) {
          console.log(`Image already loaded for ${exercise.name}`);
          continue;
        }

        anyImageMissing = true;

        try {
          console.log(`Searching image for exercise: ${exercise.name}`);

          // Try to get image with up to 2 retries
          let imageUrl: string | null = null;
          let retries = 0;
          const maxRetries = 2;

          while (!imageUrl && retries < maxRetries) {
            imageUrl = await aiService.generateWorkoutImage(
              '',
              exercise.name,
              currentUserId
            );

            if (!imageUrl) {
              retries++;
              if (retries < maxRetries) {
                await new Promise(resolve => setTimeout(resolve, 1000));
              }
            }
          }

          if (imageUrl) {
            console.log(`✓ Image found for ${exercise.name}`);
            updatedExercises[i].image_url = imageUrl;
            // Update the allWorkouts array instead of just generatedWorkout
            const updatedAllWorkouts = [...allWorkouts];
            updatedAllWorkouts[currentWorkoutIndex] = {
              ...generatedWorkout,
              exercises: updatedExercises,
            };
            setAllWorkouts(updatedAllWorkouts);
            setGeneratedWorkout(updatedAllWorkouts[currentWorkoutIndex]);
          } else {
            console.warn(`✗ No image found for ${exercise.name} after retries`);
          }
        } catch (error) {
          console.error(`Failed to fetch image for ${exercise.name}:`, error);
        }
      }

      // Mark this workout's images as loaded if we processed any
      if (anyImageMissing || updatedExercises.every(e => e.image_url)) {
        setImagesLoaded(prev => ({ ...prev, [currentWorkoutIndex]: true }));
      }
    };

    fetchImagesForCurrentWorkout();
  }, [currentWorkoutIndex, currentUserId]);

  const handlePreviousWorkout = () => {
    if (currentWorkoutIndex > 0) {
      const newIndex = currentWorkoutIndex - 1;
      setCurrentWorkoutIndex(newIndex);
      // Don't update generatedWorkout here - let it be done in a side effect
    }
  };

  const handleNextWorkout = () => {
    if (currentWorkoutIndex < allWorkouts.length - 1) {
      const newIndex = currentWorkoutIndex + 1;
      setCurrentWorkoutIndex(newIndex);
      // Don't update generatedWorkout here - let it be done in a side effect
    }
  };

  const handleSaveWorkout = async () => {
    // Se tem múltiplos treinos, salvar todos
    if (allWorkouts.length > 1) {
      const userId = user?.id || currentUserId;
      if (!userId) {
        toast.error('Erro: ID do usuário não encontrado');
        return;
      }

      setLoading(true);
      try {
        // Salvar todos os treinos gerados
        for (let i = 0; i < allWorkouts.length; i++) {
          const workout = allWorkouts[i];
          
          // Converter exercícios do formato da IA para WorkoutExercise
          const workoutExercises: any[] = [];
          if (workout.exercises && workout.exercises.length > 0) {
            for (const ex of workout.exercises) {
              // Usar a nova função que busca no BD ou cria com imagem
              const exerciseRecord = await aiService.getOrCreateExerciseWithImage(
                ex.name,
                {
                  description: ex.notes || '',
                  category: 'ai_generated',
                  muscle_group: 'general',
                  difficulty: 'intermediate',
                  equipment: [],
                  instructions: [ex.notes || ''].filter(Boolean),
                  tips: [],
                }
              );
              
              if (exerciseRecord) {
                // Criar WorkoutExercise que referencia o exercício
                const workoutEx = {
                  exercise_id: exerciseRecord.id,
                  order: workoutExercises.length + 1,
                  sets: [
                    {
                      reps: parseInt(ex.reps.split('-')[0] || '8'),
                      weight: 0,
                      rest_time: ex.rest_time || 60,
                      completed: false,
                    }
                  ],
                  notes: ex.notes || '',
                  completed: false,
                };
                workoutExercises.push(workoutEx);
                
                // Salvar alternativas deste exercício
                if (ex.alternatives && ex.alternatives.length > 0) {
                  await aiService.saveExerciseAlternatives(exerciseRecord.id, ex.alternatives);
                }
              }
            }
          }

          await workoutService.createWorkout({
            user_id: userId,
            name: `${workout.name} (Dia ${i + 1})`,
            description: workout.description,
            duration: workoutDuration,
            difficulty: user?.level || 'beginner',
            exercises: workoutExercises,
            rest_days: [6],
            is_template: false,
            ai_generated: true,
          });
        }

        toast.success(`${allWorkouts.length} treinos salvos com sucesso!`);
        navigate('/dashboard');
      } catch (error: any) {
        console.error('Error saving workouts:', error);
        toast.error(error.message || 'Erro ao salvar treinos');
      } finally {
        setLoading(false);
      }
    } else if (generatedWorkout) {
      // Se tem apenas um treino, salvar normalmente
      const userId = user?.id || currentUserId;
      if (!userId) {
        toast.error('Erro: ID do usuário não encontrado');
        return;
      }

      setLoading(true);
      try {
        // Converter exercícios do formato da IA para WorkoutExercise
        const workoutExercises: any[] = [];
        if (generatedWorkout.exercises && generatedWorkout.exercises.length > 0) {
          for (const ex of generatedWorkout.exercises) {
            // Usar a nova função que busca no BD ou cria com imagem
            const exerciseRecord = await aiService.getOrCreateExerciseWithImage(
              ex.name,
              {
                description: ex.notes || '',
                category: 'ai_generated',
                muscle_group: 'general',
                difficulty: 'intermediate',
                equipment: [],
                instructions: [ex.notes || ''].filter(Boolean),
                tips: [],
              }
            );
            
            if (exerciseRecord) {
              // Criar WorkoutExercise que referencia o exercício
              const workoutEx = {
                exercise_id: exerciseRecord.id,
                order: workoutExercises.length + 1,
                sets: [
                  {
                    reps: parseInt(ex.reps.split('-')[0] || '8'),
                    weight: 0,
                    rest_time: ex.rest_time || 60,
                    completed: false,
                  }
                ],
                notes: ex.notes || '',
                completed: false,
              };
              workoutExercises.push(workoutEx);
              
              // Salvar alternativas deste exercício
              if (ex.alternatives && ex.alternatives.length > 0) {
                await aiService.saveExerciseAlternatives(exerciseRecord.id, ex.alternatives);
              }
            }
          }
        }

        await workoutService.createWorkout({
          user_id: userId,
          name: generatedWorkout.name,
          description: generatedWorkout.description,
          duration: workoutDuration,
          difficulty: user?.level || 'beginner',
          exercises: workoutExercises,
          rest_days: [6],
          is_template: false,
          ai_generated: true,
        });

        toast.success('Treino salvo com sucesso!');
        navigate('/dashboard');
      } catch (error: any) {
        console.error('Error saving workout:', error);
        toast.error(error.message || 'Erro ao salvar treino');
      } finally {
        setLoading(false);
      }
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
            {/* Navigation for multiple workouts - ABOVE TITLE */}
            {allWorkouts.length > 1 && (
              <div className="flex items-center justify-center gap-4 mb-8 pb-6 border-b border-[#00fff3]/20">
                <button
                  onClick={handlePreviousWorkout}
                  disabled={currentWorkoutIndex === 0}
                  className="p-2 rounded-lg border-2 border-[#00fff3]/30 text-[#00fff3] hover:border-[#00fff3] disabled:opacity-30 transition"
                  title="Treino anterior"
                >
                  ← Anterior
                </button>
                <div className="text-center min-w-fit">
                  <p className="text-[#00fff3] font-bold text-lg">{currentWorkoutIndex + 1} / {allWorkouts.length}</p>
                  <p className="text-sm text-gray-400">Dia {currentWorkoutIndex + 1}</p>
                </div>
                <button
                  onClick={handleNextWorkout}
                  disabled={currentWorkoutIndex === allWorkouts.length - 1}
                  className="p-2 rounded-lg border-2 border-[#00fff3]/30 text-[#00fff3] hover:border-[#00fff3] disabled:opacity-30 transition"
                  title="Próximo treino"
                >
                  Próximo →
                </button>
              </div>
            )}

            <div className="mb-6">
              <h2 className="text-3xl font-bold text-white mb-2">{generatedWorkout.name}</h2>
              <p className="text-gray-400">{generatedWorkout.description}</p>
            </div>

            {/* Exercises */}
            <div className="mb-8">
              <h3 className="text-xl font-bold text-[#00fff3] mb-4">Exercícios</h3>
              <div className="space-y-4">
                {generatedWorkout.exercises && generatedWorkout.exercises.map((exercise: any, index: number) => (
                  <div key={index} className="space-y-3">
                    <div className="p-4 bg-[#001317] rounded-lg border border-[#00fff3]/20">
                      <div className="flex flex-col md:flex-row gap-4">
                        {exercise.image_url ? (
                          <img
                            src={exercise.image_url}
                            alt={exercise.name}
                            className="w-full md:w-[250px] h-[200px] md:h-[250px] object-cover rounded-lg md:flex-shrink-0"
                          />
                        ) : (
                          <div className="w-full md:w-[250px] h-[200px] md:h-[250px] bg-gradient-to-r from-[#00fff3]/10 via-[#00fff3]/5 to-[#00fff3]/10 rounded-lg md:flex-shrink-0 animate-shimmer"></div>
                        )}
                        <div className="flex-1">
                          <h4 className="text-white font-semibold mb-2">{index + 1}. {exercise.name}</h4>
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 md:gap-4 text-sm text-gray-400 mb-2">
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
