import { NavLink, useLocation } from 'react-router-dom';
import { Home, Dumbbell, Library, BarChart3, User } from 'lucide-react';
import { motion } from 'framer-motion';
import './BottomNav.css';

const navItems = [
    { path: '/dashboard', icon: Home, label: 'Início' },
    { path: '/workouts', icon: Dumbbell, label: 'Treinos' },
    { path: '/exercises', icon: Library, label: 'Exercícios' },
    { path: '/progress', icon: BarChart3, label: 'Progresso' },
    { path: '/profile', icon: User, label: 'Perfil' },
];

export default function BottomNav() {
    const location = useLocation();

    // Hide on certain pages
    const hiddenPaths = ['/login', '/signup', '/onboarding', '/workout-active'];
    if (hiddenPaths.some(p => location.pathname.startsWith(p))) {
        return null;
    }

    return (
        <nav className="bottom-nav">
            <div className="bottom-nav-container">
                {navItems.map((item) => {
                    const isActive = location.pathname === item.path ||
                        (item.path !== '/dashboard' && location.pathname.startsWith(item.path));

                    return (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            className={`nav-item ${isActive ? 'active' : ''}`}
                        >
                            <motion.div
                                className="nav-icon-wrapper"
                                whileTap={{ scale: 0.9 }}
                            >
                                {isActive && (
                                    <motion.div
                                        className="nav-indicator"
                                        layoutId="navIndicator"
                                        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                                    />
                                )}
                                <item.icon size={22} className="nav-icon" />
                            </motion.div>
                            <span className="nav-label">{item.label}</span>
                        </NavLink>
                    );
                })}
            </div>
        </nav>
    );
}
