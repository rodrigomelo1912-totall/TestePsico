const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

function app() {
  const nodes = new Map();
  const context = vm.createContext({
    document: { querySelectorAll: () => [], getElementById(id) {
      if (!nodes.has(id)) nodes.set(id, { innerHTML: '', textContent: '' });
      return nodes.get(id);
    } }
  });
  vm.runInContext(fs.readFileSync(path.join(__dirname, '../spiral.js'), 'utf8'), context);
  vm.runInContext(fs.readFileSync(path.join(__dirname, '../dimension-mix.js'), 'utf8'), context);
  vm.runInContext(fs.readFileSync(path.join(__dirname, '../report.js'), 'utf8'), context);
  const source = fs.readFileSync(path.join(__dirname, '../app.js'), 'utf8');
  vm.runInContext(source.slice(0, source.indexOf('$("profile-form").addEventListener')), context);
  vm.runInContext('updateMotion = () => {};', context);
  return { run: code => vm.runInContext(code, context), nodes };
}

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
