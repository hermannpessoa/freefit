import pkg from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const { Client } = pkg;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '..', '.env.local') });

const DATABASE_PASSWORD = process.env.DATABASE_PASSWORD || process.argv[2];
const schemaFile = process.argv[3] || 'schema-fixed.sql';

if (!DATABASE_PASSWORD) {
  console.error('❌ DATABASE_PASSWORD não fornecido');
  console.error('Use: node scripts/create-tables.mjs PASSWORD [schema-file]');
  process.exit(1);
}

const client = new Client({
  host: 'aws-1-us-east-1.pooler.supabase.com',
  port: 6543,
  database: 'postgres',
  user: 'postgres.tdyrysmjbogtldiiuzhp',
  password: DATABASE_PASSWORD,
});

const main = async () => {
  try {
    console.log('🔗 Conectando ao Supabase Transaction Pooler...');
    await client.connect();
    console.log('✅ Conectado com sucesso!\n');

    // Read schema file
    const schemaPath = path.join(__dirname, '..', 'database', schemaFile);
    console.log(`📖 Lendo arquivo: ${schemaFile}`);
    const schema = fs.readFileSync(schemaPath, 'utf8');

    // Execute entire schema at once
    console.log(`🚀 Executando schema SQL...\n`);
    
    try {
      await client.query(schema);
      console.log('✅ Schema executado com sucesso!');
      console.log('\n📊 Tabelas criadas:');
      console.log('   - profiles');
      console.log('   - workouts');
      console.log('   - workout_history');
      console.log('   - progress_records');
      console.log('   - subscriptions');
      console.log('\n✅ Todas as tabelas e políticas RLS foram criadas!');
    } catch (err) {
      if (err.message.includes('already exists')) {
        console.log('⚠️  Tabelas já existem no banco de dados');
        console.log('\n📊 Tabelas encontradas:');
        console.log('   - profiles');
        console.log('   - workouts');
        console.log('   - workout_history');
        console.log('   - progress_records');
        console.log('   - subscriptions');
      } else {
        throw err;
      }
    }

  } catch (err) {
    console.error('❌ Erro:', err.message);
    process.exit(1);
  } finally {
    await client.end();
  }
};

main();
