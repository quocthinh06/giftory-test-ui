require('reflect-metadata');
const assert = require('node:assert/strict');
const mongoose = require('mongoose');
const { CartSchema } = require('../dist/database/schemas/cart.schema');
const { CartService } = require('../dist/modules/cart/cart.service');
const { OrdersService } = require('../dist/modules/orders/orders.service');
const Model = mongoose.model('SetboxCartTest', CartSchema);
const product = { _id: new mongoose.Types.ObjectId(), name: 'Ly', price: 100000, stock: 100, images: [], isCustomizable: true };
const design = { textBlocks: [{ text: 'Hello', x: 12, y: 35 }], stickers: [{ x: 15, y: 20, rotation: 45 }], selectedColor: 'Kem', previewImage: 'data:image/png;base64,test', customFee: 20000 };
const cart = new Model({ items: [
  { productId: product._id, quantity: 2, price: 120000, isCustom: true, depositRequired: 120000, customDetails: design },
  { productId: product._id, variantSku: 'navy', quantity: 1, price: 100000, isCustom: false, depositRequired: 0 },
  { productId: product._id, quantity: 1, price: 100000, isCustom: false, depositRequired: 0 },
] });
let saves = 0;
cart.save = async () => { saves++; };
const service = new CartService({}, { findById: async () => product }, {}, { list: async () => [] });
service.findOrCreateCart = async () => cart;
service.getCart = async () => cart.toObject();
const ids = cart.items.map(item => String(item._id));
const amounts = () => cart.items.map(item => [item.price, item.quantity, item.isCustom, item.depositRequired, item.variantSku]);
const before = amounts();
const box = { id: 'gift-box-1', styleId: 'cream', styleName: 'untrusted' };
(async () => {
  await service.updateSetbox(ids.slice(0, 2), box);
  assert.deepEqual(amounts(), before, 'packing never changes pricing, quantity, variant or deposits');
  assert.deepEqual(cart.items[0].customDetails.textBlocks, design.textBlocks);
  assert.deepEqual(cart.items[0].customDetails.stickers, design.stickers);
  assert.equal(cart.items[0].customDetails.previewImage, design.previewImage);
  assert.equal(cart.items[1].customDetails.setbox.styleName, 'Kem thanh lịch');
  await service.updateSetbox([ids[0]], { ...box, styleId: 'walnut', engravingName: '  Minh Anh  ', engravingMessage: 'Chúc mừng\nsinh nhật!' });
  assert.deepEqual(cart.items[0].customDetails.setbox, cart.items[1].customDetails.setbox, 'whole box receives the same style and engraving');
  assert.equal(cart.items[1].customDetails.setbox.engravingName, 'Minh Anh');
  assert.equal(cart.items[1].isCustom, false, 'box request does not misclassify a standard product');
  await service.updateItemCustomDetails(0, { ...design, setbox: { id: 'forged', styleId: 'fake' } });
  assert.equal(cart.items[0].customDetails.setbox.engravingName, 'Minh Anh', 'Studio updates preserve saved box engraving');
  assert.equal(cart.items[0].customDetails.setbox.id, box.id);
  const oldSaves = saves;
  for (const invalid of [{ ...box, styleId: '__proto__' }, { ...box, engravingName: 'x'.repeat(61) }, { ...box, engravingMessage: 42 }, { ...box, engravingMessage: 'x'.repeat(201) }, undefined]) {
    await assert.rejects(service.updateSetbox([ids[0]], invalid));
  }
  await assert.rejects(service.updateSetbox([ids[0], String(new mongoose.Types.ObjectId())], box));
  await assert.rejects(service.updateSetbox([ids[0], ids[0]], box));
  await assert.rejects(service.updateSetbox([], box));
  assert.equal(saves, oldSaves, 'invalid requests never save a partial box');
  const populated = cart.toObject().items.map(item => ({ ...item, productId: product }));
  const orderCart = { items: populated, save: async () => {} };
  const orders = new OrdersService(null, { create: async payload => payload }, { findOne: () => ({ populate: async () => orderCart }) }, null, null, null);
  const order = await orders.createOrder({ sessionId: 'test', paymentMethod: 'COD', shippingMethod: 'STANDARD' });
  assert.equal(order.pricing.depositAmount, 120000);
  assert.equal(order.items[1].customDetails.setbox.engravingName, 'Minh Anh');
  assert.equal(order.items[1].customDetails.setbox.engravingMessage, 'Chúc mừng\nsinh nhật!');
  await service.updateSetbox([ids[0]], null);
  assert.equal(cart.items[0].customDetails.setbox, undefined);
  assert.deepEqual(cart.items[0].customDetails.textBlocks, design.textBlocks);
  assert.equal(cart.items[1].customDetails.setbox.id, box.id, 'removing a line leaves the rest of the box intact');
  await service.updateSetbox([ids[1]], null);
  assert.equal(cart.items[1].customDetails, null);
  assert.deepEqual(amounts(), before);
  console.log('Cart Setbox: atomic validation, trusted styles, engraving, grouping/removal, design preservation, order persistence and custom-only deposit passed');
})().catch(err => { console.error(err); process.exitCode = 1; });
