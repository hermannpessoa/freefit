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
        console.log('Starting auth initialization...');
        const { data: { session } } = await supabase.auth.getSession();
        console.log('Got session:', session ? 'Yes' : 'No');
        if (mounted) {
          setSession(session);
          if (session?.user) {
            try {
              console.log('Fetching user profile for:', session.user.id);
              await fetchUserProfile(session.user.id, session.access_token);
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
            await fetchUserProfile(session.user.id, session.access_token);
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

  const fetchUserProfile = async (userId: string, accessToken?: string) => {
    try {
      console.log('Fetching profile from users table via fetch...');
      
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
      
      const response = await fetch(
        `${supabaseUrl}/rest/v1/users?id=eq.${userId}&select=*`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'apikey': supabaseKey,
            'Authorization': `Bearer ${accessToken || supabaseKey}`,
          },
        }
      );
      
      if (!response.ok) {
        console.log('User profile not found (new user)');
        return;
      }
      
      const data = await response.json();
      
      if (data && data.length > 0) {
        console.log('User profile loaded:', data[0]?.email);
        setUser(data[0]);
      } else {
        console.log('User profile not found (new user)');
      }
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
    console.log('signOut in AuthContext called');
    // Limpar estado local PRIMEIRO
    setUser(null);
    setSession(null);
    
    // Tentar signOut do Supabase em background (não esperar)
    supabase.auth.signOut().then(() => {
      console.log('Supabase signOut completed');
    }).catch((err) => {
      console.error('Supabase signOut error:', err);
    });
    
    // Limpar localStorage do Supabase manualmente
    try {
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith('sb-') || key.includes('supabase')) {
          localStorage.removeItem(key);
        }
      });
    } catch (e) {
      console.error('Error clearing localStorage:', e);
    }
  };

  const deleteAccount = async () => {
    const userId = user?.id || session?.user?.id;
    if (!userId) return;

    try {
      // Delete user profile data from public.users table
      const { error: deleteError } = await supabase
        .from('users')
        .delete()
        .eq('id', userId);

      if (deleteError) {
        console.error('Error deleting user profile:', deleteError);
        // Continuar mesmo com erro para limpar sessão
      }
    } catch (err) {
      console.error('Error in delete operation:', err);
    }

    // Limpar estado local e fazer signOut
    setUser(null);
    setSession(null);
    
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.error('Error signing out after delete:', err);
    }
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
