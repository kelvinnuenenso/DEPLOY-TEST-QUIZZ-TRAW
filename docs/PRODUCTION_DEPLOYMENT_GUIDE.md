# Guia de Deploy para Produção - QuizLift MVP

## 📋 Visão Geral

Este guia detalha o processo completo de deploy do QuizLift para produção, incluindo configuração do Vercel, Supabase, domínio personalizado, SSL, monitoramento e otimizações.

---

## 🏗️ Arquitetura de Produção

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Cloudflare    │    │      Vercel      │    │    Supabase     │
│   (DNS + CDN)   │───▶│   (Frontend)     │───▶│   (Backend)     │
│                 │    │                  │    │                 │
└─────────────────┘    └──────────────────┘    └─────────────────┘
         │                       │                       │
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Custom Domain │    │   Edge Functions │    │   PostgreSQL    │
│   SSL/HTTPS     │    │   API Routes     │    │   Auth & Storage│
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

### **Stack de Produção**

| Componente | Serviço | Propósito |
|------------|---------|----------|
| **Frontend** | Vercel | Hospedagem, CDN, Edge Functions |
| **Backend** | Supabase | Database, Auth, Storage, APIs |
| **DNS** | Cloudflare | DNS, CDN, Security |
| **Pagamentos** | Stripe | Processamento de pagamentos |
| **Monitoramento** | Sentry + Vercel Analytics | Logs, erros, performance |
| **Email** | Resend | Transacional |

---

## 🚀 Configuração do Vercel

### **1. Preparação do Projeto**

```bash
# Instalar Vercel CLI
npm install -g vercel

# Login no Vercel
vercel login

# Inicializar projeto
vercel
```

### **2. Configuração do Build**

```json
// vercel.json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "installCommand": "npm install",
  "framework": "vite",
  "regions": ["gru1"],
  "functions": {
    "app/api/**/*.ts": {
      "runtime": "nodejs18.x"
    }
  },
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-XSS-Protection",
          "value": "1; mode=block"
        },
        {
          "key": "Referrer-Policy",
          "value": "strict-origin-when-cross-origin"
        },
        {
          "key": "Content-Security-Policy",
          "value": "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https://*.supabase.co https://api.stripe.com;"
        }
      ]
    }
  ],
  "rewrites": [
    {
      "source": "/api/(.*)",
      "destination": "/api/$1"
    }
  ],
  "redirects": [
    {
      "source": "/dashboard/(.*)",
      "destination": "/auth/login",
      "statusCode": 302,
      "has": [
        {
          "type": "cookie",
          "key": "supabase-auth-token",
          "value": "(?<token>.*)"
        }
      ]
    }
  ]
}
```

### **3. Variáveis de Ambiente**

```bash
# Configurar no Vercel Dashboard ou via CLI
vercel env add VITE_SUPABASE_URL
vercel env add VITE_SUPABASE_ANON_KEY
vercel env add VITE_STRIPE_PUBLISHABLE_KEY
vercel env add VITE_APP_URL

# Variáveis de servidor
vercel env add SUPABASE_SERVICE_ROLE_KEY
vercel env add STRIPE_SECRET_KEY
vercel env add STRIPE_WEBHOOK_SECRET
vercel env add RESEND_API_KEY
```

### **4. Otimizações de Build**

```typescript
// vite.config.ts - Configuração para produção
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': resolve(__dirname, './src')
    }
  },
  build: {
    target: 'es2015',
    minify: 'terser',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          router: ['react-router-dom'],
          ui: ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu'],
          supabase: ['@supabase/supabase-js'],
          stripe: ['@stripe/stripe-js', '@stripe/react-stripe-js']
        }
      }
    },
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true
      }
    }
  },
  define: {
    __DEV__: false
  }
})
```

---

## 🗄️ Configuração do Supabase Produção

### **1. Criação do Projeto de Produção**

```bash
# Criar novo projeto no Supabase Dashboard
# Região: South America (São Paulo)
# Tier: Pro (para produção)

# Configurar CLI para produção
supabase login
supabase link --project-ref YOUR_PROD_PROJECT_REF
```

