import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { Product, ProductVariant } from '../../core/models';
import { ProductService } from '../../core/services/product.service';
import { CartService } from '../../core/services/cart.service';
import { SetboxLine, SetboxService } from '../../core/services/setbox.service';

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <main class="setbox max-w-7xl mx-auto px-4 md:px-8 py-10 text-[#1A1A1A]">
      <h1 class="text-3xl md:text-4xl font-bold mb-3">Tạo Setbox của bạn</h1>
      <p class="text-[#523F2B] mb-8">Chọn style hộp, thêm những món quà yêu thích và cá nhân hóa trong Studio.</p>
      <div class="grid lg:grid-cols-[minmax(280px,0.85fr)_minmax(0,1.4fr)] gap-8 items-start">
        <section aria-labelledby="box-heading" class="lg:sticky lg:top-24">
          <h2 id="box-heading" class="text-xl font-bold mb-4">Style hộp quà</h2>
          <div class="box-preview mb-5" [style.background]="selectedStyle().color" aria-hidden="true"><span class="ribbon"></span><span class="box-word">GIFTORY</span></div>
          <div class="flex flex-wrap gap-2 mb-4">
            @for (style of box.styles; track style.id) {
              <button type="button" [disabled]="submitting() || box.committed()" [attr.aria-pressed]="box.style() === style.id" (click)="chooseStyle(style.id)" class="style-option px-4 py-3 border rounded-lg" [class.selected]="box.style() === style.id">{{ style.name }}</button>
            }
          </div>
          <p class="text-sm text-[#523F2B] mb-7">Hộp quà miễn phí. Hình minh họa màu hộp.</p>
          <h2 class="text-xl font-bold mb-4">Trong hộp của bạn</h2>
          @for (line of box.lines(); track line.key) {
            <div class="flex gap-3 py-3 border-b border-[#DDD3C5]">
              <img [src]="line.customDetails?.previewImage || line.product.images[0] || '/logo.png'" alt="" class="w-14 h-14 object-contain rounded">
              <div class="flex-1 min-w-0"><p class="font-semibold break-words">{{ line.product.name }}</p><p class="text-sm">{{ line.variantName }} · SL: {{ line.quantity }}</p><p class="text-sm">{{ linePrice(line) | number:'1.0-0' }}đ</p>@if (line.customDesignId) { <p class="text-sm text-[#523F2B]">Thiết kế riêng · Cọc 50% khi chọn COD</p> }</div>
              <button type="button" (click)="box.remove(line.key)" [disabled]="submitting()" [attr.aria-label]="'Bỏ ' + line.product.name" class="self-start underline text-sm">Bỏ</button>
            </div>
          } @empty { <p class="py-5 text-[#523F2B]">Hộp đang trống. Chọn sản phẩm ở bên cạnh để bắt đầu.</p> }
          <div class="flex justify-between font-bold text-lg mt-5"><span>Tạm tính</span><span>{{ total() | number:'1.0-0' }}đ</span></div>
          <p class="text-sm text-[#523F2B] my-3">COD: chỉ cọc 50% giá trị hàng customized. Phí vận chuyển và ưu đãi được tính khi thanh toán.</p>
          <button type="button" (click)="checkout()" [disabled]="submitting() || !box.lines().length && !box.committed()" class="w-full bg-[#D4AF37] text-[#1A1A1A] font-bold py-4 rounded-lg">{{ submitting() ? 'Đang thêm vào giỏ…' : 'Thêm Setbox & thanh toán' }}</button>
          <p class="text-sm mt-3">Thanh toán bao gồm các sản phẩm đang có trong giỏ.</p>
          @if (error()) { <p role="alert" class="text-red-800 mt-4">{{ error() }}</p> }
        </section>
        <section aria-labelledby="products-heading">
          <div class="flex flex-wrap justify-between items-center gap-3 mb-5"><h2 id="products-heading" class="text-xl font-bold">Chọn sản phẩm</h2><a routerLink="/custom-studio" [queryParams]="{setbox: '1'}" class="underline font-semibold">Mở Studio kéo thả</a></div>
          <label for="setbox-search" class="block text-sm font-semibold mb-2">Tìm sản phẩm</label>
          <input id="setbox-search" [(ngModel)]="search" (keyup.enter)="load(1)" type="search" placeholder="Nhập tên sản phẩm, nhấn Enter" class="w-full p-3 border border-[#DDD3C5] rounded-lg bg-white mb-4">
          <button type="button" (click)="load(1)" class="underline mb-4">Tìm kiếm</button>
          @if (loading()) { <p role="status" class="py-8">Đang tải sản phẩm…</p> }
          @if (catalogError()) { <p role="alert">{{ catalogError() }} <button (click)="load(page())" class="underline">Thử lại</button></p> }
          @for (product of products(); track product._id) {
            <article class="flex gap-4 py-5 border-b border-[#DDD3C5]">
              <img [src]="product.images[0] || '/logo.png'" alt="" class="w-20 sm:w-28 h-24 object-contain bg-white rounded-lg">
              <div class="flex-1 min-w-0"><h3 class="font-bold mb-1">{{ product.name }}</h3><p class="text-[#523F2B] mb-2">{{ (product.salePrice || product.price) | number:'1.0-0' }}đ</p>
                @if (product.variants?.length) {
                  <select [attr.aria-label]="'Phân loại ' + product.name" [(ngModel)]="variants[product._id]" class="border rounded p-2 w-full mb-3"><option value="">Chọn phân loại</option>@for (variant of availableVariants(product); track $index) { <option [value]="$index">{{ variant.name }} — {{ variant.price | number:'1.0-0' }}đ</option> }</select>
                }
                <div class="flex flex-wrap items-center gap-3"><button type="button" (click)="add(product)" [disabled]="submitting() || !canAdd(product)" class="bg-[#2B2B2B] text-white px-4 py-2 rounded-lg">Thêm vào hộp</button>
                @if (product.isCustomizable) { <a routerLink="/custom-studio" [queryParams]="{productId: product._id, setbox: '1'}" class="underline text-sm">Thiết kế trong Studio</a> }</div>
              </div>
            </article>
          } @empty { @if (!loading() && !catalogError()) { <p class="py-8">Không có sản phẩm phù hợp.</p> } }
          <nav aria-label="Trang sản phẩm" class="flex gap-4 items-center mt-5"><button (click)="load(page()-1)" [disabled]="loading() || page() === 1" class="underline p-2">Trước</button><span>Trang {{ page() }}</span><button (click)="load(page()+1)" [disabled]="loading() || !hasNext()" class="underline p-2">Sau</button></nav>
        </section>
      </div>
    </main>
  `,
  styles: [`
    :host { display:block; background:#FDFBF7; }
    .setbox :focus-visible { outline:3px solid #523F2B; outline-offset:3px; }
    .setbox button:disabled { opacity:.45; cursor:not-allowed; }
    .style-option.selected { border-color:#523F2B; box-shadow:inset 0 0 0 1px #523F2B; font-weight:700; }
    .style-option:hover { background:#F0E6D6; }
    .box-preview { height:240px; position:relative; border:1px solid #B8A88D; border-radius:8px; overflow:hidden; box-shadow:0 12px 24px #523F2B18; }
    .ribbon { position:absolute; left:44%; width:12%; height:100%; background:#D4AF37; }
    .box-word { position:absolute; top:44%; left:0; width:100%; text-align:center; background:#D4AF37; color:#1A1A1A; padding:8px; letter-spacing:.2em; font-weight:700; }
  `],
})
export class SetboxComponent {
  box = inject(SetboxService);
  private catalog = inject(ProductService);
  private cart = inject(CartService);
  private router = inject(Router);
  products = signal<Product[]>([]); loading = signal(false); catalogError = signal(''); error = signal('');
  submitting = signal(false); page = signal(1); hasNext = signal(false);
  search = ''; variants: Record<string, string> = {};
  selectedStyle = computed(() => this.box.styles.find(s => s.id === this.box.style())!);
  total = computed(() => this.box.lines().reduce((sum, line) => sum + this.linePrice(line) * line.quantity, 0));
  constructor() { this.load(1); }
  chooseStyle(id: string) { this.box.style.set(id); this.box.persist(); }
  availableVariants(product: Product): ProductVariant[] { return (product.variants || []).filter(v => v.stock > 0 && v.status !== 'HIDDEN' && v.status !== 'OUT_OF_STOCK'); }
  canAdd(product: Product) { return product.variants?.length ? this.variants[product._id] !== undefined && this.variants[product._id] !== '' : product.stock > 0; }
  add(product: Product) {
    const variant = this.availableVariants(product)[Number(this.variants[product._id])];
    if (!this.canAdd(product)) return;
    try { this.box.add({ product, quantity: 1, variantSku: variant?.sku, variantName: variant?.name }); } catch { this.error.set('Không lưu được hộp. Vui lòng kiểm tra dung lượng lưu trữ của trình duyệt.'); }
  }
  linePrice(line: SetboxLine) {
    const variant = line.product.variants?.find(v => line.variantSku ? v.sku === line.variantSku : v.name === line.variantName);
    return (variant?.price ?? (line.product.salePrice || line.product.price)) + (line.customDetails?.customFee || 0);
  }
  load(page: number) {
    this.loading.set(true); this.catalogError.set('');
    this.catalog.getProducts({ page, limit: 12, search: this.search }).subscribe({
      next: result => { this.products.set(result.items); this.page.set(page); this.hasNext.set(page * 12 < result.meta.total); this.loading.set(false); },
      error: () => { this.loading.set(false); this.catalogError.set('Không tải được sản phẩm.'); },
    });
  }
  async checkout() {
    if (this.submitting() || (!this.box.lines().length && !this.box.committed())) return;
    this.submitting.set(true); this.error.set('');
    try {
      const setbox = this.box.metadata();
      // Remove confirmed lines as we go so a retry never resubmits successful additions.
      for (const line of [...this.box.lines()]) {
        await firstValueFrom(this.cart.addItem({ productId: line.product._id, quantity: line.quantity, variantSku: line.variantSku, variantName: line.variantName, customDesignId: line.customDesignId, customDetails: { ...line.customDetails, setbox } }));
        this.box.committed.set(true); this.box.remove(line.key);
      }
      await firstValueFrom(this.cart.setPaymentMode('DEPOSIT_50'));
      this.cart.clearBuyNowItem();
      this.box.groupId = crypto.randomUUID(); this.box.committed.set(false); this.box.persist();
      await this.router.navigate(['/checkout']);
    } catch (err: any) { this.error.set(err.error?.message || 'Chưa thêm được toàn bộ Setbox. Các món đã thêm nằm trong giỏ; vui lòng thử lại cho các món còn lại.'); }
    finally { this.submitting.set(false); }
  }
}
