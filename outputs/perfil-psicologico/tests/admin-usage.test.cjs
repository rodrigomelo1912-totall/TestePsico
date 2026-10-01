const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const source = fs.readFileSync(path.join(__dirname, '..', 'admin-usage.js'), 'utf8');
const context = vm.createContext({ Date, Number, Math, Intl, String, Array });
vm.runInContext(source, context);
const run = expression => vm.runInContext(expression, context);

test('usage periods preserve all-time and calculate limited windows', () => {
  assert.equal(run('usageSince("all", new Date("2026-10-01T12:00:00Z"))'), null);
  assert.equal(run('usageSince("7", new Date("2026-10-01T12:00:00Z"))'), '2026-09-24T12:00:00.000Z');
  assert.equal(run('usageSince("invalid", new Date("2026-10-01T12:00:00Z"))'), '2026-09-01T12:00:00.000Z');
});

test('missing provider usage is not shown as zero tokens', () => {
  assert.equal(run('usageCount(null)'), '—');
  assert.equal(run('usageCount(0)'), '0');
  assert.equal(run('usageCount(1200)'), '1.200');
});

test('daily graph preserves actual counts and gives empty days no bar', () => {
  const bars = run('usageBars([{day:"2026-10-01",tokens:120,requests:2},{day:"2026-10-02",tokens:0,requests:1},{day:"2026-10-03",tokens:60,requests:1}])');
  assert.equal(bars[0].height, 100);
  assert.equal(bars[1].height, 0);
  assert.equal(bars[2].height, 50);
  assert.equal(bars[1].requests, 1);
});
