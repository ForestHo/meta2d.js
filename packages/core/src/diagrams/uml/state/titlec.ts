import { Pen } from '../../../pen';

export function titlec(ctx: CanvasRenderingContext2D, pen: Pen) {
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
  ctx.moveTo(x, y + r);
  ctx.lineTo(ex, y + r);
  fillStyle && ctx.fill();
  ctx.stroke();
  ctx.closePath();



  ctx.beginPath();
  const w1 = 40, h1 = 16;
  const startY = ey - h1 * 2;
  const startX2 = ex - w1;
  const borderRadius = 0.5;
  if (borderRadius < 1) {
    wr = w1 * borderRadius;
    hr = h1 * borderRadius;
  }
  let r1 = wr < hr ? wr : hr;
  if (w1 < 2 * r1) {
    r1 = w1 / 2;
  }
  if (h1 < 2 * r1) {
    r1 = h1 / 2;
  }

  ctx.beginPath();
  ctx.moveTo(startX2 + r1, startY);
  ctx.arcTo(
    startX2 + w1,
    startY,
    startX2 + w1,
    startY + h1,
    r1
  );
  ctx.arcTo(
    startX2 + w1,
    startY + h1,
    startX2,
    startY + h1,
    r1
  );
  ctx.arcTo(startX2, startY + h1, startX2, startY, r1);
  ctx.arcTo(startX2, startY, startX2 + w1, startY, r1);
  ctx.closePath();
  ctx.stroke();


  // 绘制下面的图形
  const distance = 10;
  const startX = startX2 - w1 - distance;

  ctx.beginPath();
  ctx.moveTo(startX + r1, startY);
  ctx.arcTo(
    startX + w1,
    startY,
    startX + w1,
    startY + h1,
    r1
  );
  ctx.arcTo(
    startX + w1,
    startY + h1,
    startX,
    startY + h1,
    r1
  );
  ctx.arcTo(startX, startY + h1, startX, startY, r1);
  ctx.arcTo(startX, startY, startX + w1, startY, r1);

  ctx.moveTo(startX + w1, startY + h1 / 2);
  ctx.lineTo(ex - w1, startY + h1 / 2);
  ctx.closePath();
  ctx.stroke();
}
