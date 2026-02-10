#!/usr/bin/env node

/**
 * Adiciona a coluna day_of_week à tabela workouts
 * Execute: npm run db:add-day-of-week
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
    console.log('📅 Adicionando coluna day_of_week à tabela workouts...\n');

    try {
        // Verificar se a coluna já existe
        const { rows } = await pool.query(`
            SELECT column_name
            FROM information_schema.columns
            WHERE table_name = 'workouts' AND column_name = 'day_of_week';
        `);

        if (rows.length > 0) {
            console.log('✅ Coluna day_of_week já existe na tabela workouts');
        } else {
            console.log('➕ Adicionando coluna day_of_week...');

            await pool.query(`
                ALTER TABLE workouts
                ADD COLUMN day_of_week INTEGER;
            `);

            console.log('✅ Coluna day_of_week adicionada com sucesso!');
        }

        // Adicionar comentário descrevendo o campo
        await pool.query(`
            COMMENT ON COLUMN workouts.day_of_week IS 'Dia da semana para treinos semanais (1=Segunda, 2=Terça, ..., 7=Domingo)';
        `);

        console.log('📝 Comentário da coluna atualizado');
        console.log('\n🎉 Script concluído com sucesso!');

    } catch (error) {
        console.error('\n❌ Erro:', error.message);
        process.exit(1);
    } finally {
        await pool.end();
    }
}

main();
