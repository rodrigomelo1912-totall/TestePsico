const COLORS = {
  B: { name: "Púrpura", hex: "#8e2a91", core: "Pertencimento, identidade de grupo e lealdade", description: "Valoriza vínculos, continuidade, confiança e a sensação de fazer parte de algo maior." },
  C: { name: "Vermelho", hex: "#e64b3c", core: "Força pessoal, coragem e assertividade", description: "Traz energia para agir, defender posições, enfrentar obstáculos e tomar decisões difíceis." },
  D: { name: "Azul", hex: "#42b7d1", core: "Estrutura, ordem, regras e disciplina", description: "Busca coerência, estabilidade, responsabilidade e processos que organizem a realidade." },
  E: { name: "Laranja", hex: "#f07b32", core: "Resultado, desempenho e crescimento", description: "Orienta para metas, progresso, mérito, eficiência, conquista e novas oportunidades." },
  F: { name: "Verde", hex: "#4fae4c", core: "Empatia, relações humanas e colaboração", description: "Prioriza escuta, cuidado, consenso, bem-estar coletivo e relações mais humanas." },
  G: { name: "Amarelo", hex: "#efcf62", core: "Pensamento sistêmico e visão integradora", description: "Enxerga interdependências, acolhe diferentes perspectivas e adapta soluções ao contexto." }
};

const LEVEL_WORK_STYLE = {
  B: { gift: "Cria pertencimento e preserva vínculos importantes.", risk: "Pode proteger demais o conhecido e evitar rupturas necessárias.", lowRisk: "Pode faltar ritual de pertencimento, celebração e vínculo com a história do grupo.", lever: "Use rituais de alinhamento, confiança e memória cultural." },
  C: { gift: "Decide com coragem, confronta obstáculos e sustenta ritmo.", risk: "Pode acelerar antes de escutar ou gerar tensão em perfis sensíveis.", lowRisk: "Pode faltar confronto, firmeza pública e velocidade em decisões impopulares.", lever: "Canalize a força em decisões com critérios claros e combinados prévios." },
  D: { gift: "Organiza, disciplina, dá previsibilidade e protege o padrão.", risk: "Pode prender energia em excesso de regra, controle ou burocracia.", lowRisk: "Pode faltar rotina, documentação, cadência e sustentação disciplinada da execução.", lever: "Transforme processo em trilho para execução, não em trava para resultado." },
  E: { gift: "Move crescimento, performance, mérito e foco em resultado.", risk: "Pode medir pessoas só por entrega e pressionar além do ponto saudável.", lowRisk: "Pode faltar ambição explícita, métrica de avanço e disputa saudável por performance.", lever: "Conecte meta, indicador, autonomia e reconhecimento explícito." },
  F: { gift: "Amplia escuta, colaboração, cuidado e inteligência relacional.", risk: "Pode adiar conflitos ou dissolver clareza em busca de consenso.", lowRisk: "Pode gerar distância emocional, baixa escuta percebida e desgaste silencioso do time.", lever: "Crie conversas estruturadas de feedback, reconhecimento e segurança psicológica." },
  G: { gift: "Enxerga sistemas, interdependências e lugares de potência.", risk: "Pode analisar pessoas como peças do sistema e subestimar emoção.", lowRisk: "Pode faltar leitura de interdependências, adaptação contextual e visão de segunda ordem.", lever: "Use mapas, hipóteses e experimentos curtos para ajustar o sistema humano." }
};