### **2. Migração do Schema**

```bash
# Aplicar migrações
supabase db push

# Verificar status
supabase db diff

# Aplicar seed data se necessário
supabase db reset --linked
```

### **3. Configuração de Produção**

```sql
-- supabase/migrations/002_production_config.sql

-- Configurar limites de rate limiting
ALTER ROLE authenticator SET statement_timeout = '30s';
ALTER ROLE authenticator SET idle_in_transaction_session_timeout = '60s';

-- Configurar conexões
ALTER SYSTEM SET max_connections = 100;
ALTER SYSTEM SET shared_preload_libraries = 'pg_stat_statements';

-- Índices para performance
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_quizzes_user_id_created 
  ON quizzes(user_id, created_at DESC);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_quiz_results_quiz_id_created 
  ON quiz_results(quiz_id, created_at DESC);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_quiz_analytics_date 
  ON quiz_analytics(date DESC);

-- Configurar backup automático
SELECT cron.schedule('backup-daily', '0 2 * * *', 'SELECT pg_dump();');
```

### **4. Configuração de Auth**

```bash
# No Supabase Dashboard > Authentication > Settings

# Site URL
https://quizlift.com

# Redirect URLs
https://quizlift.com/auth/callback
https://quizlift.com/dashboard

# JWT Settings
JWT_EXPIRY=3600
REFRESH_TOKEN_ROTATION_ENABLED=true
SECURITY_REFRESH_TOKEN_REUSE_INTERVAL=10

# Email Templates (customizar)
CONFIRM_SIGNUP_TEMPLATE=custom
INVITE_USER_TEMPLATE=custom
MAGIC_LINK_TEMPLATE=custom
RECOVERY_TEMPLATE=custom
```

### **5. Edge Functions de Produção**

```bash
# Deploy das Edge Functions
supabase functions deploy create-checkout-session --project-ref YOUR_PROD_PROJECT_REF
supabase functions deploy create-portal-session --project-ref YOUR_PROD_PROJECT_REF
supabase functions deploy stripe-webhook --project-ref YOUR_PROD_PROJECT_REF
supabase functions deploy send-email --project-ref YOUR_PROD_PROJECT_REF
```

---

## 🌐 Configuração de Domínio e SSL

### **1. Configuração no Cloudflare**

```bash
# Adicionar domínio no Cloudflare
# Configurar DNS records:

# A record
Type: A
Name: @
Content: 76.76.19.61 (Vercel IP)
Proxy: Enabled

# CNAME record
Type: CNAME
Name: www
Content: quizlift.com
Proxy: Enabled

# CNAME record para Vercel
Type: CNAME
Name: @
Content: cname.vercel-dns.com
Proxy: Disabled (para verificação)
```

### **2. Configuração no Vercel**

```bash
# Adicionar domínio customizado
vercel domains add quizlift.com
vercel domains add www.quizlift.com

# Configurar redirects
vercel alias set quizlift-production.vercel.app quizlift.com
```

### **3. Configuração SSL/HTTPS**

```javascript
// next.config.js ou configuração similar
module.exports = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains; preload'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          }
        ]
      }
    ]
  },
  async redirects() {
    return [
      {
        source: '/:path*',
        has: [
          {
            type: 'header',
            key: 'x-forwarded-proto',
            value: 'http'
          }
        ],
        destination: 'https://quizlift.com/:path*',
        permanent: true
      }
    ]
  }
}
```

---

## 📊 Monitoramento e Analytics

### **1. Configuração do Sentry**

```bash
npm install @sentry/react @sentry/tracing
```

