import { Pen } from '../../../pen';

export function title(ctx: CanvasRenderingContext2D, pen: Pen) {
  let wr = pen.calculative.borderRadius || 0,
    hr = wr;
  const { x, y, width, height, ex, ey } = pen.calculative.worldRect;
  const fillStyle = pen.background || "";
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

  // 1.绘制下方区域
  ctx.beginPath();
  //从右下角顺时针绘制，弧度从0到1/2PI  
  ctx.arc(ex - r, ey - r, r, 0, Math.PI / 2);

  // //矩形下边线  
  ctx.lineTo(x + r, ey);

  // //左下角圆弧，弧度从1/2PI到PI  
  ctx.arc(x + r, ey - r, r, Math.PI / 2, Math.PI);

  // //矩形左边线  
  ctx.lineTo(x, y + r);
  ctx.moveTo(ex, y + r);
  //右边线  
  ctx.lineTo(ex, ey - r);
  ctx.stroke();
  ctx.closePath();

  // 2.绘制上面区域
  ctx.beginPath();
  ctx.moveTo(x, y + r);
  // //左上角圆弧，弧度从PI到3/2PI  
  ctx.arc(x + r, y + r, r, Math.PI, Math.PI * 3 / 2);

  //上边线  
  ctx.lineTo(ex - r, y);

  //右上角圆弧  
  ctx.arc(ex - r, y + r, r, Math.PI * 3 / 2, Math.PI * 2);
  ctx.lineTo(ex, y + r);
  fillStyle && ctx.fill();
  ctx.stroke();
  ctx.closePath();
}
