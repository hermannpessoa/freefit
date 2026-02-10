// Sample workout templates
export const workoutTemplates = [
    {
        id: 'template-push',
        name: 'Push Day',
        description: 'Treino de empurrar: Peito, Ombros e Tríceps',
        category: 'strength',
        difficulty: 'intermediate',
        estimatedDuration: 60,
        muscleGroups: ['chest', 'shoulders', 'arms'],
        exercises: [
            { exerciseId: 'ex001', sets: 4, reps: '8-10', rest: 90 },
            { exerciseId: 'ex002', sets: 3, reps: '10-12', rest: 75 },
            { exerciseId: 'ex011', sets: 4, reps: '8-10', rest: 90 },
            { exerciseId: 'ex012', sets: 3, reps: '12-15', rest: 60 },
            { exerciseId: 'ex020', sets: 3, reps: '12-15', rest: 60 },
            { exerciseId: 'ex021', sets: 3, reps: '10-12', rest: 60 },
        ],
    },
    {
        id: 'template-pull',
        name: 'Pull Day',
        description: 'Treino de puxar: Costas e Bíceps',
        category: 'strength',
        difficulty: 'intermediate',
        estimatedDuration: 55,
        muscleGroups: ['back', 'arms'],
        exercises: [
            { exerciseId: 'ex010', sets: 4, reps: '6-8', rest: 120 },
            { exerciseId: 'ex007', sets: 4, reps: '8-10', rest: 90 },
            { exerciseId: 'ex006', sets: 3, reps: '10-12', rest: 75 },
            { exerciseId: 'ex009', sets: 3, reps: '10-12', rest: 60 },
            { exerciseId: 'ex016', sets: 3, reps: '10-12', rest: 60 },
            { exerciseId: 'ex018', sets: 3, reps: '12-15', rest: 45 },
        ],
    },
    {
        id: 'template-legs',
        name: 'Leg Day',
        description: 'Treino completo de pernas',
        category: 'strength',
        difficulty: 'intermediate',
        estimatedDuration: 65,
        muscleGroups: ['legs'],
        exercises: [
            { exerciseId: 'ex024', sets: 4, reps: '6-8', rest: 180 },
            { exerciseId: 'ex025', sets: 4, reps: '10-12', rest: 90 },
            { exerciseId: 'ex029', sets: 3, reps: '10-12', rest: 90 },
            { exerciseId: 'ex027', sets: 3, reps: '10-12', rest: 60 },
            { exerciseId: 'ex030', sets: 3, reps: '12-15', rest: 60 },
            { exerciseId: 'ex033', sets: 4, reps: '15-20', rest: 45 },
        ],
    },
    {
        id: 'template-fullbody-beginner',
        name: 'Full Body Iniciante',
        description: 'Treino completo para quem está começando',
        category: 'strength',
        difficulty: 'beginner',
        estimatedDuration: 45,
        muscleGroups: ['chest', 'back', 'legs', 'shoulders', 'core'],
        exercises: [
            { exerciseId: 'ex004', sets: 3, reps: '8-12', rest: 60 },
            { exerciseId: 'ex009', sets: 3, reps: '10-12', rest: 60 },
            { exerciseId: 'ex025', sets: 3, reps: '12-15', rest: 90 },
            { exerciseId: 'ex012', sets: 3, reps: '12-15', rest: 45 },
            { exerciseId: 'ex035', sets: 3, reps: '30s', rest: 30 },
        ],
    },
    {
        id: 'template-hiit',
        name: 'HIIT Cardio',
        description: '20 minutos de alta intensidade',
        category: 'cardio',
        difficulty: 'intermediate',
        estimatedDuration: 20,
        muscleGroups: ['cardio', 'core'],
        exercises: [
            { exerciseId: 'ex043', sets: 3, reps: '30s', rest: 15 },
            { exerciseId: 'ex041', sets: 3, reps: '10', rest: 30 },
            { exerciseId: 'ex042', sets: 3, reps: '30s', rest: 15 },
            { exerciseId: 'ex044', sets: 3, reps: '30s', rest: 15 },
            { exerciseId: 'ex045', sets: 3, reps: '12', rest: 30 },
        ],
    },
    {
        id: 'template-core',
        name: 'Core Killer',
        description: 'Treino focado em abdômen e core',
        category: 'strength',
        difficulty: 'intermediate',
        estimatedDuration: 25,
        muscleGroups: ['core'],
        exercises: [
            { exerciseId: 'ex035', sets: 3, reps: '45s', rest: 30 },
            { exerciseId: 'ex036', sets: 3, reps: '20', rest: 30 },
            { exerciseId: 'ex037', sets: 3, reps: '30s cada', rest: 30 },
            { exerciseId: 'ex039', sets: 3, reps: '20', rest: 30 },
            { exerciseId: 'ex040', sets: 3, reps: '12 cada', rest: 30 },
        ],
    },
];

