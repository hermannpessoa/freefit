import { useNavigate } from 'react-router-dom';
import { ArrowRight, Dumbbell, TrendingUp, Users } from 'lucide-react';

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#001317] via-[#0a2b31] to-[#001317]">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 border-b border-[#00fff3]/20 bg-[#001317]/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="text-2xl font-bold text-[#00fff3]">MyFit</div>
            <div className="flex gap-4">
              <button
                onClick={() => navigate('/login')}
                className="px-4 py-2 text-[#00fff3] hover:bg-[#00fff3]/10 rounded-lg transition"
              >
                Login
              </button>
              <button
                onClick={() => navigate('/signup')}
                className="px-4 py-2 bg-[#00fff3] text-[#001317] rounded-lg font-semibold hover:bg-[#00fff3]/90 transition"
              >
                Começar Grátis
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <div className="inline-block mb-4 px-4 py-2 bg-[#00fff3]/10 border border-[#00fff3]/30 rounded-full">
            <span className="text-[#00fff3] text-sm font-semibold">🚀 Revolução no Fitness</span>
          </div>
          
          <h1 className="text-5xl sm:text-6xl font-bold mb-6 text-white">
            Seu Personal Trainer
            <br />
            <span className="bg-gradient-to-r from-[#00fff3] to-cyan-400 bg-clip-text text-transparent">
              Inteligente
            </span>
          </h1>
          
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Treinos personalizados com IA, acompanhamento de progresso em tempo real e uma comunidade de 600k+ usuários.
            Comece seu transformação hoje mesmo.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <button
              onClick={() => navigate('/signup')}
              className="flex items-center justify-center gap-2 px-8 py-3 bg-[#00fff3] text-[#001317] rounded-lg font-bold text-lg hover:bg-[#00fff3]/90 transition"
            >
              Começar Agora <ArrowRight size={20} />
            </button>
            <button
              className="flex items-center justify-center gap-2 px-8 py-3 border-2 border-[#00fff3] text-[#00fff3] rounded-lg font-bold text-lg hover:bg-[#00fff3]/10 transition"
            >
              Ver Demo
            </button>
          </div>

          {/* Hero Image */}
          <div className="relative mb-12">
            <div className="absolute inset-0 bg-gradient-to-r from-[#00fff3]/20 to-transparent blur-3xl rounded-3xl"></div>
            <div className="relative bg-[#0a2b31] border-2 border-[#00fff3]/30 rounded-3xl p-8 backdrop-blur">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <Dumbbell className="w-12 h-12 text-[#00fff3] mx-auto mb-2" />
                  <p className="text-[#00fff3] font-semibold">500+ Exercícios</p>
                </div>
                <div>
                  <TrendingUp className="w-12 h-12 text-[#00fff3] mx-auto mb-2" />
                  <p className="text-[#00fff3] font-semibold">Progresso Real</p>
                </div>
                <div>
                  <Users className="w-12 h-12 text-[#00fff3] mx-auto mb-2" />
                  <p className="text-[#00fff3] font-semibold">Comunidade Ativa</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-20 px-4 sm:px-6 lg:px-8 border-t border-[#00fff3]/20">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-12 text-white">
            Recursos Incríveis
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="p-6 bg-[#0a2b31] border border-[#00fff3]/20 rounded-xl hover:border-[#00fff3]/50 transition"
              >
                <div className="text-3xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-bold text-white mb-2">{feature.title}</h3>
                <p className="text-gray-400">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Pricing Section */}
      <div className="py-20 px-4 sm:px-6 lg:px-8 border-t border-[#00fff3]/20">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-12 text-white">
            Planos Acessíveis
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {plans.map((plan, index) => (
              <div
                key={index}
                className={`p-8 rounded-xl border-2 transition ${
                  plan.popular
                    ? 'border-[#00fff3] bg-[#00fff3]/10'
                    : 'border-[#00fff3]/20 bg-[#0a2b31]'
                }`}
              >
                {plan.popular && (
                  <div className="inline-block mb-4 px-3 py-1 bg-[#00fff3] text-[#001317] rounded-full text-sm font-bold">
                    Mais Popular
                  </div>
                )}
                <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
                <div className="text-3xl font-bold text-[#00fff3] mb-6">
                  R$ {plan.price}
                  <span className="text-sm text-gray-400">{plan.period}</span>
                </div>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-center gap-2 text-gray-300">
                      <span className="text-[#00fff3]">✓</span>
                      {feature}
                    </li>
                  ))}
                </ul>
                <button
                  className={`w-full py-2 rounded-lg font-bold transition ${
                    plan.popular
                      ? 'bg-[#00fff3] text-[#001317] hover:bg-[#00fff3]/90'
                      : 'border-2 border-[#00fff3] text-[#00fff3] hover:bg-[#00fff3]/10'
                  }`}
                >
                  Escolher
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-20 px-4 sm:px-6 lg:px-8 border-t border-[#00fff3]/20">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-6 text-white">
            Pronto para Transformar?
          </h2>
          <p className="text-xl text-gray-300 mb-8">
            Junte-se a milhares de usuários que já alcançaram seus objetivos com MyFit.
          </p>
          <button
            onClick={() => navigate('/signup')}
            className="inline-flex items-center gap-2 px-8 py-3 bg-[#00fff3] text-[#001317] rounded-lg font-bold text-lg hover:bg-[#00fff3]/90 transition"
          >
            Começar Grátis <ArrowRight size={20} />
          </button>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-[#00fff3]/20 bg-[#0a2b31] py-8 px-4">
        <div className="max-w-7xl mx-auto text-center text-gray-400">
          <p>&copy; 2026 MyFit. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  );
}

const features = [
  {
    icon: '🤖',
    title: 'IA Inteligente',
    description: 'Treinos personalizados gerados por inteligência artificial baseados no seu perfil'
  },
  {
    icon: '📊',
    title: 'Análise Detalhada',
    description: 'Acompanhe seu progresso com gráficos em tempo real e estatísticas detalhadas'
  },
  {
    icon: '🏋️',
    title: '500+ Exercícios',
    description: 'Biblioteca completa com vídeos, animações e instruções passo a passo'
  },
  {
    icon: '⏱️',
    title: 'Treinos Rápidos',
    description: 'Sessões de 20 minutos até 1 hora adaptadas ao seu tempo disponível'
  },
  {
    icon: '👥',
    title: 'Comunidade',
    description: 'Conecte-se com 600k+ usuários, compartilhe progresso e se inspire'
  },
  {
    icon: '⌚',
    title: 'Apple Watch',
    description: 'Sincronize com Apple Health e receba notificações no seu relógio'
  },
];

const plans = [
  {
    name: 'Mensal',
    price: '49,90',
    period: '/mês',
    features: [
      'Treinos ilimitados',
      'Análise de progresso',
      'Biblioteca completa',
      'Comunidade',
    ],
    popular: false,
  },
  {
    name: 'Semestral',
    price: '149,00',
    period: '/6 meses',
    features: [
      'Tudo do Mensal',
      'IA generativa avançada',
      'Exportação de dados',
      'Prioridade no suporte',
    ],
    popular: true,
  },
  {
    name: 'Anual',
    price: '99,00',
    period: '/ano',
    features: [
      'Tudo do Semestral',
      'Integração com Apple Health',
      'Versão Watch',
      'Desafios exclusivos',
    ],
    popular: false,
  },
];
