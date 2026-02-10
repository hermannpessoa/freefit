import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Trophy, Clock, Dumbbell, Flame, Share2, Home, ChevronRight } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { useSupabaseContext } from '../../contexts/SupabaseContext';
import { Button, Card } from '../../components/ui';
import { useEffect, useState } from 'react';
import './WorkoutComplete.css';

export default function WorkoutCompletePage() {
    const navigate = useNavigate();
    const { state } = useApp();
    const { history } = useSupabaseContext();
    const [saving, setSaving] = useState(false);

    // Get the last completed workout
    const lastWorkout = state.workoutHistory[0];

    useEffect(() => {
        // Trigger confetti animation
        const colors = ['#7c3aed', '#a855f7', '#f97316', '#22c55e'];
        // Simple confetti effect using CSS
        document.body.classList.add('celebrating');
        setTimeout(() => document.body.classList.remove('celebrating'), 3000);

        // Save to Supabase
        if (lastWorkout) {
            saveToDB();
        }
    }, []);

    const saveToDB = async () => {
        setSaving(true);
        try {
            await history.addToHistory({
                workout_id: lastWorkout.id,
                workout_name: lastWorkout.name,
                duration_minutes: lastWorkout.duration || 0,
                xp_earned: lastWorkout.xpEarned || 50,
                exercises_completed: lastWorkout.exercisesCompleted || []
            });
        } catch (error) {
            console.error('Erro ao salvar treino:', error);
        } finally {
            setSaving(false);
        }
    };

    const stats = lastWorkout ? [
        { icon: Clock, label: 'Duração', value: `${lastWorkout.duration || 0} min`, color: 'var(--primary-400)' },
        { icon: Dumbbell, label: 'Exercícios', value: lastWorkout.exercisesCompleted?.length || 0, color: 'var(--accent-400)' },
        { icon: Flame, label: 'Calorias', value: `~${Math.round((lastWorkout.duration || 0) * 8)} kcal`, color: '#ef4444' },
        { icon: Trophy, label: 'XP Ganho', value: `+${lastWorkout.xpEarned || 50}`, color: 'var(--success-400)' },
    ] : [];

    return (
        <div className="workout-complete-page">
            <div className="complete-background">
                <div className="glow-orb glow-1" />
                <div className="glow-orb glow-2" />
            </div>

            <motion.div
                className="complete-content"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
            >
                {/* Trophy Animation */}
                <motion.div
                    className="trophy-container"
                    initial={{ y: -50, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                >
                    <div className="trophy-glow" />
                    <Trophy size={64} className="trophy-icon" />
                </motion.div>

                {/* Title */}
                <motion.h1
                    className="complete-title"
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.3 }}
                >
                    Treino Concluído! 🎉
                </motion.h1>

                <motion.p
                    className="complete-subtitle"
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.4 }}
                >
                    Parabéns! Você está mais perto dos seus objetivos.
                </motion.p>

                {/* Stats Grid */}
                <motion.div
                    className="stats-grid"
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.5 }}
                >
                    {stats.map((stat, i) => (
                        <Card key={i} className="stat-card">
                            <stat.icon size={24} style={{ color: stat.color }} />
                            <span className="stat-value">{stat.value}</span>
                            <span className="stat-label">{stat.label}</span>
                        </Card>
                    ))}
                </motion.div>

                {/* XP Animation */}
                <motion.div
                    className="xp-earned"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.6, type: 'spring' }}
                >
                    <span className="xp-value">+{lastWorkout?.xpEarned || 50} XP</span>
                    <span className="xp-label">Experiência ganha</span>
                </motion.div>

                {/* Actions */}
                <motion.div
                    className="complete-actions"
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.7 }}
                >
                    <Button variant="primary" size="lg" fullWidth onClick={() => navigate('/dashboard')}>
                        <Home size={20} /> Voltar ao Início
                    </Button>

                    <Button variant="ghost" fullWidth onClick={() => navigate('/progress')}>
                        Ver Progresso <ChevronRight size={20} />
                    </Button>
                </motion.div>
            </motion.div>
        </div>
    );
}
