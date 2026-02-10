import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, Dumbbell, User } from 'lucide-react';
import { useSupabaseContext } from '../../contexts/SupabaseContext';
import { Button } from '../../components/ui';
import './Auth.css';

export default function SignupPage() {
    const navigate = useNavigate();
    const { auth } = useSupabaseContext();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (!name || !email || !password || !confirmPassword) {
            setError('Preencha todos os campos');
            return;
        }

        if (password !== confirmPassword) {
            setError('Senhas não conferem');
            return;
        }

        if (password.length < 6) {
            setError('A senha deve ter pelo menos 6 caracteres');
            return;
        }

        setLoading(true);

        try {
            const { data, error: signupError } = await auth.signup(email, password);

            if (signupError) {
                throw signupError;
            }

            // Check if email confirmation is required
            if (data?.user && !data.session) {
                // Email confirmation required
                setSuccess('✅ Conta criada! Verifique seu email (incluindo spam) para confirmar sua conta antes de fazer login.');
                setTimeout(() => navigate('/login'), 5000);
            } else if (data?.session) {
                // Auto-login (no confirmation needed)
                setSuccess('✅ Conta criada com sucesso! Redirecionando...');
                setTimeout(() => navigate('/onboarding'), 2000);
            } else {
                setSuccess('✅ Conta criada! Faça login para continuar.');
                setTimeout(() => navigate('/login'), 3000);
            }
        } catch (err) {
            console.error('Signup error:', err);
            if (err.message?.includes('already registered')) {
                setError('Este email já está cadastrado. Tente fazer login.');
            } else {
                setError(err.message || 'Erro ao criar conta. Tente novamente.');
            }
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
                    <p className="auth-subtitle">Crie sua conta para começar</p>
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

                    {success && (
                        <motion.div
                            className="auth-success"
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                        >
                            {success}
                        </motion.div>
                    )}

                    <div className="form-group">
                        <label>Nome Completo</label>
                        <div className="input-with-icon">
                            <User size={20} className="input-icon" />
                            <input
                                type="text"
                                placeholder="Seu nome"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                autoComplete="name"
                            />
                        </div>
                    </div>

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
                                autoComplete="new-password"
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

                    <div className="form-group">
                        <label>Confirmar Senha</label>
                        <div className="input-with-icon">
                            <Lock size={20} className="input-icon" />
                            <input
                                type={showPassword ? 'text' : 'password'}
                                placeholder="••••••••"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                autoComplete="new-password"
                            />
                        </div>
                    </div>

                    <Button type="submit" variant="primary" fullWidth loading={loading}>
                        Criar Conta
                    </Button>
                </form>

                <p className="auth-footer">
                    Já tem uma conta? <Link to="/login">Fazer login</Link>
                </p>
            </motion.div>
        </div>
    );
}
