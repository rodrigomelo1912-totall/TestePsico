// Presentation and interaction for the Verium professional report.
let reportObserver;
let motionPaused = false;
let readingFrame = 0;

function renderProfessionalReport(data, ranked) {
  const method = professionalMethod(data);
  const [top, second, third] = ranked;
  const low = ranked[ranked.length - 1];
  const role = escapeHTML(state.profile.roleArea || method.archetype.title);
  const dimensionRows = Object.values(method.dimensions).map(item => `<div class="dimension-row">
    <div class="dimension-label"><strong>${item.label}</strong><small>${item.analysis}</small></div>
    <div class="dimension-track" role="img" aria-label="${item.label}: índice ${item.score} de 10; referência do modelo ${item.benchmark}" style="--reference:${item.benchmark * 10}%"><span style="--width:${item.score * 10}%"></span><i aria-hidden="true"></i></div>
    <div class="dimension-score">${item.score.toFixed(1)}<small>/10</small></div>
  </div>`).join("");
  const flow = [
    ["Enxerga", `${top.name} indica uma porta de entrada: ${top.core.toLowerCase()}.`],
    ["Conecta", `${second.name} complementa essa leitura com ${second.core.toLowerCase()}.`],
    ["Decide", `${third.name} pode apoiar a decisão quando a situação pede outro recurso.`],
    ["Experimenta", "Escolha uma situação concreta e observe o efeito da sua resposta."],
    ["Evolui", "Use o feedback para dosar forças e ampliar o repertório."]
  ];

  $("professional-report").innerHTML = `
    <div class="chapter-heading"><div><span class="eyebrow">03 / Conectar perfil e contexto</span><h2>Seu jeito de atuar.<br><em>O que a posição pede.</em></h2></div><p>Os valores ganham significado no trabalho real. Explore os recursos que você mais mobiliza e as hipóteses que vale investigar na sua posição.</p></div>
    <div class="context-board" data-animate>
      <div><span class="eyebrow">Lente profissional / ${method.archetype.title}</span><h3>${role}</h3><p>${method.archetype.sentence}</p><p>Sua combinação de <strong>${top.name} + ${second.name}</strong> sugere começar pela relação entre ${top.core.toLowerCase()} e ${second.core.toLowerCase()}.</p><div class="context-tags"><span>${method.archetype.label}</span><span>Hipótese para reflexão</span></div></div>
      <div><div class="fit-orb"><svg viewBox="0 0 220 220" aria-hidden="true"><circle cx="110" cy="110" r="103" fill="none" stroke="#40557f" stroke-dasharray="1 7"/><circle cx="110" cy="110" r="90" fill="none" stroke="#293c60" stroke-width="6"/><circle class="orbit-fill" cx="110" cy="110" r="90" pathLength="100" fill="none" stroke="#b8c8ff" stroke-width="6" stroke-linecap="round" style="--offset:${100 - method.fit}"/></svg><span>Afinidade estimada</span><strong>${method.fit}<small>/100</small></strong><em>Perfil × contexto</em></div><p class="fit-note">Índice exploratório do modelo. Não representa competência ou chance de sucesso no cargo.</p></div>
    </div>
    <div class="pro-grid">
      <section class="pro-card pro-strength" data-animate><span class="eyebrow">Recursos para mobilizar</span><h3>O que pode apoiar sua atuação.</h3><ul>${[top, second, third].map(item => `<li><span class="color-dot" style="--color:${item.hex}"></span><strong>${item.name} · ${item.percent}%</strong><span>${LEVEL_WORK_STYLE[item.code].gift}</span></li>`).join("")}</ul></section>
      <section class="pro-card pro-attention" data-animate><span class="eyebrow">Uma hipótese para investigar</span><h3>Ampliar o repertório em ${low.name}.</h3><p>É uma das perspectivas com menor pontuação relativa (${low.percent}%). Observe situações em que ${low.core.toLowerCase()} faz diferença para a entrega.</p><p>${LEVEL_WORK_STYLE[low.code].lowRisk} Verifique essa hipótese com exemplos e feedback.</p><p class="action-line"><strong>Um movimento possível</strong><br>${LEVEL_WORK_STYLE[low.code].lever}</p></section>
    </div>
    <section class="dimension-board" data-animate><h3>Dimensões em perspectiva.</h3><p>Uma leitura visual para orientar conversas de desenvolvimento. As referências são parâmetros internos do modelo, não médias de outros profissionais.</p>${dimensionRows}<div class="dimension-key"><span><i></i>Índice calculado</span><span><i></i>Referência do modelo</span></div></section>
    <div class="context-quotes"><article><h4>Seu desafio, nas suas palavras</h4><p>${escapeHTML(state.profile.challenge || "Desafio a aprofundar na conversa de desenvolvimento.")}</p></article><article><h4>Seu horizonte profissional</h4><p>${escapeHTML(state.profile.goals || "Objetivo a definir no próximo ciclo.")}</p></article></div>
    <section class="pro-process"><span class="eyebrow">Da percepção à ação</span><h3>Um valor abre o caminho.<br>O contexto orienta o próximo passo.</h3><div>${flow.map(([label, text], index) => `<article><span>${String(index + 1).padStart(2, "0")}</span><h4>${label}</h4><p>${text}</p></article>`).join("")}</div></section>
    <details class="method-details"><summary>Como ler a afinidade e as dimensões</summary><p>A lente profissional é selecionada por palavras-chave do contexto informado: ${method.archetype.title}. Confira se ela representa suas responsabilidades reais antes de interpretar os índices.</p><p>As dimensões combinam as proporções de valores com pesos definidos no modelo. A afinidade reúne essa leitura (72%) e a proximidade com uma distribuição de referência (28%). São parâmetros exploratórios, sem benchmark empírico ou validação de desempenho profissional.</p><p>Uma menor proporção não comprova falta de capacidade. Use exemplos de trabalho, entregas observáveis e feedback para confirmar, ajustar ou descartar as hipóteses.</p></details>
  `;
}

