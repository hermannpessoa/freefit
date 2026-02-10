-- ========================================
-- FIX ONBOARDING STATUS
-- Execute este SQL no Supabase SQL Editor
-- ========================================

-- 1. Verificar estado atual do perfil
SELECT
  id,
  name,
  email,
  onboarding_completed,
  onboarding_data,
  created_at,
  updated_at
FROM profiles
WHERE email = 'seu-email@aqui.com'; -- SUBSTITUA pelo seu email

-- ========================================
-- 2. CORRIGIR: Marcar onboarding como completo
--    DESCOMENTE as linhas abaixo e execute
-- ========================================

/*
UPDATE profiles
SET
  onboarding_completed = TRUE,
  updated_at = NOW()
WHERE email = 'seu-email@aqui.com' -- SUBSTITUA pelo seu email
  AND onboarding_data IS NOT NULL;

-- Verificar se foi atualizado
SELECT
  id,
  name,
  onboarding_completed,
  onboarding_data
FROM profiles
WHERE email = 'seu-email@aqui.com'; -- SUBSTITUA pelo seu email
*/

-- ========================================
-- 3. ALTERNATIVA: Corrigir TODOS os perfis
--    que têm onboarding_data mas não estão marcados como completo
-- ========================================

/*
UPDATE profiles
SET
  onboarding_completed = TRUE,
  updated_at = NOW()
WHERE onboarding_data IS NOT NULL
  AND onboarding_completed = FALSE;

-- Ver quantos foram atualizados
SELECT COUNT(*) as total_corrigidos
FROM profiles
WHERE onboarding_completed = TRUE
  AND onboarding_data IS NOT NULL;
*/
