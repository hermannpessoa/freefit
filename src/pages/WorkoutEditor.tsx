import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import type { Workout, WorkoutExercise, Exercise, ExerciseAlternative } from '@/types';
import { workoutService } from '@/services/workoutService';
import ExerciseItem from '@/components/ExerciseItem';
import toast from 'react-hot-toast';
import { ChevronLeft, Plus, Search, Trash2, Play, CheckCircle, ChevronDown } from 'lucide-react';

export default function WorkoutEditor() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [showExerciseSearch, setShowExerciseSearch] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isWorkoutActive, setIsWorkoutActive] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [allExercises, setAllExercises] = useState<Exercise[]>([]);
  const [filteredExercises, setFilteredExercises] = useState<Exercise[]>([]);
  const [exerciseAlternatives, setExerciseAlternatives] = useState<Record<string, ExerciseAlternative[]>>({});
  const [selectedAlternatives, setSelectedAlternatives] = useState<Record<string, string>>({});

  const [workout, setWorkout] = useState<Partial<Workout>>({
    name: '',
    description: '',
    duration: 60,
    difficulty: 'intermediate',
    exercises: [],
    rest_days: [6],
    is_template: false,
  });
  const [expandedExercises, setExpandedExercises] = useState<Record<string, boolean>>({});

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
        console.log('✓ Workout loaded:', data);
        console.log('Exercises:', data.exercises);
        setWorkout(data);
        
        // Carregar alternativas para cada exercício
        if (data.exercises && data.exercises.length > 0) {
          const altsMap: Record<string, ExerciseAlternative[]> = {};
          for (const ex of data.exercises) {
            const alternatives = await workoutService.getExerciseAlternatives(ex.exercise_id);
            altsMap[ex.exercise_id] = alternatives;
          }
          setExerciseAlternatives(altsMap);
        }
      }
    } catch (error) {
      toast.error('Erro ao carregar treino');
      console.error('Error loading workout:', error);
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
      completed: false,
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

  const handleDelete = async () => {
    if (!id) {
      toast.error('Treino não encontrado');
      return;
    }

    setLoading(true);
    try {
      await workoutService.deleteWorkout(id);
      toast.success('Treino deletado com sucesso!');
      navigate('/dashboard');
    } catch (error: any) {
      toast.error(error.message || 'Erro ao deletar treino');
    } finally {
      setLoading(false);
      setShowDeleteModal(false);
    }
  };

  const confirmDelete = () => {
    setShowDeleteModal(true);
  };

  const handleStartWorkout = async () => {
    if (!id || !workout.exercises?.length) {
      toast.error('Treino não encontrado ou sem exercícios');
      return;
    }
    
    setIsWorkoutActive(true);
  };

  const handleSaveWorkout = async () => {
    if (!workout.name || !workout.name.trim()) {
      toast.error('Digite um nome para o treino');
      return;
    }

    setLoading(true);
    try {
      if (id) {
        // Atualizar treino existente
        await workoutService.updateWorkout(id, {
          name: workout.name,
          description: workout.description,
          duration: workout.duration,
          difficulty: workout.difficulty,
          rest_days: workout.rest_days,
        });
        toast.success('Treino atualizado com sucesso!');
      } else {
        // Criar novo treino
        if (!user) {
          toast.error('Usuário não encontrado');
          return;
        }
        const newWorkout = await workoutService.createWorkout({
          user_id: user.id,
          name: workout.name || 'Novo Treino',
          description: workout.description || '',
          duration: workout.duration || 60,
          difficulty: workout.difficulty || 'intermediate',
          rest_days: workout.rest_days || [6],
          exercises: [],
          is_template: false,
          ai_generated: false,
        });
        navigate(`/edit-workout/${newWorkout.id}`);
        toast.success('Treino criado com sucesso!');
      }
    } catch (error: any) {
      toast.error(error.message || 'Erro ao salvar treino');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleExerciseCompleted = async (workoutExerciseId: string) => {
    try {
      const exercise = workout.exercises?.find(ex => ex.id === workoutExerciseId);
      if (!exercise) return;

      const newCompleted = !exercise.completed;
      
      // Atualizar no banco
      await workoutService.markWorkoutExerciseAsCompleted(workoutExerciseId, newCompleted);
      
      // Atualizar estado local
      setWorkout({
        ...workout,
        exercises: workout.exercises?.map(ex =>
          ex.id === workoutExerciseId ? { ...ex, completed: newCompleted } : ex
        ),
      });

      toast.success(newCompleted ? '✓ Exercício marcado como concluído' : 'Exercício desmarcado');
    } catch (error: any) {
      toast.error('Erro ao atualizar exercício');
    }
  };

  const handleSelectAlternative = async (workoutExerciseId: string, alternativeId: string | null) => {
    try {
      // Atualizar no banco
      await workoutService.updateWorkoutExerciseAlternative(workoutExerciseId, alternativeId);
      
      // Atualizar estado local
      setSelectedAlternatives(prev => ({
        ...prev,
        [workoutExerciseId]: alternativeId || '',
      }));

      const altName = alternativeId 
        ? exerciseAlternatives[workout.exercises?.find(ex => ex.id === workoutExerciseId)?.exercise_id || '']
          ?.find(a => a.id === alternativeId)?.name
        : 'exercício principal';
      
      toast.success(`Selecionado: ${altName}`);
    } catch (error: any) {
      toast.error('Erro ao selecionar alternativa');
    }
  };

  const handleFinishWorkout = () => {
    setIsWorkoutActive(false);
    const completedCount = workout.exercises?.filter(ex => ex.completed).length || 0;
    toast.success(`Treino finalizado! ${completedCount}/${workout.exercises?.length} exercícios completados`);
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
            <div className="flex items-center gap-3">
              {id && (
                <button
                  onClick={confirmDelete}
                  disabled={loading}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 disabled:opacity-50 transition flex items-center gap-2"
                >
                  <Trash2 size={16} /> Deletar
                </button>
              )}
              <button
                onClick={handleSave}
                disabled={loading}
                className="px-6 py-2 bg-[#00fff3] text-[#001317] rounded-lg font-bold hover:bg-[#00fff3]/90 disabled:opacity-50 transition"
              >
                {loading ? 'Salvando...' : 'Salvar'}
              </button>
            </div>
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
            <div className="space-y-3">
              {isWorkoutActive ? (
                // Modo Execução do Treino
                workout.exercises.map((workoutEx) => {
                  const exercise = allExercises.find((ex) => ex.id === workoutEx.exercise_id);
                  const alternatives = exerciseAlternatives[workoutEx.exercise_id] || [];
                  if (!exercise) return null;

                  return (
                    <div
                      key={workoutEx.id}
                      className={`rounded-xl border-2 transition overflow-hidden ${
                        workoutEx.completed
                          ? 'bg-green-600/10 border-green-500'
                          : 'bg-[#001317] border-[#00fff3]/20'
                      }`}
                    >
                      {/* Accordion Header */}
                      <button
                        onClick={() => setExpandedExercises(prev => ({
                          ...prev,
                          [workoutEx.id]: !prev[workoutEx.id]
                        }))}
                        className="w-full flex items-center justify-between p-4 hover:bg-[#0a2b31]/50 transition"
                      >
                        <div className="flex items-center gap-3 flex-1 text-left">
                          <ChevronDown 
                            size={20} 
                            className={`text-[#00fff3] transition-transform ${
                              expandedExercises[workoutEx.id] ? 'rotate-180' : ''
                            }`}
                          />
                          <div>
                            <h3 className="text-lg font-bold text-white">{exercise.name}</h3>
                            <p className="text-gray-400 text-sm">
                              {workoutEx.sets[0]?.reps} reps × {workoutEx.sets.length} séries
                              {workoutEx.sets[0]?.rest_time && ` | Descanso: ${workoutEx.sets[0].rest_time}s`}
                            </p>
                          </div>
                        </div>
                        {workoutEx.completed && (
                          <CheckCircle size={20} className="text-green-500" />
                        )}
                      </button>

                      {/* Accordion Content */}
                      {expandedExercises[workoutEx.id] && (
                        <div className="px-4 pb-4 border-t border-[#00fff3]/10">
                          <button
                            onClick={() => handleToggleExerciseCompleted(workoutEx.id)}
                            className={`w-full mt-4 flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition ${
                              workoutEx.completed
                                ? 'bg-green-600 text-white'
                                : 'bg-[#00fff3]/20 text-[#00fff3] hover:bg-[#00fff3]/30'
                            }`}
                          >
                            {workoutEx.completed ? (
                              <>
                                <CheckCircle size={16} /> Marcar como Incompleto
                              </>
                            ) : (
                              <>
                                <div className="w-4 h-4 border-2 border-[#00fff3] rounded-full" />
                                Marcar Concluído
                              </>
                            )}
                          </button>

                          {/* Alternativas */}
                          {alternatives && alternatives.length > 0 && (
                            <div className="bg-[#0a2b31]/50 rounded-lg p-4 border border-[#00fff3]/10 mt-4">
                              <p className="text-[#00fff3] text-sm font-semibold mb-3">💡 Selecione uma alternativa:</p>
                              <div className="space-y-2">
                                <button
                                  onClick={() => handleSelectAlternative(workoutEx.id, null)}
                                  className={`w-full text-left p-3 rounded-lg border transition ${
                                    !selectedAlternatives[workoutEx.id]
                                      ? 'bg-[#00fff3]/20 border-[#00fff3] text-[#00fff3]'
                                      : 'bg-[#001317] border-[#00fff3]/10 text-white hover:border-[#00fff3]/30'
                                  }`}
                                >
                                  <p className="font-semibold">{exercise.name}</p>
                                  <p className="text-xs text-gray-400 mt-1">Exercício principal</p>
                                </button>
                                
                                {alternatives.map((alt) => (
                                  <button
                                    key={alt.id}
                                    onClick={() => handleSelectAlternative(workoutEx.id, alt.id)}
                                    className={`w-full text-left p-3 rounded-lg border transition ${
                                      selectedAlternatives[workoutEx.id] === alt.id
                                        ? 'bg-[#00fff3]/20 border-[#00fff3] text-[#00fff3]'
                                        : 'bg-[#001317] border-[#00fff3]/10 text-white hover:border-[#00fff3]/30'
                                    }`}
                                  >
                                    <p className="font-semibold">{alt.name}</p>
                                    <p className="text-xs text-gray-400 mt-1">{alt.reason}</p>
                                  </button>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })
              ) : (
                // Modo Edição
                workout.exercises.map((workoutEx) => {
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
                })
              )}
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

      {/* Footer com Botões de Ação */}
      <div className="fixed bottom-0 left-0 right-0 bg-[#0a2b31] border-t border-[#00fff3]/20 p-4 z-40">
        <div className="max-w-7xl mx-auto flex gap-3 justify-end">
          {!isWorkoutActive && id && (
            <button
              onClick={handleSaveWorkout}
              disabled={loading || !workout.name}
              className="px-6 py-3 bg-[#00fff3] text-[#001317] rounded-lg font-semibold hover:bg-[#00fff3]/90 disabled:opacity-50 transition"
            >
              {loading ? 'Salvando...' : 'Salvar Treino'}
            </button>
          )}
          {id && !isWorkoutActive && (
            <button
              onClick={handleStartWorkout}
              disabled={loading || !workout.exercises?.length}
              className="px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 disabled:opacity-50 transition flex items-center gap-2"
            >
              <Play size={18} /> Iniciar Treino
            </button>
          )}
          {id && isWorkoutActive && (
            <button
              onClick={handleFinishWorkout}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition flex items-center gap-2"
            >
              <CheckCircle size={18} /> Finalizar Treino
            </button>
          )}
        </div>
      </div>

      {/* Adicionar padding no bottom para não ficar embaixo do footer */}
      <div className="h-24" />

      {/* Delete Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#0a2b31] border-2 border-[#00fff3]/30 rounded-xl shadow-2xl max-w-md w-full p-8 animate-in fade-in zoom-in-95">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-red-600/20 rounded-lg">
                <Trash2 size={24} className="text-red-600" />
              </div>
              <h2 className="text-2xl font-bold text-white">Deletar Treino?</h2>
            </div>
            
            <p className="text-gray-300 mb-6">
              Tem certeza que deseja deletar <span className="font-semibold text-[#00fff3]">"{workout.name}"</span>? Esta ação não pode ser desfeita.
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                disabled={loading}
                className="flex-1 px-4 py-3 bg-[#001317] border-2 border-[#00fff3]/20 text-[#00fff3] rounded-lg font-semibold hover:bg-[#001317]/50 transition disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleDelete}
                disabled={loading}
                className="flex-1 px-4 py-3 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <Trash2 size={16} />
                {loading ? 'Deletando...' : 'Deletar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
