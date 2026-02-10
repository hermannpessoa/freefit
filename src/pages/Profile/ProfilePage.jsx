import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Settings, Bell, CreditCard, Shield, HelpCircle, LogOut, ChevronRight, Moon, Smartphone, Heart, Award, Trash2, Target, Calendar, Clock, Dumbbell } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { useSupabaseContext } from '../../contexts/SupabaseContext';
import { Card, Avatar, Badge, ProgressBar, Button, Modal, Toast } from '../../components/ui';
import { useState, useRef, useEffect } from 'react';
import './Profile.css';

export default function ProfilePage() {
    const navigate = useNavigate();
    const { state, actions } = useApp();
    const { auth, profile: supabaseProfile } = useSupabaseContext();
    const [loading, setLoading] = useState(false);
    const [showLogoutModal, setShowLogoutModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showGoalsModal, setShowGoalsModal] = useState(false);
    const [toast, setToast] = useState({ show: false, message: '', type: 'info' });
    const isMountedRef = useRef(true);
    const { profile, subscription, onboardingData } = state;
    const currentProfile = supabaseProfile.profile || profile;

    const showToast = (message, type = 'info') => {
        setToast({ show: true, message, type });
        setTimeout(() => setToast({ show: false, message: '', type: 'info' }), 5000);
    };

    // Form state for goals
    const [goalsForm, setGoalsForm] = useState({
        goal: onboardingData?.goal || '',
        fitnessLevel: onboardingData?.fitnessLevel || '',
        daysPerWeek: onboardingData?.daysPerWeek || 3,
        equipment: onboardingData?.equipment || [],
        preferredTime: onboardingData?.preferredTime || '',
        duration: onboardingData?.duration || 45,
    });

    useEffect(() => {
        return () => {
            isMountedRef.current = false;
        };
    }, []);

    // Update form when modal opens with latest data
    useEffect(() => {
        if (showGoalsModal) {
            setGoalsForm({
                goal: onboardingData?.goal || '',
                fitnessLevel: onboardingData?.fitnessLevel || '',
                daysPerWeek: onboardingData?.daysPerWeek || 3,
                equipment: onboardingData?.equipment || [],
                preferredTime: onboardingData?.preferredTime || '',
                duration: onboardingData?.duration || 45,
            });
        }
    }, [showGoalsModal, onboardingData]);

    const handleLogout = async () => {
        console.log('🚪 Iniciando logout...');
        setLoading(true);

        // Fechar modal e resetar loading em 100ms, independente do resultado
        const resetTimer = setTimeout(() => {
            if (isMountedRef.current) {
                console.log('⏰ Timeout - forçando reset do loading');
                setLoading(false);
                setShowLogoutModal(false);
            }
        }, 100);

        try {
            console.log('1️⃣ Chamando auth.logout()...');

            // Timeout para logout - se demorar mais de 5 segundos, força o logout local
            const logoutPromise = auth.logout();
            const timeoutPromise = new Promise((_, reject) =>
                setTimeout(() => reject(new Error('Timeout')), 5000)
            );

            try {
                await Promise.race([logoutPromise, timeoutPromise]);
                console.log('2️⃣ Auth logout concluído');
            } catch (timeoutError) {
                console.warn('⚠️ Timeout no logout do Supabase, forçando logout local');
            }

            console.log('3️⃣ Chamando actions.logout()...');
            actions.logout();
            console.log('4️⃣ Actions logout concluído');

            console.log('5️⃣ Navegando para /login...');
            navigate('/login', { replace: true });
            console.log('6️⃣ Navegação iniciada');
        } catch (error) {
            console.error('❌ Erro ao fazer logout:', error);
            // Mesmo com erro, força logout local
            actions.logout();
            navigate('/login', { replace: true });
        } finally {
            clearTimeout(resetTimer);
            if (isMountedRef.current) {
                console.log('7️⃣ Finally - setLoading(false)');
                setLoading(false);
                setShowLogoutModal(false);
            }
        }
    };

    const handleDeleteAccount = async () => {
        setLoading(true);
        try {
            await auth.deleteAccount();
            actions.logout();
            navigate('/login');
        } catch (error) {
            console.error('Erro ao excluir conta:', error);
            showToast('Erro ao excluir conta. Tente novamente.', 'error');
        } finally {
            setLoading(false);
            setShowDeleteModal(false);
        }
    };

    const handleUpdateGoals = async () => {
        setLoading(true);
        try {
            // Update in Supabase
            const { error } = await supabaseProfile.updateProfile({
                onboarding_data: {
                    ...onboardingData,
                    ...goalsForm,
                }
            });

            if (error) {
                throw error;
            }

            // Update local context
            actions.updateOnboarding(goalsForm);
            showToast('Objetivos atualizados com sucesso!', 'success');
            setShowGoalsModal(false);
        } catch (error) {
            console.error('Erro ao atualizar objetivos:', error);
            showToast('Erro ao atualizar objetivos: ' + error.message, 'error');
        } finally {
            setLoading(false);
        }
    };

    const menuItems = [
        { icon: Target, label: 'Meus Objetivos', action: () => setShowGoalsModal(true), desc: 'Atualize seus objetivos de treino' },
        { icon: User, label: 'Editar Perfil', path: '/settings/profile' },
        { icon: Bell, label: 'Notificações', path: '/settings/notifications' },
        { icon: CreditCard, label: 'Assinatura', path: '/subscription', badge: subscription.status === 'trial' ? 'Trial' : null },
        { icon: Heart, label: 'Integrações', path: '/settings/integrations', desc: 'Apple Health, Google Fit' },
        { icon: Smartphone, label: 'Watch Companion', path: '/settings/watch' },
        { icon: Shield, label: 'Privacidade', path: '/settings/privacy' },
        { icon: HelpCircle, label: 'Ajuda & Suporte', path: '/settings/help' },
    ];

    // XP progress
    const xpForNextLevel = 500;
    const currentLevelXp = profile.totalXp % 500;

    // Get trial days remaining
    const getTrialDays = () => {
        if (!subscription.trialEndsAt) return 0;
        const end = new Date(subscription.trialEndsAt);
        const now = new Date();
        const diff = Math.ceil((end - now) / (1000 * 60 * 60 * 24));
        return Math.max(0, diff);
    };

    return (
        <div className="profile-page">
            <header className="profile-header">
                <h1>Perfil</h1>
            </header>

            {/* Profile Card */}
            <motion.div
                className="profile-card"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <Avatar name={currentProfile.name} size="xl" />
                <div className="profile-info">
                    <h2 className="profile-name">{currentProfile.name || 'Atleta'}</h2>
                    <p className="profile-email">{currentProfile.email || auth.user?.email || 'email@exemplo.com'}</p>
                    <div className="profile-badges">
                        <Badge variant="primary">Nível {currentProfile.level}</Badge>
                        {subscription.status === 'trial' && (
                            <Badge variant="warning">{getTrialDays()} dias de trial</Badge>
                        )}
                        {subscription.status === 'active' && (
                            <Badge variant="success">Premium</Badge>
                        )}
                    </div>
                </div>
            </motion.div>

            {/* Stats Summary */}
            <div className="profile-stats">
                <div className="stat">
                    <span className="stat-value">{profile.totalWorkouts}</span>
                    <span className="stat-label">Treinos</span>
                </div>
                <div className="stat-divider" />
                <div className="stat">
                    <span className="stat-value">{profile.streak}</span>
                    <span className="stat-label">Sequência</span>
                </div>
                <div className="stat-divider" />
                <div className="stat">
                    <span className="stat-value">{profile.totalXp}</span>
                    <span className="stat-label">XP Total</span>
                </div>
            </div>

            {/* XP Progress */}
            <Card className="xp-card">
                <div className="xp-header">
                    <Award size={20} style={{ color: 'var(--primary-400)' }} />
                    <span>Progresso para Nível {profile.level + 1}</span>
                </div>
                <ProgressBar value={currentLevelXp} max={xpForNextLevel} />
                <p className="xp-text">{currentLevelXp}/{xpForNextLevel} XP</p>
            </Card>

            {/* Trial Banner */}
            {subscription.status === 'trial' && (
                <motion.div
                    className="trial-banner"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    onClick={() => navigate('/subscription')}
                >
                    <div className="trial-info">
                        <span className="trial-title">🎁 Trial Premium</span>
                        <span className="trial-desc">{getTrialDays()} dias restantes</span>
                    </div>
                    <span className="trial-action">Assinar</span>
                </motion.div>
            )}

            {/* Menu Items */}
            <div className="menu-section">
                {menuItems.map((item, index) => (
                    <motion.div
                        key={item.label}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                    >
                        <button className="menu-item" onClick={() => item.action ? item.action() : navigate(item.path)}>
                            <div className="menu-icon">
                                <item.icon size={20} />
                            </div>
                            <div className="menu-content">
                                <span className="menu-label">{item.label}</span>
                                {item.desc && <span className="menu-desc">{item.desc}</span>}
                            </div>
                            {item.badge && <Badge variant="warning">{item.badge}</Badge>}
                            <ChevronRight size={20} className="menu-arrow" />
                        </button>
                    </motion.div>
                ))}
            </div>

            {/* Logout */}
            <motion.button 
                className="logout-btn" 
                onClick={() => setShowLogoutModal(true)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
            >
                <LogOut size={20} />
                Sair da Conta
            </motion.button>

            {/* Delete Account */}
            <motion.button 
                className="delete-account-btn" 
                onClick={() => setShowDeleteModal(true)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
            >
                <Trash2 size={20} />
                Excluir Conta
            </motion.button>

            {/* Logout Modal */}
            <Modal
                isOpen={showLogoutModal}
                onClose={() => setShowLogoutModal(false)}
                title="Sair da Conta?"
                description="Você tem certeza que deseja sair? Você pode fazer login novamente a qualquer momento."
            >
                <div style={{ display: 'flex', gap: '12px' }}>
                    <Button 
                        variant="ghost" 
                        fullWidth 
                        onClick={() => setShowLogoutModal(false)}
                        disabled={loading}
                    >
                        Cancelar
                    </Button>
                    <Button 
                        variant="danger" 
                        fullWidth 
                        onClick={handleLogout}
                        loading={loading}
                    >
                        Sair
                    </Button>
                </div>
            </Modal>

            {/* Delete Account Modal */}
            <Modal
                isOpen={showDeleteModal}
                onClose={() => setShowDeleteModal(false)}
                title="⚠️ Excluir Conta"
                description="ATENÇÃO: Esta ação é permanente e irreversível. Todos os seus dados, treinos, progresso e histórico serão perdidos para sempre."
            >
                <div style={{ display: 'flex', gap: '12px' }}>
                    <Button 
                        variant="ghost" 
                        fullWidth 
                        onClick={() => setShowDeleteModal(false)}
                        disabled={loading}
                    >
                        Cancelar
                    </Button>
                    <Button 
                        variant="danger" 
                        fullWidth 
                        onClick={handleDeleteAccount}
                        loading={loading}
                    >
                        Excluir Permanentemente
                    </Button>
                </div>
            </Modal>

            {/* Goals Modal */}
            <Modal
                isOpen={showGoalsModal}
                onClose={() => setShowGoalsModal(false)}
                title="🎯 Meus Objetivos"
                description="Atualize suas metas e preferências de treino"
            >
                <div className="goals-modal-content">
                    {/* Goal */}
                    <div className="goals-section">
                        <label className="goals-label">
                            <Target size={16} />
                            Objetivo Principal
                        </label>
                        <div className="goals-options">
                            {[
                                { value: 'weight_loss', label: 'Perder Peso', emoji: '🔥' },
                                { value: 'muscle_gain', label: 'Ganhar Massa', emoji: '💪' },
                                { value: 'fitness', label: 'Manter Forma', emoji: '⚡' },
                                { value: 'strength', label: 'Aumentar Força', emoji: '🏋️' },
                                { value: 'endurance', label: 'Resistência', emoji: '🏃' }
                            ].map(option => (
                                <button
                                    key={option.value}
                                    type="button"
                                    className={`goals-option ${goalsForm.goal === option.value ? 'active' : ''}`}
                                    onClick={() => setGoalsForm({ ...goalsForm, goal: option.value })}
                                >
                                    <span className="goals-option-emoji">{option.emoji}</span>
                                    <span className="goals-option-label">{option.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Fitness Level */}
                    <div className="goals-section">
                        <label className="goals-label">
                            <Award size={16} />
                            Nível de Condicionamento
                        </label>
                        <div className="goals-options-row">
                            {[
                                { value: 'beginner', label: 'Iniciante' },
                                { value: 'intermediate', label: 'Intermediário' },
                                { value: 'advanced', label: 'Avançado' }
                            ].map(option => (
                                <button
                                    key={option.value}
                                    type="button"
                                    className={`goals-option-pill ${goalsForm.fitnessLevel === option.value ? 'active' : ''}`}
                                    onClick={() => setGoalsForm({ ...goalsForm, fitnessLevel: option.value })}
                                >
                                    {option.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Days per Week and Preferred Time */}
                    <div className="goals-row">
                        <div className="goals-section">
                            <label className="goals-label">
                                <Calendar size={16} />
                                Dias por Semana
                            </label>
                            <div className="goals-days-grid">
                                {[1, 2, 3, 4, 5, 6, 7].map(day => (
                                    <button
                                        key={day}
                                        type="button"
                                        className={`goals-day-btn ${goalsForm.daysPerWeek === day ? 'active' : ''}`}
                                        onClick={() => setGoalsForm({ ...goalsForm, daysPerWeek: day })}
                                    >
                                        {day}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="goals-section">
                            <label className="goals-label">
                                <Clock size={16} />
                                Horário
                            </label>
                            <div className="goals-time-btns">
                                {[
                                    { value: 'morning', label: 'Manhã', emoji: '☀️' },
                                    { value: 'afternoon', label: 'Tarde', emoji: '🌤️' },
                                    { value: 'evening', label: 'Noite', emoji: '🌙' },
                                    { value: 'flexible', label: 'Flexível', emoji: '🔄' }
                                ].map(time => (
                                    <button
                                        key={time.value}
                                        type="button"
                                        className={`goals-time-btn ${goalsForm.preferredTime === time.value ? 'active' : ''}`}
                                        onClick={() => setGoalsForm({ ...goalsForm, preferredTime: time.value })}
                                    >
                                        <span className="goals-time-emoji">{time.emoji}</span>
                                        <span className="goals-time-label">{time.label}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Duration */}
                    <div className="goals-section">
                        <label className="goals-label">
                            <Clock size={16} />
                            Tempo de Treino
                        </label>
                        <div className="goals-options-row">
                            {[
                                { value: 30, label: '30 min' },
                                { value: 45, label: '45 min' },
                                { value: 60, label: '60 min' },
                                { value: 90, label: '90 min' }
                            ].map(option => (
                                <button
                                    key={option.value}
                                    type="button"
                                    className={`goals-option-pill ${goalsForm.duration === option.value ? 'active' : ''}`}
                                    onClick={() => setGoalsForm({ ...goalsForm, duration: option.value })}
                                >
                                    {option.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Equipment */}
                    <div className="goals-section">
                        <label className="goals-label">
                            <Dumbbell size={16} />
                            Equipamentos Disponíveis
                        </label>
                        <div className="goals-equipment">
                            {[
                                { value: 'gym', label: 'Academia', emoji: '🏋️' },
                                { value: 'home', label: 'Casa', emoji: '🏠' },
                                { value: 'bodyweight', label: 'Peso Corporal', emoji: '🤸' },
                                { value: 'dumbbells', label: 'Halteres', emoji: '💪' },
                                { value: 'resistance_bands', label: 'Elásticos', emoji: '🎗️' }
                            ].map(eq => (
                                <label
                                    key={eq.value}
                                    className={`goals-checkbox ${goalsForm.equipment.includes(eq.value) ? 'checked' : ''}`}
                                >
                                    <input
                                        type="checkbox"
                                        checked={goalsForm.equipment.includes(eq.value)}
                                        onChange={(e) => {
                                            if (e.target.checked) {
                                                setGoalsForm({ ...goalsForm, equipment: [...goalsForm.equipment, eq.value] });
                                            } else {
                                                setGoalsForm({ ...goalsForm, equipment: goalsForm.equipment.filter(item => item !== eq.value) });
                                            }
                                        }}
                                    />
                                    <span className="goals-checkbox-emoji">{eq.emoji}</span>
                                    <span className="goals-checkbox-label">{eq.label}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* Actions */}
                    <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
                        <Button
                            variant="ghost"
                            fullWidth
                            onClick={() => setShowGoalsModal(false)}
                            disabled={loading}
                        >
                            Cancelar
                        </Button>
                        <Button
                            variant="primary"
                            fullWidth
                            onClick={handleUpdateGoals}
                            loading={loading}
                        >
                            Salvar Alterações
                        </Button>
                    </div>
                </div>
            </Modal>

            {/* Toast Notifications */}
            <AnimatePresence>
                {toast.show && (
                    <Toast
                        message={toast.message}
                        type={toast.type}
                        onClose={() => setToast({ show: false, message: '', type: 'info' })}
                    />
                )}
            </AnimatePresence>

            {/* App Info */}
            <p className="app-version">MyFit AI v1.0.0</p>

            <div style={{ height: 100 }} />
        </div>
    );
}
