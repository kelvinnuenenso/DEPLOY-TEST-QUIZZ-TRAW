import { execSync } from 'child_process';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database.types';

dotenv.config();

const {
  SUPABASE_PROJECT_ID,
  SUPABASE_DB_PASSWORD,
  VERCEL_TOKEN,
  VERCEL_ORG_ID,
  VERCEL_PROJECT_ID,
} = process.env;

if (!SUPABASE_PROJECT_ID || !SUPABASE_DB_PASSWORD || !VERCEL_TOKEN || !VERCEL_ORG_ID || !VERCEL_PROJECT_ID) {
  console.error('Missing required environment variables');
  process.exit(1);
}

async function deploy() {
  try {
    console.log('🚀 Starting deployment process...');

    // 1. Executar testes
    console.log('\n📋 Running tests...');
    execSync('npm run test', { stdio: 'inherit' });
    execSync('npm run test:e2e', { stdio: 'inherit' });

    // 2. Build do projeto
    console.log('\n🏗️ Building project...');
    execSync('npm run build', { stdio: 'inherit' });

    // 3. Deploy no Supabase
    console.log('\n🔄 Deploying database changes...');
    execSync('npx supabase link --project-ref ' + SUPABASE_PROJECT_ID, { stdio: 'inherit' });
    execSync('npx supabase db push', { stdio: 'inherit' });

    // 4. Deploy no Vercel
    console.log('\n🚀 Deploying to Vercel...');
    execSync(
      `npx vercel deploy --prod --token ${VERCEL_TOKEN} --scope ${VERCEL_ORG_ID} --yes`,
      { stdio: 'inherit' }
    );

    // 5. Verificar status do deploy
    console.log('\n🔍 Verifying deployment...');

    // Verificar conexão com Supabase
    const supabase = createClient<Database>(
      `https://${SUPABASE_PROJECT_ID}.supabase.co`,
      process.env.VITE_SUPABASE_ANON_KEY || ''
    );

    const { data, error } = await supabase.from('quizzes').select('count').single();
    if (error) throw new Error('Failed to connect to Supabase');

    // Verificar status do Vercel
    const vercelStatus = execSync(
      `npx vercel inspect ${VERCEL_PROJECT_ID} --token ${VERCEL_TOKEN}`,
      { encoding: 'utf8' }
    );

    if (!vercelStatus.includes('ready')) {
      throw new Error('Vercel deployment not ready');
    }

    console.log('\n✅ Deployment completed successfully!');
    console.log('\n📝 Post-deployment checklist:');
    console.log('1. Verify authentication is working');
    console.log('2. Check analytics tracking');
    console.log('3. Test quiz creation and submission');
    console.log('4. Monitor error rates in Sentry');

  } catch (error) {
    console.error('\n❌ Deployment failed:', error);
    process.exit(1);
  }
}

deploy();