import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Target, Dumbbell, Calendar, Clock, AlertCircle, User, Check } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { useSupabaseContext } from '../../contexts/SupabaseContext';
import { supabase } from '../../lib/supabase';
import { fitnessGoals, fitnessLevels, equipmentSets, daysPerWeekOptions, timePreferences } from '../../data/workouts';
import { Button } from '../../components/ui';
import './Onboarding.css';

const steps = [
    { id: 'goal', title: 'Qual seu objetivo?', icon: Target },
    { id: 'level', title: 'Seu nível de experiência?', icon: Dumbbell },
    { id: 'days', title: 'Quantos dias por semana?', icon: Calendar },
    { id: 'equipment', title: 'Quais equipamentos você tem?', icon: Dumbbell },
    { id: 'time', title: 'Horário preferido?', icon: Clock },
    { id: 'injuries', title: 'Alguma lesão ou restrição?', icon: AlertCircle },
    { id: 'body', title: 'Seus dados físicos', icon: User },
    { id: 'name', title: 'Como podemos te chamar?', icon: User },
];

export default function OnboardingPage() {
    const navigate = useNavigate();
    const { state, actions } = useApp();
    const { profile, auth } = useSupabaseContext();
    const [loading, setLoading] = useState(false);
    const [currentStep, setCurrentStep] = useState(0);
    const [formData, setFormData] = useState({
        goal: state.onboardingData.goal || null,
        fitnessLevel: state.onboardingData.fitnessLevel || null,
        daysPerWeek: state.onboardingData.daysPerWeek || null,
        equipment: state.onboardingData.equipment || [],
        preferredTime: state.onboardingData.preferredTime || null,
        injuries: state.onboardingData.injuries || [],
        age: state.onboardingData.age || '',
        weight: state.onboardingData.weight || '',
        height: state.onboardingData.height || '',
        gender: state.onboardingData.gender || null,
        name: state.profile.name || '',
    });

    const updateField = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        actions.updateOnboarding({ [field]: value });
    };

    const toggleArrayItem = (field, item) => {
        const current = formData[field] || [];
        const updated = current.includes(item)
            ? current.filter(i => i !== item)
            : [...current, item];
        updateField(field, updated);
    };

    const canProceed = () => {
        const step = steps[currentStep].id;
        switch (step) {
            case 'goal': return formData.goal;
            case 'level': return formData.fitnessLevel;
            case 'days': return formData.daysPerWeek;
            case 'equipment': return formData.equipment.length > 0;
            case 'time': return formData.preferredTime;
            case 'injuries': return true;
            case 'body': return formData.age && formData.weight && formData.height && formData.gender;
            case 'name': return formData.name.trim().length >= 2;
            default: return true;
        }
    };

    const handleNext = () => {
        if (currentStep < steps.length - 1) {
            setCurrentStep(prev => prev + 1);
        } else {
            handleComplete();
        }
    };

    const handleBack = () => {
        if (currentStep > 0) {
            setCurrentStep(prev => prev - 1);
        }
    };

    const handleComplete = async () => {
        setLoading(true);
        try {
            console.log('Iniciando onboarding completion...');
            console.log('Auth user:', auth.user);
            console.log('Profile loading:', profile.loading);
            console.log('Profile data:', profile.profile);
            console.log('Form data:', formData);

            // Wait for profile to load if it's still loading
            if (profile.loading) {
                console.log('Profile ainda está carregando, aguardando...');
                alert('Por favor, aguarde o perfil carregar e tente novamente.');
                setLoading(false);
                return;
            }

            if (!profile.profile) {
                console.error('Profile não existe!');
                alert('Erro: Perfil não encontrado. Por favor, faça logout e login novamente.');
                setLoading(false);
                return;
            }

            // Update profile in Supabase with onboarding data
            const { data, error } = await profile.updateProfile({
                name: formData.name,
                email: auth.user?.email || '',
                onboarding_completed: true,
                onboarding_data: formData
            });

            console.log('Update result:', { data, error });

            if (error) {
                console.error('Erro do Supabase:', error);
                alert('Erro ao salvar dados: ' + error.message);
                setLoading(false);
                return;
            }

            console.log('Onboarding completado com sucesso!');

            // Wait a bit for Supabase to update
            await new Promise(resolve => setTimeout(resolve, 500));

            // Force reload profile from Supabase to ensure state is fresh
            const { data: freshProfile } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', auth.user.id)
                .single();

            console.log('Fresh profile after update:', freshProfile);

            if (freshProfile && freshProfile.onboarding_completed) {
                actions.completeOnboarding({ name: formData.name, email: auth.user?.email || '' });
                navigate('/dashboard');
            } else {
                console.error('Onboarding_completed não foi salvo corretamente!');
                alert('Erro: dados salvos mas estado não atualizado. Tente fazer logout e login novamente.');
                setLoading(false);
            }
        } catch (error) {
            console.error('Erro ao completar onboarding:', error);
            alert('Erro inesperado: ' + error.message);
            setLoading(false);
        }
    };

    const progress = ((currentStep + 1) / steps.length) * 100;

    const renderStepContent = () => {
        const step = steps[currentStep].id;

        switch (step) {
            case 'goal':
                return (
                    <div className="options-grid">
                        {fitnessGoals.map(goal => (
                            <motion.button
                                key={goal.id}
                                className={`option-card ${formData.goal === goal.id ? 'selected' : ''}`}
                                onClick={() => updateField('goal', goal.id)}
                                whileTap={{ scale: 0.98 }}
                                style={{ '--accent-color': goal.color }}
                            >
                                <span className="option-icon">{goal.icon}</span>
                                <span className="option-name">{goal.name}</span>
                                <span className="option-desc">{goal.description}</span>
                                {formData.goal === goal.id && <Check className="check-icon" size={20} />}
                            </motion.button>
                        ))}
                    </div>
                );

            case 'level':
                return (
                    <div className="options-list">
                        {fitnessLevels.map(level => (
                            <motion.button
                                key={level.id}
                                className={`option-row ${formData.fitnessLevel === level.id ? 'selected' : ''}`}
                                onClick={() => updateField('fitnessLevel', level.id)}
                                whileTap={{ scale: 0.98 }}
                            >
                                <span className="option-icon">{level.icon}</span>
                                <div className="option-content">
                                    <span className="option-name">{level.name}</span>
                                    <span className="option-desc">{level.description}</span>
                                </div>
                                {formData.fitnessLevel === level.id && <Check className="check-icon" size={20} />}
                            </motion.button>
                        ))}
                    </div>
                );

            case 'days':
                return (
                    <div className="options-list">
                        {daysPerWeekOptions.map(opt => (
                            <motion.button
                                key={opt.id}
                                className={`option-row ${formData.daysPerWeek === opt.id ? 'selected' : ''}`}
                                onClick={() => updateField('daysPerWeek', opt.id)}
                                whileTap={{ scale: 0.98 }}
                            >
                                <span className="option-number">{opt.id}</span>
                                <div className="option-content">
                                    <span className="option-name">{opt.name}</span>
                                    <span className="option-desc">{opt.description}</span>
                                </div>
                                {formData.daysPerWeek === opt.id && <Check className="check-icon" size={20} />}
                            </motion.button>
                        ))}
                    </div>
                );

            case 'equipment':
                return (
                    <div className="options-grid cols-2">
                        {equipmentSets.map(eq => (
                            <motion.button
                                key={eq.id}
                                className={`option-card ${formData.equipment.includes(eq.id) ? 'selected' : ''}`}
                                onClick={() => toggleArrayItem('equipment', eq.id)}
                                whileTap={{ scale: 0.98 }}
                            >
                                <span className="option-icon">{eq.icon}</span>
                                <span className="option-name">{eq.name}</span>
                                <span className="option-desc">{eq.description}</span>
                                {formData.equipment.includes(eq.id) && <Check className="check-icon" size={20} />}
                            </motion.button>
                        ))}
                    </div>
                );

            case 'time':
                return (
                    <div className="options-list">
                        {timePreferences.map(time => (
                            <motion.button
                                key={time.id}
                                className={`option-row ${formData.preferredTime === time.id ? 'selected' : ''}`}
                                onClick={() => updateField('preferredTime', time.id)}
                                whileTap={{ scale: 0.98 }}
                            >
                                <span className="option-icon">{time.icon}</span>
                                <div className="option-content">
                                    <span className="option-name">{time.name}</span>
                                    <span className="option-desc">{time.description}</span>
                                </div>
                                {formData.preferredTime === time.id && <Check className="check-icon" size={20} />}
                            </motion.button>
                        ))}
                    </div>
                );

            case 'injuries':
                return (
                    <div className="injuries-section">
                        <p className="injuries-hint">Selecione se tiver alguma restrição:</p>
                        <div className="options-grid cols-2">
                            {['Joelho', 'Ombro', 'Lombar', 'Punho', 'Quadril', 'Nenhuma'].map(injury => (
                                <motion.button
                                    key={injury}
                                    className={`option-chip ${formData.injuries.includes(injury) ? 'selected' : ''}`}
                                    onClick={() => toggleArrayItem('injuries', injury)}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    {injury}
                                    {formData.injuries.includes(injury) && <Check size={16} />}
                                </motion.button>
                            ))}
                        </div>
                    </div>
                );

            case 'body':
                return (
                    <div className="body-form">
                        <div className="gender-buttons">
                            <button className={`gender-btn ${formData.gender === 'male' ? 'selected' : ''}`} onClick={() => updateField('gender', 'male')}>
                                🧔 Masculino
                            </button>
                            <button className={`gender-btn ${formData.gender === 'female' ? 'selected' : ''}`} onClick={() => updateField('gender', 'female')}>
                                👩 Feminino
                            </button>
                        </div>
                        <div className="body-inputs">
                            <div className="body-input-group">
                                <label>Idade</label>
                                <input type="number" placeholder="25" value={formData.age} onChange={e => updateField('age', e.target.value)} />
                                <span className="unit">anos</span>
                            </div>
                            <div className="body-input-group">
                                <label>Peso</label>
                                <input type="number" placeholder="70" value={formData.weight} onChange={e => updateField('weight', e.target.value)} />
                                <span className="unit">kg</span>
                            </div>
                            <div className="body-input-group">
                                <label>Altura</label>
                                <input type="number" placeholder="175" value={formData.height} onChange={e => updateField('height', e.target.value)} />
                                <span className="unit">cm</span>
                            </div>
                        </div>
                    </div>
                );

            case 'name':
                return (
                    <div className="name-section">
                        <input
                            type="text"
                            className="name-input"
                            placeholder="Seu nome"
                            value={formData.name}
                            onChange={e => updateField('name', e.target.value)}
                            autoFocus
                        />
                        <p className="name-hint">Usaremos para personalizar sua experiência</p>
                    </div>
                );

            default:
                return null;
        }
    };

    return (
        <div className="onboarding-page">
            <div className="onboarding-header">
                <div className="progress-bar-container">
                    <motion.div className="progress-bar-fill" style={{ width: `${progress}%` }} layoutId="progress" />
                </div>
                <div className="step-indicator">
                    <span>{currentStep + 1}</span> / <span>{steps.length}</span>
                </div>
            </div>

            <div className="onboarding-content">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentStep}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.2 }}
                        className="step-content"
                    >
                        <div className="step-header">
                            {(() => { const Icon = steps[currentStep].icon; return <Icon size={32} className="step-icon" />; })()}
                            <h2 className="step-title">{steps[currentStep].title}</h2>
                        </div>
                        {renderStepContent()}
                    </motion.div>
                </AnimatePresence>
            </div>

            <div className="onboarding-footer">
                <Button variant="ghost" onClick={handleBack} disabled={currentStep === 0 || loading}>
                    <ChevronLeft size={20} /> Voltar
                </Button>
                <Button 
                    variant="primary" 
                    onClick={currentStep === steps.length - 1 ? handleComplete : handleNext} 
                    disabled={!canProceed() || loading}
                    loading={loading}
                >
                    {currentStep === steps.length - 1 ? 'Começar' : 'Próximo'}
                    {currentStep < steps.length - 1 && <ChevronRight size={20} />}
                </Button>
            </div>
        </div>
    );
}
