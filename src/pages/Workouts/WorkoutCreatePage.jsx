import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Plus, Trash2, Sparkles, Dumbbell, Clock, Target, Zap, Calendar } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { useSupabaseContext } from '../../contexts/SupabaseContext';
import { Button, Card, Modal, Toast } from '../../components/ui';
import { exerciseDatabase } from '../../data/exercises';
import { generateWorkout, generateWeeklyWorkouts, isAIConfigured } from '../../services/aiWorkoutGenerator';
import './Workouts.css';

export default function WorkoutCreatePage() {
    const navigate = useNavigate();
    const { state, actions } = useApp();
    const { workouts: supabaseWorkouts, exercises: supabaseExercises, profile } = useSupabaseContext();

    const [creationMode, setCreationMode] = useState('ai'); // 'manual' or 'ai'
    const [generationType, setGenerationType] = useState('single'); // 'single' or 'batch'
    const [loading, setLoading] = useState(false);
    const [showExercisePicker, setShowExercisePicker] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [aiProgress, setAiProgress] = useState('');

    // Toast notifications
    const [toast, setToast] = useState({ show: false, message: '', type: 'info' });

    const showToast = (message, type = 'info') => {
        setToast({ show: true, message, type });
        setTimeout(() => setToast({ show: false, message: '', type: 'info' }), 5000);
    };

    // Use Supabase exercises if available, fallback to local database
    const exercises = supabaseExercises.exercises.length > 0 ? supabaseExercises.exercises : exerciseDatabase;

    // Get user data from profile
    const userData = profile.profile?.onboarding_data || state.onboardingData || {};

    const [formData, setFormData] = useState({
        name: '',
        description: '',
        category: 'strength',
        difficulty: 'intermediate',
        estimatedDuration: 45,
        muscleGroups: [],
        exercises: []
    });

    const categories = [
        { id: 'strength', name: 'Força', icon: '💪' },
        { id: 'cardio', name: 'Cardio', icon: '🏃' },
        { id: 'flexibility', name: 'Flexibilidade', icon: '🧘' },
        { id: 'hiit', name: 'HIIT', icon: '⚡' }
    ];

    const difficulties = [
        { id: 'beginner', name: 'Iniciante' },
        { id: 'intermediate', name: 'Intermediário' },
        { id: 'advanced', name: 'Avançado' }
    ];

    const handleAddExercise = (exercise) => {
        setFormData(prev => ({
            ...prev,
            exercises: [...prev.exercises, {
                exerciseId: exercise.id,
                exerciseName: exercise.name,
                sets: 3,
                reps: '10-12',
                rest: 60
            }]
        }));
        setShowExercisePicker(false);
        setSearchTerm('');
    };

    const handleRemoveExercise = (index) => {
        setFormData(prev => ({
            ...prev,
            exercises: prev.exercises.filter((_, i) => i !== index)
        }));
    };

    const handleUpdateExercise = (index, field, value) => {
        setFormData(prev => ({
            ...prev,
            exercises: prev.exercises.map((ex, i) =>
                i === index ? { ...ex, [field]: value } : ex
            )
        }));
    };

    const handleGenerateWithAI = async () => {
        if (!isAIConfigured()) {
            showToast('OpenRouter API não configurada. Adicione VITE_OPENROUTER_API_KEY ao arquivo .env.local e reinicie o servidor.', 'error');
            return;
        }

        setLoading(true);
        setAiProgress('Iniciando geração com IA...');

        try {
            if (generationType === 'single') {
                // Generate single workout
                setAiProgress('Gerando treino personalizado...');
                const workout = await generateWorkout(userData, exercises);

                setAiProgress('Salvando treino...');
                const { data, error } = await supabaseWorkouts.createWorkout(workout);

                if (error) {
                    throw new Error(error.message);
                }

                actions.addWorkout(workout);
                showToast('Treino gerado com sucesso! 💪', 'success');
                navigate('/workouts');

            } else {
                // Generate weekly batch
                const numberOfWorkouts = userData.daysPerWeek || 3;
                setAiProgress(`Gerando ${numberOfWorkouts} treinos para a semana...`);

                const workouts = await generateWeeklyWorkouts(userData, exercises, numberOfWorkouts);

                setAiProgress('Salvando treinos...');

                // Save all workouts
                for (let i = 0; i < workouts.length; i++) {
                    setAiProgress(`Salvando treino ${i + 1}/${workouts.length}...`);
                    const { error } = await supabaseWorkouts.createWorkout(workouts[i]);

                    if (error) {
                        console.error(`Erro ao salvar treino ${i + 1}:`, error);
                    } else {
                        actions.addWorkout(workouts[i]);
                    }

                    // Small delay between saves
                    await new Promise(resolve => setTimeout(resolve, 300));
                }

                showToast(`${workouts.length} treinos gerados com sucesso! 🎉`, 'success');
                navigate('/workouts');
            }

        } catch (error) {
            console.error('Erro ao gerar treino:', error);
            showToast('Erro ao gerar treino: ' + error.message, 'error');
        } finally {
            setLoading(false);
            setAiProgress('');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.name.trim()) {
            showToast('Digite um nome para o treino', 'error');
            return;
        }

        if (formData.exercises.length === 0) {
            showToast('Adicione pelo menos um exercício', 'error');
            return;
        }

        setLoading(true);

        try {
            const workout = {
                ...formData,
                workoutType: 'custom',
                createdAt: new Date().toISOString()
            };

            // Save to Supabase
            const { data, error } = await supabaseWorkouts.createWorkout(workout);

            if (error) {
                console.error('Erro ao criar treino:', error);
                showToast('Erro ao salvar treino: ' + error.message, 'error');
            } else {
                // Also save to context for immediate UI update
                actions.addWorkout(workout);
                navigate('/workouts');
            }
        } catch (error) {
            console.error('Erro ao criar treino:', error);
            showToast('Erro inesperado: ' + error.message, 'error');
        } finally {
            setLoading(false);
        }
    };

    const filteredExercises = exercises.filter(ex =>
        ex.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ex.category.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="workout-create-page">
            <header className="page-header">
                <button className="back-btn" onClick={() => navigate('/workouts')}>
                    <ArrowLeft size={20} />
                </button>
                <h1>Criar Treino</h1>
                <div style={{ width: 40 }} />
            </header>

            {/* Mode Selector */}
            <Card className="mode-selector">
                <div className="mode-toggle">
                    <button
                        className={`mode-btn ${creationMode === 'ai' ? 'active' : ''}`}
                        onClick={() => setCreationMode('ai')}
                    >
                        <Sparkles size={20} />
                        <div>
                            <strong>Gerar com IA</strong>
                            <span>Personal Trainer inteligente</span>
                        </div>
                    </button>
                    <button
                        className={`mode-btn ${creationMode === 'manual' ? 'active' : ''}`}
                        onClick={() => setCreationMode('manual')}
                    >
                        <Dumbbell size={20} />
                        <div>
                            <strong>Criar Manualmente</strong>
                            <span>Monte seu treino personalizado</span>
                        </div>
                    </button>
                </div>
            </Card>

            {/* AI Generation Mode */}
            {creationMode === 'ai' && (
                <div className="ai-generation-section">
                    <Card>
                        <div className="ai-header">
                            <Sparkles size={24} className="ai-icon" />
                            <div>
                                <h2>Personal Trainer IA</h2>
                                <p>Treinos personalizados baseados no seu perfil</p>
                            </div>
                        </div>

                        {/* Generation Type Options */}
                        <div className="generation-type">
                            <label>Tipo de Geração</label>
                            <div className="option-cards">
                                <button
                                    type="button"
                                    className={`option-card ${generationType === 'single' ? 'active' : ''}`}
                                    onClick={() => setGenerationType('single')}
                                >
                                    <Zap size={32} />
                                    <h3>Treino Único</h3>
                                    <p>Gere um treino completo personalizado</p>
                                </button>
                                <button
                                    type="button"
                                    className={`option-card ${generationType === 'batch' ? 'active' : ''}`}
                                    onClick={() => setGenerationType('batch')}
                                >
                                    <Calendar size={32} />
                                    <h3>Semana Completa</h3>
                                    <p>Gere {userData.daysPerWeek || 3} treinos para sua semana</p>
                                </button>
                            </div>
                        </div>

                        {/* User Context Summary */}
                        <div className="user-context">
                            <h3>Seu Perfil</h3>
                            <div className="context-grid">
                                <div className="context-item">
                                    <Target size={16} />
                                    <span><strong>Objetivo:</strong> {userData.goal || 'Não definido'}</span>
                                </div>
                                <div className="context-item">
                                    <Dumbbell size={16} />
                                    <span><strong>Nível:</strong> {userData.fitnessLevel || 'Intermediário'}</span>
                                </div>
                                <div className="context-item">
                                    <Calendar size={16} />
                                    <span><strong>Frequência:</strong> {userData.daysPerWeek || 3}x por semana</span>
                                </div>
                                <div className="context-item">
                                    <Clock size={16} />
                                    <span><strong>Horário:</strong> {userData.preferredTime || 'Flexível'}</span>
                                </div>
                            </div>
                            {userData.equipment && userData.equipment.length > 0 && (
                                <div className="equipment-list">
                                    <strong>Equipamentos:</strong> {userData.equipment.join(', ')}
                                </div>
                            )}
                        </div>

                        {/* Generate Button */}
                        <div className="ai-actions">
                            <Button
                                variant="primary"
                                size="lg"
                                loading={loading}
                                onClick={handleGenerateWithAI}
                                className="generate-btn"
                            >
                                {loading ? (
                                    <>
                                        <div className="spinner" />
                                        {aiProgress}
                                    </>
                                ) : (
                                    <>
                                        <Sparkles size={20} />
                                        {generationType === 'single'
                                            ? 'Gerar Treino com IA'
                                            : `Gerar ${userData.daysPerWeek || 3} Treinos`}
                                    </>
                                )}
                            </Button>
                        </div>
                    </Card>
                </div>
            )}

            {/* Manual Creation Mode */}
            {creationMode === 'manual' && (
                <form className="workout-form" onSubmit={handleSubmit}>
                <Card className="form-section">
                    <h2>Informações Básicas</h2>

                    <div className="form-group">
                        <label>Nome do Treino *</label>
                        <input
                            type="text"
                            placeholder="Ex: Treino de Peito"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        />
                    </div>

                    <div className="form-group">
                        <label>Descrição</label>
                        <textarea
                            placeholder="Descreva seu treino..."
                            rows={3}
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        />
                    </div>

                    <div className="form-group">
                        <label>Categoria</label>
                        <div className="option-pills">
                            {categories.map(cat => (
                                <button
                                    key={cat.id}
                                    type="button"
                                    className={`pill ${formData.category === cat.id ? 'active' : ''}`}
                                    onClick={() => setFormData({ ...formData, category: cat.id })}
                                >
                                    <span>{cat.icon}</span> {cat.name}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Nível</label>
                        <div className="option-pills">
                            {difficulties.map(diff => (
                                <button
                                    key={diff.id}
                                    type="button"
                                    className={`pill ${formData.difficulty === diff.id ? 'active' : ''}`}
                                    onClick={() => setFormData({ ...formData, difficulty: diff.id })}
                                >
                                    {diff.name}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Duração Estimada (minutos)</label>
                        <input
                            type="number"
                            min="5"
                            max="180"
                            value={formData.estimatedDuration}
                            onChange={(e) => setFormData({ ...formData, estimatedDuration: parseInt(e.target.value) })}
                        />
                    </div>
                </Card>

                <Card className="form-section">
                    <div className="section-header">
                        <h2>Exercícios ({formData.exercises.length})</h2>
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => setShowExercisePicker(true)}
                        >
                            <Plus size={16} /> Adicionar
                        </Button>
                    </div>

                    {formData.exercises.length === 0 ? (
                        <div className="empty-exercises">
                            <Dumbbell size={48} className="empty-icon" />
                            <p>Nenhum exercício adicionado</p>
                            <Button
                                type="button"
                                variant="primary"
                                onClick={() => setShowExercisePicker(true)}
                            >
                                <Plus size={18} /> Adicionar Exercício
                            </Button>
                        </div>
                    ) : (
                        <div className="exercises-list">
                            {formData.exercises.map((ex, index) => (
                                <motion.div
                                    key={index}
                                    className="exercise-item"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                >
                                    <div className="exercise-header">
                                        <span className="exercise-number">{index + 1}</span>
                                        <h4>{ex.exerciseName}</h4>
                                        <button
                                            type="button"
                                            className="remove-btn"
                                            onClick={() => handleRemoveExercise(index)}
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                    <div className="exercise-params">
                                        <div className="param">
                                            <label>Séries</label>
                                            <input
                                                type="number"
                                                min="1"
                                                max="10"
                                                value={ex.sets}
                                                onChange={(e) => handleUpdateExercise(index, 'sets', parseInt(e.target.value))}
                                            />
                                        </div>
                                        <div className="param">
                                            <label>Reps</label>
                                            <input
                                                type="text"
                                                placeholder="8-12"
                                                value={ex.reps}
                                                onChange={(e) => handleUpdateExercise(index, 'reps', e.target.value)}
                                            />
                                        </div>
                                        <div className="param">
                                            <label>Descanso (s)</label>
                                            <input
                                                type="number"
                                                min="0"
                                                max="300"
                                                value={ex.rest}
                                                onChange={(e) => handleUpdateExercise(index, 'rest', parseInt(e.target.value))}
                                            />
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </Card>

                <div className="form-actions">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => navigate('/workouts')}
                    >
                        Cancelar
                    </Button>
                    <Button
                        type="submit"
                        variant="primary"
                        loading={loading}
                        disabled={!formData.name || formData.exercises.length === 0}
                    >
                        Salvar Treino
                    </Button>
                </div>

                {/* Exercise Picker Modal */}
                <Modal
                    isOpen={showExercisePicker}
                    onClose={() => {
                        setShowExercisePicker(false);
                        setSearchTerm('');
                    }}
                    title="Adicionar Exercício"
                >
                    <div className="exercise-picker">
                        <input
                            type="text"
                            className="search-input"
                            placeholder="Buscar exercício..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            autoFocus
                        />
                        <div className="exercise-picker-list">
                            {filteredExercises.map(exercise => (
                                <button
                                    key={exercise.id}
                                    type="button"
                                    className="exercise-picker-item"
                                    onClick={() => handleAddExercise(exercise)}
                                >
                                    <span className="exercise-icon">💪</span>
                                    <div className="exercise-info">
                                        <h4>{exercise.name}</h4>
                                        <p>{exercise.category} • {exercise.difficulty}</p>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                </Modal>
                </form>
            )}

            {/* Toast Notifications */}
            <AnimatePresence>
                {toast.show && (
                    <Toast
                        message={toast.message}
                        type={toast.type}
                        onClose={() => setToast({ show: false, message: '', type: 'info' })}
                    />
                )}
            </AnimatePresence>
        </div>
    );
}
