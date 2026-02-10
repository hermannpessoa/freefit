import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, CheckCircle, AlertCircle, X } from 'lucide-react';

// Animated Page Wrapper
export function PageTransition({ children }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
        >
            {children}
        </motion.div>
    );
}

// Loading Spinner
export function Spinner({ size = 24, className = '' }) {
    return (
        <Loader2
            size={size}
            className={`animate-spin ${className}`}
            style={{ animation: 'spin 1s linear infinite' }}
        />
    );
}

// Loading Screen
export function LoadingScreen({ message = 'Carregando...' }) {
    return (
        <div className="loading-screen">
            <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="loading-content"
            >
                <div className="loading-logo">
                    <span className="gradient-text">MyFit</span>
                    <span style={{ color: 'var(--accent-500)' }}> AI</span>
                </div>
                <Spinner size={32} />
                <p style={{ color: 'var(--text-secondary)', marginTop: '16px' }}>{message}</p>
            </motion.div>
            <style>{`
        .loading-screen {
          position: fixed;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--bg-primary);
          z-index: 9999;
        }
        .loading-content {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 16px;
        }
        .loading-logo {
          font-size: 2rem;
          font-weight: 800;
          font-family: var(--font-display);
        }
      `}</style>
        </div>
    );
}

// Toast Notification
export function Toast({ message, type = 'info', onClose }) {
    const icons = {
        success: <CheckCircle size={20} style={{ color: 'var(--success-500)' }} />,
        error: <AlertCircle size={20} style={{ color: 'var(--error-500)' }} />,
        info: <AlertCircle size={20} style={{ color: 'var(--primary-500)' }} />,
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: -50, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: -50, x: '-50%' }}
            className="toast"
            style={{
                position: 'fixed',
                top: '20px',
                left: '50%',
                transform: 'translateX(-50%)',
                background: 'var(--bg-elevated)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 'var(--radius-lg)',
                padding: '12px 16px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                zIndex: 9999,
                boxShadow: 'var(--shadow-xl)',
                minWidth: '280px',
                maxWidth: '90vw',
            }}
        >
            {icons[type]}
            <span style={{ flex: 1, color: 'var(--text-primary)' }}>{message}</span>
            <button onClick={onClose} style={{ padding: 0, background: 'none', color: 'var(--text-tertiary)' }}>
                <X size={18} />
            </button>
        </motion.div>
    );
}

// Button Component
export function Button({
    children,
    variant = 'primary',
    size = 'md',
    icon: Icon,
    iconPosition = 'left',
    loading = false,
    disabled = false,
    fullWidth = false,
    className = '',
    ...props
}) {
    const variants = {
        primary: 'btn-primary',
        secondary: 'btn-secondary',
        accent: 'btn-accent',
        ghost: 'btn-ghost',
        danger: 'btn-danger',
    };

    const sizes = {
        sm: 'btn-sm',
        md: '',
        lg: 'btn-lg',
    };

    return (
        <button
            className={`btn ${variants[variant]} ${sizes[size]} ${className}`}
            disabled={disabled || loading}
            style={{
                width: fullWidth ? '100%' : 'auto',
                opacity: disabled ? 0.5 : 1,
                pointerEvents: disabled || loading ? 'none' : 'auto',
            }}
            {...props}
        >
            {loading ? (
                <Spinner size={20} />
            ) : (
                <>
                    {Icon && iconPosition === 'left' && <Icon size={20} />}
                    {children}
                    {Icon && iconPosition === 'right' && <Icon size={20} />}
                </>
            )}
        </button>
    );
}

// Input Field Component
export function Input({
    label,
    error,
    icon: Icon,
    className = '',
    ...props
}) {
    return (
        <div className={`input-group ${className}`}>
            {label && <label className="input-label">{label}</label>}
            <div style={{ position: 'relative' }}>
                {Icon && (
                    <Icon
                        size={20}
                        style={{
                            position: 'absolute',
                            left: '16px',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            color: 'var(--text-tertiary)'
                        }}
                    />
                )}
                <input
                    className="input-field"
                    style={{ paddingLeft: Icon ? '48px' : '16px' }}
                    {...props}
                />
            </div>
            {error && <span style={{ color: 'var(--error-500)', fontSize: '0.875rem' }}>{error}</span>}
        </div>
    );
}

// Card Component
export function Card({ children, className = '', hoverable = false, onClick, ...props }) {
    return (
        <motion.div
            className={`card ${hoverable ? 'card-hoverable' : ''} ${className}`}
            onClick={onClick}
            whileHover={hoverable ? { scale: 1.02 } : {}}
            whileTap={onClick ? { scale: 0.98 } : {}}
            style={{ cursor: onClick ? 'pointer' : 'default' }}
            {...props}
        >
            {children}
        </motion.div>
    );
}

