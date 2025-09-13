# Guia de Deploy para Produção - QuizLiftOff

## Pré-requisitos

### Ambiente de Produção
- Node.js 18.x ou superior
- PostgreSQL 15.x ou superior
- Supabase CLI instalado
- Vercel CLI instalado

### Variáveis de Ambiente

```env
# Supabase
VITE_SUPABASE_URL=sua_url_do_supabase
VITE_SUPABASE_ANON_KEY=sua_chave_anonima_do_supabase

# Google OAuth
VITE_GOOGLE_CLIENT_ID=seu_client_id_do_google
VITE_GOOGLE_CLIENT_SECRET=seu_client_secret_do_google

# Configurações da Aplicação
VITE_APP_URL=https://seu-dominio.com
VITE_API_URL=https://api.seu-dominio.com
NODE_ENV=production
```

## Preparação do Banco de Dados

### 1. Configuração do Supabase

```bash
# Login no Supabase CLI
supabase login

# Inicializar projeto Supabase (se ainda não inicializado)
supabase init

# Linkar projeto local com projeto Supabase de produção
supabase link --project-ref seu-project-ref

# Aplicar migrações
supabase db push
```

### 2. Verificação de Políticas RLS

Confirmar que todas as políticas de segurança estão configuradas:

- Perfis: apenas usuários autenticados podem ler/atualizar seus próprios perfis
- Quizzes: criadores podem gerenciar seus quizzes, outros usuários podem apenas visualizar
- Questões: apenas criadores do quiz podem gerenciar
- Resultados: usuários podem ver apenas seus próprios resultados

## Deploy da Aplicação

### 1. Build de Produção

```bash
# Instalar dependências
npm ci

# Build da aplicação
npm run build

# Verificar build
npm run preview
```

### 2. Deploy no Vercel

```bash
# Login no Vercel
vercel login

# Deploy de produção
vercel --prod
```

### 3. Configuração de Domínio

1. Adicionar domínio personalizado no Vercel
2. Configurar registros DNS:
   ```
   A     @     76.76.21.21
   CNAME www   cname.vercel-dns.com
   ```

## Monitoramento e Logs

### 1. Configuração do Sentry

```javascript
// Adicionar DSN do Sentry em vite.config.ts
export default defineConfig({
  plugins: [
    sentryVitePlugin({
      org: "sua-org",
      project: "quiz-lift-off",
      authToken: process.env.SENTRY_AUTH_TOKEN,
    }),
  ],
});
```

### 2. Métricas de Performance

Configurar monitoramento de:
- Tempo de carregamento da página
- Tempo de resposta da API
- Taxa de erro
- Uso de memória/CPU

## Checklist de Deploy

### Segurança
- [ ] Todas as variáveis de ambiente estão configuradas
- [ ] Políticas RLS do Supabase estão ativas
- [ ] Autenticação OAuth está configurada
- [ ] Headers de segurança estão configurados

### Performance
- [ ] Assets estão otimizados
- [ ] Caching está configurado
- [ ] Lazy loading implementado
- [ ] CDN configurado

### SEO
- [ ] Meta tags estão configuradas
- [ ] Sitemap gerado
- [ ] robots.txt configurado
- [ ] URLs amigáveis implementadas

### Monitoramento
- [ ] Logs configurados
- [ ] Alertas configurados
- [ ] Métricas de performance ativas
- [ ] Error tracking ativo

## Procedimento de Rollback

### 1. Reverter Deploy
```bash
# Reverter para deploy anterior
vercel rollback
```

### 2. Reverter Banco de Dados
```bash
# Reverter última migração
supabase db reset
supabase db push --db-only-migration anterior
```

## Manutenção

### Rotina Diária
- Monitorar logs de erro
- Verificar métricas de performance
- Backup do banco de dados

### Rotina Semanal
- Análise de métricas
- Verificação de segurança
- Atualização de dependências

### Rotina Mensal
- Revisão de custos
- Análise de performance
- Planejamento de capacidade

## Contatos de Emergência

### Equipe de Desenvolvimento
- Tech Lead: [Nome] - [Contato]
- Backend: [Nome] - [Contato]
- Frontend: [Nome] - [Contato]

### Serviços Externos
- Supabase Support
- Vercel Support
- Google Cloud Support

## Documentação Adicional

- [Documentação da API](./API_DOCUMENTATION.md)
- [Guia de Troubleshooting](./TROUBLESHOOTING.md)
- [Política de Backup](./BACKUP_POLICY.md)
- [Plano de Recuperação de Desastre](./DISASTER_RECOVERY.md)