// Questionnaire-grounded profile report. Verium supplies the visual identity only.
let reportObserver;
let motionPaused = false;
let readingFrame = 0;
let currentReport;

function narrativeSections(sections) {
  return sections.map(section => `<article class="narrative-section"><h3>${escapeHTML(section.title)}</h3>${section.paragraphs.map(text => `<p>${escapeHTML(text)}</p>`).join("")}</article>`).join("");
}

function renderPanoramaReading(profile) {
  const reading = panoramaReading(profile);
  $("panorama-reading").innerHTML = `<span class="eyebrow">Leitura integrada das respostas</span><h2>Do gráfico ao significado.</h2><p>${escapeHTML(reading.introduction)}</p>${narrativeSections(reading.sections)}<p class="reading-note">${escapeHTML(reading.conclusion)}</p>`;
}

function renderProfileInsights(profile) {
  const top = profile.highest;
  const self = profile.blocks[0], decisions = profile.blocks[9];
  const names = codes => codes.map(code => COLORS[code].name).join(" + ");
  const cards = [
    { tag: "Distribuição observada", title: profile.uniform ? "Sem predominância no total" : top.length > 1 ? "Perspectivas empatadas" : `${top[0].name} em destaque`, text: describeDistribution(profile), color: top[0].hex },
    { tag: "Presença entre os temas", title: `${profile.uniqueLeaders.length} cor(es) lideram isoladamente algum bloco`, text: `O total de cada cor pode esconder diferenças entre os temas. ${profile.blocks.filter(block => block.leaders.length > 1).length} de 10 blocos têm empate na maior pontuação. A tabela de respostas permite conferir cada caso.`, color: "#2046c7" },
    { tag: "Autoimagem × decisão", title: "Duas perguntas, duas perspectivas", text: `Na autoimagem: ${names(self.leaders)} (${self.peak}/12 cada). Nos critérios de decisão: ${names(decisions.leaders)} (${decisions.peak}/12 cada). ${self.leaders.join() === decisions.leaders.join() ? "As cores mais pontuadas coincidem nesses dois temas." : "As cores mais pontuadas mudam entre esses dois temas. Essa diferença convida a observar o contexto, sem concluir que existe contradição."}`, color: "#2046c7" },
    { tag: "Menor presença relativa", title: profile.uniform ? "Todas com a mesma presença" : colorNames(profile.lowest), text: profile.uniform ? "Não há uma cor menos pontuada. A distribuição total é igual, sem permitir escolher uma suposta lacuna." : `${profile.lowest[0].points} pontos por cor neste grupo. Em uma distribuição de soma fixa, priorizar certas afirmações reduz os pontos disponíveis às demais. Poucos pontos não provam ausência de empatia, coragem ou qualquer outra capacidade.`, color: profile.lowest[0].hex }
  ];
  $("analysis-cards").innerHTML = cards.map(card => `<article class="analysis-card" style="--card-color:${card.color}"><span>${card.tag}</span><h3>${card.title}</h3><p>${card.text}</p></article>`).join("");
}

function renderColorCrossings(profile) {
  currentReport = profile;
  const options = selected => profile.colors.map(item => `<option value="${item.code}" ${item.code === selected ? "selected" : ""}>${item.name} · ${item.points} pontos</option>`).join("");
  $("color-crossings").innerHTML = `
    <div class="chapter-heading"><div><span class="eyebrow">03 / Cruzamentos de valores</span><h2>As cores se encontram.<br><em>A leitura ganha nuances.</em></h2></div><p>Escolha duas perspectivas para explorar como suas prioridades podem se complementar ou entrar em tensão. As interpretações são hipóteses; os números vêm das respostas.</p></div>
    <div class="pair-controls"><label for="pair-first">Primeira perspectiva<select id="pair-first">${options(profile.ranked[0].code)}</select></label><span aria-hidden="true">×</span><label for="pair-second">Segunda perspectiva<select id="pair-second">${options(profile.ranked[1].code)}</select></label></div>
    <p class="pair-help">O par inicial segue a pontuação total. Em empates, a ordem é apenas de exibição. Explore qualquer uma das 15 combinações.</p>
    <div id="pair-reading" aria-live="polite"></div>
  `;
  renderPairReading(profile.ranked[0].code, profile.ranked[1].code);
}

