# Estratégia de Testes - QuizLift MVP

## 📋 Visão Geral

Este documento define a estratégia completa de testes para o QuizLift, incluindo testes unitários, de integração, end-to-end e de performance para garantir um MVP 100% funcional.

---

## 🏗️ Arquitetura de Testes

### **Pirâmide de Testes**

```
        /\     E2E Tests (10%)
       /  \    - Cypress/Playwright
      /    \   - Fluxos críticos
     /______\  
    /        \ Integration Tests (20%)
   /          \ - API + Database
  /            \ - Supabase Functions
 /______________\
/                \ Unit Tests (70%)
\________________/ - Components, Hooks, Utils
```

### **Stack de Testes**

| Tipo | Ferramenta | Propósito |
|------|------------|----------|
| **Unit** | Vitest + Testing Library | Componentes, hooks, utils |
| **Integration** | Vitest + MSW | APIs, serviços, database |
| **E2E** | Playwright | Fluxos completos |
| **Visual** | Chromatic/Percy | Regressão visual |
| **Performance** | Lighthouse CI | Core Web Vitals |

---

## 🧪 Configuração de Testes

### **1. Instalação de Dependências**

```bash
# Testes unitários e integração
npm install -D vitest @testing-library/react @testing-library/jest-dom @testing-library/user-event
npm install -D jsdom @vitejs/plugin-react
npm install -D msw

# Testes E2E
npm install -D @playwright/test

# Utilitários
npm install -D @faker-js/faker
npm install -D @testing-library/react-hooks
```

### **2. Configuração do Vitest**

```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    css: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'src/test/',
        '**/*.d.ts',
        '**/*.config.*',
        'dist/'
      ],
      thresholds: {
        global: {
          branches: 80,
          functions: 80,
          lines: 80,
          statements: 80
        }
      }
    }
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  }
})
```

### **3. Setup de Testes**

```typescript
// src/test/setup.ts
import '@testing-library/jest-dom'
import { cleanup } from '@testing-library/react'
import { afterEach, beforeAll, afterAll } from 'vitest'
import { server } from './mocks/server'

// MSW Server
beforeAll(() => server.listen())
afterEach(() => {
  server.resetHandlers()
  cleanup()
})
afterAll(() => server.close())

// Mock do Supabase
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    auth: {
      getUser: vi.fn(),
      signInWithOAuth: vi.fn(),
      signOut: vi.fn()
    },
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      delete: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn()
    }))
  }
}))

// Mock do React Router
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => vi.fn(),
    useLocation: () => ({ pathname: '/' })
  }
})
```

### **4. Mocks com MSW**

```typescript
// src/test/mocks/handlers.ts
import { rest } from 'msw'
import { faker } from '@faker-js/faker'

export const handlers = [
  // Supabase Auth
  rest.post('*/auth/v1/token', (req, res, ctx) => {
    return res(
      ctx.json({
        access_token: faker.datatype.uuid(),
        user: {
          id: faker.datatype.uuid(),
          email: faker.internet.email(),
          user_metadata: {
            plan_type: 'free'
          }
        }
      })
    )
  }),

  // Quizzes API
  rest.get('*/rest/v1/quizzes', (req, res, ctx) => {
    return res(
      ctx.json([
        {
          id: faker.datatype.uuid(),
          title: faker.lorem.sentence(),
          description: faker.lorem.paragraph(),
          created_at: faker.date.recent().toISOString()
        }
      ])
    )
  }),

  rest.post('*/rest/v1/quizzes', (req, res, ctx) => {
    return res(
      ctx.json({
        id: faker.datatype.uuid(),
        ...req.body
      })
    )
  }),

  // Stripe
  rest.post('*/functions/v1/create-checkout-session', (req, res, ctx) => {
    return res(
      ctx.json({
        sessionId: 'cs_test_' + faker.datatype.uuid()
      })
    )
  })
]
```

```typescript
// src/test/mocks/server.ts
import { setupServer } from 'msw/node'
import { handlers } from './handlers'

export const server = setupServer(...handlers)
```

---

## 🔧 Testes Unitários

### **1. Testes de Componentes**

