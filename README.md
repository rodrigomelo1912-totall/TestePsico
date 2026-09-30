# Verium | Perfil Psicologico

Aplicacao estatica de autoconhecimento profissional baseada na Espiral de Valores.

## Experiencia

- Contexto profissional em tres etapas com tres perguntas cada.
- Dez blocos com seis afirmacoes e soma obrigatoria de 12 pontos por bloco.
- Letras e cores do gabarito ocultas durante o questionario.
- Identidade visual Verium, com conteudo restrito ao questionario de valores.
- Matriz, radar, 15 cruzamentos de cores e mapa interativo dos dez blocos.
- Janela introdutoria sobre a Espiral e memoria das 60 respostas.
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
node --test tests/report.test.cjs
```

## Arquivos

- `app.js`: questionario, pontuacao e persistencia.
- `spiral.js`: calculos exatos, empates e hipoteses editoriais dos cruzamentos.
- `dimension-mix.js`: sintese contextual por dimensao, com interpretacao das frases,
  proporcoes, empates e combinacoes; sem alterar os calculos do questionario.
- `report.js`: apresentacao do relatorio, evidencias e movimento.
- `styles.css`: identidade Verium, layouts responsivos e impressao.
- `assets/logo-verium-original.svg`: logo vetorial extraida do PDF fornecido.
- `assets/logo-verium.svg`: composicao horizontal dos mesmos elementos vetoriais.

As respostas permanecem no navegador. A chave legada `totall-profile-map` foi
preservada para manter os progressos existentes. Nenhuma resposta e enviada ao
GitHub ou a um servidor.

Percentuais = pontos da cor / 120 * 100. Empates sao preservados. Cada bloco
tem peso igual. Os cruzamentos exibem soma, diferenca e presenca conjunta;
os textos sao hipoteses editoriais, nao escalas validadas. As perguntas de
apresentacao nao influenciam a pontuacao ou geram conclusoes sobre competencias.
Nao ha fit de cargo, benchmarks, diagnostico empresarial ou clinico.
As referencias conceituais fornecidas estao vinculadas na janela da Espiral
e na metodologia do relatorio; nao representam validacao deste instrumento.
