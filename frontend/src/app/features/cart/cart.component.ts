import { CartVouchersComponent } from '../../shared/components/cart-vouchers.component';
import { Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { CartService } from '../../core/services/cart.service';
import { firstValueFrom } from 'rxjs';
import { CartItem } from '../../core/models';
import { SetboxService } from '../../core/services/setbox.service';
import { AuthService } from '../../core/services/auth.service';

type BoxMetadata = NonNullable<NonNullable<CartItem['customDetails']>['setbox']>;

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, CartVouchersComponent],
  template: `
    <div class="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
      
      <!-- Breadcrumb & Header Title Area -->
      <section class="flex flex-col gap-2 mb-6">
        <div class="flex items-center gap-2 text-xs text-slate-500">
          <a routerLink="/" class="hover:text-[#523F2B]">Trang chủ</a>
          <span>/</span>
          <span class="text-[#1A1A1A] font-semibold">Giỏ hàng & Đặt cọc</span>
        </div>

        <div class="flex flex-wrap items-end justify-between gap-4">
          <div>
            <div class="flex flex-wrap items-center gap-3">
              <h1 class="text-2xl sm:text-3xl font-bold text-[#1A1A1A]">Giỏ Hàng Của Bạn</h1>
              <span class="px-3 py-1 rounded-full bg-purple-100 text-[#523F2B] text-xs font-bold flex items-center gap-1 shadow-sm">
                <span class="material-symbols-outlined text-[15px]">redeem</span>
                <span>{{ cartService.productCount() }} sản phẩm · Tổng số lượng: {{ cartService.itemsCount() }}</span>
              </span>
            </div>
            <p class="text-xs sm:text-sm text-slate-500 mt-1.5 max-w-3xl leading-relaxed">
              Xem lại thiết kế, số lượng và giá. Ghép những món bạn thích vào Setbox hoặc giữ riêng từng món.
            </p>
          </div>
          <div class="flex items-center gap-2 text-xs text-slate-500 bg-white px-4 py-2 rounded-full border border-[#DDD3C5] shadow-sm">
            <span class="material-symbols-outlined text-[#523F2B] text-[18px]">verified_user</span>
            <span>Đảm bảo quyền lợi khách hàng 100%</span>
          </div>
        </div>

        <!-- Guest Cart Persistence Banner -->
        @if (!authService.isAuthenticated()) {
          <div class="mt-4 p-4 rounded-2xl bg-white border border-[#DDD3C5] shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div class="flex items-start gap-3.5">
              <div class="w-9 h-9 rounded-full bg-[#1A1A1A] text-white flex items-center justify-center shrink-0 mt-0.5 md:mt-0">
                <span class="material-symbols-outlined text-[20px]">bolt</span>
              </div>
              <div>
                <p class="text-xs font-bold text-[#1A1A1A]">
                  Bạn đang thao tác với tư cách <span class="text-[#523F2B]">Khách vãng lai</span>
                </p>
                <p class="text-xs text-slate-500 mt-0.5">
                  Giỏ hàng và bản thiết kế custom đã được tự động lưu tạm trên thiết bị này. Đăng nhập 1-Click để đồng bộ đa nền tảng và nhận ngay <strong class="text-[#523F2B]">+35 điểm tích lũy Giftory!</strong>
                </p>
              </div>
            </div>
            <a routerLink="/login" class="shrink-0 px-4 py-2 rounded-full bg-[#F1EBE2] hover:bg-[#DDD3C5] text-[#523F2B] font-bold text-xs shadow-sm transition-all flex items-center gap-1.5">
              <span>Đăng nhập 1-Click</span>
              <span class="material-symbols-outlined text-[16px]">arrow_forward</span>
            </a>
          </div>
        }
      </section>

      @if (cartService.items().length === 0) {
        <div class="py-20 bg-white rounded-3xl p-8 text-center border border-[#DDD3C5] shadow-shop-card">
          <span class="material-symbols-outlined text-6xl text-slate-300 mb-3">shopping_bag</span>
          <h2 class="text-xl font-bold text-[#1A1A1A]">Giỏ hàng của bạn đang trống</h2>
          <p class="text-xs sm:text-sm text-slate-500 mt-1 max-w-sm mx-auto">Hãy khám phá bộ sưu tập quà tặng ý nghĩa hoặc tạo một bản thiết kế khắc laser riêng biệt!</p>
          <div class="mt-6 flex items-center justify-center gap-3">
            <a routerLink="/products" class="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl">Khám phá sản phẩm</a>
            <a routerLink="/custom-studio" class="px-5 py-2.5 bg-[#D4AF37] hover:bg-[#C09A2B] text-[#1A1A1A] text-xs font-bold rounded-xl shadow-md">Đến Custom Studio</a>
          </div>
        </div>
      } @else {
        <!-- Main Layout: 7 Cols Left / 5 Cols Right -->
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          <!-- LEFT COLUMN: CART ITEMS LIST -->
          <div class="lg:col-span-7 flex flex-col gap-5">
            <!-- Select All Utility Header -->
            <div class="bg-white rounded-2xl p-4 shadow-sm border border-[#DDD3C5] flex items-center justify-between">
              <label class="flex items-center gap-2.5 cursor-pointer select-none text-xs font-bold text-[#1A1A1A]">
                <span class="material-symbols-outlined text-[18px]">shopping_bag</span>
                <span>{{ cartService.productCount() }} sản phẩm trong giỏ</span>
              </label>
              <button (click)="clearCart()" [disabled]="boxBusy()" class="text-xs text-slate-500 hover:text-red-500 flex items-center gap-1 transition-colors disabled:opacity-50">
                <span class="material-symbols-outlined text-[16px]">delete_sweep</span>
                <span>Xóa toàn bộ giỏ</span>
              </button>
            </div>

            <!-- Items Loop -->
            <div role="status" aria-live="polite" class="min-h-4 text-xs">
              @if (cartService.quantityError()) { <span class="text-rose-700">{{ cartService.quantityError() }}</span> }
              @else if (cartService.quantitySyncPending()) { <span class="text-purple-700">Đang lưu số lượng…</span> }
            </div>
            @for (item of cartService.items(); track item._id || $index) {
              <article class="bg-white rounded-2xl p-5 sm:p-6 shadow-shop-card border border-[#DDD3C5] relative overflow-hidden group">
                <!-- Color edge indicator -->
                <div 
                  class="absolute top-0 left-0 bottom-0 w-1.5"
                  [ngClass]="item.isCustom ? 'bg-[#10B981]' : 'bg-[#DDD3C5]'"
                ></div>

                <div class="flex items-start gap-4">
                  <!-- Checkbox -->

                  <!-- Thumbnail -->
                  <div class="relative w-24 h-24 sm:w-32 sm:h-32 rounded-xl overflow-hidden bg-slate-50 border border-slate-100 shrink-0">
                    <img [src]="item.customDetails?.previewImage || item.image || (item.productId?.images && item.productId.images[0]) || 'https://placehold.co/400'" [alt]="item.productId?.name" class="w-full h-full object-cover">
                    @if (item.isCustom) {
                      <div class="absolute bottom-1 left-1 right-1 py-0.5 px-1 rounded bg-white/90 backdrop-blur-sm text-center">
                        <span class="text-[9px] text-[#523F2B] font-bold flex items-center justify-center gap-0.5">
                          <span class="material-symbols-outlined text-[10px]">view_in_ar</span>
                          Mô phỏng 3D
                        </span>
                      </div>
                    }
                  </div>

                  <!-- Details -->
                  <div class="flex-1 min-w-0">
<p *ngIf="item.customDetails?.setbox" class="text-sm text-[#523F2B]">Setbox · {{ item.customDetails?.setbox?.styleName }} · {{ item.customDetails?.setbox?.id?.slice(0, 8) }}</p>
                    <!-- Badges & Delete -->
                    <div class="flex items-center justify-between gap-2 mb-1">
                      @if (item.isCustom) {
                        <span class="px-2.5 py-0.5 rounded-full bg-[#10B981] text-white font-bold text-[10px] flex items-center gap-1 shadow-sm">
                          <span class="material-symbols-outlined text-[12px]">palette</span>
                          Thiết kế riêng • Cọc 50%
                        </span>
                      } @else {
                        <span class="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-semibold text-[10px] flex items-center gap-1">
                          <span class="material-symbols-outlined text-[12px]">inventory_2</span>
                          Hàng chuẩn • Không yêu cầu cọc
                        </span>
                      }
                      <button (click)="removeItem($index)" [disabled]="boxBusy()" class="text-slate-400 hover:text-red-500 transition-colors disabled:opacity-50" title="Xóa món này">
                        <span class="material-symbols-outlined text-[18px]">close</span>
                      </button>
                    </div>

                    <!-- Title -->
                    <h2 class="font-bold text-sm sm:text-base text-[#1A1A1A] truncate mb-1">
                      {{ item.productId?.name || 'Sản phẩm quà tặng Giftory' }}
                    </h2>

                    <!-- Custom details callout if custom (AC14 & BR-CUS06) -->
                    @if (item.isCustom && item.customDetails) {
                      <div class="my-2 p-3 rounded-xl bg-purple-50/80 border border-purple-100 text-xs text-slate-700 flex flex-col gap-1.5">
                        @if (item.customDetails.frontMessage) {
                          <div class="flex items-center gap-1.5">
                            <span class="text-slate-400 font-medium shrink-0">Mặt trước:</span>
                            <span class="font-bold text-[#523F2B] truncate">“{{ item.customDetails.frontMessage }}”</span>
                          </div>
                        }
                        @if (item.customDetails.backMessage) {
                          <div class="flex items-center gap-1.5">
                            <span class="text-slate-400 font-medium shrink-0">Mặt sau:</span>
                            <span class="font-bold text-[#523F2B] truncate">“{{ item.customDetails.backMessage }}”</span>
                          </div>
                        }

                        <div class="flex items-center gap-2 flex-wrap text-[11px] text-slate-500 pt-1 border-t border-purple-200/50">
                          <span>Màu phôi: <strong class="text-slate-700">{{ item.customDetails.selectedColor || item.variantName || 'Chuẩn' }}</strong></span>
                          <span>•</span>
                          <span>Font: <strong class="text-slate-700">{{ item.customDetails.fontFamily || 'Signature' }}</strong></span>
                          <span>•</span>
                          <span>Khắc: <strong class="text-slate-700">{{ item.customDetails.engraveColor || 'Gold' }}</strong></span>
                          @if (item.customDetails.stickers?.length) {
                            <p class="text-xs text-slate-500">Đồ họa: {{ item.customDetails.stickers?.length }} hình</p>
                          }
                          @if (item.customDetails.pattern && item.customDetails.pattern !== 'none') {
                            <span>•</span>
                            <span>Họa tiết: <strong class="text-[#523F2B]">{{ item.customDetails.pattern }}</strong></span>
                          }
                          @if (item.customDetails.uploadedImage) {
                            <span>•</span>
                            <span class="text-emerald-700 font-bold flex items-center gap-0.5">
                              <span class="material-symbols-outlined text-[13px]">image</span>
                              Ảnh cá nhân HD
                            </span>
                          }
                        </div>

                        <!-- Surcharges breakdown pill -->
                        @if (item.customDetails.customFee && item.customDetails.customFee > 0) {
                          <div class="text-[10px] text-[#523F2B] font-semibold bg-white/70 px-2 py-0.5 rounded-md border border-purple-100 w-fit">
                            Phụ phí tùy biến: +{{ item.customDetails.customFee | number:'1.0-0' }}đ
                          </div>
                        }
                      </div>
                    }

                    <label class="block my-3 text-xs font-semibold text-[#523F2B]">
                      Đóng gói sản phẩm
                      <select [attr.aria-label]="'Chọn Setbox cho ' + item.productId?.name"
                        [ngModel]="item.customDetails?.setbox?.id || ''" (ngModelChange)="assignBox($index, $event)"
                        [disabled]="boxBusy() || hasBoxDrafts()" class="block w-full mt-1.5 rounded-lg border border-[#DDD3C5] bg-[#FDFBF7] p-2.5 text-[#1A1A1A] disabled:opacity-50">
                        <option value="">Để rời · Không thêm vào Setbox</option>
                        @for (group of boxGroups(); track group.metadata.id; let n = $index) {
                          <option [value]="group.metadata.id">Hộp {{ n + 1 }} · {{ group.metadata.styleName }}</option>
                        }
                        <option value="__new">+ Tạo Setbox mới cho món này</option>
                      </select>
                    </label>
                    @if (item.variantName) { <p class="text-xs text-slate-500 mb-2">Phân loại: {{ item.variantName }}</p> }
                    <!-- Price & Quantity -->
                    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
                      <div>
                        <div class="flex items-baseline gap-1.5">
                          <span class="font-extrabold text-base text-[#523F2B]">
                            {{ item.price | number:'1.0-0' }}đ / món
                          </span>
                        </div>
                        <p class="text-xs text-[#1A1A1A] mt-1">Thành tiền: <strong>{{ item.price * item.quantity | number:'1.0-0' }}đ</strong></p>
                        @if (item.isCustom) {
                          <div class="text-[11px] text-emerald-700 font-bold mt-0.5">
                            Cần cọc trước 50%: {{ item.depositRequired | number:'1.0-0' }}đ
                          </div>
                        }
                      </div>

                      <div class="flex items-center gap-2">
                        @if (item.isCustom) {
                          <a 
                            routerLink="/custom-studio" 
                            [queryParams]="{ productId: item.productId?._id, cartItemIndex: $index }"
                            class="px-2.5 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold text-xs flex items-center gap-1 cursor-pointer transition-colors"
                            title="Chỉnh sửa cấu hình bản thiết kế này (AC14)"
                          >
                            <span class="material-symbols-outlined text-[14px]">tune</span>
                            <span>Sửa cấu hình</span>
                          </a>
                        }

                        <!-- Stepper -->
                        <div class="flex items-center bg-slate-100 rounded-lg p-0.5 border border-slate-200">
                          <button type="button" (click)="updateQuantity($index, item.quantity - 1)" [disabled]="cartService.setboxSyncPending() || item.quantity <= 1" [attr.aria-label]="'Giảm số lượng ' + item.productId?.name" class="w-8 h-8 rounded bg-white flex items-center justify-center text-slate-700 shadow-sm text-xs disabled:opacity-40 disabled:cursor-not-allowed">
                            <span class="material-symbols-outlined text-[14px]">remove</span>
                          </button>
                          <span class="min-w-7 px-1 text-center text-xs font-bold tabular-nums text-[#1A1A1A]">{{ item.quantity }}</span>
                          <button type="button" (click)="updateQuantity($index, item.quantity + 1)" [disabled]="cartService.setboxSyncPending()" [attr.aria-label]="'Tăng số lượng ' + item.productId?.name" class="w-8 h-8 rounded bg-white flex items-center justify-center text-slate-700 shadow-sm text-xs">
                            <span class="material-symbols-outlined text-[14px]">add</span>
                          </button>
                        </div>
                      </div>
                    </div>

                  </div>
                </div>
              </article>
            }

            <section id="cart-setboxes" aria-labelledby="setbox-title" class="rounded-2xl border border-[#DDD3C5] bg-[#FDFBF7] p-5 sm:p-6">
              <div class="flex items-start gap-3 mb-4">
                <span class="material-symbols-outlined text-[#523F2B] text-3xl">redeem</span>
                <div><h2 id="setbox-title" class="text-lg font-bold text-[#1A1A1A]">Setbox của bạn</h2>
                  <p class="text-sm text-[#523F2B] mt-1">Hộp quà miễn phí. Chọn Setbox ở từng sản phẩm để ghép quà vào cùng hộp.</p>
                </div>
              </div>
              @if (!boxGroups().length) {
                <div class="rounded-xl border border-dashed border-[#B8A88D] p-5 text-center">
                  <p class="text-sm text-[#523F2B] mb-3">Bạn có thể tạo một hộp chung hoặc chia quà thành nhiều Setbox.</p>
                  <button type="button" (click)="createBoxForAll()" [disabled]="boxBusy()" class="rounded-lg bg-[#2B2B2B] px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50">Gộp tất cả vào một Setbox</button>
                  <p class="text-xs text-slate-500 mt-3">Không cần hộp? Bạn có thể thanh toán các món để rời như bình thường.</p>
                </div>
              }
              @for (group of boxGroups(); track group.metadata.id; let n = $index) {
                <article class="bg-white rounded-xl border border-[#DDD3C5] p-4 mt-4">
                  <div class="flex items-center justify-between gap-3 mb-4">
                    <h3 class="font-bold">Hộp {{ n + 1 }} <span class="font-normal text-sm text-[#523F2B]">· {{ group.quantity }} món</span></h3>
                    <button type="button" (click)="removeBox(group.metadata.id)" [disabled]="boxBusy() || hasBoxDrafts()" class="text-xs underline text-[#523F2B] disabled:opacity-50">Bỏ hộp, giữ sản phẩm</button>
                  </div>
                  <div class="grid sm:grid-cols-[150px_minmax(0,1fr)] gap-5">
                    <div>
                      <div class="cart-box-preview" [style.background]="boxColor(draftFor(group.metadata).styleId)" [style.color]="draftFor(group.metadata).styleId === 'cream' ? '#523F2B' : '#FDFBF7'" role="img" [attr.aria-label]="'Minh họa hộp ' + draftFor(group.metadata).styleName">
                        <span class="cart-box-brand">GIFTORY</span>
                        <span class="cart-box-engraving">{{ draftFor(group.metadata).engravingName || 'Tên của bạn' }}</span>
                        <span class="cart-box-message">{{ draftFor(group.metadata).engravingMessage || 'Gửi trao điều ý nghĩa' }}</span>
                      </div>
                      <p class="text-[11px] text-slate-500 mt-2">Minh họa màu và nội dung khắc.</p>
                    </div>
                    <div class="min-w-0">
                      <fieldset [disabled]="boxBusy()" class="mb-4">
                        <legend class="text-xs font-semibold text-[#523F2B] mb-2">Chọn style hộp</legend>
                        <div class="flex flex-wrap gap-2">
                          @for (style of setbox.styles; track style.id) {
                            <button type="button" [attr.aria-pressed]="draftFor(group.metadata).styleId === style.id" (click)="editBox(group.metadata, { styleId: style.id, styleName: style.name })" class="cart-box-style" [class.active]="draftFor(group.metadata).styleId === style.id">
                              <span class="inline-block w-3 h-3 rounded-full border border-[#B8A88D]" [style.background]="style.color"></span> {{ style.name }}
                            </button>
                          }
                        </div>
                      </fieldset>
                      <label class="block text-xs font-semibold text-[#523F2B] mb-3">
                        Khắc tên trên hộp <span class="font-normal">(không bắt buộc, tối đa 60 ký tự)</span>
                        <input type="text" maxlength="60" [ngModel]="draftFor(group.metadata).engravingName || ''" (ngModelChange)="editBox(group.metadata, { engravingName: $event })" [disabled]="boxBusy()" placeholder="Ví dụ: Minh Anh" class="block w-full mt-1.5 rounded-lg border border-[#DDD3C5] p-2.5 font-normal text-[#1A1A1A]">
                      </label>
                      <label class="block text-xs font-semibold text-[#523F2B]">
                        Lời chúc trên hộp <span class="font-normal">(không bắt buộc, tối đa 200 ký tự)</span>
                        <textarea rows="3" maxlength="200" [ngModel]="draftFor(group.metadata).engravingMessage || ''" (ngModelChange)="editBox(group.metadata, { engravingMessage: $event })" [disabled]="boxBusy()" placeholder="Viết lời chúc dành riêng cho người nhận…" class="block w-full mt-1.5 rounded-lg border border-[#DDD3C5] p-2.5 font-normal text-[#1A1A1A]"></textarea>
                      </label>
                      <p class="text-[11px] text-slate-500 mt-2">Yêu cầu khắc được gửi kèm đơn hàng. Để trống nếu bạn không muốn khắc hộp.</p>
                      @if (boxDrafts[group.metadata.id]) {
                        <button type="button" (click)="saveBox(group.metadata.id)" [disabled]="boxBusy()" class="mt-3 rounded-lg bg-[#D4AF37] px-4 py-2 text-xs font-bold text-[#1A1A1A] disabled:opacity-50">Lưu mẫu hộp & nội dung khắc</button>
                      }
                    </div>
                  </div>
                  <ul class="mt-4 border-t border-[#DDD3C5] pt-3 space-y-2">
                    @for (line of group.items; track line._id) {
                      <li class="flex items-center gap-3 text-xs">
                        <img [src]="line.customDetails?.previewImage || line.image || line.productId?.images?.[0] || '/logo.png'" alt="" class="w-10 h-10 object-contain rounded border border-[#DDD3C5]">
                        <span class="flex-1 min-w-0 break-words">{{ line.productId?.name }} × {{ line.quantity }}</span>
                        <strong class="shrink-0">{{ line.price * line.quantity | number:'1.0-0' }}đ</strong>
                      </li>
                    }
                  </ul>
                  <p class="flex justify-between text-sm font-bold mt-4"><span>Tổng sản phẩm trong hộp</span><span>{{ group.total | number:'1.0-0' }}đ</span></p>
                </article>
              }
              <p role="status" aria-live="polite" class="text-xs text-[#523F2B] mt-3">
                @if (boxBusy()) { Đang lưu giỏ hàng… }
                @else if (hasBoxDrafts()) { Có thay đổi hộp chưa lưu. Lưu trước khi ghép thêm món; khi đặt hàng, thay đổi sẽ được lưu tự động. }
              </p>
              @if (boxError) { <p role="alert" class="mt-2 text-sm text-red-800">{{ boxError }}</p> }
            </section>

            <!-- Action Link -->
            <div class="pt-2 flex items-center justify-between">
              <a routerLink="/products" class="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-[#523F2B]">
                <span class="material-symbols-outlined text-[16px]">west</span>
                <span>Tiếp tục chọn thêm quà tặng</span>
              </a>
            </div>
          </div>

          <!-- RIGHT COLUMN: PRICE BREAKDOWN & 50% DEPOSIT CHECKOUT PANEL -->
          <div class="lg:col-span-5 flex flex-col gap-6">
            <div class="bg-white rounded-3xl p-6 shadow-shop-card border border-[#DDD3C5] flex flex-col gap-5">
              
              <div class="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
                <h3 class="font-bold text-base text-[#1A1A1A]">Tóm tắt đơn hàng</h3>
                <span class="text-xs text-slate-500">{{ cartService.productCount() }} sản phẩm · {{ cartService.itemsCount() }} món</span>
              </div>

              <label class="text-xs text-slate-600">Giao hàng dự kiến
                <select aria-label="Giao hàng dự kiến" [ngModel]="cartService.cart()?.shippingMethod || 'STANDARD'" (ngModelChange)="changeShipping($event)" [disabled]="boxBusy() || shippingBusy" class="w-full mt-2 border border-purple-200 rounded-xl p-2">
                  <option value="STANDARD">Tiêu chuẩn · Miễn phí từ 250.000đ</option>
                  <option value="EXPRESS">Hỏa tốc · 50.000đ</option>
                </select>
              </label>
              <app-cart-vouchers />

              <!-- Price Breakdown Lines -->
              <div class="flex flex-col gap-2 pt-2 border-t border-slate-100 text-xs text-slate-600">
                <div class="flex items-center justify-between">
                  <span>Tổng tiền hàng ({{ cartService.itemsCount() }} món):</span>
                  <span class="font-bold text-[#1A1A1A]">{{ cartService.pricing().itemsTotal | number:'1.0-0' }}đ</span>
                </div>
                <div class="flex items-center justify-between">
                  <span>Gói quà nghệ thuật lụa:</span>
                  <span class="text-emerald-600 font-bold">Miễn phí</span>
                </div>
                @if (cartService.pricing().voucherDiscount > 0) {
                  <div class="flex items-center justify-between text-[#523F2B]">
                    <span>Ưu đãi Voucher {{ cartService.cart()?.voucherCode }}:</span>
                    <span class="font-bold">-{{ cartService.pricing().voucherDiscount | number:'1.0-0' }}đ</span>
                  </div>
                }
                <div class="flex items-center justify-between">
                  <span>Phí vận chuyển dự kiến:</span>
                  <span class="font-semibold text-slate-800">
                    {{ (cartService.pricing().baseShippingFee ?? cartService.pricing().shippingFee) === 0 ? 'Miễn phí' : (((cartService.pricing().baseShippingFee ?? cartService.pricing().shippingFee) | number:'1.0-0') + 'đ') }}
                  </span>
                </div>

                @if ((cartService.pricing().shippingDiscount || 0) > 0) {
                  <div class="flex items-center justify-between text-purple-700"><span>Ưu đãi vận chuyển:</span><strong>-{{ cartService.pricing().shippingDiscount | number:'1.0-0' }}đ</strong></div>
                }
                <div class="flex items-center justify-between pt-2 border-t border-slate-100 text-sm font-bold text-[#1A1A1A]">
                  <span>Tổng giá trị đơn hàng:</span>
                  <span class="text-base text-[#1A1A1A]">{{ cartService.pricing().totalAmount | number:'1.0-0' }}đ</span>
                </div>
              </div>

              @if (cartService.pricing().totalCustomItems > 0) {
                <!-- 50% Deposit Summary Card for Custom Items -->
                <div class="p-4 rounded-2xl bg-[#FDFBF7] border border-[#DDD3C5] flex flex-col gap-2">
                  <div class="flex items-center justify-between">
                    <span class="text-xs font-bold text-[#523F2B] uppercase tracking-wide">
                      Tiền cọc 50% thiết kế:
                    </span>
                    <span class="text-xl font-extrabold text-[#523F2B]">
                      {{ cartService.pricing().depositAmount | number:'1.0-0' }}đ
                    </span>
                  </div>
                  <p class="text-[11px] text-slate-500">
                    Cọc trước 50% cho {{ cartService.pricing().totalCustomItems }} sản phẩm custom theo quy định xưởng
                  </p>
                  <div class="flex items-center justify-between pt-2 border-t border-purple-200/50 text-xs font-semibold text-slate-700">
                    <span>Còn lại thanh toán COD:</span>
                    <strong class="text-[#1A1A1A] font-bold text-sm">{{ cartService.pricing().remainingCodAmount | number:'1.0-0' }}đ</strong>
                  </div>
                </div>
              }

              <!-- Checkout Submit Button -->
              <button 
                (click)="proceedToCheckout()"
                [disabled]="boxBusy() || shippingBusy || cartService.voucherSyncPending()"
                class="w-full py-3.5 px-4 bg-[#D4AF37] hover:bg-[#C09A2B] text-[#1A1A1A] rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-purple-300 transition-all active:scale-95 cursor-pointer disabled:opacity-50 disabled:cursor-wait"
              >
                <span class="material-symbols-outlined text-[18px]">verified</span>
                <span>Tiến Hành Đặt Hàng</span>
              </button>

              <div class="flex items-center justify-center gap-1.5 text-[11px] text-slate-400">
                <span class="material-symbols-outlined text-[15px]">lock</span>
                <span>Giao dịch an toàn 100% mã hóa 256-bit</span>
              </div>
            </div>
          </div>

        </div>
      }
    </div>
  `,
  styles: [`
    .cart-box-preview { min-height:185px; border:1px solid #B8A88D; border-radius:8px; padding:32px 12px 18px; text-align:center; box-shadow:0 8px 20px #523F2B15; border-top:12px solid #D4AF37; }
    .cart-box-brand { display:block; font-size:11px; letter-spacing:.22em; margin-bottom:18px; }
    .cart-box-engraving { display:block; font-size:18px; font-family:Georgia,serif; overflow-wrap:anywhere; }
    .cart-box-message { display:block; font-size:10px; white-space:pre-wrap; overflow-wrap:anywhere; margin-top:10px; }
    .cart-box-style { display:inline-flex; gap:6px; align-items:center; border:1px solid #DDD3C5; border-radius:8px; padding:8px; font-size:11px; background:#FDFBF7; }
    .cart-box-style.active { border-color:#523F2B; box-shadow:inset 0 0 0 1px #523F2B; font-weight:700; }
    :host :focus-visible { outline:3px solid #523F2B; outline-offset:3px; }
  `]
})
export class CartComponent {
  cartService = inject(CartService);
  authService = inject(AuthService);
  private router = inject(Router);
  setbox = inject(SetboxService);
  boxDrafts: Record<string, BoxMetadata> = {};
  boxError = '';
  private savingBoxes = false;
  boxGroups = computed(() => {
    const groups = new Map<string, { metadata: BoxMetadata; items: CartItem[]; quantity: number; total: number }>();
    for (const item of this.cartService.items()) {
      const metadata = item.customDetails?.setbox;
      if (!metadata) continue;
      let group = groups.get(metadata.id);
      if (!group) { group = { metadata, items: [], quantity: 0, total: 0 }; groups.set(metadata.id, group); }
      group.items.push(item); group.quantity += item.quantity; group.total += item.price * item.quantity;
    }
    return [...groups.values()];
  });
  boxBusy() { return this.savingBoxes || this.cartService.setboxSyncPending() || this.cartService.quantitySyncPending(); }
  hasBoxDrafts() { return this.boxGroups().some(group => !!this.boxDrafts[group.metadata.id]); }
  draftFor(metadata: BoxMetadata) { return this.boxDrafts[metadata.id] || metadata; }
  boxColor(styleId: string) { return this.setbox.styles.find(style => style.id === styleId)?.color || '#F0E6D6'; }
  editBox(metadata: BoxMetadata, changes: Partial<BoxMetadata>) {
    this.boxDrafts[metadata.id] = { ...this.draftFor(metadata), ...changes };
  }
  private newBox(): BoxMetadata {
    const style = this.setbox.styles[0];
    return { id: crypto.randomUUID(), styleId: style.id, styleName: style.name };
  }
  private async applyBox(items: CartItem[], metadata: BoxMetadata | null): Promise<boolean> {
    this.boxError = '';
    if (items.some(item => !item._id)) { this.boxError = 'Vui lòng tải lại giỏ hàng trước khi chọn hộp.'; return false; }
    try {
      await firstValueFrom(this.cartService.updateSetbox(items.map(item => item._id!), metadata));
      return true;
    } catch (err: any) {
      this.boxError = err.error?.message || 'Không lưu được Setbox. Vui lòng thử lại trước khi thanh toán.';
      return false;
    }
  }
  async assignBox(index: number, id: string) {
    if (this.boxBusy() || this.hasBoxDrafts()) return;
    const item = this.cartService.items()[index];
    if (!item) return;
    const metadata = id === '__new' ? this.newBox() : this.boxGroups().find(group => group.metadata.id === id)?.metadata || null;
    await this.applyBox([item], metadata);
  }
  async createBoxForAll() {
    if (this.boxBusy() || this.hasBoxDrafts()) return;
    await this.applyBox(this.cartService.items(), this.newBox());
  }
  async removeBox(id: string) {
    if (this.boxBusy() || this.hasBoxDrafts()) return;
    const group = this.boxGroups().find(group => group.metadata.id === id);
    if (group) await this.applyBox(group.items, null);
  }
  async saveBox(id: string): Promise<boolean> {
    const group = this.boxGroups().find(group => group.metadata.id === id);
    const draft = this.boxDrafts[id];
    if (!group || !draft) return true;
    if ((draft.engravingName?.length || 0) > 60 || (draft.engravingMessage?.length || 0) > 200) {
      this.boxError = 'Tên tối đa 60 ký tự, lời chúc tối đa 200 ký tự.'; return false;
    }
    if (!await this.applyBox(group.items, draft)) return false;
    delete this.boxDrafts[id];
    return true;
  }


