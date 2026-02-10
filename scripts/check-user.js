/**
 * Script para verificar o status de um usuário no Supabase
 * Usage: node scripts/check-user.js email@example.com
 */

import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

// Load environment variables
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;
const isServiceKey = !!process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY in .env.local');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkUser(email) {
    console.log(`\n🔍 Verificando usuário: ${email}\n`);

    if (!isServiceKey) {
        console.log('⚠️  Usando chave anon (funcionalidade limitada)\n');
    }

    try {
        // Try to check profile directly (works with anon key)
        const { data: profiles, error: profileSearchError } = await supabase
            .from('profiles')
            .select('*')
            .eq('email', email);

        if (profileSearchError) {
            console.error('❌ Erro ao buscar profiles:', profileSearchError.message);
        }

        if (profiles && profiles.length > 0) {
            const profile = profiles[0];
            console.log('✅ Profile encontrado!');
            console.log('📧 Email:', profile.email);
            console.log('🆔 ID:', profile.id);
            console.log('   Nome:', profile.name || 'Não definido');
            console.log('   Onboarding completo?', profile.onboarding_completed ? '✅ Sim' : '❌ Não');
            console.log('   Level:', profile.level);
            console.log('   XP:', profile.total_xp);

            console.log('\n📝 SUGESTÃO:');
            console.log('Tente fazer login novamente e veja os logs no console do navegador (F12).');
            console.log('Os logs vão mostrar exatamente onde está falhando.');
        } else {
            console.log('⚠️  Nenhum profile encontrado com esse email');
            console.log('\n💡 POSSÍVEIS CAUSAS:');
            console.log('1. A conta foi criada mas precisa confirmar o email');
            console.log('2. O email está incorreto');
            console.log('3. A conta não existe');
        }

        if (isServiceKey) {
            // Get user from auth.users (requires service key)
            const { data: { users }, error: authError } = await supabase.auth.admin.listUsers();

            if (authError) {
                console.error('\n❌ Erro ao buscar usuários auth:', authError);
                return;
            }

            const user = users.find(u => u.email === email);

            if (!user) {
                console.log('\n❌ Usuário não encontrado no sistema de autenticação');
                return;
            }

            console.log('\n🔐 AUTH INFO:');
            console.log('📅 Criado em:', user.created_at);
            console.log('🔐 Email confirmado?', user.email_confirmed_at ? '✅ Sim' : '❌ Não');
            console.log('🔑 Último login:', user.last_sign_in_at || 'Nunca');

            // If email not confirmed, show how to confirm
            if (!user.email_confirmed_at) {
                console.log('\n⚠️  AÇÃO NECESSÁRIA:');
                console.log('O email não foi confirmado. O usuário precisa:');
                console.log('1. Verificar a caixa de entrada (incluindo spam)');
                console.log('2. Clicar no link de confirmação');
            }
        }

    } catch (error) {
        console.error('\n❌ Erro:', error.message);
    }
}

// Get email from command line
const email = process.argv[2];

if (!email) {
    console.error('❌ Por favor, forneça um email:');
    console.error('   npm run check-user email@example.com');
    process.exit(1);
}

checkUser(email);
