/**
 * Script para criar tabela de configurações de exercícios por usuário
 * Salva último peso/reps usado em cada exercício
 * Usage: node scripts/add-user-exercise-settings.js
 */

import dotenv from 'dotenv';
import pg from 'pg';

// Load environment variables
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const projectRef = supabaseUrl.match(/https:\/\/([^.]+)\.supabase\.co/)?.[1];
const connectionString = `postgresql://postgres.${projectRef}:${supabaseKey}@aws-0-us-east-1.pooler.supabase.com:6543/postgres`;

async function addUserExerciseSettings() {
    console.log('\n🔧 Criando tabela user_exercise_settings...\n');

    const client = new pg.Client({
        connectionString: process.env.DATABASE_URL || connectionString,
        ssl: { rejectUnauthorized: false }
    });

    try {
        await client.connect();
        console.log('✅ Conectado ao banco de dados\n');

        // Create user_exercise_settings table
        console.log('📝 Criando tabela user_exercise_settings...');
        await client.query(`
            CREATE TABLE IF NOT EXISTS user_exercise_settings (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
                exercise_id TEXT NOT NULL,
                last_weight DECIMAL DEFAULT 0,
                last_reps INTEGER DEFAULT 10,
                last_used_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                UNIQUE(user_id, exercise_id)
            );
        `);
        console.log('✅ Tabela user_exercise_settings criada\n');

        // Create index for faster lookups
        console.log('📝 Criando índices...');
        await client.query(`
            CREATE INDEX IF NOT EXISTS idx_user_exercise_settings_user_id
            ON user_exercise_settings(user_id);
        `);
        await client.query(`
            CREATE INDEX IF NOT EXISTS idx_user_exercise_settings_exercise_id
            ON user_exercise_settings(exercise_id);
        `);
        console.log('✅ Índices criados\n');

        // Enable RLS
        console.log('📝 Habilitando RLS...');
        await client.query(`
            ALTER TABLE user_exercise_settings ENABLE ROW LEVEL SECURITY;
        `);
        console.log('✅ RLS habilitado\n');

        // Create RLS policies
        console.log('📝 Criando políticas RLS...');

        // Users can view their own settings
        await client.query(`
            CREATE POLICY "Users can view their own exercise settings"
            ON user_exercise_settings FOR SELECT
            USING (auth.uid() = user_id);
        `);

        // Users can insert their own settings
        await client.query(`
            CREATE POLICY "Users can insert their own exercise settings"
            ON user_exercise_settings FOR INSERT
            WITH CHECK (auth.uid() = user_id);
        `);

        // Users can update their own settings
        await client.query(`
            CREATE POLICY "Users can update their own exercise settings"
            ON user_exercise_settings FOR UPDATE
            USING (auth.uid() = user_id)
            WITH CHECK (auth.uid() = user_id);
        `);

        // Users can delete their own settings
        await client.query(`
            CREATE POLICY "Users can delete their own exercise settings"
            ON user_exercise_settings FOR DELETE
            USING (auth.uid() = user_id);
        `);

        console.log('✅ Políticas RLS criadas\n');

        console.log('═══════════════════════════════════════════════════════');
        console.log('✅ Tabela user_exercise_settings criada com sucesso!\n');
        console.log('📝 Agora os pesos e reps de cada exercício serão salvos');
        console.log('   automaticamente no perfil do usuário.\n');

    } catch (error) {
        console.error('❌ Erro:', error.message);
        process.exit(1);
    } finally {
        await client.end();
    }
}

// Executar
addUserExerciseSettings().catch(console.error);
