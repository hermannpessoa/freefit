import { useEffect, useState, useRef } from 'react';
import { supabase } from '../lib/supabase';

export function useAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    const initAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setUser(session?.user ?? null);
      } catch (err) {
        console.error('Error getting session:', err);
      } finally {
        setLoading(false);
      }
    };

    initAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
      }
    );

    return () => subscription?.unsubscribe();
  }, []);

  const login = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    return { data, error };
  };

  const signup = async (email, password) => {
    const { data, error } = await supabase.auth.signUp({ email, password });
    return { data, error };
  };

  const logout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  };

  const socialLogin = async (provider, options) => {
    const { data, error } = await supabase.auth.signInWithOAuth({ provider, options });
    return { data, error };
  };

  const deleteAccount = async () => {
    if (!user) throw new Error('No user logged in');
    
    // Delete user data from database tables
    await supabase.from('progress_records').delete().eq('user_id', user.id);
    await supabase.from('workout_history').delete().eq('user_id', user.id);
    await supabase.from('workouts').delete().eq('user_id', user.id);
    await supabase.from('profiles').delete().eq('id', user.id);
    
    // Delete auth user
    const { error } = await supabase.auth.admin.deleteUser(user.id);
    if (error) throw error;
  };

  return { user, loading, login, signup, logout, socialLogin, deleteAccount };
}

export function useProfile(user) {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const hasLoadedRef = useRef(false);
  const isLoadingRef = useRef(false);
  const currentUserIdRef = useRef(null);

  useEffect(() => {
    if (!user) {
      setProfile(null);
      setLoading(false);
      hasLoadedRef.current = false;
      currentUserIdRef.current = null;
      return;
    }

    // Prevent duplicate loads for same user
    if (currentUserIdRef.current === user.id && hasLoadedRef.current) {
      console.log('⚠️ useProfile: Já carregado para este usuário');
      return;
    }

    // Prevent concurrent loads
    if (isLoadingRef.current) {
      console.log('⚠️ useProfile: Já está carregando, ignorando');
      return;
    }

    const fetchProfile = async () => {
      isLoadingRef.current = true;
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .maybeSingle();

        if (error) {
          console.error('Error fetching profile:', error);
        } else if (!data) {
          // Profile doesn't exist, create it
          const { data: newProfile, error: insertError } = await supabase
            .from('profiles')
            .insert([{
              id: user.id,
              email: user.email,
              onboarding_completed: false
            }])
            .select()
            .single();

          if (insertError && insertError.code !== '23505') {
            // Ignore duplicate key errors (23505), profile already exists
            console.error('Error creating profile:', insertError);
          } else if (newProfile) {
            setProfile(newProfile);
          }
        } else {
          setProfile(data);
        }
      } finally {
        setLoading(false);
        isLoadingRef.current = false;
        hasLoadedRef.current = true;
        currentUserIdRef.current = user.id;
      }
    };

    fetchProfile();

    const subscription = supabase
      .channel(`profile:${user.id}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'profiles', filter: `id=eq.${user.id}` },
        (payload) => setProfile(payload.new)
      )
      .subscribe();

    return () => subscription.unsubscribe();
  }, [user]);

  const updateProfile = async (updates) => {
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', user.id)
      .select()
      .single();

    if (!error) setProfile(data);
    return { data, error };
  };

  return { profile, loading, updateProfile };
}

export function useWorkouts(user) {
  const [workouts, setWorkouts] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const hasLoadedRef = useRef(false);
  const isLoadingRef = useRef(false);
  const currentUserIdRef = useRef(null);

  useEffect(() => {
    if (!user) {
      setWorkouts([]);
      setTemplates([]);
      setLoading(false);
      hasLoadedRef.current = false;
      currentUserIdRef.current = null;
      return;
    }

    // Prevent duplicate loads for same user
    if (currentUserIdRef.current === user.id && hasLoadedRef.current) {
      console.log('⚠️ useWorkouts: Já carregado para este usuário');
      return;
    }

    // Prevent concurrent loads
    if (isLoadingRef.current) {
      console.log('⚠️ useWorkouts: Já está carregando, ignorando');
      return;
    }

    const fetchWorkouts = async () => {
      isLoadingRef.current = true;
      try {
        // Fetch user workouts
        const { data: userWorkouts, error: workoutsError } = await supabase
          .from('workouts')
          .select('*')
          .eq('user_id', user.id);

        if (!workoutsError) {
          setWorkouts(userWorkouts || []);
        }

        // Fetch templates (public workouts)
        const { data: templateData, error: templatesError } = await supabase
          .from('workouts')
          .select('*')
          .eq('is_template', true);

        if (!templatesError) {
          setTemplates(templateData || []);
        }
      } finally {
        setLoading(false);
        isLoadingRef.current = false;
        hasLoadedRef.current = true;
        currentUserIdRef.current = user.id;
      }
    };

    fetchWorkouts();

    // Subscribe to user workouts changes
    const workoutsSubscription = supabase
      .channel(`workouts:${user.id}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'workouts', filter: `user_id=eq.${user.id}` },
        (payload) => {
          if (payload.eventType === 'DELETE') {
            setWorkouts(w => w.filter(wo => wo.id !== payload.old.id));
          } else {
            setWorkouts(w => {
              const existing = w.findIndex(wo => wo.id === payload.new.id);
              if (existing >= 0) {
                w[existing] = payload.new;
              } else {
                w.push(payload.new);
              }
              return [...w];
            });
          }
        }
      )
      .subscribe();

    // Subscribe to templates changes
    const templatesSubscription = supabase
      .channel('templates')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'workouts', filter: 'is_template=eq.true' },
        (payload) => {
          if (payload.eventType === 'DELETE') {
            setTemplates(t => t.filter(temp => temp.id !== payload.old.id));
          } else {
            setTemplates(t => {
              const existing = t.findIndex(temp => temp.id === payload.new.id);
              if (existing >= 0) {
                t[existing] = payload.new;
              } else {
                t.push(payload.new);
              }
              return [...t];
            });
          }
        }
      )
      .subscribe();

    return () => {
      workoutsSubscription.unsubscribe();
      templatesSubscription.unsubscribe();
    };
  }, [user]);

  const createWorkout = async (workout) => {
    const { data, error } = await supabase
      .from('workouts')
      .insert([{ ...workout, user_id: user.id }])
      .select()
      .single();
    return { data, error };
  };

  const deleteWorkout = async (id) => {
    const { error } = await supabase
      .from('workouts')
      .delete()
      .eq('id', id);
    return { error };
  };

  const updateWorkout = async (id, updates) => {
    const { data, error } = await supabase
      .from('workouts')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    return { data, error };
  };

  return { workouts, templates, loading, createWorkout, deleteWorkout, updateWorkout };
}

