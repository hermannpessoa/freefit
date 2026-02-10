#!/usr/bin/env node

/**
 * Verificar se imagens foram adicionadas
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

async function main() {
    console.log('🔍 Verificando imagens dos exercícios...\n');

    try {
        // Contar exercícios com/sem imagens
        const stats = await pool.query(`
            SELECT
                COUNT(*) as total,
                COUNT(demo_image) as with_image,
                COUNT(demo_video) as with_video
            FROM exercises
        `);

        const { total, with_image, with_video } = stats.rows[0];

        console.log('📊 Estatísticas:');
        console.log(`   Total de exercícios: ${total}`);
        console.log(`   Com imagem: ${with_image} (${Math.round(with_image/total*100)}%)`);
        console.log(`   Com vídeo: ${with_video} (${Math.round(with_video/total*100)}%)`);

        // Amostras por categoria
        const samples = await pool.query(`
            SELECT id, name, category, demo_image, demo_video
            FROM exercises
            ORDER BY category, id
            LIMIT 10
        `);

        console.log('\n📸 Amostras (10 primeiros):');
        samples.rows.forEach(ex => {
            const imageStatus = ex.demo_image ? '✅' : '❌';
            const videoStatus = ex.demo_video ? '🎥' : '  ';
            console.log(`   ${imageStatus} ${videoStatus} [${ex.category}] ${ex.name}`);
        });

        // Verificar exercícios Nakagym
        const nakagym = await pool.query(`
            SELECT COUNT(*) as count, COUNT(demo_image) as with_image
            FROM exercises
            WHERE id LIKE 'nk%'
        `);

        console.log(`\n🏋️  Exercícios Nakagym: ${nakagym.rows[0].count}`);
        console.log(`   Com imagem: ${nakagym.rows[0].with_image}`);

        console.log('\n✨ Verificação concluída!');

    } catch (error) {
        console.error('\n❌ Erro:', error.message);
        process.exit(1);
    } finally {
        await pool.end();
    }
}

main();
