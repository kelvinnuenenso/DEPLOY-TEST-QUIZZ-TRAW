# Guia de Publicação no GitHub

## Pré-requisitos

1. Ter uma conta no GitHub (crie em https://github.com/signup se não tiver)
2. Ter o Git instalado no computador (baixe em https://git-scm.com/downloads)
3. Configurar o Git com suas credenciais:
```bash
git config --global user.name "Seu Nome"
git config --global user.email "seu.email@exemplo.com"
```

## Passos para Publicação

1. **Criar um novo repositório no GitHub**
   - Acesse https://github.com/new
   - Escolha um nome para o repositório
   - Deixe-o público ou privado conforme sua preferência
   - Não inicialize com README, .gitignore ou licença

2. **Preparar o projeto local**
   - Abra o terminal na pasta do projeto
   - Execute os comandos:
   ```bash
   git init
   git add .
   git commit -m "Commit inicial"
   ```

3. **Conectar e enviar ao GitHub**
   - Copie a URL do seu repositório no GitHub
   - Execute os comandos:
   ```bash
   git remote add origin URL_DO_SEU_REPOSITORIO
   git branch -M main
   git push -u origin main
   ```

## Arquivos Sensíveis

Certifique-se de que os seguintes arquivos NÃO sejam enviados ao GitHub:
- `.env`
- `.env.local`
- `.env.production`
- Quaisquer arquivos com chaves de API ou senhas

O arquivo `.gitignore` já está configurado para excluir estes arquivos.

## Atualizações Futuras

Para enviar atualizações:
```bash
git add .
git commit -m "Descrição das alterações"
git push
```

## Boas Práticas

1. Sempre faça commit de alterações relacionadas juntas
2. Use mensagens de commit descritivas
3. Mantenha as credenciais seguras
4. Atualize o README.md com instruções de instalação e uso
5. Documente mudanças importantes

## Problemas Comuns

1. **Erro de autenticação**
   - Verifique suas credenciais do GitHub
   - Use token de acesso pessoal se necessário

2. **Conflitos de merge**
   - Faça pull antes de push
   - Resolva conflitos localmente

3. **Arquivos grandes**
   - Evite enviar arquivos binários grandes
   - Use Git LFS se necessário

## Suporte

Se precisar de ajuda:
1. Consulte a [documentação do GitHub](https://docs.github.com)
2. Use o [GitHub Support](https://support.github.com)
3. Pergunte na [Comunidade GitHub](https://github.community)