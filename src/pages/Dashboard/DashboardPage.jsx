import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Play, Flame, TrendingUp, Trophy, Clock, Dumbbell, ChevronRight, Sparkles, Calendar, Check } from 'lucide-react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { useApp } from '../../contexts/AppContext';
import { useSupabaseContext } from '../../contexts/SupabaseContext';
import { workoutTemplates } from '../../data/workouts';
import { exerciseDatabase } from '../../data/exercises';
import { Button, Card, ProgressBar, Badge } from '../../components/ui';
import 'swiper/css';
import './Dashboard.css';

export default function DashboardPage() {
    const navigate = useNavigate();
    const { state, actions } = useApp();
    const { profile: supabaseProfile, workouts: supabaseWorkouts, history } = useSupabaseContext();
    const { profile, workouts, workoutHistory, onboardingData } = state;

    // Use Supabase data if available, fallback to context
    const currentProfile = supabaseProfile.profile || profile;
    const currentWorkouts = supabaseWorkouts.workouts.length > 0 ? supabaseWorkouts.workouts : workouts;
    const currentHistory = history.history.length > 0 ? history.history : workoutHistory;

    // Get today's workout or recommended
    const todaysWorkout = useMemo(() => {
        if (currentWorkouts.length > 0) return currentWorkouts[0];
        // Return a template based on user's goal
        const templates = {
            muscle_gain: workoutTemplates.find(t => t.id === 'template-push'),
            weight_loss: workoutTemplates.find(t => t.id === 'template-hiit'),
            definition: workoutTemplates.find(t => t.id === 'template-fullbody-beginner'),
            health: workoutTemplates.find(t => t.id === 'template-fullbody-beginner'),
            strength: workoutTemplates.find(t => t.id === 'template-legs'),
        };
        return templates[onboardingData.goal] || workoutTemplates[0];
    }, [currentWorkouts, onboardingData.goal]);

    // Get workouts completed this week
    const completedThisWeek = useMemo(() => {
        const now = new Date();
        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - now.getDay()); // Sunday
        startOfWeek.setHours(0, 0, 0, 0);

        return currentHistory
            .filter(h => {
                const completedDate = new Date(h.completed_at || h.completedAt);
                return completedDate >= startOfWeek;
            })
            .map(h => h.workout_id || h.workoutId);
    }, [currentHistory]);

    // Prepare workouts with completion status
    const workoutsForSlider = useMemo(() => {
        const workoutsToShow = currentWorkouts.length > 0
            ? currentWorkouts
            : workoutTemplates.slice(0, 3);

        return workoutsToShow.map(workout => ({
            ...workout,
            isCompleted: completedThisWeek.includes(workout.id)
        }));
    }, [currentWorkouts, completedThisWeek]);

    // Calculate weekly stats
    const weeklyStats = useMemo(() => {
        const now = new Date();
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        const thisWeek = currentHistory.filter(w => new Date(w.completedAt) >= weekAgo);
        return {
            workouts: thisWeek.length,
            duration: thisWeek.reduce((acc, w) => acc + (w.duration || 0), 0),
            volume: thisWeek.reduce((acc, w) => acc + (w.totalVolume || 0), 0),
        };
    }, [currentHistory]);

    // XP progress to next level
    const xpToNextLevel = currentProfile.level * 500;
    const currentLevelXp = currentProfile.totalXp - ((currentProfile.level - 1) * 500);
    const xpProgress = (currentLevelXp / 500) * 100;

    const handleStartWorkout = (workout) => {
        if (workout && !workout.isCompleted) {
            actions.startWorkout(workout);
            navigate('/workout-active');
        }
    };

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Bom dia';
        if (hour < 18) return 'Boa tarde';
        return 'Boa noite';
    };

    return (
        <div className="dashboard-page">
            {/* Header */}
            <header className="dashboard-header">
                <div className="header-content">
                    <div className="greeting-section">
                        <p className="greeting">{getGreeting()},</p>
                        <h1 className="user-name">{currentProfile.name || 'Atleta'} 👋</h1>
                    </div>
                    <div className="level-badge" onClick={() => navigate('/progress')}>
                        <span className="level-number">Nv {currentProfile.level}</span>
                        <div className="mini-xp-bar">
                            <div className="mini-xp-fill" style={{ width: `${xpProgress}%` }} />
                        </div>
                    </div>
                </div>
            </header>

            {/* Streak Card */}
            {profile.streak > 0 && (
                <motion.div
                    className="streak-card"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                >
                    <div className="streak-icon">
                        <Flame size={28} />
                    </div>
                    <div className="streak-info">
                        <span className="streak-count">{profile.streak} dias</span>
                        <span className="streak-label">Sequência de treinos</span>
                    </div>
                    <div className="streak-badge">🔥</div>
                </motion.div>
            )}

            {/* Workouts Slider */}
            <motion.section
                className="section"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
            >
                <div className="section-header">
                    <h2>Seus Treinos</h2>
                    <button className="see-all" onClick={() => navigate('/workouts')}>
                        Ver tudo <ChevronRight size={16} />
                    </button>
                </div>

                <Swiper
                    spaceBetween={16}
                    slidesPerView={1.15}
                    className="workouts-slider"
                >
                    {workoutsForSlider.map((workout) => (
                        <SwiperSlide key={workout.id}>
                            <Card
                                className={`workout-slider-card ${workout.isCompleted ? 'completed' : ''}`}
                                onClick={() => handleStartWorkout(workout)}
                            >
                                <div className="workout-card-bg" />
                                {workout.isCompleted && (
                                    <div className="completed-overlay">
                                        <div className="completed-badge">
                                            <Check size={20} />
                                            <span>Concluído</span>
                                        </div>
                                    </div>
                                )}
                                <div className="workout-card-content">
                                    <div className="workout-info">
                                        <h3 className="workout-name">{workout.name}</h3>
                                        <p className="workout-desc">{workout.description}</p>
                                        <div className="workout-meta">
                                            <span><Clock size={14} /> {workout.estimated_duration || workout.estimatedDuration || 60} min</span>
                                            <span><Dumbbell size={14} /> {workout.exercises?.length || 6} exercícios</span>
                                        </div>
                                    </div>
                                    {!workout.isCompleted && (
                                        <Button variant="accent" className="start-btn">
                                            <Play size={20} /> Iniciar
                                        </Button>
                                    )}
                                </div>
                            </Card>
                        </SwiperSlide>
                    ))}
                </Swiper>
            </motion.section>

            {/* Weekly Stats */}
            <motion.section
                className="section"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
            >
                <div className="section-header">
                    <h2>Esta Semana</h2>
                    <button className="see-all" onClick={() => navigate('/progress')}>
                        Ver tudo <ChevronRight size={16} />
                    </button>
                </div>

                <div className="stats-row">
                    <Card className="stat-card">
                        <div className="stat-icon" style={{ background: 'rgba(124, 58, 237, 0.2)' }}>
                            <Dumbbell size={20} style={{ color: 'var(--primary-400)' }} />
                        </div>
                        <div className="stat-value">{weeklyStats.workouts}</div>
                        <div className="stat-label">Treinos</div>
                    </Card>

                    <Card className="stat-card">
                        <div className="stat-icon" style={{ background: 'rgba(249, 115, 22, 0.2)' }}>
                            <Clock size={20} style={{ color: 'var(--accent-400)' }} />
                        </div>
                        <div className="stat-value">{weeklyStats.duration}</div>
                        <div className="stat-label">Minutos</div>
                    </Card>

                    <Card className="stat-card">
                        <div className="stat-icon" style={{ background: 'rgba(34, 197, 94, 0.2)' }}>
                            <TrendingUp size={20} style={{ color: 'var(--success-400)' }} />
                        </div>
                        <div className="stat-value">{(weeklyStats.volume / 1000).toFixed(1)}t</div>
                        <div className="stat-label">Volume</div>
                    </Card>
                </div>
            </motion.section>

            {/* Quick Actions */}
            <motion.section
                className="section"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
            >
                <div className="section-header">
                    <h2>Acesso Rápido</h2>
                </div>

                <div className="quick-actions">
                    <button className="quick-action-btn" onClick={() => navigate('/workouts/create')}>
                        <div className="action-icon gradient-bg">
                            <Sparkles size={22} />
                        </div>
                        <span>Gerar Treino IA</span>
                    </button>

                    <button className="quick-action-btn" onClick={() => navigate('/exercises')}>
                        <div className="action-icon">
                            <Dumbbell size={22} />
                        </div>
                        <span>Exercícios</span>
                    </button>

                    <button className="quick-action-btn" onClick={() => navigate('/workouts')}>
                        <div className="action-icon">
                            <Calendar size={22} />
                        </div>
                        <span>Meus Treinos</span>
                    </button>

                    <button className="quick-action-btn" onClick={() => navigate('/progress')}>
                        <div className="action-icon">
                            <Trophy size={22} />
                        </div>
                        <span>Conquistas</span>
                    </button>
                </div>
            </motion.section>

            {/* Workout Templates */}
            <motion.section
                className="section"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
            >
                <div className="section-header">
                    <h2>Treinos Prontos</h2>
                    <button className="see-all" onClick={() => navigate('/workouts')}>
                        Ver tudo <ChevronRight size={16} />
                    </button>
                </div>

                <div className="templates-scroll">
                    {workoutTemplates.slice(0, 4).map((template, index) => (
                        <Card
                            key={template.id}
                            className="template-card"
                            onClick={() => {
                                actions.startWorkout(template);
                                navigate('/workout-active');
                            }}
                        >
                            <div className="template-badge">{template.category}</div>
                            <h4 className="template-name">{template.name}</h4>
                            <p className="template-meta">
                                <Clock size={12} /> {template.estimatedDuration}min
                            </p>
                        </Card>
                    ))}
                </div>
            </motion.section>

            {/* Bottom padding for nav */}
            <div style={{ height: 100 }} />
        </div>
    );
}
