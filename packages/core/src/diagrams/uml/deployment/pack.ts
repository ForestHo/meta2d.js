import { Pen } from '../../../pen';

export function pack(ctx: CanvasRenderingContext2D, pen: Pen) {
  const { x, y, width,height, ex, ey } = pen.calculative.worldRect;
  const fillStyle = pen.background ||"";
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x + width, y);
  ctx.lineTo(x + width, ey);
  ctx.lineTo(ex,ey);
  ctx.lineTo(x, ey);
  ctx.lineTo(x, y);
  ctx.stroke();
  ctx.closePath();

  const w = 50,h=30;
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x, y-h);
  ctx.lineTo(x+w, y-h);
  ctx.lineTo(x+w, y);
  fillStyle && ctx.fill();
  ctx.stroke();
  ctx.closePath();
}
