/**
 * Script para adicionar templates de treino ao Supabase
 * Usage: node scripts/add-workout-templates.js
 */

import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';

// Load environment variables
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing VITE_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Workout templates from local file
const workoutTemplates = [
    {
        template_slug: 'template-push',
        name: 'Push Day',
        description: 'Treino de empurrar: Peito, Ombros e Tríceps',
        category: 'strength',
        difficulty: 'intermediate',
        estimated_duration: 60,
        muscle_groups: ['chest', 'shoulders', 'arms'],
        exercises: [
            { exerciseId: 'ex001', sets: 4, reps: '8-10', rest: 90 },
            { exerciseId: 'ex002', sets: 3, reps: '10-12', rest: 75 },
            { exerciseId: 'ex011', sets: 4, reps: '8-10', rest: 90 },
            { exerciseId: 'ex012', sets: 3, reps: '12-15', rest: 60 },
            { exerciseId: 'ex020', sets: 3, reps: '12-15', rest: 60 },
            { exerciseId: 'ex021', sets: 3, reps: '10-12', rest: 60 },
        ],
        is_template: true,
        user_id: null, // Templates don't belong to any user
    },
    {
        template_slug: 'template-pull',
        name: 'Pull Day',
        description: 'Treino de puxar: Costas e Bíceps',
        category: 'strength',
        difficulty: 'intermediate',
        estimated_duration: 55,
        muscle_groups: ['back', 'arms'],
        exercises: [
            { exerciseId: 'ex010', sets: 4, reps: '6-8', rest: 120 },
            { exerciseId: 'ex007', sets: 4, reps: '8-10', rest: 90 },
            { exerciseId: 'ex006', sets: 3, reps: '10-12', rest: 75 },
            { exerciseId: 'ex009', sets: 3, reps: '10-12', rest: 60 },
            { exerciseId: 'ex016', sets: 3, reps: '10-12', rest: 60 },
            { exerciseId: 'ex018', sets: 3, reps: '12-15', rest: 45 },
        ],
        is_template: true,
        user_id: null,
    },
    {
        template_slug: 'template-legs',
        name: 'Leg Day',
        description: 'Treino completo de pernas',
        category: 'strength',
        difficulty: 'intermediate',
        estimated_duration: 65,
        muscle_groups: ['legs'],
        exercises: [
            { exerciseId: 'ex024', sets: 4, reps: '6-8', rest: 180 },
            { exerciseId: 'ex025', sets: 4, reps: '10-12', rest: 90 },
            { exerciseId: 'ex029', sets: 3, reps: '10-12', rest: 90 },
            { exerciseId: 'ex027', sets: 3, reps: '10-12', rest: 60 },
            { exerciseId: 'ex030', sets: 3, reps: '12-15', rest: 60 },
            { exerciseId: 'ex033', sets: 4, reps: '15-20', rest: 45 },
        ],
        is_template: true,
        user_id: null,
    },
    {
        template_slug: 'template-fullbody-beginner',
        name: 'Full Body Iniciante',
        description: 'Treino completo para quem está começando',
        category: 'strength',
        difficulty: 'beginner',
        estimated_duration: 45,
        muscle_groups: ['chest', 'back', 'legs', 'shoulders', 'core'],
        exercises: [
            { exerciseId: 'ex004', sets: 3, reps: '8-12', rest: 60 },
            { exerciseId: 'ex009', sets: 3, reps: '10-12', rest: 60 },
            { exerciseId: 'ex025', sets: 3, reps: '12-15', rest: 90 },
            { exerciseId: 'ex012', sets: 3, reps: '12-15', rest: 45 },
            { exerciseId: 'ex035', sets: 3, reps: '30s', rest: 30 },
        ],
        is_template: true,
        user_id: null,
    },
    {
        template_slug: 'template-hiit',
        name: 'HIIT Cardio',
        description: '20 minutos de alta intensidade',
        category: 'cardio',
        difficulty: 'intermediate',
        estimated_duration: 20,
        muscle_groups: ['cardio', 'core'],
        exercises: [
            { exerciseId: 'ex043', sets: 3, reps: '30s', rest: 15 },
            { exerciseId: 'ex041', sets: 3, reps: '10', rest: 30 },
            { exerciseId: 'ex042', sets: 3, reps: '30s', rest: 15 },
            { exerciseId: 'ex044', sets: 3, reps: '30s', rest: 15 },
            { exerciseId: 'ex045', sets: 3, reps: '12', rest: 30 },
        ],
        is_template: true,
        user_id: null,
    },
    {
        template_slug: 'template-core',
        name: 'Core Killer',
        description: 'Treino focado em abdômen e core',
        category: 'strength',
        difficulty: 'intermediate',
        estimated_duration: 25,
        muscle_groups: ['core'],
        exercises: [
            { exerciseId: 'ex035', sets: 3, reps: '45s', rest: 30 },
            { exerciseId: 'ex036', sets: 3, reps: '20', rest: 30 },
            { exerciseId: 'ex037', sets: 3, reps: '30s cada', rest: 30 },
            { exerciseId: 'ex039', sets: 3, reps: '20', rest: 30 },
            { exerciseId: 'ex040', sets: 3, reps: '12 cada', rest: 30 },
        ],
        is_template: true,
        user_id: null,
    },
];

async function addWorkoutTemplates() {
    console.log('\n🏋️ Adicionando templates de treino ao Supabase...\n');

    let addedCount = 0;
    let skippedCount = 0;

    for (const template of workoutTemplates) {
        console.log(`📝 Processando: ${template.name}...`);

        // Check if template already exists by template_slug
        const { data: existing } = await supabase
            .from('workouts')
            .select('id')
            .eq('template_slug', template.template_slug)
            .maybeSingle();

        if (existing) {
            console.log(`   ⏭️  Já existe, pulando\n`);
            skippedCount++;
            continue;
        }

        // Insert template (let Supabase generate UUID for id)
        const { data, error } = await supabase
            .from('workouts')
            .insert([template])
            .select()
            .single();

        if (error) {
            console.error(`   ❌ Erro ao inserir: ${error.message}\n`);
        } else {
            console.log(`   ✅ Adicionado com sucesso (ID: ${data.id})\n`);
            addedCount++;
        }
    }

    console.log('═══════════════════════════════════════════════════════');
    console.log(`✅ Templates adicionados: ${addedCount}`);
    console.log(`⏭️  Templates já existentes: ${skippedCount}`);
    console.log(`📊 Total processado: ${workoutTemplates.length}\n`);
}

// Executar
addWorkoutTemplates().catch(console.error);
