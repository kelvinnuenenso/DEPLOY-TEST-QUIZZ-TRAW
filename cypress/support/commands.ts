import { supabase } from '@/integrations/supabase/client';

declare global {
  namespace Cypress {
    interface Chainable {
      login(): Chainable<void>;
      task(task: 'db:seed'): Chainable<void>;
    }
  }
}

// Login command
Cypress.Commands.add('login', () => {
  cy.session('authenticated', async () => {
    const { error } = await supabase.auth.signInWithPassword({
      email: Cypress.env('TEST_USER_EMAIL'),
      password: Cypress.env('TEST_USER_PASSWORD'),
    });

    if (error) {
      throw error;
    }
  });
});

// Database seeding task
Cypress.Commands.add('task', (task: string) => {
  if (task === 'db:seed') {
    return cy.exec('npm run seed:test').then(() => {
      return undefined;
    });
  }
  throw new Error(`Task ${task} not found`);
});