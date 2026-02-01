import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import toast from 'react-hot-toast';

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        await signIn(email, password);
        toast.success('Login realizado com sucesso!');
        navigate('/onboarding');
      } else {
        await signUp(email, password);
        toast.success('Conta criada com sucesso! Verifique seu email.');
        navigate('/onboarding');
      }
    } catch (error: any) {
      toast.error(error.message || 'Erro ao processar solicitação');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#001317] via-[#0a2b31] to-[#001317] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-[#00fff3] mb-2">MyFit</h1>
          <p className="text-gray-400">Seu Personal Trainer Inteligente</p>
        </div>

        {/* Card */}
        <div className="bg-[#0a2b31] border-2 border-[#00fff3]/30 rounded-2xl p-8">
          {/* Tabs */}
          <div className="flex gap-2 mb-6">
            <button
              onClick={() => setIsLogin(true)}
              className={`flex-1 py-2 px-4 rounded-lg font-semibold transition ${
                isLogin
                  ? 'bg-[#00fff3] text-[#001317]'
                  : 'bg-[#001317] text-[#00fff3] border border-[#00fff3]/30'
              }`}
            >
              Login
            </button>
            <button
              onClick={() => setIsLogin(false)}
              className={`flex-1 py-2 px-4 rounded-lg font-semibold transition ${
                !isLogin
                  ? 'bg-[#00fff3] text-[#001317]'
                  : 'bg-[#001317] text-[#00fff3] border border-[#00fff3]/30'
              }`}
            >
              Cadastro
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[#00fff3] font-semibold mb-2">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
                autoComplete="email"
                className="w-full px-4 py-3 rounded-lg bg-[#001317] border-2 border-[#00fff3]/30 text-white placeholder-gray-500 focus:border-[#00fff3] outline-none transition"
                required
              />
            </div>

            <div>
              <label className="block text-[#00fff3] font-semibold mb-2">Senha</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete={isLogin ? "current-password" : "new-password"}
                className="w-full px-4 py-3 rounded-lg bg-[#001317] border-2 border-[#00fff3]/30 text-white placeholder-gray-500 focus:border-[#00fff3] outline-none transition"
                required
              />
            </div>

            {isLogin && (
              <div className="flex justify-end">
                <button type="button" className="text-[#00fff3] text-sm hover:underline">
                  Esqueceu a senha?
                </button>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-[#00fff3] text-[#001317] rounded-lg font-bold hover:bg-[#00fff3]/90 transition disabled:opacity-50"
            >
              {loading ? 'Processando...' : isLogin ? 'Entrar' : 'Criar Conta'}
            </button>
          </form>

          {/* Divider */}
          <div className="my-6 flex items-center gap-4">
            <div className="flex-1 border-t border-[#00fff3]/20"></div>
            <span className="text-gray-500 text-sm">ou</span>
            <div className="flex-1 border-t border-[#00fff3]/20"></div>
          </div>

          {/* Social buttons */}
          <div className="space-y-2">
            <button className="w-full py-2 bg-[#1f2937] rounded-lg text-white font-semibold hover:bg-[#374151] transition flex items-center justify-center gap-2">
              <span>🔷</span> Google
            </button>
            <button className="w-full py-2 bg-[#1f2937] rounded-lg text-white font-semibold hover:bg-[#374151] transition flex items-center justify-center gap-2">
              <span>🍎</span> Apple
            </button>
          </div>
        </div>

        {/* Link to back */}
        <div className="text-center mt-6">
          <button
            onClick={() => navigate('/')}
            className="text-[#00fff3] hover:underline"
          >
            ← Voltar para home
          </button>
        </div>
      </div>
    </div>
  );
}
