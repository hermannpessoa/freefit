import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import type { Workout, ProgressLog } from '@/types';
import { workoutService } from '@/services/workoutService';
import toast from 'react-hot-toast';
import {
  Plus,
  TrendingUp,
  Zap,
  Settings,
  LogOut,
  BarChart3,
  Trophy,
  Clock,
} from 'lucide-react';

export default function Dashboard() {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalVolume: 0,
    workoutsThisWeek: 0,
    streakDays: 0,
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      if (!user) return;

      const userWorkouts = await workoutService.getUserWorkouts(user.id);
      setWorkouts(userWorkouts);

      const logs = await workoutService.getUserProgressLogs(user.id, 30);

      const volume = await workoutService.getTotalVolume(user.id, 30);
      setStats({
        totalVolume: Math.round(volume),
        workoutsThisWeek: logs.filter((l) => {
          const date = new Date(l.date);
          const weekAgo = new Date();
          weekAgo.setDate(weekAgo.getDate() - 7);
          return date >= weekAgo;
        }).length,
        streakDays: calculateStreak(logs),
      });

      setLoading(false);
    } catch (error: any) {
      toast.error('Erro ao carregar dados');
      setLoading(false);
    }
  };

  const calculateStreak = (logs: ProgressLog[]): number => {
    if (logs.length === 0) return 0;

    const sortedLogs = [...logs].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    let streak = 0;
    let currentDate = new Date();

    for (const log of sortedLogs) {
      const logDate = new Date(log.date);
      logDate.setHours(0, 0, 0, 0);
      currentDate.setHours(0, 0, 0, 0);

      if (logDate.getTime() === currentDate.getTime()) {
        streak++;
        currentDate.setDate(currentDate.getDate() - 1);
      } else if (logDate.getTime() < currentDate.getTime()) {
        break;
      }
    }

    return streak;
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/');
      toast.success('Logout realizado com sucesso!');
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#001317] flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl text-[#00fff3] mb-4">MyFit</div>
          <div className="inline-block">
            <div className="w-12 h-12 border-4 border-[#00fff3]/20 border-t-[#00fff3] rounded-full animate-spin"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#001317] via-[#0a2b31] to-[#001317]">
      {/* Navigation */}
      <nav className="border-b border-[#00fff3]/20 bg-[#0a2b31]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <h1 className="text-2xl font-bold text-[#00fff3]">MyFit</h1>
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/settings')}
                className="p-2 hover:bg-[#00fff3]/10 rounded-lg transition"
                title="Configurações"
              >
                <Settings className="text-[#00fff3]" size={24} />
              </button>
              <button
                onClick={handleSignOut}
                className="p-2 hover:bg-red-500/10 rounded-lg transition"
                title="Sair"
              >
                <LogOut className="text-red-500" size={24} />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome */}
        <div className="mb-8">
          <h2 className="text-4xl font-bold text-white mb-2">
            Bem-vindo, {user?.full_name || 'Usuário'}!
          </h2>
          <p className="text-gray-400">Acompanhe seu progresso e mantenha seu treinamento</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <StatCard
            icon={<BarChart3 className="text-[#00fff3]" />}
            title="Volume Total"
            value={`${stats.totalVolume}kg`}
            subtitle="Últimos 30 dias"
          />
          <StatCard
            icon={<Zap className="text-[#00fff3]" />}
            title="Treinos"
            value={stats.workoutsThisWeek}
            subtitle="Esta semana"
          />
          <StatCard
            icon={<Trophy className="text-[#00fff3]" />}
            title="Sequência"
            value={`${stats.streakDays}d`}
            subtitle="Dias consecutivos"
          />
          <StatCard
            icon={<TrendingUp className="text-[#00fff3]" />}
            title="Total"
            value={workouts.length}
            subtitle="Treinos criados"
          />
        </div>

        {/* Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <button
            onClick={() => navigate('/create-workout')}
            className="p-6 bg-gradient-to-br from-[#00fff3] to-cyan-400 text-[#001317] rounded-xl font-bold text-lg hover:shadow-lg hover:shadow-[#00fff3]/50 transition flex items-center justify-center gap-2"
          >
            <Plus size={24} /> Novo Treino
          </button>
          <button
            onClick={() => navigate('/ai-workout')}
            className="p-6 bg-[#0a2b31] border-2 border-[#00fff3]/50 text-[#00fff3] rounded-xl font-bold text-lg hover:border-[#00fff3] transition flex items-center justify-center gap-2"
          >
            🤖 Gerar com IA
          </button>
        </div>

        {/* Recent Workouts */}
        <div className="bg-[#0a2b31] border-2 border-[#00fff3]/30 rounded-xl p-6 mb-8">
          <h3 className="text-xl font-bold text-white mb-4">Meus Treinos</h3>
          
          {workouts.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-400 mb-4">Você ainda não criou nenhum treino</p>
              <button
                onClick={() => navigate('/create-workout')}
                className="inline-flex items-center gap-2 px-4 py-2 bg-[#00fff3] text-[#001317] rounded-lg font-semibold hover:bg-[#00fff3]/90 transition"
              >
                <Plus size={16} /> Criar Primeiro Treino
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {workouts.slice(0, 5).map((workout) => (
                <div
                  key={workout.id}
                  onClick={() => navigate(`/workout/${workout.id}`)}
                  className="p-4 bg-[#001317] rounded-lg border border-[#00fff3]/20 hover:border-[#00fff3] cursor-pointer transition flex items-center justify-between"
                >
                  <div>
                    <h4 className="text-white font-semibold">{workout.name}</h4>
                    <div className="flex gap-4 text-sm text-gray-400">
                      <span className="flex items-center gap-1">
                        <Clock size={14} /> {workout.duration} min
                      </span>
                      <span>
                        {workout.exercises?.length || 0} exercícios
                      </span>
                    </div>
                  </div>
                  <div className="text-[#00fff3] text-sm font-semibold">
                    {workout.difficulty}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Progress Chart */}
        <div className="bg-[#0a2b31] border-2 border-[#00fff3]/30 rounded-xl p-6">
          <h3 className="text-xl font-bold text-white mb-4">Progresso</h3>
          <div className="text-center py-12">
            <p className="text-gray-400 mb-4">Gráficos de progresso serão exibidos aqui</p>
            <button
              onClick={() => navigate('/progress')}
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#00fff3]/20 text-[#00fff3] rounded-lg hover:bg-[#00fff3]/30 transition"
            >
              <TrendingUp size={16} /> Ver Detalhes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  icon,
  title,
  value,
  subtitle,
}: {
  icon: React.ReactNode;
  title: string;
  value: string | number;
  subtitle: string;
}) {
  return (
    <div className="bg-[#0a2b31] border-2 border-[#00fff3]/30 rounded-xl p-6">
      <div className="flex items-start justify-between mb-2">
        <h3 className="text-gray-400 text-sm font-semibold">{title}</h3>
        {icon}
      </div>
      <div className="text-3xl font-bold text-[#00fff3] mb-1">{value}</div>
      <p className="text-gray-500 text-sm">{subtitle}</p>
    </div>
  );
}
