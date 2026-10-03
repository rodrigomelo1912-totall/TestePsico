const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { stripTypeScriptTypes } = require('node:module');

const root = path.join(__dirname, '..');
const source = fs.readFileSync(path.join(root, 'supabase/functions/personalize-report/index.ts'), 'utf8');
const context = vm.createContext({});
vm.runInContext(stripTypeScriptTypes(source.slice(0, source.indexOf('Deno.serve('))), context);
const run = expression => vm.runInContext(expression, context);

function rows(values) {
  return Array.from({ length: 10 }, () => ({ B: 0, C: 0, D: 0, E: 0, F: 0, G: 0, ...values }));
}

test('four intro slides collect twelve required answers and new fields persist', () => {
  const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
  const app = fs.readFileSync(path.join(root, 'app.js'), 'utf8');
  const form = html.match(/<form id="profile-form"[\s\S]*?<\/form>/)[0];
  assert.equal((form.match(/class="intro-slide(?: active)?"/g) || []).length, 4);
  assert.equal((form.match(/ required>/g) || []).length, 12);
  for (const field of ['valuesConflict', 'disagreement', 'roleEnergy']) {
    assert.match(html, new RegExp(`name="${field}"`));
    assert.match(app, new RegExp(`${field}:`));
  }
});

test('brief preserves scores and grounds the work mix in selected statements', () => {
  const answers = rows({ E: 8, G: 4 });
  answers[5] = { B: 3, C: 1, D: 2, E: 2, F: 1, G: 3 };
  context.answers = answers;
  context.profile = {
    roleArea: 'Gestora de operações', valuesConflict: 'Mantive um prazo e renegociei o escopo',
    disagreement: 'Expliquei os riscos e combinamos uma revisão', roleEnergy: 'Gosto de organizar; adaptar metas custa esforço'
  };
  const brief = run('buildNarrativeBrief(profile, answers)');
  assert.equal(brief.facts.filter(item => /^B\d\d$/.test(item.id)).length, 10);
  assert.match(brief.facts.find(item => item.id === 'B06').text, /Púrpura = regras como proteção e orientação/);
  assert.match(brief.facts.find(item => item.id === 'I_SHARED').text, /Laranja/);
  assert.equal(brief.plan.length, 6);
  assert.ok(brief.plan.find(item => item.key === 'crossings').evidenceIds.includes('O_valuesConflict'));
  assert.ok(brief.plan.find(item => item.key === 'fit').evidenceIds.includes('O_roleEnergy'));
  assert.match(brief.methodology, /valores escolhidos/);
});

test('ties and single-color results do not invent an exclusive pair', () => {
  context.answers = rows({ B: 2, C: 2, D: 2, E: 2, F: 2, G: 2 });
  assert.match(run('buildNarrativeBrief({}, answers).facts.find(item => item.id === "TOTAL").text'), /nenhuma dupla é exclusivamente dominante/);
  context.answers = rows({ E: 12 });
  const brief = run('buildNarrativeBrief({}, answers)');
  assert.match(brief.facts.find(item => item.id === 'I_MAIN').text, /Não existe segunda cor/);
  assert.equal(brief.facts.some(item => item.id === 'I_SHARED'), false);
});

test('invalid matrices are rejected before requesting AI text', () => {
  context.answers = rows({ E: 11 });
  assert.throws(() => run('buildNarrativeBrief({}, answers)'), /matriz/);
  context.answers = rows({ E: 12 });
  context.answers[0].E = 12.5;
  assert.throws(() => run('buildNarrativeBrief({}, answers)'), /matriz/);
});

test('narrative inspection flags unsupported references and salvages valid sections', () => {
  context.answers = rows({ E: 8, G: 4 });
  context.profile = { valuesConflict: 'Escolhi revisar o prazo', roleEnergy: 'Gosto de planejar e de executar' };
  const brief = run('buildNarrativeBrief(profile, answers)');
  const repeated = 'O relato aponta uma escolha no trabalho, mas o questionário registra apenas prioridades declaradas e não demonstra um comportamento estável em todas as situações. ';
  const draft = Object.fromEntries(brief.plan.map(section => [section.key, {
    text: repeated + repeated,
    evidenceIds: [section.evidenceIds[0], 'INVENTADO']
  }]));
  context.brief = brief;
  context.draft = draft;
  const result = run('inspectNarrative(draft, brief.plan)');
  assert.ok(result.issues.some(item => item.includes('referencia_ignorada')));
  assert.ok(result.issues.some(item => item.includes('repeticao')));
  assert.equal(Object.keys(result.reading).length, 0);
  draft.panorama.text = 'Uma leitura do contexto profissional permite reconhecer prioridades declaradas sem transformá-las em traços fixos. O relato descreve uma escolha concreta e pode orientar uma conversa sobre as condições de trabalho.';
  const partial = run('inspectNarrative(draft, brief.plan)');
  assert.equal(Object.keys(partial.reading).length, 1);
});

test('the AI loading state holds the report until generation settles', () => {
  const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
  const app = fs.readFileSync(path.join(root, 'app.js'), 'utf8');
  const portal = fs.readFileSync(path.join(root, 'portal.js'), 'utf8');
  assert.match(html, /id="generation-dialog"[\s\S]*?Gerando Perfil Psicológico/);
  assert.match(app, /\$\("generation-dialog"\)\.showModal\(\);[\s\S]*?await ProfilePortal\.enrichToken\(code\)/);
  assert.match(app, /finally \{\s*\$\("generation-dialog"\)\.close\(\)/);
  assert.match(portal, /AbortSignal\.timeout\(action === "generate" \? 95000 : 30000\)/);
});