function renderPairReading(a, b) {
  const pair = buildColorPair(currentReport, a, b);
  const reading = pairReading(currentReport, a, b);
  const { first, second } = pair;
  const firstWidth = first.points / 120 * 100, secondWidth = second.points / 120 * 100;
  $("pair-reading").innerHTML = `
    <div class="pair-board">
      <div class="pair-visual"><svg viewBox="0 0 640 230" role="img" aria-label="${first.name} ${first.points} pontos; ${second.name} ${second.points} pontos. Juntas: ${pair.points} de 120 pontos."><path class="pair-orbit" d="M142 115C240 15 400 15 498 115C400 215 240 215 142 115Z"/><path class="pair-connection" d="M145 115H495"/><circle cx="145" cy="115" r="65" fill="${first.hex}" fill-opacity=".15" stroke="${first.hex}" stroke-width="2"/><circle cx="495" cy="115" r="65" fill="${second.hex}" fill-opacity=".15" stroke="${second.hex}" stroke-width="2"/><text x="145" y="101" class="pair-color-label" text-anchor="middle">${first.name}</text><text x="145" y="135" class="pair-number" text-anchor="middle">${first.points}</text><text x="495" y="101" class="pair-color-label" text-anchor="middle">${second.name}</text><text x="495" y="135" class="pair-number" text-anchor="middle">${second.points}</text><rect x="265" y="84" width="110" height="62" rx="20" fill="#0b1936"/><text x="320" y="112" class="pair-total" text-anchor="middle">${formatPercent(pair.percent)}%</text><text x="320" y="132" class="pair-small" text-anchor="middle">DOS 120 PONTOS</text></svg><p>O tamanho dos círculos é ilustrativo. A barra abaixo representa as proporções reais.</p><div class="pair-share" role="img" aria-label="${formatPercent(first.percent)}% ${first.name}; ${formatPercent(second.percent)}% ${second.name}; ${formatPercent(100 - pair.percent)}% outras cores"><span style="width:${firstWidth}%;background:${first.hex}"></span><span style="width:${secondWidth}%;background:${second.hex}"></span></div><div class="pair-share-labels"><span>${first.name}: ${formatPercent(first.percent)}%</span><span>${second.name}: ${formatPercent(second.percent)}%</span><span>Demais cores: ${formatPercent(100 - pair.percent)}%</span></div></div>
      <div class="pair-copy"><span class="eyebrow">Cruzamento consultado</span><h3>${pair.title}</h3><p>${pair.hypothesis}</p><p class="pair-question">${pair.supported ? pair.question : "Explore outro par ou consulte os blocos para compreender essa distribuição."}</p></div>
    </div>
    <div class="pair-facts"><article><strong>${pair.points}<small>/120</small></strong><span>Pontos destinados às duas cores</span></article><article><strong>${pair.together}<small>/10</small></strong><span>Blocos em que ambas receberam pontos</span></article><article><strong>${Math.abs(first.points - second.points)}<small> pontos</small></strong><span>Diferença entre as duas cores</span></article></div>
    <p class="reading-note">${pair.balance} A presença conjunta não é uma correlação estatística nem comprova um comportamento.</p>
    <section class="narrative-reading"><span class="eyebrow">Análise do par selecionado</span><h2>${escapeHTML(reading.title)}</h2>${reading.paragraphs.map(text => `<p>${escapeHTML(text)}</p>`).join("")}<div class="pair-narratives">${narrativeSections(reading.sections)}</div></section>
  `;
  updateMotion();
}

function dimensionColorAnalysis(profile, index, code) {
  const color = profile.colors.find(item => item.code === code);
  const points = profile.blocks[index].answer[code];
  const statement = QUESTIONS[index].options.find(option => option[0] === code)[1];
  if (points === 0) return `Nesta dimensão, nenhuma das 12 respostas foi atribuída a ${color.name}. Isso indica que a frase ficou fora da prioridade escolhida nesta pergunta; não significa ausência de ${color.focus.toLowerCase()} em outras situações. A pergunta de reflexão é: ${color.question}`;
  if (points === 12) return `As 12 respostas desta dimensão foram atribuídas a ${color.name}, portanto esta perspectiva ocupa 100% do share do bloco. A frase “${statement}” foi a única referência escolhida nesta pergunta. Pela lente da Espiral, isso coloca ${color.focus.toLowerCase()} no centro desta dimensão; vale observar o contexto que tornou essa referência tão dominante. ${color.question}`;
  return `${points} de 12 respostas (${formatPercent(points / 12 * 100)}%) foram atribuídas a ${color.name}. A frase “${statement}” expressa como ${color.focus.toLowerCase()} aparece nesta dimensão. ${color.meaning} O share mostra prioridade relativa entre as alternativas apresentadas, não um traço isolado ou definitivo. ${color.question}`;
}

