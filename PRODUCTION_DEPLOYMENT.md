# Guia de Deploy em Produção

## Pré-requisitos

- Conta no Vercel
- Conta no Supabase
- Domínio configurado (opcional)

## 1. Configuração do Supabase

### 1.1 Criar Projeto em Produção

1. Acesse o [Dashboard do Supabase](https://app.supabase.io)
2. Crie um novo projeto para produção
3. Anote as credenciais:
   - Project URL
   - Project API Key (anon, public)
   - Service Role Key (para migrações)

### 1.2 Executar Migrações

```bash
# Instalar Supabase CLI
npm install -g supabase-cli

# Login no Supabase
supabase login

# Linkar projeto
supabase link --project-ref <project-id>

# Executar migrações
supabase db push
```

### 1.3 Configurar Autenticação

1. No dashboard do Supabase, vá para Authentication > Settings
2. Configure o Site URL para seu domínio de produção
3. Habilite os provedores de autenticação necessários (Google OAuth)

## 2. Deploy no Vercel

### 2.1 Preparar o Projeto

1. Certifique-se de que o arquivo `.gitignore` está correto
2. Commit todas as alterações no repositório

### 2.2 Configurar Projeto no Vercel

1. Acesse o [Dashboard do Vercel](https://vercel.com)
2. Importe o repositório do projeto
3. Configure as variáveis de ambiente:

```env
VITE_SUPABASE_URL=https://<project>.supabase.co
VITE_SUPABASE_ANON_KEY=<anon-key>
VITE_APP_URL=https://seu-dominio.com
VITE_APP_ENV=production
```

### 2.3 Configurar Build

1. Build Command: `npm run build`
2. Output Directory: `dist`
3. Install Command: `npm install`

## 3. Configuração de Domínio

### 3.1 No Vercel

1. Vá para Settings > Domains
2. Adicione seu domínio personalizado
3. Siga as instruções para configurar os registros DNS

### 3.2 SSL/TLS

- O Vercel gerencia automaticamente certificados SSL
- Certifique-se de que todos os redirecionamentos usam HTTPS

## 4. Monitoramento

### 4.1 Configurar Sentry

1. Crie uma conta no [Sentry](https://sentry.io)
2. Adicione a variável de ambiente:
```env
VITE_SENTRY_DSN=<seu-dsn>
```

### 4.2 Logs e Analytics

- Configure alertas no Vercel para erros de build e deploy
- Monitore métricas de performance no dashboard do Vercel
- Acompanhe logs do Supabase em tempo real

## 5. Checklist Final

- [ ] Todas as variáveis de ambiente estão configuradas
- [ ] Migrações do banco de dados foram aplicadas
- [ ] SSL está ativo e funcionando
- [ ] Autenticação está funcionando em produção
- [ ] Monitoramento está configurado
- [ ] Backups automáticos do Supabase estão ativos
- [ ] Testes de integração passaram no ambiente de produção

## 6. Manutenção

### 6.1 Backups

- O Supabase realiza backups diários automaticamente
- Configure backups adicionais se necessário

### 6.2 Updates

- Mantenha as dependências atualizadas
- Acompanhe atualizações de segurança
- Faça deploy em horários de baixo tráfego

## 7. Troubleshooting

### 7.1 Problemas Comuns

1. **Erro de Build**
   - Verifique logs do Vercel
   - Confirme que todas as dependências estão instaladas

2. **Erro de Conexão com Supabase**
   - Verifique as variáveis de ambiente
   - Confirme as políticas de RLS

3. **Problemas de Performance**
   - Monitore o dashboard do Vercel
   - Verifique queries lentas no Supabase

### 7.2 Suporte

- Supabase: https://supabase.com/support
- Vercel: https://vercel.com/support
- Sentry: https://sentry.io/support