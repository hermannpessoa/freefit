import { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Button, Card } from '../../components/ui';
import './DebugPanel.css';

export default function DebugPanel() {
    const [status, setStatus] = useState('');
    const [loading, setLoading] = useState(false);
    const [profileData, setProfileData] = useState(null);
    const [cacheData, setCacheData] = useState(null);

    const checkProfile = async () => {
        setLoading(true);
        setStatus('🔄 Verificando perfil...');

        try {
            const { data: { session } } = await supabase.auth.getSession();

            if (!session?.user) {
                setStatus('❌ Nenhum usuário logado');
                setLoading(false);
                return;
            }

            const { data: profile, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', session.user.id)
                .single();

            if (error) {
                setStatus('❌ Erro: ' + error.message);
                setLoading(false);
                return;
            }

            // Também verificar o localStorage
            const cached = localStorage.getItem('myfit_ai_state');
            if (cached) {
                try {
                    setCacheData(JSON.parse(cached));
                } catch {
                    setCacheData({ error: 'Não é possível parsear cache' });
                }
            }

            setProfileData(profile);
            setStatus('✅ Perfil carregado do Supabase');
        } catch (error) {
            setStatus('❌ Erro: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    const fixOnboarding = async () => {
        setLoading(true);
        setStatus('🔧 Corrigindo onboarding...');

        try {
            const { data: { session } } = await supabase.auth.getSession();

            if (!session?.user) {
                setStatus('❌ Nenhum usuário logado');
                setLoading(false);
                return;
            }

            const { data, error } = await supabase
                .from('profiles')
                .update({
                    onboarding_completed: true,
                    updated_at: new Date().toISOString()
                })
                .eq('id', session.user.id)
                .select()
                .single();

            if (error) {
                setStatus('❌ Erro ao atualizar: ' + error.message);
                setLoading(false);
                return;
            }

            setStatus('✅ Corrigido com sucesso!');
            setProfileData(data);

            // Limpar cache e recarregar
            setTimeout(() => {
                localStorage.clear();
                window.location.href = '/dashboard';
            }, 1500);
        } catch (error) {
            setStatus('❌ Erro: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    const clearCache = () => {
        localStorage.clear();
        setStatus('🧹 Cache limpo! Recarregando...');
        setTimeout(() => window.location.reload(), 1000);
    };

    return (
        <div className="debug-panel">
            <Card>
                <h2>🔧 Painel de Debug</h2>

                <div className="debug-actions">
                    <Button
                        onClick={checkProfile}
                        loading={loading}
                        variant="outline"
                    >
                        Verificar Perfil
                    </Button>

                    <Button
                        onClick={fixOnboarding}
                        loading={loading}
                        variant="primary"
                    >
                        Corrigir Onboarding
                    </Button>

                    <Button
                        onClick={clearCache}
                        variant="outline"
                    >
                        Limpar Cache
                    </Button>
                </div>

                {status && (
                    <div className="debug-status">
                        <pre>{status}</pre>
                    </div>
                )}

                {profileData && (
                    <div className="debug-data">
                        <h3>Dados do Perfil (Supabase):</h3>
                        <pre>{JSON.stringify(profileData, null, 2)}</pre>
                        <p><strong>onboarding_completed:</strong> {String(profileData.onboarding_completed)}</p>
                    </div>
                )}

                {cacheData && (
                    <div className="debug-data">
                        <h3>Dados do Cache (localStorage):</h3>
                        <pre>{JSON.stringify(cacheData, null, 2)}</pre>
                        {cacheData.onboardingCompleted !== undefined && (
                            <p><strong>onboardingCompleted (cache):</strong> {String(cacheData.onboardingCompleted)}</p>
                        )}
                    </div>
                )}
            </Card>
        </div>
    );
}
