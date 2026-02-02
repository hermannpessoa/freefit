import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import toast from 'react-hot-toast';
import { ChevronLeft, AlertCircle, Trash2 } from 'lucide-react';

export default function SettingsPage() {
  const navigate = useNavigate();
  const { user, updateProfile, deleteAccount } = useAuth();
  const [loading, setLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [formData, setFormData] = useState({
    full_name: user?.full_name || '',
    age: user?.age || 0,
    weight: user?.weight || 0,
    height: user?.height || 0,
  });

  const handleUpdateProfile = async () => {
    setLoading(true);
    try {
      await updateProfile(formData);
      toast.success('Perfil atualizado com sucesso!');
    } catch (error: any) {
      toast.error(error.message || 'Erro ao atualizar perfil');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== 'DELETAR MINHA CONTA') {
      toast.error('Confirme digitando o texto exato');
      return;
    }

    setLoading(true);
    try {
      await deleteAccount();
      toast.success('Conta deletada com sucesso');
      // Forçar navegação para landing page
      window.location.href = '/';
    } catch (error: any) {
      toast.error(error.message || 'Erro ao deletar conta');
      // Mesmo com erro, tentar navegar pra fora
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#001317] via-[#0a2b31] to-[#001317]">
      {/* Navigation */}
      <nav className="border-b border-[#00fff3]/20 bg-[#0a2b31]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16">
            <button
              onClick={() => navigate('/dashboard')}
              className="flex items-center gap-2 text-[#00fff3] hover:bg-[#00fff3]/10 p-2 rounded-lg transition"
            >
              <ChevronLeft size={24} /> Voltar
            </button>
            <h1 className="text-2xl font-bold text-[#00fff3] ml-4">Configurações</h1>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Profile Settings */}
        <div className="bg-[#0a2b31] border-2 border-[#00fff3]/30 rounded-xl p-6 mb-8">
          <h2 className="text-2xl font-bold text-white mb-6">Perfil</h2>

          <div className="space-y-4">
            <div>
              <label className="block text-[#00fff3] font-semibold mb-2">Nome Completo</label>
              <input
                type="text"
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                className="w-full px-4 py-3 bg-[#001317] border-2 border-[#00fff3]/20 text-white rounded-lg focus:border-[#00fff3] outline-none transition"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-[#00fff3] font-semibold mb-2">Idade</label>
                <input
                  type="number"
                  value={formData.age}
                  onChange={(e) => setFormData({ ...formData, age: parseInt(e.target.value) })}
                  className="w-full px-4 py-3 bg-[#001317] border-2 border-[#00fff3]/20 text-white rounded-lg focus:border-[#00fff3] outline-none transition"
                />
              </div>

              <div>
                <label className="block text-[#00fff3] font-semibold mb-2">Peso (kg)</label>
                <input
                  type="number"
                  step="0.5"
                  value={formData.weight}
                  onChange={(e) => setFormData({ ...formData, weight: parseFloat(e.target.value) })}
                  className="w-full px-4 py-3 bg-[#001317] border-2 border-[#00fff3]/20 text-white rounded-lg focus:border-[#00fff3] outline-none transition"
                />
              </div>

              <div>
                <label className="block text-[#00fff3] font-semibold mb-2">Altura (cm)</label>
                <input
                  type="number"
                  value={formData.height}
                  onChange={(e) => setFormData({ ...formData, height: parseInt(e.target.value) })}
                  className="w-full px-4 py-3 bg-[#001317] border-2 border-[#00fff3]/20 text-white rounded-lg focus:border-[#00fff3] outline-none transition"
                />
              </div>
            </div>

            <button
              onClick={handleUpdateProfile}
              disabled={loading}
              className="w-full py-3 bg-[#00fff3] text-[#001317] rounded-lg font-bold hover:bg-[#00fff3]/90 disabled:opacity-50 transition"
            >
              {loading ? 'Salvando...' : 'Salvar Alterações'}
            </button>
          </div>
        </div>

        {/* Subscription Settings */}
        <div className="bg-[#0a2b31] border-2 border-[#00fff3]/30 rounded-xl p-6 mb-8">
          <h2 className="text-2xl font-bold text-white mb-6">Assinatura</h2>

          <div className="p-4 bg-[#001317] rounded-lg border border-[#00fff3]/20 mb-4">
            <p className="text-gray-400 mb-2">Plano Atual</p>
            <div className="text-[#00fff3] font-bold text-lg mb-4">
              {user?.subscription_tier === 'monthly'
                ? 'Mensal - R$ 49,90'
                : user?.subscription_tier === 'semester'
                ? 'Semestral - R$ 149,00'
                : user?.subscription_tier === 'annual'
                ? 'Anual - R$ 99,00'
                : 'Plano Gratuito'}
            </div>

            {user?.subscription_end_date && (
              <p className="text-gray-400 text-sm">
                Válido até: {new Date(user.subscription_end_date).toLocaleDateString('pt-BR')}
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { name: 'Mensal', price: 'R$ 49,90', period: '/mês' },
              { name: 'Semestral', price: 'R$ 149,00', period: '/6 meses' },
              { name: 'Anual', price: 'R$ 99,00', period: '/ano' },
            ].map((plan) => (
              <div
                key={plan.name}
                className="p-4 rounded-lg border-2 border-[#00fff3]/30 hover:border-[#00fff3] transition"
              >
                <div className="font-semibold text-white mb-2">{plan.name}</div>
                <div className="text-[#00fff3] font-bold mb-2">
                  {plan.price}
                  <span className="text-sm text-gray-400">{plan.period}</span>
                </div>
                <button className="w-full py-2 bg-[#00fff3] text-[#001317] rounded font-semibold hover:bg-[#00fff3]/90 transition">
                  Escolher
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Integrations */}
        <div className="bg-[#0a2b31] border-2 border-[#00fff3]/30 rounded-xl p-6 mb-8">
          <h2 className="text-2xl font-bold text-white mb-6">Integrações</h2>

          <div className="space-y-3">
            <div className="p-4 bg-[#001317] rounded-lg border border-[#00fff3]/20 flex items-center justify-between">
              <div>
                <p className="text-white font-semibold">Apple Health</p>
                <p className="text-gray-400 text-sm">Sincronize seus dados com Apple Health</p>
              </div>
              <button className="px-4 py-2 bg-[#00fff3]/20 text-[#00fff3] rounded-lg hover:bg-[#00fff3]/30 transition">
                Conectar
              </button>
            </div>

            <div className="p-4 bg-[#001317] rounded-lg border border-[#00fff3]/20 flex items-center justify-between">
              <div>
                <p className="text-white font-semibold">Apple Watch</p>
                <p className="text-gray-400 text-sm">Controle treinos no seu relógio</p>
              </div>
              <button className="px-4 py-2 bg-[#00fff3]/20 text-[#00fff3] rounded-lg hover:bg-[#00fff3]/30 transition">
                Conectar
              </button>
            </div>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="bg-red-500/10 border-2 border-red-500/30 rounded-xl p-6">
          <div className="flex items-start gap-3 mb-4">
            <AlertCircle className="text-red-500 flex-shrink-0" size={24} />
            <div>
              <h2 className="text-2xl font-bold text-white mb-2">Zona de Perigo</h2>
              <p className="text-gray-400">Ações irreversíveis</p>
            </div>
          </div>

          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="w-full py-3 bg-red-500/20 text-red-500 rounded-lg font-bold hover:bg-red-500/30 transition flex items-center justify-center gap-2"
          >
            <Trash2 size={20} /> Deletar Conta
          </button>

          {/* Delete Confirmation */}
          {showDeleteConfirm && (
            <div className="mt-6 p-6 bg-[#001317] rounded-lg border-2 border-red-500/50">
              <h3 className="text-red-500 font-bold text-lg mb-4">
                Tem certeza que deseja deletar sua conta?
              </h3>

              <div className="bg-red-500/10 border border-red-500/20 rounded p-3 mb-4">
                <p className="text-gray-300 text-sm">
                  ⚠️ Esta ação é irreversível. Todos seus dados, treinos e progresso serão deletados permanentemente.
                </p>
              </div>

              <div className="mb-4">
                <label className="block text-gray-400 font-semibold mb-2">
                  Digite "DELETAR MINHA CONTA" para confirmar:
                </label>
                <input
                  type="text"
                  value={deleteConfirmText}
                  onChange={(e) => setDeleteConfirmText(e.target.value)}
                  placeholder="DELETAR MINHA CONTA"
                  className="w-full px-4 py-3 bg-[#0a2b31] border-2 border-red-500/30 text-white rounded-lg focus:border-red-500 outline-none transition"
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowDeleteConfirm(false);
                    setDeleteConfirmText('');
                  }}
                  className="flex-1 py-3 bg-[#00fff3]/20 text-[#00fff3] rounded-lg font-bold hover:bg-[#00fff3]/30 transition"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleDeleteAccount}
                  disabled={deleteConfirmText !== 'DELETAR MINHA CONTA' || loading}
                  className="flex-1 py-3 bg-red-500/20 text-red-500 rounded-lg font-bold hover:bg-red-500/30 disabled:opacity-50 transition"
                >
                  {loading ? 'Deletando...' : 'Deletar Permanentemente'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