const ROLE_ARCHETYPES = {
  executive: {
    title: "Liderança Estratégica",
    label: "Orquestrador organizacional",
    match: ["ceo", "diretor", "diretora", "presidente", "socio", "sócio", "fundador", "head", "gestor", "gestora", "gerente", "lider", "líder"],
    ideal: { E: 24, G: 22, D: 17, C: 15, F: 12, B: 10 },
    dimensionWeights: { strategy: .26, growth: .22, execution: .20, system: .20, people: .12 },
    sentence: "Transforma visão em direção, organiza prioridades e mobiliza pessoas para resultado."
  },
  commercial: {
    title: "Crescimento Comercial",
    label: "Construtor de receita",
    match: ["comercial", "vendas", "marketing", "negocio", "negócio", "growth", "receita", "relacionamento", "cliente"],
    ideal: { E: 28, C: 18, G: 17, F: 14, D: 13, B: 10 },
    dimensionWeights: { growth: .32, execution: .22, strategy: .18, people: .18, system: .10 },
    sentence: "Converte oportunidade em negócio, sustenta energia de mercado e aprende rápido com o cliente."
  },
  operations: {
    title: "Operações e Processos",
    label: "Arquiteto de execução",
    match: ["operacao", "operação", "processo", "projeto", "produto", "qualidade", "atendimento", "implantacao", "implantação"],
    ideal: { D: 24, G: 22, E: 18, C: 14, F: 12, B: 10 },
    dimensionWeights: { system: .28, execution: .24, strategy: .18, growth: .16, people: .14 },
    sentence: "Transforma complexidade em fluxo, reduz ruído operacional e entrega consistência."
  },
  people: {
    title: "Gestão de Pessoas",
    label: "Desenvolvedor de talentos",
    match: ["rh", "pessoas", "gente", "cultura", "talentos", "treinamento", "desenvolvimento humano"],
    ideal: { F: 26, G: 20, B: 18, D: 15, E: 12, C: 9 },
    dimensionWeights: { people: .34, system: .22, strategy: .16, execution: .14, growth: .14 },
    sentence: "Lê energia humana, desenvolve talentos e cria segurança para performance sustentável."
  },
  technical: {
    title: "Tecnologia e Sistemas",
    label: "Integrador técnico",
    match: ["tecnologia", "ti", "dev", "dados", "produto digital", "engenharia", "sistemas", "software"],
    ideal: { G: 27, D: 20, E: 18, C: 12, F: 12, B: 11 },
    dimensionWeights: { system: .32, strategy: .22, execution: .20, growth: .14, people: .12 },
    sentence: "Enxerga arquitetura, integra partes e transforma tecnologia em alavanca de escala."
  },
  specialist: {
    title: "Especialista Profissional",
    label: "Executor especialista",
    match: [],
    ideal: { D: 21, E: 20, G: 19, F: 15, C: 13, B: 12 },
    dimensionWeights: { execution: .24, system: .22, strategy: .20, growth: .18, people: .16 },
    sentence: "Entrega com profundidade técnica, consistência e evolução gradual de impacto."
  }
};

