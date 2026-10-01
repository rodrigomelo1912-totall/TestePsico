const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

function engine() {
  const context = vm.createContext({ document: { getElementById() { return { addEventListener() {} }; }, querySelectorAll() { return []; } } });
  for (const file of ['spiral.js', 'app.js', 'personalization.js']) {
    const source = fs.readFileSync(path.join(__dirname, '..', file), 'utf8');
    vm.runInContext(file === 'app.js' ? source.slice(0, source.indexOf('$("profile-form").addEventListener')) : source, context);
  }
  return code => vm.runInContext(code, context);
}

test('role fit uses the four work blocks and the described duties', () => {
  const run = engine();
  run('var profile = buildSpiralProfile(QUESTIONS.map(() => ({B:0,C:0,D:0,E:12,F:0,G:0})))');
  run('var context = {roleArea:"Gerente comercial", responsibilities:"Entrego metas de vendas e resultado", timeFocus:"Acompanho crescimento de receita", challenge:"Expansão"}');
  assert.equal(run('buildRoleFit(profile, context).percent'), 100);
  run('var other = {roleArea:"Gerente comercial", responsibilities:"Cuido da equipe, escuta e colaboração", timeFocus:"Pessoas e clientes", challenge:"Bem-estar"}');
  assert.equal(run('buildRoleFit(profile, other).percent'), 0);
  assert.equal(run('buildRoleFit(profile, context).work.reduce((a,b)=>a+b,0)'), 48);
});

test('fit does not invent a percentage when professional text has insufficient signals', () => {
  const run = engine();
  run('var profile = buildSpiralProfile(QUESTIONS.map(() => ({B:2,C:2,D:2,E:2,F:2,G:2})))');
  assert.equal(run('buildRoleFit(profile, {responsibilities:"Faço de tudo", timeFocus:"Muitas coisas", challenge:"O cotidiano"}).percent'), null);
  assert.equal(run('buildRoleFit(profile, {responsibilities:"Metade do tempo", timeFocus:"", challenge:""}).count'), 0);
});

test('personal narratives change with open answers while color scores stay fixed', () => {
  const run = engine();
  run('var profile = buildSpiralProfile(QUESTIONS.map(() => ({B:1,C:1,D:2,E:4,F:1,G:3})))');
  run('var first = buildProfessionalReading(profile, {roleArea:"Diretora", responsibilities:"Defino metas comerciais", challenge:"Crescer com a equipe", difficultDecision:"Troquei o processo", pressure:"Busco dados"})');
  run('var second = buildProfessionalReading(profile, {roleArea:"Diretora", responsibilities:"Organizo auditorias", challenge:"Qualidade do processo", difficultDecision:"Revisei uma regra", pressure:"Escuto pessoas"})');
  assert.notEqual(run('first.panorama'), run('second.panorama'));
  assert.notEqual(run('first.deepDive'), run('second.deepDive'));
  assert.equal(run('profile.total'), 120);
  assert.equal(run('Object.values(first).every(text => !text.includes("undefined") && text.length > 70)'), true);
});
