import { Pen } from '../../../pen';

export function plifeline(ctx: CanvasRenderingContext2D, pen: Pen) {
  const headHeight = (pen as any).headHeight ?? 50;
  const { x, y, width, height, ey } = pen.calculative.worldRect;
  const fillStyle = pen.background ||"";
  
  const r1 = 100;
  const offset = r1 / 10;
  const h = 100;
  const w = r1/2;
  const rx = x + width / 2;
  const yq = y-h;
  const xq = rx - w/2;
  ctx.arc(
    rx,
    yq,
    offset,
    0,
    Math.PI * 2
  );
  const startY = yq + h / 2 + offset*2;
  const y1 = startY - offset * 4;
  ctx.moveTo(xq, startY);
  ctx.lineTo(xq, y1);

  const y2 = y1 - offset/2;
  ctx.lineTo(xq + offset/2, y2);
  ctx.lineTo(xq + w - offset/2, y2);
  ctx.lineTo(xq + w, y1);
  ctx.lineTo(xq + w, startY);
  ctx.lineTo(xq + w-offset, startY);
  ctx.lineTo(xq + w-offset, startY-offset*2);

  ctx.lineTo(xq + w-offset, startY);
  ctx.lineTo(xq + w-offset, yq+h);
  ctx.lineTo(xq + w/2, yq+h);
  ctx.lineTo(xq + w/2, (yq+h/2+offset));
  ctx.lineTo(xq + w/2, yq+h);
  ctx.lineTo(xq + offset, yq+h);
  ctx.lineTo(xq + offset, startY-offset*2);
  ctx.lineTo(xq + offset, startY);
  ctx.lineTo(xq , startY);
  fillStyle && ctx.fill();
  ctx.stroke();
  ctx.closePath();


  let wr = pen.calculative.borderRadius || 0,
    hr = wr;
  if (pen.calculative.borderRadius < 1) {
    wr *= width;
    hr *= height;
  }
  let r = wr < hr ? wr : hr;
  if (width < 2 * r) {
    r = width / 2;
  }
  if (headHeight < 2 * r) {
    r = headHeight / 2;
  }
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + width, y, x + width, y + headHeight, r);
  ctx.arcTo(x + width, y + headHeight, x, y + headHeight, r);
  ctx.arcTo(x, y + headHeight, x, y, r);
  ctx.arcTo(x, y, x + width, y, r);
  fillStyle && ctx.fill();
  ctx.closePath();
  ctx.stroke();

  ctx.save();
  ctx.beginPath();
  ctx.lineWidth = 1;
  ctx.setLineDash([7, 7]);
  const middle = x + width / 2;
  ctx.moveTo(middle, y + headHeight + 1);
  ctx.lineTo(middle, ey);
  ctx.stroke();
  ctx.restore();
}
