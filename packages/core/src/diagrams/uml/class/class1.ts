import { Pen } from '../../../pen';

export function class1(ctx: CanvasRenderingContext2D, pen: Pen) {
  const { x, y, width, height, ex, ey } = pen.calculative.worldRect;
  console.log(pen.list);
  // 绘制header
  const h1 = 50;
  ctx.beginPath();
  ctx.strokeStyle = 'black';
  ctx.rect(x, y, width, h1);
  ctx.stroke();
  ctx.fill();
  ctx.closePath();

  // 绘制body
  const h = 40, padding = 7;
  const startY = y + h1 + padding, startX = x + padding;
  let currentY = startY;
  for (let i = 0; i < pen.list.length; i++) {
    const item = pen.list[i];
    if (item.name === 'member') {
      ctx.beginPath();
      ctx.rect(startX, currentY, width - padding * 2, h);
      ctx.stroke();
      currentY += h;
    } else if (item.name === 'divider') {
      div(ctx, startX, currentY, ex, width - padding * 2, 10);
      currentY += 10;
    }
  }
  ctx.closePath();
  pen.calculative.worldRect.ey = currentY;
}

function div(ctx: CanvasRenderingContext2D, x: number, y: number, ex: number, width: number, height: number) {
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