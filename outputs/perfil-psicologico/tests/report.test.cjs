const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

function app() {
  const nodes = new Map();
  const context = vm.createContext({
    document: { querySelectorAll: () => [], getElementById(id) {
      if (!nodes.has(id)) nodes.set(id, { innerHTML: '', textContent: '', addEventListener() {} });
      return nodes.get(id);
    } }
  });
  vm.runInContext(fs.readFileSync(path.join(__dirname, '../spiral.js'), 'utf8'), context);
  vm.runInContext(fs.readFileSync(path.join(__dirname, '../dimension-mix.js'), 'utf8'), context);
  vm.runInContext(fs.readFileSync(path.join(__dirname, '../deep-themes.js'), 'utf8'), context);
  vm.runInContext(fs.readFileSync(path.join(__dirname, '../deep-dive.js'), 'utf8'), context);
  vm.runInContext(fs.readFileSync(path.join(__dirname, '../report.js'), 'utf8'), context);
  const source = fs.readFileSync(path.join(__dirname, '../app.js'), 'utf8');
  vm.runInContext(source.slice(0, source.indexOf('$("profile-form").addEventListener')), context);
  vm.runInContext('updateMotion = () => {};', context);
  return { run: code => vm.runInContext(code, context), nodes };
}

test('deep dive covers all fifteen pairs with distinct color and mix readings for eight themes', () => {
  const { run } = app();
  assert.equal(run('Object.keys(DEEP_PAIRS).length'), 15);
  for (const pair of ['BC','BD','BE','BF','BG','CD','CE','CF','CG','DE','DF','DG','EF','EG','FG']) {
    run(`var answers = QUESTIONS.map(() => Object.fromEntries(Object.keys(COLORS).map(code => [code, '${pair}'.includes(code) ? 6 : 0]))); var dive = buildDeepDive(buildSpiralProfile(answers));`);
    assert.equal(run('dive.topics.length'), 8, pair);
    assert.equal(run('dive.total'), 120);
    assert.equal(run('dive.options.length'), 1);
    assert.equal(run('new Set(dive.topics.map(t => t.id)).size'), 8);
    assert.equal(run('dive.topics.every(t => t.parts.every(p => p.length === 2 && p.every(text => typeof text === "string" && text.length > 0)))'), true);
    assert.equal(run('dive.topics.every(t => t.reading.lenses.length === 2 && t.reading.keywords.length === 2 && t.reading.mix.length === 3)'), true);
    assert.equal(run('new Set(dive.topics.map(t => t.reading.lenses[0].text)).size'), 8);
    assert.equal(run('dive.topics.find(t => t.figures).figures.length'), 2);
    assert.doesNotMatch(run('JSON.stringify(dive)'), /undefined|NaN/);
  }
});

test('deep dive preserves top ties and second-place ties without inventing a winner', () => {
  const { run } = app();
  run('var profile = buildSpiralProfile(QUESTIONS.map(() => ({B:2,C:2,D:2,E:2,F:2,G:2})))');
  assert.equal(run('buildDeepDive(profile).options.length'), 15);
  assert.equal(run('buildDeepDive(profile).ambiguous'), true);
  run('var profile = buildSpiralProfile(QUESTIONS.map(() => ({B:1,C:1,D:3,E:4,F:0,G:3})))');
  assert.equal(run('deepDiveOptions(profile).map(pair => pair.join("")).join(",")'), 'ED,EG');
  assert.equal(run('buildDeepDive(profile,["E","G"]).names'), 'Laranja + Amarelo');
  assert.throws(() => run('buildDeepDive(profile,["B","C"])'));
});

