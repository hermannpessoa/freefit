import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { LoadingScreen } from '../../components/ui';

/**
 * Handles OAuth callback redirects.
 * Supabase redirects back with hash fragment containing access_token.
 * This component waits for the session to be established, then redirects.
 */
export default function AuthCallbackPage() {
    const navigate = useNavigate();
    const hasProcessed = useRef(false);

    useEffect(() => {
        if (hasProcessed.current) return;
        hasProcessed.current = true;

        const processCallback = async () => {
            try {
                console.log('🔑 AuthCallback: Processing OAuth callback...');

                // Wait for Supabase to process the hash fragment and establish session
                const { data: { session }, error } = await supabase.auth.getSession();

                if (error) {
                    console.error('❌ AuthCallback error:', error);
                    navigate('/login', { replace: true });
                    return;
                }

                if (session) {
                    console.log('✅ AuthCallback: Session established for', session.user.email);

                    // Clean hash from URL
                    if (window.location.hash) {
                        window.history.replaceState(null, '', window.location.pathname);
                    }

                    // Check if user has completed onboarding
                    const { data: profile } = await supabase
                        .from('profiles')
                        .select('onboarding_completed')
                        .eq('id', session.user.id)
                        .maybeSingle();

                    if (profile?.onboarding_completed) {
                        console.log('✅ AuthCallback: Onboarding complete, going to dashboard');
                        navigate('/dashboard', { replace: true });
                    } else {
                        console.log('🔀 AuthCallback: Needs onboarding');
                        navigate('/onboarding', { replace: true });
                    }
                } else {
                    console.warn('⚠️ AuthCallback: No session after processing');
                    navigate('/login', { replace: true });
                }
            } catch (err) {
                console.error('❌ AuthCallback: Unexpected error:', err);
                navigate('/login', { replace: true });
            }
        };

        processCallback();
    }, [navigate]);

    return <LoadingScreen />;
}
