import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Play, Clock, Dumbbell, ChevronLeft, Zap, Info, Download, Copy, Check } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { useSupabaseContext } from '../../contexts/SupabaseContext';
import { Button, Card, Badge, Modal } from '../../components/ui';
import { useState } from 'react';
import './Workouts.css';

export default function WorkoutDetailPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { state, actions } = useApp();
    const { workouts: supabaseWorkouts, exercises: supabaseExercises } = useSupabaseContext();
    const { workouts: contextWorkouts } = state;
    const [showExportModal, setShowExportModal] = useState(false);
    const [copied, setCopied] = useState(false);

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
                        >
                            <Card className="exercise-card">
                                <div className="exercise-header">
                                    <div className="exercise-number">{index + 1}</div>
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
                            </Card>
                        </motion.div>
                    ))}
                </div>

                {/* Bottom Spacing */}
                <div style={{ height: 100 }} />
            </div>

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
