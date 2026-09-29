# Verium | Perfil & Potencial

Aplicacao estatica de autoconhecimento profissional baseada na Espiral de Valores.

## Experiencia

- Contexto profissional em tres etapas com tres perguntas cada.
- Dez blocos com seis afirmacoes e soma obrigatoria de 12 pontos por bloco.
- Letras e cores do gabarito ocultas durante o questionario.
- Relatorio Verium com matriz, radar, leitura profissional e infograficos animados.
- Duplo diamante interativo e proposta de desenvolvimento em 30, 60 e 90 dias.
- Navegacao por teclado, preferencia de movimento reduzido e pausa de animacoes.
- Impressao/PDF com todos os paineis de desenvolvimento e detalhamentos.

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
- `report.js`: apresentacao do relatorio, desenvolvimento e movimento.
- `styles.css`: identidade Verium, layouts responsivos e impressao.
- `assets/logo-verium-original.svg`: logo vetorial extraida do PDF fornecido.
- `assets/logo-verium.svg`: composicao horizontal dos mesmos elementos vetoriais.

As respostas permanecem no navegador. A chave legada `totall-profile-map` foi
preservada para manter os progressos existentes. Nenhuma resposta e enviada ao
GitHub ou a um servidor.

Os indices profissionais mantem os parametros exploratorios do modelo anterior.
O relatorio explicita que eles nao sao benchmarks empiricos, medidas de
competencia ou probabilidades de sucesso. O instrumento apoia reflexao e
desenvolvimento e nao constitui diagnostico clinico.
