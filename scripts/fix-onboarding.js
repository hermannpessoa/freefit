/**
 * FIX ONBOARDING STATUS
 *
 * Execute este script no console do navegador (F12)
 * Copie e cole todo o código abaixo e pressione Enter
 */

(async function fixOnboardingStatus() {
    console.log('🔧 Iniciando correção de onboarding...');

    try {
        // 1. Importar supabase da aplicação
        const { supabase } = await import('./src/lib/supabase.js');

        if (!supabase) {
            console.error('❌ Supabase não disponível');
            return;
        }

        // 2. Verificar sessão atual
        const { data: { session } } = await supabase.auth.getSession();

        if (!session?.user) {
            console.error('❌ Nenhum usuário logado!');
            return;
        }

        console.log('✅ Usuário logado:', session.user.id);

        // 3. Buscar perfil atual
        const { data: profile, error: fetchError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();

        if (fetchError) {
            console.error('❌ Erro ao buscar perfil:', fetchError);
            return;
        }

        console.log('📊 Perfil atual:', profile);
        console.log('🎯 onboarding_completed:', profile.onboarding_completed);
        console.log('📝 onboarding_data:', profile.onboarding_data);

        // 4. Verificar se precisa corrigir
        if (profile.onboarding_completed === true) {
            console.log('✅ Onboarding já está marcado como completo!');
            console.log('🔄 Limpando cache e recarregando...');
            localStorage.clear();
            location.reload();
            return;
        }

        // 5. Corrigir o status
        console.log('🔧 Corrigindo status de onboarding...');

        const { data: updatedProfile, error: updateError } = await supabase
            .from('profiles')
            .update({
                onboarding_completed: true,
                updated_at: new Date().toISOString()
            })
            .eq('id', session.user.id)
            .select()
            .single();

        if (updateError) {
            console.error('❌ Erro ao atualizar perfil:', updateError);
            alert('Erro ao corrigir perfil: ' + updateError.message);
            return;
        }

        console.log('✅ Perfil atualizado:', updatedProfile);
        console.log('🎉 Status corrigido com sucesso!');

        // 6. Limpar localStorage e recarregar
        console.log('🧹 Limpando cache local...');
        localStorage.clear();

        console.log('🔄 Recarregando página...');
        setTimeout(() => {
            location.reload();
        }, 1000);

    } catch (error) {
        console.error('❌ Erro fatal:', error);
        alert('Erro ao executar script: ' + error.message);
    }
})();
