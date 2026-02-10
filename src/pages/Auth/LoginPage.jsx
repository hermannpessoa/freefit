import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, Dumbbell } from 'lucide-react';
import { useSupabaseContext } from '../../contexts/SupabaseContext';
import { supabase } from '../../lib/supabase';
import { Button, Input } from '../../components/ui';
import './Auth.css';

export default function LoginPage() {
    const navigate = useNavigate();
    const { auth } = useSupabaseContext();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!email || !password) {
            setError('Preencha todos os campos');
            return;
        }

        console.log('🔐 Tentando fazer login com:', email);
        setLoading(true);

        try {
            console.log('1️⃣ Chamando auth.login...');
            const { data, error: loginError } = await auth.login(email, password);

            console.log('2️⃣ Resposta do login:', { data, loginError });

            if (loginError) {
                console.error('❌ Erro no login:', loginError);
                throw loginError;
            }

            if (!data?.user) {
                console.error('❌ Nenhum usuário retornado');
                throw new Error('Falha ao fazer login. Tente novamente.');
            }

            console.log('3️⃣ Login bem-sucedido! User ID:', data.user.id);
            console.log('4️⃣ Verificando profile...');

            // Check if user completed onboarding
            const { data: profileData, error: profileError } = await supabase
                .from('profiles')
                .select('onboarding_completed')
                .eq('id', data.user.id)
                .maybeSingle();

            console.log('5️⃣ Profile data:', { profileData, profileError });

            if (profileError) {
                console.error('⚠️ Erro ao buscar profile:', profileError);
                console.log('➡️ Redirecionando para onboarding (fallback)');
                navigate('/onboarding');
                return;
            }

            const hasCompletedOnboarding = profileData?.onboarding_completed;
            console.log('6️⃣ Onboarding completo?', hasCompletedOnboarding);

            if (hasCompletedOnboarding) {
                console.log('✅ Redirecionando para dashboard');
                navigate('/dashboard');
            } else {
                console.log('➡️ Redirecionando para onboarding');
                navigate('/onboarding');
            }
        } catch (err) {
            console.error('❌ Erro capturado:', err);
            console.error('Detalhes completos:', {
                message: err.message,
                status: err.status,
                statusCode: err.statusCode,
                error: err
            });

            if (err.message?.includes('Invalid login credentials')) {
                setError('Email ou senha incorretos');
            } else if (err.message?.includes('Email not confirmed')) {
                setError('Por favor, confirme seu email antes de fazer login. Verifique sua caixa de entrada e pasta de spam.');
            } else if (err.message?.includes('User not found')) {
                setError('Usuário não encontrado. Crie uma conta primeiro.');
            } else {
                setError(err.message || 'Erro ao fazer login. Tente novamente.');
            }
        } finally {
            console.log('🏁 Finalizando login, setLoading(false)');
            setLoading(false);
        }
    };

    const handleSocialLogin = async (provider) => {
        setLoading(true);
        try {
            const { data, error } = await auth.socialLogin(provider.toLowerCase(), {
                redirectTo: `${window.location.origin}/onboarding`
            });
            if (error) {
                throw error;
            }
        } catch (err) {
            setError(err.message || `Erro ao fazer login com ${provider}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-background">
                <div className="glow-orb glow-orb-1" />
                <div className="glow-orb glow-orb-2" />
            </div>

            <motion.div
                className="auth-container"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <div className="auth-header">
                    <motion.div
                        className="auth-logo"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: 'spring', delay: 0.2 }}
                    >
                        <Dumbbell size={40} />
                    </motion.div>
                    <h1 className="auth-title">
                        <span className="gradient-text">MyFit</span>
                        <span className="accent-text"> AI</span>
                    </h1>
                    <p className="auth-subtitle">Seu personal trainer com inteligência artificial</p>
                </div>

                <form className="auth-form" onSubmit={handleSubmit}>
                    {error && (
                        <motion.div
                            className="auth-error"
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                        >
                            {error}
                        </motion.div>
                    )}

                    <div className="form-group">
                        <label>Email</label>
                        <div className="input-with-icon">
                            <Mail size={20} className="input-icon" />
                            <input
                                type="email"
                                placeholder="seu@email.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                autoComplete="email"
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Senha</label>
                        <div className="input-with-icon">
                            <Lock size={20} className="input-icon" />
                            <input
                                type={showPassword ? 'text' : 'password'}
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                autoComplete="current-password"
                            />
                            <button
                                type="button"
                                className="password-toggle"
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
                        </div>
                    </div>

                    <Link to="/forgot-password" className="forgot-link">
                        Esqueceu sua senha?
                    </Link>

                    <Button type="submit" variant="primary" fullWidth loading={loading}>
                        Entrar
                    </Button>
                </form>

                <div className="auth-divider">
                    <span>ou continue com</span>
                </div>

                <div className="social-buttons">
                    <button className="social-btn social-btn-full" onClick={() => handleSocialLogin('google')}>
                        <svg viewBox="0 0 24 24" width="20" height="20">
                            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                        </svg>
                        Continuar com Google
                    </button>
                </div>

                <p className="auth-footer">
                    Não tem uma conta? <Link to="/signup">Criar conta</Link>
                </p>
            </motion.div>
        </div>
    );
}
