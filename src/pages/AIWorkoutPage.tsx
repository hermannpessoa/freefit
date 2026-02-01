import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { aiService } from '@/services/aiService';
import { workoutService } from '@/services/workoutService';
import toast from 'react-hot-toast';
import { ChevronLeft, Zap } from 'lucide-react';

interface GeneratedWorkout {
  name: string;
  description: string;
  image?: string;
  imageUrl?: string;
  exercises: Array<{
    name: string;
    sets: number;
    reps: string;
    rest_time: number;
    notes: string;
  }>;
  tips: string[];
}

export default function AIWorkoutPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [workoutDuration, setWorkoutDuration] = useState(60);
  const [generatedWorkout, setGeneratedWorkout] = useState<GeneratedWorkout | null>(null);

  const handleGenerateWorkout = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const onboardingData = {
        age: user.age,
        gender: user.gender,
        weight: user.weight,
        height: user.height,
        objective: user.objective,
        level: user.level,
        gym_type: user.gym_type,
        equipments: user.equipments,
        available_time: user.available_time,
      };

      const workout = await aiService.generatePersonalizedWorkout({
        onboardingData,
        workoutDuration,
      });

      setGeneratedWorkout(workout);

      // Generate image if available
      if (workout.image) {
        try {
          toast.loading('Gerando imagem do treino...');
          const imageUrl = await aiService.generateWorkoutImage(workout.image);
          if (imageUrl) {
            setGeneratedWorkout({ ...workout, imageUrl });
            toast.dismiss();
          }
        } catch (error) {
          console.error('Image generation failed:', error);
          toast.dismiss();
        }
      }

      toast.success('Treino gerado com sucesso!');
    } catch (error: any) {
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
            {generatedWorkout.imageUrl && (
              <img
                src={generatedWorkout.imageUrl}
                alt={generatedWorkout.name}
                className="w-full h-96 object-cover rounded-lg mb-6"
              />
            )}
            <h2 className="text-3xl font-bold text-white mb-2">{generatedWorkout.name}</h2>
            <p className="text-gray-400 mb-6">{generatedWorkout.description}</p>

            {/* Exercises */}
            <div className="mb-8">
              <h3 className="text-xl font-bold text-[#00fff3] mb-4">Exercícios</h3>
              <div className="space-y-3">
                {generatedWorkout.exercises && generatedWorkout.exercises.map((exercise: any, index: number) => (
                  <div
                    key={index}
                    className="p-4 bg-[#001317] rounded-lg border border-[#00fff3]/20"
                  >
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