```typescript
// src/components/__tests__/QuizCard.test.tsx
import { render, screen, fireEvent } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { QuizCard } from '../QuizCard'
import { Quiz } from '@/types/quiz'

const mockQuiz: Quiz = {
  id: '1',
  title: 'Quiz de Teste',
  description: 'Descrição do quiz',
  questions: [],
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  user_id: 'user-1',
  is_published: false
}

const renderWithRouter = (component: React.ReactElement) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  )
}

describe('QuizCard', () => {
  test('should render quiz information correctly', () => {
    renderWithRouter(<QuizCard quiz={mockQuiz} />)
    
    expect(screen.getByText('Quiz de Teste')).toBeInTheDocument()
    expect(screen.getByText('Descrição do quiz')).toBeInTheDocument()
  })

  test('should call onEdit when edit button is clicked', () => {
    const mockOnEdit = vi.fn()
    renderWithRouter(
      <QuizCard quiz={mockQuiz} onEdit={mockOnEdit} />
    )
    
    const editButton = screen.getByRole('button', { name: /editar/i })
    fireEvent.click(editButton)
    
    expect(mockOnEdit).toHaveBeenCalledWith(mockQuiz.id)
  })

  test('should show published status correctly', () => {
    const publishedQuiz = { ...mockQuiz, is_published: true }
    renderWithRouter(<QuizCard quiz={publishedQuiz} />)
    
    expect(screen.getByText(/publicado/i)).toBeInTheDocument()
  })
})
```

### **2. Testes de Hooks**

```typescript
// src/hooks/__tests__/useAuth.test.ts
import { renderHook, act } from '@testing-library/react'
import { useAuth } from '../useAuth'
import { supabase } from '@/integrations/supabase/client'

// Mock do Supabase
vi.mock('@/integrations/supabase/client')
const mockSupabase = vi.mocked(supabase)

describe('useAuth', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  test('should initialize with null user', () => {
    const { result } = renderHook(() => useAuth())
    
    expect(result.current.user).toBeNull()
    expect(result.current.loading).toBe(true)
  })

  test('should sign in with Google', async () => {
    mockSupabase.auth.signInWithOAuth.mockResolvedValue({
      data: { url: 'https://google.com/oauth' },
      error: null
    })

    const { result } = renderHook(() => useAuth())
    
    await act(async () => {
      await result.current.signInWithGoogle()
    })

    expect(mockSupabase.auth.signInWithOAuth).toHaveBeenCalledWith({
      provider: 'google',
      options: {
        redirectTo: expect.stringContaining('/dashboard')
      }
    })
  })

  test('should handle sign out', async () => {
    mockSupabase.auth.signOut.mockResolvedValue({ error: null })

    const { result } = renderHook(() => useAuth())
    
    await act(async () => {
      await result.current.signOut()
    })

    expect(mockSupabase.auth.signOut).toHaveBeenCalled()
  })
})
```

### **3. Testes de Utilitários**

```typescript
// src/utils/__tests__/validation.test.ts
import { validateQuiz, validateEmail } from '../validation'

describe('validation utils', () => {
  describe('validateQuiz', () => {
    test('should validate a complete quiz', () => {
      const validQuiz = {
        title: 'Quiz Válido',
        description: 'Descrição válida',
        questions: [
          {
            id: '1',
            text: 'Pergunta 1?',
            type: 'multiple_choice',
            options: [
              { id: '1', text: 'Opção 1', isCorrect: true },
              { id: '2', text: 'Opção 2', isCorrect: false }
            ]
          }
        ]
      }

      const result = validateQuiz(validQuiz)
      expect(result.isValid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    test('should return errors for invalid quiz', () => {
      const invalidQuiz = {
        title: '',
        description: '',
        questions: []
      }

      const result = validateQuiz(invalidQuiz)
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('Título é obrigatório')
      expect(result.errors).toContain('Pelo menos uma pergunta é necessária')
    })
  })

  describe('validateEmail', () => {
    test('should validate correct email formats', () => {
      expect(validateEmail('test@example.com')).toBe(true)
      expect(validateEmail('user.name+tag@domain.co.uk')).toBe(true)
    })

    test('should reject invalid email formats', () => {
      expect(validateEmail('invalid-email')).toBe(false)
      expect(validateEmail('@domain.com')).toBe(false)
      expect(validateEmail('user@')).toBe(false)
    })
  })
})
```

