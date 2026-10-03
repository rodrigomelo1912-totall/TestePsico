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
  const first = profile.ranked[0], second = profile.ranked[1];
  const pair = second?.points ? `${first.name} e ${second.name}` : first.name;
  const pairGuide = second?.points ? buildColorPair(profile, first.code, second.code) : null;
  const shared = second?.points ? profile.blocks.filter(block => block.answer[first.code] && block.answer[second.code]) : [];
  const contrast = second?.points ? [...profile.blocks].sort((a, b) =>
    Math.abs(b.answer[first.code] - b.answer[second.code]) - Math.abs(a.answer[first.code] - a.answer[second.code]))[0] : null;
  const workLead = fit.strongestWork[0];
  const statement = (index, code) => QUESTIONS[index].options.find(option => option[0] === code)?.[1] || "a afirmação escolhida";
  const described = (value, fallback) => value?.trim() ? `“${shortAnswer(value, 220)}”` : fallback;
  const scenario = context.valuesConflict?.trim() ? `Você relatou um conflito de prioridades: ${described(context.valuesConflict)}. ` : "Você ainda não descreveu uma situação concreta de prioridades em conflito. ";
  const interaction = context.disagreement?.trim() ? `Na discordância que relatou, ${described(context.disagreement)}. ` : "Sem um exemplo de discordância, a leitura sobre diálogo permanece aberta. ";
  const roleEnergy = context.roleEnergy?.trim() ? `Sobre envolvimento e adaptação no cargo, você escreveu ${described(context.roleEnergy)}. ` : "Ainda falta um exemplo do que envolve você e do que exige adaptação no cargo. ";
  return {
    panorama: `Na atuação como ${role}, você descreveu as responsabilidades como ${described(context.responsibilities, "ainda pouco detalhadas")}. O questionário coloca ${pair} em primeiro plano ${profile.highest.length > 2 ? "entre outras cores empatadas" : "no total de pontos"}. Essa distribuição não define seu jeito de trabalhar; ela oferece uma lente para perguntar quais prioridades encontram espaço nas atividades que você realmente exerce.`,
    patterns: `No recorte das perguntas ligadas ao trabalho, ${COLORS[workLead].name} é a referência mais pontuada. Em preferências de trabalho, a afirmação correspondente fala de ${statement(1, workLead).toLowerCase()} O tempo que você descreveu como ${described(context.timeFocus, "não detalhado")} ajuda a confrontar preferência e rotina: a maior parte da semana é ocupada por atividades que favorecem essa prioridade ou a exige deixar em segundo plano?`,
    crossings: `${scenario}${pairGuide ? `${pairGuide.hypothesis} ${shared.length ? `As duas perspectivas receberam pontos juntas em ${shared.length} tema${shared.length === 1 ? "" : "s"}, mas isso não prova que atuaram juntas no episódio narrado.` : "Nas respostas, elas apareceram em temas distintos; não há base para dizer que agiram juntas nesse episódio."}` : "Não há uma segunda cor pontuada para formar um par neste resultado."} A pergunta útil é qual critério você preservou na escolha e o que aceitou perder ou adiar.`,
    deepDive: `${interaction}A pergunta sobre orientação valoriza, em ${COLORS[profile.blocks[2].leaders[0]].name}, ${statement(2, profile.blocks[2].leaders[0]).toLowerCase()} Sob pressão, você descreveu ${described(context.pressure, "uma reação não detalhada")}. Compare a preferência declarada com essa conversa real: o que ajudou a manter a relação de trabalho e o que precisou ser negociado? O relato pode contrariar ou nuançar a hipótese das cores.`,
    evidence: `Em critérios de decisão, a maior pontuação foi para a afirmação ${described(statement(9, profile.blocks[9].leaders[0]))}. Já na decisão difícil relatada, aparece ${described(context.difficultDecision, "um episódio ainda não detalhado")}. Um dado é preferência escolhida no questionário; o outro é uma escolha descrita por você. ${contrast ? `A diferença entre ${first.name} e ${second.name} fica especialmente visível em ${contrast.label.toLowerCase()}. ` : ""}Seu relato sobre forças e desenvolvimento, ${described(context.strengthsDevelopment, "ainda não informado")}, pode ajudar a testar se essa diferença foi recurso ou obstáculo.`,
    fit: fit.percent === null
      ? `${roleEnergy}O texto sobre as atividades do cargo ainda não traz sinais suficientes para uma aproximação numérica com as quatro perguntas de trabalho. Seu desafio, ${described(context.challenge, "não detalhado")}, e a direção desejada, ${described(context.goals, "não informada")}, são pontos de partida para uma conversa sobre condições do trabalho, não sobre aptidão.`
      : `${roleEnergy}O cruzamento entre a descrição de atividades e as quatro perguntas de trabalho aponta proximidade com ${fit.relevant.slice(0, 3).map(code => COLORS[code].core.toLowerCase()).join(" e ")}. O desafio que você trouxe, ${described(context.challenge, "não detalhado")}, ajuda a perguntar se o cargo oferece condições para realizar o que mais mobiliza você, enquanto seus objetivos, ${described(context.goals, "não informados")}, indicam a direção que deseja testar. O indicador é exploratório, não uma medida de competência.`
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