```typescript
// src/lib/sentry.ts
import * as Sentry from '@sentry/react'
import { BrowserTracing } from '@sentry/tracing'

Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN,
  environment: import.meta.env.MODE,
  integrations: [
    new BrowserTracing({
      routingInstrumentation: Sentry.reactRouterV6Instrumentation(
        React.useEffect,
        useLocation,
        useNavigationType,
        createRoutesFromChildren,
        matchRoutes
      )
    })
  ],
  tracesSampleRate: 0.1,
  beforeSend(event) {
    // Filtrar erros irrelevantes
    if (event.exception) {
      const error = event.exception.values?.[0]
      if (error?.value?.includes('Non-Error promise rejection')) {
        return null
      }
    }
    return event
  }
})
```

### **2. Vercel Analytics**

```typescript
// src/lib/analytics.ts
import { Analytics } from '@vercel/analytics/react'

export function VercelAnalytics() {
  return <Analytics />
}

// Adicionar no App.tsx
import { VercelAnalytics } from '@/lib/analytics'

function App() {
  return (
    <>
      {/* Seu app */}
      <VercelAnalytics />
    </>
  )
}
```

### **3. Custom Analytics**

```typescript
// src/lib/tracking.ts
interface AnalyticsEvent {
  event: string
  properties?: Record<string, any>
}

class Analytics {
  private static instance: Analytics
  private userId?: string

  static getInstance() {
    if (!Analytics.instance) {
      Analytics.instance = new Analytics()
    }
    return Analytics.instance
  }

  setUser(userId: string) {
    this.userId = userId
  }

  track(event: string, properties?: Record<string, any>) {
    if (import.meta.env.PROD) {
      // Enviar para Supabase Analytics
      supabase.from('analytics_events').insert({
        event,
        properties,
        user_id: this.userId,
        timestamp: new Date().toISOString(),
        url: window.location.href,
        user_agent: navigator.userAgent
      })
    }
  }

  // Eventos específicos
  trackQuizCreated(quizId: string) {
    this.track('quiz_created', { quiz_id: quizId })
  }

  trackQuizCompleted(quizId: string, score: number) {
    this.track('quiz_completed', { quiz_id: quizId, score })
  }

  trackSubscription(plan: string) {
    this.track('subscription_created', { plan })
  }
}

export const analytics = Analytics.getInstance()
```

---

## 🔒 Segurança em Produção

### **1. Configuração de CORS**

```sql
-- No Supabase, configurar CORS
SELECT set_config('app.cors_origins', 'https://quizlift.com,https://www.quizlift.com', false);
```

### **2. Rate Limiting**

```typescript
// src/lib/rate-limit.ts
import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!
})

export const ratelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(10, '10 s'),
  analytics: true
})

// Usar em API routes
export async function POST(request: Request) {
  const ip = request.headers.get('x-forwarded-for') ?? 'anonymous'
  const { success } = await ratelimit.limit(ip)
  
  if (!success) {
    return new Response('Rate limit exceeded', { status: 429 })
  }
  
  // Continuar com a lógica
}
```

### **3. Validação de Input**

```typescript
// src/lib/validation.ts
import { z } from 'zod'

export const QuizSchema = z.object({
  title: z.string().min(1).max(100),
  description: z.string().max(500),
  questions: z.array(z.object({
    text: z.string().min(1).max(500),
    type: z.enum(['multiple_choice', 'true_false', 'open_text']),
    options: z.array(z.object({
      text: z.string().min(1).max(200),
      isCorrect: z.boolean()
    })).min(2).max(6)
  })).min(1).max(50)
})

// Usar em componentes e APIs
export function validateQuiz(data: unknown) {
  try {
    return QuizSchema.parse(data)
  } catch (error) {
    throw new Error('Dados do quiz inválidos')
  }
}
```

---

## 🚀 Pipeline de Deploy

### **1. GitHub Actions**