// Badge Component
export function Badge({ children, variant = 'primary', className = '' }) {
    return (
        <span className={`badge badge-${variant} ${className}`}>
            {children}
        </span>
    );
}

// Progress Bar
export function ProgressBar({ value, max = 100, variant = 'primary', showLabel = false, height = 8 }) {
    const percentage = Math.min((value / max) * 100, 100);

    return (
        <div style={{ width: '100%' }}>
            <div
                className={`progress-bar ${variant === 'accent' ? 'progress-bar-accent' : ''}`}
                style={{ height }}
            >
                <motion.div
                    className="progress-bar-fill"
                    initial={{ width: 0 }}
                    animate={{ width: `${percentage}%` }}
                    transition={{ duration: 0.5, ease: 'easeOut' }}
                />
            </div>
            {showLabel && (
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>{value}</span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>{max}</span>
                </div>
            )}
        </div>
    );
}

// Avatar Component
export function Avatar({ name, src, size = 'md', className = '' }) {
    const sizes = { sm: 'avatar-sm', md: '', lg: 'avatar-lg', xl: 'avatar-xl' };
    const initial = name ? name.charAt(0).toUpperCase() : '?';

    return (
        <div className={`avatar ${sizes[size]} ${className}`}>
            {src ? (
                <img src={src} alt={name} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 'inherit' }} />
            ) : (
                initial
            )}
        </div>
    );
}

// Stat Card
export function StatCard({ label, value, icon: Icon, trend, color = 'var(--primary-500)' }) {
    return (
        <Card className="stat-card">
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                <div>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginBottom: '4px' }}>{label}</p>
                    <p style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)' }}>{value}</p>
                    {trend && (
                        <p style={{ fontSize: '0.75rem', color: trend > 0 ? 'var(--success-500)' : 'var(--error-500)' }}>
                            {trend > 0 ? '↑' : '↓'} {Math.abs(trend)}%
                        </p>
                    )}
                </div>
                {Icon && (
                    <div style={{
                        width: 40,
                        height: 40,
                        borderRadius: 'var(--radius-md)',
                        background: `${color}20`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}>
                        <Icon size={20} style={{ color }} />
                    </div>
                )}
            </div>
        </Card>
    );
}

// Modal Component
export function Modal({ isOpen, onClose, title, description, children }) {
    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        style={{
                            position: 'fixed',
                            inset: 0,
                            background: 'rgba(0,0,0,0.7)',
                            backdropFilter: 'blur(4px)',
                            zIndex: 'var(--z-modal-backdrop)',
                        }}
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, x: '-50%', y: '-45%' }}
                        animate={{ opacity: 1, scale: 1, x: '-50%', y: '-50%' }}
                        exit={{ opacity: 0, scale: 0.95, x: '-50%', y: '-45%' }}
                        transition={{ duration: 0.2 }}
                        style={{
                            position: 'fixed',
                            top: '50%',
                            left: '50%',
                            background: 'var(--bg-card)',
                            borderRadius: 'var(--radius-xl)',
                            padding: '24px',
                            width: '90%',
                            maxWidth: '480px',
                            maxHeight: '80vh',
                            overflow: 'auto',
                            zIndex: 'var(--z-modal)',
                            border: '1px solid rgba(255,255,255,0.1)',
                        }}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
                            <h3 style={{ margin: 0 }}>{title}</h3>
                            <button onClick={onClose} className="btn btn-ghost btn-icon btn-sm">
                                <X size={20} />
                            </button>
                        </div>
                        {description && (
                            <p style={{ color: 'var(--text-secondary)', marginBottom: '20px' }}>{description}</p>
                        )}
                        {children}
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}

// Empty State
export function EmptyState({ icon: Icon, title, description, action }) {
    return (
        <div style={{ textAlign: 'center', padding: '48px 24px' }}>
            {Icon && (
                <div style={{
                    width: 80,
                    height: 80,
                    borderRadius: '50%',
                    background: 'var(--bg-tertiary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 20px'
                }}>
                    <Icon size={36} style={{ color: 'var(--text-tertiary)' }} />
                </div>
            )}
            <h4 style={{ marginBottom: '8px' }}>{title}</h4>
            <p style={{ color: 'var(--text-tertiary)', marginBottom: action ? '20px' : 0 }}>{description}</p>
            {action}
        </div>
    );
}

export default { PageTransition, Spinner, LoadingScreen, Toast, Button, Input, Card, Badge, ProgressBar, Avatar, StatCard, Modal, EmptyState };
