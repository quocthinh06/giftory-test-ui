const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');
const rx = require('rxjs');
const signal = value => { const read = () => value; read.set = next => value = next; return read; };
const tokens = {};
function load(file, deps) {
  const code = ts.transpileModule(fs.readFileSync(path.join(__dirname, '../src/app/', file), 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, experimentalDecorators: true } }).outputText;
  const loaded = { exports: {} };
  new Function('require', 'module', 'exports', code)(name => name === '@angular/core' ? { Component: () => target => target, Injectable: () => target => target, inject: token => tokens[token], computed: fn => fn, signal } : name === 'rxjs' ? rx : deps[name] || {}, loaded, loaded.exports);
  return loaded.exports;
}
let lines = [
  { _id: 'line-a', productId: { name: 'Ly' }, price: 120000, quantity: 2, isCustom: true, customDetails: { textBlocks: [{ text: 'Hello', x: 12 }] } },
  { _id: 'line-b', productId: { name: 'Túi' }, price: 100000, quantity: 1, isCustom: false },
];
let fail = false, navigated, cleared = false;
tokens.cart = {
  items: () => lines, quantitySyncPending: () => false, setboxSyncPending: () => false, voucherSyncPending: () => false,
  updateSetbox: (itemIds, setbox) => {
    if (fail) return rx.throwError(() => new Error('offline'));
    lines = lines.map(item => itemIds.includes(item._id) || (setbox && item.customDetails?.setbox?.id === setbox.id)
      ? { ...item, customDetails: { ...item.customDetails, setbox } } : item);
    return rx.of({ items: lines });
  }, clearBuyNowItem: () => { cleared = true; },
};
tokens.box = { styles: [{ id: 'cream', name: 'Kem thanh lịch', color: '#F0E6D6' }, { id: 'walnut', name: 'Nâu óc chó', color: '#523F2B' }] };
tokens.router = { navigate: async route => { navigated = route; } };
const { CartComponent } = load('features/cart/cart.component.ts', {
  '../../core/services/cart.service': { CartService: 'cart' },
  '../../core/services/setbox.service': { SetboxService: 'box' }, '@angular/router': { Router: 'router' },
});
(async () => {
  const component = new CartComponent();
  await component.createBoxForAll();
  assert.equal(component.boxGroups().length, 1);
  const group = component.boxGroups()[0];
  assert.equal(group.quantity, 3);
  assert.equal(group.total, 340000);
  component.editBox(group.metadata, { styleId: 'walnut', styleName: 'Nâu óc chó', engravingName: 'Minh Anh', engravingMessage: 'Chúc mừng!' });
  assert.equal(component.hasBoxDrafts(), true);
  assert.equal(component.draftFor(group.metadata).styleId, 'walnut');
  fail = true;
  await component.proceedToCheckout();
  assert.equal(navigated, undefined, 'failed save blocks checkout');
  assert.equal(component.hasBoxDrafts(), true, 'failed save retains engraving for retry');
  assert.ok(component.boxError);
  fail = false;
  await component.proceedToCheckout();
  assert.deepEqual(navigated, ['/checkout']);
  assert.equal(cleared, true, 'cart checkout does not use a stale Buy Now item');
  assert.equal(component.hasBoxDrafts(), false);
  assert.equal(lines[1].customDetails.setbox.engravingName, 'Minh Anh');
  assert.deepEqual(lines[0].customDetails.textBlocks, [{ text: 'Hello', x: 12 }]);
  await component.assignBox(1, '');
  assert.equal(lines[1].customDetails.setbox, null);
  assert.equal(component.boxGroups()[0].quantity, 2);
  await component.assignBox(1, '__new');
  assert.equal(component.boxGroups().length, 2);
  await component.removeBox(component.boxGroups()[0].metadata.id);
  assert.equal(lines.length, 2, 'removing a box keeps its products');
  assert.equal(lines[0].customDetails.setbox, null);
  assert.equal(component.boxGroups().length, 1);
  console.log('Cart UI: box totals, multiple boxes, live engraving draft, autosave, failed-save retry, checkout and optional removal passed');
  const storage = new Map();
  global.localStorage = { getItem: key => storage.get(key), setItem: (key, value) => storage.set(key, value) };
  global.sessionStorage = { getItem: () => null };
  const response = new rx.Subject(); let body;
  const api = { get: () => rx.of({ items: lines }), patch: (url, payload) => { body = payload; return response; } };
  const { CartService } = load('core/services/cart.service.ts', {});
  const service = new CartService(api);
  for (let i = 0; i < 20; i++) await Promise.resolve();
  let errored = false;
  service.updateSetbox(['line-b'], null).subscribe({ error: () => { errored = true; } });
  assert.equal(service.setboxSyncPending(), true);
  for (let i = 0; i < 20; i++) await Promise.resolve();
  assert.deepEqual(body.itemIds, ['line-b']); assert.ok(body.sessionId);
  response.error(new Error('offline'));
  for (let i = 0; i < 20; i++) await Promise.resolve();
  assert.equal(errored, true);
  assert.equal(service.setboxSyncPending(), false, 'network error releases checkout guard');
  assert.deepEqual(service.items(), lines, 'failed mutation does not overwrite cart');
  console.log('Cart service: stable item IDs, guest session, pending guard and error recovery passed');
})().catch(err => { console.error(err); process.exitCode = 1; });