---

## 🔗 Testes de Integração

### **1. Testes de Serviços**

```typescript
// src/services/__tests__/quizService.test.ts
import { quizService } from '../quizService'
import { server } from '@/test/mocks/server'
import { rest } from 'msw'

describe('quizService', () => {
  test('should fetch quizzes successfully', async () => {
    const mockQuizzes = [
      { id: '1', title: 'Quiz 1' },
      { id: '2', title: 'Quiz 2' }
    ]

    server.use(
      rest.get('*/rest/v1/quizzes', (req, res, ctx) => {
        return res(ctx.json(mockQuizzes))
      })
    )

    const result = await quizService.getQuizzes()
    expect(result).toEqual(mockQuizzes)
  })

  test('should handle API errors gracefully', async () => {
    server.use(
      rest.get('*/rest/v1/quizzes', (req, res, ctx) => {
        return res(ctx.status(500), ctx.json({ error: 'Server error' }))
      })
    )

    await expect(quizService.getQuizzes()).rejects.toThrow('Server error')
  })

  test('should create quiz with correct data', async () => {
    const newQuiz = {
      title: 'Novo Quiz',
      description: 'Descrição do novo quiz'
    }

    server.use(
      rest.post('*/rest/v1/quizzes', async (req, res, ctx) => {
        const body = await req.json()
        expect(body).toMatchObject(newQuiz)
        return res(ctx.json({ id: '123', ...body }))
      })
    )

    const result = await quizService.createQuiz(newQuiz)
    expect(result.id).toBe('123')
    expect(result.title).toBe(newQuiz.title)
  })
})
```

### **2. Testes de Fluxos Completos**

```typescript
// src/__tests__/quiz-creation-flow.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from '@/contexts/AuthContext'
import { QuizEditor } from '@/pages/QuizEditor'

const renderWithProviders = (component: React.ReactElement) => {
  return render(
    <BrowserRouter>
      <AuthProvider>
        {component}
      </AuthProvider>
    </BrowserRouter>
  )
}

describe('Quiz Creation Flow', () => {
  test('should create a complete quiz', async () => {
    const user = userEvent.setup()
    renderWithProviders(<QuizEditor />)

    // Preencher título
    const titleInput = screen.getByLabelText(/título/i)
    await user.type(titleInput, 'Meu Novo Quiz')

    // Preencher descrição
    const descriptionInput = screen.getByLabelText(/descrição/i)
    await user.type(descriptionInput, 'Descrição do quiz')

    // Adicionar pergunta
    const addQuestionButton = screen.getByRole('button', { name: /adicionar pergunta/i })
    await user.click(addQuestionButton)

    // Preencher pergunta
    const questionInput = screen.getByLabelText(/texto da pergunta/i)
    await user.type(questionInput, 'Qual é a capital do Brasil?')

    // Adicionar opções
    const addOptionButton = screen.getByRole('button', { name: /adicionar opção/i })
    await user.click(addOptionButton)
    await user.click(addOptionButton)

    const optionInputs = screen.getAllByLabelText(/opção/i)
    await user.type(optionInputs[0], 'Brasília')
    await user.type(optionInputs[1], 'São Paulo')

    // Marcar resposta correta
    const correctAnswerCheckbox = screen.getAllByRole('checkbox')[0]
    await user.click(correctAnswerCheckbox)

    // Salvar quiz
    const saveButton = screen.getByRole('button', { name: /salvar/i })
    await user.click(saveButton)

    // Verificar sucesso
    await waitFor(() => {
      expect(screen.getByText(/quiz salvo com sucesso/i)).toBeInTheDocument()
    })
  })
})
```

---

## 🎭 Testes End-to-End

### **1. Configuração do Playwright**

```typescript
// playwright.config.ts
import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure'
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    }
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
})
```

### **2. Testes de Fluxos Críticos**