export function useWorkoutHistory(user) {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const hasLoadedRef = useRef(false);
  const isLoadingRef = useRef(false);
  const currentUserIdRef = useRef(null);

  useEffect(() => {
    if (!user) {
      setHistory([]);
      setLoading(false);
      hasLoadedRef.current = false;
      currentUserIdRef.current = null;
      return;
    }

    // Prevent duplicate loads for same user
    if (currentUserIdRef.current === user.id && hasLoadedRef.current) {
      console.log('⚠️ useWorkoutHistory: Já carregado para este usuário');
      return;
    }

    // Prevent concurrent loads
    if (isLoadingRef.current) {
      console.log('⚠️ useWorkoutHistory: Já está carregando, ignorando');
      return;
    }

    const fetchHistory = async () => {
      isLoadingRef.current = true;
      try {
        const { data, error } = await supabase
          .from('workout_history')
          .select('*')
          .eq('user_id', user.id)
          .order('completed_at', { ascending: false });

        if (!error) {
          setHistory(data || []);
        }
      } finally {
        setLoading(false);
        isLoadingRef.current = false;
        hasLoadedRef.current = true;
        currentUserIdRef.current = user.id;
      }
    };

    fetchHistory();

    const subscription = supabase
      .channel(`history:${user.id}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'workout_history', filter: `user_id=eq.${user.id}` },
        (payload) => {
          if (payload.eventType === 'DELETE') {
            setHistory(h => h.filter(item => item.id !== payload.old.id));
          } else {
            setHistory(h => [payload.new, ...h.filter(item => item.id !== payload.new.id)]);
          }
        }
      )
      .subscribe();

    return () => subscription.unsubscribe();
  }, [user]);

  const addToHistory = async (record) => {
    const { data, error } = await supabase
      .from('workout_history')
      .insert([{ ...record, user_id: user.id }])
      .select()
      .single();
    return { data, error };
  };

  return { history, loading, addToHistory };
}

export function useProgressRecords(user) {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const hasLoadedRef = useRef(false);
  const isLoadingRef = useRef(false);
  const currentUserIdRef = useRef(null);

  useEffect(() => {
    if (!user) {
      setRecords([]);
      setLoading(false);
      hasLoadedRef.current = false;
      currentUserIdRef.current = null;
      return;
    }

    // Prevent duplicate loads for same user
    if (currentUserIdRef.current === user.id && hasLoadedRef.current) {
      console.log('⚠️ useProgressRecords: Já carregado para este usuário');
      return;
    }

    // Prevent concurrent loads
    if (isLoadingRef.current) {
      console.log('⚠️ useProgressRecords: Já está carregando, ignorando');
      return;
    }

    const fetchRecords = async () => {
      isLoadingRef.current = true;
      try {
        const { data, error } = await supabase
          .from('progress_records')
          .select('*')
          .eq('user_id', user.id)
          .order('recorded_at', { ascending: false });

        if (!error) {
          setRecords(data || []);
        }
      } finally {
        setLoading(false);
        isLoadingRef.current = false;
        hasLoadedRef.current = true;
        currentUserIdRef.current = user.id;
      }
    };

    fetchRecords();

    const subscription = supabase
      .channel(`progress:${user.id}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'progress_records', filter: `user_id=eq.${user.id}` },
        (payload) => {
          if (payload.eventType === 'DELETE') {
            setRecords(r => r.filter(item => item.id !== payload.old.id));
          } else {
            setRecords(r => [payload.new, ...r.filter(item => item.id !== payload.new.id)]);
          }
        }
      )
      .subscribe();

    return () => subscription.unsubscribe();
  }, [user]);

  const addProgress = async (record) => {
    const { data, error } = await supabase
      .from('progress_records')
      .insert([{ ...record, user_id: user.id }])
      .select()
      .single();
    return { data, error };
  };

  return { records, loading, addProgress };
}

