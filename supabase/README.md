# Quiz Lift Off - Backend Configuration

## Visão Geral

Este diretório contém toda a configuração do backend da aplicação Quiz Lift Off, incluindo:

- **Migrações do banco de dados**
- **Funções serverless (Edge Functions)**
- **Configurações do Supabase**
- **Scripts de produção**

## Estrutura do Projeto

```
supabase/
├── config.toml              # Configurações do Supabase
├── migrations/              # Migrações do banco de dados
│   ├── 001_quiz_schema.sql
│   ├── 20240321000000_create_analytics_functions.sql
│   └── 20240321000001_update_quiz_schema.sql
├── functions/               # Edge Functions
│   ├── create-checkout-session/
│   ├── create-portal-session/
│   ├── firecrawl/
│   └── stripe-webhook/
├── scripts/                 # Scripts de configuração
│   └── setup-production.sql
├── deploy.yml              # Configurações de deploy
├── .env.example            # Exemplo de variáveis de ambiente
└── README.md               # Esta documentação
```

## Schema do Banco de Dados

### Tabelas Principais

1. **user_profiles** - Perfis de usuário estendidos
2. **quizzes** - Tabela principal de quizzes
3. **quiz_questions** - Perguntas dos quizzes
4. **quiz_results** - Resultados/sessões de quiz
5. **quiz_answers** - Respostas individuais
6. **quiz_leads** - Leads capturados
7. **quiz_analytics** - Analytics agregados

### Funcionalidades Implementadas

- ✅ **Row Level Security (RLS)** em todas as tabelas
- ✅ **Triggers automáticos** para updated_at
- ✅ **Contadores automáticos** para views, starts, completions
- ✅ **Função de busca otimizada** por public_id
- ✅ **Índices de performance** para consultas rápidas
- ✅ **Políticas de acesso público** para quizzes publicados

## Edge Functions

### 1. create-checkout-session
**Endpoint:** `/functions/v1/create-checkout-session`

Cria sessões de checkout do Stripe para assinaturas.

**Parâmetros:**
```json
{
  "priceId": "price_xxx",
  "userId": "uuid",
  "successUrl": "https://...",
  "cancelUrl": "https://..."
}
```

### 2. create-portal-session
**Endpoint:** `/functions/v1/create-portal-session`

Cria sessões do portal de cobrança do Stripe.

**Parâmetros:**
```json
{
  "userId": "uuid",
  "returnUrl": "https://..."
}
```

### 3. stripe-webhook
**Endpoint:** `/functions/v1/stripe-webhook`

Processa webhooks do Stripe para atualizar status de assinaturas.

### 4. firecrawl
**Endpoint:** `/functions/v1/firecrawl`

Integração com Firecrawl API para extração de conteúdo web.

## Configuração de Desenvolvimento

### 1. Instalar Supabase CLI
```bash
npm install -g @supabase/cli
```

### 2. Configurar variáveis de ambiente
```bash
cp .env.example .env.local
# Editar .env.local com suas credenciais
```

### 3. Iniciar ambiente local
```bash
supabase start
```

### 4. Aplicar migrações
```bash
supabase db reset
```

### 5. Deploy das funções
```bash
supabase functions deploy
```

## Configuração de Produção

### 1. Criar projeto no Supabase
```bash
supabase projects create quiz-lift-off
```

### 2. Linkar projeto local
```bash
supabase link --project-ref your-project-ref
```

### 3. Deploy das migrações
```bash
supabase db push
```

### 4. Deploy das funções
```bash
supabase functions deploy --no-verify-jwt
```

### 5. Configurar variáveis de ambiente
```bash
supabase secrets set STRIPE_SECRET_KEY=sk_live_...
supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_...
supabase secrets set FIRECRAWL_API_KEY=fc-...
```

### 6. Executar script de produção
```sql
-- No SQL Editor do Supabase Dashboard
\i scripts/setup-production.sql
```

## Monitoramento e Manutenção

### Métricas Importantes

- **Performance das consultas** - Usar `get_performance_stats()`
- **Uso de índices** - Monitorar seq_scan vs idx_scan
- **Tamanho das tabelas** - Acompanhar crescimento
- **Limpeza automática** - Executar `cleanup_old_data()` semanalmente

### Logs e Debugging

- **Edge Functions:** Logs disponíveis no Dashboard
- **Database:** Configurado para log de queries > 1s
- **Webhooks:** Verificar status no Stripe Dashboard

## Segurança

### Implementações de Segurança

- ✅ **RLS habilitado** em todas as tabelas
- ✅ **JWT verification** nas funções críticas
- ✅ **CORS configurado** para domínios específicos
- ✅ **Rate limiting** implementado
- ✅ **Validação de entrada** em todas as funções
- ✅ **Timeouts configurados** para prevenir ataques

### Checklist de Segurança

- [ ] Rotacionar secrets regularmente
- [ ] Monitorar logs de acesso
- [ ] Revisar políticas RLS periodicamente
- [ ] Manter dependências atualizadas
- [ ] Backup regular do banco de dados

## Troubleshooting

### Problemas Comuns

1. **Função não encontrada**
   - Verificar se foi feito deploy: `supabase functions list`
   - Verificar logs: `supabase functions logs function-name`

2. **Erro de permissão RLS**
   - Verificar políticas: `SELECT * FROM pg_policies WHERE tablename = 'table_name'`
   - Testar com usuário específico

3. **Performance lenta**
   - Executar `get_performance_stats()`
   - Verificar uso de índices
   - Analisar query plans

4. **Webhook do Stripe falhando**
   - Verificar STRIPE_WEBHOOK_SECRET
   - Validar endpoint URL
   - Checar logs da função

## Contato e Suporte

Para questões técnicas ou suporte, consulte:

- [Documentação do Supabase](https://supabase.com/docs)
- [Documentação do Stripe](https://stripe.com/docs)
- [Logs do projeto](https://app.supabase.com/project/your-project/logs)

---

**Versão:** 1.0.0  
**Última atualização:** Janeiro 2025  
**Status:** Pronto para produção ✅