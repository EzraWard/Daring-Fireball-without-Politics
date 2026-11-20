const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const test = require('node:test');
const read = name => fs.readFileSync(`src/daring-fireball-without-politics/${name}.js`, 'utf8');
function content(path) {
  let message;
  const context = vm.createContext({location: {pathname: path}, DFWP_SHARED: {getDefaultSettings: () => ({})}, chrome: {storage: {onChanged: {addListener() {}}}, runtime: {onMessage: {addListener(fn) {message = fn;}}}}, document: {readyState: 'loading', addEventListener() {}}, MutationObserver: class {}});
  vm.runInContext(read('content'), context);
  return {context, message};
}
test('permalinks bypass DOM filtering, listings remain eligible', () => {
  for (const path of ['/linked/2026/03/31/example', '/linked/2026/03/31/example/', '/2026/11/example']) {
    const {context} = content(path);
    vm.runInContext('applyFilter()', context);
    assert.equal(vm.runInContext('isPermalinkPage', context), true);
  }
  for (const path of ['/', '/linked/', '/2026/11/', '/linked/2026/03/31/']) {
    assert.equal(vm.runInContext('isPermalinkPage', content(path).context), false);
  }
});
test('entries have independent stable identities even with shared destinations', () => {
  const {context} = content('/');
  assert.equal(vm.runInContext('const a = {}, b = {}; getEntryKey(null, a) !== getEntryKey(null, b) && getEntryKey(null, a) === getEntryKey(null, a)', context), true);
});
test('hide again clears individual reveals', () => {
  const {context, message} = content('/2026/11/example');
  vm.runInContext('individuallyRevealedEntries.add("test")', context);
  message({type: 'SET_PAGE_REVEAL', reveal: false}, {}, () => {});
  assert.equal(vm.runInContext('individuallyRevealedEntries.size', context), 0);
});
test('failed save and reset preserve edits and report failure', () => {
  const elements = {};
  const element = id => elements[id] ||= {value: '', textContent: '', addEventListener(type, fn) {this[type] = fn;}};
  const context = vm.createContext({document: {getElementById: element, addEventListener(type, fn) {fn();}}, chrome: {runtime: {lastError: {message: 'Quota exceeded'}}, storage: {sync: {get(defaults, fn) {fn(defaults);}, set(value, fn) {fn();}}}}, window: {setTimeout() {}}});
  vm.runInContext(read('shared'), context);
  vm.runInContext(read('options'), context);
  element('keywords').value = 'unsaved edits';
  for (const action of ['save', 'reset']) {
    element(action).click();
    assert.match(element('status').textContent, /Could not .*Quota exceeded/);
    assert.equal(element('keywords').value, 'unsaved edits');
  }
});
