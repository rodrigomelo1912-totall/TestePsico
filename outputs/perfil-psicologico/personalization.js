// Professional context informs the narrative; only questionnaire answers determine color scores.
const ROLE_TERMS = {
  B: ["confianca", "pertencimento", "lealdade", "cultura", "acolhimento", "seguranca psicologica"],
  C: ["crise", "urgencia", "conflito", "negociacao dificil", "decisao rapida", "enfrentar", "reagir"],
  D: ["processo", "compliance", "norma", "auditoria", "governanca", "controle", "qualidade", "procedimento", "rotina"],
  E: ["meta", "resultado", "venda", "receita", "crescimento", "performance", "desempenho", "expansao", "lucro"],
  F: ["equipe", "pessoas", "cliente", "escuta", "colaboracao", "bem-estar", "relacionamento", "cuidado"],
  G: ["estrategia", "sistema", "integracao", "complexidade", "interdependencia", "transformacao", "inovacao", "planejamento"]
};
const WORK_BLOCKS = [1, 2, 3, 9];

function normalizeRoleText(value) {
  return String(value || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}

function shortAnswer(value, limit = 175) {
  const text = String(value || "").replace(/\s+/g, " ").trim();
  if (text.length <= limit) return text;
  const trimmed = text.slice(0, limit + 1).replace(/\s+\S*$/, "");
  return `${trimmed || text.slice(0, limit)}…`;
}

function extractRoleSignals(context) {
  const sources = ["responsibilities", "timeFocus", "challenge"].map(key => normalizeRoleText(context[key]));
  const found = Object.fromEntries(Object.keys(COLORS).map(code => [code, []]));
  for (const [code, terms] of Object.entries(ROLE_TERMS)) {
    for (const term of terms) {
      const pattern = new RegExp(`(^|[^a-z])${term}(s|es)?($|[^a-z])`);
      if (sources.some(text => pattern.test(text))) found[code].push(term);
    }
  }
  return found;
}

function buildRoleFit(profile, context) {
  const signals = extractRoleSignals(context);
  const demand = Object.keys(COLORS).map(code => Math.min(signals[code].length, 3));
  const work = Object.keys(COLORS).map(code => WORK_BLOCKS.reduce((sum, index) => sum + profile.blocks[index].answer[code], 0));
  const count = Object.values(signals).reduce((sum, terms) => sum + terms.length, 0);
  const dot = demand.reduce((sum, value, index) => sum + value * work[index], 0);
  const demandNorm = Math.hypot(...demand), workNorm = Math.hypot(...work);
  const percent = count >= 2 && demandNorm && workNorm ? Math.round(100 * dot / (demandNorm * workNorm)) : null;
  const relevant = Object.keys(COLORS).filter(code => signals[code].length).sort((a, b) => signals[b].length - signals[a].length || work[Object.keys(COLORS).indexOf(b)] - work[Object.keys(COLORS).indexOf(a)]);
  const strongestWork = Object.keys(COLORS).sort((a, b) => work[Object.keys(COLORS).indexOf(b)] - work[Object.keys(COLORS).indexOf(a)]);
  return { percent, signals, relevant, strongestWork, work, demand, count };
}

function buildProfessionalReading(profile, context, fit = buildRoleFit(profile, context)) {
  const role = shortAnswer(context.roleArea || context.jobTitle || "seu cargo", 90);
  const top = profile.highest.map(color => color.name).join(" e ");
  const workLead = fit.strongestWork.filter(code => fit.work[Object.keys(COLORS).indexOf(code)] === Math.max(...fit.work)).map(code => COLORS[code].name).join(" e ");
  const first = profile.ranked[0], second = profile.ranked[1];
  const pair = second?.points ? `${first.name} e ${second.name}` : first.name;
  const block = profile.blocks[1];
  const leadingOption = QUESTIONS[1].options.find(option => option[0] === block.leaders[0]);
  const need = fit.relevant[0];
  const quote = (value, fallback) => value?.trim() ? `“${shortAnswer(value)}”` : fallback;
  return {
    panorama: `Você apresentou sua atuação como ${role} e descreveu as responsabilidades assim: ${quote(context.responsibilities, "sem detalhamento suficiente")}. No questionário, ${top} ${profile.highest.length === 1 ? "teve a maior pontuação" : "dividiram a maior pontuação"}. A aproximação entre esses dois relatos é uma hipótese de conversa: as cores mostram prioridades escolhidas, enquanto o texto situa onde essas prioridades podem ser observadas no trabalho.`,
    patterns: `O que mais ocupa seu tempo foi descrito como ${quote(context.timeFocus, "não informado")}. Nas perguntas sobre trabalho e decisão, ${workLead} ${workLead.includes(" e ") ? "receberam as maiores pontuações" : "recebeu a maior pontuação"}. Compare esse foco declarado com o cotidiano descrito: em quais tarefas essas prioridades ganham espaço e em quais parecem disputar tempo com outras exigências?`,
    crossings: `Você apontou como desafio atual ${quote(context.challenge, "um desafio ainda não detalhado")}. O par ${pair} reúne perspectivas que podem cooperar ou criar tensão nesse cenário. Use o desafio como teste concreto: o que você busca preservar, o que tenta mudar e qual decisão precisa tomar? A pontuação sugere perguntas úteis, mas não permite inferir como você agiu nesse episódio.`,
    deepDive: `Na decisão difícil, você relatou ${quote(context.difficultDecision, "uma situação ainda não detalhada")}. Sob pressão, descreveu ${quote(context.pressure, "uma reação ainda não detalhada")}. Ao ler os temas de liderança e gestão, confronte cada hipótese das cores com esses dois episódios. O que no seu relato confirma uma preferência declarada e o que mostra uma resposta diferente quando o contexto aperta?`,
    evidence: `Na pergunta sobre emprego, a alternativa mais pontuada foi ${quote(leadingOption?.[1], "a alternativa destacada no bloco")} (${block.peak}/12). Você indicou como direção profissional ${quote(context.goals, "um objetivo ainda não detalhado")}. A primeira informação é uma escolha medida neste teste; a segunda é um objetivo declarado. Lê-las juntas ajuda a identificar onde há continuidade e onde uma conversa adicional seria mais útil.`,
    fit: fit.percent === null
      ? `Suas responsabilidades foram descritas como ${quote(context.responsibilities, "não informadas")}. O texto ainda não oferece sinais suficientes para calcular uma aproximação com as prioridades do questionário. Descreva atividades e desafios específicos, como decisões, metas, processos ou relações, para produzir uma leitura mais informativa.`
      : `No texto sobre responsabilidades e desafios aparecem referências a ${fit.relevant.slice(0, 3).map(code => COLORS[code].core.toLowerCase()).join("; ")}. A comparação usa essas referências e os pontos das quatro perguntas de trabalho. ${need ? `${COLORS[need].name} aparece como uma exigência mencionada; vale observar se sua atuação cotidiana oferece espaço real para essa prioridade.` : ""} O percentual representa proximidade entre relatos, não aptidão ou desempenho.`
  };
}

function renderPersonalizedNotes(reading) {
  const sections = [
    ["panorama", "panorama-reading"], ["patterns", "leitura"], ["crossings", "color-crossings"],
    ["deepDive", "deep-dive"], ["evidence", "answer-evidence"]
  ];
  for (const [key, id] of sections) {
    const parent = $(id);
    if (!parent) continue;
    parent.querySelector(".personal-note")?.remove();
    const note = document.createElement("aside");
    note.className = "personal-note";
    note.innerHTML = `<span class="eyebrow">Seu contexto em diálogo com as respostas</span><p></p>`;
    note.querySelector("p").textContent = reading[key];
    parent.append(note);
  }
}

function renderRoleFit(profile, context, reading) {
  const fit = buildRoleFit(profile, context);
  const person = shortAnswer(context.roleArea || context.jobTitle || "o cargo informado", 95);
  const signalCards = fit.relevant.slice(0, 4).map(code => `<li><span class="fit-signal-dot" style="--signal:${COLORS[code].hex}"></span><div><strong>${COLORS[code].name}</strong><small>Texto: ${escapeHTML(fit.signals[code].join(", "))} · questionário de trabalho: ${fit.work[Object.keys(COLORS).indexOf(code)]}/48</small></div></li>`).join("");
  const percent = fit.percent === null ? "—" : `${fit.percent}%`;
  $("role-fit").innerHTML = `<div class="chapter-heading"><div><span class="eyebrow">06 / Fit com a Cadeira</span><h2>Seu contexto de trabalho.<br><em>Suas prioridades declaradas.</em></h2></div><p>Uma aproximação exploratória entre o que você escreveu sobre o cargo e os pontos distribuídos nas perguntas ligadas ao trabalho. Não é uma avaliação de competência.</p></div><p id="ai-status" class="analysis-status" aria-live="polite"></p>
    <div class="fit-board"><div class="fit-overview"><div class="fit-gauge" role="img" aria-label="${fit.percent === null ? "Aproximação indisponível por falta de detalhes" : `Aproximação exploratória de ${fit.percent} por cento`}" style="--fit-angle:${(fit.percent || 0) * 3.6}deg"><div><strong>${percent}</strong><span>aproximação<br>exploratória</span></div></div><div><span class="eyebrow">Contexto declarado</span><h3>${escapeHTML(person)}</h3><p>Este número compara a linguagem usada para descrever responsabilidades, atividades e desafios com os 48 pontos de quatro blocos de trabalho. Ele não é um benchmark do cargo nem prevê desempenho.</p></div></div>
    <div class="fit-context"><div class="fit-context-heading"><span class="eyebrow">Sinais presentes no texto</span><p>Termos identificados nas respostas abertas, com a pontuação correspondente do questionário.</p></div><ul>${signalCards || "<li>Descreva tarefas e desafios concretos para tornar esta comparação possível.</li>"}</ul></div></div>
    <div class="fit-readings"><details open><summary>01 / O que aproxima</summary><p class="fit-personal-copy">${escapeHTML(reading.fit)}</p></details><details><summary>02 / O que merece conversa</summary><p>${escapeHTML(`Seu maior desafio foi descrito como “${shortAnswer(context.challenge || "não detalhado")}”. Seus pontos fortes e necessidades de desenvolvimento foram relatados como “${shortAnswer(context.strengthsDevelopment || "não detalhados")}”. Pergunte quais condições do cargo favorecem esses recursos e quais exigências pedem outra forma de apoio.`)}</p></details><details><summary>03 / Como usar este indicador</summary><p>O índice é o cosseno entre dois vetores de seis cores: termos encontrados em responsabilidades, atividades e desafio, e pontos somados nas perguntas de preferências de trabalho, orientação, ambiente e decisão. O cálculo só aparece com ao menos dois sinais textuais. Alterar a descrição do cargo ou as palavras usadas pode mudar o resultado. Use-o para formular perguntas, nunca para aprovar, reprovar ou classificar pessoas.</p></details></div><div class="report-close"><h3>Uma cor não<br>resume você.<br><em>As relações entre<br>elas abrem perguntas.</em></h3><p>${escapeHTML(describeDistribution(profile))} Use as afirmações mais pontuadas e os relatos do trabalho como ponto de partida para uma conversa.</p></div>`;
  return fit;
}

function applyGeneratedReading(generated) {
  const keys = ["panorama", "patterns", "crossings", "deepDive", "evidence", "fit"];
  if (!generated || !keys.every(key => typeof generated[key] === "string" && generated[key].trim().length >= 40 && generated[key].length <= 1200)) throw new Error("A análise recebida está incompleta.");
  renderPersonalizedNotes(generated);
  const fitCopy = $("role-fit")?.querySelector(".fit-personal-copy");
  if (fitCopy) fitCopy.textContent = generated.fit;
}
