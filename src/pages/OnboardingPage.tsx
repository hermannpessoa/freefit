import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import type { OnboardingData } from '@/types';
import toast from 'react-hot-toast';
import { ChevronRight, ChevronLeft } from 'lucide-react';

const equipments = [
  'Halteres', 'Barra', 'Banco', 'Colchonete', 'Corda de pular', 'Kettle bell',
  'Resistência', 'Bola suíça', 'TRX', 'Polia', 'Legpress', 'Esteira'
];

export default function OnboardingPage() {
  const navigate = useNavigate();
  const { user, updateProfile } = useAuth();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  
  const [data, setData] = useState<OnboardingData>({
    age: 25,
    gender: 'male',
    weight: 75,
    height: 180,
    objective: 'muscle_gain',
    level: 'beginner',
    gym_type: 'gym',
    equipments: [],
    available_time: 60,
  });

  const handleNext = () => {
    if (step < steps.length - 1) {
      setStep(step + 1);
    }
  };

  const handlePrev = () => {
    if (step > 0) {
      setStep(step - 1);
    }
  };

  const handleFinish = async () => {
    setLoading(true);
    try {
      if (user) {
        await updateProfile({
          age: data.age,
          gender: data.gender,
          weight: data.weight,
          height: data.height,
          objective: data.objective,
          level: data.level,
          gym_type: data.gym_type,
          equipments: data.equipments,
          available_time: data.available_time,
        });
        toast.success('Perfil criado com sucesso!');
        navigate('/dashboard');
      }
    } catch (error: any) {
      toast.error(error.message || 'Erro ao salvar perfil');
    } finally {
      setLoading(false);
    }
  };

  const toggleEquipment = (eq: string) => {
    setData({
      ...data,
      equipments: data.equipments?.includes(eq)
        ? data.equipments.filter((e) => e !== eq)
        : [...(data.equipments || []), eq],
    });
  };

  const calculateIMC = (weight: number, height: number) => {
    return Math.round((weight / ((height / 100) ** 2)) * 100) / 100;
  };

  const steps = [
    {
      title: 'Informações Pessoais',
      description: 'Vamos começar com seus dados básicos',
      content: (
        <div className="space-y-4">
          <div>
            <label className="block text-[#00fff3] font-semibold mb-2">Gênero</label>
            <div className="grid grid-cols-3 gap-2">
              {['male', 'female', 'other'].map((gender) => (
                <button
                  key={gender}
                  onClick={() => setData({ ...data, gender: gender as any })}
                  className={`py-3 rounded-lg font-semibold transition ${
                    data.gender === gender
                      ? 'bg-[#00fff3] text-[#001317]'
                      : 'bg-[#001317] border-2 border-[#00fff3]/30 text-[#00fff3]'
                  }`}
                >
                  {gender === 'male' ? '👨 Masculino' : gender === 'female' ? '👩 Feminino' : '⚪ Outro'}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-[#00fff3] font-semibold mb-2">
              Idade: {data.age} anos
            </label>
            <input
              type="range"
              min="16"
              max="80"
              value={data.age}
              onChange={(e) => setData({ ...data, age: parseInt(e.target.value) })}
              className="w-full"
            />
          </div>

          <div>
            <label className="block text-[#00fff3] font-semibold mb-2">
              Peso: {data.weight} kg
            </label>
            <input
              type="range"
              min="30"
              max="150"
              value={data.weight}
              onChange={(e) => setData({ ...data, weight: parseInt(e.target.value) })}
              className="w-full"
            />
          </div>

          <div>
            <label className="block text-[#00fff3] font-semibold mb-2">
              Altura: {data.height} cm
            </label>
            <input
              type="range"
              min="140"
              max="220"
              value={data.height}
              onChange={(e) => setData({ ...data, height: parseInt(e.target.value) })}
              className="w-full"
            />
          </div>

          <div className="p-4 bg-[#001317] rounded-lg border border-[#00fff3]/20">
            <p className="text-[#00fff3] font-semibold">
              IMC: {calculateIMC(data.weight, data.height)}
            </p>
          </div>
        </div>
      ),
    },
    {
      title: 'Objetivo',
      description: 'Qual é seu objetivo principal?',
      content: (
        <div className="space-y-3">
          {[
            { value: 'weight_loss', label: '⚖️ Perder Peso', desc: 'Reduzir gordura corporal' },
            { value: 'muscle_gain', label: '💪 Ganhar Músculos', desc: 'Aumentar massa muscular' },
            { value: 'maintenance', label: '⚡ Manutenção', desc: 'Manter forma atual' },
          ].map((obj) => (
            <button
              key={obj.value}
              onClick={() => setData({ ...data, objective: obj.value as any })}
              className={`w-full p-4 rounded-lg text-left transition border-2 ${
                data.objective === obj.value
                  ? 'border-[#00fff3] bg-[#00fff3]/10'
                  : 'border-[#00fff3]/30 bg-[#001317] hover:border-[#00fff3]'
              }`}
            >
              <div className="font-semibold text-white">{obj.label}</div>
              <div className="text-sm text-gray-400">{obj.desc}</div>
            </button>
          ))}
        </div>
      ),
    },
    {
      title: 'Nível de Experiência',
      description: 'Qual é seu nível de experiência?',
      content: (
        <div className="space-y-3">
          {[
            { value: 'beginner', label: '🟢 Iniciante', desc: 'Pouca ou nenhuma experiência' },
            { value: 'intermediate', label: '🟡 Intermediário', desc: 'Treino há alguns meses' },
            { value: 'advanced', label: '🔴 Avançado', desc: 'Treino há vários anos' },
          ].map((level) => (
            <button
              key={level.value}
              onClick={() => setData({ ...data, level: level.value as any })}
              className={`w-full p-4 rounded-lg text-left transition border-2 ${
                data.level === level.value
                  ? 'border-[#00fff3] bg-[#00fff3]/10'
                  : 'border-[#00fff3]/30 bg-[#001317] hover:border-[#00fff3]'
              }`}
            >
              <div className="font-semibold text-white">{level.label}</div>
              <div className="text-sm text-gray-400">{level.desc}</div>
            </button>
          ))}
        </div>
      ),
    },
    {
      title: 'Local de Treino',
      description: 'Onde você vai treinar?',
      content: (
        <div className="space-y-3">
          {[
            { value: 'home', label: '🏠 Casa', desc: 'Treino em casa' },
            { value: 'gym', label: '🏋️ Academia', desc: 'Treino em academia' },
          ].map((loc) => (
            <button
              key={loc.value}
              onClick={() => setData({ ...data, gym_type: loc.value as any, equipments: loc.value === 'gym' ? [] : data.equipments })}
              className={`w-full p-4 rounded-lg text-left transition border-2 ${
                data.gym_type === loc.value
                  ? 'border-[#00fff3] bg-[#00fff3]/10'
                  : 'border-[#00fff3]/30 bg-[#001317] hover:border-[#00fff3]'
              }`}
            >
              <div className="font-semibold text-white">{loc.label}</div>
              <div className="text-sm text-gray-400">{loc.desc}</div>
            </button>
          ))}
        </div>
      ),
    },
    ...(data.gym_type === 'home' ? [{
      title: 'Equipamentos',
      description: 'Quais equipamentos você tem?',
      content: (
        <div className="grid grid-cols-2 gap-2">
          {equipments.map((eq) => (
            <button
              key={eq}
              onClick={() => toggleEquipment(eq)}
              className={`p-3 rounded-lg font-semibold transition ${
                data.equipments?.includes(eq)
                  ? 'bg-[#00fff3] text-[#001317]'
                  : 'bg-[#001317] border-2 border-[#00fff3]/30 text-[#00fff3]'
              }`}
            >
              {eq}
            </button>
          ))}
        </div>
      ),
    }] : []),
    {
      title: 'Tempo Disponível',
      description: 'Quanto tempo você tem para treinar por dia?',
      content: (
        <div className="space-y-4">
          <div>
            <label className="block text-[#00fff3] font-semibold mb-2">
              {data.available_time} minutos por dia
            </label>
            <input
              type="range"
              min="20"
              max="180"
              step="10"
              value={data.available_time}
              onChange={(e) => setData({ ...data, available_time: parseInt(e.target.value) })}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-400 mt-2">
              <span>20 min</span>
              <span>180 min</span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {[20, 45, 60, 90, 120, 180].map((time) => (
              <button
                key={time}
                onClick={() => setData({ ...data, available_time: time })}
                className={`py-2 rounded-lg text-sm font-semibold transition ${
                  data.available_time === time
                    ? 'bg-[#00fff3] text-[#001317]'
                    : 'bg-[#001317] border-2 border-[#00fff3]/30 text-[#00fff3]'
                }`}
              >
                {time}m
              </button>
            ))}
          </div>
        </div>
      ),
    },
  ];

  const CurrentStep = steps[step];

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#001317] via-[#0a2b31] to-[#001317] flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-2xl">
        {/* Progress */}
        <div className="mb-8">
          <div className="flex justify-between mb-2">
            <span className="text-[#00fff3] font-semibold">
              Etapa {step + 1} de {steps.length}
            </span>
            <span className="text-gray-400">{Math.round(((step + 1) / steps.length) * 100)}%</span>
          </div>
          <div className="w-full bg-[#001317] rounded-full h-2 border border-[#00fff3]/20">
            <div
              className="bg-[#00fff3] h-full rounded-full transition-all duration-300"
              style={{ width: `${((step + 1) / steps.length) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Card */}
        <div className="bg-[#0a2b31] border-2 border-[#00fff3]/30 rounded-2xl p-8">
          <h1 className="text-3xl font-bold text-white mb-2">{CurrentStep.title}</h1>
          <p className="text-gray-400 mb-6">{CurrentStep.description}</p>

          {/* Content */}
          <div className="mb-8">{CurrentStep.content}</div>

          {/* Buttons */}
          <div className="flex gap-3">
            <button
              onClick={handlePrev}
              disabled={step === 0}
              className="flex-1 py-3 border-2 border-[#00fff3]/30 text-[#00fff3] rounded-lg font-semibold hover:border-[#00fff3] disabled:opacity-50 transition flex items-center justify-center gap-2"
            >
              <ChevronLeft size={20} /> Voltar
            </button>

            {step < steps.length - 1 ? (
              <button
                onClick={handleNext}
                className="flex-1 py-3 bg-[#00fff3] text-[#001317] rounded-lg font-semibold hover:bg-[#00fff3]/90 transition flex items-center justify-center gap-2"
              >
                Próximo <ChevronRight size={20} />
              </button>
            ) : (
              <button
                onClick={handleFinish}
                disabled={loading}
                className="flex-1 py-3 bg-[#00fff3] text-[#001317] rounded-lg font-semibold hover:bg-[#00fff3]/90 disabled:opacity-50 transition"
              >
                {loading ? 'Finalizando...' : 'Finalizar'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