export function useExercises() {
  const [exercises, setExercises] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchExercises = async () => {
      try {
        const { data, error } = await supabase
          .from('exercises')
          .select('*')
          .order('category', { ascending: true })
          .order('name', { ascending: true });

        if (!error) {
          setExercises(data || []);
        } else {
          console.error('Error fetching exercises:', error);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchExercises();

    // Subscribe to realtime changes
    const subscription = supabase
      .channel('exercises_channel')
      .on('postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'exercises' },
        (payload) => {
          console.log('Exercise added:', payload.new);
          setExercises((prev) => [...prev, payload.new]);
        }
      )
      .on('postgres_changes',
        { event: 'DELETE', schema: 'public', table: 'exercises' },
        (payload) => {
          console.log('Exercise deleted:', payload.old);
          setExercises((prev) => prev.filter((ex) => ex.id !== payload.old.id));
        }
      )
      .on('postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'exercises' },
        (payload) => {
          console.log('Exercise updated:', payload.new);
          setExercises((prev) =>
            prev.map((ex) => ex.id === payload.new.id ? payload.new : ex)
          );
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const addCustomExercise = async (exercise, userId) => {
    const { data, error } = await supabase
      .from('exercises')
      .insert([{ ...exercise, user_id: userId, is_custom: true }])
      .select()
      .single();

    if (!error && data) {
      setExercises(prev => [...prev, data]);
    }
    return { data, error };
  };

  const deleteExercise = async (exerciseId) => {
    const { error } = await supabase
      .from('exercises')
      .delete()
      .eq('id', exerciseId);

    if (!error) {
      setExercises(prev => prev.filter(ex => ex.id !== exerciseId));
    }
    return { error };
  };

  return { exercises, loading, addCustomExercise, deleteExercise };
}
