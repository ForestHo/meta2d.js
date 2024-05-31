
import { Pen } from '../../../pen';

export function needinterface(pen: Pen, ctx?: CanvasRenderingContext2D): Path2D {
  const path = !ctx ? new Path2D() : ctx;
  // 1.绘制矩形外框
  let wr = pen.calculative.borderRadius || 0,
    hr = wr;
  const { x, y, width, height, ex, ey } = pen.calculative.worldRect;
  if (wr < 1) {
    wr = width * wr;
    hr = height * hr;
  }
  let r = wr < hr ? wr : hr;
  if (width < 2 * r) {
    r = width / 2;
  }
  if (height < 2 * r) {
    r = height / 2;
  }

  path.moveTo(x + r, y);
  path.arcTo(ex, y, ex, ey, r);
  path.arcTo(ex, ey, x, ey, r);
  path.arcTo(x, ey, x, y, r);
  path.arcTo(x, y, ex, y, r);

  // 2.绘制里面的形状
  const offsetX = 10,w = 20,h = 30;
  const startY = y + offsetX-3;
  const startX = ex - offsetX-w-3;
  const endX = startX+w;
  const endY = startY+h;
  path.moveTo(startX, startY);
  path.lineTo(endX - offsetX, startY);
  path.lineTo(endX, startY + offsetX);
  path.lineTo(endX, endY);
  path.lineTo(startX, endY);
  path.closePath();
  path.moveTo(endX - offsetX, startY);
  path.lineTo(endX - offsetX, startY + offsetX);
  path.lineTo(endX, startY + offsetX);
  path.closePath();

  if (path instanceof Path2D) {
    return path;
  }
}