  shippingBusy = false;
  changeShipping(method: 'STANDARD' | 'EXPRESS') {
    this.shippingBusy = true;
    this.cartService.setShippingMethod(method).subscribe({
      next: () => this.shippingBusy = false,
      error: () => { this.shippingBusy = false; this.cartService.notify('Không đổi được giao hàng. Vui lòng thử lại.'); }
    });
  }

  updateQuantity(index: number, qty: number): void {
    if (this.savingBoxes || this.cartService.setboxSyncPending()) return;
    this.cartService.updateQuantity(index, qty).subscribe();
  }

  removeItem(index: number): void {
    if (this.boxBusy()) return;
    this.cartService.removeItem(index).subscribe({ error: () => this.cartService.notify('Không xóa được sản phẩm. Vui lòng thử lại.') });
  }

  clearCart(): void {
    if (this.boxBusy()) return;
    if (confirm('Bạn có chắc chắn muốn xóa toàn bộ giỏ hàng?')) {
      this.cartService.clearCart().subscribe({ error: () => this.cartService.notify('Không xóa được giỏ hàng. Vui lòng thử lại.') });
    }
  }

  setPaymentMode(mode: 'DEPOSIT_50' | 'FULL_PAYMENT'): void {
    this.cartService.setPaymentMode(mode).subscribe();
  }

  async proceedToCheckout(): Promise<void> {
    if (this.boxBusy() || this.shippingBusy || this.cartService.voucherSyncPending()) return;
    this.savingBoxes = true;
    try {
      for (const group of this.boxGroups()) {
        if (!await this.saveBox(group.metadata.id)) return;
      }
      this.cartService.clearBuyNowItem();
      await this.router.navigate(['/checkout']);
    } finally { this.savingBoxes = false; }
  }
}
