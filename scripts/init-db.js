import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import * as dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env.local
dotenv.config({ path: path.join(__dirname, '../.env.local') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Erro: Variáveis de ambiente não encontradas');
  console.error('Certifique-se que .env.local existe');
  process.exit(1);
}

async function createTables() {
  try {
    console.log('🚀 Conectando ao Supabase...');
    console.log(`📍 URL: ${supabaseUrl}`);
    
    // Read SQL schema
    const schemaPath = path.join(__dirname, '../database/schema.sql');
    const sqlContent = fs.readFileSync(schemaPath, 'utf8');
    
    console.log('📝 SQL carregado com sucesso');
    
    // Split and execute statements
    const statements = sqlContent
      .split(';')
      .map(s => s.trim())
      .filter(s => s && !s.startsWith('--'));

    console.log(`\n📊 Total de ${statements.length} comandos SQL encontrados`);
    console.log('\n⚠️  Supabase via JS SDK não suporta execução de SQL diretamente');
    console.log('📌 Para criar as tabelas, execute manualmente:\n');
    console.log('1️⃣  Acesse: https://app.supabase.com/project/tdyrysmjbogtldiiuzhp');
    console.log('2️⃣  Vá para: SQL Editor (na barra lateral esquerda)');
    console.log('3️⃣  Cole TODO o conteúdo abaixo:');
    console.log('\n' + '='.repeat(80));
    console.log(sqlContent);
    console.log('='.repeat(80));
    console.log('\n4️⃣  Clique em "Run" ou pressione Ctrl+Enter');
    console.log('\n✅ Assim que executar, as tabelas estarão criadas!\n');

  } catch (error) {
    console.error('❌ Erro:', error.message);
  }
}

createTables().then(() => {
  process.exit(0);
}).catch((error) => {
  console.error('Erro fatal:', error);
  process.exit(1);
});
