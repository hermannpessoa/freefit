import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Play, Clock, Dumbbell, ChevronLeft, Zap, Info } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { useSupabaseContext } from '../../contexts/SupabaseContext';
import { exerciseDatabase } from '../../data/exercises';
import { Button, Card, Badge } from '../../components/ui';
import './Workouts.css';

export default function WorkoutDetailPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { state, actions } = useApp();
    const { workouts: supabaseWorkouts } = useSupabaseContext();
    const { workouts: contextWorkouts } = state;

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
        const exerciseDetails = exerciseDatabase.find(e => e.id === ex.exerciseId || e.id === ex.id);
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
        </div>
    );
}
