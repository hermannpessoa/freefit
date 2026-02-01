import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { Session } from '@supabase/supabase-js';
import { supabase } from '@/services/supabaseClient';
import type { User as AppUser } from '@/types';

interface AuthContextType {
  session: Session | null;
  user: AppUser | null;
  loading: boolean;
  signUp: (email: string, password: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  deleteAccount: () => Promise<void>;
  updateProfile: (data: Partial<AppUser>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    let loadingTimeout: ReturnType<typeof setTimeout>;

    const initAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (mounted) {
          setSession(session);
          if (session?.user) {
            try {
              await fetchUserProfile(session.user.id);
            } catch (err) {
              console.error('Error fetching profile:', err);
            }
          }
          setLoading(false);
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        if (mounted) {
          setLoading(false);
        }
      }
    };

    // Timeout de segurança para evitar loading infinito (10 segundos)
    loadingTimeout = setTimeout(() => {
      if (mounted) {
        console.warn('Auth initialization timeout - forcing loading state off');
        setLoading(false);
      }
    }, 10000);

    initAuth();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_, session) => {
      if (mounted) {
        setSession(session);
        if (session?.user) {
          try {
            await fetchUserProfile(session.user.id);
          } catch (err) {
            console.error('Error fetching profile on auth change:', err);
          }
        } else {
          setUser(null);
        }
        setLoading(false);
        clearTimeout(loadingTimeout);
      }
    });

    return () => {
      mounted = false;
      clearTimeout(loadingTimeout);
      subscription?.unsubscribe();
    };
  }, []);

  const fetchUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        // Se o usuário não existe ainda em public.users, isso é ok (novo usuário)
        console.log('User profile not found yet, will be created on first access');
        return;
      }
      setUser(data);
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  };

  const signUp = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });
    if (error) throw error;

    // Criar perfil de usuário na tabela public.users
    if (data.user) {
      try {
        await supabase.from('users').insert([
          {
            id: data.user.id,
            email: data.user.email,
          },
        ]);
      } catch (err) {
        console.error('Error creating user profile:', err);
        // Não lançar erro pois a autenticação funcionou
      }
    }
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
    // O onAuthStateChange vai atualizar a session automaticamente
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    setUser(null);
  };

  const deleteAccount = async () => {
    if (!user) return;

    // Delete user profile data
    const { error: deleteError } = await supabase
      .from('users')
      .delete()
      .eq('id', user.id);

    if (deleteError) throw deleteError;

    // Delete Supabase auth user
    const { error: authError } = await supabase.auth.admin.deleteUser(user.id);
    if (authError) throw authError;

    await signOut();
  };

  const updateProfile = async (data: Partial<AppUser>) => {
    if (!user) return;

    // Calculate IMC if weight or height is provided
    const imc = data.weight && data.height 
      ? Math.round((data.weight / ((data.height / 100) ** 2)) * 100) / 100
      : user.imc;

    const { error } = await supabase
      .from('users')
      .update({ ...data, imc, updated_at: new Date().toISOString() })
      .eq('id', user.id);

    if (error) throw error;
    await fetchUserProfile(user.id);
  };

  return (
    <AuthContext.Provider value={{ session, user, loading, signUp, signIn, signOut, deleteAccount, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
