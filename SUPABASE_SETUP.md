# Ativação do painel de tokens

1. No Supabase, abra **SQL Editor** e crie uma nova consulta.
2. Copie todo o conteúdo de `supabase-schema.sql`, cole no editor e clique em
   **Run**.
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
