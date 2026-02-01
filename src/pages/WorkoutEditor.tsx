import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import type { Workout, WorkoutExercise, Exercise } from '@/types';
import { workoutService } from '@/services/workoutService';
import ExerciseItem from '@/components/ExerciseItem';
import toast from 'react-hot-toast';
import { ChevronLeft, Plus, Search } from 'lucide-react';

export default function WorkoutEditor() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [showExerciseSearch, setShowExerciseSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [allExercises, setAllExercises] = useState<Exercise[]>([]);
  const [filteredExercises, setFilteredExercises] = useState<Exercise[]>([]);

  const [workout, setWorkout] = useState<Partial<Workout>>({
    name: '',
    description: '',
    duration: 60,
    difficulty: 'intermediate',
    exercises: [],
    rest_days: [6],
    is_template: false,
  });

  useEffect(() => {
    loadExercises();
    if (id) {
      loadWorkout();
    }
  }, []);

  useEffect(() => {
    if (searchQuery) {
      const filtered = allExercises.filter((ex) =>
        ex.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ex.muscle_group.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredExercises(filtered);
    } else {
      setFilteredExercises(allExercises);
    }
  }, [searchQuery, allExercises]);

  const loadExercises = async () => {
    try {
      const exercises = await workoutService.getAllExercises();
      setAllExercises(exercises);
    } catch (error) {
      toast.error('Erro ao carregar exercícios');
    }
  };

  const loadWorkout = async () => {
    try {
      if (!id) return;
      const data = await workoutService.getWorkoutById(id);
      if (data) {
        setWorkout(data);
      }
    } catch (error) {
      toast.error('Erro ao carregar treino');
    }
  };

  const handleAddExercise = (exercise: Exercise) => {
    const newExercise: WorkoutExercise = {
      id: `exercise-${Date.now()}`,
      workout_id: workout.id || '',
      exercise_id: exercise.id,
      order: (workout.exercises?.length || 0) + 1,
      sets: [
        {
          id: `set-${Date.now()}`,
          exercise_id: exercise.id,
          reps: 10,
          weight: 0,
          rest_time: 60,
          completed: false,
        },
      ],
    };

    setWorkout({
      ...workout,
      exercises: [...(workout.exercises || []), newExercise],
    });

    setShowExerciseSearch(false);
    setSearchQuery('');
    toast.success(`${exercise.name} adicionado ao treino`);
  };

  const handleRemoveExercise = (exerciseId: string) => {
    setWorkout({
      ...workout,
      exercises: workout.exercises?.filter((ex) => ex.exercise_id !== exerciseId),
    });
    toast.success('Exercício removido');
  };

  const handleUpdateExercise = (updatedExercise: WorkoutExercise) => {
    setWorkout({
      ...workout,
      exercises: workout.exercises?.map((ex) =>
        ex.id === updatedExercise.id ? updatedExercise : ex
      ),
    });
  };

  const handleSave = async () => {
    if (!user || !workout.name || !workout.exercises?.length) {
      toast.error('Preencha o nome do treino e adicione exercícios');
      return;
    }

    setLoading(true);
    try {
      if (id) {
        await workoutService.updateWorkout(id, {
          ...workout,
          user_id: user.id,
        } as Workout);
        toast.success('Treino atualizado com sucesso!');
      } else {
        await workoutService.createWorkout({
          ...workout,
          user_id: user.id,
        } as Omit<Workout, 'id' | 'created_at' | 'updated_at'>);
        toast.success('Treino criado com sucesso!');
      }
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
            <h1 className="text-2xl font-bold text-[#00fff3]">
              {id ? 'Editar Treino' : 'Novo Treino'}
            </h1>
            <button
              onClick={handleSave}
              disabled={loading}
              className="px-6 py-2 bg-[#00fff3] text-[#001317] rounded-lg font-bold hover:bg-[#00fff3]/90 disabled:opacity-50 transition"
            >
              {loading ? 'Salvando...' : 'Salvar'}
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Workout Info */}
        <div className="bg-[#0a2b31] border-2 border-[#00fff3]/30 rounded-xl p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-[#00fff3] font-semibold mb-2">Nome do Treino</label>
              <input
                type="text"
                value={workout.name || ''}
                onChange={(e) => setWorkout({ ...workout, name: e.target.value })}
                placeholder="Ex: Treino de Peito e Tríceps"
                className="w-full px-4 py-3 bg-[#001317] border-2 border-[#00fff3]/20 text-white rounded-lg focus:border-[#00fff3] outline-none transition"
              />
            </div>

            <div>
              <label className="block text-[#00fff3] font-semibold mb-2">Dificuldade</label>
              <select
                value={workout.difficulty || 'intermediate'}
                onChange={(e) => setWorkout({ ...workout, difficulty: e.target.value as any })}
                className="w-full px-4 py-3 bg-[#001317] border-2 border-[#00fff3]/20 text-white rounded-lg focus:border-[#00fff3] outline-none transition"
              >
                <option value="beginner">Iniciante</option>
                <option value="intermediate">Intermediário</option>
                <option value="advanced">Avançado</option>
              </select>
            </div>

            <div>
              <label className="block text-[#00fff3] font-semibold mb-2">Duração (minutos)</label>
              <input
                type="number"
                value={workout.duration || 60}
                onChange={(e) => setWorkout({ ...workout, duration: parseInt(e.target.value) })}
                min="15"
                max="180"
                className="w-full px-4 py-3 bg-[#001317] border-2 border-[#00fff3]/20 text-white rounded-lg focus:border-[#00fff3] outline-none transition"
              />
            </div>

            <div>
              <label className="block text-[#00fff3] font-semibold mb-2">Dias de Descanso</label>
              <div className="grid grid-cols-7 gap-2">
                {['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab', 'Dom'].map((day, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      const restDays = workout.rest_days || [];
                      if (restDays.includes(i)) {
                        setWorkout({
                          ...workout,
                          rest_days: restDays.filter((d) => d !== i),
                        });
                      } else {
                        setWorkout({
                          ...workout,
                          rest_days: [...restDays, i],
                        });
                      }
                    }}
                    className={`py-2 rounded text-sm font-semibold transition ${
                      (workout.rest_days || []).includes(i)
                        ? 'bg-[#00fff3] text-[#001317]'
                        : 'bg-[#001317] border-2 border-[#00fff3]/20 text-[#00fff3]'
                    }`}
                  >
                    {day}
                  </button>
                ))}
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="block text-[#00fff3] font-semibold mb-2">Descrição</label>
              <textarea
                value={workout.description || ''}
                onChange={(e) => setWorkout({ ...workout, description: e.target.value })}
                placeholder="Descrição do treino..."
                className="w-full px-4 py-3 bg-[#001317] border-2 border-[#00fff3]/20 text-white rounded-lg focus:border-[#00fff3] outline-none transition resize-none"
                rows={3}
              />
            </div>
          </div>
        </div>

        {/* Exercises */}
        <div className="bg-[#0a2b31] border-2 border-[#00fff3]/30 rounded-xl p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white">Exercícios</h2>
            <button
              onClick={() => setShowExerciseSearch(!showExerciseSearch)}
              className="flex items-center gap-2 px-4 py-2 bg-[#00fff3] text-[#001317] rounded-lg font-semibold hover:bg-[#00fff3]/90 transition"
            >
              <Plus size={18} /> Adicionar Exercício
            </button>
          </div>

          {/* Exercise Search Modal */}
          {showExerciseSearch && (
            <div className="mb-6 p-4 bg-[#001317] border-2 border-[#00fff3]/20 rounded-lg">
              <div className="mb-4 flex items-center gap-2">
                <Search className="text-[#00fff3]" size={20} />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Buscar exercício..."
                  autoFocus
                  className="flex-1 px-4 py-2 bg-[#0a2b31] border-2 border-[#00fff3]/20 text-white rounded-lg focus:border-[#00fff3] outline-none transition"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-48 overflow-y-auto">
                {filteredExercises.length > 0 ? (
                  filteredExercises.map((exercise) => (
                    <button
                      key={exercise.id}
                      onClick={() => handleAddExercise(exercise)}
                      className="p-3 text-left rounded-lg bg-[#0a2b31] border border-[#00fff3]/20 hover:border-[#00fff3] transition"
                    >
                      <div className="font-semibold text-white">{exercise.name}</div>
                      <div className="text-xs text-gray-400">{exercise.muscle_group}</div>
                    </button>
                  ))
                ) : (
                  <p className="col-span-2 text-center text-gray-400 py-4">
                    Nenhum exercício encontrado
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Exercise List */}
          {workout.exercises && workout.exercises.length > 0 ? (
            <div className="space-y-4">
              {workout.exercises.map((workoutEx) => {
                const exercise = allExercises.find((ex) => ex.id === workoutEx.exercise_id);
                if (!exercise) return null;

                return (
                  <ExerciseItem
                    key={workoutEx.id}
                    exercise={exercise}
                    workoutExercise={workoutEx}
                    onUpdate={handleUpdateExercise}
                    onRemove={handleRemoveExercise}
                  />
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-400 mb-4">Nenhum exercício adicionado</p>
              <button
                onClick={() => setShowExerciseSearch(true)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-[#00fff3]/20 text-[#00fff3] rounded-lg hover:bg-[#00fff3]/30 transition"
              >
                <Plus size={16} /> Adicionar Primeiro Exercício
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
