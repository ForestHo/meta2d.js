import { Pen } from '../../../pen';

export function divider(ctx: CanvasRenderingContext2D, pen: Pen) {
  const { x, y, width, height, ex, ey } = pen.calculative.worldRect;
  const w = 10, h = 5;
  const gap = 5;
  const count = Math.floor(width / (w + gap));
  let startX = x;
  let startY = y + height / 2 - h / 2;
  ctx.beginPath();
  ctx.rect(x, y, width, height);
  ctx.stroke();
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