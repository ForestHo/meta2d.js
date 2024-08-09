import { Pen } from '../../../pen';
const yOffset = 20, xOffset = 60, xOffset2 = 5;
export function recyclefragment(ctx: CanvasRenderingContext2D, pen: Pen) {
  const { x, y, width, height, ex, ey } = pen.calculative.worldRect;

  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(ex, y);
  ctx.lineTo(ex, ey);
  ctx.lineTo(x, ey);
  ctx.lineTo(x, y);

  ctx.moveTo(x, y + yOffset);
  ctx.lineTo(x + xOffset, y + yOffset);
  ctx.lineTo(x + xOffset + xOffset2, y + yOffset - xOffset2);
  ctx.lineTo(x + xOffset + xOffset2, y);
  ctx.stroke();
  ctx.closePath();
}
