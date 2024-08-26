import { Pen } from '../../../pen';

export function circle1(pen: Pen, ctx?: CanvasRenderingContext2D): Path2D {
  const path = !ctx ? new Path2D() : ctx;
  const { x, y, width, height } = pen.calculative.worldRect;
  if (!pen.onDestroy) {
    pen.onDestroy = destroy;
  }
  path.ellipse(
    x + width / 2,
    y + height / 2,
    width / 2,
    height / 2,
    0,
    0,
    Math.PI * 2
  );

  if (path instanceof Path2D) {
    return path;
  }
}
function destroy(pen: Pen) {
  const partners = pen.calculative.canvas.store.data.pens.filter(el => el.partnerIds && el.partnerIds.includes(pen.id))
  pen.calculative.canvas.delete(partners);
}