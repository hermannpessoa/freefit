/**
 * Script para atualizar políticas RLS para permitir templates
 * Usage: node scripts/fix-templates-rls.js
 */

import dotenv from 'dotenv';
import pg from 'pg';

// Load environment variables
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const projectRef = supabaseUrl.match(/https:\/\/([^.]+)\.supabase\.co/)?.[1];
const connectionString = `postgresql://postgres.${projectRef}:${supabaseKey}@aws-0-us-east-1.pooler.supabase.com:6543/postgres`;

async function fixTemplatesRLS() {
    console.log('\n🔒 Atualizando políticas RLS para templates...\n');

    const client = new pg.Client({
        connectionString: process.env.DATABASE_URL || connectionString,
        ssl: { rejectUnauthorized: false }
    });

    try {
        await client.connect();
        console.log('✅ Conectado ao banco de dados\n');

        // Drop existing policies if they exist
        console.log('📝 Removendo políticas antigas...');
        await client.query(`
            DROP POLICY IF EXISTS "Users can view their own workouts" ON workouts;
            DROP POLICY IF EXISTS "Users can insert their own workouts" ON workouts;
            DROP POLICY IF EXISTS "Users can update their own workouts" ON workouts;
            DROP POLICY IF EXISTS "Users can delete their own workouts" ON workouts;
        `);
        console.log('✅ Políticas antigas removidas\n');

        // Create new policies that allow templates
        console.log('📝 Criando novas políticas...');

        // SELECT: Users can see their own workouts + all templates
        await client.query(`
            CREATE POLICY "Users can view their own workouts and templates"
            ON workouts FOR SELECT
            USING (
                auth.uid() = user_id
                OR is_template = true
            );
        `);
        console.log('✅ Política SELECT criada\n');

        // INSERT: Users can create their own workouts, service role can create templates
        await client.query(`
            CREATE POLICY "Users can insert their own workouts"
            ON workouts FOR INSERT
            WITH CHECK (
                auth.uid() = user_id
                OR (is_template = true AND user_id IS NULL)
            );
        `);
        console.log('✅ Política INSERT criada\n');

        // UPDATE: Users can only update their own workouts (not templates)
        await client.query(`
            CREATE POLICY "Users can update their own workouts"
            ON workouts FOR UPDATE
            USING (auth.uid() = user_id AND is_template = false)
            WITH CHECK (auth.uid() = user_id AND is_template = false);
        `);
        console.log('✅ Política UPDATE criada\n');

        // DELETE: Users can only delete their own workouts (not templates)
        await client.query(`
            CREATE POLICY "Users can delete their own workouts"
            ON workouts FOR DELETE
            USING (auth.uid() = user_id AND is_template = false);
        `);
        console.log('✅ Política DELETE criada\n');

        console.log('═══════════════════════════════════════════════════════');
        console.log('✅ Políticas RLS atualizadas com sucesso!\n');
        console.log('📝 Agora:');
        console.log('   - Usuários podem ver seus próprios treinos + templates');
        console.log('   - Service role pode criar templates');
        console.log('   - Usuários não podem editar/deletar templates\n');

    } catch (error) {
        console.error('❌ Erro:', error.message);
        process.exit(1);
    } finally {
        await client.end();
    }
}

// Executar
fixTemplatesRLS().catch(console.error);