function answerRows(profile, index) {
  return QUESTIONS[index].options.map(([code, text]) => `<details class="answer-detail"><summary class="answer-evidence-row"><span class="color-dot" style="--color:${COLORS[code].hex}"></span><div><strong>${COLORS[code].name}</strong><p>${escapeHTML(text)}</p></div><b>${profile.blocks[index].answer[code]}<small>/12</small></b><span class="answer-cta">Abrir leitura <span aria-hidden="true">+</span></span></summary><div class="answer-detail-copy"><span class="eyebrow">Como esta cor atua nesta dimensão</span><p>${escapeHTML(dimensionColorAnalysis(profile, index, code))}</p></div></details>`).join("");
}

function dimensionMixAnalysis(profile, index) {
  const block = profile.blocks[index];
  const ranked = profile.colors.filter(color => block.answer[color.code] > 0).sort((a, b) => block.answer[b.code] - block.answer[a.code]);
  if (!ranked.length) return "Nenhuma cor recebeu pontos neste bloco, o que não deveria ocorrer em uma distribuição válida de 12 pontos.";
  if (ranked.length === 1) return `${ranked[0].name} concentra as 12 respostas desta dimensão. O mix, neste caso, é de concentração integral: as demais perspectivas não receberam prioridade nesta pergunta. Isso descreve a forma como esta questão foi respondida, não uma hierarquia de valor entre as cores.`;
  const lead = ranked[0], second = ranked[1];
  const spread = ranked.map(color => `${color.name} ${block.answer[color.code]}/12`).join(", ");
  return `O mix desta dimensão é ${spread}. ${lead.name} lidera com ${block.answer[lead.code]}/12 (${formatPercent(block.answer[lead.code] / 12 * 100)}%), enquanto ${second.name} aparece com ${block.answer[second.code]}/12 (${formatPercent(block.answer[second.code] / 12 * 100)}%). As demais cores completam a distribuição. Isso sugere que a resposta combina referências em proporções diferentes: a cor líder organiza a maior parte da prioridade, e as outras mostram o espaço relativo dado a perspectivas complementares ou concorrentes nesta pergunta. O sentido do mix está na relação entre as cores e no contexto da dimensão, não em uma cor isolada.`;
}

function polarPoint(cx, cy, radius, angle) {
  const radians = (angle - 90) * Math.PI / 180;
  return [cx + radius * Math.cos(radians), cy + radius * Math.sin(radians)];
}

function arcPath(cx, cy, radius, start, end) {
  const [x1, y1] = polarPoint(cx, cy, radius, start);
  const [x2, y2] = polarPoint(cx, cy, radius, end);
  return `M ${x1.toFixed(2)} ${y1.toFixed(2)} A ${radius} ${radius} 0 ${end - start > 180 ? 1 : 0} 1 ${x2.toFixed(2)} ${y2.toFixed(2)}`;
}

function radialDimensionMap(profile) {
  const cx = 250, cy = 250, radius = 146, gap = 2.3, sweep = 36;
  const groups = profile.blocks.map(block => {
    const start = block.index * 36 + gap;
    let cursor = start;
    const paths = profile.colors.map(color => {
      const amount = block.answer[color.code] / 12 * (sweep - gap * 2);
      const path = amount ? `<path d="${arcPath(cx, cy, radius, cursor, cursor + amount)}" stroke="${color.hex}" stroke-width="25"/>` : "";
      cursor += amount;
      return path;
    }).join("");
    const mid = block.index * 36 + 18;
    const [lx, ly] = polarPoint(cx, cy, 190, mid);
    return `<g class="radial-dimension" data-block="${block.index}" role="button" tabindex="0" aria-label="${String(block.index + 1).padStart(2, "0")} ${escapeHTML(block.label)}" aria-pressed="false"><path class="radial-hit" d="${arcPath(cx, cy, radius, start, start + sweep - gap)}"/><g class="radial-segments">${paths}</g><text x="${lx.toFixed(1)}" y="${ly.toFixed(1)}" text-anchor="middle" class="radial-index">${String(block.index + 1).padStart(2, "0")}</text><text x="${lx.toFixed(1)}" y="${(ly + 14).toFixed(1)}" text-anchor="middle" class="radial-label">${escapeHTML(block.label.replace("Preferências de trabalho", "Preferências"))}</text></g>`;
  }).join("");
  return `<div class="radial-visual"><svg class="radial-map" viewBox="0 0 500 500" role="img" aria-label="Mapa radial das dez dimensões, com doze respostas distribuídas por dimensão."><circle cx="250" cy="250" r="146" fill="none" stroke="#dfe5f1" stroke-width="25"/>${groups}<circle cx="250" cy="250" r="91" fill="#fff"/><text x="250" y="226" text-anchor="middle" class="radial-center-kicker">VISÃO GERAL</text><text x="250" y="264" text-anchor="middle" class="radial-center-number">10</text><text x="250" y="286" text-anchor="middle" class="radial-center-copy">DIMENSÕES</text><text x="250" y="306" text-anchor="middle" class="radial-center-copy">12 participantes</text><text x="250" y="321" text-anchor="middle" class="radial-center-copy">por dimensão</text></svg><div id="radial-insight" class="radial-insight" aria-live="polite"><span class="eyebrow">Passe o cursor ou selecione uma dimensão</span><p>O círculo mostra o conjunto. Ao explorar um segmento, a distribuição das 12 respostas aparece aqui.</p></div><div class="radial-legend">${profile.colors.map(color => `<span><i style="background:${color.hex}"></i>${color.name}</span>`).join("")}</div></div>`;
}