```typescript
// e2e/auth-flow.spec.ts
import { test, expect } from '@playwright/test'

test.describe('Authentication Flow', () => {
  test('should complete Google OAuth flow', async ({ page }) => {
    await page.goto('/')
    
    // Clicar em "Começar grátis"
    await page.click('text=Começar grátis')
    
    // Verificar redirecionamento para login
    await expect(page).toHaveURL('/auth/login')
    
    // Clicar em "Entrar com Google"
    await page.click('text=Entrar com Google')
    
    // Mock da resposta do Google (em ambiente de teste)
    await page.route('**/auth/v1/authorize**', route => {
      route.fulfill({
        status: 302,
        headers: {
          'Location': '/dashboard?access_token=mock_token'
        }
      })
    })
    
    // Verificar redirecionamento para dashboard
    await expect(page).toHaveURL('/dashboard')
    await expect(page.locator('text=Dashboard')).toBeVisible()
  })
})
```

```typescript
// e2e/quiz-management.spec.ts
import { test, expect } from '@playwright/test'

test.describe('Quiz Management', () => {
  test.beforeEach(async ({ page }) => {
    // Mock de autenticação
    await page.addInitScript(() => {
      localStorage.setItem('supabase.auth.token', JSON.stringify({
        access_token: 'mock_token',
        user: { id: 'user-1', email: 'test@example.com' }
      }))
    })
    
    await page.goto('/dashboard')
  })

  test('should create a new quiz', async ({ page }) => {
    // Clicar em "Criar Quiz"
    await page.click('text=Criar Quiz')
    
    // Preencher formulário
    await page.fill('[data-testid="quiz-title"]', 'Quiz E2E Test')
    await page.fill('[data-testid="quiz-description"]', 'Descrição do teste E2E')
    
    // Adicionar pergunta
    await page.click('[data-testid="add-question"]')
    await page.fill('[data-testid="question-text"]', 'Pergunta de teste?')
    
    // Adicionar opções
    await page.click('[data-testid="add-option"]')
    await page.fill('[data-testid="option-0"]', 'Opção 1')
    await page.click('[data-testid="add-option"]')
    await page.fill('[data-testid="option-1"]', 'Opção 2')
    
    // Marcar resposta correta
    await page.check('[data-testid="correct-0"]')
    
    // Salvar quiz
    await page.click('text=Salvar Quiz')
    
    // Verificar sucesso
    await expect(page.locator('text=Quiz criado com sucesso')).toBeVisible()
    await expect(page).toHaveURL('/dashboard')
    await expect(page.locator('text=Quiz E2E Test')).toBeVisible()
  })

  test('should publish and share quiz', async ({ page }) => {
    // Assumir que existe um quiz
    await page.click('[data-testid="quiz-card"]:first-child [data-testid="edit-quiz"]')
    
    // Publicar quiz
    await page.click('text=Publicar')
    await expect(page.locator('text=Quiz publicado')).toBeVisible()
    
    // Copiar link de compartilhamento
    await page.click('text=Compartilhar')
    const shareLink = await page.locator('[data-testid="share-link"]').inputValue()
    expect(shareLink).toContain('/quiz/')
    
    // Testar link em nova aba
    const newPage = await page.context().newPage()
    await newPage.goto(shareLink)
    await expect(newPage.locator('text=Quiz E2E Test')).toBeVisible()
  })
})
```

### **3. Testes de Performance**

```typescript
// e2e/performance.spec.ts
import { test, expect } from '@playwright/test'

test.describe('Performance Tests', () => {
  test('should meet Core Web Vitals thresholds', async ({ page }) => {
    await page.goto('/')
    
    // Medir LCP (Largest Contentful Paint)
    const lcp = await page.evaluate(() => {
      return new Promise((resolve) => {
        new PerformanceObserver((list) => {
          const entries = list.getEntries()
          const lastEntry = entries[entries.length - 1]
          resolve(lastEntry.startTime)
        }).observe({ entryTypes: ['largest-contentful-paint'] })
      })
    })
    
    expect(lcp).toBeLessThan(2500) // LCP < 2.5s
    
    // Medir CLS (Cumulative Layout Shift)
    const cls = await page.evaluate(() => {
      return new Promise((resolve) => {
        let clsValue = 0
        new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (!entry.hadRecentInput) {
              clsValue += entry.value
            }
          }
          resolve(clsValue)
        }).observe({ entryTypes: ['layout-shift'] })
        
        setTimeout(() => resolve(clsValue), 5000)
      })
    })
    
    expect(cls).toBeLessThan(0.1) // CLS < 0.1
  })

  test('should load dashboard quickly', async ({ page }) => {
    const startTime = Date.now()
    
    await page.goto('/dashboard')
    await page.waitForSelector('[data-testid="dashboard-content"]')
    
    const loadTime = Date.now() - startTime
    expect(loadTime).toBeLessThan(3000) // < 3s
  })
})
```