const QUESTIONS = [
  { title: "Pessoas que me conhecem melhor diriam que sou...", options: [
    ["G", "Individualista, seguindo minhas próprias regras."], ["D", "Responsável e estável, com convicções, crenças e princípios fortes."],
    ["B", "Supersticioso, preocupado com segurança, muito leal ao grupo, família ou par."], ["C", "Um “rebelde” que gosta de pensar por conta própria."],
    ["E", "Ambicioso e progressista, com aspirações fortes, iniciativa e vigor."], ["F", "Aberto e autêntico, sensível a sentimentos e orientado para lidar com pessoas."]
  ]},
  { title: "Eu gosto de emprego que tenha...", options: [
    ["B", "Muita segurança, trabalhando em grupo de pessoas semelhantes a mim."], ["C", "Muita ação, com oportunidade para ganhar bastante dinheiro rapidamente."],
    ["D", "Grande estabilidade, trabalho bem organizado, recompensas por lealdade e confiança."], ["E", "Muita oportunidade para promoção, com recompensa baseada no mérito do desempenho."],
    ["F", "Muita atenção para as necessidades humanas e relacionamentos."], ["G", "Muita liberdade para fazer aquilo que me interessa, usando meus padrões."]
  ]},
  { title: "Eu sou mais facilmente gerenciado quando tenho...", options: [
    ["E", "Controle sobre meu destino e desafios que me façam usar bem minhas habilidades."], ["C", "Um chefe que seja autoritário, mas que não me perturbe ou fique me monitorando."],
    ["D", "Um sistema gerencial que seja justo, consistente e siga as regras."], ["B", "Um chefe que demonstre interesse pessoal em mim e que seja autoritário."],
    ["F", "Uma atmosfera que responda às necessidades e sentimentos de cada um."], ["G", "Acesso às informações que preciso e liberdade para fazer o serviço do meu modo."]
  ]},
  { title: "Eu prefiro trabalhar numa instituição que...", options: [
    ["D", "Seja organizada, consistente, e aprecie lealdade e dedicação."], ["G", "Entenda e aceite particularidades individuais, sem ser crítica."],
    ["C", "Ofereça ação e aventura, me pague bem e me deixe em paz."], ["F", "Considere as necessidades, sentimentos e bem-estar tanto dos colaboradores quanto dos clientes."],
    ["B", "Crie um ambiente protetor e seguro, onde eu não me sinta ameaçado."], ["E", "Proporcione caminhos e incentivos para subir na hierarquia e incentive promoções."]
  ]},
  { title: "Nosso país funciona ao máximo quando nós...", options: [
    ["G", "Entendemos nossa interdependência global e abrimos mão de certos interesses para que a vida possa continuar."], ["F", "Colocamos o bem-estar de todos os seres humanos à frente de qualquer outra coisa."],
    ["E", "Desenvolvemos nosso potencial como uma nação, reforçando nossa vantagem competitiva e confrontando nossos problemas."], ["B", "Somos protegidos por líderes fortes que nos inspiram e cuidam de nossas necessidades durante tempos difíceis."],
    ["C", "Não tomamos nada de ninguém, defendemos nossos direitos e conseguimos o que queremos quando queremos."], ["D", "Continuamos fazendo o que fez este país forte, defendendo princípios básicos e vivendo de forma decente, justa e dentro da lei."]
  ]},
  { title: "Leis, regras e regulamentos são...", options: [
    ["E", "Necessárias, mas nós só progredimos quando conseguimos burlá-las um pouco."], ["D", "Absolutamente essenciais para manter estabilidade, disciplina e ordem."],
    ["C", "Geralmente desenhadas para proteger interesses particulares e punir os outros."], ["G", "Roteiros funcionais que deveriam encorajar responsabilidade pessoal."],
    ["B", "Protetoras dos que estão com problemas e nos dizem o que é esperado de nós."], ["F", "Úteis se beneficiarem a todos e forem executadas de forma humana."]
  ]},
  { title: "A melhor maneira para eu suportar a vida...", options: [
    ["B", "Me ligar a uma pessoa ou grupo que cuide de mim."], ["C", "Ser forte o bastante para cuidar de mim e então conseguir o que quero."],
    ["D", "Ser fiel às minhas crenças e continuar fazendo o que é certo no sentido de obter a recompensa final."], ["E", "Aprender a negociar com o mundo no sentido de aproveitar a vida ao máximo."],
    ["F", "Procurar paz com meu eu interior e com o interior dos outros."], ["G", "Evitar ser compulsivo, regimental ou dependente da tecnologia, aceitando o inevitável de modo natural."]
  ]},
  { title: "As pessoas veem a vida de diferentes formas. Para mim, vida é...", options: [
    ["F", "Uma experiência através da qual uma pessoa explora o que significa ser humano e tornar-se parte da condição humana das outras."], ["B", "Alguma coisa misteriosa e amedrontadora, mas agradável quando sei que estou seguro."],
    ["G", "Um sistema de homem, natureza e eventos resultando numa atmosfera de diversidade e de inevitáveis mudanças."], ["C", "Como uma selva onde o mais forte sobrevive e o mais poderoso domina."],
    ["E", "Cheia de oportunidades para aqueles dispostos a progredir e alcançar vida melhor."], ["D", "Um lugar sistemático, controlado por leis e princípios básicos que determinam nossos destinos e mostram o modo certo de agir."]
  ]},
  { title: "Para mim, dinheiro é importante porque...", options: [
    ["B", "Paga as necessidades básicas que eu tenho com alimentação e moradia."], ["C", "Me permite comprar o que eu quero, fazendo com que eu me sinta alguém."],
    ["D", "Me proporciona um padrão de vida decente hoje e segurança para o futuro."], ["G", "Me dá liberdade para ser quem eu quiser e para fazer o que eu achar interessante."],
    ["F", "É um meio pelo qual nós podemos suprir as nossas necessidades e dos outros."], ["E", "Demonstra que sou bem-sucedido e que mereço aproveitar as boas coisas da vida."]
  ]},
  { title: "Eu faço decisões baseado no(s)...", options: [
    ["F", "Impacto da minha decisão no bem-estar das outras pessoas."], ["D", "Que é certo e consistente com nossos padrões e modo de viver."],
    ["C", "Que gera para mim, agora: se você não o fizer, alguém vai lhe tomar."], ["E", "Que vai gerar para mim em termos de ganho material e/ou reconhecimento pessoal."],
    ["B", "Prognósticos e avisos favoráveis que eu capto."], ["G", "Efeito sobre nosso sistema global de vida e na liberdade básica do homem de existir."]
  ]}
];

const state = {
  profile: {
    name: "", roleArea: "", responsibilities: "", timeFocus: "", challenge: "",
    difficultDecision: "", pressure: "", strengthsDevelopment: "", goals: ""
  },
  introCurrent: 0,
  current: 0,
  answers: QUESTIONS.map(() => Object.fromEntries(Object.keys(COLORS).map(key => [key, 0])))
};

const $ = (id) => document.getElementById(id);
const screens = ["welcome-screen", "quiz-screen", "results-screen"];