test('single-color concentration never adds an unsupported second color', () => {
  const { run } = app();
  for (const code of 'BCDEFG') {
    run(`var profile = buildSpiralProfile(QUESTIONS.map(() => Object.fromEntries(Object.keys(COLORS).map(c => [c,c === '${code}' ? 12 : 0])))); var dive = buildDeepDive(profile);`);
    assert.equal(run('dive.colors.length'), 1);
    assert.equal(run('dive.topics.length'), 8);
    assert.match(run('dive.balance'), /Não há uma segunda cor/);
    assert.doesNotMatch(run('JSON.stringify(dive)'), /undefined|NaN|Duas fontes/);
  }
});

test('deep dive uses the overall mix without presenting local block scores as behavior', () => {
  const { run } = app();
  run('var answers = QUESTIONS.map(() => ({B:1,C:1,D:2,E:4,F:1,G:3})); var first = buildDeepDive(buildSpiralProfile(answers)); answers[7].E=0; answers[7].B=5; answers[0].E=8; answers[0].B=0; answers[1].B=0; answers[2].B=0; answers[3].B=0; answers[0].G=0; answers[1].G=4; answers[2].G=4; answers[3].G=4; var second = buildDeepDive(buildSpiralProfile(answers));');
  assert.equal(run('first.total === second.total'), true);
  assert.equal(run('first.topics[0].reading.preview'), run('second.topics[0].reading.preview'));
  run('var zeroLocal = QUESTIONS.map(() => ({B:0,C:6,D:0,E:0,F:6,G:0})); zeroLocal[7] = {B:0,C:0,D:12,E:0,F:0,G:0}; renderDeepDive(buildSpiralProfile(zeroLocal));');
  assert.doesNotMatch(run('document.getElementById("deep-dive").innerHTML'), /\d+\/12(?!0)|Nas suas respostas|pontos na frase/);
  assert.match(run('document.getElementById("deep-dive").innerHTML'), /Afirmação/);
  assert.match(run('document.getElementById("deep-dive").innerHTML'), /Reciprocidade/);
});

test('deep dive renderer escapes response text and keeps historical references qualified', () => {
  const { run, nodes } = app();
  run('var profile = buildSpiralProfile(QUESTIONS.map(() => ({B:3,C:1,D:2,E:2,F:1,G:3}))); DEEP_THEME_LENSES.world.B[3] = "<img src=x>"; renderDeepDive(profile);');
  const html = nodes.get('deep-dive').innerHTML;
  assert.equal((html.match(/class="deep-topic"/g) || []).length, 8);
  assert.match(html, /&lt;img src=x&gt;/);
  assert.doesNotMatch(html, /<img src=x>/);
  assert.match(html, /não estamos atribuindo a elas esse perfil/);
  assert.match(html, /Exemplo de comunicação eficaz/);
  assert.equal((html.match(/class="deep-map-node"/g) || []).length, 8);
  run('var uniform = buildSpiralProfile(QUESTIONS.map(() => ({B:2,C:2,D:2,E:2,F:2,G:2}))); renderDeepDive(uniform);');
  assert.equal((nodes.get('deep-dive').innerHTML.match(/<option /g) || []).length, 15);
});

test('ten completed blocks preserve 120 points and original letter mapping', () => {
  const { run } = app();
  run('state.answers = QUESTIONS.map(() => ({B:1,C:1,D:2,E:4,F:1,G:3}))');
  assert.equal(run('state.answers.every((_, index) => blockTotal(index) === 12)'), true);
  assert.equal(run('totals().reduce((sum, item) => sum + item.points, 0)'), 120);
  assert.equal(run('totals().find(item => item.code === "E").name'), 'Laranja');
  assert.equal(run('totals().find(item => item.code === "E").points'), 40);
});

