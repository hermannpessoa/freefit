import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Play, Edit2, Trash2, Clock, Dumbbell, Sparkles, ChevronRight, Calendar } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { useSupabaseContext } from '../../contexts/SupabaseContext';
import { Card, Button, Badge, EmptyState, Modal, Toast } from '../../components/ui';
import { useState } from 'react';
import './Workouts.css';

export default function WorkoutsPage() {
    const navigate = useNavigate();
    const { state, actions } = useApp();
    const { workouts: supabaseWorkouts } = useSupabaseContext();
    const { workouts: contextWorkouts } = state;
    const [activeTab, setActiveTab] = useState('my');
    const [deleteModal, setDeleteModal] = useState(null);
    const [deleteLoading, setDeleteLoading] = useState(false);
    const [toast, setToast] = useState({ show: false, message: '', type: 'info' });

    const showToast = (message, type = 'info') => {
        setToast({ show: true, message, type });
        setTimeout(() => setToast({ show: false, message: '', type: 'info' }), 5000);
    };

    // Use Supabase workouts if available, fallback to context
    const workouts = supabaseWorkouts.workouts.length > 0 ? supabaseWorkouts.workouts : contextWorkouts;

    // Use Supabase templates (now they come from database)
    const workoutTemplates = supabaseWorkouts.templates || [];

    const handleStartWorkout = (workout) => {
        actions.startWorkout(workout);
        navigate('/workout-active');
    };

    const handleDeleteWorkout = async (id) => {
        console.log('🗑️ Iniciando exclusão do treino:', id);
        setDeleteLoading(true);

        try {
            // Timeout para delete - se demorar mais de 5 segundos, força apenas o delete local
            const deletePromise = supabaseWorkouts.deleteWorkout(id);
            const timeoutPromise = new Promise((_, reject) =>
                setTimeout(() => reject(new Error('Timeout')), 5000)
            );

            let error;
            try {
                console.log('📡 Chamando Supabase deleteWorkout...');
                const result = await Promise.race([deletePromise, timeoutPromise]);
                error = result?.error;
                console.log('✅ Supabase delete completou:', { error });
            } catch (timeoutError) {
                console.warn('⚠️ Timeout no delete do Supabase (5s), forçando delete local');
                error = null; // Considera como sucesso e faz delete local
            }

            if (error) {
                console.error('❌ Erro ao excluir treino do Supabase:', error);
                showToast('Erro ao excluir treino: ' + error.message, 'error');
                // Mesmo com erro, faz delete local
                actions.deleteWorkout(id);
            } else {
                // Pequeno delay para garantir que Supabase propagou o delete
                await new Promise(resolve => setTimeout(resolve, 200));

                // Delete from local context
                console.log('🔄 Removendo treino do contexto local...');
                actions.deleteWorkout(id);
                console.log('✅ Treino removido localmente');
                showToast('Treino excluído com sucesso', 'success');
            }
        } catch (error) {
            console.error('❌ Erro inesperado ao excluir treino:', error);
            showToast('Erro inesperado ao excluir treino', 'error');
            // Mesmo com erro, tenta fazer delete local
            actions.deleteWorkout(id);
        } finally {
            console.log('🏁 Finalizando exclusão');
            setDeleteLoading(false);
            setDeleteModal(null);
        }
    };

    return (
        <div className="workouts-page">
            <header className="workouts-header">
                <h1>Treinos</h1>
                <Button variant="primary" size="sm" onClick={() => navigate('/workouts/create')}>
                    <Sparkles size={18} /> Criar com IA
                </Button>
            </header>

            {/* Tabs */}
            <div className="tabs">
                <button className={`tab ${activeTab === 'my' ? 'active' : ''}`} onClick={() => setActiveTab('my')}>
                    Meus Treinos
                </button>
                <button className={`tab ${activeTab === 'templates' ? 'active' : ''}`} onClick={() => setActiveTab('templates')}>
                    Modelos
                </button>
            </div>

            {/* My Workouts */}
            {activeTab === 'my' && (
                <div className="workouts-list">
                    {workouts.length > 0 ? (
                        workouts.map((workout, index) => (
                            <motion.div
                                key={workout.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                            >
                                <Card className="workout-card hoverable" onClick={() => navigate(`/workouts/${workout.id}`)}>
                                    <div className="workout-card-header">
                                        <div className="workout-type-badge">
                                            {workout.workoutType === 'ai_generated' ? (
                                                <Badge variant="accent"><Sparkles size={10} /> IA</Badge>
                                            ) : (
                                                <Badge variant="primary">Custom</Badge>
                                            )}
                                        </div>
                                        <div className="workout-actions" onClick={(e) => e.stopPropagation()}>
                                            <button className="action-btn" onClick={() => navigate(`/workouts/edit/${workout.id}`)}>
                                                <Edit2 size={16} />
                                            </button>
                                            <button className="action-btn delete" onClick={() => setDeleteModal(workout.id)}>
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </div>

                                    <h3 className="workout-name">{workout.name}</h3>
                                    {workout.description && <p className="workout-desc">{workout.description}</p>}

                                    <div className="workout-meta">
                                        <span><Clock size={14} /> {workout.estimatedDuration || 45}min</span>
                                        <span><Dumbbell size={14} /> {workout.exercises?.length || 0} exercícios</span>
                                    </div>

                                    <Button
                                        variant="accent"
                                        fullWidth
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleStartWorkout(workout);
                                        }}
                                    >
                                        <Play size={18} /> Iniciar Treino
                                    </Button>
                                </Card>
                            </motion.div>
                        ))
                    ) : (
                        <EmptyState
                            icon={Dumbbell}
                            title="Nenhum treino criado"
                            description="Crie seu primeiro treino personalizado usando IA"
                            action={
                                <Button variant="primary" onClick={() => navigate('/workouts/create')}>
                                    <Sparkles size={18} /> Criar Treino
                                </Button>
                            }
                        />
                    )}
                </div>
            )}

            {/* Templates */}
            {activeTab === 'templates' && (
                <div className="templates-list">
                    {workoutTemplates.map((template, index) => (
                        <motion.div
                            key={template.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                        >
                            <Card className="template-card-large hoverable" onClick={() => navigate(`/workouts/${template.id}`)}>
                                <div className="template-header">
                                    <Badge variant={template.category === 'cardio' ? 'error' : 'primary'}>
                                        {template.category}
                                    </Badge>
                                    <Badge variant={template.difficulty === 'beginner' ? 'success' : template.difficulty === 'intermediate' ? 'warning' : 'error'}>
                                        {template.difficulty === 'beginner' ? 'Iniciante' : template.difficulty === 'intermediate' ? 'Intermediário' : 'Avançado'}
                                    </Badge>
                                </div>

                                <h3 className="template-name">{template.name}</h3>
                                <p className="template-desc">{template.description}</p>

                                <div className="template-meta">
                                    <span><Clock size={14} /> {template.estimatedDuration}min</span>
                                    <span><Dumbbell size={14} /> {template.exercises.length} exercícios</span>
                                </div>

                                <div className="template-footer">
                                    <span className="start-text">Ver exercícios</span>
                                    <ChevronRight size={20} />
                                </div>
                            </Card>
                        </motion.div>
                    ))}
                </div>
            )}

            {/* Delete Modal */}
            <Modal isOpen={!!deleteModal} onClose={() => setDeleteModal(null)} title="Excluir Treino?">
                <p style={{ color: 'var(--text-secondary)', marginBottom: 24 }}>
                    Esta ação não pode ser desfeita. O treino será permanentemente excluído.
                </p>
                <div style={{ display: 'flex', gap: 12 }}>
                    <Button
                        variant="ghost"
                        fullWidth
                        onClick={() => setDeleteModal(null)}
                        disabled={deleteLoading}
                    >
                        Cancelar
                    </Button>
                    <Button
                        variant="danger"
                        fullWidth
                        onClick={() => handleDeleteWorkout(deleteModal)}
                        loading={deleteLoading}
                    >
                        Excluir
                    </Button>
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

            <div style={{ height: 100 }} />
        </div>
    );
}
