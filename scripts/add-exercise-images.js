#!/usr/bin/env node

/**
 * Script para adicionar imagens aos exercícios
 * Usa biblioteca gratuita de imagens de exercícios
 * Execute: npm run db:add-images
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

// Biblioteca de URLs de imagens de exercícios
// Usando ExerciseDB API (gratuita) e outras fontes
const getExerciseImageUrl = (exerciseName, category, equipment) => {
    const name = exerciseName.toLowerCase();

    // Mapeamento específico de exercícios conhecidos para imagens reais
    const specificImages = {
        // CHEST
        'supino': 'https://exercisedb.p.rapidapi.com/exercises/0025',
        'flexão': 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=800&h=600&fit=crop',
        'crucifixo': 'https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=800&h=600&fit=crop',

        // BACK
        'puxada': 'https://images.unsplash.com/photo-1605296867304-46d5465a13f1?w=800&h=600&fit=crop',
        'remada': 'https://images.unsplash.com/photo-1599058917765-a780eda07a3e?w=800&h=600&fit=crop',
        'barra fixa': 'https://images.unsplash.com/photo-1599058917212-d750089bc07e?w=800&h=600&fit=crop',

        // SHOULDERS
        'desenvolvimento': 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=800&h=600&fit=crop',
        'elevação lateral': 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&h=600&fit=crop',
        'elevação frontal': 'https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?w=800&h=600&fit=crop',

        // ARMS
        'rosca': 'https://images.unsplash.com/photo-1581009137042-c552e485697a?w=800&h=600&fit=crop',
        'tríceps': 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=800&h=600&fit=crop',
        'bíceps': 'https://images.unsplash.com/photo-1532029837206-abbe2b7620e3?w=800&h=600&fit=crop',

        // LEGS
        'agachamento': 'https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=800&h=600&fit=crop',
        'leg press': 'https://images.unsplash.com/photo-1434596922112-19c563067271?w=800&h=600&fit=crop',
        'stiff': 'https://images.unsplash.com/photo-1434596922112-19c563067271?w=800&h=600&fit=crop',
        'panturrilha': 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=600&fit=crop',

        // CORE
        'abdominal': 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=600&fit=crop',
        'prancha': 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=600&fit=crop',
    };

    // Tentar encontrar imagem específica
    for (const [keyword, url] of Object.entries(specificImages)) {
        if (name.includes(keyword)) {
            return url;
        }
    }

    // Fallback: Imagem genérica por categoria em alta qualidade
    const categoryImages = {
        'chest': 'https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=800&h=600&fit=crop&q=80',
        'back': 'https://images.unsplash.com/photo-1605296867304-46d5465a13f1?w=800&h=600&fit=crop&q=80',
        'shoulders': 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=800&h=600&fit=crop&q=80',
        'arms': 'https://images.unsplash.com/photo-1532029837206-abbe2b7620e3?w=800&h=600&fit=crop&q=80',
        'legs': 'https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=800&h=600&fit=crop&q=80',
        'core': 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=600&fit=crop&q=80',
        'cardio': 'https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?w=800&h=600&fit=crop&q=80'
    };

    return categoryImages[category] || 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&h=600&fit=crop&q=80';
};

async function main() {
    console.log('🖼️  Adicionando imagens aos exercícios...\n');

    try {
        // Buscar todos os exercícios
        const { rows: exercises } = await pool.query(`
            SELECT id, name, category, equipment
            FROM exercises
            ORDER BY id
        `);

        console.log(`📊 Total de exercícios: ${exercises.length}`);
        console.log('\n🔄 Atualizando imagens...');

        let updated = 0;
        for (const exercise of exercises) {
            const imageUrl = getExerciseImageUrl(
                exercise.name,
                exercise.category,
                exercise.equipment
            );

            await pool.query(`
                UPDATE exercises
                SET demo_image = $1
                WHERE id = $2
            `, [imageUrl, exercise.id]);

            updated++;
            if (updated % 15 === 0) {
                console.log(`   ${updated}/${exercises.length} exercícios atualizados...`);
            }
        }

        console.log(`\n✅ ${updated} exercícios atualizados com imagens em alta qualidade!`);

        // Estatísticas
        const { rows: stats } = await pool.query(`
            SELECT
                category,
                COUNT(*) as total,
                COUNT(demo_image) as with_image,
                COUNT(demo_video) as with_video
            FROM exercises
            GROUP BY category
            ORDER BY total DESC
        `);

        console.log('\n📊 Estatísticas por Categoria:');
        console.table(stats);

        // Mostrar exemplos
        const { rows: samples } = await pool.query(`
            SELECT id, name, category, demo_image, demo_video
            FROM exercises
            LIMIT 5
        `);

        console.log('\n📸 Exemplos:');
        samples.forEach(ex => {
            console.log(`\n   ${ex.name} (${ex.category}):`);
            console.log(`   🖼️  Imagem: ${ex.demo_image || 'sem imagem'}`);
            console.log(`   🎥 Vídeo: ${ex.demo_video || 'sem vídeo'}`);
        });

        console.log('\n✨ Imagens de alta qualidade (800x600) do Unsplash adicionadas!');
        console.log('🎉 Concluído!');

    } catch (error) {
        console.error('\n❌ Erro:', error.message);
        process.exit(1);
    } finally {
        await pool.end();
    }
}

main();
