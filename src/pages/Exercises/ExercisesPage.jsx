import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Filter, X, Play, ChevronRight, Dumbbell, Bookmark, ChevronLeft } from 'lucide-react';
import { useSupabaseContext } from '../../contexts/SupabaseContext';
import { exerciseCategories, difficultyLevels } from '../../data/exerciseConstants';
import { Card, Badge, Modal, Button } from '../../components/ui';
import './Exercises.css';

export default function ExercisesPage() {
    const [search, setSearch] = useState('');
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [selectedDifficulty, setSelectedDifficulty] = useState(null);
    const [showFilters, setShowFilters] = useState(false);
    const [selectedExercise, setSelectedExercise] = useState(null);
    const [favorites, setFavorites] = useState([]);
    const [currentSlide, setCurrentSlide] = useState(0);
    const [touchStart, setTouchStart] = useState(0);
    const [touchEnd, setTouchEnd] = useState(0);
    const { auth, exercises: supabaseExercises } = useSupabaseContext();

    // Use ONLY Supabase exercises as the source of truth
    const allExercises = useMemo(() => {
        return supabaseExercises.exercises.map(ex => ({
            ...ex,
            // Ensure compatibility with local format
            primaryMuscles: ex.primary_muscles || ex.primaryMuscles || [],
            secondaryMuscles: ex.secondary_muscles || ex.secondaryMuscles || [],
            nameEn: ex.name_en || ex.nameEn,
            steps: ex.steps || [],
            tips: ex.tips || [],
        }));
    }, [supabaseExercises.exercises]);

    // Load favorites from localStorage
    useEffect(() => {
        if (auth.user) {
            const saved = localStorage.getItem(`favorites_${auth.user.id}`);
            if (saved) setFavorites(JSON.parse(saved));
        }
    }, [auth.user]);

    const toggleFavorite = (exerciseId) => {
        setFavorites(prev => {
            const updated = prev.includes(exerciseId)
                ? prev.filter(id => id !== exerciseId)
                : [...prev, exerciseId];
            if (auth.user) {
                localStorage.setItem(`favorites_${auth.user.id}`, JSON.stringify(updated));
            }
            return updated;
        });
    };

    const filteredExercises = useMemo(() => {
        return allExercises.filter(ex => {
            const matchesSearch = !search ||
                ex.name.toLowerCase().includes(search.toLowerCase()) ||
                ex.nameEn?.toLowerCase().includes(search.toLowerCase());
            const matchesCategory = !selectedCategory || ex.category === selectedCategory;
            const matchesDifficulty = !selectedDifficulty || ex.difficulty === selectedDifficulty;
            return matchesSearch && matchesCategory && matchesDifficulty;
        });
    }, [allExercises, search, selectedCategory, selectedDifficulty]);

    const activeFiltersCount = [selectedCategory, selectedDifficulty].filter(Boolean).length;

    const clearFilters = () => {
        setSelectedCategory(null);
        setSelectedDifficulty(null);
    };

    // Slider navigation
    const totalSlides = 2; // Video and Image

    const nextSlide = () => {
        setCurrentSlide((prev) => (prev + 1) % totalSlides);
    };

    const prevSlide = () => {
        setCurrentSlide((prev) => (prev - 1 + totalSlides) % totalSlides);
    };

    // Touch handlers for swipe gestures
    const handleTouchStart = (e) => {
        setTouchStart(e.targetTouches[0].clientX);
    };

    const handleTouchMove = (e) => {
        setTouchEnd(e.targetTouches[0].clientX);
    };

    const handleTouchEnd = () => {
        if (!touchStart || !touchEnd) return;

        const distance = touchStart - touchEnd;
        const isLeftSwipe = distance > 50;
        const isRightSwipe = distance < -50;

        if (isLeftSwipe) {
            nextSlide();
        }
        if (isRightSwipe) {
            prevSlide();
        }

        // Reset
        setTouchStart(0);
        setTouchEnd(0);
    };

    // Reset slide when modal opens
    useEffect(() => {
        if (selectedExercise) {
            setCurrentSlide(0);
        }
    }, [selectedExercise]);

    return (
        <div className="exercises-page">
            <header className="exercises-header">
                <h1>Biblioteca de Exercícios</h1>
                <p className="exercises-count">{filteredExercises.length} exercícios</p>
            </header>

            {/* Search & Filter */}
            <div className="search-section">
                <div className="search-input-wrapper">
                    <Search size={20} className="search-icon" />
                    <input
                        type="text"
                        placeholder="Buscar exercício..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="search-input"
                    />
                    {search && (
                        <button className="clear-search" onClick={() => setSearch('')}>
                            <X size={18} />
                        </button>
                    )}
                </div>
                <button
                    className={`filter-btn ${activeFiltersCount > 0 ? 'active' : ''}`}
                    onClick={() => setShowFilters(true)}
                >
                    <Filter size={20} />
                    {activeFiltersCount > 0 && <span className="filter-count">{activeFiltersCount}</span>}
                </button>
            </div>

            {/* Category Pills */}
            <div className="category-pills">
                <button
                    className={`category-pill ${!selectedCategory ? 'active' : ''}`}
                    onClick={() => setSelectedCategory(null)}
                >
                    Todos
                </button>
                {exerciseCategories.map(cat => (
                    <button
                        key={cat.id}
                        className={`category-pill ${selectedCategory === cat.id ? 'active' : ''}`}
                        onClick={() => setSelectedCategory(selectedCategory === cat.id ? null : cat.id)}
                        style={{ '--cat-color': cat.color }}
                    >
                        {cat.icon} {cat.name}
                    </button>
                ))}
            </div>

            {/* Active Filters */}
            {activeFiltersCount > 0 && (
                <div className="active-filters">
                    {selectedDifficulty && (
                        <span className="filter-tag">
                            {difficultyLevels.find(d => d.id === selectedDifficulty)?.name}
                            <button onClick={() => setSelectedDifficulty(null)}><X size={14} /></button>
                        </span>
                    )}
                    <button className="clear-all-btn" onClick={clearFilters}>Limpar filtros</button>
                </div>
            )}

            {/* Exercise List */}
            <div className="exercises-list">
                <AnimatePresence mode="popLayout">
                    {filteredExercises.map((exercise, index) => (
                        <motion.div
                            key={exercise.id}
                            layout
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            transition={{ delay: index * 0.02 }}
                        >
                            <Card
                                className="exercise-card"
                                onClick={() => setSelectedExercise(exercise)}
                                hoverable
                            >
                                <div className="exercise-thumb">
                                    <Dumbbell size={24} />
                                </div>
                                <div className="exercise-info">
                                    <h3 className="exercise-name">{exercise.name}</h3>
                                    <div className="exercise-meta">
                                        <Badge variant={exercise.difficulty === 'beginner' ? 'success' : exercise.difficulty === 'intermediate' ? 'warning' : 'error'}>
                                            {exercise.difficulty === 'beginner' ? 'Iniciante' : exercise.difficulty === 'intermediate' ? 'Intermediário' : 'Avançado'}
                                        </Badge>
                                        <span className="muscle-tag">{exercise.primaryMuscles[0]}</span>
                                    </div>
                                </div>
                                <button 
                                    className={`favorite-icon ${favorites.includes(exercise.id) ? 'active' : ''}`}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        toggleFavorite(exercise.id);
                                    }}
                                >
                                    <Bookmark size={18} />
                                </button>
                                <ChevronRight size={20} className="chevron" />
                            </Card>
                        </motion.div>
                    ))}
                </AnimatePresence>

                {filteredExercises.length === 0 && (
                    <div className="empty-state">
                        <Dumbbell size={48} />
                        <h3>Nenhum exercício encontrado</h3>
                        <p>Tente ajustar seus filtros ou busca</p>
                    </div>
                )}
            </div>

            {/* Filter Modal */}
            <Modal isOpen={showFilters} onClose={() => setShowFilters(false)} title="Filtros">
                <div className="filter-section">
                    <h4>Dificuldade</h4>
                    <div className="filter-options">
                        {difficultyLevels.map(level => (
                            <button
                                key={level.id}
                                className={`filter-option ${selectedDifficulty === level.id ? 'active' : ''}`}
                                onClick={() => setSelectedDifficulty(selectedDifficulty === level.id ? null : level.id)}
                            >
                                {level.name}
                            </button>
                        ))}
                    </div>
                </div>
                <div style={{ marginTop: 24, display: 'flex', gap: 12 }}>
                    <Button variant="ghost" onClick={clearFilters} fullWidth>Limpar</Button>
                    <Button variant="primary" onClick={() => setShowFilters(false)} fullWidth>Aplicar</Button>
                </div>
            </Modal>

            {/* Exercise Detail Modal */}
            <Modal
                isOpen={!!selectedExercise}
                onClose={() => setSelectedExercise(null)}
                title={selectedExercise?.name}
            >
                {selectedExercise && (
                    <div className="exercise-detail">
                        <div
                            className="media-carousel-container"
                            onTouchStart={handleTouchStart}
                            onTouchMove={handleTouchMove}
                            onTouchEnd={handleTouchEnd}
                        >
                            <div className="media-slider">
                                <div
                                    className="media-slides"
                                    style={{ transform: `translateX(-${currentSlide * 50}%)` }}
                                >
                                    {/* Slide 1: Video */}
                                    <div className="media-slide">
                                        {selectedExercise.demo_video ? (
                                            <iframe
                                                src={selectedExercise.demo_video}
                                                title={selectedExercise.name}
                                                frameBorder="0"
                                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                                allowFullScreen
                                            />
                                        ) : (
                                            <div className="media-placeholder">
                                                <Play size={48} />
                                                <span>Sem vídeo disponível</span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Slide 2: Image/GIF */}
                                    <div className="media-slide">
                                        {selectedExercise.demo_image ? (
                                            <img src={selectedExercise.demo_image} alt={selectedExercise.name} loading="lazy" />
                                        ) : (
                                            <div className="media-placeholder">
                                                <Dumbbell size={48} />
                                                <span>Sem imagem disponível</span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Navigation Arrows */}
                                <button
                                    className="slider-nav slider-nav-prev"
                                    onClick={prevSlide}
                                    aria-label="Anterior"
                                >
                                    <ChevronLeft size={24} />
                                </button>
                                <button
                                    className="slider-nav slider-nav-next"
                                    onClick={nextSlide}
                                    aria-label="Próximo"
                                >
                                    <ChevronRight size={24} />
                                </button>

                                {/* Pagination Dots */}
                                <div className="slider-pagination">
                                    {[...Array(totalSlides)].map((_, index) => (
                                        <button
                                            key={index}
                                            className={`slider-dot ${currentSlide === index ? 'active' : ''}`}
                                            onClick={() => setCurrentSlide(index)}
                                            aria-label={`Ir para slide ${index + 1}`}
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="detail-section">
                            <h4>Descrição</h4>
                            <p>{selectedExercise.description}</p>
                        </div>

                        <div className="detail-section">
                            <h4>Músculos Trabalhados</h4>
                            <div className="muscle-chips">
                                {selectedExercise.primaryMuscles.map(m => (
                                    <span key={m} className="muscle-chip primary">{m}</span>
                                ))}
                                {selectedExercise.secondaryMuscles.map(m => (
                                    <span key={m} className="muscle-chip secondary">{m}</span>
                                ))}
                            </div>
                        </div>

                        <div className="detail-section">
                            <h4>Execução</h4>
                            <ol className="steps-list">
                                {selectedExercise.steps.map((step, i) => (
                                    <li key={i}>{step}</li>
                                ))}
                            </ol>
                        </div>

                        {selectedExercise.tips && selectedExercise.tips.length > 0 && (
                            <div className="detail-section">
                                <h4>Dicas</h4>
                                <ul className="tips-list">
                                    {selectedExercise.tips.map((tip, i) => (
                                        <li key={i}>{tip}</li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                )}
            </Modal>

            <div style={{ height: 100 }} />
        </div>
    );
}
