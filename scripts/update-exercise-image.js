/**
 * Script para atualizar URL de imagem de um exercício
 * Usage: node scripts/update-exercise-image.js <exercise-id> <new-image-url>
 * Exemplo: node scripts/update-exercise-image.js ex001 https://example.com/bench-press.gif
 */

import dotenv from 'dotenv';
import pg from 'pg';

// Load environment variables
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const projectRef = supabaseUrl.match(/https:\/\/([^.]+)\.supabase\.co/)?.[1];
const connectionString = `postgresql://postgres.${projectRef}:${supabaseKey}@aws-0-us-east-1.pooler.supabase.com:6543/postgres`;

// Get command line arguments
const exerciseId = process.argv[2];
const newImageUrl = process.argv[3];

if (!exerciseId || !newImageUrl) {
    console.error('❌ Uso: node scripts/update-exercise-image.js <exercise-id> <new-image-url>');
    console.error('Exemplo: node scripts/update-exercise-image.js ex001 https://example.com/bench-press.gif');
    process.exit(1);
}

async function updateExerciseImage() {
    console.log(`\n🖼️  Atualizando imagem do exercício ${exerciseId}...\n`);

    const client = new pg.Client({
        connectionString: process.env.DATABASE_URL || connectionString,
        ssl: { rejectUnauthorized: false }
    });

    try {
        await client.connect();
        console.log('✅ Conectado ao banco de dados\n');

        // First, check if exercise exists
        const checkResult = await client.query(
            'SELECT id, name, demo_image FROM exercises WHERE id = $1',
            [exerciseId]
        );

        if (checkResult.rows.length === 0) {
            console.error(`❌ Exercício com ID "${exerciseId}" não encontrado!`);
            process.exit(1);
        }

        const exercise = checkResult.rows[0];
        console.log(`📝 Exercício encontrado: ${exercise.name}`);
        console.log(`   URL antiga: ${exercise.demo_image || '(nenhuma)'}`);
        console.log(`   URL nova: ${newImageUrl}\n`);

        // Update the image URL
        const updateResult = await client.query(
            'UPDATE exercises SET demo_image = $1 WHERE id = $2 RETURNING *',
            [newImageUrl, exerciseId]
        );

        if (updateResult.rows.length > 0) {
            console.log('═══════════════════════════════════════════════════════');
            console.log('✅ Imagem atualizada com sucesso!\n');
            console.log(`   Exercício: ${updateResult.rows[0].name}`);
            console.log(`   Nova URL: ${updateResult.rows[0].demo_image}\n`);
        }

    } catch (error) {
        console.error('❌ Erro:', error.message);
        process.exit(1);
    } finally {
        await client.end();
    }
}

// Executar
updateExerciseImage().catch(console.error);
