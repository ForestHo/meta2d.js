import { Pen, calcWorldAnchors } from '../../../pen';
import { round } from '../../../utils';
import { Point,AnchorType } from '../../../point'

const dashAnchorStep = 40; //虚线锚点的固定步长

export function dline(ctx: CanvasRenderingContext2D, pen: Pen) {
  const { x, y, width, height,ey } = pen.calculative.worldRect;
  
  if (!pen.onDestroy) {
    pen.onResize = onResize;
  }

  ctx.save();
  ctx.beginPath();
  ctx.lineWidth = 1;
  ctx.setLineDash([7, 7]);
  const middle = x + width / 2;
  const leftY = y;
  ctx.moveTo(middle, leftY);
  const endY = ey;
  ctx.lineTo(middle, endY);
  ctx.stroke();
  ctx.restore();
}
function onResize(pen: Pen) {
  const stepRatio = round(dashAnchorStep / pen.calculative.worldRect.height, 3);
  let startY = round(0 + stepRatio, 3), startX = 0.5;
  for (let i = 0; i < pen.anchors.length; i++) {
    const an = pen.anchors[i];
    // 拉伸之后，需要重新计算锚点的比例
    if (an.aType === AnchorType.DYNAMIC) {
      an.y = startY;
      startY = round(startY + stepRatio, 3);
    }
  }
  while (startY <= 1) {
    pen.anchors.push({ x: startX, y: startY, aType: AnchorType.DYNAMIC });
    startY = round(startY + stepRatio, 3);
  }
  // 超过1的锚点删除
  for (let i = 0; i < pen.anchors.length; i++) {
    const an = pen.anchors[i];
    if (an.y > 1) {
      pen.anchors.splice(i, 1);
      i--;
    }
  }
  calcWorldAnchors(pen);
}
export function dlineAnchors(pen: Pen) {
  const stepRatio = dashAnchorStep / pen.height;
  const points = [
    {
      x: 0.5,
      y: 0,
    },
    {
      x: 0.5,
      y: 1,
    },
  ] as const;
  // 下方虚线的锚点
  let startY = round(0 + stepRatio, 3), startX = 0.5;
  const arr = [];
  while (startY <= 1) {
    arr.push({ x: startX, y: startY, aType: AnchorType.DYNAMIC });
    startY = round(startY + stepRatio, 3);
  }
  points.push(...arr);
  // points.push({
  //   x: 0.5,
  //   y: 1,
  //   aType: AnchorType.OUTOFRECT
  // })
  pen.anchors = points.map((item, index) => {
    const obj = {
      id: `${index}`,
      penId: pen.id,
      x: item.x,
      y: item.y,
    }
    return Object.assign(obj,item);
  });
}