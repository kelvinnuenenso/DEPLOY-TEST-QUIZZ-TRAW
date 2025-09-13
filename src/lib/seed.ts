import { TestDB } from './testStore';
import { DEMO_QUIZZES, DEMO_RESULTS, DEMO_LEADS } from './demoData';
import { DemoUserManager } from './demoUser';

// Enhanced seed data for comprehensive demo
export const seedDemo = () => {
  console.log('🌱 Seeding comprehensive demo data...');
  
  // Check if already seeded
  const existing = TestDB.listQuizzes();
  if (existing.length >= 3) {
    console.log('Demo data already exists, skipping seed');
    return;
  }

  // Clear existing demo data
  TestDB.reset();

  // Seed demo quizzes
  DEMO_QUIZZES.forEach(quiz => {
    TestDB.upsertQuiz(quiz);
  });

  // Seed demo results
  DEMO_RESULTS.forEach(result => {
    TestDB.addResult(result);
  });

  // Seed demo leads  
  DEMO_LEADS.forEach(lead => {
    TestDB.addLead(lead);
  });

  // Create initial demo user if none exists
  if (!DemoUserManager.getCurrentUser()) {
    DemoUserManager.createDemoUser({
      name: 'Usuário Demo',
      email: 'demo@elevado.app',
      company: 'Empresa Demo',
      industry: 'Tecnologia',
      experience: 'intermediate',
      goals: ['lead_generation', 'customer_insights'],
      plan: 'pro'
    });
  }

  console.log('✅ Comprehensive demo data seeded successfully');
  console.log(`📊 Seeded: ${DEMO_QUIZZES.length} quizzes, ${DEMO_RESULTS.length} results, ${DEMO_LEADS.length} leads`);
};