import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, SkipForward, Check, X, Clock, Dumbbell, ChevronLeft, ChevronRight, Volume2, VolumeX } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { exerciseDatabase } from '../../data/exercises';
import { Button, Card, ProgressBar, Modal } from '../../components/ui';
import './WorkoutActive.css';

export default function WorkoutActivePage() {
    const navigate = useNavigate();
    const { state, actions } = useApp();
    const { activeWorkout } = state;

    const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
    const [currentSetIndex, setCurrentSetIndex] = useState(0);
    const [isResting, setIsResting] = useState(false);
    const [restTime, setRestTime] = useState(0);
    const [elapsedTime, setElapsedTime] = useState(0);
    const [isPaused, setIsPaused] = useState(false);
    const [completedSets, setCompletedSets] = useState([]);
    const [showExitModal, setShowExitModal] = useState(false);
    const [reps, setReps] = useState(0);
    const [weight, setWeight] = useState(0);

    // Get exercises with full details
    const exercises = useMemo(() => {
        if (!activeWorkout?.exercises) return [];
        return activeWorkout.exercises.map(ex => ({
            ...ex,
            details: exerciseDatabase.find(e => e.id === ex.exerciseId) || { name: 'Exercício', description: '' }
        }));
    }, [activeWorkout]);

    const currentExercise = exercises[currentExerciseIndex];
    const totalSets = currentExercise?.sets || 3;
    const targetReps = currentExercise?.reps || '10';
    const restDuration = currentExercise?.rest || 60;

    // Timer effect
    useEffect(() => {
        if (isPaused) return;

        const interval = setInterval(() => {
            if (isResting) {
                setRestTime(prev => {
                    if (prev <= 1) {
                        setIsResting(false);
                        return 0;
                    }
                    return prev - 1;
                });
            } else {
                setElapsedTime(prev => prev + 1);
            }
        }, 1000);

        return () => clearInterval(interval);
    }, [isPaused, isResting]);

    // Initialize reps/weight from previous sets or defaults
    useEffect(() => {
        if (currentExercise) {
            const prevSet = completedSets.find(s => s.exerciseId === currentExercise.exerciseId);
            setReps(prevSet?.reps || parseInt(targetReps) || 10);
            setWeight(prevSet?.weight || 0);
        }
    }, [currentExercise, completedSets]);

    const formatTime = (seconds) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    const handleCompleteSet = () => {
        const newSet = {
            exerciseId: currentExercise.exerciseId,
            exerciseName: currentExercise.details.name,
            setNumber: currentSetIndex + 1,
            reps,
            weight,
            timestamp: new Date().toISOString()
        };

        setCompletedSets(prev => [...prev, newSet]);

        if (currentSetIndex < totalSets - 1) {
            setCurrentSetIndex(prev => prev + 1);
            setIsResting(true);
            setRestTime(restDuration);
        } else if (currentExerciseIndex < exercises.length - 1) {
            setCurrentExerciseIndex(prev => prev + 1);
            setCurrentSetIndex(0);
            setIsResting(true);
            setRestTime(restDuration);
        } else {
            handleFinishWorkout();
        }
    };

    const handleSkipRest = () => {
        setIsResting(false);
        setRestTime(0);
    };

    const handlePreviousExercise = () => {
        if (currentExerciseIndex > 0) {
            setCurrentExerciseIndex(prev => prev - 1);
            setCurrentSetIndex(0);
            setIsResting(false);
        }
    };

    const handleNextExercise = () => {
        if (currentExerciseIndex < exercises.length - 1) {
            setCurrentExerciseIndex(prev => prev + 1);
            setCurrentSetIndex(0);
            setIsResting(false);
        }
    };

    const handleFinishWorkout = () => {
        const totalVolume = completedSets.reduce((acc, set) => acc + (set.reps * set.weight), 0);

        actions.completeWorkout({
            duration: Math.floor(elapsedTime / 60),
            exercisesCompleted: completedSets,
            totalVolume,
            xpEarned: 50 + (completedSets.length * 5)
        });

        navigate('/workout-complete');
    };

    const handleExit = () => {
        setShowExitModal(true);
    };

    const confirmExit = () => {
        actions.completeWorkout({ duration: 0, exercisesCompleted: [], totalVolume: 0, xpEarned: 0 });
        navigate('/dashboard');
    };

    if (!activeWorkout || exercises.length === 0) {
        navigate('/dashboard');
        return null;
    }

    const overallProgress = ((currentExerciseIndex * totalSets + currentSetIndex) / (exercises.length * totalSets)) * 100;

    return (
        <div className="workout-active-page">
            {/* Header */}
            <header className="workout-header">
                <button className="back-btn" onClick={handleExit}>
                    <X size={24} />
                </button>
                <div className="header-center">
                    <span className="workout-title">{activeWorkout.name}</span>
                    <span className="elapsed-time">{formatTime(elapsedTime)}</span>
                </div>
                <button className="pause-btn" onClick={() => setIsPaused(!isPaused)}>
                    {isPaused ? <Play size={24} /> : <Pause size={24} />}
                </button>
            </header>

            {/* Progress Bar */}
            <div className="workout-progress">
                <ProgressBar value={overallProgress} />
                <span className="progress-text">
                    Exercício {currentExerciseIndex + 1}/{exercises.length}
                </span>
            </div>

            {/* Rest Overlay */}
            <AnimatePresence>
                {isResting && (
                    <motion.div
                        className="rest-overlay"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        <div className="rest-content">
                            <span className="rest-label">Descanso</span>
                            <span className="rest-timer">{formatTime(restTime)}</span>
                            <div className="rest-progress">
                                <div
                                    className="rest-progress-fill"
                                    style={{ width: `${(restTime / restDuration) * 100}%` }}
                                />
                            </div>
                            <p className="next-exercise">
                                Próximo: {currentSetIndex < totalSets - 1
                                    ? `Série ${currentSetIndex + 2}`
                                    : exercises[currentExerciseIndex + 1]?.details.name || 'Finalizar'}
                            </p>
                            <Button variant="ghost" onClick={handleSkipRest}>
                                <SkipForward size={20} /> Pular descanso
                            </Button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Main Content */}
            <div className="workout-content">
                {/* Exercise Info */}
                <div className="exercise-section">
                    <motion.div
                        key={currentExercise.exerciseId}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="current-exercise"
                    >
                        <div className="exercise-video-area">
                            <div className="video-placeholder">
                                <Dumbbell size={48} />
                            </div>
                        </div>
                        <h2 className="exercise-name">{currentExercise.details.name}</h2>
                        <p className="exercise-target">
                            {totalSets} séries × {targetReps} reps
                        </p>
                    </motion.div>
                </div>

                {/* Sets Progress */}
                <div className="sets-section">
                    <div className="sets-indicators">
                        {Array.from({ length: totalSets }).map((_, i) => (
                            <div
                                key={i}
                                className={`set-indicator ${i < currentSetIndex ? 'completed' : i === currentSetIndex ? 'current' : ''}`}
                            >
                                {i < currentSetIndex ? <Check size={16} /> : i + 1}
                            </div>
                        ))}
                    </div>
                    <p className="current-set-label">Série {currentSetIndex + 1} de {totalSets}</p>
                </div>

                {/* Input Section */}
                <div className="input-section">
                    <div className="input-row">
                        <div className="input-group">
                            <label>Repetições</label>
                            <div className="stepper">
                                <button onClick={() => setReps(Math.max(0, reps - 1))}>−</button>
                                <input type="number" value={reps} onChange={(e) => setReps(parseInt(e.target.value) || 0)} />
                                <button onClick={() => setReps(reps + 1)}>+</button>
                            </div>
                        </div>
                        <div className="input-group">
                            <label>Peso (kg)</label>
                            <div className="stepper">
                                <button onClick={() => setWeight(Math.max(0, weight - 2.5))}>−</button>
                                <input type="number" value={weight} onChange={(e) => setWeight(parseFloat(e.target.value) || 0)} step="2.5" />
                                <button onClick={() => setWeight(weight + 2.5)}>+</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer Actions */}
            <div className="workout-footer">
                <button className="nav-btn" onClick={handlePreviousExercise} disabled={currentExerciseIndex === 0}>
                    <ChevronLeft size={24} />
                </button>

                <Button variant="primary" size="lg" className="complete-btn" onClick={handleCompleteSet}>
                    <Check size={24} /> Completar Série
                </Button>

                <button className="nav-btn" onClick={handleNextExercise} disabled={currentExerciseIndex === exercises.length - 1}>
                    <ChevronRight size={24} />
                </button>
            </div>

            {/* Exit Modal */}
            <Modal isOpen={showExitModal} onClose={() => setShowExitModal(false)} title="Sair do Treino?">
                <p style={{ color: 'var(--text-secondary)', marginBottom: 24 }}>
                    Seu progresso neste treino será perdido. Tem certeza que deseja sair?
                </p>
                <div style={{ display: 'flex', gap: 12 }}>
                    <Button variant="ghost" fullWidth onClick={() => setShowExitModal(false)}>
                        Continuar Treino
                    </Button>
                    <Button variant="secondary" fullWidth onClick={confirmExit} style={{ color: 'var(--error-400)' }}>
                        Sair
                    </Button>
                </div>
            </Modal>
        </div>
    );
}
