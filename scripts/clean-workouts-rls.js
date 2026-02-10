#!/usr/bin/env node

/**
 * Remove políticas duplicadas da tabela workouts
 * Execute: node scripts/clean-workouts-rls.js
 */

import pg from 'pg';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '..', '.env.local') });

const { Pool } = pg;
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

async function main() {
    console.log('🧹 Limpando políticas duplicadas da tabela workouts...\n');

    try {
        // Remover TODAS as políticas antigas
        console.log('1️⃣ Removendo todas as políticas antigas...');
        const policiesToRemove = [
            "Users can view own workouts",
            "Users can insert own workouts",
            "Users can update own workouts",
            "Users can delete own workouts",
            "Users can view their own workouts",
            "Users can insert their own workouts",
            "Users can update their own workouts",
            "Users can delete their own workouts"
        ];

        for (const policy of policiesToRemove) {
            try {
                await pool.query(`DROP POLICY IF EXISTS "${policy}" ON workouts;`);
                console.log(`  ✅ Removido: ${policy}`);
            } catch (error) {
                console.log(`  ⚠️ Erro ao remover ${policy}: ${error.message}`);
            }
        }

        // Criar políticas limpas
        console.log('\n2️⃣ Criando políticas limpas...');

        await pool.query(`
            CREATE POLICY "workouts_select_policy"
            ON workouts FOR SELECT
            USING (auth.uid() = user_id);
        `);
        console.log('  ✅ Política SELECT criada');

        await pool.query(`
            CREATE POLICY "workouts_insert_policy"
            ON workouts FOR INSERT
            WITH CHECK (auth.uid() = user_id);
        `);
        console.log('  ✅ Política INSERT criada');

        await pool.query(`
            CREATE POLICY "workouts_update_policy"
            ON workouts FOR UPDATE
            USING (auth.uid() = user_id)
            WITH CHECK (auth.uid() = user_id);
        `);
        console.log('  ✅ Política UPDATE criada');

        await pool.query(`
            CREATE POLICY "workouts_delete_policy"
            ON workouts FOR DELETE
            USING (auth.uid() = user_id);
        `);
        console.log('  ✅ Política DELETE criada');

        // Verificar resultado final
        console.log('\n3️⃣ Verificando políticas finais...');
        const { rows: policies } = await pool.query(`
            SELECT policyname, cmd
            FROM pg_policies
            WHERE tablename = 'workouts'
            ORDER BY cmd, policyname;
        `);

        console.log('\n📋 Políticas finais na tabela workouts:');
        policies.forEach(p => {
            console.log(`  - ${p.policyname} (${p.cmd})`);
        });

        console.log('\n🎉 Limpeza concluída! Agora teste excluir um treino.');

    } catch (error) {
        console.error('\n❌ Erro:', error.message);
        process.exit(1);
    } finally {
        await pool.end();
    }
}

main();