```yaml
# .github/workflows/production.yml
name: Production Deploy

on:
  push:
    branches: [main]
  workflow_dispatch:

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - run: npm ci
      - run: npm run test:coverage
      - run: npm run build
      
      - name: Upload coverage
        uses: codecov/codecov-action@v3

  deploy:
    needs: test
    runs-on: ubuntu-latest
    environment: production
    steps:
      - uses: actions/checkout@v3
      
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'
      
      - name: Deploy Supabase Functions
        run: |
          npx supabase functions deploy --project-ref ${{ secrets.SUPABASE_PROJECT_REF }}
        env:
          SUPABASE_ACCESS_TOKEN: ${{ secrets.SUPABASE_ACCESS_TOKEN }}
      
      - name: Run Smoke Tests
        run: |
          npm run test:e2e -- --grep "@smoke"
        env:
          PLAYWRIGHT_BASE_URL: https://quizlift.com
      
      - name: Notify Slack
        if: always()
        uses: 8398a7/action-slack@v3
        with:
          status: ${{ job.status }}
          webhook_url: ${{ secrets.SLACK_WEBHOOK }}
```

### **2. Scripts de Deploy**

```json
// package.json
{
  "scripts": {
    "deploy:staging": "vercel --target staging",
    "deploy:production": "vercel --prod",
    "deploy:functions": "supabase functions deploy",
    "deploy:full": "npm run test:all && npm run deploy:production && npm run deploy:functions",
    "rollback": "vercel rollback"
  }
}
```

---

## 📈 Performance e Otimização

### **1. Otimizações de Bundle**

```typescript
// src/lib/lazy-imports.ts
import { lazy } from 'react'

// Lazy loading de páginas
export const Dashboard = lazy(() => import('@/pages/Dashboard'))
export const QuizEditor = lazy(() => import('@/pages/QuizEditor'))
export const Analytics = lazy(() => import('@/pages/Analytics'))
export const Billing = lazy(() => import('@/pages/Billing'))

// Lazy loading de componentes pesados
export const ChartComponent = lazy(() => import('@/components/charts/ChartComponent'))
export const RichTextEditor = lazy(() => import('@/components/editor/RichTextEditor'))
```

### **2. Otimização de Imagens**

```typescript
// src/components/OptimizedImage.tsx
import { useState } from 'react'

interface OptimizedImageProps {
  src: string
  alt: string
  width?: number
  height?: number
  className?: string
}

export function OptimizedImage({ src, alt, width, height, className }: OptimizedImageProps) {
  const [isLoaded, setIsLoaded] = useState(false)
  
  return (
    <div className={`relative ${className}`}>
      {!isLoaded && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse rounded" />
      )}
      <img
        src={src}
        alt={alt}
        width={width}
        height={height}
        loading="lazy"
        decoding="async"
        onLoad={() => setIsLoaded(true)}
        className={`transition-opacity duration-300 ${
          isLoaded ? 'opacity-100' : 'opacity-0'
        }`}
      />
    </div>
  )
}
```

### **3. Service Worker**

```typescript
// public/sw.js
const CACHE_NAME = 'quizlift-v1'
const urlsToCache = [
  '/',
  '/static/js/bundle.js',
  '/static/css/main.css',
  '/manifest.json'
]

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
  )
})

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        if (response) {
          return response
        }
        return fetch(event.request)
      }
    )
  )
})
```

---

## 🔍 Monitoramento e Alertas

### **1. Health Checks**

```typescript
// api/health.ts
export async function GET() {
  try {
    // Verificar conexão com Supabase
    const { data, error } = await supabase
      .from('user_profiles')
      .select('count')
      .limit(1)
    
    if (error) throw error
    
    // Verificar Stripe
    const stripeHealth = await stripe.accounts.retrieve()
    
    return Response.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      services: {
        database: 'up',
        stripe: 'up',
        auth: 'up'
      }
    })
  } catch (error) {
    return Response.json(
      {
        status: 'unhealthy',
        error: error.message,
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
}
```

### **2. Alertas Automatizados**

```typescript
// src/lib/alerts.ts
interface Alert {
  type: 'error' | 'warning' | 'info'
  message: string
  metadata?: Record<string, any>
}

class AlertManager {
  static async sendAlert(alert: Alert) {
    if (import.meta.env.PROD) {
      // Enviar para Slack
      await fetch(process.env.SLACK_WEBHOOK_URL!, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: `🚨 ${alert.type.toUpperCase()}: ${alert.message}`,
          attachments: alert.metadata ? [{
            color: alert.type === 'error' ? 'danger' : 'warning',
            fields: Object.entries(alert.metadata).map(([key, value]) => ({
              title: key,
              value: String(value),
              short: true
            }))
          }] : []
        })
      })
      
      // Log no Sentry
      Sentry.captureMessage(alert.message, alert.type as any)
    }
  }
}

export const alerts = AlertManager
```

