# Guia de Deploy em Produção - QuizLiftOff

## 📋 Pré-requisitos

### Infraestrutura Necessária
- Servidor com Docker e Docker Compose
- Domínio configurado com DNS
- Certificado SSL/TLS
- Conta Supabase (produção)
- Conta Stripe (modo live)
- Conta Google Cloud (OAuth)

### Ferramentas Requeridas
- Docker 20.10+
- Docker Compose 2.0+
- Git
- Node.js 18+ (para build local)

## 🚀 Processo de Deploy

### 1. Preparação do Ambiente

```bash
# Clonar repositório
git clone https://github.com/seu-usuario/quizliftoff.git
cd quizliftoff

# Criar arquivo de ambiente de produção
cp .env.production.example .env.production
```

### 2. Configuração das Variáveis de Ambiente

Edite o arquivo `.env.production` com suas configurações:

```bash
# Configurações essenciais
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua_chave_anonima
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_sua_chave_publica
STRIPE_SECRET_KEY=sk_live_sua_chave_secreta
VITE_GOOGLE_CLIENT_ID=seu_client_id.apps.googleusercontent.com
```

### 3. Configuração do Supabase

#### 3.1 Criar Projeto de Produção
1. Acesse [Supabase Dashboard](https://app.supabase.com)
2. Crie novo projeto para produção
3. Configure autenticação:
   - Ative Google OAuth
   - Configure domínios permitidos
   - Defina políticas RLS

#### 3.2 Executar Migrações
```bash
# Instalar Supabase CLI
npm install -g @supabase/cli

# Fazer login
supabase login

# Linkar projeto
supabase link --project-ref seu-projeto-id

# Executar migrações
supabase db push
```

### 4. Configuração do Stripe

#### 4.1 Ativar Modo Live
1. Complete verificação da conta
2. Configure webhooks para produção:
   - URL: `https://seudominio.com/api/webhooks/stripe`
   - Eventos: `checkout.session.completed`, `invoice.payment_succeeded`

#### 4.2 Criar Produtos e Preços
```bash
# Usar Stripe CLI ou Dashboard para criar:
# - Plano Básico
# - Plano Pro  
# - Plano Enterprise
```

### 5. Configuração do Google OAuth

1. Acesse [Google Cloud Console](https://console.cloud.google.com)
2. Crie credenciais OAuth 2.0:
   - Origens autorizadas: `https://seudominio.com`
   - URIs de redirecionamento: `https://seu-projeto.supabase.co/auth/v1/callback`

### 6. Build e Deploy

#### 6.1 Build da Aplicação
```bash
# Instalar dependências
npm install

# Build para produção
npm run build

# Executar testes
npm run test
npm run test:e2e
```

#### 6.2 Deploy com Docker
```bash
# Build da imagem
docker build -t quizliftoff:latest .

# Iniciar serviços
docker-compose -f docker-compose.yml up -d

# Verificar status
docker-compose ps
```

### 7. Configuração do Nginx/Proxy Reverso

#### 7.1 Certificado SSL
```bash
# Usando Certbot (Let's Encrypt)
sudo certbot --nginx -d seudominio.com -d www.seudominio.com
```

#### 7.2 Configuração do Nginx
```nginx
server {
    listen 443 ssl http2;
    server_name seudominio.com www.seudominio.com;
    
    ssl_certificate /etc/letsencrypt/live/seudominio.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/seudominio.com/privkey.pem;
    
    location / {
        proxy_pass http://localhost:80;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

## 📊 Monitoramento

### 1. Acessar Dashboards
- Prometheus: `http://seudominio.com:9090`
- Grafana: `http://seudominio.com:3000`
  - Usuário: admin
  - Senha: definida em `GF_SECURITY_ADMIN_PASSWORD`

### 2. Configurar Alertas
```bash
# Editar configurações de alerta
vim monitoring/alert_rules.yml

# Reiniciar Prometheus
docker-compose restart prometheus
```

### 3. Logs
```bash
# Ver logs da aplicação
docker-compose logs -f app

# Ver logs do Redis
docker-compose logs -f redis

# Ver logs do Nginx
docker-compose logs -f nginx
```

## 🔒 Segurança

### 1. Firewall
```bash
# Configurar UFW (Ubuntu)
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```

### 2. Backup Automático
```bash
# Verificar se backup está funcionando
docker-compose logs backup

# Executar backup manual
docker-compose exec backup /backup.sh
```

### 3. Atualizações de Segurança
```bash
# Atualizar sistema
sudo apt update && sudo apt upgrade -y

# Atualizar containers
docker-compose pull
docker-compose up -d
```

## 🧪 Testes em Produção

### 1. Health Checks
```bash
# Verificar saúde da aplicação
curl https://seudominio.com/health

# Verificar métricas
curl https://seudominio.com/metrics
```

### 2. Testes de Carga
```bash
# Usando Apache Bench
ab -n 1000 -c 10 https://seudominio.com/

# Usando Artillery
npm install -g artillery
artillery quick --count 10 --num 100 https://seudominio.com/
```

### 3. Testes E2E em Produção
```bash
# Configurar variáveis para produção
export PLAYWRIGHT_BASE_URL=https://seudominio.com

# Executar testes críticos
npm run test:e2e -- --grep "@critical"
```

## 📈 Otimização de Performance

### 1. CDN
- Configure CloudFlare ou AWS CloudFront
- Ative compressão Gzip/Brotli
- Configure cache headers apropriados

### 2. Database
- Configure connection pooling no Supabase
- Ative índices necessários
- Configure backup automático

### 3. Redis
- Configure persistência RDB + AOF
- Monitore uso de memória
- Configure eviction policy adequada

## 🚨 Troubleshooting

### Problemas Comuns

#### 1. Aplicação não inicia
```bash
# Verificar logs
docker-compose logs app

# Verificar variáveis de ambiente
docker-compose exec app env | grep VITE
```

#### 2. Erro de conexão com Supabase
```bash
# Verificar conectividade
curl -I https://seu-projeto.supabase.co

# Verificar chaves de API
echo $VITE_SUPABASE_ANON_KEY
```

#### 3. Problemas com SSL
```bash
# Verificar certificado
openssl s_client -connect seudominio.com:443

# Renovar certificado
sudo certbot renew
```

#### 4. Performance lenta
```bash
# Verificar recursos
docker stats

# Verificar logs de erro
docker-compose logs | grep ERROR
```

## 📋 Checklist de Deploy

- [ ] Variáveis de ambiente configuradas
- [ ] Supabase configurado e migrado
- [ ] Stripe configurado (modo live)
- [ ] Google OAuth configurado
- [ ] SSL/TLS configurado
- [ ] Monitoramento ativo
- [ ] Backup configurado
- [ ] Firewall configurado
- [ ] DNS configurado
- [ ] Testes passando
- [ ] Health checks funcionando
- [ ] Logs sendo coletados
- [ ] Alertas configurados

## 🆘 Suporte

Em caso de problemas:
1. Verifique logs da aplicação
2. Consulte métricas no Grafana
3. Verifique status dos serviços
4. Consulte documentação do Supabase/Stripe
5. Abra issue no repositório

## 📚 Recursos Adicionais

- [Documentação Supabase](https://supabase.com/docs)
- [Documentação Stripe](https://stripe.com/docs)
- [Docker Compose Reference](https://docs.docker.com/compose/)
- [Nginx Configuration](https://nginx.org/en/docs/)
- [Prometheus Monitoring](https://prometheus.io/docs/)