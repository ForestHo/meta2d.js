import { Pen } from '../../../pen';

export function terminate1(ctx: CanvasRenderingContext2D, pen: Pen) {
  const { x, y, width, height } = pen.calculative.worldRect;
  let gap = (pen.calculative as any).gap || 0;
  const fillStyle = pen.background ||"";
  const hW = width / 2;
  const hH = height / 2;
  ctx.beginPath();
  ctx.arc(
    x + hW,
    y + hH,
    hW,
    0,
    Math.PI * 2
  );
  ctx.stroke();
  ctx.closePath();
  if(gap){
    ctx.beginPath();
    ctx.moveTo(x + width - gap, y + hH);
    ctx.arc(
      x + hW,
      y + hH,
      hW - gap,
      0,
      Math.PI * 2
    );
    ctx.stroke();
    fillStyle && ctx.fill();
    ctx.closePath();
  }
}
