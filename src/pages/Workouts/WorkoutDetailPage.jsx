import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Play, Clock, Dumbbell, ChevronLeft, ChevronRight, Zap, Info, Download, Copy, Check, RefreshCw } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { useSupabaseContext } from '../../contexts/SupabaseContext';
import { Button, Card, Badge, Modal } from '../../components/ui';
import { useState, useEffect } from 'react';
import { suggestExerciseSwap, isAIConfigured } from '../../services/aiWorkoutGenerator';
import './Workouts.css';

export default function WorkoutDetailPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { state, actions } = useApp();
    const { workouts: supabaseWorkouts, exercises: supabaseExercises } = useSupabaseContext();
    const { workouts: contextWorkouts } = state;
    const [showExportModal, setShowExportModal] = useState(false);
    const [copied, setCopied] = useState(false);
    const [selectedExercise, setSelectedExercise] = useState(null);
    const [currentSlide, setCurrentSlide] = useState(0);
    const [touchStart, setTouchStart] = useState(0);
    const [touchEnd, setTouchEnd] = useState(0);
    const [swappingIndex, setSwappingIndex] = useState(null);
    const [swapSuggestion, setSwapSuggestion] = useState(null);
    const [swapLoading, setSwapLoading] = useState(false);

    // Get all workouts including templates from Supabase
    const allWorkouts = supabaseWorkouts.workouts.length > 0
        ? [...supabaseWorkouts.workouts, ...(supabaseWorkouts.templates || [])]
        : [...contextWorkouts];

    // Find the workout by ID
    const workout = allWorkouts.find(w => w.id === id);

    if (!workout) {
        return (
            <div className="workout-detail-page">
                <header className="detail-header">
                    <button className="back-btn" onClick={() => navigate(-1)}>
                        <ChevronLeft size={24} />
                    </button>
                    <h1>Treino não encontrado</h1>
                </header>
                <div style={{ padding: 20, textAlign: 'center' }}>
                    <p style={{ color: 'var(--text-secondary)' }}>
                        O treino que você está procurando não foi encontrado.
                    </p>
                    <Button variant="primary" onClick={() => navigate('/workouts')} style={{ marginTop: 20 }}>
                        Voltar para Treinos
                    </Button>
                </div>
            </div>
        );
    }

    // Get exercise details for each exercise in the workout
    const exercisesWithDetails = workout.exercises?.map(ex => {
        const exerciseDetails = supabaseExercises.exercises.find(e => e.id === ex.exerciseId || e.id === ex.id);
        return {
            ...ex,
            details: exerciseDetails
        };
    }) || [];

    const handleStartWorkout = () => {
        actions.startWorkout(workout);
        navigate('/workout-active');
    };

    // Slider navigation for exercise detail modal
    const totalSlides = 2;
    const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % totalSlides);
    const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + totalSlides) % totalSlides);

    const handleTouchStart = (e) => setTouchStart(e.targetTouches[0].clientX);
    const handleTouchMove = (e) => setTouchEnd(e.targetTouches[0].clientX);
    const handleTouchEnd = () => {
        if (!touchStart || !touchEnd) return;
        const distance = touchStart - touchEnd;
        if (distance > 50) nextSlide();
        if (distance < -50) prevSlide();
        setTouchStart(0);
        setTouchEnd(0);
    };

    // Reset slide when modal opens
    useEffect(() => {
        if (selectedExercise) setCurrentSlide(0);
    }, [selectedExercise]);

    // Handle swap exercise request
    const handleSwapRequest = async (e, exercise, index) => {
        e.stopPropagation(); // Don't open detail modal
        if (swapLoading) return;

        setSwapLoading(true);
        setSwappingIndex(index);
        setSwapSuggestion(null);

        try {
            const exerciseToReplace = exercise.details || exercise;

            // Build current workout exercises with names for AI context
            const currentExercises = exercisesWithDetails.map(ex => ({
                exerciseId: ex.exerciseId || ex.id,
                name: ex.details?.name || ex.name || 'Unknown',
                exerciseName: ex.details?.name || ex.name || 'Unknown',
            }));

            const userData = {
                fitnessLevel: state.onboardingData?.fitnessLevel,
                injuries: state.onboardingData?.injuries,
                equipment: state.onboardingData?.equipment,
            };

            const suggestion = await suggestExerciseSwap(
                exerciseToReplace,
                currentExercises,
                supabaseExercises.exercises,
                userData
            );

            setSwapSuggestion(suggestion);
        } catch (error) {
            console.error('Erro ao buscar sugestão de substituição:', error);
            setSwapSuggestion({ error: error.message });
        } finally {
            setSwapLoading(false);
        }
    };

    // Confirm the swap
    const handleConfirmSwap = async () => {
        if (!swapSuggestion || swapSuggestion.error || swappingIndex === null) return;

        const newExercises = [...(workout.exercises || [])];
        const oldExercise = newExercises[swappingIndex];

        // Replace exercise keeping sets/reps/rest
        newExercises[swappingIndex] = {
            ...oldExercise,
            exerciseId: swapSuggestion.exerciseId,
            id: swapSuggestion.exerciseId,
            name: swapSuggestion.exerciseName,
            exerciseName: swapSuggestion.exerciseName,
        };

        // Update in Supabase
        const { error } = await supabaseWorkouts.updateWorkout(workout.id, {
            exercises: newExercises,
        });

        if (error) {
            console.error('Erro ao salvar substituição:', error);
        }

        // Also update local context
        actions.updateWorkout({ ...workout, exercises: newExercises });

        // Close modal
        setSwappingIndex(null);
        setSwapSuggestion(null);
    };

    const handleCancelSwap = () => {
        setSwappingIndex(null);
        setSwapSuggestion(null);
    };

    const getCategoryColor = (category) => {
        const colors = {
            strength: 'var(--primary-500)',
            cardio: 'var(--error-500)',
            hiit: 'var(--accent-500)',
            flexibility: 'var(--success-500)'
        };
        return colors[category] || 'var(--primary-500)';
    };

    const getDifficultyLabel = (difficulty) => {
        const labels = {
            beginner: 'Iniciante',
            intermediate: 'Intermediário',
            advanced: 'Avançado'
        };
        return labels[difficulty] || difficulty;
    };

    const exportWorkoutJSON = () => {
        // Create a clean export object
        const exportData = {
            name: workout.name,
            description: workout.description || '',
            category: workout.category || 'strength',
            difficulty: workout.difficulty || 'intermediate',
            estimatedDuration: workout.estimatedDuration || workout.estimated_duration || 45,
            muscleGroups: workout.muscleGroups || workout.muscle_groups || [],
            exercises: workout.exercises?.map(ex => ({
                exerciseId: ex.exerciseId || ex.id,
                sets: ex.sets || 3,
                reps: ex.reps || '10',
                rest: ex.rest || 60
            })) || []
        };
        return JSON.stringify(exportData, null, 2);
    };

    const handleCopyJSON = async () => {
        try {
            const json = exportWorkoutJSON();
            await navigator.clipboard.writeText(json);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (error) {
            console.error('Erro ao copiar:', error);
        }
    };

    const handleExport = () => {
        setShowExportModal(true);
        setCopied(false);
    };

    return (
        <div className="workout-detail-page">
            {/* Header */}
            <header className="detail-header">
                <button className="back-btn" onClick={() => navigate(-1)}>
                    <ChevronLeft size={24} />
                </button>
                <h1>Detalhes do Treino</h1>
            </header>

            {/* Workout Info Card */}
            <div className="detail-content">
                <Card className="workout-info-card">
                    <div className="workout-header-badges">
                        {workout.category && (
                            <Badge variant="primary" style={{ backgroundColor: getCategoryColor(workout.category) }}>
                                {workout.category}
                            </Badge>
                        )}
                        {workout.difficulty && (
                            <Badge variant={
                                workout.difficulty === 'beginner' ? 'success' :
                                workout.difficulty === 'intermediate' ? 'warning' :
                                'error'
                            }>
                                {getDifficultyLabel(workout.difficulty)}
                            </Badge>
                        )}
                    </div>

                    <h2 className="workout-title">{workout.name}</h2>
                    {workout.description && (
                        <p className="workout-description">{workout.description}</p>
                    )}

                    <div className="workout-stats">
                        <div className="stat-item">
                            <Clock size={18} />
                            <span>{workout.estimatedDuration || workout.estimated_duration || 45} min</span>
                        </div>
                        <div className="stat-item">
                            <Dumbbell size={18} />
                            <span>{exercisesWithDetails.length} exercícios</span>
                        </div>
                        {workout.muscleGroups && workout.muscleGroups.length > 0 && (
                            <div className="stat-item">
                                <Zap size={18} />
                                <span>{workout.muscleGroups.join(', ')}</span>
                            </div>
                        )}
                    </div>

                    <Button variant="accent" fullWidth onClick={handleStartWorkout} style={{ marginTop: 16 }}>
                        <Play size={20} /> Iniciar Treino
                    </Button>
                    <Button variant="ghost" fullWidth onClick={handleExport} style={{ marginTop: 8 }}>
                        <Download size={18} /> Exportar Treino
                    </Button>
                </Card>

                {/* Exercises List */}
                <div className="exercises-section">
                    <h3 className="section-title">Exercícios ({exercisesWithDetails.length})</h3>

                    {exercisesWithDetails.map((exercise, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                            onClick={() => exercise.details && setSelectedExercise(exercise.details)}
                            style={{ cursor: exercise.details ? 'pointer' : 'default' }}
                        >
                            <Card className="exercise-card">
                                <div className="exercise-header">
                                    {exercise.details?.demo_image ? (
                                        <img
                                            src={exercise.details.demo_image}
                                            alt={exercise.details.name}
                                            className="exercise-thumb"
                                            loading="lazy"
                                        />
                                    ) : (
                                        <div className="exercise-number">{index + 1}</div>
                                    )}
                                    <div className="exercise-info">
                                        <h4 className="exercise-name">
                                            {exercise.details?.name || exercise.name || 'Exercício'}
                                        </h4>
                                        {exercise.details?.category && (
                                            <span className="exercise-category">
                                                {exercise.details.category}
                                            </span>
                                        )}
                                    </div>
                                    {exercise.details && <Info size={18} style={{ color: 'var(--text-tertiary)' }} />}
                                </div>

                                {exercise.details?.equipment && exercise.details.equipment.length > 0 && (
                                    <div className="exercise-equipment">
                                        <Dumbbell size={14} />
                                        <span>{exercise.details.equipment.join(', ')}</span>
                                    </div>
                                )}

                                <div className="exercise-specs">
                                    <div className="spec-item">
                                        <span className="spec-label">Séries</span>
                                        <span className="spec-value">{exercise.sets || 3}</span>
                                    </div>
                                    <div className="spec-item">
                                        <span className="spec-label">Reps</span>
                                        <span className="spec-value">{exercise.reps || '10-12'}</span>
                                    </div>
                                    <div className="spec-item">
                                        <span className="spec-label">Descanso</span>
                                        <span className="spec-value">{exercise.rest || 60}s</span>
                                    </div>
                                </div>

                                {exercise.details?.description && (
                                    <div className="exercise-description">
                                        <Info size={14} />
                                        <p>{exercise.details.description}</p>
                                    </div>
                                )}

                                {isAIConfigured() && (
                                    <button
                                        className="swap-exercise-btn"
                                        onClick={(e) => handleSwapRequest(e, exercise, index)}
                                        disabled={swapLoading && swappingIndex === index}
                                        title="Substituir exercício"
                                    >
                                        <RefreshCw size={14} className={swapLoading && swappingIndex === index ? 'spin' : ''} />
                                        <span>{swapLoading && swappingIndex === index ? 'Buscando...' : 'Substituir'}</span>
                                    </button>
                                )}
                            </Card>
                        </motion.div>
                    ))}
                </div>

                {/* Bottom Spacing */}
                <div style={{ height: 100 }} />
            </div>

            {/* Swap Suggestion Modal */}
            <Modal
                isOpen={swappingIndex !== null && !swapLoading}
                onClose={handleCancelSwap}
                title="Substituir Exercício"
            >
                {swapSuggestion && !swapSuggestion.error && (() => {
                    const suggestedDetails = supabaseExercises.exercises.find(e => e.id === swapSuggestion.exerciseId);
                    return (
                        <div className="swap-suggestion">
                            <div className="swap-comparison">
                                <div className="swap-from">
                                    <span className="swap-label">Atual</span>
                                    <div className="swap-exercise-name">
                                        {exercisesWithDetails[swappingIndex]?.details?.name || exercisesWithDetails[swappingIndex]?.name}
                                    </div>
                                </div>
                                <div className="swap-arrow">→</div>
                                <div className="swap-to">
                                    <span className="swap-label">Sugestão da IA</span>
                                    <div className="swap-exercise-name">{swapSuggestion.exerciseName}</div>
                                </div>
                            </div>
                            {suggestedDetails?.demo_image && (
                                <img
                                    src={suggestedDetails.demo_image}
                                    alt={swapSuggestion.exerciseName}
                                    className="swap-preview-img"
                                    loading="lazy"
                                />
                            )}
                            <p className="swap-reason">{swapSuggestion.reason}</p>
                            <div className="swap-actions">
                                <Button variant="ghost" onClick={handleCancelSwap}>Cancelar</Button>
                                <Button variant="primary" onClick={handleConfirmSwap}>
                                    <Check size={16} /> Confirmar Troca
                                </Button>
                            </div>
                        </div>
                    );
                })()}
                {swapSuggestion?.error && (
                    <div className="swap-error">
                        <p>Não foi possível sugerir uma substituição.</p>
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)' }}>{swapSuggestion.error}</p>
                        <Button variant="ghost" onClick={handleCancelSwap} style={{ marginTop: 12 }}>Fechar</Button>
                    </div>
                )}
            </Modal>

            {/* Exercise Detail Modal */}
            <Modal
                isOpen={!!selectedExercise}
                onClose={() => setSelectedExercise(null)}
                title={selectedExercise?.name}
            >
                {selectedExercise && (
                    <div className="exercise-detail">
                        <div
                            className="media-carousel-container"
                            onTouchStart={handleTouchStart}
                            onTouchMove={handleTouchMove}
                            onTouchEnd={handleTouchEnd}
                        >
                            <div className="media-slider">
                                <div
                                    className="media-slides"
                                    style={{ transform: `translateX(-${currentSlide * 50}%)` }}
                                >
                                    <div className="media-slide">
                                        {selectedExercise.demo_video ? (
                                            <iframe
                                                src={selectedExercise.demo_video}
                                                title={selectedExercise.name}
                                                frameBorder="0"
                                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                                allowFullScreen
                                            />
                                        ) : (
                                            <div className="media-placeholder">
                                                <Play size={48} />
                                                <span>Sem vídeo disponível</span>
                                            </div>
                                        )}
                                    </div>
                                    <div className="media-slide">
                                        {selectedExercise.demo_image ? (
                                            <img src={selectedExercise.demo_image} alt={selectedExercise.name} loading="lazy" />
                                        ) : (
                                            <div className="media-placeholder">
                                                <Dumbbell size={48} />
                                                <span>Sem imagem disponível</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <button className="slider-nav slider-nav-prev" onClick={prevSlide} aria-label="Anterior">
                                    <ChevronLeft size={24} />
                                </button>
                                <button className="slider-nav slider-nav-next" onClick={nextSlide} aria-label="Próximo">
                                    <ChevronRight size={24} />
                                </button>
                                <div className="slider-pagination">
                                    {[...Array(totalSlides)].map((_, i) => (
                                        <button
                                            key={i}
                                            className={`slider-dot ${currentSlide === i ? 'active' : ''}`}
                                            onClick={() => setCurrentSlide(i)}
                                            aria-label={`Ir para slide ${i + 1}`}
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="detail-section">
                            <h4>Descrição</h4>
                            <p>{selectedExercise.description}</p>
                        </div>

                        {(selectedExercise.primaryMuscles?.length > 0 || selectedExercise.secondaryMuscles?.length > 0) && (
                            <div className="detail-section">
                                <h4>Músculos Trabalhados</h4>
                                <div className="muscle-chips">
                                    {selectedExercise.primaryMuscles?.map(m => (
                                        <span key={m} className="muscle-chip primary">{m}</span>
                                    ))}
                                    {selectedExercise.secondaryMuscles?.map(m => (
                                        <span key={m} className="muscle-chip secondary">{m}</span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {selectedExercise.steps?.length > 0 && (
                            <div className="detail-section">
                                <h4>Execução</h4>
                                <ol className="steps-list">
                                    {selectedExercise.steps.map((step, i) => (
                                        <li key={i}>{step}</li>
                                    ))}
                                </ol>
                            </div>
                        )}

                        {selectedExercise.tips?.length > 0 && (
                            <div className="detail-section">
                                <h4>Dicas</h4>
                                <ul className="tips-list">
                                    {selectedExercise.tips.map((tip, i) => (
                                        <li key={i}>{tip}</li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                )}
            </Modal>

            {/* Export Modal */}
            <Modal
                isOpen={showExportModal}
                onClose={() => setShowExportModal(false)}
                title="Exportar Treino"
            >
                <p style={{ color: 'var(--text-secondary)', marginBottom: 16, fontSize: '0.9rem' }}>
                    Copie o JSON abaixo para compartilhar ou importar este treino em outro dispositivo.
                </p>
                <div style={{
                    background: 'var(--bg-tertiary)',
                    padding: '16px',
                    borderRadius: 'var(--radius-lg)',
                    maxHeight: '400px',
                    overflow: 'auto',
                    marginBottom: '16px'
                }}>
                    <pre style={{
                        margin: 0,
                        fontSize: '0.75rem',
                        color: 'var(--text-secondary)',
                        whiteSpace: 'pre-wrap',
                        wordBreak: 'break-word'
                    }}>
                        {exportWorkoutJSON()}
                    </pre>
                </div>
                <Button
                    variant="primary"
                    fullWidth
                    onClick={handleCopyJSON}
                >
                    {copied ? (
                        <>
                            <Check size={18} /> Copiado!
                        </>
                    ) : (
                        <>
                            <Copy size={18} /> Copiar JSON
                        </>
                    )}
                </Button>
            </Modal>
        </div>
    );
}
