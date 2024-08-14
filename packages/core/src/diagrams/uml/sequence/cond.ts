import { Pen, calcWorldAnchors } from '../../../pen';
import { Point } from '../../../point'
import { pointInSimpleRect } from '../../../rect'
import { s8 } from '../../../utils'

const lineHeight = 18, breakSymbol = '\n',padding = 7;
export function cond(ctx: CanvasRenderingContext2D, pen: Pen) {
  const { x, y, width, height, ex, ey } = pen.calculative.worldRect;
  if (!pen.onDestroy) {
    pen.onDestroy = destory;
    pen.onShowInput = onShowInput;
    pen.onInput = onInput;
  }

  ctx.beginPath();
  ctx.fillStyle = pen.color;
  ctx.textBaseline = "middle";
  const lines = pen.trect.text.split(breakSymbol);
  let currentY = y+padding,startX = x+padding;
  let tY = currentY + lineHeight / 2;
  if (lines.length === 1) {
    tY = currentY + pen.trect.th / 2;
  }
  for (let k = 0; k < lines.length; k++) {
    const l = lines[k];
    ctx.fillText(l, startX, tY, width);
    tY += lineHeight;
  }
  ctx.closePath();

}
//将输入的数据写入到对应的data中
function onInput(pen: any, text: string, {h, w}) {
  console.log('onInput', text, h,w);
  pen.trect.text = text;
  pen.trect.tw = parseInt(w);
  pen.trect.th = parseInt(h);
  pen.calculative.canvas.store.emitter.emit('valueUpdate', pen);
  pen.calculative.isInput = false;
  pen.calculative.isHover = true;
  pen.calculative.canvas.render();
}
function destory(pen: Pen) { }
function onShowInput(pen: any, e: Point) {
  pen.calculative.tempText = pen.trect.text || '';
  const rect = {
    x : pen.calculative.worldRect.x,
    y : pen.calculative.worldRect.y,
    ex : pen.calculative.worldRect.x + pen.trect.tw,
    ey : pen.calculative.worldRect.y + pen.trect.th,
    maxWidth : pen.calculative.worldRect.width,
    minH : pen.trect.minH
  }
  pen.calculative.canvas.showInput(pen, rect, '#ffffff');
}