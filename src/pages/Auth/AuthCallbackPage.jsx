import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { LoadingScreen } from '../../components/ui';

/**
 * Extracts OAuth tokens from the URL hash fragment.
 * Supabase implicit flow returns: #access_token=...&refresh_token=...&...
 */
function extractTokensFromHash() {
    const hash = window.location.hash.substring(1); // remove the #
    if (!hash) return null;

    const params = new URLSearchParams(hash);
    const access_token = params.get('access_token');
    const refresh_token = params.get('refresh_token');

    if (access_token && refresh_token) {
        return { access_token, refresh_token };
    }
    return null;
}

/**
 * Handles OAuth callback redirects.
 * Explicitly extracts tokens from hash and calls setSession() to avoid
 * race conditions with Supabase's auto-detection.
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

                // Step 1: Try to extract tokens from hash fragment
                const tokens = extractTokensFromHash();
                let session = null;

                if (tokens) {
                    console.log('🔑 AuthCallback: Found tokens in hash, calling setSession...');
                    const { data, error } = await supabase.auth.setSession({
                        access_token: tokens.access_token,
                        refresh_token: tokens.refresh_token,
                    });

                    if (error) {
                        console.error('❌ AuthCallback: setSession error:', error);
                        navigate('/login', { replace: true });
                        return;
                    }
                    session = data.session;
                } else {
                    // No hash tokens — maybe session was already established
                    console.log('🔑 AuthCallback: No hash tokens, checking existing session...');
                    const { data } = await supabase.auth.getSession();
                    session = data.session;
                }

                // Clean hash from URL
                if (window.location.hash) {
                    window.history.replaceState(null, '', window.location.pathname);
                }

                if (session) {
                    console.log('✅ AuthCallback: Session established for', session.user.email);

                    // Check if user has completed onboarding
                    const { data: profile } = await supabase
                        .from('profiles')
                        .select('onboarding_completed')
                        .eq('id', session.user.id)
                        .maybeSingle();

                    if (profile?.onboarding_completed) {
                        console.log('✅ AuthCallback: Onboarding complete → dashboard');
                        navigate('/dashboard', { replace: true });
                    } else {
                        console.log('🔀 AuthCallback: Needs onboarding');
                        navigate('/onboarding', { replace: true });
                    }
                } else {
                    console.warn('⚠️ AuthCallback: No session established');
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