const DEVELOPMENT_EXPERIMENTS = {
  B: { action: "Criar um ritual de pertencimento", test: "Em duas reuniões, reserve cinco minutos para reconhecer uma contribuição e conectar a entrega à história da equipe.", measure: "Peça a três colegas um exemplo de quando se sentiram parte da entrega. Compare os relatos antes e depois do teste." },
  C: { action: "Dar clareza a uma decisão pendente", test: "Escolha uma decisão de baixo risco, explicite o critério, ouça os envolvidos e comunique o encaminhamento dentro do prazo combinado.", measure: "Registre o tempo até a decisão e pergunte se os envolvidos compreenderam o critério e o próximo passo." },
  D: { action: "Tornar uma entrega mais previsível", test: "Crie um checklist curto para uma entrega recorrente. Combine responsável, prazo e condição de conclusão em dois ciclos.", measure: "Compare retrabalhos e entregas no prazo antes e durante o teste. Ouça quem executa e quem recebe." },
  E: { action: "Conectar esforço a uma entrega visível", test: "Escolha uma prioridade semanal, defina uma entrega verificável e acompanhe seu avanço em dois encontros curtos.", measure: "Registre o que foi concluído e o que gerou valor. Compare o foco percebido pelos envolvidos antes e depois." },
  F: { action: "Criar espaço para escuta e feedback", test: "Faça três conversas curtas. Pergunte o que ajuda, o que atrapalha e qual mudança a pessoa sugere. Combine uma ação e retorne com o resultado.", measure: "Registre os temas ouvidos, os acordos cumpridos e a percepção de escuta das pessoas antes e depois." },
  G: { action: "Visualizar as conexões de um desafio", test: "Desenhe com dois colegas quem entrega, quem recebe e quais dependências existem. Escolha uma conexão para melhorar em pequena escala.", measure: "Observe bloqueios, dependências esclarecidas e efeitos da mudança em quem recebe o trabalho." }
};

