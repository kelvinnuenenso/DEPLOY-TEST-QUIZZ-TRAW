# Configuração Google OAuth para Supabase

## 1. Configuração no Google Cloud Console

### Passo 1: Criar Projeto no Google Cloud Console
1. Acesse [Google Cloud Console](https://console.cloud.google.com/)
2. Crie um novo projeto ou selecione um existente
3. Anote o **Project ID**

### Passo 2: Ativar APIs Necessárias
1. Vá para **APIs & Services > Library**
2. Ative as seguintes APIs:
   - Google+ API
   - Google People API
   - Google Analytics API (opcional)

### Passo 3: Configurar OAuth Consent Screen
1. Vá para **APIs & Services > OAuth consent screen**
2. Escolha **External** (para usuários externos)
3. Preencha as informações obrigatórias:
   - **App name**: QuizLift
   - **User support email**: seu-email@dominio.com
   - **Developer contact information**: seu-email@dominio.com
4. Adicione escopos:
   - `../auth/userinfo.email`
   - `../auth/userinfo.profile`
   - `openid`

### Passo 4: Criar Credenciais OAuth 2.0
1. Vá para **APIs & Services > Credentials**
2. Clique em **Create Credentials > OAuth 2.0 Client IDs**
3. Escolha **Web application**
4. Configure:
   - **Name**: QuizLift Web Client
   - **Authorized JavaScript origins**:
     - `http://localhost:3000` (desenvolvimento)
     - `https://seu-dominio.com` (produção)
   - **Authorized redirect URIs**:
     - `https://rijvidluwvzvatoarqoe.supabase.co/auth/v1/callback`
     - `http://localhost:54321/auth/v1/callback` (desenvolvimento local)

5. Anote o **Client ID** e **Client Secret**

## 2. Configuração no Supabase

### Passo 1: Configurar Provider no Dashboard
1. Acesse [Supabase Dashboard](https://supabase.com/dashboard)
2. Vá para **Authentication > Providers**
3. Ative **Google**
4. Insira:
   - **Client ID**: (do Google Cloud Console)
   - **Client Secret**: (do Google Cloud Console)

### Passo 2: Configurar Redirect URLs
1. Em **Authentication > URL Configuration**
2. Adicione as URLs de redirecionamento:
   - `http://localhost:3000/auth/callback` (desenvolvimento)
   - `https://seu-dominio.com/auth/callback` (produção)

## 3. Configuração no Código

### Variáveis de Ambiente
Adicione ao `.env.local`:

```env
# Supabase
VITE_SUPABASE_URL=https://rijvidluwvzvatoarqoe.supabase.co
VITE_SUPABASE_ANON_KEY=sua_anon_key_aqui

# Google OAuth (opcional para configurações avançadas)
VITE_GOOGLE_CLIENT_ID=seu_google_client_id_aqui
```

### Implementação no useAuth Hook

```typescript
// src/hooks/useAuth.tsx
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
)

export const useAuth = () => {
  const signInWithGoogle = async () => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
      },
    })
    
    if (error) {
      console.error('Erro no login Google:', error)
      throw error
    }
    
    return data
  }

  const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  }

  return {
    signInWithGoogle,
    signOut,
    user: supabase.auth.user(),
    session: supabase.auth.session()
  }
}
```

### Página de Callback
Crie `src/pages/AuthCallback.tsx`:

```typescript
import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '@/integrations/supabase/client'

export default function AuthCallback() {
  const navigate = useNavigate()

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        const { data, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error('Erro na autenticação:', error)
          navigate('/auth?error=auth_failed')
          return
        }

        if (data.session) {
          // Usuário autenticado com sucesso
          navigate('/app')
        } else {
          navigate('/auth')
        }
      } catch (error) {
        console.error('Erro no callback:', error)
        navigate('/auth?error=callback_failed')
      }
    }

    handleAuthCallback()
  }, [navigate])

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
        <p>Finalizando autenticação...</p>
      </div>
    </div>
  )
}
```

## 4. Configurações de Segurança

### Row Level Security (RLS)
As políticas RLS já estão configuradas na migração `001_quiz_schema.sql`.

### Validação de Domínio
Para produção, configure domínios autorizados:

1. No Supabase Dashboard > **Authentication > URL Configuration**
2. Adicione apenas domínios confiáveis
3. Remova `localhost` em produção

### Configurações Avançadas

```sql
-- Função para validar domínio de email (opcional)
CREATE OR REPLACE FUNCTION validate_email_domain(email TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  -- Permitir apenas domínios específicos (opcional)
  -- RETURN email LIKE '%@empresa.com' OR email LIKE '%@gmail.com';
  
  -- Ou permitir todos os domínios
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- Trigger para validar email no registro
CREATE OR REPLACE FUNCTION validate_user_email()
RETURNS TRIGGER AS $$
BEGIN
  IF NOT validate_email_domain(NEW.email) THEN
    RAISE EXCEPTION 'Domínio de email não autorizado';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER validate_user_email_trigger
  BEFORE INSERT OR UPDATE ON auth.users
  FOR EACH ROW EXECUTE FUNCTION validate_user_email();
```

## 5. Testes

### Teste Local
1. Execute `npm run dev`
2. Acesse `http://localhost:3000/auth`
3. Clique em "Entrar com Google"
4. Verifique se o redirecionamento funciona

### Teste em Produção
1. Deploy da aplicação
2. Configure URLs de produção no Google Cloud Console
3. Teste o fluxo completo

## 6. Monitoramento

### Logs do Supabase
- Acesse **Logs** no dashboard do Supabase
- Monitore erros de autenticação
- Verifique tentativas de login

### Analytics do Google
- Configure Google Analytics (opcional)
- Monitore conversões de login
- Acompanhe funil de autenticação

## 7. Troubleshooting

### Erros Comuns

1. **"redirect_uri_mismatch"**
   - Verifique se as URLs estão corretas no Google Cloud Console
   - Certifique-se de que não há barras extras no final

2. **"invalid_client"**
   - Verifique Client ID e Client Secret
   - Confirme se as credenciais estão ativas

3. **"access_denied"**
   - Usuário cancelou o login
   - Verifique configurações do OAuth Consent Screen

4. **Sessão não persiste**
   - Verifique configurações de cookies
   - Confirme se o domínio está correto

### Debug

```typescript
// Adicione logs para debug
supabase.auth.onAuthStateChange((event, session) => {
  console.log('Auth event:', event)
  console.log('Session:', session)
})
```

## 8. Próximos Passos

1. ✅ Configurar Google OAuth
2. ⏳ Implementar outros providers (GitHub, Facebook)
3. ⏳ Configurar MFA (Multi-Factor Authentication)
4. ⏳ Implementar login por magic link
5. ⏳ Configurar webhooks de autenticação