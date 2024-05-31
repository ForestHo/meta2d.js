import { Pen } from '../../../pen';

export function terminate(pen: Pen, ctx?: CanvasRenderingContext2D): Path2D {
  const path = !ctx ? new Path2D() : ctx;
  const { x, y, width, height } = pen.calculative.worldRect;
  let gap = (pen.calculative as any).gap || 0;
  const hW = width / 2;
  const hH = height / 2;
  path.ellipse(
    x + hW,
    y + hH,
    hW,
    hH,
    0,
    0,
    Math.PI * 2
  );
  if(gap){
    path.moveTo(x + width - gap, y + hH);
    path.ellipse(
      x + hW,
      y + hH,
      hW - gap,
      hH - gap,
      0,
      0,
      Math.PI * 2
    );
  }

  if (path instanceof Path2D) {
    return path;
  }
}
