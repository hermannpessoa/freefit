import { supabase } from './src/services/supabaseClient';

async function seedExercises() {
  const exercises = [
    {
      name: 'Supino Reto',
      description: 'Exercício de peito com barra',
      category: 'chest',
      difficulty: 'medium',
      instructions: 'Deite-se no banco, segure a barra na altura do peito e empurre para cima',
      equipment: 'Banco e barra',
    },
    {
      name: 'Agachamento',
      description: 'Exercício de pernas composto',
      category: 'legs',
      difficulty: 'medium',
      instructions: 'Em pé, desça como se fosse sentar e suba',
      equipment: 'Peso livre',
    },
    {
      name: 'Flexão',
      description: 'Exercício de peito e braços',
      category: 'chest',
      difficulty: 'easy',
      instructions: 'Em posição de prancha, desça e suba o corpo',
      equipment: 'Peso corporal',
    },
    {
      name: 'Rosca Direta',
      description: 'Exercício de bíceps',
      category: 'arms',
      difficulty: 'easy',
      instructions: 'De pé, levante os halteres até a altura dos ombros',
      equipment: 'Halteres',
    },
    {
      name: 'Corrida',
      description: 'Cardio de alta intensidade',
      category: 'cardio',
      difficulty: 'medium',
      instructions: 'Corra em ritmo constante ou alternado',
      equipment: 'Esteira ou rua',
    },
    {
      name: 'Abdominais',
      description: 'Exercício de core',
      category: 'core',
      difficulty: 'easy',
      instructions: 'Deite-se e levante o tronco em direção aos joelhos',
      equipment: 'Peso corporal',
    },
    {
      name: 'Barra',
      description: 'Exercício de costa e bíceps',
      category: 'back',
      difficulty: 'medium',
      instructions: 'Puxe o corpo em direção à barra',
      equipment: 'Barra horizontal',
    },
    {
      name: 'Rosca Inversa',
      description: 'Exercício de tríceps',
      category: 'arms',
      difficulty: 'easy',
      instructions: 'De pé, abaixe os halteres atrás da cabeça',
      equipment: 'Halteres',
    },
    {
      name: 'Prancha',
      description: 'Exercício estático de core',
      category: 'core',
      difficulty: 'medium',
      instructions: 'Mantenha posição de prancha pelo máximo de tempo',
      equipment: 'Peso corporal',
    },
    {
      name: 'Desenvolvimental',
      description: 'Exercício de ombros',
      category: 'shoulders',
      difficulty: 'medium',
      instructions: 'De pé, levante halteres acima da cabeça',
      equipment: 'Halteres',
    },
  ];

  try {
    const { error } = await supabase
      .from('exercises')
      .insert(exercises);

    if (error) {
      console.error('Error seeding exercises:', error);
    } else {
      console.log('✅ Exercises seeded successfully!');
    }
  } catch (err) {
    console.error('Exception:', err);
  }
}

seedExercises();
