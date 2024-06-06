import { Pen, calcWorldAnchors } from '../../../pen';
import { Point } from '../../../point'
import { pointInRect } from '../../../rect'
let xylist = [];
export function class1(ctx: CanvasRenderingContext2D, pen: Pen) {
  const { x, y, width, height, ex, ey } = pen.calculative.worldRect;
  if (!pen.onDestroy) {
    pen.onDestroy = destory;
    pen.onMove = move;
    pen.onAdd = add;
    // pen.onRotate = move;
    // pen.onMouseEnter = mouseEnter;
    pen.onMouseLeave = mouseLeave;
    // pen.onMouseMove = mouseMove;
    pen.onMouseDown = onMouseDown;
    // pen.onMouseUp = mouseUp;
    // pen.onInput = input;
  }
  // 绘制header
  const h1 = 50;
  ctx.beginPath();
  ctx.strokeStyle = 'black';
  ctx.rect(x, y, width, h1);
  ctx.stroke();
  ctx.fill();
  ctx.closePath();

  // 绘制body
  const h = 40, padding = 7;
  const startY = y + h1 + padding, startX = x + padding;
  let currentY = startY, currentW = 0;
  xylist = [];
  for (let i = 0; i < pen.list.length; i++) {
    const item = pen.list[i];
    if (item.name === 'member') {
      ctx.beginPath();
      currentW = width - padding * 2;
      ctx.rect(startX, currentY, currentW, h);
      if (i === pen.highLightIndex) {
        ctx.strokeStyle = '#595959';
        ctx.stroke();
      }
      xylist.push({ x: startX, y: currentY, ex: startX + currentW, ey: currentY + h });
      currentY += h;
    } else if (item.name === 'divider') {
      currentW = width - padding * 2;
      div(pen,ctx, startX, currentY, ex, currentW, 10,i=== pen.highLightIndex);
      xylist.push({ x: startX, y: currentY, ex: startX + currentW, ey: currentY + 10 });
      currentY += 10;
    }
  }
  ctx.closePath();

  // 绘制body框
  ctx.beginPath();
  ctx.moveTo(x, y + h1);
  ctx.rect(x, y+h1, width, currentY - startY+padding);
  ctx.stroke();
  ctx.closePath();

  console.log('class1', currentY - y);
  pen.calculative.worldRect.height = currentY - y;
  pen.calculative.worldRect.ey = currentY - y + pen.calculative.worldRect.y;
  // pen.height = currentY - y;
  // pen.calculative.height = currentY - y;
  calcWorldAnchors(pen);
}

function div(pen:Pen,ctx: CanvasRenderingContext2D, x: number, y: number, ex: number, width: number, height: number,highLight:boolean = false) {
  const w = 10, h = 2;
  const gap = 5;
  const count = Math.floor(width / (w + gap));
  let startX = x;
  let startY = y + height / 2 - h / 2;
  if(highLight){
    ctx.beginPath();
    ctx.strokeStyle = '#595959';
    ctx.rect(x, y, width, height);
    ctx.stroke();
  }
  ctx.strokeStyle = pen.color || 'black';
  for (let i = 0; i <= count; i++) {
    ctx.beginPath();
    if (startX < ex) {
      if (startX + w <= ex) {
        ctx.rect(startX, startY, w, h);
      } else {
        ctx.rect(startX, startY, ex - (startX + w), h);
      }
    }
    startX += (gap + w);
    ctx.fill();
    ctx.stroke();
  }
}
function destory(pen: Pen) { }

function move(pen: Pen) {
  console.log('move');
}
function mouseLeave(pen: Pen) {
}
function onMouseDown(pen: Pen, e: Point) {
  console.log('onMouseDown', pen, e, xylist);
  for (let i = 0; i < xylist.length; i++) {
    if (pointInRect(e, xylist[i])) {
      console.log('in rect', i);
      pen.highLightIndex = i;
      // pen.calculative.canvas.
    }
  }
}
function add(pen: Pen) {
  console.log('add');
  // pen.calculative.canvas.calcActiveRect();
  // pen.calculative.canvas.updatePenRect({rect: {x: 0, y: 0, width: 100, height: 500}});
}