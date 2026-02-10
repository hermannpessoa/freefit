/**
 * Script para adicionar coluna template_slug
 * Usage: node scripts/add-template-slug-column.js
 */

import dotenv from 'dotenv';
import pg from 'pg';

// Load environment variables
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const projectRef = supabaseUrl.match(/https:\/\/([^.]+)\.supabase\.co/)?.[1];
const connectionString = `postgresql://postgres.${projectRef}:${supabaseKey}@aws-0-us-east-1.pooler.supabase.com:6543/postgres`;

async function addTemplateSlugColumn() {
    console.log('\n🔧 Adicionando coluna template_slug à tabela workouts...\n');

    const client = new pg.Client({
        connectionString: process.env.DATABASE_URL || connectionString,
        ssl: { rejectUnauthorized: false }
    });

    try {
        await client.connect();
        console.log('✅ Conectado ao banco de dados\n');

        // Add template_slug column
        console.log('📝 Adicionando coluna template_slug...');
        await client.query(`
            ALTER TABLE workouts
            ADD COLUMN IF NOT EXISTS template_slug TEXT;
        `);
        console.log('✅ Coluna template_slug adicionada\n');

        // Create unique index
        console.log('📝 Criando índice único...');
        await client.query(`
            CREATE UNIQUE INDEX IF NOT EXISTS idx_workouts_template_slug
            ON workouts(template_slug)
            WHERE template_slug IS NOT NULL;
        `);
        console.log('✅ Índice único criado\n');

        console.log('═══════════════════════════════════════════════════════');
        console.log('✅ Coluna template_slug adicionada com sucesso!\n');

    } catch (error) {
        console.error('❌ Erro:', error.message);
        process.exit(1);
    } finally {
        await client.end();
    }
}

// Executar
addTemplateSlugColumn().catch(console.error);
