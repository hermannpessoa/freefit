#!/usr/bin/env node

/**
 * Script de Inicialização do Banco de Dados
 * Executa via Transaction Pooler do Supabase
 *
 * Uso: npm run db:setup
 */

import pg from 'pg';
import { readFileSync } from 'fs';
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

async function executeSQLFile(filePath, description) {
    console.log(`\n📄 Executando: ${description}`);
    console.log(`   Arquivo: ${filePath}`);

    try {
        const sql = readFileSync(filePath, 'utf-8');
        await pool.query(sql);
        console.log(`✅ ${description} - SUCESSO`);
        return true;
    } catch (error) {
        console.error(`❌ ${description} - ERRO:`);
        console.error(`   ${error.message}`);
        return false;
    }
}

async function checkTableExists(tableName) {
    try {
        const result = await pool.query(`
            SELECT EXISTS (
                SELECT FROM information_schema.tables
                WHERE table_schema = 'public'
                AND table_name = $1
            );
        `, [tableName]);
        return result.rows[0].exists;
    } catch (error) {
        return false;
    }
}

async function main() {
    console.log('🚀 Iniciando setup do banco de dados...');
    console.log('🔗 Conectando via Transaction Pooler...');

    try {
        // Testar conexão
        const testResult = await pool.query('SELECT NOW()');
        console.log('✅ Conectado ao banco de dados');
        console.log(`   Hora do servidor: ${testResult.rows[0].now}`);

        // Verificar quais tabelas já existem
        console.log('\n🔍 Verificando tabelas existentes...');
        const tables = ['profiles', 'workouts', 'exercises', 'workout_history', 'progress_records'];
        const existingTables = [];

        for (const table of tables) {
            const exists = await checkTableExists(table);
            if (exists) {
                existingTables.push(table);
                console.log(`   ✓ ${table}`);
            } else {
                console.log(`   ✗ ${table}`);
            }
        }

        // Executar SQLs na ordem correta
        const dbPath = join(__dirname, '..', 'database');
        let success = true;

        // 1. EXECUTE_FIRST.sql - Cria todas as tabelas principais
        if (!existingTables.includes('profiles')) {
            success = await executeSQLFile(
                join(dbPath, 'EXECUTE_FIRST.sql'),
                'Criar tabelas principais (profiles, workouts, etc.)'
            ) && success;
        } else {
            console.log('\n⏭️  Pulando EXECUTE_FIRST.sql (tabelas já existem)');
        }

        // 1.5 Criar tabela exercises se não existir
        if (!existingTables.includes('exercises')) {
            console.log('\n❗ Tabela exercises não existe, criando...');
            success = await executeSQLFile(
                join(dbPath, 'create-exercises-table.sql'),
                'Criar tabela exercises'
            ) && success;
            existingTables.push('exercises'); // Adiciona à lista
        }

        // 2. Lookup tables - Categorias, equipamentos, etc.
        if (!existingTables.includes('exercise_categories') ||
            !existingTables.includes('equipment_types')) {
            success = await executeSQLFile(
                join(dbPath, 'migrations', '004_create_lookup_tables.sql'),
                'Criar lookup tables (categorias, equipamentos, etc.)'
            ) && success;
        } else {
            console.log('\n⏭️  Pulando lookup tables (já existem)');
        }

        // 3. Seed exercises - Adicionar 45+ exercícios
        const exerciseCount = await pool.query('SELECT COUNT(*) as count FROM exercises');
        const currentExercises = parseInt(exerciseCount.rows[0].count);

        if (currentExercises < 10) {
            console.log(`\n📊 Banco tem apenas ${currentExercises} exercícios`);
            success = await executeSQLFile(
                join(dbPath, 'seed-exercises.sql'),
                'Adicionar exercícios (45+ exercícios)'
            ) && success;
        } else {
            console.log(`\n⏭️  Pulando seed de exercícios (já existem ${currentExercises})`);
        }

        // Resultado final
        console.log('\n' + '='.repeat(50));
        if (success) {
            console.log('✅ SETUP COMPLETO!');
            console.log('\n📊 Resumo:');

            // Contar registros
            const counts = await Promise.all([
                pool.query('SELECT COUNT(*) as count FROM profiles'),
                pool.query('SELECT COUNT(*) as count FROM workouts'),
                pool.query('SELECT COUNT(*) as count FROM exercises'),
                pool.query('SELECT COUNT(*) as count FROM workout_history'),
            ]);

            console.log(`   Profiles: ${counts[0].rows[0].count}`);
            console.log(`   Workouts: ${counts[1].rows[0].count}`);
            console.log(`   Exercises: ${counts[2].rows[0].count}`);
            console.log(`   Histórico: ${counts[3].rows[0].count}`);
        } else {
            console.log('⚠️  SETUP COMPLETADO COM ERROS');
            console.log('   Verifique os erros acima');
        }
        console.log('='.repeat(50));

    } catch (error) {
        console.error('\n❌ ERRO FATAL:');
        console.error(error);
        process.exit(1);
    } finally {
        await pool.end();
        console.log('\n👋 Desconectado do banco de dados');
    }
}

main();