test('donut uses exact point proportions, including all points in one dimension', () => {
  const { run } = app();
  run('state.answers = QUESTIONS.map(() => ({B:1,C:1,D:2,E:4,F:1,G:3}))');
  const donut = run('renderDonut(totals(), "Teste")');
  const segments = [...donut.matchAll(/stroke-dasharray="([\d.]+) /g)].map(match => Number(match[1]));
  assert.ok(Math.abs(segments.reduce((sum, value) => sum + value, 0) - 100) < 1e-9);
  run('state.answers = QUESTIONS.map(() => ({B:0,C:0,D:0,E:12,F:0,G:0}))');
  assert.match(run('renderDonut(totals(), "Teste")'), /stroke-dasharray="100 0"/);
});

test('uniform scores retain all ties without inventing a dominant color', () => {
  const { run } = app();
  run('var profile = buildSpiralProfile(QUESTIONS.map(() => ({B:2,C:2,D:2,E:2,F:2,G:2})))');
  assert.equal(run('profile.highest.length'), 6);
  assert.equal(run('profile.uniqueLeaders.length'), 0);
  assert.match(run('describeDistribution(profile)'), /Não há uma cor predominante/);
});

test('all fifteen pairs are symmetric and unsupported zero pairs are explicit', () => {
  const { run } = app();
  run('var profile = buildSpiralProfile(QUESTIONS.map(() => ({B:0,C:0,D:0,E:12,F:0,G:0})))');
  assert.equal(run('Object.keys(COLOR_PAIRS).length'), 15);
  assert.equal(run('Object.keys(COLOR_PAIRS).every(key => buildColorPair(profile,...key).points === buildColorPair(profile,...[...key].reverse()).points)'), true);
  assert.equal(run('buildColorPair(profile,"E","F").supported'), false);
  assert.equal(run('buildColorPair(profile,"E","F").together'), 0);
  assert.throws(() => run('buildColorPair(profile,"E","E")'));
});

test('invalid, fractional and incomplete answers cannot generate a report', () => {
  const { run } = app();
  for (const value of [-1, 1.5, 13, NaN]) {
    run('var answers = QUESTIONS.map(() => ({B:2,C:2,D:2,E:2,F:2,G:2}))');
    assert.throws(() => run(`answers[0].B = ${value}; buildSpiralProfile(answers)`));
  }
  assert.throws(() => run('buildSpiralProfile([])'));
});

test('report evidence is grounded in all sixty responses, not professional context', () => {
  const { run, nodes } = app();
  run('var profile = buildSpiralProfile(QUESTIONS.map(() => ({B:1,C:1,D:2,E:4,F:1,G:3}))); currentReport = profile; renderProfileInsights(profile); renderAnswerEvidence(profile);');
  const before = nodes.get('analysis-cards').innerHTML;
  run('state.profile.roleArea = "CEO"; state.profile.challenge = "<script>injection</script>"; renderProfileInsights(profile);');
  assert.equal(nodes.get('analysis-cards').innerHTML, before);
  assert.equal((nodes.get('answer-evidence').innerHTML.match(/class="answer-evidence-row"/g) || []).length, 60);
  assert.doesNotMatch(nodes.get('answer-evidence').innerHTML, /benchmark|90 dias|FIT|<script>/);
  run('QUESTIONS[0].options[0][1] = "<img src=x>";');
  assert.match(run('answerRows(profile,0)'), /&lt;img/);
});

test('equal totals retain different block patterns', () => {
  const { run } = app();
  run('var a = QUESTIONS.map(() => ({B:2,C:2,D:2,E:2,F:2,G:2})); var b = a.map(item => ({...item})); b[0].B=4; b[0].C=0; b[1].B=0; b[1].C=4;');
  assert.equal(run('buildSpiralProfile(b).uniform'), true);
  assert.equal(run('buildSpiralProfile(b).uniqueLeaders.length'), 2);
  assert.equal(run('buildSpiralProfile(a).uniqueLeaders.length'), 0);
});

test('expanded readings quote scored answers and preserve uniform profiles', () => {
  const { run, nodes } = app();
  run('var profile = buildSpiralProfile(QUESTIONS.map(() => ({B:2,C:2,D:2,E:2,F:2,G:2}))); renderPanoramaReading(profile);');
  assert.equal(run('panoramaReading(profile).sections.length'), 6);
  assert.match(nodes.get('panorama-reading').innerHTML, /2\/12 pontos/);
  assert.match(nodes.get('panorama-reading').innerHTML, /não comprova equilíbrio emocional/);
  run('QUESTIONS[0].options[0][1] = "<img src=x>"; renderPanoramaReading(profile);');
  assert.match(nodes.get('panorama-reading').innerHTML, /&lt;img src=x&gt;/);
});

test('pair narratives distinguish separate contexts from shared scores', () => {
  const { run } = app();
  run('var profile = buildSpiralProfile(QUESTIONS.map((_,i) => ({B:i<5?12:0,C:i<5?0:12,D:0,E:0,F:0,G:0})));');
  assert.match(run('pairReading(profile,"B","C").paragraphs.join(" ")'), /temas diferentes/);
  assert.match(run('pairReading(profile,"D","E").paragraphs.join(" ")'), /não sustentam interpretar/);
  assert.equal(run('pairReading(profile,"B","C").sections.length'), 2);
});

test('dimension synthesis explains actual rules priorities and preserves tied leaders', () => {
  const { run } = app();
  run('var profile = buildSpiralProfile(QUESTIONS.map(() => ({B:3,C:1,D:2,E:2,F:1,G:3})))');
  const rules = run('dimensionMixAnalysis(profile,5).join("\\n")');
  assert.match(rules, /Púrpura \+ Amarelo compartilham/);
  assert.match(rules, /Proteção e responsabilidade pessoal/);
  assert.match(rules, /Azul \(2\/12; 16,7%\)/);
  assert.match(rules, /Laranja \(2\/12; 16,7%\)/);
  assert.doesNotMatch(rules, /cor líder|peso menor|12 respostas|participantes/);
  const money = run('dimensionMixAnalysis(profile,8).join("\\n")');
  assert.match(money, /alimentação e moradia/);
  assert.doesNotMatch(money, /Proteção e responsabilidade pessoal/);
});

test('synthesis adapts to score changes and does not mislabel a plurality as majority', () => {
  const { run } = app();
  run('var profile = buildSpiralProfile(QUESTIONS.map(() => ({B:1,C:1,D:3,E:4,F:1,G:2})))');
  const first = run('dimensionMixAnalysis(profile,5).join(" ")');
  assert.match(first, /não ultrapassa metade/);
  assert.match(first, /Ordem e progresso/);
  run('profile = buildSpiralProfile(QUESTIONS.map(() => ({B:3,C:1,D:2,E:2,F:1,G:3})))');
  assert.notEqual(first, run('dimensionMixAnalysis(profile,5).join(" ")'));
});

test('every dimension handles uniform, single-color and paired distributions without mutating scores', () => {
  const { run } = app();
  run('var fixtures = [{B:2,C:2,D:2,E:2,F:2,G:2}, {B:4,C:4,D:4,E:0,F:0,G:0}]; for (var a of Object.keys(COLORS)) { var single = {B:0,C:0,D:0,E:0,F:0,G:0}; single[a]=12; fixtures.push(single); for(var b of Object.keys(COLORS)) { if(a<b) {var pair={...single};pair[a]=6;pair[b]=6;fixtures.push(pair);} } }');
  assert.equal(run('fixtures.every(answer => { const profile=buildSpiralProfile(QUESTIONS.map(()=>({...answer}))); const before=JSON.stringify(profile); return profile.blocks.every((_,i)=> {const text=dimensionMixAnalysis(profile,i).join(" ");return text.length>500 && !/undefined|NaN/.test(text);}) && before===JSON.stringify(profile); })'), true);
  run('var uniform = buildSpiralProfile(QUESTIONS.map(()=>({B:2,C:2,D:2,E:2,F:2,G:2})))');
  assert.match(run('dimensionMixAnalysis(uniform,5).join(" ")'), /não permite destacar um critério principal/);
  assert.doesNotMatch(run('dimensionMixAnalysis(uniform,5).join(" ")'), /cor líder|segunda cor/);
});
