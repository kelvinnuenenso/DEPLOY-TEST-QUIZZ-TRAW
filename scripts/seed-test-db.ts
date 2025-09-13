import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database.types';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing Supabase environment variables');
}

const supabase = createClient<Database>(supabaseUrl, supabaseServiceKey);

async function seedTestDatabase() {
  try {
    // Limpar dados existentes
    await supabase.from('quiz_results').delete().neq('id', '');
    await supabase.from('questions').delete().neq('id', '');
    await supabase.from('quizzes').delete().neq('id', '');

    // Criar usuário de teste se não existir
    const { data: user } = await supabase.auth.admin.getUserByEmail(
      process.env.TEST_USER_EMAIL || 'test@example.com'
    );

    if (!user) {
      const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
        email: process.env.TEST_USER_EMAIL || 'test@example.com',
        password: process.env.TEST_USER_PASSWORD || 'testpassword123',
        email_confirm: true,
      });

      if (createError) throw createError;

      // Criar perfil para o usuário
      await supabase.from('profiles').insert({
        id: newUser.user.id,
        full_name: 'Test User',
      });
    }

    // Criar quiz de teste
    const { data: quiz, error: quizError } = await supabase
      .from('quizzes')
      .insert({
        title: 'Teste de Conhecimentos Gerais',
        description: 'Um quiz para testar conhecimentos variados',
        status: 'published',
        user_id: user?.id || '',
        views: 0,
        starts: 0,
      })
      .select()
      .single();

    if (quizError) throw quizError;

    // Criar perguntas de teste
    await supabase.from('questions').insert([
      {
        quiz_id: quiz.id,
        text: 'Qual é a capital do Brasil?',
        options: ['Brasília', 'Rio de Janeiro', 'São Paulo', 'Salvador'],
        correct_option: 0,
        order: 0,
      },
      {
        quiz_id: quiz.id,
        text: 'Qual é o maior planeta do sistema solar?',
        options: ['Júpiter', 'Saturno', 'Urano', 'Netuno'],
        correct_option: 0,
        order: 1,
      },
    ]);

    console.log('Test database seeded successfully');
  } catch (error) {
    console.error('Error seeding test database:', error);
    process.exit(1);
  }
}

seedTestDatabase();