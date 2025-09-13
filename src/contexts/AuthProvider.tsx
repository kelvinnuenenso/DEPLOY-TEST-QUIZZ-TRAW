import { createContext, ReactNode, useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { localDB, type UserProfile } from '@/lib/localStorage';
import { supabase } from '@/integrations/supabase/client';
import { databaseService } from '@/services/database';
import { TEST_MODE } from '@/lib/flags';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, fullName?: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkSession = async () => {
      try {
        if (TEST_MODE) {
          // Check if user is already logged in (mock)
          const profile = localDB.getUserProfile();
          if (profile) {
            setUser({
              id: profile.id,
              email: profile.email,
              user_metadata: {
                full_name: profile.name
              }
            });
          }
        } else {
          // Check Supabase session
          const { data: { session } } = await supabase.auth.getSession();
          if (session) {
            setUser(session.user);
          }
          
          // Set up auth state listener
          const { data: { subscription } } = await supabase.auth.onAuthStateChange(
            (_event, session) => {
              setUser(session?.user || null);
            }
          );
          
          // Cleanup subscription on unmount
          return () => subscription.unsubscribe();
        }
      } catch (error) {
        console.error('Auth error:', error);
      } finally {
        setLoading(false);
      }
    };
    
    checkSession();
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      if (TEST_MODE) {
        // Mock sign in - in a real app this would validate credentials
        const mockUser: User = {
          id: 'mock-user-id',
          email: email,
          user_metadata: {
            full_name: email.split('@')[0]
          }
        };

        // Create or get user profile
        let profile = localDB.getUserProfile();
        if (!profile) {
          profile = {
            id: mockUser.id,
            name: mockUser.user_metadata?.full_name || email.split('@')[0],
            email: email,
            createdAt: new Date().toISOString(),
            plan: 'free',
            settings: {
              theme: 'light',
              notifications: true,
              autoSave: true
            }
          };
          localDB.saveUserProfile(profile);
        }

        setUser(mockUser);
      } else {
        // Real Supabase authentication
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password
        });
        
        if (error) {
          console.error('Supabase auth error:', error);
          throw new Error('Credenciais inválidas. Por favor, verifique seu email e senha.');
        }
        
        if (!data?.user) {
          throw new Error('Usuário não encontrado após o login.');
        }

        // Get session to ensure we're properly authenticated
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError || !session) {
          console.error('Session error:', sessionError);
          throw new Error('Erro ao estabelecer sessão. Por favor, tente novamente.');
        }

        setUser(data.user);
      }
    } catch (error) {
      console.error('Sign in error:', error);
      throw error;
    }
  };

  const signUp = async (email: string, password: string, fullName?: string) => {
    try {
      if (TEST_MODE) {
        // Mock sign up
        const mockUser: User = {
          id: crypto.randomUUID(),
          email: email,
          user_metadata: {
            full_name: fullName || email.split('@')[0]
          }
        };

        // Create user profile
        const profile: UserProfile = {
          id: mockUser.id,
          name: fullName || email.split('@')[0],
          email: email,
          createdAt: new Date().toISOString(),
          plan: 'free',
          settings: {
            theme: 'light',
            notifications: true,
            autoSave: true
          }
        };

        localDB.saveUserProfile(profile);
        setUser(mockUser);
      } else {
        // Real Supabase authentication
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName || email.split('@')[0]
            }
          }
        });
        
        if (error) {
          throw error;
        }
        
        // Create user profile after successful signup
        if (data.user) {
          await databaseService.profiles.upsert({
            id: data.user.id,
            full_name: fullName || email.split('@')[0],
            avatar_url: null,
          });
        }

        setUser(data.user);
      }
    } catch (error) {
      console.error('Sign up error:', error);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      if (TEST_MODE) {
        // In test mode, just clear the user state
        setUser(null);
        // Note: We don't clear the profile data so user can sign back in
      } else {
        // Real Supabase sign out
        const { error } = await supabase.auth.signOut();
        if (error) {
          throw error;
        }
        setUser(null);
      }
    } catch (error) {
      console.error('Sign out error:', error);
      throw error;
    }
  };

  const signInWithGoogle = async () => {
    try {
      if (TEST_MODE) {
        throw new Error('Google authentication not available in test mode');
      } else {
        const { data, error } = await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: {
            redirectTo: `${window.location.origin}/auth/callback`
          }
        });
        
        if (error) {
          throw error;
        }

        // Note: The actual user will be set by the auth state listener
        // after the OAuth redirect
      }
    } catch (error) {
      console.error('Google sign in error:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{
      signInWithGoogle,
      user,
      loading,
      signIn,
      signUp,
      signOut
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export { AuthContext, AuthProvider };