import { Pen, calcWorldAnchors } from '../../../pen';
import { Point } from '../../../point'
import { pointInSimpleRect } from '../../../rect'
import { s8 } from '../../../utils'

let lastHighLightId = ""; //上次内部选中高亮的pen的id
const memberW = 160, padding = 7, lineHeight = 18, breakSymbol = '\n';
export function cstatus(ctx: CanvasRenderingContext2D, pen: Pen) {
  let wr = pen.calculative.borderRadius || 0,
    hr = wr;
  const { x, y, width, height, ex, ey } = pen.calculative.worldRect;
  if (!pen.onDestroy) {
    pen.onMouseDown = onMouseDown;
    pen.onShowInput = onShowInput;
    // pen.onMouseUp = onMouseUp;
    pen.onResize = onResize;
    pen.onInput = onInput;
  }
  if (!pen.hasOwnProperty('xylist')) {
    pen.xylist = [];
  }

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
  const titleH = pen.list.find(el => el.name === 'title').h;
  // console.log('titleH', titleH);
  // 1.绘制下方区域
  ctx.beginPath();
  // 从右下角顺时针绘制，弧度从0到1/2PI  
  ctx.arc(ex - r, ey - r, r, 0, Math.PI / 2);

  //矩形下边线  
  ctx.lineTo(x + r, ey);

  //左下角圆弧，弧度从1/2PI到PI  
  ctx.arc(x + r, ey - r, r, Math.PI / 2, Math.PI);
  ctx.moveTo(x, ey - r);
  ctx.lineTo(x, y + titleH);
  ctx.lineTo(ex, y + titleH);
  ctx.lineTo(ex, ey - r);


  // ctx.lineTo(x, y + r);
  // ctx.moveTo(ex, y + r);

  //矩形左边线  
  // ctx.lineTo(x, y + r);
  // ctx.moveTo(ex, y + r);
  // // // 右边线  
  // ctx.lineTo(ex, ey - r);
  ctx.stroke();
  ctx.closePath();

  // 2.绘制上面区域
  ctx.beginPath();
  // //左上角圆弧，弧度从PI到3/2PI  
  ctx.arc(x + r, y + r, r, Math.PI, Math.PI * 3 / 2);

  //左标题线  
  ctx.moveTo(x, y + r);
  ctx.lineTo(x, y + titleH);
  ctx.lineTo(ex, y + titleH);
  ctx.lineTo(ex, y + r);

  // ctx.moveTo(x, y + r);
  //右上角圆弧  
  ctx.arc(ex - r, y + r, r, 0, Math.PI * 3 / 2, true);
  // ctx.moveTo(x, y + r);
  ctx.lineTo(x + r, y);
  fillStyle && ctx.fill();
  ctx.stroke();
  ctx.closePath();

  // 绘制body
  const startY = y + padding, startX = x;
  let currentW = 0, currentY = y;
  pen.xylist = [];
  ctx.beginPath();
  ctx.fillStyle = pen.color;
  for (let i = 0; i < pen.list.length; i++) {
    const item = pen.list[i];
    let h = item.h;
    item.per = h / pen.height;
    if (!item) return;
    if (item.name === 'title') {
      ctx.fillStyle = "#fff";
      ctx.textBaseline = "middle";
      const lines = item.text.split(breakSymbol);
      let tY = currentY + lineHeight / 2;
      if (lines.length === 1) {
        tY = currentY + h / 2;
      }
      for (let k = 0; k < lines.length; k++) {
        const l = lines[k];
        ctx.fillText(l, startX, tY, width);
        tY += lineHeight;
      }
      pen.xylist.push({ x: x, y: currentY, ex: x + width, ey: currentY + h, width, height: h, minH: item.minH });
      currentY += h;
    } else if (item.name === 'content') {
      ctx.textBaseline = "middle";
      ctx.fillStyle = pen.color;
      const lines = item.text.split(breakSymbol);
      let tY = currentY + lineHeight / 2;
      if (lines.length === 1) {
        tY = currentY + h / 2;
      }
      for (let k = 0; k < lines.length; k++) {
        const l = lines[k];
        ctx.fillText(l, startX, tY, width);
        tY += lineHeight;
      }
      if (i === pen.highLightIndex) {
        ctx.strokeStyle = '#595959';
        ctx.stroke();
      }
      pen.xylist.push({ x: x, y: currentY, ex: x + width, ey: currentY + h, width, height: h, minH: item.minH });
      currentY += h;
    }
  }
  ctx.stroke();
  ctx.closePath();
}
function onResize(pen: Pen) {
  // console.log('onResize', pen);
  for (let i = 0; i < pen.list.length; i++) {
    const item = pen.list[i];
    item.h = pen.height * item.per;
  }
}
function onShowInput(pen: any, e: Point) {
  if (pen.highLightIndex > -1) {
    console.log('onShowInput', pen.xylist[pen.highLightIndex].height);
    pen.calculative.tempText = pen.list[pen.highLightIndex].text || '';
    pen.calculative.canvas.showInput(pen, pen.xylist[pen.highLightIndex], '#ffffff');
  }
}
//将输入的数据写入到对应的data中
function onInput(pen: any, text: string, { h, w }) {
  console.log('onInput', text, h);
  pen.list[pen.highLightIndex].text = text;
  pen.list[pen.highLightIndex].h = parseInt(h);
  const totalH = pen.list.reduce((accumulator, currentValue) => accumulator + currentValue.h, 0);

  pen.calculative.worldRect.height = totalH;
  pen.calculative.worldRect.ey = pen.calculative.worldRect.y + totalH;
  pen.height = totalH;
  calcWorldAnchors(pen);

  pen.calculative.canvas.store.emitter.emit('valueUpdate', pen);
  pen.calculative.isInput = false;
  pen.calculative.isHover = true;
  pen.calculative.canvas.render();
}
function onMouseDown(pen: Pen, e: Point) {
  for (let i = 0; i < pen.xylist.length; i++) {
    if (pointInSimpleRect(e, pen.xylist[i])) {
      if (lastHighLightId !== pen.id) {
        pen.calculative.canvas.store.data.pens.forEach((item) => {
          // 找到上次高亮的图元，
          if (item.id === lastHighLightId) {
            // 并清除高亮
            item.highLightIndex = -1;
            // 起锚
            item.dropAnchor = false;
          }
        });
      }
      // 点击 选中内部成员
      pen.highLightIndex = i;
      if (!pen.list[pen.highLightIndex].fixed) {
        // 抛锚图元
        pen.dropAnchor = true;
      }
      // 记录选中的图元id
      lastHighLightId = pen.id;
    }
  }
}