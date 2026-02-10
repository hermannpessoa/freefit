#!/usr/bin/env node

/**
 * Adiciona coluna ai_metadata à tabela workouts
 * Execute: npm run db:add-ai-metadata
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
    console.log('🔧 Adicionando colunas AI à tabela workouts...\n');

    try {
        // Verificar se as colunas já existem
        const checkColumns = await pool.query(`
            SELECT column_name
            FROM information_schema.columns
            WHERE table_name = 'workouts'
            AND column_name IN ('ai_metadata', 'workout_type')
        `);

        const existingColumns = checkColumns.rows.map(r => r.column_name);

        // Adicionar ai_metadata se não existir
        if (!existingColumns.includes('ai_metadata')) {
            console.log('➕ Adicionando coluna ai_metadata...');
            await pool.query(`
                ALTER TABLE workouts
                ADD COLUMN ai_metadata JSONB DEFAULT NULL
            `);
            console.log('✅ Coluna ai_metadata adicionada com sucesso!');
        } else {
            console.log('✅ Coluna ai_metadata já existe!');
        }

        // Adicionar workout_type se não existir
        if (!existingColumns.includes('workout_type')) {
            console.log('➕ Adicionando coluna workout_type...');
            await pool.query(`
                ALTER TABLE workouts
                ADD COLUMN workout_type TEXT DEFAULT 'manual'
            `);
            console.log('✅ Coluna workout_type adicionada com sucesso!');
        } else {
            console.log('✅ Coluna workout_type já existe!');
        }

        // Verificar estrutura da tabela
        const { rows: columns } = await pool.query(`
            SELECT column_name, data_type, is_nullable
            FROM information_schema.columns
            WHERE table_name = 'workouts'
            ORDER BY ordinal_position
        `);

        console.log('\n📋 Estrutura da tabela workouts:');
        console.table(columns);

        // Contar workouts
        const { rows: [{ count }] } = await pool.query('SELECT COUNT(*) as count FROM workouts');
        console.log(`\n📊 Total de workouts: ${count}`);

        console.log('\n🎉 Concluído!');

    } catch (error) {
        console.error('\n❌ Erro:', error.message);
        process.exit(1);
    } finally {
        await pool.end();
    }
}

main();
