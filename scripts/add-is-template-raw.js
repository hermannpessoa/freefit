/**
 * Script para adicionar coluna is_template usando SQL raw
 * Usage: node scripts/add-is-template-raw.js
 */

import dotenv from 'dotenv';
import pg from 'pg';

// Load environment variables
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl) {
    console.error('❌ Missing VITE_SUPABASE_URL in .env.local');
    process.exit(1);
}

// Extract database connection details from Supabase URL
const projectRef = supabaseUrl.match(/https:\/\/([^.]+)\.supabase\.co/)?.[1];
const connectionString = `postgresql://postgres.${projectRef}:${supabaseKey}@aws-0-us-east-1.pooler.supabase.com:6543/postgres`;

async function addIsTemplateColumn() {
    console.log('\n🔧 Adicionando coluna is_template à tabela workouts...\n');

    const client = new pg.Client({
        connectionString: process.env.DATABASE_URL || connectionString,
        ssl: { rejectUnauthorized: false }
    });

    try {
        await client.connect();
        console.log('✅ Conectado ao banco de dados\n');

        // Add is_template column
        console.log('📝 Adicionando coluna is_template...');
        await client.query(`
            ALTER TABLE workouts
            ADD COLUMN IF NOT EXISTS is_template BOOLEAN DEFAULT FALSE;
        `);
        console.log('✅ Coluna is_template adicionada\n');

        // Create index
        console.log('📝 Criando índice...');
        await client.query(`
            CREATE INDEX IF NOT EXISTS idx_workouts_is_template
            ON workouts(is_template)
            WHERE is_template = TRUE;
        `);
        console.log('✅ Índice criado\n');

        // Allow NULL user_id for templates
        console.log('📝 Permitindo user_id NULL...');
        await client.query(`
            ALTER TABLE workouts
            ALTER COLUMN user_id DROP NOT NULL;
        `);
        console.log('✅ user_id agora pode ser NULL\n');

        console.log('═══════════════════════════════════════════════════════');
        console.log('✅ Todas as alterações concluídas com sucesso!\n');

    } catch (error) {
        console.error('❌ Erro:', error.message);
        process.exit(1);
    } finally {
        await client.end();
    }
}

// Executar
addIsTemplateColumn().catch(console.error);
