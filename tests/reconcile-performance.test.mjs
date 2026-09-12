import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';
import vm from 'node:vm';

const runtime = vm.runInNewContext(fs.readFileSync(new URL('../assets/banshee-runtime.js', import.meta.url), 'utf8'));
const node = (selector = '', children = []) => ({
  nodeType: 1, id: '',
  matches: (selectors) => selectors.split(', ').includes(selector),
  querySelector: (selectors) => children.find((child) => child.matches(selectors) || child.querySelector(selectors)) || null,
  contains: (target) => children.includes(target) || children.some((child) => child.contains(target)),
  closest: () => null,
});
const change = (target, addedNodes = [], removedNodes = []) => ({type: 'childList', target, addedNodes, removedNodes});

test('measurement probes and streamed text do not invalidate the shell', () => {
  const body = node('body'), transcript = node('article');
  assert.equal(runtime.mutationAffectsShell(change(body, [node('span')], [node('span')])), false);
  assert.equal(runtime.mutationAffectsShell(change(transcript, [{nodeType: 3}])), false);
  assert.equal(runtime.mutationAffectsShell(change(transcript, [node('div', [node('button')])])), false);
});

test('replacing/removing structural roots and opening native menus invalidates', () => {
  const body = node('body');
  for (const selector of ['main', 'aside', '.composer-surface-chrome', '[role="menu"]', '[role="dialog"]']) {
    const root = node(selector);
    assert.equal(runtime.mutationAffectsShell(change(body, [node('div', [root])])), true);
    assert.equal(runtime.mutationAffectsShell(change(body, [], [root])), true);
  }
});

test('sidebar and control glyph/state changes still require native parity', () => {
  const svg = node('svg'), control = node('button', [svg]), row = node('div'), sidebar = node('aside', [row]);
  assert.equal(runtime.mutationAffectsShell(change(row, [node('span')]), {sidebar}), true);
  assert.equal(runtime.mutationAffectsShell({type: 'attributes', target: svg}, {controls: [control]}), true);
  assert.equal(runtime.mutationAffectsShell({type: 'attributes', target: node('[role="menuitemcheckbox"][data-fast-mode-enabled]')}), true);
});

test('typing does not revalidate but composer button replacement does', () => {
  const editor = node('[role="textbox"]'), toolbar = node('div'), composer = node('.composer-surface-chrome', [editor, toolbar]);
  assert.equal(runtime.mutationAffectsShell(change(editor, [{nodeType: 3}]), {composer}), false);
  assert.equal(runtime.mutationAffectsShell(change(toolbar, [node('button')]), {composer}), true);
});

test('skin-owned decorative mutations cannot retrigger shell scans', () => {
  const target = node('div'); target.closest = () => ({});
  assert.equal(runtime.mutationAffectsShell(change(target, [node('main')])), false);
});
