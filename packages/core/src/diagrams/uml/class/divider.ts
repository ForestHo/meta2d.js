import { Pen } from '../../../pen';

export function divider(ctx: CanvasRenderingContext2D, pen: Pen) {
  const { x, y, width, height, ex, ey } = pen.calculative.worldRect;
  const w = 4, h = 1;
  const gap = 2;
  const count = Math.floor(width / (w + gap));
  let startX = x;
  let startY = y + height / 2 - h / 2;
  ctx.beginPath();
  for (let i = 0; i <= count; i++) {
    ctx.beginPath();
    if (startX < ex) {
      if (startX + w <= ex) {
        ctx.rect(startX, startY, w, h);
      } else {
        ctx.rect(startX, startY, ex - (startX + w), h);
      }
    }
    startX += (gap + w);
    ctx.fill();
    ctx.stroke();
  }
}