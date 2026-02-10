import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

export function useAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

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
    if (error) throw error;
    return data;
  };

  const signup = async (email, password) => {
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) throw error;
    return data;
  };

  const logout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  };

  return { user, loading, login, signup, logout };
}

export function useProfile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      setProfile(null);
      setLoading(false);
      return;
    }

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

  const fetchProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error && error.code === 'PGRST116') {
        // Profile doesn't exist, create it
        const { data: newProfile, error: createError } = await supabase
          .from('profiles')
          .insert([{ id: user.id, email: user.email }])
          .select()
          .single();

        if (!createError) setProfile(newProfile);
      } else if (!error) {
        setProfile(data);
      }
    } finally {
      setLoading(false);
    }
  };

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

export function useWorkouts() {
  const [workouts, setWorkouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      setWorkouts([]);
      setLoading(false);
      return;
    }

    fetchWorkouts();

    const subscription = supabase
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

    return () => subscription.unsubscribe();
  }, [user]);

  const fetchWorkouts = async () => {
    try {
      const { data, error } = await supabase
        .from('workouts')
        .select('*')
        .eq('user_id', user.id);

      if (!error) setWorkouts(data || []);
    } finally {
      setLoading(false);
    }
  };

  const addWorkout = async (workout) => {
    const { data, error } = await supabase
      .from('workouts')
      .insert([{ ...workout, user_id: user.id }])
      .select()
      .single();

    if (!error) setWorkouts(w => [...w, data]);
    return { data, error };
  };

  const updateWorkout = async (id, updates) => {
    const { data, error } = await supabase
      .from('workouts')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (!error) {
      setWorkouts(w => w.map(wo => wo.id === id ? data : wo));
    }
    return { data, error };
  };

  const deleteWorkout = async (id) => {
    const { error } = await supabase
      .from('workouts')
      .delete()
      .eq('id', id);

    if (!error) {
      setWorkouts(w => w.filter(wo => wo.id !== id));
    }
    return { error };
  };

  return { workouts, loading, addWorkout, updateWorkout, deleteWorkout };
}

export function useWorkoutHistory() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      setHistory([]);
      setLoading(false);
      return;
    }

    fetchHistory();

    const subscription = supabase
      .channel(`history:${user.id}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'workout_history', filter: `user_id=eq.${user.id}` },
        (payload) => setHistory(h => [payload.new, ...h])
      )
      .subscribe();

    return () => subscription.unsubscribe();
  }, [user]);

  const fetchHistory = async () => {
    try {
      const { data, error } = await supabase
        .from('workout_history')
        .select('*')
        .eq('user_id', user.id)
        .order('completed_at', { ascending: false });

      if (!error) setHistory(data || []);
    } finally {
      setLoading(false);
    }
  };

  const addToHistory = async (workoutData) => {
    const { data, error } = await supabase
      .from('workout_history')
      .insert([{ ...workoutData, user_id: user.id }])
      .select()
      .single();

    if (!error) setHistory(h => [data, ...h]);
    return { data, error };
  };

  return { history, loading, addToHistory };
}

export function useProgressRecords() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      setRecords([]);
      setLoading(false);
      return;
    }

    fetchRecords();

    const subscription = supabase
      .channel(`progress:${user.id}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'progress_records', filter: `user_id=eq.${user.id}` },
        (payload) => setRecords(r => [payload.new, ...r])
      )
      .subscribe();

    return () => subscription.unsubscribe();
  }, [user]);

  const fetchRecords = async () => {
    try {
      const { data, error } = await supabase
        .from('progress_records')
        .select('*')
        .eq('user_id', user.id)
        .order('recorded_at', { ascending: false });

      if (!error) setRecords(data || []);
    } finally {
      setLoading(false);
    }
  };

  const addRecord = async (record) => {
    const { data, error } = await supabase
      .from('progress_records')
      .insert([{ ...record, user_id: user.id }])
      .select()
      .single();

    if (!error) setRecords(r => [data, ...r]);
    return { data, error };
  };

  return { records, loading, addRecord };
}
