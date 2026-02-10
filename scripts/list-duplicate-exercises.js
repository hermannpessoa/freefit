/**
 * Script para listar exercícios duplicados do Supabase
 * Lista exercícios NK (Nakagym) e seus possíveis duplicados
 * Usage: node scripts/list-duplicate-exercises.js
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

/**
 * Normaliza o nome do exercício para comparação
 */
function normalizeName(name) {
    return name
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '') // Remove acentos
        .replace(/\b(o|a|os|as|de|da|do|com|no|na)\b/g, '') // Remove artigos
        .replace(/\s+/g, ' ')
        .trim();
}

/**
 * Verifica se dois exercícios são similares
 */
function areSimilar(ex1, ex2) {
    const name1 = normalizeName(ex1.name);
    const name2 = normalizeName(ex2.name);

    if (ex1.category !== ex2.category) return false;

    // Calcula similaridade
    const longer = name1.length > name2.length ? name1 : name2;
    const shorter = name1.length > name2.length ? name2 : name1;

    if (longer.length === 0) return true;

    let matches = 0;
    for (let char of shorter) {
        if (longer.includes(char)) matches++;
    }

    const similarity = matches / longer.length;
    return similarity > 0.8; // 80% de similaridade
}

/**
 * Lista duplicatas
 */
async function listDuplicates() {
    console.log('\n🔍 Buscando exercícios no Supabase...\n');

    const { data: exercises, error } = await supabase
        .from('exercises')
        .select('*')
        .order('id', { ascending: true });

    if (error) {
        console.error('❌ Erro ao buscar exercícios:', error);
        return;
    }

    console.log(`📊 Total de exercícios: ${exercises.length}\n`);

    // Separar NK e não-NK
    const nkExercises = exercises.filter(ex => ex.id.startsWith('nk'));
    const nonNkExercises = exercises.filter(ex => !ex.id.startsWith('nk'));

    console.log(`✅ Exercícios NK (Nakagym): ${nkExercises.length}`);
    console.log(`📝 Exercícios não-NK: ${nonNkExercises.length}\n`);

    if (nkExercises.length === 0) {
        console.log('⚠️  Nenhum exercício NK encontrado!');
        return;
    }

    // Encontrar duplicatas
    const duplicatePairs = [];
    const duplicateIds = new Set();

    for (const nkEx of nkExercises) {
        const duplicates = [];

        for (const nonNkEx of nonNkExercises) {
            if (areSimilar(nkEx, nonNkEx) && !duplicateIds.has(nonNkEx.id)) {
                duplicates.push(nonNkEx);
                duplicateIds.add(nonNkEx.id);
            }
        }

        if (duplicates.length > 0) {
            duplicatePairs.push({
                nk: nkEx,
                duplicates
            });
        }
    }

    if (duplicatePairs.length === 0) {
        console.log('✅ Nenhuma duplicata encontrada!');
        console.log('\n💡 Exercícios NK não possuem equivalentes não-NK.');
        return;
    }

    console.log(`🔍 Encontrados ${duplicatePairs.length} exercícios NK com duplicatas:\n`);
    console.log('═'.repeat(80));

    let totalToRemove = 0;

    duplicatePairs.forEach((pair, index) => {
        console.log(`\n${index + 1}. Exercício NK (MANTER):`);
        console.log(`   ID: ${pair.nk.id}`);
        console.log(`   Nome: ${pair.nk.name}`);
        console.log(`   Categoria: ${pair.nk.category}`);
        console.log(`   Equipamento: ${JSON.stringify(pair.nk.equipment)}`);
        console.log(`   Dificuldade: ${pair.nk.difficulty}`);

        console.log(`\n   Duplicatas encontradas (${pair.duplicates.length}):`);

        pair.duplicates.forEach((dup, dupIndex) => {
            totalToRemove++;
            console.log(`   ${dupIndex + 1}. ❌ REMOVER:`);
            console.log(`      ID: ${dup.id}`);
            console.log(`      Nome: ${dup.name}`);
            console.log(`      Equipamento: ${JSON.stringify(dup.equipment)}`);
        });

        console.log('\n' + '─'.repeat(80));
    });

    console.log('\n📊 RESUMO:');
    console.log(`   ✅ Exercícios NK a manter: ${duplicatePairs.length}`);
    console.log(`   ❌ Exercícios duplicados a remover: ${totalToRemove}`);
    console.log(`   📝 Total após limpeza: ${exercises.length - totalToRemove}`);

    console.log('\n💡 Para remover as duplicatas, execute:');
    console.log('   npm run db:remove-duplicates\n');
}

// Executar
listDuplicates().catch(console.error);
