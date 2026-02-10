#!/usr/bin/env node

/**
 * Script para verificar estado do banco
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
    try {
        console.log('📊 Estado do Banco de Dados\n');
       console.log('='.repeat(50));

        // Contar registros
        const counts = await Promise.all([
            pool.query('SELECT COUNT(*) as count FROM profiles'),
            pool.query('SELECT COUNT(*) as count FROM workouts'),
            pool.query('SELECT COUNT(*) as count FROM exercises'),
            pool.query('SELECT COUNT(*) as count FROM workout_history'),
            pool.query('SELECT COUNT(*) as count FROM progress_records')
        ]);

        console.log(`\n✅ Profiles: ${counts[0].rows[0].count}`);
        console.log(`✅ Workouts: ${counts[1].rows[0].count}`);
        console.log(`✅ Exercises: ${counts[2].rows[0].count}`);
        console.log(`✅ Histórico: ${counts[3].rows[0].count}`);
        console.log(`✅ Progress Records: ${counts[4].rows[0].count}`);

        // Exercícios por categoria
        const byCategory = await pool.query(`
            SELECT category, COUNT(*) as count
            FROM exercises
            GROUP BY category
            ORDER BY count DESC
        `);

        console.log(`\n📋 Exercícios por Categoria:`);
        byCategory.rows.forEach(row => {
            console.log(`   ${row.category}: ${row.count}`);
        });

        // Profiles com onboarding completo
        const profiles = await pool.query(`
            SELECT
                name,
                email,
                onboarding_completed,
                onboarding_data IS NOT NULL as has_data
            FROM profiles
        `);

        console.log(`\n👤 Perfis:`);
        profiles.rows.forEach(p => {
            const status = p.onboarding_completed ? '✅' : '❌';
            console.log(`   ${status} ${p.name || p.email} ${p.has_data ? '(dados salvos)' : '(sem dados)'}`);
        });

        console.log('\n' + '='.repeat(50));

    } catch (error) {
        console.error('❌ Erro:', error.message);
    } finally {
        await pool.end();
    }
}

main();
