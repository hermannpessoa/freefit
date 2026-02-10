import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sparkles, Check, X, Crown, Zap, Dumbbell, Brain, BarChart3, Shield, Gift } from 'lucide-react';
import { subscriptionPlans } from '../../data/workouts';
import { useApp } from '../../contexts/AppContext';
import { Button, Badge } from '../../components/ui';
import './Subscription.css';

export default function SubscriptionPage() {
    const navigate = useNavigate();
    const { state, actions } = useApp();
    const [selectedPlan, setSelectedPlan] = useState('annual');
    const [loading, setLoading] = useState(false);

    const features = [
        { icon: Brain, text: 'Treinos personalizados com IA' },
        { icon: Sparkles, text: 'Geração ilimitada de planos' },
        { icon: Dumbbell, text: 'Biblioteca completa 50+ exercícios' },
        { icon: BarChart3, text: 'Análises e métricas detalhadas' },
        { icon: Shield, text: 'Sem anúncios' },
        { icon: Gift, text: 'Novos recursos em primeira mão' },
    ];

    const handleSubscribe = async () => {
        setLoading(true);
        // Simulate subscription process
        setTimeout(() => {
            actions.updateSubscription({
                status: 'active',
                plan: selectedPlan,
                currentPeriodEnd: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()
            });
            setLoading(false);
            navigate('/dashboard');
        }, 1500);
    };

    return (
        <div className="subscription-page">
            <header className="subscription-header">
                <button className="close-btn" onClick={() => navigate(-1)}>
                    <X size={24} />
                </button>
            </header>

            <div className="subscription-content">
                {/* Hero */}
                <motion.div
                    className="hero-section"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <div className="crown-icon">
                        <Crown size={40} />
                    </div>
                    <h1>Desbloqueie Todo o <span className="gradient-text">Potencial</span></h1>
                    <p>Acesso ilimitado a todas as funcionalidades premium</p>
                </motion.div>

                {/* Features */}
                <motion.div
                    className="features-section"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                >
                    {features.map((feature, i) => (
                        <motion.div
                            key={i}
                            className="feature-item"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.1 + i * 0.05 }}
                        >
                            <div className="feature-icon">
                                <feature.icon size={18} />
                            </div>
                            <span>{feature.text}</span>
                        </motion.div>
                    ))}
                </motion.div>

                {/* Plans */}
                <motion.div
                    className="plans-section"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                >
                    {subscriptionPlans.map((plan) => (
                        <button
                            key={plan.id}
                            className={`plan-card ${selectedPlan === plan.id ? 'selected' : ''} ${plan.popular ? 'popular' : ''}`}
                            onClick={() => setSelectedPlan(plan.id)}
                        >
                            {plan.popular && (
                                <div className="popular-badge">
                                    <Zap size={12} /> Mais Popular
                                </div>
                            )}

                            <div className="plan-header">
                                <span className="plan-name">{plan.name}</span>
                                {plan.discount && (
                                    <Badge variant="success">-{plan.discount}%</Badge>
                                )}
                            </div>

                            <div className="plan-price">
                                <span className="price">R$ {plan.price.toFixed(2).replace('.', ',')}</span>
                                <span className="period">/{plan.period}</span>
                            </div>

                            {plan.originalPrice && (
                                <span className="original-price">
                                    R$ {plan.originalPrice.toFixed(2).replace('.', ',')}
                                </span>
                            )}

                            <p className="plan-description">{plan.description}</p>

                            <div className="plan-check">
                                {selectedPlan === plan.id ? (
                                    <Check size={20} />
                                ) : (
                                    <div className="check-empty" />
                                )}
                            </div>
                        </button>
                    ))}
                </motion.div>

                {/* Guarantee */}
                <motion.div
                    className="guarantee-section"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                >
                    <Shield size={16} />
                    <span>Garantia de 7 dias ou seu dinheiro de volta</span>
                </motion.div>
            </div>

            {/* Footer */}
            <div className="subscription-footer">
                <Button variant="accent" size="lg" fullWidth onClick={handleSubscribe} loading={loading}>
                    Assinar Agora
                </Button>
                <p className="terms">
                    Ao assinar, você concorda com os <a href="#">Termos de Uso</a> e <a href="#">Política de Privacidade</a>
                </p>
            </div>
        </div>
    );
}
