import { Injectable, signal } from '@angular/core';
import { Product } from '../models';
export interface SetboxLine { key: string; product: Product; quantity: number; variantSku?: string; variantName?: string; customDesignId?: string; customDetails?: any; }
@Injectable({ providedIn: 'root' })
export class SetboxService {
  readonly styles = [
    { id: 'cream', name: 'Kem thanh lịch', color: '#F0E6D6' },
    { id: 'walnut', name: 'Nâu óc chó', color: '#523F2B' },
    { id: 'charcoal', name: 'Đen than', color: '#2B2B2B' },
  ];
  readonly lines = signal<SetboxLine[]>([]);
  readonly style = signal('cream');
  readonly committed = signal(false);
  groupId = crypto.randomUUID();
  constructor() {
    try {
      const draft = JSON.parse(sessionStorage.getItem('giftory_setbox') || 'null');
      if (draft && Array.isArray(draft.lines) && this.styles.some(s => s.id === draft.style)) {
        this.committed.set(!!draft.committed); this.lines.set(draft.lines); this.style.set(draft.style); this.groupId = draft.groupId || this.groupId;
      }
    } catch { /* A damaged draft must not prevent shopping. */ }
  }
  persist() { sessionStorage.setItem('giftory_setbox', JSON.stringify({ lines: this.lines(), style: this.style(), groupId: this.groupId, committed: this.committed() })); }
  add(line: Omit<SetboxLine, 'key'>) { const previous = this.lines(); this.lines.set([...previous, { ...line, key: crypto.randomUUID() }]); try { this.persist(); } catch (error) { this.lines.set(previous); throw error; } }
  remove(key: string) { this.lines.update(lines => lines.filter(line => line.key !== key)); this.persist(); }
  metadata() { const style = this.styles.find(s => s.id === this.style())!; return { id: this.groupId, styleId: style.id, styleName: style.name }; }
}
