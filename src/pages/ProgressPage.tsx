import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import type { ProgressLog } from '@/types';
import { workoutService } from '@/services/workoutService';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import toast from 'react-hot-toast';
import { ChevronLeft, TrendingUp } from 'lucide-react';

export default function ProgressPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [progressLogs, setProgressLogs] = useState<ProgressLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState(30);
  const [chartData, setChartData] = useState<any[]>([]);

  useEffect(() => {
    loadProgress();
  }, [period]);

  const loadProgress = async () => {
    try {
      if (!user) return;

      const logs = await workoutService.getUserProgressLogs(user.id, period);
      setProgressLogs(logs);

      // Prepare chart data
      const data: { [key: string]: any } = {};
      logs.forEach((log) => {
        const date = new Date(log.date).toLocaleDateString('pt-BR');
        if (!data[date]) {
          data[date] = { date, volume: 0, workouts: 0 };
        }
        data[date].volume += log.weight * log.reps * log.sets_completed;
        data[date].workouts += 1;
      });

      setChartData(Object.values(data).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()));
      setLoading(false);
    } catch (error: any) {
      toast.error('Erro ao carregar progresso');
      setLoading(false);
    }
  };

  const stats = {
    totalWorkouts: progressLogs.length,
    totalVolume: Math.round(
      progressLogs.reduce((total, log) => total + log.weight * log.reps * log.sets_completed, 0)
    ),
    avgWorkoutDuration:
      progressLogs.length > 0
        ? Math.round(progressLogs.reduce((total, log) => total + log.duration, 0) / progressLogs.length)
        : 0,
    totalCalories: Math.round(
      progressLogs.reduce((total, log) => total + (log.calories_burned || 0), 0)
    ),
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#001317] via-[#0a2b31] to-[#001317] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#00fff3]/20 border-t-[#00fff3] rounded-full animate-spin"></div>
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
            <button
              onClick={() => navigate('/dashboard')}
              className="flex items-center gap-2 text-[#00fff3] hover:bg-[#00fff3]/10 p-2 rounded-lg transition"
            >
              <ChevronLeft size={24} /> Voltar
            </button>
            <h1 className="text-2xl font-bold text-[#00fff3] flex items-center gap-2">
              <TrendingUp size={28} /> Seu Progresso
            </h1>
            <div className="w-10"></div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <StatCard title="Treinos" value={stats.totalWorkouts} />
          <StatCard title="Volume Total" value={`${stats.totalVolume}kg`} />
          <StatCard title="Duração Média" value={`${stats.avgWorkoutDuration}min`} />
          <StatCard title="Calorias" value={stats.totalCalories} />
        </div>

        {/* Period Selector */}
        <div className="flex gap-2 mb-8">
          {[7, 14, 30, 90].map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-4 py-2 rounded-lg font-semibold transition ${
                period === p
                  ? 'bg-[#00fff3] text-[#001317]'
                  : 'bg-[#0a2b31] border-2 border-[#00fff3]/20 text-[#00fff3] hover:border-[#00fff3]'
              }`}
            >
              {p} dias
            </button>
          ))}
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Volume Chart */}
          <div className="bg-[#0a2b31] border-2 border-[#00fff3]/30 rounded-xl p-6">
            <h3 className="text-xl font-bold text-white mb-4">Volume de Treino</h3>
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#00fff3/20" />
                  <XAxis stroke="#00fff3" />
                  <YAxis stroke="#00fff3" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0a2b31',
                      border: '2px solid #00fff3',
                      borderRadius: '8px',
                    }}
                    labelStyle={{ color: '#00fff3' }}
                  />
                  <Line
                    type="monotone"
                    dataKey="volume"
                    stroke="#00fff3"
                    strokeWidth={3}
                    dot={{ fill: '#00fff3', r: 5 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-gray-400 text-center py-8">Sem dados para este período</p>
            )}
          </div>

          {/* Workout Frequency */}
          <div className="bg-[#0a2b31] border-2 border-[#00fff3]/30 rounded-xl p-6">
            <h3 className="text-xl font-bold text-white mb-4">Frequência de Treinos</h3>
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#00fff3/20" />
                  <XAxis stroke="#00fff3" />
                  <YAxis stroke="#00fff3" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0a2b31',
                      border: '2px solid #00fff3',
                      borderRadius: '8px',
                    }}
                    labelStyle={{ color: '#00fff3' }}
                  />
                  <Bar dataKey="workouts" fill="#00fff3" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-gray-400 text-center py-8">Sem dados para este período</p>
            )}
          </div>
        </div>

        {/* Recent Progress */}
        <div className="bg-[#0a2b31] border-2 border-[#00fff3]/30 rounded-xl p-6">
          <h3 className="text-xl font-bold text-white mb-4">Histórico Recente</h3>
          {progressLogs.length > 0 ? (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {progressLogs.slice(0, 10).map((log, index) => (
                <div
                  key={index}
                  className="p-3 bg-[#001317] rounded-lg border border-[#00fff3]/20 flex items-center justify-between"
                >
                  <div>
                    <p className="text-white font-semibold">
                      {new Date(log.date).toLocaleDateString('pt-BR')}
                    </p>
                    <p className="text-gray-400 text-sm">
                      {log.reps} reps × {log.weight}kg | {log.duration}min
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-[#00fff3] font-bold">
                      {(log.weight * log.reps * log.sets_completed).toFixed(0)}kg
                    </p>
                    {log.calories_burned && (
                      <p className="text-gray-400 text-sm">{log.calories_burned} cal</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-400 text-center py-8">Sem dados de progresso ainda</p>
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value }: { title: string; value: string | number }) {
  return (
    <div className="bg-[#0a2b31] border-2 border-[#00fff3]/30 rounded-xl p-6">
      <p className="text-gray-400 text-sm font-semibold mb-2">{title}</p>
      <p className="text-3xl font-bold text-[#00fff3]">{value}</p>
    </div>
  );
}
