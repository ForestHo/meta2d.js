import { Pen, calcWorldAnchors } from '../../../pen';
import { Point } from '../../../point'
import { pointInSimpleRect } from '../../../rect'
import { s8 } from '../../../utils'

const lineHeight = 18, breakSymbol = '\n', padding = 7;
export function pack(ctx: CanvasRenderingContext2D, pen: Pen) {
  const { x, y, width, height, ex, ey } = pen.calculative.worldRect;
  if (!pen.onDestroy) {
    pen.onAdd = onAdd;
    pen.onShowInput = onShowInput;
  }


  // 绘制下方的矩形
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x + width, y);
  ctx.lineTo(x + width, ey);
  ctx.lineTo(ex, ey);
  ctx.lineTo(x, ey);
  ctx.lineTo(x, y);
  ctx.stroke();
  ctx.closePath();


  // 绘制上方的矩形
  // const { tw, th, text, minH, minW, ch } = pen.trect;
  // ctx.beginPath();
  // ctx.fillRect(x, y - th, tw, th);
  // const fillStyle = pen.background || "";
  // ctx.fill();

  // // 绘制上方的文本
  // const w = 50, h = 30;
  // ctx.beginPath();
  // ctx.textBaseline = "middle";
  // ctx.fillStyle = "white";
  // const lines = pen.trect.text.split(breakSymbol);
  // let currentY = y - th , startX = x;
  // let tY = currentY + lineHeight / 2;
  // if (lines.length === 1) {
  //   tY = currentY + pen.trect.th / 2;
  // }
  // for (let k = 0; k < lines.length; k++) {
  //   const l = lines[k];
  //   ctx.fillText(l, startX, tY, width);
  //   tY += lineHeight;
  // }
  // ctx.closePath();
}
function onShowInput(pen: any, e: Point) {
  return null;
}
function onAdd(pen: Pen) {
  if (!pen.followers) {
    pen.followers = [];
  }
  const p: Pen = {
    id: s8(),
    width: pen.width,
    height: 20,
    color: '#6495ED',
    background: '#6495ED',
    ratio: true,
    disableSize: true,
    disableDelete: true,
    trect: { text: '文本', name: 'text', minH: 20, minW: 20, tw: 60, th: 20 },
    name: 'vtext',
    direction: 'up',
    followed: pen.id,
    x: pen.calculative.worldRect.x,
    y: pen.calculative.worldRect.y - 20,
  };
  pen.calculative.canvas.makePen(p);
  pen.followers.push(p.id);
}