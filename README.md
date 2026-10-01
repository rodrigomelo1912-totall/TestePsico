# Verium | Perfil Psicologico

Aplicacao estatica de autoconhecimento profissional baseada na Espiral de Valores.

## Experiencia

- Contexto profissional em tres etapas com tres perguntas cada.
- Dez blocos com seis afirmacoes e soma obrigatoria de 12 pontos por bloco.
- Letras e cores do gabarito ocultas durante o questionario.
- Identidade visual Verium, com conteudo restrito ao questionario de valores.
- Matriz, radar, 15 cruzamentos de cores e mapa interativo dos dez blocos.
- Deep Dive de Alinhamento: oito temas a partir das duas maiores pontuacoes,
  com empates explicitos, exemplos de comunicacao e leituras de cada cor e do mix.
- Mapa horizontal interativo com palavras-chave dos oito temas, teclado e toque.
- Janela introdutoria sobre a Espiral e memoria das 60 respostas.
- Textos que conectam as respostas abertas aos blocos pontuados, com linguagem
  exploratoria e trechos do proprio relato profissional.
- Fit com a Cadeira: similaridade textual entre responsabilidades, atividades e
  desafios declarados e os 48 pontos de quatro perguntas ligadas ao trabalho e
  a decisao. Nao ha benchmark de cargo nem avaliacao de desempenho.
- Painel privado de tokens e laudos HTML arquivados no Supabase.
- Funcao opcional de IA com consentimento e custo limitado por token. A chave
  da OpenAI API fica apenas nos segredos da funcao no Supabase.
- Navegacao por teclado, preferencia de movimento reduzido e pausa de animacoes.
- Impressao/PDF com pontuacoes, interpretacoes e detalhamentos.

## Executar

Abra `index.html` ou sirva esta pasta com um servidor HTTP estatico:

```sh
python3 -m http.server 8765
```

## Testar

Requer apenas Node.js, sem dependencias externas:

```sh
node --test tests/*.test.cjs
```

## Arquivos

- `app.js`: questionario, pontuacao e persistencia.
- `personalization.js`: textos contextuais e indice exploratorio do cargo.
- `supabase/functions/personalize-report/index.ts`: redacao opcional via modelo,
  com verificacao do token consumido e arquivo HTML atualizado.
- `spiral.js`: calculos exatos, empates e hipoteses editoriais dos cruzamentos.
- `dimension-mix.js`: sintese contextual por dimensao, com interpretacao das frases,
  proporcoes, empates e combinacoes; sem alterar os calculos do questionario.
- `report.js`: apresentacao do relatorio, evidencias e movimento.
- `deep-dive.js`: leituras editoriais dos 15 pares, concentracao em uma cor e
  analogias historicas com fontes, sem atribuir perfis a figuras publicas.
- `deep-themes.js`: perspectivas tematicas das seis cores e mapa interativo,
  inclusive no HTML exportado; pontuacoes por pergunta ficam na memoria de respostas.
- `styles.css`: identidade Verium, layouts responsivos e impressao.
- `assets/logo-verium-original.svg`: logo vetorial extraida do PDF fornecido.
- `assets/logo-verium.svg`: composicao horizontal dos mesmos elementos vetoriais.

As respostas continuam salvas no navegador para permitir retomar o questionario.
Ao consumir o token, dados de contato, respostas e laudo sao enviados ao projeto
Supabase. Nenhuma resposta e enviada ao GitHub. A chave legada
`totall-profile-map` foi preservada para manter os progressos existentes.
Com consentimento e a funcao ativada, apenas respostas profissionais e totais
das cores sao enviados para a OpenAI API; nome, e-mail, telefone e empresa nao
entram no pedido ao modelo.

Percentuais = pontos da cor / 120 * 100. Empates sao preservados. Cada bloco
tem peso igual. Os cruzamentos exibem soma, diferenca e presenca conjunta;
os textos sao hipoteses editoriais, nao escalas validadas. As perguntas de
apresentacao nao influenciam a pontuacao ou geram conclusoes sobre competencias.
O fit e uma similaridade exploratoria do texto da pessoa com suas prioridades
nas perguntas de trabalho, nao um teste de aptidao. Nao ha benchmark,
diagnostico empresarial ou clinico.
As referencias conceituais fornecidas estao vinculadas na janela da Espiral
e na metodologia do relatorio; nao representam validacao deste instrumento.
