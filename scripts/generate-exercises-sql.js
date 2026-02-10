// Script to generate SQL for inserting exercises into Supabase
// Run with: node scripts/generate-exercises-sql.js

import { exerciseDatabase } from '../src/data/exercises.js';
import fs from 'fs';

function escapeString(str) {
    if (!str) return 'NULL';
    return `'${str.replace(/'/g, "''")}'`;
}

function arrayToJson(arr) {
    if (!arr || arr.length === 0) return "'[]'::jsonb";
    return `'${JSON.stringify(arr)}'::jsonb`;
}

let sql = `-- Seed exercises data
-- This file was auto-generated from src/data/exercises.js

BEGIN;

`;

exerciseDatabase.forEach(ex => {
    sql += `INSERT INTO exercises (
    id, name, name_en, category, subcategory, equipment,
    difficulty, primary_muscles, secondary_muscles, type,
    description, steps, tips, video_url, gif_url, is_custom, user_id
) VALUES (
    ${escapeString(ex.id)},
    ${escapeString(ex.name)},
    ${escapeString(ex.nameEn)},
    ${escapeString(ex.category)},
    ${escapeString(ex.subcategory)},
    ${arrayToJson(ex.equipment)},
    ${escapeString(ex.difficulty)},
    ${arrayToJson(ex.primaryMuscles)},
    ${arrayToJson(ex.secondaryMuscles)},
    ${escapeString(ex.type)},
    ${escapeString(ex.description)},
    ${arrayToJson(ex.steps)},
    ${arrayToJson(ex.tips)},
    ${escapeString(ex.videoUrl)},
    ${escapeString(ex.gifUrl)},
    FALSE,
    NULL
) ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    name_en = EXCLUDED.name_en,
    category = EXCLUDED.category,
    subcategory = EXCLUDED.subcategory,
    equipment = EXCLUDED.equipment,
    difficulty = EXCLUDED.difficulty,
    primary_muscles = EXCLUDED.primary_muscles,
    secondary_muscles = EXCLUDED.secondary_muscles,
    type = EXCLUDED.type,
    description = EXCLUDED.description,
    steps = EXCLUDED.steps,
    tips = EXCLUDED.tips,
    video_url = EXCLUDED.video_url,
    gif_url = EXCLUDED.gif_url;

`;
});

sql += `
COMMIT;

-- Verify insertion
SELECT category, COUNT(*) as count
FROM exercises
WHERE user_id IS NULL
GROUP BY category
ORDER BY category;
`;

fs.writeFileSync('database/seed-exercises.sql', sql);
console.log(`✅ Generated SQL file with ${exerciseDatabase.length} exercises`);
console.log('📄 File: database/seed-exercises.sql');
console.log('📝 Run this SQL in Supabase SQL Editor after creating the exercises table');
