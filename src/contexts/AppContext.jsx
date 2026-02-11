import { createContext, useContext, useReducer, useEffect, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { supabase } from '../lib/supabase';

const initialState = {
    user: null,
    isAuthenticated: false,
    isLoading: true,
    onboardingCompleted: false,
    onboardingData: {
        goal: null, fitnessLevel: null, daysPerWeek: null,
        equipment: [], preferredTime: null, injuries: [],
        age: null, weight: null, height: null, gender: null,
    },
    profile: {
        name: '', email: '', avatar: null, streak: 0,
        totalWorkouts: 0, totalXp: 0, level: 1, badges: [],
    },
    workouts: [],
    activeWorkout: null,
    workoutHistory: [],
    exercises: [],
    exercisesLoaded: false,
    progressRecords: [],
    subscription: { status: 'trial', plan: null, trialEndsAt: null },
    notifications: [],
};

const ActionTypes = {
    SET_USER: 'SET_USER', LOGOUT: 'LOGOUT', SET_LOADING: 'SET_LOADING',
    UPDATE_ONBOARDING: 'UPDATE_ONBOARDING', COMPLETE_ONBOARDING: 'COMPLETE_ONBOARDING',
    UPDATE_PROFILE: 'UPDATE_PROFILE', SET_WORKOUTS: 'SET_WORKOUTS',
    ADD_WORKOUT: 'ADD_WORKOUT', UPDATE_WORKOUT: 'UPDATE_WORKOUT',
    DELETE_WORKOUT: 'DELETE_WORKOUT', START_WORKOUT: 'START_WORKOUT',
    COMPLETE_WORKOUT: 'COMPLETE_WORKOUT', SET_EXERCISES: 'SET_EXERCISES',
    ADD_PROGRESS_RECORD: 'ADD_PROGRESS_RECORD', UPDATE_SUBSCRIPTION: 'UPDATE_SUBSCRIPTION',
    ADD_NOTIFICATION: 'ADD_NOTIFICATION', REMOVE_NOTIFICATION: 'REMOVE_NOTIFICATION',
    ADD_XP: 'ADD_XP', LOAD_STATE: 'LOAD_STATE',
};

function appReducer(state, action) {
    switch (action.type) {
        case ActionTypes.SET_USER:
            // Keep loading true until profile data is loaded
            return { ...state, user: action.payload, isAuthenticated: !!action.payload };
        case ActionTypes.LOGOUT:
            return { ...initialState, isLoading: false, exercises: state.exercises };
        case ActionTypes.SET_LOADING:
            return { ...state, isLoading: action.payload };
        case ActionTypes.UPDATE_ONBOARDING:
            return { ...state, onboardingData: { ...state.onboardingData, ...action.payload } };
        case ActionTypes.COMPLETE_ONBOARDING:
            return {
                ...state, onboardingCompleted: true,
                profile: { ...state.profile, ...action.payload },
                subscription: { ...state.subscription, status: 'trial', trialEndsAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() },
            };
        case ActionTypes.UPDATE_PROFILE:
            return { ...state, profile: { ...state.profile, ...action.payload } };
        case ActionTypes.SET_WORKOUTS:
            return { ...state, workouts: action.payload };
        case ActionTypes.ADD_WORKOUT:
            return { ...state, workouts: [...state.workouts, action.payload] };
        case ActionTypes.UPDATE_WORKOUT:
            return { ...state, workouts: state.workouts.map(w => w.id === action.payload.id ? { ...w, ...action.payload } : w) };
        case ActionTypes.DELETE_WORKOUT:
            return { ...state, workouts: state.workouts.filter(w => w.id !== action.payload) };
        case ActionTypes.START_WORKOUT:
            return { ...state, activeWorkout: { ...action.payload, startedAt: new Date().toISOString(), completedSets: [], currentExerciseIndex: 0 } };
        case ActionTypes.COMPLETE_WORKOUT: {
            const session = { id: uuidv4(), workoutId: state.activeWorkout?.id, workoutName: state.activeWorkout?.name, completedAt: new Date().toISOString(), ...action.payload };
            return {
                ...state, activeWorkout: null, workoutHistory: [session, ...state.workoutHistory],
                profile: { ...state.profile, totalWorkouts: state.profile.totalWorkouts + 1, totalXp: state.profile.totalXp + (action.payload.xpEarned || 50) },
            };
        }
        case ActionTypes.SET_EXERCISES:
            return { ...state, exercises: action.payload, exercisesLoaded: true };
        case ActionTypes.ADD_PROGRESS_RECORD:
            return { ...state, progressRecords: [...state.progressRecords, action.payload] };
        case ActionTypes.UPDATE_SUBSCRIPTION:
            return { ...state, subscription: { ...state.subscription, ...action.payload } };
        case ActionTypes.ADD_NOTIFICATION:
            return { ...state, notifications: [...state.notifications, { id: uuidv4(), ...action.payload }] };
        case ActionTypes.REMOVE_NOTIFICATION:
            return { ...state, notifications: state.notifications.filter(n => n.id !== action.payload) };
        case ActionTypes.ADD_XP: {
            const newXp = state.profile.totalXp + action.payload;
            return { ...state, profile: { ...state.profile, totalXp: newXp, level: Math.floor(newXp / 500) + 1 } };
        }
        case ActionTypes.LOAD_STATE:
            return { ...state, ...action.payload, isLoading: false };
        default:
            return state;
    }
}

const AppContext = createContext(null);
const STORAGE_KEY = 'myfit_ai_state';

export function AppProvider({ children }) {
    const [state, dispatch] = useReducer(appReducer, initialState);
    const isLoadingProfile = useRef(false);
    const hasLoadedInitially = useRef(false);
    const lastLoadedUserId = useRef(null);

    useEffect(() => {
        // Always run: set up auth listener and load user state.
        // The isLoadingProfile ref prevents concurrent profile fetches.

        // Sync with Supabase Auth first, then load from localStorage if needed
        const loadUserState = async () => {
            if (isLoadingProfile.current) {
                console.log('⚠️ Já está carregando profile, ignorando chamada duplicada');
                return;
            }
            isLoadingProfile.current = true;

            try {
                // Detect if we're in an OAuth callback (hash has tokens)
                const hash = window.location.hash;
                const isOAuthCallback = hash && (hash.includes('access_token') || hash.includes('refresh_token'));

                if (isOAuthCallback) {
                    console.log('🔑 AppContext: OAuth callback detected, waiting for AuthCallbackPage to handle session...');
                    // Don't call getSession() here — AuthCallbackPage will call setSession()
                    // which triggers onAuthStateChange, and our listener below will handle it.
                    isLoadingProfile.current = false;
                    return;
                }

                console.log('🔄 AppContext: Carregando estado do usuário...');
                const { data: { session } } = await supabase.auth.getSession();

                if (session?.user) {
                    console.log('✅ Sessão encontrada:', session.user.id);
                    // Don't set loading to false yet, wait for profile data
                    dispatch({ type: ActionTypes.SET_USER, payload: session.user });

                    // Timeout de 10s para evitar loading infinito
                    const profilePromise = supabase
                        .from('profiles')
                        .select('*')
                        .eq('id', session.user.id)
                        .maybeSingle();

                    const timeoutPromise = new Promise((_, reject) =>
                        setTimeout(() => reject(new Error('Timeout ao carregar profile')), 10000)
                    );

                    let profileData, error;
                    try {
                        const result = await Promise.race([profilePromise, timeoutPromise]);
                        profileData = result.data;
                        error = result.error;
                    } catch (timeoutError) {
                        console.error('⏱️ Timeout ao carregar profile, usando dados do localStorage');
                        // Try to load from localStorage as fallback
                        const saved = localStorage.getItem(STORAGE_KEY);
                        if (saved) {
                            dispatch({ type: ActionTypes.LOAD_STATE, payload: JSON.parse(saved) });
                        } else {
                            dispatch({ type: ActionTypes.SET_LOADING, payload: false });
                        }
                        return;
                    }

                    console.log('📊 Profile do Supabase:', profileData);
                    console.log('🎯 onboarding_completed:', profileData?.onboarding_completed);

                    if (error) {
                        console.error('❌ Erro ao carregar profile:', error);
                        dispatch({ type: ActionTypes.SET_LOADING, payload: false });
                        return;
                    }

                    if (profileData) {
                        // ALWAYS use Supabase value for onboarding_completed, never from localStorage
                        const stateUpdate = {
                            onboardingCompleted: profileData.onboarding_completed === true,
                            profile: {
                                name: profileData.name || '',
                                email: profileData.email || session.user.email,
                                avatar: profileData.avatar || null,
                                streak: profileData.streak || 0,
                                totalWorkouts: profileData.total_workouts || 0,
                                totalXp: profileData.total_xp || 0,
                                level: Math.floor((profileData.total_xp || 0) / 500) + 1,
                                badges: profileData.badges || [],
                            }
                        };
                        if (profileData.onboarding_data) {
                            stateUpdate.onboardingData = profileData.onboarding_data;
                        }

                        console.log('💾 Atualizando state com:', stateUpdate);
                        console.log('✅ onboardingCompleted será:', stateUpdate.onboardingCompleted);
                        dispatch({ type: ActionTypes.LOAD_STATE, payload: stateUpdate });
                        console.log('🏁 Loading concluído - state atualizado com dados do Supabase');
                        lastLoadedUserId.current = session.user.id; // Marca como carregado
                    } else {
                        console.warn('⚠️ Profile não encontrado no Supabase');
                        // Profile doesn't exist yet, set loading to false
                        dispatch({ type: ActionTypes.SET_LOADING, payload: false });
                    }
                } else {
                    console.log('❌ Sem sessão, carregando do localStorage');
                    // No session, try to load from localStorage
                    const saved = localStorage.getItem(STORAGE_KEY);
                    if (saved) {
                        dispatch({ type: ActionTypes.LOAD_STATE, payload: JSON.parse(saved) });
                    } else {
                        dispatch({ type: ActionTypes.SET_LOADING, payload: false });
                    }
                }
            } catch (error) {
                console.error('❌ Erro ao carregar estado:', error);
                dispatch({ type: ActionTypes.SET_LOADING, payload: false });
            } finally {
                isLoadingProfile.current = false;
            }
        };

        loadUserState();

        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
            console.log('🔔 Auth state changed, event:', _event, 'user:', session?.user?.id);

            if (session?.user) {
                // Evita recarregar profile do mesmo usuário
                if (lastLoadedUserId.current === session.user.id) {
                    console.log('⚠️ Profile do usuário', session.user.id, 'já foi carregado, pulando');
                    // Still make sure we're not stuck in loading
                    if (state.isLoading) {
                        dispatch({ type: ActionTypes.SET_LOADING, payload: false });
                    }
                    return;
                }

                // Evita múltiplas chamadas simultâneas
                if (isLoadingProfile.current) {
                    console.log('⚠️ Já está carregando profile no auth change, ignorando');
                    return;
                }
                isLoadingProfile.current = true;

                try {
                    // Keep loading true until profile is loaded
                    dispatch({ type: ActionTypes.SET_USER, payload: session.user });
                    console.log('🔄 Auth state changed, carregando profile...');

                    // Timeout de 10s para evitar loading infinito
                    const profilePromise = supabase
                        .from('profiles')
                        .select('*')
                        .eq('id', session.user.id)
                        .maybeSingle();

                    const timeoutPromise = new Promise((_, reject) =>
                        setTimeout(() => reject(new Error('Timeout ao carregar profile')), 10000)
                    );

                    let profileData, error;
                    try {
                        const result = await Promise.race([profilePromise, timeoutPromise]);
                        profileData = result.data;
                        error = result.error;
                        console.log('📊 Profile carregado:', profileData ? 'encontrado' : 'não encontrado');
                    } catch (timeoutError) {
                        console.error('⏱️ Timeout ao carregar profile, usando dados do localStorage');
                        // Try to load from localStorage as fallback
                        const saved = localStorage.getItem(STORAGE_KEY);
                        if (saved) {
                            const savedData = JSON.parse(saved);
                            dispatch({ type: ActionTypes.LOAD_STATE, payload: savedData });
                        } else {
                            dispatch({ type: ActionTypes.SET_LOADING, payload: false });
                        }
                        return;
                    }

                    if (error) {
                        console.error('❌ Erro ao carregar profile:', error);
                        dispatch({ type: ActionTypes.SET_LOADING, payload: false });
                        return;
                    }

                    if (profileData) {
                        // ALWAYS use Supabase value for onboarding_completed, never from localStorage
                        const stateUpdate = {
                            onboardingCompleted: profileData.onboarding_completed === true,
                            profile: {
                                name: profileData.name || '',
                                email: profileData.email || session.user.email,
                                avatar: profileData.avatar || null,
                                streak: profileData.streak || 0,
                                totalWorkouts: profileData.total_workouts || 0,
                                totalXp: profileData.total_xp || 0,
                                level: Math.floor((profileData.total_xp || 0) / 500) + 1,
                                badges: profileData.badges || [],
                            }
                        };
                        if (profileData.onboarding_data) {
                            stateUpdate.onboardingData = profileData.onboarding_data;
                        }
                        dispatch({ type: ActionTypes.LOAD_STATE, payload: stateUpdate });
                        console.log('🏁 Auth state updated com dados do Supabase');
                        lastLoadedUserId.current = session.user.id; // Marca como carregado
                    } else {
                        console.warn('⚠️ Profile não encontrado no auth state change');
                        dispatch({ type: ActionTypes.SET_LOADING, payload: false });
                    }
                } catch (error) {
                    console.error('❌ Erro no onAuthStateChange:', error);
                    dispatch({ type: ActionTypes.SET_LOADING, payload: false });
                } finally {
                    isLoadingProfile.current = false;
                }
            } else {
                lastLoadedUserId.current = null; // Reset quando faz logout
                dispatch({ type: ActionTypes.LOGOUT });
            }
        });

        return () => subscription?.unsubscribe();
    }, []);

    useEffect(() => {
        if (!state.isLoading) {
            const toSave = { user: state.user, isAuthenticated: state.isAuthenticated, onboardingCompleted: state.onboardingCompleted, onboardingData: state.onboardingData, profile: state.profile, workouts: state.workouts, workoutHistory: state.workoutHistory, progressRecords: state.progressRecords, subscription: state.subscription };
            localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
        }
    }, [state]);

    const actions = {
        login: (u) => dispatch({ type: ActionTypes.SET_USER, payload: u }),
        logout: () => { localStorage.removeItem(STORAGE_KEY); dispatch({ type: ActionTypes.LOGOUT }); },
        updateOnboarding: (d) => dispatch({ type: ActionTypes.UPDATE_ONBOARDING, payload: d }),
        completeOnboarding: (d) => dispatch({ type: ActionTypes.COMPLETE_ONBOARDING, payload: d }),
        updateProfile: (d) => dispatch({ type: ActionTypes.UPDATE_PROFILE, payload: d }),
        setWorkouts: (w) => dispatch({ type: ActionTypes.SET_WORKOUTS, payload: w }),
        addWorkout: (w) => { const nw = { id: uuidv4(), createdAt: new Date().toISOString(), ...w }; dispatch({ type: ActionTypes.ADD_WORKOUT, payload: nw }); return nw; },
        updateWorkout: (w) => dispatch({ type: ActionTypes.UPDATE_WORKOUT, payload: w }),
        deleteWorkout: (id) => dispatch({ type: ActionTypes.DELETE_WORKOUT, payload: id }),
        startWorkout: (w) => dispatch({ type: ActionTypes.START_WORKOUT, payload: w }),
        completeWorkout: (d) => dispatch({ type: ActionTypes.COMPLETE_WORKOUT, payload: d }),
        setExercises: (e) => dispatch({ type: ActionTypes.SET_EXERCISES, payload: e }),
        addProgressRecord: (r) => dispatch({ type: ActionTypes.ADD_PROGRESS_RECORD, payload: r }),
        updateSubscription: (d) => dispatch({ type: ActionTypes.UPDATE_SUBSCRIPTION, payload: d }),
        addNotification: (n) => { dispatch({ type: ActionTypes.ADD_NOTIFICATION, payload: n }); setTimeout(() => dispatch({ type: ActionTypes.REMOVE_NOTIFICATION, payload: n.id }), 5000); },
        removeNotification: (id) => dispatch({ type: ActionTypes.REMOVE_NOTIFICATION, payload: id }),
        addXp: (amt) => dispatch({ type: ActionTypes.ADD_XP, payload: amt }),
    };

    return <AppContext.Provider value={{ state, actions }}>{children}</AppContext.Provider>;
}

export function useApp() {
    const ctx = useContext(AppContext);
    if (!ctx) throw new Error('useApp must be used within AppProvider');
    return ctx;
}

export default AppContext;
