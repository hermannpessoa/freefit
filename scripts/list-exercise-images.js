/**
 * Script para listar todos os exercícios com suas URLs de imagem
 * Útil para identificar imagens quebradas ou faltando
 * Usage: node scripts/list-exercise-images.js
 */

import dotenv from 'dotenv';
import pg from 'pg';

// Load environment variables
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const projectRef = supabaseUrl.match(/https:\/\/([^.]+)\.supabase\.co/)?.[1];
const connectionString = `postgresql://postgres.${projectRef}:${supabaseKey}@aws-0-us-east-1.pooler.supabase.com:6543/postgres`;

async function listExerciseImages() {
    console.log('\n🖼️  Listando imagens dos exercícios...\n');

    const client = new pg.Client({
        connectionString: process.env.DATABASE_URL || connectionString,
        ssl: { rejectUnauthorized: false }
    });

    try {
        await client.connect();
        console.log('✅ Conectado ao banco de dados\n');

        // Get all exercises with their images
        const result = await client.query(`
            SELECT
                id,
                name,
                category,
                demo_image,
                demo_video
            FROM exercises
            ORDER BY category, name
        `);

        console.log(`Total de exercícios: ${result.rows.length}\n`);
        console.log('═══════════════════════════════════════════════════════\n');

        // Group by category
        const byCategory = {};
        result.rows.forEach(ex => {
            if (!byCategory[ex.category]) {
                byCategory[ex.category] = [];
            }
            byCategory[ex.category].push(ex);
        });

        // Count missing images
        let missingImages = 0;
        let missingVideos = 0;

        Object.keys(byCategory).sort().forEach(category => {
            console.log(`\n📁 ${category.toUpperCase()}`);
            console.log('─'.repeat(60));

            byCategory[category].forEach(ex => {
                console.log(`\n${ex.id} - ${ex.name}`);

                if (ex.demo_image) {
                    if (ex.demo_image.startsWith('/exercises/')) {
                        console.log(`   🖼️  ${ex.demo_image} ⚠️ (URL relativa - pode não existir)`);
                        missingImages++;
                    } else {
                        console.log(`   🖼️  ${ex.demo_image}`);
                    }
                } else {
                    console.log(`   🖼️  (sem imagem)`);
                    missingImages++;
                }

                if (ex.demo_video) {
                    console.log(`   🎥 ${ex.demo_video}`);
                } else {
                    console.log(`   🎥 (sem vídeo)`);
                    missingVideos++;
                }
            });
        });

        console.log('\n\n═══════════════════════════════════════════════════════');
        console.log('📊 Resumo:');
        console.log(`   Total de exercícios: ${result.rows.length}`);
        console.log(`   Sem imagem ou com URL relativa: ${missingImages}`);
        console.log(`   Sem vídeo: ${missingVideos}`);
        console.log('\n');

    } catch (error) {
        console.error('❌ Erro:', error.message);
        process.exit(1);
    } finally {
        await client.end();
    }
}

// Executar
listExerciseImages().catch(console.error);
