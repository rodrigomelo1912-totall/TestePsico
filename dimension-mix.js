// Editorial readings of the existing statements; scores remain in the questionnaire model.
const DIMENSION_CONTEXTS = [
  {
    topic: "a imagem que você acredita transmitir às pessoas próximas",
    scene: "Pense em uma situação em que alguém descreveu seu jeito de agir de uma forma diferente daquela que você esperava.",
    question: "Qual dessas descrições apareceu no feedback recebido, e qual expressa mais a imagem que você gostaria de transmitir?",
    facets: {
      B: ["segurança nos vínculos e lealdade ao grupo", "A alternativa reúne proteção, referências compartilhadas e lealdade. Sua presença dá espaço à imagem de alguém ligado a pessoas e grupos de confiança."],
      C: ["independência para questionar e pensar por conta própria", "O destaque está na disposição de contrariar expectativas. Aqui, a frase fala de uma autoimagem questionadora; ela não mede a maneira como você conduz um conflito."],
      D: ["responsabilidade e coerência com as próprias convicções", "A referência é ser reconhecido pela estabilidade do posicionamento e pelos princípios que sustentam suas escolhas."],
      E: ["ambição, iniciativa e vontade de avançar", "O reconhecimento desejado se aproxima de alguém que busca progresso e mobiliza energia para realizar suas aspirações."],
      F: ["autenticidade e sensibilidade no contato com as pessoas", "A imagem valorizada inclui abertura emocional e atenção aos sentimentos. A frase aponta para como você imagina ser percebido nas relações."],
      G: ["liberdade para seguir critérios próprios", "Nesta pergunta, Amarelo está associado explicitamente a seguir as próprias regras. A leitura se concentra na autonomia declarada, sem deduzir visão sistêmica a partir dessa frase."]
    },
    pairs: {
      BG: "Pertencer sem perder a própria direção é o encontro central deste par. Os vínculos podem funcionar como referência de segurança, enquanto seguir critérios próprios introduz a necessidade de espaço individual. Vale observar como você comunica uma escolha que diverge da expectativa do seu grupo.",
      DF: "Ser coerente e ser sensível às pessoas aparecem como duas referências para a imagem que você transmite. Elas podem se apoiar quando um princípio orienta um cuidado concreto; podem exigir negociação quando manter a mesma regra produz efeitos diferentes para cada pessoa.",
      EG: "Iniciativa e independência compõem uma imagem de avanço por caminhos próprios. O ponto a explorar é o que pesa mais quando surge uma oportunidade: a possibilidade de realizar uma aspiração ou a liberdade de definir como agir."
    }
  },
  {
    topic: "o que torna um trabalho desejável para você",
    scene: "Imagine duas oportunidades: uma atende muito bem à preferência mais pontuada e a outra oferece mais espaço para as demais condições que você valorizou.",
    question: "Que condição você precisaria preservar para a escolha continuar fazendo sentido depois da novidade inicial?",
    facets: {
      B: ["segurança e convivência com pessoas semelhantes", "O atrativo do emprego inclui familiaridade e pertencimento. A previsibilidade das relações participa do valor atribuído ao trabalho."],
      C: ["ação e possibilidade de ganho rápido", "A alternativa aproxima dinamismo de retorno imediato. Ela destaca a intensidade e a recompensa da experiência, sem informar sua tolerância real a riscos."],
      D: ["estabilidade, organização e reconhecimento da confiança", "O emprego desejável oferece continuidade e critérios estáveis. Lealdade e confiança entram na expectativa de como a contribuição será reconhecida."],
      E: ["promoção e reconhecimento pelo desempenho", "O trabalho atrai pela possibilidade de progredir por mérito. Ter visibilidade sobre os caminhos de crescimento pode ser importante nessa preferência."],
      F: ["atenção às necessidades humanas e aos relacionamentos", "A qualidade das relações faz parte do que torna a atividade desejável. O emprego é avaliado também pela experiência de convivência que oferece."],
      G: ["liberdade para escolher interesses e métodos", "O atrativo está no espaço para trabalhar segundo critérios próprios. Autonomia faz parte da proposta de trabalho valorizada nesta resposta."]
    },
    pairs: {
      EG: "Crescer por mérito e ter liberdade de método são desejos próximos, mas distintos. Uma promoção com controle excessivo pode atender ao primeiro e frustrar o segundo; uma função muito livre, sem perspectiva de reconhecimento, pode produzir a combinação inversa.",
      BD: "Duas formas de segurança aparecem juntas: sentir-se entre pessoas de confiança e contar com um trabalho estável e organizado. A leitura sugere investigar tanto a previsibilidade das relações quanto a clareza dos acordos de trabalho.",
      EF: "Progressão e qualidade das relações participam do atrativo do emprego. Uma oportunidade pode ser interessante pelo reconhecimento que oferece e, ainda assim, deixar uma questão em aberto sobre a convivência cotidiana."
    }
  },
  {
    topic: "as condições em que você prefere receber orientação",
    scene: "Considere a chegada de uma liderança que muda a forma de acompanhar seu trabalho.",
    question: "Que acordo sobre acompanhamento, informação e liberdade tornaria essa orientação mais aceitável para você?",
    facets: {
      B: ["interesse pessoal de uma liderança com autoridade", "A frase combina direção firme com atenção individual. Ser orientado e sentir-se pessoalmente considerado aparecem na mesma alternativa."],
      C: ["autoridade com pouca interferência no cotidiano", "A escolha admite uma chefia autoritária, mas rejeita monitoramento constante. O limite entre receber direção e ser acompanhado de perto é central nesta frase."],
      D: ["justiça e consistência nas regras de gestão", "O sistema de orientação se torna mais aceitável quando seus critérios são previsíveis e aplicados de modo coerente."],
      E: ["controle sobre o próprio caminho e desafios relevantes", "A orientação desejada preserva protagonismo e oferece desafios em que suas habilidades possam ser usadas. Isso expressa uma preferência, não uma avaliação dessas habilidades."],
      F: ["consideração por necessidades e sentimentos individuais", "O modo de orientar importa tanto quanto a direção recebida. A alternativa valoriza uma atmosfera que responda às particularidades das pessoas."],
      G: ["acesso à informação e liberdade de execução", "A frase relaciona autonomia a informação disponível. Receber contexto suficiente pode ser parte do acordo que permite executar o trabalho à sua maneira."]
    },
    pairs: {
      DG: "Regras justas e liberdade de execução podem coexistir quando os limites estão claros e os métodos permanecem abertos. O ponto de negociação é distinguir o que precisa ser padronizado daquilo que pode ser decidido por quem executa.",
      BG: "Atenção pessoal da liderança e autonomia informada aparecem juntas. Uma hipótese é que proximidade seja bem-vinda quando oferece suporte, mas exija ajuste quando passa a determinar cada detalhe da execução.",
      EG: "As duas alternativas valorizam protagonismo: uma pelo desafio e pelo controle do caminho; outra pela informação e pela liberdade de método. O acordo a explorar é como manter responsabilidade pelos resultados sem transformar acompanhamento em interferência permanente."
    }
  },
  {
    topic: "o ambiente institucional em que você prefere trabalhar",
    scene: "Imagine que a instituição muda uma prática que era importante para você, mantendo as demais condições do trabalho.",
    question: "Qual mudança afetaria primeiro sua vontade de permanecer: a perda de uma condição central ou o acúmulo de pequenas concessões nas demais?",
    facets: {
      B: ["proteção e ausência de ameaça", "A instituição é valorizada como um lugar seguro. A frase concentra a atenção na experiência de estar protegido dentro do ambiente de trabalho."],
      C: ["ação, boa remuneração e pouca interferência", "O ambiente preferido combina intensidade e recompensa com espaço individual. Esses elementos pertencem a uma mesma alternativa e não podem ser separados pela pontuação."],
      D: ["organização, consistência e valorização da dedicação", "A instituição desejada reconhece continuidade e compromisso. A forma como ela sustenta seus acordos participa do sentido de um bom ambiente."],
      E: ["caminhos de promoção e incentivos ao crescimento", "A estrutura institucional atrai quando oferece possibilidades de avançar. O foco desta frase está nas oportunidades proporcionadas pelo ambiente."],
      F: ["bem-estar de colaboradores e clientes", "A preferência inclui os efeitos do trabalho sobre quem está dentro e fora da organização. A consideração pelas pessoas integra a avaliação do ambiente."],
      G: ["aceitação das particularidades individuais", "Aqui, a alternativa valoriza poder ser diferente sem receber crítica por isso. Seu conteúdo é de aceitação da individualidade, sem medir inovação ou competência."]
    },
    pairs: {
      BG: "Proteção e aceitação da individualidade formam uma expectativa de segurança com espaço para diferenças. Um ambiente pode parecer estável e, ainda assim, não atender ao desejo de ser aceito quando você foge de um padrão.",
      DE: "Uma instituição organizada e uma instituição que oferece crescimento podem ser a mesma, desde que a continuidade não feche os caminhos de progressão. A questão é como reconhecer dedicação sem tornar a evolução dependente apenas do tempo de permanência.",
      EF: "Oportunidades de promoção e cuidado com as pessoas dividem espaço na preferência por uma instituição. O encontro pede observar como ela distribui reconhecimento e quais efeitos essa dinâmica produz na convivência."
    }
  },
  {
    topic: "os critérios que você priorizou ao pensar no funcionamento da sociedade",
    scene: "Considere uma proposta coletiva que fortalece um dos critérios escolhidos, mas exige concessões em outro.",
    question: "Que consequência precisaria ser examinada antes de você considerar essa proposta desejável?",
    facets: {
      B: ["proteção por lideranças em tempos difíceis", "A alternativa coloca cuidado e amparo como referências para o funcionamento coletivo. A pontuação não permite inferir uma preferência partidária."],
      C: ["defesa dos próprios direitos e interesses imediatos", "A frase dá prioridade à capacidade de defender o que se considera seu e alcançar o que se deseja. Ela apresenta uma referência específica para a vida coletiva."],
      D: ["continuidade de princípios, justiça e respeito à lei", "O funcionamento social se apoia na preservação de referências consideradas fundamentais e na coerência das regras compartilhadas."],
      E: ["desenvolvimento do potencial e capacidade competitiva", "A alternativa enfatiza avanço coletivo e enfrentamento de problemas. O critério destacado é a capacidade de progredir enquanto sociedade."],
      F: ["bem-estar de todos como prioridade", "O critério de avaliação apresentado é o efeito sobre as pessoas. A frase coloca o bem-estar coletivo no primeiro plano da escolha."],
      G: ["interdependência e disposição para ceder interesses", "A alternativa relaciona a continuidade da vida a consequências que ultrapassam interesses imediatos. A leitura se refere a esse critério declarado, não a uma posição política presumida."]
    },
    pairs: {
      EG: "Desenvolvimento e interdependência colocam lado a lado a vontade de avançar e a atenção aos efeitos mais amplos desse avanço. Uma proposta atraente pelo ganho competitivo pode precisar ser reconsiderada à luz das consequências para o conjunto.",
      BF: "Proteção em momentos difíceis e bem-estar de todos convergem no cuidado, mas diferem no foco: uma alternativa destaca quem oferece amparo; a outra, quem deve ser beneficiado. Isso permite perguntar como proteção e alcance do cuidado se relacionam.",
      DG: "Continuidade de princípios e adaptação às interdependências podem se apoiar quando as regras acompanham seus efeitos reais. A tensão a investigar surge quando preservar um costume entra em conflito com consequências mais amplas."
    }
  },
  {
    topic: "o que torna uma regra legítima e útil para você",
    scene: "Imagine uma regra que protege pessoas e dá previsibilidade, mas dificulta uma solução que parece mais adequada a um caso particular.",
    question: "O que justificaria manter a regra, propor sua revisão ou admitir uma exceção, e quem precisaria participar dessa decisão?",
    facets: {
      B: ["proteção e clareza sobre o que se espera de cada pessoa", "A regra aparece como amparo e referência compartilhada. Aderir a ela pode fazer sentido pelo que protege e pela orientação que oferece."],
      C: ["questionamento de quem é favorecido ou punido pela regra", "A alternativa expressa desconfiança sobre a neutralidade das normas. Ela convida a examinar a distribuição de poder e interesses, sem provar um comportamento de confronto."],
      D: ["estabilidade, disciplina e ordem", "A regra recebe valor por sustentar previsibilidade e continuidade. A frase enfatiza a existência de critérios consistentes mesmo quando o caso particular pressiona por mudança."],
      E: ["progresso diante de limites percebidos como obstáculos", "A frase sobre ‘burlar’ regras tensiona o avanço com os limites existentes. A pontuação registra identificação relativa com essa afirmação; ela não demonstra infração. O ponto de reflexão é distinguir revisão de um procedimento e desconsideração de uma obrigação."],
      F: ["benefício coletivo e aplicação humana", "A norma é avaliada tanto por quem beneficia quanto pela maneira como é aplicada. Seguir o procedimento, por si só, não esgota o critério apresentado nesta alternativa."],
      G: ["funcionalidade e responsabilidade pessoal", "A regra aparece como orientação para agir com responsabilidade. Sua utilidade importa, assim como o espaço que deixa para avaliar o contexto e responder pela própria escolha."]
    },
    pairs: {
      BG: "Proteção e responsabilidade pessoal se encontram na ideia de uma regra que ampara sem substituir o julgamento de quem age. Você deu espaço tanto a saber o que é esperado quanto a usar a norma como orientação funcional. Uma hipótese é que faça sentido preservar o propósito protetor, mas discutir a aplicação quando o procedimento deixa de servir ao caso.",
      DE: "Ordem e progresso criam uma negociação concreta sobre os limites da mudança. Azul dá peso à estabilidade oferecida pela norma; Laranja abre espaço à percepção de que ela pode atrapalhar o avanço. O ponto decisivo é como diferenciar uma melhoria legítima do procedimento de uma exceção conveniente apenas para quem a solicita.",
      DF: "Consistência e aplicação humana pedem que a mesma regra seja examinada por dois critérios: sua coerência e seus efeitos sobre as pessoas. A tensão não se resolve apenas escolhendo rigidez ou flexibilidade; ela pode exigir critérios claros para tratar diferenças sem produzir arbitrariedade.",
      EG: "As duas alternativas colocam a utilidade da regra em discussão, mas por razões distintas: Laranja pelo progresso que o limite pode impedir, Amarelo pela responsabilidade que uma orientação deveria promover. O encontro convida a perguntar se a mudança melhora o funcionamento do conjunto ou apenas facilita um objetivo imediato."
    }
  },
  {
    topic: "as referências escolhidas para lidar com as exigências da vida",
    scene: "Retome uma dificuldade recente em que você precisou encontrar uma forma de seguir adiante.",
    question: "Que recurso você buscou primeiro e qual dos outros critérios pontuados poderia ter ajudado naquela situação?",
    facets: {
      B: ["apoio de alguém ou de um grupo que cuide de você", "A resposta valoriza poder contar com uma base de cuidado. Buscar apoio aparece como uma referência para enfrentar a vida, sem permitir concluir dependência."],
      C: ["força própria para se proteger e alcançar o que deseja", "A alternativa coloca a capacidade de cuidar de si no centro da resposta. Seu foco é contar com recursos próprios para enfrentar o que acontece."],
      D: ["fidelidade às crenças e ao que considera correto", "O sentido de continuar vem da coerência com convicções. A frase inclui a expectativa de uma recompensa por sustentar essa direção."],
      E: ["negociação com as circunstâncias para aproveitar a vida", "A referência é encontrar formas de lidar com o mundo que ampliem as possibilidades de viver bem. A alternativa dá espaço à busca de oportunidades nas condições existentes."],
      F: ["paz interior e nas relações", "A resposta busca uma forma de viver que considere a relação consigo e com os outros. Ela não mede a presença ou ausência de sofrimento emocional."],
      G: ["aceitação do inevitável e menor rigidez", "A frase enfatiza reconhecer o que não pode ser controlado. O recurso apresentado é mudar a relação com a circunstância, sem concluir passividade ou serenidade permanente."]
    },
    pairs: {
      BC: "Contar com apoio e contar com a própria força aparecem como recursos simultaneamente valorizados. A questão prática é reconhecer quando pedir ajuda fortalece sua autonomia e quando agir por conta própria atende melhor à situação.",
      EG: "Negociar com o mundo e aceitar o inevitável se encontram na distinção entre o que pode ser transformado e o que exige adaptação. As duas referências podem orientar momentos diferentes de uma mesma dificuldade.",
      DF: "Coerência com crenças e busca de paz podem se apoiar quando agir conforme uma convicção reduz um conflito. Podem exigir reflexão quando manter uma exigência pessoal torna mais difícil conviver consigo ou com outras pessoas."
    }
  },
  {
    topic: "a forma como você descreve a vida e suas possibilidades",
    scene: "Pense em uma mudança importante cujo resultado ainda não estava claro quando ela começou.",
    question: "Que aspecto você percebeu primeiro: o que precisava preservar, a oportunidade aberta ou a necessidade de compreender as novas condições?",
    facets: {
      B: ["segurança diante do mistério e da incerteza", "A vida descrita pela alternativa mistura apreensão e possibilidade de desfrutar quando há segurança. A pontuação se refere a essa representação, sem diagnosticar ansiedade."],
      C: ["sobrevivência e poder em um ambiente competitivo", "A metáfora da selva apresenta a vida como disputa. Dar pontos a ela não informa como você trata as pessoas; indica espaço dado a essa explicação do mundo."],
      D: ["leis e princípios que oferecem direção", "O mundo é descrito como organizado por referências que mostram como agir. A alternativa valoriza uma explicação estável para acontecimentos e escolhas."],
      E: ["oportunidades de progredir e viver melhor", "A vida é apresentada como campo de possibilidades para quem busca avanço. O foco está na expectativa de que esforço e iniciativa encontrem oportunidades."],
      F: ["experiência humana compartilhada", "A alternativa dá sentido à vida pela exploração do que é ser humano e pela conexão com a experiência das outras pessoas."],
      G: ["diversidade, interdependência e mudança", "A vida é descrita como um sistema de relações entre pessoas, natureza e acontecimentos. Mudança aparece como parte dessa descrição, não apenas como exceção."]
    },
    pairs: {
      EG: "Oportunidade e mudança compõem uma visão em que avançar depende também de compreender as condições ao redor. Uma possibilidade é perceber caminhos de progresso sem supor que o cenário permanecerá estável.",
      BD: "Segurança e princípios oferecem duas referências diante da incerteza: uma ligada a sentir-se protegido, outra a encontrar direção no modo como o mundo funciona. Vale investigar qual delas faz mais diferença quando uma mudança desafia suas expectativas.",
      FG: "A experiência humana e as relações entre partes do sistema ampliam o olhar por caminhos diferentes. Uma perspectiva aproxima a experiência de outras pessoas; a outra situa essas experiências num contexto de mudanças e interdependências."
    }
  },
  {
    topic: "o significado que o dinheiro assume nas suas escolhas",
    scene: "Imagine ter de escolher o destino de um recurso limitado entre necessidades atuais, reserva futura e uma possibilidade pessoal importante.",
    question: "Que uso atenderia melhor ao motivo mais pontuado, e qual outro motivo você sentiria falta de contemplar?",
    facets: {
      B: ["cobertura das necessidades básicas", "O dinheiro é valorizado pelo amparo material imediato, como alimentação e moradia. A resposta fala de sua função, sem revelar renda ou situação financeira."],
      C: ["poder de compra e afirmação pessoal", "A alternativa relaciona comprar o que se quer a sentir-se alguém. O significado apresentado vai além do objeto adquirido e inclui a experiência de afirmação."],
      D: ["continuidade do padrão de vida e segurança futura", "O dinheiro aparece como instrumento de previsibilidade ao longo do tempo. Preservar condições de vida participa do motivo para valorizá-lo."],
      E: ["reconhecimento do sucesso e acesso a boas experiências", "A alternativa associa dinheiro a uma evidência de realização e à possibilidade de usufruir do que foi conquistado."],
      F: ["atendimento às próprias necessidades e às de outras pessoas", "O uso do dinheiro inclui cuidado compartilhado. A frase atribui importância ao que os recursos permitem atender nas relações."],
      G: ["liberdade de identidade e de escolha", "O recurso material é valorizado por ampliar possibilidades de ser e fazer. A autonomia que ele viabiliza importa para além do acúmulo em si."]
    },
    pairs: {
      DG: "Segurança futura e liberdade colocam o dinheiro entre preservar possibilidades e exercê-las. Uma reserva pode ampliar sua autonomia; ao mesmo tempo, preservar recursos indefinidamente pode adiar escolhas pelas quais você os valoriza.",
      EG: "Realização e liberdade dão dois sentidos à mesma conquista material: reconhecer o que foi alcançado e abrir espaço para novos caminhos. A pergunta é se um uso do dinheiro atende ao reconhecimento desejado, à autonomia ou aos dois.",
      BF: "Necessidades básicas e cuidado compartilhado aproximam proteção material e relações. O contraste a explorar é como distribuir recursos entre garantir sua própria base e atender necessidades de pessoas importantes para você."
    }
  },
  {
    topic: "os critérios que você declarou usar para decidir",
    scene: "Retome uma decisão em que a alternativa mais atraente por um critério parecia menos adequada por outro.",
    question: "O que fez a escolha parecer justificável, e qual consequência você precisou aceitar para priorizar esse critério?",
    facets: {
      B: ["sinais e avisos interpretados como favoráveis", "Nesta pergunta, Púrpura corresponde especificamente à atenção a prognósticos e avisos. A leitura deve acompanhar esse conteúdo, sem substituí-lo automaticamente por lealdade ao grupo."],
      C: ["ganho imediato e receio de perder a oportunidade", "A frase associa decidir ao que pode ser obtido agora e à possibilidade de outra pessoa tomar a dianteira. O componente temporal faz parte dessa referência."],
      D: ["coerência com padrões e com o que considera certo", "O critério declarado avalia se a decisão pode ser sustentada pelas referências que orientam seu modo de viver."],
      E: ["ganho material e reconhecimento pessoal", "A alternativa avalia a decisão pelos retornos esperados para si. A pontuação indica o peso dado a esses retornos nesta pergunta, sem comprovar o resultado de decisões reais."],
      F: ["efeitos sobre o bem-estar de outras pessoas", "O impacto humano entra explicitamente na avaliação da escolha. A resposta dá espaço às consequências para quem será afetado."],
      G: ["efeitos sobre o conjunto e sobre a liberdade", "A alternativa amplia a avaliação para o sistema de vida e a liberdade de existir. A leitura se refere a essa abrangência declarada do critério de decisão."]
    },
    pairs: {
      DE: "Coerência e retorno pessoal oferecem dois testes para uma escolha: ela faz sentido diante dos seus princípios e traz o resultado que você busca? A tensão fica concreta quando uma oportunidade atraente exige uma concessão que você tem dificuldade de justificar.",
      EF: "Retorno pessoal e efeitos sobre outras pessoas dividem espaço na decisão. Eles podem convergir, mas o mix convida a examinar como você pondera uma opção vantajosa para si quando ela impõe um custo a alguém.",
      FG: "O cuidado com pessoas afetadas e a atenção ao conjunto trabalham em escalas diferentes. Uma escolha pode beneficiar alguém de imediato e produzir efeitos mais amplos que também merecem exame; o encontro das duas referências permite formular essa pergunta."
    }
  }
];

