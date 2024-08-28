import { Pen, calcWorldAnchors, getWords, wrapLines,getFont } from '../../../pen';
import { Point } from '../../../point'
import { pointInSimpleRect } from '../../../rect'
import { s8 } from '../../../utils'

let lastHighLightId = ""; //上次内部选中高亮的pen的id
const memberW = 160, padding = 7, lineHeight = 18, breakSymbol = '\n', textPadding = 5;
export function substatus(ctx: CanvasRenderingContext2D, pen: Pen) {
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

  ctx.beginPath();
  const w1 = 40, h1 = 16;
  const startY1 = ey - h1 * 2;
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
  ctx.moveTo(startX2 + r1, startY1);
  ctx.arcTo(
    startX2 + w1,
    startY1,
    startX2 + w1,
    startY1 + h1,
    r1
  );
  ctx.arcTo(
    startX2 + w1,
    startY1 + h1,
    startX2,
    startY1 + h1,
    r1
  );
  ctx.arcTo(startX2, startY1 + h1, startX2, startY1, r1);
  ctx.arcTo(startX2, startY1, startX2 + w1, startY1, r1);
  ctx.closePath();
  ctx.stroke();


  // 绘制下面的图形
  const distance = 10;
  const startX1 = startX2 - w1 - distance;

  ctx.beginPath();
  ctx.moveTo(startX1 + r1, startY1);
  ctx.arcTo(
    startX1 + w1,
    startY1,
    startX1 + w1,
    startY1 + h1,
    r1
  );
  ctx.arcTo(
    startX1 + w1,
    startY1 + h1,
    startX1,
    startY1 + h1,
    r1
  );
  ctx.arcTo(startX1, startY1 + h1, startX1, startY1, r1);
  ctx.arcTo(startX1, startY1, startX1 + w1, startY1, r1);

  ctx.moveTo(startX1 + w1, startY1 + h1 / 2);
  ctx.lineTo(ex - w1, startY1 + h1 / 2);
  ctx.closePath();
  ctx.stroke();

  // 绘制body
  const startY = y + padding, startX = x;
  let currentW = 0, currentY = y;
  pen.xylist = [];
  ctx.beginPath();
  ctx.fillStyle = pen.color;
  let { fontSize, lineHeight, fontStyle, fontWeight, fontFamily } =
    pen.calculative;
  const realLineHeight = lineHeight * fontSize;
  ctx.font = getFont({
    fontStyle,
    fontWeight,
    fontFamily: fontFamily || pen.calculative.canvas.store.options.fontFamily,
    fontSize,
    lineHeight,
  });
  for (let i = 0; i < pen.list.length; i++) {
    const item = pen.list[i];
    let h = item.h;
    item.per = h / pen.height;
    if (!item) return;
    if (item.name === 'title') {
      ctx.fillStyle = "#fff";
      ctx.textBaseline = "middle";
      ctx.textAlign = 'center';
      if (!item.lines) {
        item.lines = calcTextLines(item.text, pen);
      }
      const offsetY = (h - (item.lines.length-1) * realLineHeight)/2; 
      drawText(ctx, item.lines, {
        x: x + textPadding,
        y: currentY + offsetY,
        color: "#fff",
        realLineHeight,
        textAlign: 'left',
      });
      // const lines = item.text.split(breakSymbol);
      // let tY = currentY + lineHeight / 2;
      // if (lines.length === 1) {
      //   tY = currentY + h / 2;
      // }
      // for (let k = 0; k < lines.length; k++) {
      //   const l = lines[k];
      //   ctx.fillText(l, x + width / 2, tY);
      //   tY += lineHeight;
      // }
      pen.xylist.push({ x: x, y: currentY, ex: x + width, ey: currentY + h, width, height: h, minH: item.minH });
      currentY += h;
    } else if (item.name === 'content') {
      ctx.textBaseline = "middle";
      ctx.textAlign = 'left';
      ctx.fillStyle = pen.color;
      const lines = item.text.split(breakSymbol);
      let tY = currentY + lineHeight / 2;
      if (lines.length === 1) {
        tY = currentY + h / 2;
      }
      for (let k = 0; k < lines.length; k++) {
        const l = lines[k];
        ctx.fillText(l, startX, tY);
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
  for (let i = 0; i < pen.list.length; i++) {
    const item = pen.list[i];
    item.h = pen.height * item.per;
  }
}
function onShowInput(pen: any, e: Point) {
  if (pen.highLightIndex > -1) {
    pen.calculative.worldTextRect.width = pen.xylist[pen.highLightIndex].width;
    // console.log('pen.calculative.worldTextRect.width', pen.calculative.worldTextRect.width);
    pen.calculative.tempText = pen.list[pen.highLightIndex].text || '';
    pen.calculative.canvas.showInput(pen, pen.xylist[pen.highLightIndex], '#ffffff');
  }
}
function drawText(
  ctx: CanvasRenderingContext2D,
  lines: string[],
  options: any
) {
  let {
    x,
    y,
    textAlign,
    textBaseline,
    color,
    realLineHeight,
  } = options;
  ctx.save();
  if (textAlign) {
    ctx.textAlign = textAlign;
  }
  if (textBaseline) {
    ctx.textBaseline = textBaseline;
  }
  ctx.fillStyle = color;
  lines.forEach((lineText) => {
    ctx.fillText(lineText, x, y);
    y += realLineHeight;
  });
  ctx.restore();
}
function calcTextLines(text: string, pen: Pen) {
  pen.calculative.worldTextRect.width -= 2 * textPadding; // 边距
  const lines = [];
  const paragraphs = text.split(/[\n]/g);
  for (const paragraph of paragraphs) {
    const words = getWords(paragraph);
    let items = wrapLines(words, pen);
    console.log('items', items);
    // 空行换行的情况
    if (items.length === 0) items = [''];
    lines.push(...items);
  }
  return lines;
}
//将输入的数据写入到对应的data中
function onInput(pen: any, text: string, { h, w }) {
  pen.list[pen.highLightIndex].text = text;
  pen.list[pen.highLightIndex].h = parseInt(h);

  // 计算多行
  const lines = calcTextLines(text, pen);
  pen.list[pen.highLightIndex].lines = lines;

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