---

## 📊 Cobertura e Relatórios

### **1. Scripts de Teste**

```json
// package.json
{
  "scripts": {
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest --coverage",
    "test:watch": "vitest --watch",
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui",
    "test:all": "npm run test:coverage && npm run test:e2e",
    "test:ci": "npm run test:coverage -- --reporter=junit --outputFile=test-results.xml"
  }
}
```

### **2. Configuração de CI/CD**

```yaml
# .github/workflows/test.yml
name: Tests

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  unit-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - run: npm ci
      - run: npm run test:coverage
      
      - name: Upload coverage to Codecov
        uses: codecov/codecov-action@v3
        with:
          file: ./coverage/lcov.info

  e2e-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - run: npm ci
      - run: npx playwright install --with-deps
      - run: npm run test:e2e
      
      - uses: actions/upload-artifact@v3
        if: failure()
        with:
          name: playwright-report
          path: playwright-report/
```

### **3. Relatórios de Qualidade**

```typescript
// scripts/test-report.ts
import fs from 'fs'
import path from 'path'

interface TestResults {
  coverage: {
    lines: number
    functions: number
    branches: number
    statements: number
  }
  tests: {
    total: number
    passed: number
    failed: number
    skipped: number
  }
}

function generateTestReport() {
  const coverageFile = path.join(__dirname, '../coverage/coverage-summary.json')
  const coverage = JSON.parse(fs.readFileSync(coverageFile, 'utf8'))
  
  const report: TestResults = {
    coverage: {
      lines: coverage.total.lines.pct,
      functions: coverage.total.functions.pct,
      branches: coverage.total.branches.pct,
      statements: coverage.total.statements.pct
    },
    tests: {
      total: 0, // Extrair do resultado dos testes
      passed: 0,
      failed: 0,
      skipped: 0
    }
  }
  
  console.log('📊 Relatório de Testes')
  console.log('======================')
  console.log(`Cobertura de Linhas: ${report.coverage.lines}%`)
  console.log(`Cobertura de Funções: ${report.coverage.functions}%`)
  console.log(`Cobertura de Branches: ${report.coverage.branches}%`)
  console.log(`Cobertura de Statements: ${report.coverage.statements}%`)
  
  // Verificar se atende aos critérios mínimos
  const minCoverage = 80
  const meetsStandards = Object.values(report.coverage).every(pct => pct >= minCoverage)
  
  if (!meetsStandards) {
    console.error('❌ Cobertura abaixo do mínimo exigido (80%)')
    process.exit(1)
  }
  
  console.log('✅ Todos os critérios de qualidade foram atendidos!')
}

generateTestReport()
```

---

## 🚀 Estratégia de Deploy com Testes

### **1. Pipeline de Deploy**

```yaml
# .github/workflows/deploy.yml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  test-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      # Testes
      - name: Run Tests
        run: |
          npm ci
          npm run test:all
      
      # Build
      - name: Build
        run: npm run build
      
      # Deploy para Staging
      - name: Deploy to Staging
        run: |
          # Deploy para ambiente de staging
          vercel --prod --token ${{ secrets.VERCEL_TOKEN }}
      
      # Smoke Tests em Staging
      - name: Smoke Tests
        run: |
          npm run test:e2e -- --grep "@smoke"
      
      # Deploy para Produção
      - name: Deploy to Production
        if: success()
        run: |
          # Deploy para produção
          vercel --prod --token ${{ secrets.VERCEL_TOKEN }}
```