function renderDevelopmentRoute(ranked) {
  const top = ranked[0], low = ranked[ranked.length - 1];
  const experiment = DEVELOPMENT_EXPERIMENTS[low.code];
  const challenge = escapeHTML(state.profile.challenge || "uma situação recorrente do seu trabalho");
  const stages = [
    { name: "Escutar", title: "Comece pela experiência real.", text: `Leve seu desafio para uma conversa: “${challenge}”. Ouça pessoas que trabalham com você e peça exemplos concretos, sem tentar confirmar um rótulo.`, output: "Três situações observadas e as diferentes percepções dos envolvidos.", prompt: "Em que momento meu jeito de agir ajudou a entrega? E quando tornou o trabalho mais difícil?" },
    { name: "Definir", title: "Escolha o problema que vale resolver.", text: `Sua leitura traz ${top.name} como recurso e ${low.name} como uma perspectiva a explorar. Confronte isso com os relatos antes de escolher o foco.`, output: "Um desafio com situação, pessoa afetada e efeito esperado.", prompt: `Como podemos usar ${top.core.toLowerCase()} e abrir espaço para ${low.core.toLowerCase()} nesta situação?` },
    { name: "Criar", title: "Abra espaço para alternativas.", text: "Gere três formas de agir com as pessoas envolvidas. Compare esforço, benefício esperado e impacto na rotina. Escolha uma hipótese simples e reversível.", output: "Uma hipótese priorizada e duas alternativas de reserva.", prompt: `Possibilidade inicial: ${experiment.action.toLowerCase()}. O que tornaria essa ideia útil para a sua rotina?` },
    { name: "Prototipar", title: "Transforme a ideia em uma prática.", text: experiment.test, output: "Um piloto de duas semanas, com responsável, situação de teste e registro de partida.", prompt: "O que faremos de maneira diferente? Quem participa? Como vamos perceber se ajudou?" },
    { name: "Testar", title: "Deixe a experiência orientar a decisão.", text: experiment.measure, output: "Uma decisão: continuar, ajustar ou interromper a prática, com base no que foi observado.", prompt: "O resultado melhorou? As pessoas perceberam valor? O esforço cabe na rotina?" }
  ];
  $("development-route").innerHTML = `
    <div class="chapter-heading"><div><span class="eyebrow">04 / Design thinking na prática</span><h2>Entender com pessoas.<br><em>Evoluir com evidências.</em></h2></div><p>O perfil abre perguntas. A evolução acontece ao ouvir, definir um desafio e experimentar novas formas de agir no seu contexto.</p></div>
    <div class="diamond-map"><svg viewBox="0 0 1000 260" role="img" aria-label="Duplo diamante: explorar e definir o desafio; criar e testar uma nova prática"><path class="diamond-shape" d="M30 130L265 20L500 130L265 240Z M500 130L735 20L970 130L735 240Z"/><path class="diamond-route" d="M30 130L265 20L500 130L735 240L970 130"/><path d="M30 130H970" stroke="#afbee0" stroke-dasharray="2 6"/><circle cx="30" cy="130" r="5" fill="#2046c7"/><circle cx="500" cy="130" r="5" fill="#2046c7"/><circle cx="970" cy="130" r="5" fill="#2046c7"/><text class="diamond-title" x="265" y="118" text-anchor="middle">O desafio certo</text><text class="diamond-sub" x="265" y="152" text-anchor="middle">Explorar → definir</text><text class="diamond-title" x="735" y="118" text-anchor="middle">Uma nova prática</text><text class="diamond-sub" x="735" y="152" text-anchor="middle">Criar → experimentar</text></svg></div>
    <div class="dt-tabs" role="tablist" aria-label="Etapas do design thinking">${stages.map((stage, index) => `<button class="dt-tab" id="dt-tab-${index}" type="button" role="tab" aria-selected="${index === 0}" aria-controls="dt-panel-${index}" tabindex="${index === 0 ? 0 : -1}" data-stage="${index}"><span>${String(index + 1).padStart(2, "0")}</span><strong>${stage.name}</strong></button>`).join("")}</div>
    ${stages.map((stage, index) => `<section class="dt-panel" id="dt-panel-${index}" role="tabpanel" aria-labelledby="dt-tab-${index}" tabindex="0" ${index ? "hidden" : ""}><div><span class="eyebrow">${stage.name} / Etapa ${index + 1}</span><h3>${stage.title}</h3><p>${stage.text}</p></div><div class="dt-output"><h4>Pergunta para trabalhar</h4><p>${stage.prompt}</p><h4>O que levar desta etapa</h4><p>${stage.output}</p></div></section>`).join("")}
    <div class="route-heading"><span class="eyebrow">Da descoberta à evolução</span><h2>Uma rota de 90 dias.<br><em>Um ciclo de aprendizado.</em></h2><p>Uma proposta inicial para adaptar à sua agenda e combinar com as pessoas envolvidas.</p></div>
    <div class="timeline" data-animate>
      <article><div class="timeline-node">01</div><div class="timeline-content"><span>Dias 01–30 / Observar</span><h3>Dar clareza ao desafio.</h3><p>Escolha uma situação recorrente relacionada a “${challenge}”. Registre exemplos, ouça três pessoas e defina uma mudança observável.</p><footer>Entrega: desafio definido e registro de partida.</footer></div></article>
      <article><div class="timeline-node">02</div><div class="timeline-content"><span>Dias 31–60 / Experimentar</span><h3>Uma prática, em pequena escala.</h3><p>${experiment.test} Reserve uma revisão semanal para registrar o que funcionou e o que precisa mudar.</p><footer>Entrega: piloto e aprendizados registrados.</footer></div></article>
      <article><div class="timeline-node">03</div><div class="timeline-content"><span>Dias 61–90 / Aprender</span><h3>Decidir com evidências.</h3><p>${experiment.measure} Incorpore a prática útil e escolha o próximo ajuste.</p><footer>Entrega: decisão de continuidade e próximo ciclo.</footer></div></article>
    </div>
    <div class="report-close"><h3>Seu perfil abre<br>uma perspectiva.<br><em>Seu próximo passo<br>cria a mudança.</em></h3><p>Você não é apenas a soma das cores. Use <strong>${top.name}</strong> como recurso, investigue o que <strong>${low.name}</strong> pode acrescentar e escolha uma prática concreta: <strong>${experiment.action.toLowerCase()}</strong>. A evolução está em aprender quando intensificar, dosar ou complementar cada valor.</p></div>
  `;
}