function dimensionMixAnalysis(profile, index) {
  const block = profile.blocks[index];
  const context = DIMENSION_CONTEXTS[index];
  const codes = profile.colors.map(color => color.code);
  const points = code => block.answer[code];
  const name = code => COLORS[code].name;
  const label = code => `${name(code)} (${points(code)}/12; ${formatPercent(points(code) / 12 * 100)}%)`;
  const ranked = codes.filter(code => points(code) > 0).sort((a, b) => points(b) - points(a));
  const highest = Math.max(...codes.map(points));
  const top = ranked.filter(code => points(code) === highest);
  const others = ranked.filter(code => points(code) < highest);
  const absent = codes.filter(code => !points(code));
  const names = group => group.map(name).join(" + ");
  const describe = group => group.map(code => `${label(code)} coloca em pauta ${context.facets[code][0]}. ${context.facets[code][1]}`).join(" ");
  const statement = code => QUESTIONS[index].options.find(option => option[0] === code)[1];
  const paragraphs = [];

  if (top.length === 6) {
    paragraphs.push(`Em “${block.label}”, as seis cores receberam 2/12 pontos cada (${formatPercent(2 / 12 * 100)}%). Ao considerar ${context.topic}, você distribuiu a mesma prioridade entre todas as alternativas. A pontuação não permite destacar um critério principal: a questão de interpretação está em como você escolheria entre essas referências quando elas apontassem para caminhos diferentes.`);
    paragraphs.push(describe(top.slice(0, 3)), describe(top.slice(3)));
    paragraphs.push(`O contraste específico deste tema aparece entre ${context.facets.B[0]} e ${context.facets.G[0]}, assim como entre ${context.facets.D[0]} e ${context.facets.E[0]}. Esses contrastes são exemplos entre perspectivas igualmente pontuadas, sem prioridade especial para esses pares. A igualdade pode corresponder a identificar-se com todas as frases ou a depender muito da situação para escolher; só a pontuação não distingue essas possibilidades.`);
  } else {
    const opening = top.length > 1
      ? `${names(top)} compartilham a maior pontuação, com ${highest}/12 pontos cada (${formatPercent(highest / 12 * 100)}% por cor). Não há uma liderança isolada.`
      : `${name(top[0])} recebeu ${highest}/12 pontos (${formatPercent(highest / 12 * 100)}%). ${highest === 12 ? "Toda a pontuação ficou nesta alternativa." : highest > 6 ? "Esta alternativa reúne mais da metade dos pontos deste bloco." : "É a maior pontuação individual do bloco, mas não ultrapassa metade dos pontos disponíveis."}`;
    paragraphs.push(`Em “${block.label}”, o seu mix descreve ${context.topic}. ${opening} A leitura central ${top.length > 1 ? "reúne" : "destaca"} ${top.map(code => context.facets[code][0]).join(" e ")}. Isso oferece uma hipótese sobre o que ganha relevância para você neste tema, a conferir com a situação que tinha em mente ao responder.`);
    paragraphs.push(describe(top));

    const next = others.filter(code => points(code) === points(others[0]));
    const core = top.length === 1 ? [...top, ...next] : top;
    if (core.length === 2) {
      const [a, b] = core;
      const pair = context.pairs[[a, b].sort().join("")];
      const total = points(a) + points(b);
      const relation = points(a) === points(b)
        ? "As duas referências têm o mesmo peso neste bloco; nenhuma deve ser apresentada como acessória à outra."
        : `A diferença é de ${points(a) - points(b)} pontos a favor de ${name(a)}. ${name(b)} recebeu espaço, mas não na mesma proporção.`;
      paragraphs.push(`${names(core)} somam ${total}/12 pontos (${formatPercent(total / 12 * 100)}%) nesta dimensão. ${relation} ${pair || `Ao pensar em ${context.topic}, o encontro coloca lado a lado ${context.facets[a][0]} e ${context.facets[b][0]}. Uma forma concreta de explorar essa combinação é perguntar se uma escolha que atende ao primeiro critério também preserva o segundo. Caso não preserve, o mix aponta quais referências você declarou valorizar, mas não determina qual concessão faria numa situação real.`}`);
    } else if (core.length > 2) {
      paragraphs.push(`O núcleo mais pontuado envolve ${names(core)}. ${top.length > 1 ? "O empate inclui todas essas referências no mesmo nível de prioridade." : `Depois de ${name(top[0])}, ${names(next)} estão empatadas; escolher apenas uma delas como ‘segunda cor’ esconderia parte do resultado.`} Para este tema, a combinação reúne ${core.map(code => context.facets[code][0]).join("; ")}. Uma escolha pode contemplar parte desses critérios e deixar outros sem resposta. Por isso, a leitura mais útil é examinar que condição cada um acrescenta à decisão, em vez de presumir que todos apontam sempre na mesma direção.`);
    }

    if (others.length) {
      for (let offset = 0; offset < others.length; offset += 2) {
        paragraphs.push(`${offset === 0 ? "As outras prioridades ajudam a qualificar essa leitura." : "Com menor pontuação, outras referências também participam do mix."} ${describe(others.slice(offset, offset + 2))}`);
      }
      if (top.length > 1 && next.length === 2) {
        const secondaryPair = context.pairs[[...next].sort().join("")];
        if (secondaryPair) paragraphs.push(`Além do núcleo principal, ${names(next)} receberam ${points(next[0])}/12 pontos cada. ${secondaryPair} Essa relação acrescenta uma pergunta ao mix, sem substituir o maior peso dado a ${names(top)}.`);
      }
    } else if (ranked.length === 1) {
      paragraphs.push(`A afirmação selecionada foi: “${statement(top[0])}”. Como ela recebeu os 12 pontos, este bloco não oferece evidência de uma combinação entre cores. A leitura se concentra no motivo expresso pela frase: ${context.facets[top[0]][0]}. É possível que esse motivo tenha sido especialmente importante na situação imaginada ou que a formulação das outras alternativas não tenha representado o que você queria dizer. A concentração registra a escolha; não resolve sozinha essa diferença.`);
    }
    if (absent.length) paragraphs.push(`${names(absent)} ficaram sem pontos nesta dimensão. As alternativas correspondem a ${absent.map(code => context.facets[code][0]).join("; ")}. Elas ficaram fora da distribuição desta pergunta. Isso ajuda a delimitar o que o mix efetivamente sustenta, sem concluir que esses critérios nunca participem da sua vida.`);
  }

  paragraphs.push(`${context.scene} À luz dos seus pontos, ${top.length === 6 ? "não há uma preferência numérica para resolver esse contraste" : `vale começar examinando ${top.map(code => context.facets[code][0]).join(" e ")}`}. ${context.question} A resposta a essa pergunta pode revelar a condição em que suas prioridades se apoiam e aquela em que passam a competir. Trata-se de uma aplicação possível do mix, não de um comportamento que o questionário tenha observado.`);
  paragraphs.push(`Para tornar esta síntese pessoal, retome uma experiência ligada a “${block.label}” e confronte-a com ${top.length === 1 ? `a frase mais pontuada: “${statement(top[0])}”` : "as frases empatadas na maior pontuação"}. Identifique o que você procurou preservar, qual outro critério considerou e qual consequência aceitou. Se a experiência não corresponder à leitura, esse contraste é informação útil: ele pode mostrar que uma palavra da alternativa teve um sentido particular para você. O resultado descreve os pontos distribuídos por uma pessoa entre seis afirmações; as interpretações são hipóteses sobre essas escolhas.`);
  return paragraphs;
}
