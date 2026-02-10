/**
 * Script para adicionar coluna is_template à tabela workouts
 * Usage: node scripts/add-is-template-column.js
 */

import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

// Load environment variables
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing VITE_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function addIsTemplateColumn() {
    console.log('\n🔧 Adicionando coluna is_template à tabela workouts...\n');

    try {
        // Add is_template column
        const { error } = await supabase.rpc('exec_sql', {
            sql: `
                ALTER TABLE workouts
                ADD COLUMN IF NOT EXISTS is_template BOOLEAN DEFAULT FALSE;

                -- Create index for faster queries on templates
                CREATE INDEX IF NOT EXISTS idx_workouts_is_template
                ON workouts(is_template)
                WHERE is_template = TRUE;

                -- Allow null user_id for templates
                ALTER TABLE workouts
                ALTER COLUMN user_id DROP NOT NULL;
            `
        });

        if (error) {
            console.error('❌ Erro:', error.message);
            console.log('\n⚠️  Tentando método alternativo via SQL direto...\n');

            // Try direct SQL if RPC fails
            const { error: sqlError } = await supabase
                .from('workouts')
                .select('is_template')
                .limit(1);

            if (sqlError && sqlError.message.includes('column "is_template" does not exist')) {
                console.log('📝 Você precisa executar este SQL manualmente no Supabase Dashboard:');
                console.log('');
                console.log('ALTER TABLE workouts ADD COLUMN IF NOT EXISTS is_template BOOLEAN DEFAULT FALSE;');
                console.log('CREATE INDEX IF NOT EXISTS idx_workouts_is_template ON workouts(is_template) WHERE is_template = TRUE;');
                console.log('ALTER TABLE workouts ALTER COLUMN user_id DROP NOT NULL;');
                console.log('');
                process.exit(1);
            }
        } else {
            console.log('✅ Coluna is_template adicionada com sucesso!');
            console.log('✅ Índice criado para otimizar queries');
            console.log('✅ user_id agora pode ser NULL (para templates)\n');
        }
    } catch (err) {
        console.error('❌ Erro inesperado:', err);
        console.log('\n📝 Execute este SQL manualmente no Supabase Dashboard (SQL Editor):');
        console.log('');
        console.log('ALTER TABLE workouts ADD COLUMN IF NOT EXISTS is_template BOOLEAN DEFAULT FALSE;');
        console.log('CREATE INDEX IF NOT EXISTS idx_workouts_is_template ON workouts(is_template) WHERE is_template = TRUE;');
        console.log('ALTER TABLE workouts ALTER COLUMN user_id DROP NOT NULL;');
        console.log('');
    }
}

// Executar
addIsTemplateColumn().catch(console.error);
