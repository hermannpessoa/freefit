#!/usr/bin/env node

/**
 * Adicionar exercícios específicos Nakagym
 * Execute: npm run db:add-nakagym
 */

import pg from 'pg';
import { readFileSync } from 'fs';
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
    console.log('💪 Adicionando exercícios Nakagym...\n');
    console.log('🏢 Academia de referência: https://www.nakagym.com.br/\n');

    try {
        // Contar exercícios antes
        const beforeCount = await pool.query('SELECT COUNT(*) as count FROM exercises');
        console.log(`📊 Exercícios atuais: ${beforeCount.rows[0].count}`);

        // Executar SQL
        const sql = readFileSync(
            join(__dirname, '..', 'database', 'add-nakagym-exercises.sql'),
            'utf-8'
        );

        await pool.query(sql);
        console.log('✅ SQL executado com sucesso!');

        // Contar exercícios Nakagym
        const nakagymCount = await pool.query(`
            SELECT COUNT(*) as count FROM exercises WHERE id LIKE 'nk%'
        `);

        // Contar total depois
        const afterCount = await pool.query('SELECT COUNT(*) as count FROM exercises');
        const added = afterCount.rows[0].count - beforeCount.rows[0].count;

        console.log(`\n📊 Exercícios após inserção: ${afterCount.rows[0].count}`);
        console.log(`✨ ${added} novos exercícios Nakagym adicionados!`);
        console.log(`🏋️  Total de exercícios Nakagym: ${nakagymCount.rows[0].count}`);

        // Listar exercícios Nakagym adicionados
        const nakagym = await pool.query(`
            SELECT id, name, category, equipment->0 as equipment
            FROM exercises
            WHERE id LIKE 'nk%'
            ORDER BY category, id
        `);

        console.log('\n📋 Exercícios Nakagym:');
        let currentCategory = '';
        nakagym.rows.forEach(ex => {
            if (ex.category !== currentCategory) {
                currentCategory = ex.category;
                console.log(`\n   ${currentCategory.toUpperCase()}:`);
            }
            console.log(`   - ${ex.name} (${ex.equipment})`);
        });

        // Mostrar por categoria geral
        const byCategory = await pool.query(`
            SELECT category, COUNT(*) as count
            FROM exercises
            GROUP BY category
            ORDER BY count DESC
        `);

        console.log('\n📊 Distribuição Total por Categoria:');
        byCategory.rows.forEach(row => {
            console.log(`   ${row.category}: ${row.count}`);
        });

        console.log('\n🎉 Concluído!');

    } catch (error) {
        console.error('\n❌ Erro:', error.message);
        if (error.code === '23505') {
            console.error('   Alguns exercícios já existem no banco.');
        }
        process.exit(1);
    } finally {
        await pool.end();
    }
}

main();