// Goals for onboarding
export const fitnessGoals = [
    { id: 'muscle_gain', name: 'Ganhar Músculo', icon: '💪', description: 'Hipertrofia e força muscular', color: '#8b5cf6' },
    { id: 'weight_loss', name: 'Perder Peso', icon: '⚡', description: 'Queimar gordura e emagrecer', color: '#f97316' },
    { id: 'definition', name: 'Definição', icon: '🎯', description: 'Manter músculo e perder gordura', color: '#22c55e' },
    { id: 'health', name: 'Saúde Geral', icon: '❤️', description: 'Melhorar condicionamento', color: '#ec4899' },
    { id: 'strength', name: 'Força', icon: '🏋️', description: 'Aumentar força máxima', color: '#3b82f6' },
];

// Fitness levels
export const fitnessLevels = [
    { id: 'beginner', name: 'Iniciante', description: 'Nunca treinei ou menos de 6 meses', icon: '🌱' },
    { id: 'intermediate', name: 'Intermediário', description: '6 meses a 2 anos de treino', icon: '🌿' },
    { id: 'advanced', name: 'Avançado', description: 'Mais de 2 anos de experiência', icon: '🌳' },
];

// Equipment options for onboarding
export const equipmentSets = [
    { id: 'none', name: 'Sem Equipamento', description: 'Apenas peso corporal', icon: '🏃' },
    { id: 'home_basic', name: 'Casa - Básico', description: 'Halteres e elásticos', icon: '🏠' },
    { id: 'home_complete', name: 'Casa - Completo', description: 'Halteres, barra, banco', icon: '🏡' },
    { id: 'gym', name: 'Academia', description: 'Acesso a todos equipamentos', icon: '🏋️' },
];

// Days per week options
export const daysPerWeekOptions = [
    { id: 2, name: '2 dias', description: 'Full body 2x/semana' },
    { id: 3, name: '3 dias', description: 'Full body ou ABC' },
    { id: 4, name: '4 dias', description: 'Upper/Lower ou ABCD' },
    { id: 5, name: '5 dias', description: 'Push/Pull/Legs + Upper/Lower' },
    { id: 6, name: '6 dias', description: 'Push/Pull/Legs 2x' },
];

// Time preferences
export const timePreferences = [
    { id: 'morning', name: 'Manhã', description: '5h - 11h', icon: '🌅' },
    { id: 'afternoon', name: 'Tarde', description: '11h - 17h', icon: '☀️' },
    { id: 'evening', name: 'Noite', description: '17h - 22h', icon: '🌙' },
];

// Badges/Achievements
export const badges = [
    { id: 'first_workout', name: 'Primeiro Treino', description: 'Completou seu primeiro treino', icon: '🎯', xp: 50 },
    { id: 'streak_3', name: 'Consistente', description: '3 dias seguidos de treino', icon: '🔥', xp: 75 },
    { id: 'streak_7', name: 'Semana Perfeita', description: '7 dias seguidos', icon: '⭐', xp: 150 },
    { id: 'streak_30', name: 'Mês de Ferro', description: '30 dias seguidos', icon: '🏆', xp: 500 },
    { id: 'workouts_10', name: '10 Treinos', description: 'Completou 10 treinos', icon: '💪', xp: 100 },
    { id: 'workouts_50', name: '50 Treinos', description: 'Completou 50 treinos', icon: '🎖️', xp: 300 },
    { id: 'workouts_100', name: 'Centurião', description: 'Completou 100 treinos', icon: '👑', xp: 500 },
    { id: 'pr_first', name: 'Primeiro PR', description: 'Bateu seu primeiro recorde', icon: '📈', xp: 75 },
    { id: 'pr_10', name: 'Recordista', description: 'Bateu 10 recordes pessoais', icon: '🚀', xp: 200 },
    { id: 'volume_1000', name: '1 Tonelada', description: 'Moveu 1.000kg em volume total', icon: '🏔️', xp: 100 },
    { id: 'volume_10000', name: '10 Toneladas', description: 'Moveu 10.000kg em volume', icon: '⛰️', xp: 250 },
    { id: 'early_bird', name: 'Madrugador', description: 'Treinou antes das 7h', icon: '🐓', xp: 50 },
    { id: 'night_owl', name: 'Coruja', description: 'Treinou depois das 21h', icon: '🦉', xp: 50 },
];

// Subscription plans
export const subscriptionPlans = [
    {
        id: 'monthly',
        name: 'Mensal',
        price: 49.90,
        period: 'mês',
        description: 'Flexibilidade total',
        features: ['Treinos ilimitados', 'Geração IA ilimitada', 'Biblioteca completa', 'Progresso detalhado'],
        popular: false,
    },
    {
        id: 'quarterly',
        name: 'Trimestral',
        price: 129.90,
        originalPrice: 149.70,
        period: '3 meses',
        description: 'Economize 13%',
        features: ['Tudo do mensal', 'Economia de R$ 19,80', 'Suporte prioritário'],
        popular: false,
        discount: 13,
    },
    {
        id: 'annual',
        name: 'Anual',
        price: 399.90,
        originalPrice: 598.80,
        period: 'ano',
        description: 'Melhor valor',
        features: ['Tudo do trimestral', 'Economia de R$ 198,90', 'Acesso antecipado a novidades', 'Badges exclusivos'],
        popular: true,
        discount: 33,
    },
];

export default { workoutTemplates, fitnessGoals, fitnessLevels, equipmentSets, badges, subscriptionPlans };
