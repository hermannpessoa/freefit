// User types
export interface User {
  id: string;
  email: string;
  full_name: string;
  age: number;
  gender: 'male' | 'female' | 'other';
  weight: number; // kg
  height: number; // cm
  target_weight?: number; // kg
  imc: number;
  objective: 'weight_loss' | 'muscle_gain' | 'maintenance';
  level: 'beginner' | 'intermediate' | 'advanced';
  gym_type: 'home' | 'gym';
  equipments?: string[];
  available_time: number; // minutes
  created_at: string;
  updated_at: string;
  has_subscription: boolean;
  subscription_tier?: 'monthly' | 'semester' | 'annual';
  subscription_end_date?: string;
}

// Exercise types
export interface Exercise {
  id: string;
  name: string;
  description: string;
  category: string;
  muscle_group: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  equipment: string[];
  video_url?: string;
  gif_url?: string;
  instructions: string[];
  tips: string[];
  created_at: string;
}

// Workout types
export interface WorkoutSet {
  id: string;
  exercise_id: string;
  reps: number;
  weight: number; // kg
  rest_time: number; // seconds
  completed: boolean;
}

export interface WorkoutExercise {
  id: string;
  workout_id: string;
  exercise_id: string;
  order: number;
  sets: WorkoutSet[];
  notes?: string;
}

export interface Workout {
  id: string;
  user_id: string;
  name: string;
  description: string;
  image?: string;
  image_url?: string;
  duration: number; // minutes
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  exercises: WorkoutExercise[];
  rest_days: number[];
  created_at: string;
  updated_at: string;
  is_template: boolean;
  ai_generated?: boolean;
}

// Progress types
export interface ProgressLog {
  id: string;
  user_id: string;
  workout_id: string;
  exercise_id: string;
  date: string;
  sets_completed: number;
  total_sets: number;
  weight: number;
  reps: number;
  duration: number; // minutes
  calories_burned?: number;
}

export interface Achievement {
  id: string;
  user_id: string;
  title: string;
  description: string;
  icon: string;
  unlocked_at: string;
}

// Challenge types
export interface Challenge {
  id: string;
  title: string;
  description: string;
  type: 'daily' | 'weekly' | 'monthly';
  objective: string;
  reward_points: number;
  duration_days: number;
  created_at: string;
}

export interface UserChallenge {
  id: string;
  user_id: string;
  challenge_id: string;
  started_at: string;
  completed_at?: string;
  progress: number; // percentage
}

// Community types
export interface ForumPost {
  id: string;
  user_id: string;
  user_name: string;
  title: string;
  content: string;
  likes: number;
  created_at: string;
  updated_at: string;
}

export interface ForumComment {
  id: string;
  post_id: string;
  user_id: string;
  user_name: string;
  content: string;
  likes: number;
  created_at: string;
}

// Subscription types
export interface SubscriptionPlan {
  id: string;
  name: string;
  price_brl: number;
  duration_months: number;
  features: string[];
}

// Onboarding types
export interface OnboardingData {
  age: number;
  gender: 'male' | 'female' | 'other';
  weight: number;
  height: number;
  target_weight?: number;
  objective: 'weight_loss' | 'muscle_gain' | 'maintenance';
  level: 'beginner' | 'intermediate' | 'advanced';
  gym_type: 'home' | 'gym';
  equipments?: string[];
  available_time: number;
}
