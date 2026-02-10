import React, { createContext, useContext } from 'react';
import { useAuth, useProfile, useWorkouts, useWorkoutHistory, useProgressRecords, useExercises, useExerciseSettings } from '../hooks/useSupabase-fixed';

const SupabaseContext = createContext(null);

export function SupabaseProvider({ children }) {
  const auth = useAuth();
  const profile = useProfile(auth.user);
  const workouts = useWorkouts(auth.user);
  const history = useWorkoutHistory(auth.user);
  const progress = useProgressRecords(auth.user);
  const exercises = useExercises();
  const exerciseSettings = useExerciseSettings();

  const value = {
    auth,
    profile,
    workouts,
    history,
    progress,
    exercises,
    exerciseSettings,
  };

  return (
    <SupabaseContext.Provider value={value}>
      {children}
    </SupabaseContext.Provider>
  );
}

export function useSupabaseContext() {
  const context = useContext(SupabaseContext);
  if (!context) {
    throw new Error('useSupabaseContext must be used within SupabaseProvider');
  }
  return context;
}
