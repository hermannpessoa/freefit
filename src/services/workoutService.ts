import { supabase } from './supabaseClient';
import type { Exercise, Workout, ProgressLog } from '@/types';

export const workoutService = {
  // Exercise methods
  async getAllExercises(): Promise<Exercise[]> {
    const { data, error } = await supabase
      .from('exercises')
      .select('*')
      .order('name');

    if (error) throw error;
    return data || [];
  },

  async getExercisesByMuscleGroup(muscleGroup: string): Promise<Exercise[]> {
    const { data, error } = await supabase
      .from('exercises')
      .select('*')
      .eq('muscle_group', muscleGroup)
      .order('name');

    if (error) throw error;
    return data || [];
  },

  async searchExercises(query: string): Promise<Exercise[]> {
    const { data, error } = await supabase
      .from('exercises')
      .select('*')
      .ilike('name', `%${query}%`)
      .order('name');

    if (error) throw error;
    return data || [];
  },

  async getExerciseById(id: string): Promise<Exercise | null> {
    const { data, error } = await supabase
      .from('exercises')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  // Workout methods
  async createWorkout(workout: Omit<Workout, 'id' | 'created_at' | 'updated_at'>): Promise<Workout> {
    const { data, error } = await supabase
      .from('workouts')
      .insert([{ ...workout, created_at: new Date().toISOString(), updated_at: new Date().toISOString() }])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async getUserWorkouts(userId: string): Promise<Workout[]> {
    const { data, error } = await supabase
      .from('workouts')
      .select('*')
      .eq('user_id', userId)
      .eq('is_template', false)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async getWorkoutById(id: string): Promise<Workout | null> {
    const { data, error } = await supabase
      .from('workouts')
      .select('*, exercises:workout_exercises(*, exercise:exercises(*))')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  async updateWorkout(id: string, updates: Partial<Workout>): Promise<Workout> {
    const { data, error } = await supabase
      .from('workouts')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async deleteWorkout(id: string): Promise<void> {
    const { error } = await supabase
      .from('workouts')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  async getTemplateWorkouts(): Promise<Workout[]> {
    const { data, error } = await supabase
      .from('workouts')
      .select('*')
      .eq('is_template', true)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async duplicateWorkout(workoutId: string, userId: string): Promise<Workout> {
    const workout = await this.getWorkoutById(workoutId);
    if (!workout) throw new Error('Workout not found');

    const newWorkout = {
      ...workout,
      user_id: userId,
      name: `${workout.name} (Copy)`,
      is_template: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    return this.createWorkout(newWorkout);
  },

  // Progress logging
  async logProgress(progressLog: Omit<ProgressLog, 'id'>): Promise<ProgressLog> {
    const { data, error } = await supabase
      .from('progress_logs')
      .insert([progressLog])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async getUserProgressLogs(userId: string, days: number = 30): Promise<ProgressLog[]> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const { data, error } = await supabase
      .from('progress_logs')
      .select('*')
      .eq('user_id', userId)
      .gte('date', startDate.toISOString())
      .order('date', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async getExerciseProgress(userId: string, exerciseId: string, days: number = 30): Promise<ProgressLog[]> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const { data, error } = await supabase
      .from('progress_logs')
      .select('*')
      .eq('user_id', userId)
      .eq('exercise_id', exerciseId)
      .gte('date', startDate.toISOString())
      .order('date', { ascending: true });

    if (error) throw error;
    return data || [];
  },

  async getTotalVolume(userId: string, days: number = 30): Promise<number> {
    const logs = await this.getUserProgressLogs(userId, days);
    return logs.reduce((total, log) => total + (log.weight * log.reps * log.sets_completed), 0);
  },
};
