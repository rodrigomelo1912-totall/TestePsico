// Interpretations are editorial hypotheses; all numerical evidence comes from the ten blocks.
const SPIRAL_CONTENT = {
  B: { focus: "Pertencimento e proteção", meaning: "A segurança é buscada nos vínculos, nas tradições e na continuidade do grupo.", resource: "Atenção aos laços e às referências compartilhadas.", question: "Quando preservar um vínculo ajuda uma escolha e quando limita minha autonomia?" },
  C: { focus: "Afirmação e iniciativa", meaning: "A vontade própria, a força para agir e a resposta imediata ganham importância.", resource: "Disposição para se posicionar e enfrentar obstáculos.", question: "Como expresso minha vontade sem deixar de considerar as consequências?" },
  D: { focus: "Ordem e princípios", meaning: "Coerência, regras e senso de dever oferecem uma referência para decidir.", resource: "Compromisso com critérios e continuidade.", question: "Quais princípios quero preservar e quais regras fazem sentido rever?" },
  E: { focus: "Conquista e progresso", meaning: "Oportunidades, escolhas racionais e realização pessoal orientam a busca por avanço.", resource: "Mobilização para alcançar objetivos e aprender com resultados.", question: "O que considero realização, além de reconhecimento e conquista?" },
  F: { focus: "Empatia e reciprocidade", meaning: "A experiência do outro, a participação e o cuidado com as relações recebem atenção.", resource: "Abertura para escutar e incluir diferentes vozes.", question: "Como concilio consideração pelo outro com meus limites e escolhas?" },
  G: { focus: "Integração e flexibilidade", meaning: "A leitura das relações entre as partes e a adaptação ao contexto orientam a compreensão.", resource: "Consideração de perspectivas e consequências interligadas.", question: "Como transformo uma compreensão ampla em uma escolha concreta?" }
};

const BLOCK_LABELS = ["Autoimagem", "Preferências de trabalho", "Relação com orientação", "Ambiente preferido", "Visão de sociedade", "Regras e limites", "Maneira de viver", "Visão de vida", "Significado do dinheiro", "Critérios de decisão"];

const COLOR_PAIRS = {
  BC: ["Vínculo e afirmação", "O desejo de preservar vínculos pode se combinar com a vontade de se posicionar.", "Como mantenho minha voz quando ela difere da expectativa do grupo?"],
  BD: ["Pertencimento e princípios", "Referências compartilhadas e critérios estáveis podem oferecer duas formas de segurança.", "Minha escolha segue uma convicção pessoal ou uma expectativa herdada?"],
  BE: ["Raízes e conquista", "A busca de realização pode conviver com a importância de manter laços e referências.", "Quando avançar parece exigir distância de algo a que pertenço?"],
  BF: ["Laços e acolhimento", "O cuidado com os vínculos próximos pode encontrar a abertura para incluir outras pessoas.", "Meu cuidado alcança também quem está fora do meu círculo habitual?"],
  BG: ["Continuidade e novas perspectivas", "A preservação de referências pode coexistir com o interesse em compreender outros contextos.", "O que posso reconsiderar sem perder o sentido de pertencimento?"],
  CD: ["Impulso e critério", "A disposição para agir pode encontrar apoio ou limite em princípios e regras.", "Em que situações a urgência entra em tensão com o que considero correto?"],
  CE: ["Iniciativa e realização", "A afirmação da vontade pode se juntar à busca de conquistas e oportunidades.", "Como diferencio uma resposta imediata de uma escolha que sustenta meus objetivos?"],
  CF: ["Posicionamento e consideração", "A expressão da própria vontade pode coexistir com a preocupação com a experiência do outro.", "Consigo ser direto sem deixar de escutar, e escutar sem abandonar meus limites?"],
  CG: ["Ação e perspectiva", "O impulso para agir pode ser acompanhado de atenção a efeitos e interdependências.", "O que preciso compreender antes de agir e o que só aprenderei ao agir?"],
  DE: ["Consistência e progresso", "Critérios estáveis podem dar continuidade à busca de objetivos, enquanto novas possibilidades desafiam regras existentes.", "Quando uma regra sustenta meu avanço e quando merece ser revista?"],
  DF: ["Princípios e sensibilidade", "O compromisso com critérios pode conviver com atenção às particularidades das pessoas.", "Como aplico um princípio de maneira coerente sem ignorar uma situação singular?"],
  DG: ["Estrutura e adaptação", "A necessidade de referências claras pode se combinar com a leitura flexível do contexto.", "Que parte de uma escolha pede consistência e que parte pede adaptação?"],
  EF: ["Realização e relações", "Objetivos pessoais e consideração pelas pessoas podem participar da mesma escolha.", "Como reconheço os efeitos de uma conquista sobre mim e sobre minhas relações?"],
  EG: ["Objetivos e interdependências", "A busca de avanço pode incorporar uma leitura das conexões e dos efeitos de cada alternativa.", "Qual objetivo estou perseguindo e que consequências indiretas preciso considerar?"],
  FG: ["Escuta e integração", "A atenção às experiências humanas pode se combinar com a compreensão de diferentes perspectivas.", "Como acolho uma experiência individual ao considerar um contexto mais amplo?"]
};

