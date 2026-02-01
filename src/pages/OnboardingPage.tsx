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
    target_weight: 75,
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
          target_weight: data.target_weight,
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

  const getIMCStatus = (imc: number) => {
    if (imc < 18.5) {
      return {
        label: 'Abaixo do peso',
        message: 'Você está abaixo do peso ideal. Considere ganhar peso de forma saudável.',
        color: 'bg-yellow-500/20 border-yellow-500',
        textColor: 'text-yellow-400'
      };
    } else if (imc >= 18.5 && imc < 25) {
      return {
        label: 'Peso ideal',
        message: 'Parabéns! Você está em um peso ideal para sua altura.',
        color: 'bg-green-500/20 border-green-500',
        textColor: 'text-green-400'
      };
    } else if (imc >= 25 && imc < 30) {
      return {
        label: 'Sobrepeso',
        message: 'Você está com sobrepeso. Recomendamos exercitar-se com regularidade.',
        color: 'bg-yellow-500/20 border-yellow-500',
        textColor: 'text-yellow-400'
      };
    } else if (imc >= 30 && imc < 35) {
      return {
        label: 'Obesidade Grau I',
        message: 'Você está com obesidade grau I. Procure orientação de um profissional.',
        color: 'bg-orange-500/20 border-orange-500',
        textColor: 'text-orange-400'
      };
    } else if (imc >= 35 && imc < 40) {
      return {
        label: 'Obesidade Grau II',
        message: 'Você está com obesidade grau II. É importante buscar ajuda profissional.',
        color: 'bg-orange-600/20 border-orange-600',
        textColor: 'text-orange-500'
      };
    } else {
      return {
        label: 'Obesidade Grau III',
        message: 'Você está com obesidade grau III. Procure urgentemente um médico ou nutricionista.',
        color: 'bg-red-500/20 border-red-500',
        textColor: 'text-red-400'
      };
    }
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
            <label className="block text-[#00fff3] font-semibold mb-2">Idade: {data.age} anos</label>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setData({ ...data, age: Math.max(16, data.age - 1) })}
                className="px-4 py-3 bg-[#001317] border-2 border-[#00fff3]/30 text-[#00fff3] rounded-lg hover:border-[#00fff3] transition font-bold text-lg"
              >
                −
              </button>
              <input
                type="number"
                value={data.age === 0 ? '' : data.age}
                onChange={(e) => {
                  const val = e.target.value;
                  if (val === '') {
                    setData({ ...data, age: 0 });
                  } else {
                    const num = parseInt(val, 10);
                    if (!isNaN(num)) {
                      setData({ ...data, age: num });
                    }
                  }
                }}
                onBlur={(e) => {
                  const val = parseInt(e.target.value, 10);
                  if (isNaN(val) || e.target.value === '') {
                    setData({ ...data, age: 16 });
                  } else if (val < 16) {
                    setData({ ...data, age: 16 });
                  } else if (val > 80) {
                    setData({ ...data, age: 80 });
                  }
                }}
                className="flex-1 px-4 py-3 bg-[#001317] border-2 border-[#00fff3]/30 text-white rounded-lg text-center focus:border-[#00fff3] outline-none transition"
              />
              <button
                onClick={() => setData({ ...data, age: Math.min(80, data.age + 1) })}
                className="px-4 py-3 bg-[#001317] border-2 border-[#00fff3]/30 text-[#00fff3] rounded-lg hover:border-[#00fff3] transition font-bold text-lg"
              >
                +
              </button>
            </div>
          </div>

          <div>
            <label className="block text-[#00fff3] font-semibold mb-2">Peso: {data.weight} kg</label>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setData({ ...data, weight: Math.max(30, data.weight - 1) })}
                className="px-4 py-3 bg-[#001317] border-2 border-[#00fff3]/30 text-[#00fff3] rounded-lg hover:border-[#00fff3] transition font-bold text-lg"
              >
                −
              </button>
              <input
                type="number"
                value={data.weight === 0 ? '' : data.weight}
                onChange={(e) => {
                  const val = e.target.value;
                  if (val === '') {
                    setData({ ...data, weight: 0 });
                  } else {
                    const num = parseInt(val, 10);
                    if (!isNaN(num)) {
                      setData({ ...data, weight: num });
                    }
                  }
                }}
                onBlur={(e) => {
                  const val = parseInt(e.target.value, 10);
                  if (isNaN(val) || e.target.value === '') {
                    setData({ ...data, weight: 30 });
                  } else if (val < 30) {
                    setData({ ...data, weight: 30 });
                  } else if (val > 150) {
                    setData({ ...data, weight: 150 });
                  }
                }}
                className="flex-1 px-4 py-3 bg-[#001317] border-2 border-[#00fff3]/30 text-white rounded-lg text-center focus:border-[#00fff3] outline-none transition"
              />
              <button
                onClick={() => setData({ ...data, weight: Math.min(150, data.weight + 1) })}
                className="px-4 py-3 bg-[#001317] border-2 border-[#00fff3]/30 text-[#00fff3] rounded-lg hover:border-[#00fff3] transition font-bold text-lg"
              >
                +
              </button>
            </div>
          </div>

          <div>
            <label className="block text-[#00fff3] font-semibold mb-2">Altura: {data.height} cm</label>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setData({ ...data, height: Math.max(140, data.height - 1) })}
                className="px-4 py-3 bg-[#001317] border-2 border-[#00fff3]/30 text-[#00fff3] rounded-lg hover:border-[#00fff3] transition font-bold text-lg"
              >
                −
              </button>
              <input
                type="number"
                value={data.height === 0 ? '' : data.height}
                onChange={(e) => {
                  const val = e.target.value;
                  if (val === '') {
                    setData({ ...data, height: 0 });
                  } else {
                    const num = parseInt(val, 10);
                    if (!isNaN(num)) {
                      setData({ ...data, height: num });
                    }
                  }
                }}
                onBlur={(e) => {
                  const val = parseInt(e.target.value, 10);
                  if (isNaN(val) || e.target.value === '') {
                    setData({ ...data, height: 140 });
                  } else if (val < 140) {
                    setData({ ...data, height: 140 });
                  } else if (val > 220) {
                    setData({ ...data, height: 220 });
                  }
                }}
                className="flex-1 px-4 py-3 bg-[#001317] border-2 border-[#00fff3]/30 text-white rounded-lg text-center focus:border-[#00fff3] outline-none transition"
              />
              <button
                onClick={() => setData({ ...data, height: Math.min(220, data.height + 1) })}
                className="px-4 py-3 bg-[#001317] border-2 border-[#00fff3]/30 text-[#00fff3] rounded-lg hover:border-[#00fff3] transition font-bold text-lg"
              >
                +
              </button>
            </div>
          </div>

          <div className="p-4 bg-[#001317] rounded-lg border border-[#00fff3]/20">
            <p className="text-[#00fff3] font-semibold mb-3">
              IMC: {calculateIMC(data.weight, data.height)}
            </p>
            {(() => {
              const status = getIMCStatus(calculateIMC(data.weight, data.height));
              return (
                <div className={`p-3 rounded-lg border ${status.color}`}>
                  <p className={`font-semibold ${status.textColor} mb-1`}>
                    {status.label}
                  </p>
                  <p className={`text-sm ${status.textColor}`}>
                    {status.message}
                  </p>
                </div>
              );
            })()}
          </div>
        </div>
      ),
    },
    {
      title: 'Meta de Peso',
      description: 'Qual é seu objetivo de peso?',
      content: (
        <div className="space-y-4">
          <div>
            <label className="block text-[#00fff3] font-semibold mb-2">
              Peso Alvo: {data.target_weight} kg
            </label>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setData({ ...data, target_weight: Math.max(30, data.target_weight! - 1) })}
                className="px-4 py-3 bg-[#001317] border-2 border-[#00fff3]/30 text-[#00fff3] rounded-lg hover:border-[#00fff3] transition font-bold text-lg"
              >
                −
              </button>
              <input
                type="number"
                value={data.target_weight === 0 ? '' : data.target_weight}
                onChange={(e) => {
                  const val = e.target.value;
                  if (val === '') {
                    setData({ ...data, target_weight: 0 });
                  } else {
                    const num = parseInt(val, 10);
                    if (!isNaN(num)) {
                      setData({ ...data, target_weight: num });
                    }
                  }
                }}
                onBlur={(e) => {
                  const val = parseInt(e.target.value, 10);
                  if (isNaN(val) || e.target.value === '') {
                    setData({ ...data, target_weight: 30 });
                  } else if (val < 30) {
                    setData({ ...data, target_weight: 30 });
                  } else if (val > 150) {
                    setData({ ...data, target_weight: 150 });
                  }
                }}
                className="flex-1 px-4 py-3 bg-[#001317] border-2 border-[#00fff3]/30 text-white rounded-lg text-center focus:border-[#00fff3] outline-none transition"
              />
              <button
                onClick={() => setData({ ...data, target_weight: Math.min(150, data.target_weight! + 1) })}
                className="px-4 py-3 bg-[#001317] border-2 border-[#00fff3]/30 text-[#00fff3] rounded-lg hover:border-[#00fff3] transition font-bold text-lg"
              >
                +
              </button>
            </div>
          </div>

          <div className="p-4 bg-[#001317] rounded-lg border border-[#00fff3]/20">
            <p className="text-[#00fff3] font-semibold">
              Diferença: {Math.abs(data.target_weight! - data.weight).toFixed(1)} kg
            </p>
            <p className={`text-sm mt-1 ${data.target_weight! > data.weight ? 'text-blue-400' : data.target_weight! < data.weight ? 'text-red-400' : 'text-green-400'}`}>
              {data.target_weight! > data.weight ? '⬆️ Ganhar peso' : data.target_weight! < data.weight ? '⬇️ Perder peso' : '✓ Peso ideal'}
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