function showScreen(id) {
  screens.forEach(screen => $(screen).classList.toggle("active", screen === id));
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function persist() {
  captureProfile();
  localStorage.setItem("totall-profile-map", JSON.stringify(state));
}

const profileFields = {
  name: "name",
  roleArea: "role-area",
  responsibilities: "responsibilities",
  timeFocus: "time-focus",
  challenge: "challenge",
  difficultDecision: "difficult-decision",
  pressure: "pressure",
  strengthsDevelopment: "strengths-development",
  goals: "goals"
};

function captureProfile() {
  Object.entries(profileFields).forEach(([key, id]) => {
    const field = $(id);
    if (field) state.profile[key] = field.value.trim();
  });
}

function populateProfile() {
  Object.entries(profileFields).forEach(([key, id]) => {
    if ($(id)) $(id).value = state.profile[key] || "";
  });
}

function restore() {
  const saved = localStorage.getItem("totall-profile-map");
  if (!saved) return;
  try {
    const data = JSON.parse(saved);
    if (data.profile && Array.isArray(data.answers) && data.answers.length === QUESTIONS.length) {
      Object.assign(state, data);
      state.profile.roleArea ||= state.profile.role || "";
      state.profile.responsibilities ||= state.profile.roleContext || "";
      state.introCurrent = Math.max(0, Math.min(2, state.introCurrent || 0));
      populateProfile();
      $("header-person").textContent = state.profile.name || "";
      renderIntro();
    }
  } catch (_) { localStorage.removeItem("totall-profile-map"); }
}

function renderIntro() {
  document.querySelectorAll(".intro-slide").forEach((slide, index) => slide.classList.toggle("active", index === state.introCurrent));
  document.querySelectorAll(".intro-dots span").forEach((dot, index) => dot.classList.toggle("active", index === state.introCurrent));
  $("intro-progress-label").textContent = `Etapa ${state.introCurrent + 1} de 3`;
  $("intro-title").textContent = ["Seu contexto profissional", "Sua rotina e suas decisões", "Seu jeito de agir e seus objetivos"][state.introCurrent];
  $("intro-previous").disabled = state.introCurrent === 0;
  $("intro-next").hidden = state.introCurrent === 2;
  $("intro-submit").hidden = state.introCurrent !== 2;
}

function validateIntroSlide() {
  const slide = document.querySelector(`.intro-slide[data-intro-slide="${state.introCurrent}"]`);
  const requiredFields = [...slide.querySelectorAll("[required]")];
  const invalid = requiredFields.find(field => !field.value.trim());
  if (invalid) {
    invalid.focus();
    invalid.reportValidity();
    return false;
  }
  return true;
}

function blockTotal(index = state.current) {
  return Object.values(state.answers[index]).reduce((sum, value) => sum + Number(value || 0), 0);
}

function renderQuestion() {
  const question = QUESTIONS[state.current];
  const total = blockTotal();
  $("question-kicker").textContent = `Bloco ${String(state.current + 1).padStart(2, "0")}`;
  $("question-title").textContent = question.title;
  $("progress-label").textContent = `Bloco ${state.current + 1} de ${QUESTIONS.length}`;
  $("progress-bar").style.width = `${((state.current + 1) / QUESTIONS.length) * 100}%`;
  $("previous-button").disabled = state.current === 0;
  $("next-button").innerHTML = state.current === QUESTIONS.length - 1 ? "Ver meu resultado <span>→</span>" : "Próximo bloco <span>→</span>";
  $("options-list").innerHTML = question.options.map(([code, text]) => {
    const value = state.answers[state.current][code];
    return `<div class="option-row ${value ? "has-value" : ""}">
      <span class="option-text">${text}</span>
      <div class="score-control">
        <button type="button" data-action="minus" data-code="${code}" aria-label="Diminuir pontos de ${text}">−</button>
        <input type="number" min="0" max="12" inputmode="numeric" data-code="${code}" value="${value}" aria-label="Pontos para ${text}">
        <button type="button" data-action="plus" data-code="${code}" aria-label="Aumentar pontos de ${text}">+</button>
      </div>
    </div>`;
  }).join("");
  updatePoints(total);
}

function updatePoints(total = blockTotal()) {
  $("points-used").textContent = total;
  $("points-ring").style.background = `conic-gradient(${total === 12 ? "#4fae4c" : total > 12 ? "#e64b3c" : "#009bc2"} ${Math.min(total / 12, 1) * 360}deg, rgba(9,47,61,.07) 0)`;
  $("validation-message").textContent = total > 12 ? `Retire ${total - 12} ponto(s) para fechar este bloco.` : total < 12 ? `Ainda faltam ${12 - total} ponto(s) para fechar este bloco.` : "Bloco completo. Você pode avançar.";
  $("validation-message").style.color = total === 12 ? "#408843" : "#bf4a43";
}

function updateScore(code, value) {
  state.answers[state.current][code] = Math.max(0, Math.min(12, Number(value) || 0));
  persist();
  renderQuestion();
}

function totals() {
  return Object.keys(COLORS).map(code => ({
    code, ...COLORS[code], points: state.answers.reduce((sum, answer) => sum + answer[code], 0)
  })).map(item => ({ ...item, percent: Math.round((item.points / 120) * 100) }));
}

const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
const byCode = (data) => Object.fromEntries(data.map(item => [item.code, item]));
const pct = (map, code) => map[code]?.percent || 0;

function detectRoleArchetype() {
  const text = [
    state.profile.roleArea, state.profile.responsibilities, state.profile.timeFocus,
    state.profile.challenge, state.profile.difficultDecision, state.profile.goals
  ].join(" ").toLowerCase();
  return Object.values(ROLE_ARCHETYPES).find(archetype => archetype.match.some(word => text.includes(word))) || ROLE_ARCHETYPES.specialist;
}

function weightedDimension(map, weights) {
  const raw = Object.entries(weights).reduce((sum, [code, weight]) => sum + pct(map, code) * weight, 0);
  return Number(clamp(4.2 + raw * .22, 4, 9.8).toFixed(1));
}

function professionalMethod(data) {
  const map = byCode(data);
  const archetype = detectRoleArchetype();
  const dimensions = {
    strategy: { label: "Estratégia e visão", benchmark: 8.2, score: weightedDimension(map, { G: .45, E: .35, D: .10, C: .10 }), analysis: "Lê contexto, define direção e antecipa impactos." },
    growth: { label: "Crescimento e negócio", benchmark: 8.0, score: weightedDimension(map, { E: .55, G: .25, C: .15, D: .05 }), analysis: "Converte energia em meta, ganho e evolução mensurável." },
    execution: { label: "Decisão e execução", benchmark: 8.0, score: weightedDimension(map, { C: .35, D: .30, E: .25, G: .10 }), analysis: "Decide, sustenta ritmo e remove obstáculos." },
    system: { label: "Gestão de sistema", benchmark: 7.8, score: weightedDimension(map, { G: .45, D: .25, E: .20, F: .10 }), analysis: "Organiza interdependências, prioriza e otimiza o todo." },
    people: { label: "Gestão de pessoas", benchmark: 8.0, score: weightedDimension(map, { F: .45, B: .25, G: .15, D: .10, E: .05 }), analysis: "Cuida de vínculos, escuta sinais e cria adesão humana." }
  };
  const roleScore = Object.entries(archetype.dimensionWeights).reduce((sum, [key, weight]) => sum + dimensions[key].score * 10 * weight, 0);
  const colorGap = Object.entries(archetype.ideal).reduce((sum, [code, ideal]) => sum + Math.abs(pct(map, code) - ideal), 0);
  const fit = Math.round(clamp((roleScore * .72) + ((100 - colorGap * 1.15) * .28), 35, 98));
  const fitLabel = fit >= 88 ? "Fit natural" : fit >= 76 ? "Fit forte com ajustes" : fit >= 64 ? "Fit promissor" : "Fit em construção";
  return { archetype, dimensions, fit, fitLabel };
}

function renderResults() {
  const data = totals();
  const ranked = [...data].sort((a, b) => b.points - a.points);
  const first = ranked[0], second = ranked[1], lowest = ranked[ranked.length - 1];
  const firstName = state.profile.name.split(" ")[0] || "Seu";
  $("result-title").textContent = `${firstName}, seu núcleo é ${first.name} + ${second.name}.`;
  $("result-summary").textContent = `${first.core} aparece como motor principal, apoiado por ${second.core.toLowerCase()}. Seu contexto como ${state.profile.roleArea} adiciona uma perspectiva importante a esta leitura.`;
  $("total-score").textContent = `${data.reduce((sum, item) => sum + item.points, 0)} pontos`;
  $("matrix-chart").innerHTML = data.map(item => `<div class="matrix-row">
    <div class="matrix-label"><span class="color-dot" style="--color:${item.hex}"></span>${item.name}</div>
    <div class="matrix-bar"><span style="--width:${item.percent}%;--color:${item.hex}"></span></div>
    <div class="matrix-value">${item.points}<small>${item.percent}%</small></div>
  </div>`).join("");
  renderRadar(data);
  renderAnalysis(ranked);
  renderProfessionalReport(data, ranked);
  $("level-details").innerHTML = ranked.map((item, index) => `<article class="level-card">
    <div class="level-head"><div class="level-name"><span class="color-dot" style="--color:${item.hex}"></span>${item.name}</div><strong>${item.percent}%</strong></div>
    <p>${item.description} ${index < 2 ? "Como nível dominante, tende a aparecer com frequência nas escolhas e no modo de trabalhar." : index === ranked.length - 1 ? "Como nível menos presente, pode indicar um canal que exige mais intenção consciente." : "Aparece como recurso complementar, ativado conforme o contexto."}</p>
  </article>`).join("");
  persist();
}

function renderDonut(data, title) {
  let offset = 0;
  const slices = data.map(item => {
    const value = item.percent;
    const dash = `${value} ${100 - value}`;
    const slice = `<circle r="15.915" cx="18" cy="18" fill="transparent" stroke="${item.hex}" stroke-width="7.5" stroke-dasharray="${dash}" stroke-dashoffset="${25 - offset}" />`;
    offset += value;
    return slice;
  }).join("");
  return `<svg viewBox="0 0 36 36" role="img" aria-label="${title}">${slices}<circle r="9" cx="18" cy="18" fill="#080d16"/><text x="18" y="17.1" text-anchor="middle">DNA</text><text x="18" y="21.3" text-anchor="middle">PRO</text></svg>`;
}

function colorLegend(data) {
  return data.map(item => `<li><span style="--color:${item.hex}"></span><strong>${item.name}</strong><em>${item.percent}%</em><small>${item.core}</small></li>`).join("");
}

function renderProfessionalReport(data, ranked) {
  const method = professionalMethod(data);
  const top = ranked[0], second = ranked[1], third = ranked[2], low = ranked[ranked.length - 1];
  const name = state.profile.name || "Profissional";
  const role = state.profile.roleArea || method.archetype.title;
  const flow = [
    { label: "Enxerga", text: `${top.name} aponta onde você começa: ${LEVEL_WORK_STYLE[top.code].gift.toLowerCase()}` },
    { label: "Conecta", text: `${second.name} mostra como você conecta prioridades, pessoas e recursos.` },
    { label: "Decide", text: `${third.name} vira recurso de decisão quando há pressão e ambiguidade.` },
    { label: "Posiciona", text: `Use o contexto informado para colocar energia no lugar de maior impacto.` },
    { label: "Escala", text: `Resultado sustentável vem quando ${top.name} não sufoca ${low.name}.` }
  ];
  const dimensionRows = Object.values(method.dimensions).map(item => {
    const status = item.score >= item.benchmark + .5 ? "Acima da média" : item.score >= item.benchmark - .4 ? "Aderente" : "Oportunidade";
    return `<tr><td>${item.label}</td><td><strong class="${status === "Oportunidade" ? "warn" : "good"}">${item.score}/10</strong></td><td>${item.benchmark.toFixed(1)}</td><td>${status}. ${item.analysis}</td></tr>`;
  }).join("");
  const insights = [
    { title: `Combo dominante: ${top.name} + ${second.name}`, text: `Essa dupla explica o modo como você naturalmente transforma intenção em comportamento profissional.` },
    { title: `Ponto cego provável: ${low.name}`, text: `${LEVEL_WORK_STYLE[low.code].lowRisk} A chave é tratar esse nível como prática estruturada, não como traço espontâneo.` },
    { title: `Match com a cadeira: ${method.archetype.title}`, text: `${method.archetype.sentence} O fit melhora quando suas responsabilidades reais exigem as dimensões mais bem pontuadas.` },
    { title: "Design thinking aplicado", text: "Observe uma situação, formule hipótese de comportamento, teste uma intervenção curta, colete feedback e ajuste o sistema." }
  ];

  $("professional-report").innerHTML = `
    <div class="pro-hero">
      <div>
        <span class="pro-kicker">Fit psicológico com a cadeira</span>
        <h2>${name}</h2>
        <p class="pro-role">${role}</p>
        <p>${method.archetype.sentence}</p>
      </div>
      <div class="fit-orb">
        <span>Fit com a cadeira</span>
        <strong>${method.fit}%</strong>
        <em>${method.fitLabel}</em>
      </div>
    </div>

    <div class="pro-summary">
      <p>Seu perfil combina <strong>${top.name}</strong>, <strong>${second.name}</strong> e <strong>${third.name}</strong>. Em termos profissionais, isso indica que sua performance tende a crescer quando a cadeira permite usar ${top.core.toLowerCase()}, apoiado por ${second.core.toLowerCase()}.</p>
    </div>

    <div class="pro-grid">
      <section class="pro-card pro-profile-card">
        <h3>Seu perfil na espiral</h3>
        <div class="pro-profile-layout">
          <div class="pro-donut">${renderDonut(data, "Seu perfil profissional na espiral")}</div>
          <ul class="pro-legend">${colorLegend(data)}</ul>
        </div>
      </section>
      <section class="pro-card">
        <h3>Leitura principal</h3>
        <p>Você atua como <strong>${method.archetype.label}</strong>. O valor dominante define o impulso inicial; o segundo valor mostra como você organiza esse impulso; o menor valor revela onde a cadeira pode exigir desenvolvimento consciente.</p>
      </section>
      <section class="pro-card pro-strength">
        <h3>Seus pontos fortes</h3>
        <ul>${[top, second, third].map(item => `<li><strong>${item.name}</strong><span>${LEVEL_WORK_STYLE[item.code].gift}</span></li>`).join("")}</ul>
      </section>
      <section class="pro-card pro-attention">
        <h3>Seu ponto de atenção</h3>
        <p><strong>${low.name} em menor presença</strong> pode aparecer como lacuna em situações que exigem ${low.core.toLowerCase()}.</p>
        <p><strong>O risco:</strong> ${LEVEL_WORK_STYLE[low.code].lowRisk}</p>
        <p><strong>A chave:</strong> ${LEVEL_WORK_STYLE[low.code].lever}</p>
      </section>
    </div>

    <section class="pro-flow">
      <h3>Como seu perfil gera resultado</h3>
      <div>${flow.map((item, index) => `<article><b>${index + 1}</b><strong>${item.label}</strong><p>${item.text}</p></article>`).join("")}</div>
      <p class="superpower">Seu superpoder: transformar padrão de valores em comportamento profissional observável.</p>
    </section>

    <div class="pro-lower-grid">
      <section class="pro-card">
        <h3>Avaliação por dimensão</h3>
        <table class="dimension-table"><thead><tr><th>Dimensão</th><th>Sua nota</th><th>Benchmark</th><th>Análise</th></tr></thead><tbody>${dimensionRows}</tbody></table>
      </section>
      <section class="pro-card pro-insights">
        <h3>Insights que poucos veem</h3>
        ${insights.map(item => `<article><strong>${item.title}</strong><p>${item.text}</p></article>`).join("")}
      </section>
    </div>

    <section class="pro-synthesis">
      <div>
        <h3>Síntese executiva</h3>
        <p>Você não é apenas a soma das cores. Você é o modo como essas forças aparecem diante da cadeira, da pressão, das pessoas e do resultado. A evolução profissional não está em mudar seu perfil, mas em aprender quando intensificar, dosar ou complementar cada valor.</p>
      </div>
      <div>
        <span>Fit</span>
        <strong>${method.fit}%</strong>
        <em>${method.archetype.label}</em>
      </div>
    </section>
  `;
}

function renderRadar(data) {
  const cx = 170, cy = 160, radius = 108;
  const point = (index, r) => {
    const angle = (-90 + index * 60) * Math.PI / 180;
    return `${cx + Math.cos(angle) * r},${cy + Math.sin(angle) * r}`;
  };
  const rings = [0.25, .5, .75, 1].map(scale => `<polygon points="${data.map((_, i) => point(i, radius * scale)).join(" ")}" fill="none" stroke="rgba(9,47,61,.11)" />`).join("");
  const axes = data.map((_, i) => `<line x1="${cx}" y1="${cy}" x2="${point(i, radius).split(",")[0]}" y2="${point(i, radius).split(",")[1]}" stroke="rgba(9,47,61,.09)" />`).join("");
  const shape = data.map((item, i) => point(i, radius * Math.min(item.percent / 35, 1))).join(" ");
  const labels = data.map((item, i) => {
    const [x, y] = point(i, radius + 25).split(",");
    return `<text x="${x}" y="${y}" text-anchor="middle" dominant-baseline="middle">${item.name}</text>`;
  }).join("");
  $("radar-chart").innerHTML = `<svg viewBox="0 0 340 320" role="img" aria-label="Gráfico radar da distribuição de valores">${rings}${axes}<polygon points="${shape}" fill="rgba(0,155,194,.18)" stroke="#08728e" stroke-width="2.5"/>${labels}</svg>`;
}

function renderAnalysis(ranked) {
  const [first, second, third] = ranked;
  const lowest = ranked[ranked.length - 1];
  const roleContext = state.profile.challenge ? ` Considerando seu desafio atual — ${state.profile.challenge} —, vale observar como esse motor aparece nas decisões reais.` : "";
  const cards = [
    { tag: "Leitura geral", title: `${first.name} como motor primário`, color: first.hex, text: `Seu perfil tende a operar primeiro por ${first.core.toLowerCase()}. ${first.description}${roleContext}` },
    { tag: "Combinação dominante", title: `${first.name} + ${second.name}`, color: second.hex, text: `Juntos, estes níveis somam ${first.percent + second.percent}% do perfil. A combinação une ${first.core.toLowerCase()} com ${second.core.toLowerCase()}, moldando seu estilo mais recorrente.` },
    { tag: "Recurso de apoio", title: `${third.name} entra conforme o contexto`, color: third.hex, text: `${third.name} aparece como terceira força. É um recurso disponível para sustentar as duas tendências dominantes quando a situação pede ${third.core.toLowerCase()}.` },
    { tag: "Ponto de desenvolvimento", title: `Ativar mais o ${lowest.name}`, color: lowest.hex, text: `O nível menos pontuado não é uma fraqueza, mas um canal menos espontâneo. Desenvolver ${lowest.core.toLowerCase()} pode ampliar seu repertório de liderança e decisão.` },
    { tag: "No trabalho", title: `Potência em ${state.profile.roleArea}`, color: first.hex, text: `Sua maior potência tende a surgir em ambientes que valorizam ${first.core.toLowerCase()} e permitem usar ${second.core.toLowerCase()} como complemento.` },
    { tag: "Atenção prática", title: "Equilibrar intenção e impacto", color: lowest.hex, text: `Sob pressão, os níveis dominantes podem ser usados em excesso. Antes de uma decisão importante, pergunte como alguém com ${lowest.name} alto enxergaria a mesma situação.` }
  ];
  $("analysis-cards").innerHTML = cards.map(card => `<article class="analysis-card" style="--card-color:${card.color}"><span>${card.tag}</span><h3>${card.title}</h3><p>${card.text}</p></article>`).join("");
}

$("profile-form").addEventListener("submit", (event) => {
  event.preventDefault();
  if (!validateIntroSlide()) return;
  captureProfile();
  $("header-person").textContent = state.profile.name;
  persist();
  renderQuestion();
  showScreen("quiz-screen");
});

$("profile-form").addEventListener("input", persist);

$("intro-next").addEventListener("click", () => {
  if (!validateIntroSlide()) return;
  captureProfile();
  state.introCurrent = Math.min(2, state.introCurrent + 1);
  renderIntro();
  persist();
});

$("intro-previous").addEventListener("click", () => {
  captureProfile();
  state.introCurrent = Math.max(0, state.introCurrent - 1);
  renderIntro();
  persist();
});

$("options-list").addEventListener("click", (event) => {
  const button = event.target.closest("button[data-code]");
  if (!button) return;
  const code = button.dataset.code;
  const delta = button.dataset.action === "plus" ? 1 : -1;
  updateScore(code, state.answers[state.current][code] + delta);
});

$("options-list").addEventListener("input", (event) => {
  if (!event.target.matches("input[data-code]")) return;
  const code = event.target.dataset.code;
  const value = Math.max(0, Math.min(12, Number(event.target.value) || 0));
  state.answers[state.current][code] = value;
  event.target.closest(".option-row").classList.toggle("has-value", value > 0);
  updatePoints();
  persist();
});

$("options-list").addEventListener("change", (event) => {
  if (!event.target.matches("input[data-code]")) return;
  event.target.value = state.answers[state.current][event.target.dataset.code];
});

$("previous-button").addEventListener("click", () => {
  if (state.current > 0) { state.current--; renderQuestion(); persist(); }
});

$("next-button").addEventListener("click", () => {
  if (blockTotal() !== 12) {
    $("validation-message").textContent = "Distribua exatamente 12 pontos antes de avançar.";
    $("question-card")?.classList.add("shake");
    return;
  }
  if (state.current < QUESTIONS.length - 1) {
    state.current++;
    renderQuestion();
    persist();
  } else {
    renderResults();
    showScreen("results-screen");
  }
});

$("save-exit").addEventListener("click", () => { persist(); showScreen("welcome-screen"); });
$("print-button").addEventListener("click", () => window.print());
$("restart-button").addEventListener("click", () => {
  if (!confirm("Deseja apagar as respostas e refazer o teste?")) return;
  localStorage.removeItem("totall-profile-map");
  state.current = 0;
  state.answers = QUESTIONS.map(() => Object.fromEntries(Object.keys(COLORS).map(key => [key, 0])));
  showScreen("welcome-screen");
});

restore();
renderIntro();
