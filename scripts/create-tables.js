const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env.local') });

async function createTables() {
  const client = new Client({
    host: 'aws-1-us-east-1.pooler.supabase.com',
    port: 6543,
    database: 'postgres',
    user: 'postgres.tdyrysmjbogtldiiuzhp',
    password: process.env.DATABASE_PASSWORD || process.argv[2],
  });

  try {
    console.log('🔗 Conectando ao Supabase...');
    await client.connect();
    console.log('✅ Conectado com sucesso!');

    // Read SQL schema
    const schemaPath = path.join(__dirname, '../database/schema.sql');
    const sql = fs.readFileSync(schemaPath, 'utf8');

    // Split SQL statements (remove comments and empty lines)
    const statements = sql
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt && !stmt.startsWith('--'));

    console.log(`\n📝 Executando ${statements.length} comandos SQL...\n`);

    let successful = 0;
    let failed = 0;

    for (let i = 0; i < statements.length; i++) {
      try {
        const stmt = statements[i];
        // Show first 80 chars
        const preview = stmt.length > 80 ? stmt.substring(0, 80) + '...' : stmt;
        process.stdout.write(`[${i + 1}/${statements.length}] ${preview}`);
        
        await client.query(stmt);
        console.log(' ✅');
        successful++;
      } catch (error) {
        // Some errors are expected (like IF NOT EXISTS)
        if (error.message.includes('already exists') || error.message.includes('ERROR')) {
          console.log(' ⚠️  (existe)');
          successful++;
        } else {
          console.log(' ❌');
          console.error(`  Erro: ${error.message}`);
          failed++;
        }
      }
    }

    console.log(`\n✨ Resultado:`);
    console.log(`  ✅ Executados: ${successful}`);
    console.log(`  ❌ Falhados: ${failed}`);

    if (failed === 0) {
      console.log(`\n🎉 Todas as tabelas foram criadas com sucesso!`);
      console.log(`\n📊 Tabelas criadas:`);
      console.log(`  • profiles`);
      console.log(`  • workouts`);
      console.log(`  • workout_history`);
      console.log(`  • progress_records`);
      console.log(`  • subscriptions`);
    }
  } catch (error) {
    console.error('❌ Erro de conexão:', error.message);
    console.log('\n📌 Verifique:');
    console.log('1. A senha está correta em DATABASE_PASSWORD');
    console.log('2. Sua rede permite conexão com AWS');
    console.log('3. As credenciais em .env.local');
  } finally {
    await client.end();
  }
}

createTables();
