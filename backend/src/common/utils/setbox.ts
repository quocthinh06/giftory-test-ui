import { BadRequestException } from '@nestjs/common';

export function normalizeSetbox(box: any) {
  const styles = { cream: 'Kem thanh lịch', walnut: 'Nâu óc chó', charcoal: 'Đen than' };
  if (!box || typeof box !== 'object' || typeof box.id !== 'string' ||
      !/^[a-zA-Z0-9-]{1,64}$/.test(box.id) || typeof box.styleId !== 'string' || !Object.hasOwn(styles, box.styleId) ||
      (box.engravingName !== undefined && (typeof box.engravingName !== 'string' || box.engravingName.length > 60)) ||
      (box.engravingMessage !== undefined && (typeof box.engravingMessage !== 'string' || box.engravingMessage.length > 200))) {
    throw new BadRequestException('Thông tin hộp quà không hợp lệ. Tên tối đa 60 ký tự, lời chúc tối đa 200 ký tự.');
  }
  return {
    id: box.id, styleId: box.styleId, styleName: styles[box.styleId],
    engravingName: box.engravingName?.trim() || '', engravingMessage: box.engravingMessage?.trim() || '',
  };
}
