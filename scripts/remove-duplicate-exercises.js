/**
 * Script para remover exercícios duplicados do Supabase
 * Mantém apenas exercícios NK (Nakagym) quando há duplicatas
 * Usage: node scripts/remove-duplicate-exercises.js
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
 * Remove acentos, artigos e converte para lowercase
 */
function normalizeName(name) {
    return name
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '') // Remove acentos
        .replace(/\b(o|a|os|as|de|da|do|com|no|na)\b/g, '') // Remove artigos comuns
        .replace(/\s+/g, ' ') // Normaliza espaços
        .trim();
}

/**
 * Verifica se dois exercícios são similares
 */
function areSimilar(ex1, ex2) {
    const name1 = normalizeName(ex1.name);
    const name2 = normalizeName(ex2.name);

    // Mesma categoria e nomes muito similares
    if (ex1.category !== ex2.category) return false;

    // Calcula similaridade usando Levenshtein distance simplificada
    const similarity = calculateSimilarity(name1, name2);

    return similarity > 0.8; // 80% de similaridade
}

/**
 * Calcula similaridade entre duas strings (0 a 1)
 */
function calculateSimilarity(str1, str2) {
    const longer = str1.length > str2.length ? str1 : str2;
    const shorter = str1.length > str2.length ? str2 : str1;

    if (longer.length === 0) return 1.0;

    // Conta caracteres em comum
    let matches = 0;
    for (let char of shorter) {
        if (longer.includes(char)) matches++;
    }

    return matches / longer.length;
}

/**
 * Identifica e remove duplicatas
 */
async function removeDuplicates() {
    console.log('\n🔍 Buscando exercícios no Supabase...\n');

    // Buscar todos os exercícios
    const { data: exercises, error } = await supabase
        .from('exercises')
        .select('*')
        .order('id', { ascending: true });

    if (error) {
        console.error('❌ Erro ao buscar exercícios:', error);
        return;
    }

    console.log(`📊 Total de exercícios encontrados: ${exercises.length}\n`);

    // Separar exercícios NK e não-NK
    const nkExercises = exercises.filter(ex => ex.id.startsWith('nk'));
    const nonNkExercises = exercises.filter(ex => !ex.id.startsWith('nk'));

    console.log(`✅ Exercícios NK (Nakagym): ${nkExercises.length}`);
    console.log(`📝 Exercícios não-NK: ${nonNkExercises.length}\n`);

    // Encontrar duplicatas
    const toRemove = [];
    const duplicatePairs = [];

    for (const nkEx of nkExercises) {
        for (const nonNkEx of nonNkExercises) {
            if (areSimilar(nkEx, nonNkEx)) {
                duplicatePairs.push({
                    nk: nkEx,
                    nonNk: nonNkEx
                });
                toRemove.push(nonNkEx.id);
            }
        }
    }

    if (duplicatePairs.length === 0) {
        console.log('✅ Nenhuma duplicata encontrada!');
        return;
    }

    console.log(`🔍 Encontradas ${duplicatePairs.length} duplicatas:\n`);

    duplicatePairs.forEach((pair, index) => {
        console.log(`${index + 1}. Duplicata encontrada:`);
        console.log(`   ✅ Manter: [${pair.nk.id}] ${pair.nk.name}`);
        console.log(`      Equipment: ${JSON.stringify(pair.nk.equipment)}`);
        console.log(`   ❌ Remover: [${pair.nonNk.id}] ${pair.nonNk.name}`);
        console.log(`      Equipment: ${JSON.stringify(pair.nonNk.equipment)}`);
        console.log('');
    });

    // Perguntar confirmação (simulado - sempre vai executar se rodar o script)
    console.log('⚠️  ATENÇÃO: Os exercícios marcados com ❌ serão REMOVIDOS!\n');
    console.log(`Total a remover: ${toRemove.length} exercícios\n`);

    // Remover duplicatas
    console.log('🗑️  Removendo duplicatas...\n');

    for (const id of toRemove) {
        const { error: deleteError } = await supabase
            .from('exercises')
            .delete()
            .eq('id', id);

        if (deleteError) {
            console.error(`❌ Erro ao remover [${id}]:`, deleteError.message);
        } else {
            console.log(`✅ Removido: [${id}]`);
        }
    }

    console.log('\n✅ Processo concluído!');
    console.log(`📊 Exercícios removidos: ${toRemove.length}`);
    console.log(`📊 Exercícios NK mantidos: ${nkExercises.length}`);

    // Buscar contagem final
    const { count: finalCount } = await supabase
        .from('exercises')
        .select('*', { count: 'exact', head: true });

    console.log(`📊 Total de exercícios após limpeza: ${finalCount}\n`);
}

// Executar
removeDuplicates().catch(console.error);
