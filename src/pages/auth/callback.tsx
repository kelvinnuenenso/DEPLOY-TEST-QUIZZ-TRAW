import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { databaseService } from '@/services/database';
import { TEST_MODE } from '@/lib/flags';

export default function AuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        if (TEST_MODE) {
          // In test mode, redirect to dashboard
          navigate('/dashboard');
          return;
        }

        const { data: { session }, error } = await supabase.auth.getSession();

        if (error) {
          console.error('Auth callback error:', error);
          navigate('/auth?error=callback_error');
          return;
        }

        if (!session?.user) {
          navigate('/auth?error=no_session');
          return;
        }

        // Create or update user profile
        try {
          await databaseService.profiles.upsert({
            id: session.user.id,
            full_name: session.user.user_metadata?.full_name || 
                      session.user.email?.split('@')[0] || 'Usuário',
            avatar_url: session.user.user_metadata?.avatar_url || null,
          });
        } catch (profileError) {
          console.error('Error creating profile:', profileError);
          // Continue anyway - profile creation is not critical for auth
        }

        // Redirect to dashboard after successful authentication
        navigate('/dashboard');
      } catch (error) {
        console.error('Unexpected error in auth callback:', error);
        navigate('/auth?error=unexpected_error');
      }
    };

    handleAuthCallback();
  }, [navigate]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h2 className="text-2xl font-semibold mb-4">Autenticando...</h2>
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto"></div>
      </div>
    </div>
  );
}