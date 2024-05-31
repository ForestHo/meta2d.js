import { Pen } from '../../../pen';

export function componentexample(pen: Pen, ctx?: CanvasRenderingContext2D): Path2D {
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
  const offset = 10;
  const w1 = 20,w2 = 30,h=7;
  const x1 = ex-offset-w2-w1/2;
  const x2 = x1-w1/2;
  const y1 = y + offset*2;
  const y2 = y1+h*2;
  path.rect(x2, y1, w1, h);
  path.rect(x2, y2, w1, h);
  path.moveTo(x1, y1+h);
  path.lineTo(x1, y2);
  path.moveTo(x1, y1);
  path.lineTo(x1, y1-h);
  path.lineTo(x1+w2, y1-h);
  path.lineTo(x1+w2, y1+4*h);
  path.lineTo(x1, y1+4*h);
  path.lineTo(x1, y1+3*h);
  if (path instanceof Path2D) {
    return path;
  }
}