### **2. Testes de Smoke**

```typescript
// e2e/smoke.spec.ts
import { test, expect } from '@playwright/test'

test.describe('Smoke Tests @smoke', () => {
  test('should load homepage', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('h1')).toContainText('QuizLift')
  })

  test('should load dashboard for authenticated user', async ({ page }) => {
    // Mock auth
    await page.addInitScript(() => {
      localStorage.setItem('supabase.auth.token', 'mock_token')
    })
    
    await page.goto('/dashboard')
    await expect(page.locator('text=Dashboard')).toBeVisible()
  })

  test('should handle API endpoints', async ({ page }) => {
    const response = await page.request.get('/api/health')
    expect(response.status()).toBe(200)
  })
})
```

---

## 📈 Métricas e Monitoramento

### **1. Métricas de Qualidade**

| Métrica | Meta | Atual |
|---------|------|-------|
| **Cobertura de Código** | ≥ 80% | - |
| **Testes Unitários** | ≥ 70% | - |
| **Testes de Integração** | ≥ 20% | - |
| **Testes E2E** | ≥ 10% | - |
| **Tempo de Execução** | < 5min | - |

### **2. Dashboard de Qualidade**

```typescript
// scripts/quality-dashboard.ts
interface QualityMetrics {
  coverage: number
  testCount: number
  passRate: number
  performance: {
    lcp: number
    fid: number
    cls: number
  }
}

function generateQualityDashboard(metrics: QualityMetrics) {
  console.log(`
🎯 Dashboard de Qualidade - QuizLift MVP
${'='.repeat(50)}

📊 Cobertura de Testes: ${metrics.coverage}%
🧪 Total de Testes: ${metrics.testCount}
✅ Taxa de Sucesso: ${metrics.passRate}%

⚡ Performance:
  LCP: ${metrics.performance.lcp}ms
  FID: ${metrics.performance.fid}ms
  CLS: ${metrics.performance.cls}

${metrics.coverage >= 80 ? '✅' : '❌'} Cobertura adequada
${metrics.passRate >= 95 ? '✅' : '❌'} Taxa de sucesso adequada
${metrics.performance.lcp < 2500 ? '✅' : '❌'} LCP adequado
`)
}
```

---

## 🎯 Checklist de Testes para MVP

### **Funcionalidades Críticas**

- [ ] **Autenticação**
  - [ ] Login com Google OAuth
  - [ ] Logout
  - [ ] Proteção de rotas
  - [ ] Persistência de sessão

- [ ] **Gestão de Quizzes**
  - [ ] Criar quiz
  - [ ] Editar quiz
  - [ ] Excluir quiz
  - [ ] Publicar/despublicar
  - [ ] Listar quizzes

- [ ] **Sistema de Perguntas**
  - [ ] Adicionar pergunta
  - [ ] Editar pergunta
  - [ ] Remover pergunta
  - [ ] Múltiplas opções
  - [ ] Resposta correta

- [ ] **Compartilhamento**
  - [ ] Gerar link público
  - [ ] Visualização pública
  - [ ] Coleta de respostas

- [ ] **Analytics**
  - [ ] Visualizar resultados
  - [ ] Estatísticas básicas
  - [ ] Exportar dados

- [ ] **Sistema de Pagamentos**
  - [ ] Planos de assinatura
  - [ ] Checkout com Stripe
  - [ ] Controle de acesso
  - [ ] Portal do cliente

### **Testes de Regressão**

- [ ] **Compatibilidade**
  - [ ] Chrome, Firefox, Safari
  - [ ] Mobile responsivo
  - [ ] Diferentes resoluções

- [ ] **Performance**
  - [ ] Tempo de carregamento < 3s
  - [ ] Core Web Vitals
  - [ ] Bundle size otimizado

- [ ] **Segurança**
  - [ ] Validação de inputs
  - [ ] Proteção CSRF
  - [ ] Sanitização de dados
  - [ ] RLS no Supabase

---

**Status**: 🟡 Pronto para Implementação  
**Estimativa**: 2-3 dias de configuração + testes contínuos  
**Cobertura Meta**: 80% de código, 95% de funcionalidades críticas