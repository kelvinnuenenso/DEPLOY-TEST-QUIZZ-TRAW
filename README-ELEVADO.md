# 🚀 Elevado Quizz - SaaS de Quizzes Profissionais

![Elevado Quizz](https://img.shields.io/badge/Status-MVP%20Funcional-brightgreen)
![React](https://img.shields.io/badge/React-18.3.1-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue)
![Tailwind](https://img.shields.io/badge/Tailwind-CSS-blue)

Plataforma completa para criação de **quizzes interativos**, **formulários multi-etapas** e **funis de vendas** com foco em conversão e captura de leads.

## ✨ Funcionalidades Implementadas

### 🎯 Core MVP
- ✅ **Landing Page** profissional com CTAs funcionais
- ✅ **Editor Visual** de quizzes drag-and-drop
- ✅ **Quiz Runner** público (/q/[publicId]) responsivo
- ✅ **Dashboard** com métricas e analytics
- ✅ **Página de Resultados** personalizável
- ✅ **Sistema de Storage** local para modo teste

### 🎨 Design System
- ✅ **Paleta Resultado Elevado**: Azul (#2563EB), Branco, Preto
- ✅ **Componentes shadcn/ui** customizados
- ✅ **Responsivo** mobile-first
- ✅ **Animações** e transições suaves
- ✅ **Tokens semânticos** CSS

### 📊 Tipos de Pergunta
- ✅ **Escolha única** (single choice)
- ✅ **Múltipla escolha** (multiple choice)  
- ✅ **Avaliação por estrelas** (rating)
- ✅ **Captura de e-mail** (email)
- ✅ **Texto curto** (short_text)
- 🔄 **NPS, Slider, Upload** (próximas versões)

### 🎛️ Recursos Avançados
- ✅ **Barra de Progresso** visual
- ✅ **Sistema de Pontuação** por resposta
- ✅ **Resultados Personalizados** por faixa de score
- ✅ **Coleta de Leads** automática
- ✅ **UTM Tracking** nativo
- ✅ **Analytics** básico (visualizações, conversões)

## 🚦 Como Usar (Modo Teste)

### 1. Acesse a Landing Page
```
http://localhost:8080
```

### 2. Clique em "Começar Grátis"
- Vai direto para `/app` (dashboard)
- Modo teste - sem necessidade de login

### 3. Clique em "Ver Demonstração"  
- Abre `/q/demo` (quiz de exemplo)
- Quiz pré-carregado com 4 perguntas

### 4. Crie Seu Primeiro Quiz
1. No dashboard, clique **"Novo Quiz"**
2. Use o **Editor Visual** para personalizar
3. Adicione perguntas e opções
4. Clique **"Publicar"** 
5. Copie o link público e teste!

## 🗂️ Estrutura do Projeto

```
src/
├── components/ui/          # Componentes shadcn/ui
├── types/                  # TypeScript tipos
│   └── quiz.ts            # Tipos principais (Quiz, Question, Result, Lead)
├── lib/                   # Utilitários e lógica
│   ├── flags.ts           # Feature flags (TEST_MODE)
│   ├── testStore.ts       # Storage local (localStorage)
│   ├── quizzes.ts         # Repository abstraction layer
│   └── seed.ts            # Dados iniciais (quiz demo)
├── pages/                 # Páginas principais
│   ├── Index.tsx          # Landing page
│   ├── Dashboard.tsx      # /app - Lista de quizzes
│   ├── QuizEditor.tsx     # /app/edit/[id] - Editor visual
│   ├── QuizRunner.tsx     # /q/[publicId] - Execução pública
│   └── ResultPage.tsx     # /r/[resultId] - Página de resultado
└── index.css              # Design system e tokens CSS
```

## 🎨 Design System

### Cores Principais
```css
--brand-blue-600: #2563EB  /* Primária */
--brand-blue-500: #3B82F6  /* Hover */
--brand-black: #0B0B0B     /* Texto */
--brand-white: #FFFFFF     /* Fundo */
```

### Componentes Estilizados
- **Botões**: cantos arredondados (rounded-2xl)
- **Cards**: sombras elegantes com hover
- **Inputs**: design limpo e focado
- **Badges**: status visual claro

## 📱 Rotas Disponíveis

| Rota | Descrição | Público |
|------|-----------|---------|
| `/` | Landing page marketing | ✅ |
| `/app` | Dashboard (lista quizzes) | ✅ |
| `/app/edit/:id` | Editor visual de quiz | ✅ |
| `/q/:publicId` | Runner público do quiz | ✅ |
| `/r/:resultId` | Página de resultado | ✅ |

## 🔧 Próximos Passos

### 🔐 Fase 2: Autenticação
- [ ] Integração Supabase Auth
- [ ] Multi-tenant (organizações)
- [ ] Controle de acesso (RLS)

### 🎯 Fase 3: Recursos Avançados
- [ ] **Lógica Condicional** (branching)
- [ ] **Webhooks** e integrações
- [ ] **WhatsApp redirect** automático
- [ ] **Pixel/GA tracking** 
- [ ] **Templates** prontos
- [ ] **Domínios customizados**

### 📊 Fase 4: Analytics Pro
- [ ] **Funil de conversão** detalhado
- [ ] **A/B Testing** nativo
- [ ] **Exportação** CSV/Excel
- [ ] **Dashboard** executivo

## 🛠️ Tecnologias

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS + shadcn/ui
- **Router**: React Router DOM
- **Storage**: localStorage (teste) → Supabase (produção)
- **Icons**: Lucide React
- **Forms**: React Hook Form + Zod

## 🎯 Métricas de Sucesso

### ✅ MVP Atual
- [x] **Tempo para primeiro quiz**: < 5 minutos
- [x] **Responsividade**: 100% mobile/desktop
- [x] **Performance**: Loading < 2s
- [x] **UX**: Interface intuitiva sem tutoriais

### 🎯 Metas Fase 2
- [ ] **Onboarding**: < 60s do cadastro ao primeiro quiz
- [ ] **Conversão**: > 80% dos visitantes testam o editor
- [ ] **Retenção**: > 60% dos usuários criam 2+ quizzes

---

## 🚀 Deploy e Produção

Para ativar o **modo produção com Supabase**:

1. **Configure as variáveis**:
```env
NEXT_PUBLIC_TEST_MODE=false
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

2. **Conecte o Supabase** no dashboard Lovable
3. **Ative RLS** e configure as políticas
4. **Deploy** via Vercel/Netlify

---

**Elevado Quizz** - *Transformando visitantes em leads qualificados* 🎯