function renderRadialInsight(index) {
  const block = currentReport.blocks[index];
  const leaders = block.leaders.map(code => COLORS[code].name).join(" + ");
  const segments = currentReport.colors.filter(color => block.answer[color.code] > 0).map(color => `<span style="width:${block.answer[color.code] / 12 * 100}%;background:${color.hex}" title="${color.name}: ${block.answer[color.code]}/12"></span>`).join("");
  const details = currentReport.colors.map(color => {
    const points = block.answer[color.code];
    const statement = QUESTIONS[index].options.find(option => option[0] === color.code)[1];
    const share = formatPercent(points / 12 * 100);
    const text = points === 12
      ? `As 12 respostas deste bloco foram atribuídas a ${color.name}. Nesta dimensão, ela concentra 100% da distribuição.`
      : points === 0
        ? `Nenhuma das 12 respostas deste bloco foi atribuída a ${color.name}. Isso indica prioridade relativa nesta pergunta, não ausência de ${color.focus.toLowerCase()} na pessoa.`
        : `${points} de 12 respostas (${share}%) foram atribuídas a ${color.name}. A afirmação correspondente foi: “${statement}”.`;
    return `<article class="radial-color-detail"><div class="radial-color-detail-heading"><span><i style="background:${color.hex}"></i><strong>${color.name}</strong></span><b>${points}/12 · ${share}%</b></div><div class="radial-color-track"><span style="width:${points / 12 * 100}%;background:${color.hex}"></span></div><p>${escapeHTML(text)} ${escapeHTML(color.meaning)}</p></article>`;
  }).join("");
  $("radial-insight").innerHTML = `<div><span class="eyebrow">Dimensão ${String(index + 1).padStart(2, "0")}</span><h3>${escapeHTML(block.label)}</h3><p>${block.leaders.length > 1 ? "Empate entre" : "Maior presença em"} <strong>${escapeHTML(leaders)}</strong> · ${block.peak}/12</p></div><div class="radial-insight-bar" aria-label="Distribuição de 12 respostas">${segments}</div><small>A faixa mostra o share real das 12 respostas. As cores sem pontos ficam fora da faixa.</small><details class="radial-color-details"><summary>Expandir análise das seis cores nesta dimensão</summary><div>${details}</div></details>`;
}

