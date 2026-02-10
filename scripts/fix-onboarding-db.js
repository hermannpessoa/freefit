#!/usr/bin/env node

/**
 * Script para corrigir status de onboarding
 * Executa via Transaction Pooler do Supabase
 *
 * Uso: npm run db:fix-onboarding
 */

import pg from 'pg';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Carregar variáveis de ambiente
dotenv.config({ path: join(__dirname, '..', '.env.local') });

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
    console.error('❌ DATABASE_URL não encontrada no .env.local');
    process.exit(1);
}

const { Pool } = pg;

// Conectar ao banco via Transaction Pooler
const pool = new Pool({
    connectionString: DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

async function main() {
    console.log('🔧 Corrigindo status de onboarding...');
    console.log('🔗 Conectando via Transaction Pooler...');

    try {
        // Testar conexão
        await pool.query('SELECT NOW()');
        console.log('✅ Conectado ao banco de dados');

        // Buscar perfis com onboarding_data mas não marcados como completo
        const { rows: profiles } = await pool.query(`
            SELECT
                id,
                name,
                email,
                onboarding_completed,
                onboarding_data IS NOT NULL as has_data
            FROM profiles
            WHERE onboarding_data IS NOT NULL
              AND (onboarding_completed = FALSE OR onboarding_completed IS NULL)
        `);

        if (profiles.length === 0) {
            console.log('\n✅ Nenhum perfil precisa de correção!');
            console.log('   Todos os perfis com dados estão marcados como completos.');
        } else {
            console.log(`\n📋 Encontrados ${profiles.length} perfil(s) para corrigir:`);
            profiles.forEach(p => {
                console.log(`   - ${p.name || p.email} (${p.email})`);
            });

            // Corrigir
            const { rowCount } = await pool.query(`
                UPDATE profiles
                SET
                    onboarding_completed = TRUE,
                    updated_at = NOW()
                WHERE onboarding_data IS NOT NULL
                  AND (onboarding_completed = FALSE OR onboarding_completed IS NULL)
            `);

            console.log(`\n✅ ${rowCount} perfil(s) corrigido(s)!`);
        }

        // Mostrar resumo
        console.log('\n📊 Resumo do banco:');
        const { rows: summary } = await pool.query(`
            SELECT
                COUNT(*) as total,
                COUNT(*) FILTER (WHERE onboarding_completed = TRUE) as completos,
                COUNT(*) FILTER (WHERE onboarding_data IS NOT NULL) as com_dados
            FROM profiles
        `);

        console.log(`   Total de perfis: ${summary[0].total}`);
        console.log(`   Onboarding completo: ${summary[0].completos}`);
        console.log(`   Com dados salvos: ${summary[0].com_dados}`);

        console.log('\n✅ CORREÇÃO COMPLETA!');

    } catch (error) {
        console.error('\n❌ ERRO:');
        console.error(error);
        process.exit(1);
    } finally {
        await pool.end();
        console.log('\n👋 Desconectado do banco de dados');
    }
}

main();
