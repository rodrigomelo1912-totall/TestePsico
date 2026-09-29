const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

function app() {
  const nodes = new Map();
  const context = vm.createContext({
    document: { getElementById(id) {
      if (!nodes.has(id)) nodes.set(id, { innerHTML: '', textContent: '' });
      return nodes.get(id);
    } }
  });
  vm.runInContext(fs.readFileSync(path.join(__dirname, '../report.js'), 'utf8'), context);
  const source = fs.readFileSync(path.join(__dirname, '../app.js'), 'utf8');
  vm.runInContext(source.slice(0, source.indexOf('$("profile-form").addEventListener')), context);
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

test('report renders context as text, not participant-supplied markup', () => {
  const { run, nodes } = app();
  run('state.answers = QUESTIONS.map(() => ({B:1,C:1,D:2,E:4,F:1,G:3})); state.profile.roleArea = "<img src=x onerror=alert(1)>"; state.profile.challenge = "<script>injection</script>"; state.profile.goals = "A & B";');
  run('renderProfessionalReport(totals(), [...totals()].sort((a,b) => b.points-a.points)); renderDevelopmentRoute([...totals()].sort((a,b) => b.points-a.points)); renderAnalysis([...totals()].sort((a,b) => b.points-a.points));');
  for (const id of ['professional-report', 'development-route', 'analysis-cards']) {
    assert.doesNotMatch(nodes.get(id).innerHTML, /<script>|<img src=x/);
  }
  assert.match(nodes.get('professional-report').innerHTML, /&lt;img/);
  assert.match(nodes.get('development-route').innerHTML, /&lt;script&gt;/);
});

test('every development stage has a linked printable panel and targeted experiment', () => {
  const { run, nodes } = app();
  run('state.answers = QUESTIONS.map(() => ({B:1,C:1,D:2,E:4,F:1,G:3})); renderDevelopmentRoute([...totals()].sort((a,b) => b.points-a.points));');
  const report = nodes.get('development-route').innerHTML;
  for (let stage = 0; stage < 5; stage++) {
    assert.match(report, new RegExp(`aria-controls="dt-panel-${stage}"`));
    assert.match(report, new RegExp(`id="dt-panel-${stage}"`));
  }
  assert.equal((report.match(/role="tabpanel"/g) || []).length, 5);
  assert.match(report, /Faça três conversas curtas/);
  assert.match(report, /Dias 61–90/);
});
