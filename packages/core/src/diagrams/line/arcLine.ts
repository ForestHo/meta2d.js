import { Pen } from '../../pen';
// 画圆弧
export function arcLine(pen: Pen, ctx?: CanvasRenderingContext2D): Path2D {

  const path = !ctx ? new Path2D() : ctx;
  const { x, y,width,height ,center} = pen.calculative.worldRect;

  // 起始角度，终点角度  TODO 计算起始和终点角度
  const { startAngle, endAngle } = pen as any;
  const r = pen.radius;
  path.ellipse(
    x + width / 2,
    y + height / 2,
    width / 2,
    height / 2,
    0,
    startAngle,
    endAngle
  );
  if (path instanceof Path2D) return path;
}

