import { Pen } from '../../../pen';
import { Point } from '../../../point'

const lineHeight = 18, breakSymbol = '\n';
export function vtext(ctx: CanvasRenderingContext2D, pen: Pen) {
  const { x, y, width, height, ex, ey } = pen.calculative.worldRect;
  if (!pen.onDestroy) {
    pen.onDestroy = destory;
    pen.onShowInput = onShowInput;
    pen.onInput = onInput;
  }

  // 绘制文本的背景矩形
  const { tw, th, text, minH, minW, ch } = pen.trect;
  if (tw < minW) {
    pen.trect.tw = minW;
  }
  if (th < minH) {
    pen.trect.th = minH;
  }
  ctx.beginPath();
  ctx.fillRect(x, y, pen.trect.tw, pen.trect.th);
  const fillStyle = pen.background || "";
  ctx.fillStyle = fillStyle;
  ctx.fill();

  ctx.beginPath();
  ctx.fillStyle = "white";
  ctx.textBaseline = "middle";
  const lines = pen.trect.text.split(breakSymbol);
  let currentY = y, startX = x;
  let tY = currentY + lineHeight / 2;
  if (lines.length === 1) {
    tY = currentY + height / 2;
  }
  for (let k = 0; k < lines.length; k++) {
    const l = lines[k];
    ctx.fillText(l, startX, tY);
    tY += lineHeight;
  }

  // 绘制外框
  ctx.strokeStyle = pen.color;
  const h = pen.trect.th;
  // ctx.strokeRect(x, y, width, h);
  // ctx.closePath();
  pen.height = h;
  pen.calculative.canvas.updatePenRect(pen);

}
//将输入的数据写入到对应的data中
function onInput(pen: any, text: string, { h, w }) {
  // console.log('onInput', text, h, w);
  pen.trect.text = text;
  pen.trect.tw = parseInt(w);
  pen.trect.th = parseInt(h);
  console.log('h more', pen.partnerIds);
  if (pen.partnerIds && pen.partnerIds.length > 0) {
    // 动态向上增加高度
    const fPen = pen.calculative.canvas.store.data.pens.find(el=> el.id === pen.partnerIds[0]);
    if (fPen && pen.direction === 'up') {
      pen.calculative.worldRect.ey = fPen.calculative.worldRect.y;
      pen.calculative.worldRect.y = pen.calculative.worldRect.ey - h;
      pen.y = pen.calculative.worldRect.y;
    }
  }
  pen.calculative.canvas.store.emitter.emit('valueUpdate', pen);
  pen.calculative.isInput = false;
  pen.calculative.isHover = true;
  pen.calculative.canvas.render();
}
function destory(pen: Pen) { }
function onShowInput(pen: any, e: Point) {
  pen.calculative.tempText = pen.trect.text || '';
  const rect = {
    x: pen.calculative.worldRect.x,
    y: pen.calculative.worldRect.y,
    ex: pen.calculative.worldRect.x + pen.trect.tw,
    ey: pen.calculative.worldRect.y + pen.trect.th,
    maxWidth: pen.calculative.worldRect.width,
    minH: pen.trect.minH
  }
  pen.calculative.canvas.showInput(pen, rect, '#ffffff');
}