function selectDevelopmentStage(index, focus = false) {
  document.querySelectorAll(".dt-tab").forEach((tab, current) => {
    const active = current === index;
    tab.setAttribute("aria-selected", String(active));
    tab.tabIndex = active ? 0 : -1;
    $(`dt-panel-${current}`).hidden = !active;
    if (active && focus) tab.focus();
  });
}

function updateReadingProgress() {
  readingFrame = 0;
  if (!document.body.classList.contains("report-mode")) return;
  const max = document.documentElement.scrollHeight - window.innerHeight;
  $("reading-progress-fill").style.transform = `scaleX(${max > 0 ? Math.min(1, window.scrollY / max) : 0})`;
  const links = [...document.querySelectorAll(".report-links a")];
  let current = links[0];
  for (const link of links) {
    if (document.querySelector(link.getAttribute("href")).getBoundingClientRect().top < 180) current = link;
  }
  for (const link of links) {
    link.classList.toggle("active", link === current);
    if (link === current) link.setAttribute("aria-current", "location");
    else link.removeAttribute("aria-current");
  }
}

function setupReportMotion() {
  reportObserver?.disconnect();
  if ("IntersectionObserver" in window) {
    reportObserver = new IntersectionObserver(entries => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          entry.target.classList.add("in-view");
          reportObserver.unobserve(entry.target);
        }
      }
    }, { threshold: .15 });
    document.querySelectorAll("[data-animate], .matrix-card, .radar-card, .analysis-card").forEach(element => {
      element.classList.remove("in-view");
      reportObserver.observe(element);
    });
  }
  updateMotion();
  updateReadingProgress();
}

function updateMotion() {
  document.body.classList.toggle("motion-paused", motionPaused);
  $("motion-toggle").textContent = motionPaused ? "Ativar movimento" : "Pausar movimento";
  $("motion-toggle").setAttribute("aria-pressed", String(motionPaused));
  // CSS animations and SVG motion both respect the same user preference.
  document.querySelectorAll("svg").forEach(svg => {
    if (motionPaused) svg.pauseAnimations?.();
    else svg.unpauseAnimations?.();
  });
}

function initializeReportUI() {
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  motionPaused = reducedMotion.matches;
  updateMotion();
  reducedMotion.addEventListener("change", event => { motionPaused = event.matches; updateMotion(); });
  $("motion-toggle").addEventListener("click", () => { motionPaused = !motionPaused; updateMotion(); });
  $("method-button").addEventListener("click", () => $("method-dialog").showModal());
  $("close-method").addEventListener("click", () => $("method-dialog").close());
  $("development-route").addEventListener("click", event => {
    const tab = event.target.closest("[data-stage]");
    if (tab) selectDevelopmentStage(Number(tab.dataset.stage));
  });
  $("development-route").addEventListener("keydown", event => {
    const tab = event.target.closest("[data-stage]");
    if (!tab || !["ArrowRight", "ArrowLeft", "Home", "End"].includes(event.key)) return;
    event.preventDefault();
    const current = Number(tab.dataset.stage);
    const next = event.key === "Home" ? 0 : event.key === "End" ? 4 : (current + (event.key === "ArrowRight" ? 1 : 4)) % 5;
    selectDevelopmentStage(next, true);
  });
  window.addEventListener("scroll", () => {
    if (!readingFrame) readingFrame = requestAnimationFrame(updateReadingProgress);
  }, { passive: true });
  window.addEventListener("resize", updateReadingProgress);
  let printDetails = [];
  window.addEventListener("beforeprint", () => {
    printDetails = [...document.querySelectorAll("#results-screen details")].map(element => [element, element.open]);
    printDetails.forEach(([element]) => { element.open = true; });
  });
  window.addEventListener("afterprint", () => printDetails.forEach(([element, open]) => { element.open = open; }));
}