---

## 📋 Checklist de Deploy

### **Pré-Deploy**

- [ ] **Testes**
  - [ ] Todos os testes unitários passando
  - [ ] Testes de integração passando
  - [ ] Testes E2E críticos passando
  - [ ] Cobertura de código ≥ 80%

- [ ] **Configuração**
  - [ ] Variáveis de ambiente configuradas
  - [ ] Secrets configurados no Vercel
  - [ ] Domínio configurado
  - [ ] SSL ativo

- [ ] **Supabase**
  - [ ] Projeto de produção criado
  - [ ] Migrações aplicadas
  - [ ] RLS configurado
  - [ ] Edge Functions deployadas
  - [ ] Backup configurado

- [ ] **Stripe**
  - [ ] Conta de produção ativa
  - [ ] Produtos criados
  - [ ] Webhooks configurados
  - [ ] Chaves de produção configuradas

### **Deploy**

- [ ] **Build**
  - [ ] Build de produção sem erros
  - [ ] Bundle size otimizado
  - [ ] Assets otimizados
  - [ ] Source maps gerados

- [ ] **Deploy**
  - [ ] Deploy no Vercel realizado
  - [ ] Edge Functions deployadas
  - [ ] DNS propagado
  - [ ] HTTPS funcionando

### **Pós-Deploy**

- [ ] **Verificação**
  - [ ] Site carregando corretamente
  - [ ] Autenticação funcionando
  - [ ] Pagamentos funcionando
  - [ ] APIs respondendo
  - [ ] Analytics funcionando

- [ ] **Monitoramento**
  - [ ] Sentry configurado
  - [ ] Alertas configurados
  - [ ] Health checks ativos
  - [ ] Logs sendo coletados

- [ ] **Performance**
  - [ ] Core Web Vitals OK
  - [ ] Lighthouse Score > 90
  - [ ] Tempo de carregamento < 3s
  - [ ] Mobile responsivo

---

## 🚨 Plano de Rollback

### **1. Rollback Automático**

```bash
# Script de rollback
#!/bin/bash

echo "🔄 Iniciando rollback..."

# Rollback do Vercel
vercel rollback --token $VERCEL_TOKEN

# Rollback das Edge Functions (se necessário)
supabase functions deploy --project-ref $SUPABASE_PROJECT_REF --rollback

# Verificar health
curl -f https://quizlift.com/api/health || exit 1

echo "✅ Rollback concluído com sucesso"
```

### **2. Procedimento Manual**

1. **Identificar o problema**
   - Verificar logs no Vercel
   - Verificar Sentry para erros
   - Verificar métricas de performance

2. **Executar rollback**
   ```bash
   vercel rollback
   ```

3. **Verificar funcionamento**
   - Testar funcionalidades críticas
   - Verificar métricas
   - Confirmar com usuários

4. **Investigar e corrigir**
   - Analisar causa raiz
   - Implementar correção
   - Testar em staging
   - Redeploy quando pronto

---

## 📊 Métricas de Sucesso

### **Técnicas**
- **Uptime**: ≥ 99.9%
- **Response Time**: < 200ms (API)
- **Page Load**: < 3s
- **Error Rate**: < 0.1%
- **Core Web Vitals**: Todos "Good"

### **Negócio**
- **Conversão**: Taxa de signup → paid
- **Retenção**: Usuários ativos mensais
- **Performance**: Quizzes criados/dia
- **Revenue**: MRR (Monthly Recurring Revenue)

---

**Status**: 🟢 Pronto para Deploy  
**Estimativa**: 1-2 dias de configuração  
**Dependências**: Domínio registrado, contas de serviços criadas