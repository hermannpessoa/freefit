#!/usr/bin/env node

/**
 * Corrige as permissões RLS (Row Level Security) da tabela workouts
 * Execute: node scripts/fix-workouts-rls.js
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
    console.log('🔐 Verificando e corrigindo permissões RLS da tabela workouts...\n');

    try {
        // 1. Verificar se RLS está habilitado
        console.log('1️⃣ Verificando se RLS está habilitado...');
        const { rows: rlsStatus } = await pool.query(`
            SELECT relname, relrowsecurity
            FROM pg_class
            WHERE relname = 'workouts'
        `);

        if (rlsStatus[0]?.relrowsecurity) {
            console.log('✅ RLS já está habilitado na tabela workouts');
        } else {
            console.log('⚠️ RLS não está habilitado, habilitando...');
            await pool.query('ALTER TABLE workouts ENABLE ROW LEVEL SECURITY;');
            console.log('✅ RLS habilitado!');
        }

        // 2. Remover políticas existentes
        console.log('\n2️⃣ Removendo políticas antigas...');
        await pool.query(`DROP POLICY IF EXISTS "Users can view their own workouts" ON workouts;`);
        await pool.query(`DROP POLICY IF EXISTS "Users can insert their own workouts" ON workouts;`);
        await pool.query(`DROP POLICY IF EXISTS "Users can update their own workouts" ON workouts;`);
        await pool.query(`DROP POLICY IF EXISTS "Users can delete their own workouts" ON workouts;`);
        console.log('✅ Políticas antigas removidas');

        // 3. Criar novas políticas
        console.log('\n3️⃣ Criando novas políticas RLS...');

        // SELECT - ver próprios treinos
        await pool.query(`
            CREATE POLICY "Users can view their own workouts"
            ON workouts FOR SELECT
            USING (auth.uid() = user_id);
        `);
        console.log('✅ Política SELECT criada');

        // INSERT - criar próprios treinos
        await pool.query(`
            CREATE POLICY "Users can insert their own workouts"
            ON workouts FOR INSERT
            WITH CHECK (auth.uid() = user_id);
        `);
        console.log('✅ Política INSERT criada');

        // UPDATE - atualizar próprios treinos
        await pool.query(`
            CREATE POLICY "Users can update their own workouts"
            ON workouts FOR UPDATE
            USING (auth.uid() = user_id)
            WITH CHECK (auth.uid() = user_id);
        `);
        console.log('✅ Política UPDATE criada');

        // DELETE - excluir próprios treinos
        await pool.query(`
            CREATE POLICY "Users can delete their own workouts"
            ON workouts FOR DELETE
            USING (auth.uid() = user_id);
        `);
        console.log('✅ Política DELETE criada');

        // 4. Verificar políticas criadas
        console.log('\n4️⃣ Verificando políticas criadas...');
        const { rows: policies } = await pool.query(`
            SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
            FROM pg_policies
            WHERE tablename = 'workouts'
            ORDER BY policyname;
        `);

        console.log('\n📋 Políticas ativas na tabela workouts:');
        policies.forEach(p => {
            console.log(`  - ${p.policyname} (${p.cmd})`);
        });

        console.log('\n🎉 Permissões RLS configuradas com sucesso!');
        console.log('\n💡 Agora tente excluir um treino novamente.');

    } catch (error) {
        console.error('\n❌ Erro:', error.message);
        process.exit(1);
    } finally {
        await pool.end();
    }
}

main();
