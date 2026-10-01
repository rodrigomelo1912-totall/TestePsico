# Ativação do painel de tokens

1. No Supabase, abra **SQL Editor** e crie uma nova consulta.
2. Copie todo o conteúdo de `supabase-schema.sql`, cole no editor e clique em
   **Run**. O script pode ser executado novamente para atualizar instalações já
   existentes.
3. Abra o painel em `admin.html` e use:

   - E-mail: `rodrigomelo1912@gmail.com`
   - Senha: a senha definida para o acesso administrativo.

4. Se for o primeiro acesso, clique em **Criar meu acesso inicial**. Caso a
   confirmação de e-mail esteja ativa no Supabase, confirme a mensagem recebida
   antes de entrar.
5. Gere um token, copie-o e compartilhe-o com a pessoa que fará o diagnóstico.

Cada token é consumido uma única vez. O painel exibe somente os quatro últimos
caracteres de um token já gerado; copie o código inteiro no momento da criação.

O projeto usa a Publishable Key no navegador. As regras de Row Level Security
do script deixam tokens e registros visíveis apenas para o e-mail administrativo.

## Leitura personalizada por IA (opcional)

1. Em projetos existentes, execute `supabase/migrations/20261001_personalization.sql`.
   Ele adiciona o HTML arquivado, o consentimento e as funcoes por token.
2. Configure `OPENAI_API_KEY` nos segredos de Edge Functions do Supabase. Essa
   e uma chave da OpenAI API, separada dos creditos do ChatGPT ou do Codex.
   Nunca a coloque em `portal-config.js`, HTML ou GitHub.
3. Publique `supabase/functions/personalize-report/index.ts` como Edge Function
   `personalize-report`. O `supabase/config.toml` ja define
   `verify_jwt = false`; a funcao exige o codigo de um token usado com
   consentimento e limita o numero de tentativas.
4. O formulario consulta a disponibilidade da chave no servidor. O consentimento
   opcional aparece automaticamente quando a funcao estiver configurada. Sem a
   chave, a personalizacao local e o capitulo de fit continuam disponiveis.

A funcao usa `gpt-6-luna`, uma requisicao estruturada por laudo,
`max_output_tokens` limitado e `store: false`. Ela envia apenas respostas
profissionais resumidas e pontuacoes das cores, nunca contato ou nome.
