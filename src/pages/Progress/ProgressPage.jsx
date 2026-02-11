import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Flame, Dumbbell, Trophy, Calendar, Target, ChevronRight, Award } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { useApp } from '../../contexts/AppContext';
import { useSupabaseContext } from '../../contexts/SupabaseContext';
import { badges } from '../../data/workouts';
import { Card, Badge, ProgressBar } from '../../components/ui';
import './Progress.css';

export default function ProgressPage() {
    const { state } = useApp();
    const { profile, progressRecords } = state;
    const { history } = useSupabaseContext();
    
    // Map Supabase data to match expected format
    const workoutHistory = useMemo(() => {
        return history.history.map(w => {
            // Calculate volume from exercises if not stored directly
            const calculatedVolume = w.total_volume || 
                (w.exercises_completed || []).reduce((sum, set) => 
                    sum + (set.reps || 0) * (set.weight || 0), 0
                );
            
            return {
                id: w.id,
                workoutId: w.workout_id,
                workoutName: w.workout_name,
                completedAt: w.completed_at,
                duration: w.duration_minutes,
                xpEarned: w.xp_earned,
                totalVolume: calculatedVolume,
                exercisesCompleted: w.exercises_completed || []
            };
        });
    }, [history.history]);

    // Generate weekly data from actual workout history (last 7 days)
    const weeklyData = useMemo(() => {
        const days = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
        const today = new Date();
        const sevenDaysAgo = new Date(today);
        sevenDaysAgo.setDate(today.getDate() - 6);

        // Initialize data for last 7 days
        const weekData = Array.from({ length: 7 }).map((_, i) => {
            const date = new Date(sevenDaysAgo);
            date.setDate(sevenDaysAgo.getDate() + i);
            return {
                day: days[date.getDay()],
                workouts: 0,
                volume: 0,
                date: date.toDateString()
            };
        });

        // Count workouts and volume per day
        workoutHistory.forEach(workout => {
            const workoutDate = new Date(workout.completedAt);
            const dayData = weekData.find(d => d.date === workoutDate.toDateString());
            if (dayData) {
                dayData.workouts += 1;
                dayData.volume += workout.totalVolume || 0;
            }
        });

        return weekData;
    }, [workoutHistory]);

    // Monthly progress data - based on actual workout history
    const monthlyData = useMemo(() => {
        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();
        const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

        // Create array for each day of the month
        const dailyVolume = Array.from({ length: daysInMonth }).map((_, i) => ({
            day: i + 1,
            volume: 0
        }));

        // Aggregate volume per day from workout history
        workoutHistory.forEach(workout => {
            const workoutDate = new Date(workout.completedAt);
            if (workoutDate.getMonth() === currentMonth && workoutDate.getFullYear() === currentYear) {
                const day = workoutDate.getDate();
                if (day >= 1 && day <= daysInMonth) {
                    dailyVolume[day - 1].volume += workout.totalVolume || 0;
                }
            }
        });

        return dailyVolume;
    }, [workoutHistory]);

    // Stats calculations
    const stats = useMemo(() => {
        const now = new Date();
        const thisMonth = workoutHistory.filter(w => {
            const d = new Date(w.completedAt);
            return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
        });

        return {
            totalWorkouts: profile.totalWorkouts,
            streak: profile.streak,
            level: profile.level,
            xp: profile.totalXp,
            thisMonth: thisMonth.length,
            avgDuration: thisMonth.length > 0
                ? Math.round(thisMonth.reduce((a, w) => a + (w.duration || 0), 0) / thisMonth.length)
                : 0,
            totalVolume: workoutHistory.reduce((a, w) => a + (w.totalVolume || 0), 0),
        };
    }, [profile, workoutHistory]);

    // XP progress
    const xpForNextLevel = profile.level * 500;
    const currentLevelXp = profile.totalXp % 500;
    const xpProgress = (currentLevelXp / 500) * 100;

    // Unlocked badges
    const unlockedBadges = useMemo(() => {
        const unlocked = [];
        if (profile.totalWorkouts >= 1) unlocked.push('first_workout');
        if (profile.streak >= 3) unlocked.push('streak_3');
        if (profile.streak >= 7) unlocked.push('streak_7');
        if (profile.totalWorkouts >= 10) unlocked.push('workouts_10');
        if (profile.totalWorkouts >= 50) unlocked.push('workouts_50');
        return badges.filter(b => unlocked.includes(b.id));
    }, [profile]);

    return (
        <div className="progress-page">
            <header className="progress-header">
                <h1>Seu Progresso</h1>
            </header>

            {/* Level Card */}
            <motion.div
                className="level-card"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <div className="level-info">
                    <div className="level-badge-large">
                        <Award size={32} />
                        <span>Nv {profile.level}</span>
                    </div>
                    <div className="level-details">
                        <h3>{profile.name || 'Atleta'}</h3>
                        <p>{profile.totalXp} XP total</p>
                    </div>
                </div>
                <div className="level-progress">
                    <ProgressBar value={xpProgress} variant="accent" />
                    <span className="xp-text">{currentLevelXp}/{500} XP para Nível {profile.level + 1}</span>
                </div>
            </motion.div>

            {/* Stats Grid */}
            <section className="section">
                <h2 className="section-title">Estatísticas</h2>
                <div className="stats-grid">
                    <Card className="stat-box">
                        <div className="stat-icon-wrap" style={{ background: 'rgba(249, 115, 22, 0.15)' }}>
                            <Flame size={20} style={{ color: 'var(--accent-400)' }} />
                        </div>
                        <span className="stat-value">{stats.streak}</span>
                        <span className="stat-label">Sequência</span>
                    </Card>
                    <Card className="stat-box">
                        <div className="stat-icon-wrap" style={{ background: 'rgba(124, 58, 237, 0.15)' }}>
                            <Dumbbell size={20} style={{ color: 'var(--primary-400)' }} />
                        </div>
                        <span className="stat-value">{stats.totalWorkouts}</span>
                        <span className="stat-label">Treinos</span>
                    </Card>
                    <Card className="stat-box">
                        <div className="stat-icon-wrap" style={{ background: 'rgba(34, 197, 94, 0.15)' }}>
                            <TrendingUp size={20} style={{ color: 'var(--success-400)' }} />
                        </div>
                        <span className="stat-value">{(stats.totalVolume / 1000).toFixed(1)}t</span>
                        <span className="stat-label">Volume Total</span>
                    </Card>
                    <Card className="stat-box">
                        <div className="stat-icon-wrap" style={{ background: 'rgba(236, 72, 153, 0.15)' }}>
                            <Calendar size={20} style={{ color: '#ec4899' }} />
                        </div>
                        <span className="stat-value">{stats.thisMonth}</span>
                        <span className="stat-label">Este Mês</span>
                    </Card>
                </div>
            </section>

            {/* Volume Chart */}
            <section className="section">
                <h2 className="section-title">Volume Mensal</h2>
                <Card className="chart-card">
                    <div className="chart-container">
                        <ResponsiveContainer width="100%" height={180}>
                            <AreaChart data={monthlyData}>
                                <defs>
                                    <linearGradient id="volumeGradient" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="#7c3aed" stopOpacity={0.3} />
                                        <stop offset="100%" stopColor="#7c3aed" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <XAxis dataKey="day" stroke="#4b5563" fontSize={10} tickLine={false} axisLine={false} />
                                <YAxis stroke="#4b5563" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(v) => `${v / 1000}k`} />
                                <Area type="monotone" dataKey="volume" stroke="#7c3aed" strokeWidth={2} fill="url(#volumeGradient)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </Card>
            </section>

            {/* Badges */}
            <section className="section">
                <div className="section-header">
                    <h2 className="section-title">Conquistas</h2>
                    <span className="badge-count">{unlockedBadges.length}/{badges.length}</span>
                </div>
                <div className="badges-grid">
                    {badges.slice(0, 8).map(badge => {
                        const isUnlocked = unlockedBadges.some(b => b.id === badge.id);
                        return (
                            <motion.div
                                key={badge.id}
                                className={`badge-item ${isUnlocked ? 'unlocked' : 'locked'}`}
                                whileHover={{ scale: 1.05 }}
                            >
                                <span className="badge-icon">{badge.icon}</span>
                                <span className="badge-name">{badge.name}</span>
                                {!isUnlocked && <div className="badge-lock">🔒</div>}
                            </motion.div>
                        );
                    })}
                </div>
            </section>

            {/* Recent Workouts */}
            <section className="section">
                <h2 className="section-title">Histórico Recente</h2>
                {workoutHistory.length > 0 ? (
                    <div className="history-list">
                        {workoutHistory.slice(0, 5).map((workout, i) => (
                            <Card key={workout.id || i} className="history-item">
                                <div className="history-icon">
                                    <Dumbbell size={20} />
                                </div>
                                <div className="history-info">
                                    <span className="history-name">{workout.workoutName || 'Treino'}</span>
                                    <span className="history-meta">
                                        {new Date(workout.completedAt).toLocaleDateString('pt-BR')} • {workout.duration || 0}min
                                    </span>
                                </div>
                                <Badge variant="success">+{workout.xpEarned || 50} XP</Badge>
                            </Card>
                        ))}
                    </div>
                ) : (
                    <Card className="empty-history">
                        <p>Nenhum treino completado ainda</p>
                    </Card>
                )}
            </section>

            <div style={{ height: 100 }} />
        </div>
    );
}
