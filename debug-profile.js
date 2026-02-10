/**
 * DEBUG SCRIPT - Verificar estado do perfil
 *
 * Como usar:
 * 1. Abra o navegador (F12)
 * 2. Cole este código no console
 * 3. Execute
 * 4. Copie o resultado e me envie
 */

import { supabase } from './src/lib/supabase';

async function debugProfile() {
  console.log('=== DEBUG PROFILE ===');

  // 1. Verificar sessão
  const { data: { session } } = await supabase.auth.getSession();
  console.log('Session:', session?.user?.id);

  if (!session?.user) {
    console.error('❌ Nenhum usuário logado!');
    return;
  }

  // 2. Buscar perfil do Supabase
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', session.user.id)
    .maybeSingle();

  console.log('Profile do Supabase:', profile);
  console.log('Error:', error);

  // 3. Verificar localStorage
  const localData = localStorage.getItem('myfit-app-state');
  const parsed = localData ? JSON.parse(localData) : null;
  console.log('LocalStorage:', parsed);

  // 4. Comparar
  console.log('\n=== ANÁLISE ===');
  console.log('Supabase onboarding_completed:', profile?.onboarding_completed);
  console.log('LocalStorage onboardingCompleted:', parsed?.onboardingCompleted);

  if (profile?.onboarding_completed === false) {
    console.warn('⚠️ Supabase mostra onboarding NÃO completo!');
  } else if (profile?.onboarding_completed === true) {
    console.log('✅ Supabase mostra onboarding COMPLETO');
  }

  return {
    supabase: profile,
    localStorage: parsed
  };
}

debugProfile();
