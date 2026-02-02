import { supabase } from './supabaseClient';
import type { Exercise, Workout, ProgressLog, ExerciseAlternative } from '@/types';

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

  async getExerciseByName(name: string): Promise<Exercise | null> {
    const { data, error } = await supabase
      .from('exercises')
      .select()
      .ilike('name', name)
      .single();

    if (error && error.code !== 'PGRST116') {
      // PGRST116 = no rows returned, which is fine
      throw error;
    }
    return data || null;
  },

  async createOrUpdateExercise(exerciseData: Partial<Exercise> & { name: string }): Promise<Exercise> {
    // Buscar exercício existente
    let existingExercise: Exercise | null = null;
    try {
      existingExercise = await this.getExerciseByName(exerciseData.name);
    } catch (error) {
      console.warn(`Failed to fetch exercise "${exerciseData.name}":`, error);
      // Continue anyway - we'll try to create or return a client-side exercise
    }

    if (existingExercise) {
      // Atualizar se tiver gif_url nova
      if (exerciseData.image_url && !existingExercise.gif_url) {
        const { data, error } = await supabase
          .from('exercises')
          .update({ gif_url: exerciseData.image_url })
          .eq('id', existingExercise.id)
          .select()
          .single();

        if (error) {
          console.warn('Failed to update exercise image:', error);
          return existingExercise;
        }
        return data;
      }
      return existingExercise;
    }

    // Criar novo exercício
    const { data, error } = await supabase
      .from('exercises')
      .insert([{
        name: exerciseData.name,
        description: exerciseData.description || '',
        category: exerciseData.category || 'ai_generated',
        muscle_group: exerciseData.muscle_group || 'general',
        difficulty: exerciseData.difficulty || 'beginner',
        equipment: exerciseData.equipment || [],
        gif_url: exerciseData.image_url,
        instructions: exerciseData.instructions || [],
        tips: exerciseData.tips || [],
      }])
      .select()
      .single();

    // If insert fails due to RLS or other permission issues, return a client-side exercise object
    if (error) {
      console.warn(`Failed to create exercise "${exerciseData.name}":`, error);
      return {
        id: `temp_${Date.now()}_${Math.random()}`,
        name: exerciseData.name,
        description: exerciseData.description || '',
        category: exerciseData.category || 'ai_generated',
        muscle_group: exerciseData.muscle_group || 'general',
        difficulty: exerciseData.difficulty as any || 'beginner',
        equipment: exerciseData.equipment || [],
        gif_url: exerciseData.image_url,
        instructions: exerciseData.instructions || [],
        tips: exerciseData.tips || [],
        created_at: new Date().toISOString(),
      };
    }
    
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
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    
    if (!data) return null;

    // Buscar exercícios do treino
    const { data: exercises, error: exError } = await supabase
      .from('workout_exercises')
      .select('*, exercise:exercises(*)')
      .eq('workout_id', id);

    if (exError) throw exError;

    return {
      ...data,
      exercises: exercises || [],
    } as Workout;
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

  // Exercise Alternatives
  async createExerciseAlternatives(
    exerciseId: string,
    alternatives: Array<{ name: string; reason: string }>
  ): Promise<ExerciseAlternative[]> {
    const { data, error } = await supabase
      .from('exercise_alternatives')
      .insert(
        alternatives.map(alt => ({
          exercise_id: exerciseId,
          name: alt.name,
          reason: alt.reason,
        }))
      )
      .select();

    if (error) throw error;
    return data || [];
  },

  async getExerciseAlternatives(exerciseId: string): Promise<ExerciseAlternative[]> {
    const { data, error } = await supabase
      .from('exercise_alternatives')
      .select('*')
      .eq('exercise_id', exerciseId)
      .order('created_at');

    if (error) throw error;
    return data || [];
  },

  async getAlternativeById(id: string): Promise<ExerciseAlternative | null> {
    const { data, error } = await supabase
      .from('exercise_alternatives')
      .select('*')
      .eq('id', id)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data || null;
  },

  async updateWorkoutExerciseAlternative(
    workoutExerciseId: string,
    selectedAlternativeId: string | null
  ): Promise<void> {
    const { error } = await supabase
      .from('workout_exercises')
      .update({ selected_alternative_id: selectedAlternativeId })
      .eq('id', workoutExerciseId);

    if (error) throw error;
  },

  async markWorkoutExerciseAsCompleted(
    workoutExerciseId: string,
    completed: boolean
  ): Promise<void> {
    const { error } = await supabase
      .from('workout_exercises')
      .update({ completed })
      .eq('id', workoutExerciseId);

    if (error) throw error;
  },
};