const formatPercent = value => value.toLocaleString("pt-BR", { maximumFractionDigits: 1 });
const colorNames = items => items.map(item => item.name).join(" + ");

function buildSpiralProfile(answers) {
  const codes = Object.keys(COLORS);
  if (!Array.isArray(answers) || answers.length !== QUESTIONS.length || answers.some(answer =>
    !answer || codes.some(code => !Number.isInteger(answer[code]) || answer[code] < 0 || answer[code] > 12) ||
    codes.reduce((sum, code) => sum + answer[code], 0) !== 12)) {
    throw new Error("Complete os dez blocos com exatamente 12 pontos inteiros em cada um.");
  }
  const blocks = answers.map((answer, index) => {
    const peak = Math.max(...codes.map(code => answer[code]));
    return { index, label: BLOCK_LABELS[index], answer: { ...answer }, leaders: codes.filter(code => answer[code] === peak), peak };
  });
  const colors = codes.map(code => {
    const points = answers.reduce((sum, answer) => sum + answer[code], 0);
    const scores = answers.map(answer => answer[code]);
    return { code, ...COLORS[code], ...SPIRAL_CONTENT[code], points, percent: points / 120 * 100,
      present: scores.filter(value => value > 0).length,
      leading: blocks.filter(block => block.leaders.includes(code)).length,
      soleLeading: blocks.filter(block => block.leaders.length === 1 && block.leaders[0] === code).length,
      min: Math.min(...scores), max: Math.max(...scores),
      peaks: blocks.filter(block => answerAt(block, code) === Math.max(...scores)).map(block => block.index)
    };
  });
  const ranked = [...colors].sort((a, b) => b.points - a.points);
  return { colors, ranked, blocks, total: 120,
    highest: colors.filter(color => color.points === ranked[0].points),
    lowest: colors.filter(color => color.points === ranked[5].points),
    uniform: ranked[0].points === ranked[5].points,
    uniqueLeaders: [...new Set(blocks.filter(block => block.leaders.length === 1).map(block => block.leaders[0]))]
  };
}

function answerAt(block, code) { return block.answer[code]; }

function describeDistribution(profile) {
  if (profile.uniform) return "As seis cores somam 20 pontos cada. Não há uma cor predominante no total. Os blocos mostram se essa distribuição se repete ou se resulta de preferências diferentes em cada tema.";
  if (profile.highest.length > 1) return `${colorNames(profile.highest)} estão empatados na maior pontuação, com ${profile.highest[0].points} pontos cada. A leitura considera essa coexistência, sem escolher artificialmente uma cor principal.`;
  const first = profile.highest[0];
  return `${first.name} reúne ${first.points} de 120 pontos (${formatPercent(first.percent)}%). ${first.meaning} Essa é uma hipótese de leitura das prioridades expressas nas respostas, não uma descrição definitiva de quem você é.`;
}

function buildColorPair(profile, a, b) {
  if (a === b || !COLORS[a] || !COLORS[b]) throw new Error("Selecione duas cores diferentes.");
  const first = profile.colors.find(item => item.code === a);
  const second = profile.colors.find(item => item.code === b);
  const key = [a, b].sort().join("");
  const [title, hypothesis, question] = COLOR_PAIRS[key];
  const together = profile.blocks.filter(block => block.answer[a] > 0 && block.answer[b] > 0).length;
  const points = first.points + second.points;
  const supported = first.points > 0 && second.points > 0;
  return { first, second, title, question, together, points, percent: points / profile.total * 100, supported,
    hypothesis: supported ? hypothesis : "Uma ou ambas as cores não receberam pontos. As respostas não sustentam interpretar uma combinação ativa deste par.",
    balance: first.points === second.points ? "As duas cores têm a mesma pontuação total." : `${first.points > second.points ? first.name : second.name} recebeu ${Math.abs(first.points - second.points)} pontos a mais neste par. Isso não significa maior valor pessoal.`
  };
}