function renderAnswerEvidence(profile) {
  const legend = profile.colors.map(item => `<span><i style="background:${item.hex}"></i>${item.name}</span>`).join("");
  $("answer-evidence").innerHTML = `
    <div class="chapter-heading"><div><span class="eyebrow">04 / Respostas que sustentam a leitura</span><h2>O total mostra o conjunto.<br><em>Os blocos mostram as diferenças.</em></h2></div><p>Cada linha contém 12 pontos. Selecione um tema para ver as afirmações e conferir de onde veio a distribuição. São comparações entre respostas, não uma medida de estabilidade emocional.</p></div>
    <div class="block-legend">${legend}</div>
    ${radialDimensionMap(profile)}
    <section id="block-evidence" class="block-evidence" aria-live="polite"></section>
    <details class="method-details answer-memory"><summary>Consultar as 60 respostas e pontuações</summary>${profile.blocks.map(block => `<section class="answer-memory-block"><h3>${block.index + 1}. ${QUESTIONS[block.index].title}</h3>${answerRows(profile, block.index)}</section>`).join("")}</details>
    <details class="method-details"><summary>Como esta leitura foi construída</summary><p><strong>Base numérica:</strong> soma dos pontos de cada cor nos dez blocos. Percentual = pontos da cor ÷ 120 × 100. Cada bloco tem peso igual; pontuações empatadas permanecem empatadas.</p><p><strong>Cruzamentos:</strong> soma do par, diferença em pontos e quantidade de blocos em que as duas cores receberam pontos. Os textos de complementaridade e tensão são hipóteses editoriais inspiradas nos significados das cores; não são escalas psicológicas validadas.</p><p><strong>Alcance:</strong> as perguntas de apresentação não alteram a pontuação nem geram conclusões sobre cargo, competência ou personalidade. A análise se limita às escolhas do questionário. Não há classificação de pessoas em estágios superiores, diagnóstico clínico ou comparação com uma população.</p><p><strong>Referências conceituais:</strong> <a href="https://ahead-harpymimus-002.notion.site/Perfil-Psicol-gico-1891ddaac10f801c9ffcc0ffa9335a46" target="_blank" rel="noopener noreferrer">Biblioteca de cores fornecida</a>; <a href="https://www.toolshero.com/change-management/spiral-dynamics/" target="_blank" rel="noopener noreferrer">Toolshero</a>; <a href="https://kenwilber.com.br/dinamica-da-espiral/" target="_blank" rel="noopener noreferrer">Dinâmica da Espiral</a>; <a href="https://www.spiral-dynamics.com/theory/systems_not_types.htm" target="_blank" rel="noopener noreferrer">Spiral Dynamics: sistemas, não tipos de pessoas</a>. Estas fontes explicam o modelo; não validam este questionário ou seus cruzamentos.</p></details>
    <div class="report-close"><h3>Uma cor não<br>resume você.<br><em>As relações entre<br>elas abrem perguntas.</em></h3><p>${describeDistribution(profile)} Use as afirmações mais pontuadas como ponto de partida para observar suas próprias escolhas.</p></div>
  `;
  renderBlockEvidence(0);
}

function renderBlockEvidence(index) {
  const block = currentReport.blocks[index];
  $("block-evidence").innerHTML = `<span class="eyebrow">Bloco ${index + 1} / ${block.label}</span><h3>${QUESTIONS[index].title}</h3><p>${block.leaders.length > 1 ? "Empate entre" : "Maior pontuação em"} ${block.leaders.map(code => COLORS[code].name).join(" + ")}: ${block.peak} pontos ${block.leaders.length > 1 ? "cada" : ""}.</p><p class="detail-instruction">Abra cada cor para entender o que a frase representa nesta dimensão.</p>${answerRows(currentReport, index)}<section class="dimension-mix"><span class="eyebrow">Síntese da dimensão</span><h4>Leitura do mix das cores</h4><p>${escapeHTML(dimensionMixAnalysis(currentReport, index))}</p></section>`;
  document.querySelectorAll("[data-block]").forEach(button => button.setAttribute("aria-pressed", String(Number(button.dataset.block) === index)));
}

function selectRadialDimension(index) {
  renderBlockEvidence(index);
  renderRadialInsight(index);
  document.querySelectorAll(".radial-dimension").forEach(segment => segment.setAttribute("aria-pressed", String(Number(segment.dataset.block) === index)));
}

function renderSpiralIntroduction() {
  $("spiral-colors").innerHTML = Object.entries(SPIRAL_CONTENT).map(([code, item]) => `<article class="spiral-color-card" style="--card-color:${COLORS[code].hex}"><span class="color-dot" style="--color:${COLORS[code].hex}"></span><h3>${COLORS[code].name}</h3><strong>${item.focus}</strong><p>${item.meaning}</p></article>`).join("");
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
  renderSpiralIntroduction();
  $("spiral-button").addEventListener("click", () => $("spiral-dialog").showModal());
  $("close-spiral").addEventListener("click", () => $("spiral-dialog").close());
  $("color-crossings").addEventListener("change", event => {
    if (!event.target.matches("select")) return;
    const a = $("pair-first"), b = $("pair-second");
    if (a.value === b.value) {
      const other = event.target === a ? b : a;
      other.value = currentReport.colors.find(item => item.code !== event.target.value).code;
    }
    renderPairReading(a.value, b.value);
  });
  $("answer-evidence").addEventListener("click", event => {
    const button = event.target.closest("[data-block]");
    if (button) selectRadialDimension(Number(button.dataset.block));
  });
  $("answer-evidence").addEventListener("keydown", event => {
    const segment = event.target.closest(".radial-dimension");
    if (segment && (event.key === "Enter" || event.key === " ")) { event.preventDefault(); selectRadialDimension(Number(segment.dataset.block)); }
  });
  $("answer-evidence").addEventListener("pointerover", event => {
    const segment = event.target.closest(".radial-dimension");
    if (segment) renderRadialInsight(Number(segment.dataset.block));
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
