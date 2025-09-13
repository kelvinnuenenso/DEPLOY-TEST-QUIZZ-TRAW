# Guia de Teste de Assinatura

## Cartões de Teste

Para testar diferentes cenários de pagamento, use os seguintes cartões de teste:

### Pagamentos Bem-sucedidos
- **4242 4242 4242 4242** - Pagamento sempre aprovado
- **4000 0027 6000 3184** - Requer autenticação 3D Secure

### Cenários de Falha
- **4000 0000 0000 0341** - Cartão expirado
- **4000 0000 0000 9995** - Fundos insuficientes
- **4000 0000 0000 0002** - Cartão recusado

## Fluxo de Teste

1. **Criar Assinatura**
   - Acesse a página de planos
   - Selecione um plano (Pro ou Enterprise)
   - Use um dos cartões de teste acima
   - Verifique se as notificações aparecem corretamente

2. **Verificar Webhook Events**
   - `customer.created`
   - `customer.subscription.created`
   - `invoice.created`
   - `invoice.finalized`
   - `invoice.paid`

3. **Testar Gerenciamento de Assinatura**
   - Acessar portal do cliente
   - Atualizar método de pagamento
   - Cancelar assinatura
   - Verificar notificações correspondentes

4. **Testar Falhas de Pagamento**
   - Usar cartão com fundos insuficientes
   - Verificar notificação de falha
   - Tentar nova cobrança com cartão válido

5. **Monitoramento**
   - Verificar eventos no painel Stripe
   - Confirmar recebimento de webhooks
   - Validar notificações ao usuário

## Cenários de Teste

### 1. Assinatura Inicial
```json
Cartão: 4242 4242 4242 4242
Data: Qualquer data futura
CVC: Qualquer 3 dígitos
Resultado esperado: Assinatura criada com sucesso
```

### 2. Autenticação 3D Secure
```json
Cartão: 4000 0027 6000 3184
Resultado esperado: Solicita autenticação adicional
```

### 3. Falha de Pagamento
```json
Cartão: 4000 0000 0000 9995
Resultado esperado: Falha por fundos insuficientes
```

### 4. Cartão Expirado
```json
Cartão: 4000 0000 0000 0341
Resultado esperado: Falha por cartão expirado
```

## Verificação de Notificações

Confirmar que as seguintes notificações são exibidas:

- ✅ Sucesso na criação da assinatura
- ❌ Falha no pagamento
- ℹ️ Atualização da assinatura
- ⚠️ Cancelamento da assinatura
- 📋 Nova fatura disponível

## Próximos Passos

1. Executar todos os cenários de teste
2. Documentar quaisquer problemas encontrados
3. Verificar logs do servidor para eventos do webhook
4. Confirmar que todas as notificações estão funcionando
5. Validar dados no painel do Stripe