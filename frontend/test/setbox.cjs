const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');
const rx = require('rxjs');
const signal = value => { const read = () => value; read.set = next => value = next; read.update = fn => value = fn(value); return read; };
const tokens = {};
const decorator = () => () => {};
const core = { ViewChild: decorator, HostListener: decorator, effect() {}, Injectable: () => target => target, Component: () => target => target, signal, computed: fn => fn, inject: token => tokens[token] };
function load(file, deps = {}) {
  const code = ts.transpileModule(fs.readFileSync(path.join(__dirname, '../src/app/', file), 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, experimentalDecorators: true } }).outputText;
  const module = { exports: {} };
  new Function('require', 'module', 'exports', code)(name => name === '@angular/core' ? core : name === 'rxjs' ? rx : deps[name] || {}, module, module.exports);
  return module.exports;
}
const stored = new Map();
global.sessionStorage = { getItem: key => stored.get(key) || null, setItem: (key, value) => stored.set(key, value) };
const { SetboxService } = load('core/services/setbox.service.ts');
const box = new SetboxService();
box.style.set('walnut');
const product = { _id: 'p1', name: 'Bottle', images: [], price: 100000, stock: 5 };
box.add({ product, quantity: 2 });
const customDetails = { customFee: 20000, textBlocks: [{ text: 'Hello', x: 20, y: 30 }], stickers: [{ x: 1, y: 2, rotation: 45 }] };
box.add({ product, quantity: 1, customDesignId: 'design-id', customDetails });
const restored = new SetboxService();
assert.equal(restored.style(), 'walnut');
assert.equal(restored.groupId, box.groupId);
assert.deepEqual(restored.lines()[1].customDetails, customDetails, 'drag/drop coordinates survive the draft');
let fail = true; const submitted = []; let navigated;
tokens.box = box;
tokens.catalog = { getProducts: () => rx.of({ items: [product], meta: { total: 1 } }) };
tokens.cart = { addItem: payload => { if (fail && submitted.length === 1) return rx.throwError(() => new Error('network')); submitted.push(payload); return rx.of({}); }, setPaymentMode: mode => { assert.equal(mode, 'DEPOSIT_50'); return rx.of({}); }, clearBuyNowItem() {} };
tokens.router = { navigate: async route => { navigated = route; } };
const { SetboxComponent } = load('features/setbox/setbox.component.ts', {
  '../../core/services/setbox.service': { SetboxService: 'box' },
  '../../core/services/product.service': { ProductService: 'catalog' },
  '../../core/services/cart.service': { CartService: 'cart' },
  '@angular/router': { Router: 'router' },
});
(async () => {
  const component = new SetboxComponent();
  assert.equal(component.total(), 320000);
  await component.checkout();
  assert.equal(submitted.length, 1);
  assert.equal(box.lines().length, 1, 'only failed/unsubmitted lines remain');
  assert.equal(box.committed(), true);
  assert.equal(new SetboxService().committed(), true, 'partial progress survives reload');
  fail = false;
  await component.checkout();
  assert.equal(submitted.length, 2, 'retry does not duplicate successful additions');
  assert.deepEqual(submitted[1].customDetails.textBlocks, customDetails.textBlocks);
  assert.equal(submitted[0].customDetails.setbox.id, submitted[1].customDetails.setbox.id);
  assert.equal(submitted[1].customDesignId, 'design-id');
  assert.equal(submitted[1].customDetails.setbox.styleName, 'Nâu óc chó');
  assert.deepEqual(navigated, ['/checkout']);
  assert.equal(box.lines().length, 0);
  assert.equal(box.committed(), false);
  const { CustomStudioComponent } = load('features/custom-studio/custom-studio.component.ts', {
    '../../core/services/setbox.service': { SetboxService: 'box' },
    '@angular/router': { Router: 'router' },
  });
  const studio = new CustomStudioComponent();
  studio.validateInputs = () => true;
  studio.activeTemplate.set(product);
  studio.getConfirmedCustomDetails = () => customDetails;
  studio.saveStudioDesignId = (tpl, details, callback) => callback('saved-design');
  studio.studioService = { clearDraftFromStorage() {} };
  studio.addingToSetbox.set(true);
  studio.onPrimaryActionClick();
  assert.equal(box.lines()[0].customDesignId, 'saved-design');
  assert.deepEqual(box.lines()[0].customDetails, customDetails);
  assert.deepEqual(navigated, ['/setbox'], 'Studio primary action returns to the builder');
  console.log('Setbox: draft restore, drag/drop data, total, partial failures, retry, group identity and checkout passed');
})().catch(error => { console.error(error); process.exitCode = 1; });
