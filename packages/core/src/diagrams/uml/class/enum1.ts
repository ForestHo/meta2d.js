import { Pen, calcWorldAnchors } from '../../../pen';
import { Point } from '../../../point'
import { pointInSimpleRect } from '../../../rect'
import { s8 } from '../../../utils'
let lastHighLightId = ""; //上次内部选中高亮的pen的id
enum MouseState {
  NONE = 0,
  MOUSEDOWN,
  MOUSEMOVE,
  MOUSEDUP,
  MOUSELEAVE,
  MOUSEENTER,
}
const headH = 50, memberH = 40, memberW = 160, dividerH = 6, padding = 7;
let isHeadEdit = false;
export function enum1(ctx: CanvasRenderingContext2D, pen: Pen) {
  const { x, y, width, height, ex, ey } = pen.calculative.worldRect;
  if (!pen.onDestroy) {
    pen.onDestroy = destory;
    pen.onMove = onMove;
    pen.onAdd = add;
    pen.onIntersect = intersect;
    pen.onMouseLeave = mouseLeave;
    pen.onMouseMove = mouseMove;
    pen.onMouseDown = onMouseDown;
    pen.onShowInput = onShowInput;
    pen.onMouseUp = onMouseUp;
    pen.onInput = onInput;
    pen.onClick = click;
  }
  if (!pen.hasOwnProperty('xylist')) {
    pen.xylist = [];
  }
  if (!pen.hasOwnProperty('currentState')) {
    pen.currentState = MouseState.NONE;
  }
  if (!pen.hasOwnProperty('moveChildFlag')) {
    pen.moveChildFlag = -1; //-1 未移动 0 
  }
  // 绘制header
  ctx.beginPath();
  ctx.fillStyle = pen.background;
  ctx.fillRect(x, y, width, headH);

  ctx.fillStyle = "white";
  ctx.textBaseline = "middle";
  ctx.fillText(
    pen.hText,
    x,
    y + headH / 2,
    width
  );
  ctx.fill();
  ctx.closePath();

  // 绘制body
  const startY = y + headH + padding, startX = x + padding;
  let currentY = startY, currentW = 0;
  pen.xylist = [];
  ctx.fillStyle = pen.color;
  for (let i = 0; i < pen.list.length; i++) {
    const item = pen.list[i];
    if (!item) return;
    if (item.name === 'member') {
      ctx.beginPath();
      currentW = width - padding * 2;
      ctx.rect(startX, currentY, currentW, memberH);
      ctx.textBaseline = "middle";
      ctx.fillText(
        item.text,
        startX,
        currentY + memberH / 2,
        currentW
      );
      if (i === pen.highLightIndex) {
        ctx.strokeStyle = '#595959';
        ctx.stroke();
      }
      pen.xylist.push({ x: startX, y: currentY, ex: startX + currentW, ey: currentY + memberH });
      currentY += memberH;
    } else if (item.name === 'divider') {
      currentW = width - padding * 2;
      div(pen, ctx, startX, currentY, ex, currentW, dividerH, i === pen.highLightIndex);
      pen.xylist.push({ x: startX, y: currentY, ex: startX + currentW, ey: currentY + 10 });
      currentY += 10;
    }
  }
  ctx.closePath();
  // 绘制body框
  ctx.beginPath();
  ctx.moveTo(x, y + headH);
  ctx.rect(x, y + headH, width, currentY - startY + padding * 2);
  ctx.stroke();
  ctx.closePath();

  pen.calculative.worldRect.height = currentY - y + padding;
  pen.calculative.worldRect.ey = currentY - y + pen.calculative.worldRect.y;
  calcWorldAnchors(pen);
}

function div(pen: Pen, ctx: CanvasRenderingContext2D, x: number, y: number, ex: number, width: number, height: number, highLight: boolean = false) {
  const w = 4, h = 1;
  const gap = 2;
  const count = Math.floor(width / (w + gap));
  let startX = x;
  let startY = y + height / 2 - h / 2;
  if (highLight) {
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
function onShowInput(pen: any, e: Point) {
  if (pen.highLightIndex > -1) {
    pen.calculative.tempText = pen.list[pen.highLightIndex].text || '';
    pen.calculative.canvas.showInput(pen, pen.xylist[pen.highLightIndex], '#ffffff');
    isHeadEdit = false;
  } else {
    const hRect = {
      x: pen.calculative.worldRect.x,
      y: pen.calculative.worldRect.y,
      ex: pen.calculative.worldRect.ex,
      ey: pen.calculative.worldRect.y + headH
    }
    const isIn = pointInSimpleRect({ x: e.offsetX, y: e.offsetY }, hRect);
    if (isIn) {
      pen.calculative.tempText = pen.hText;
      pen.calculative.canvas.showInput(pen, hRect, '#ffffff');
      isHeadEdit = true;
    }
  }

}
function click(pen: Pen, e: Point) {
  const ret = pen.xylist.findIndex((item,index)=>{
    return pointInSimpleRect(e, item);
  })
  pen.highLightIndex = ret;
}
function onMove(pen: Pen) {

}
function onMouseUp(pen: Pen, e: any) {
  if (pen.currentState === MouseState.MOUSEMOVE) {
    pen.currentState = MouseState.MOUSEDUP;
  }
  const isIn = pointInSimpleRect(e, pen.calculative.worldRect);
  if (!isIn && pen.currentState === MouseState.MOUSEDUP) {
    if (pen.moveChildFlag && pen.highLightIndex > -1) {
      pen.moveChildFlag = false;
      const item = pen.list[pen.highLightIndex];
      if (!item) return;
      const name = item.name;
      let h = 0;
      if (name === 'member') {
        h = memberH;
      } else if (name === 'divider') {
        h = dividerH;
      }
      const p: Pen = {
        name,
        x: e.x,
        y: e.y,
        width: memberW,
        height: h,
        disableSize: true,
        disableAnchor: true,
        textAlign: 'left',
        textLeft: 6,
        lineWidth: 0,
        id: s8(),
        color: '#6495ED',
        background: '#6495ED',
        text: item.text,
      };
      pen.list.splice(pen.highLightIndex, 1);
      pen.xylist.splice(pen.highLightIndex, 1);
      pen.calculative.canvas.makePen(p);
      pen.highLightIndex = -1;
      setTimeout(() => {
        pen.calculative.canvas.calcActiveRect();
        pen.calculative.canvas.render();
        pen.calculative.canvas.inactive();
        pen.dropAnchor = false;
        const p1 = pen.calculative.canvas.find(p.id);
        pen.calculative.canvas.active(p1);
      }, 50);
    }
    pen.currentState = MouseState.NONE;
  }

  if (isIn) {
    // 内部交换成员顺序
    for (let i = 0; i < pen.xylist.length; i++) {
      let isHit = pointInSimpleRect(e, pen.xylist[i]);
      if (isHit && pen.highLightIndex > 0 && pen.highLightIndex !== i) {
        const temp = pen.list[i];
        pen.list[i] = pen.list[pen.highLightIndex];
        pen.list[pen.highLightIndex] = temp;
        pen.highLightIndex = i;
        lastHighLightId = pen.id;
      }
    }
  }
}
function mouseMove(pen: Pen, e: any) {
  if (pen.currentState === MouseState.MOUSEDOWN) {
    pen.currentState = MouseState.MOUSEMOVE;
  }
  if (pen.highLightIndex > -1) {
    pen.moveChildFlag = true;
  }
}

//将输入的数据写入到对应的data中
function onInput(pen: any, text: string) {
  if (!isHeadEdit) {
    pen.list[pen.highLightIndex].text = text;
  } else {
    pen.hText = text;
  }
  pen.calculative.canvas.store.emitter.emit('valueUpdate', pen);
  pen.calculative.isInput = false;
  pen.calculative.isHover = true;
  pen.calculative.canvas.render();
}

function intersect(pen: Pen, e: Point) {
  const activePens = pen.calculative.canvas.store.active;
  if (!activePens || activePens.length === 0 || ['divider', 'member'].indexOf(activePens[0].name) === -1) {
    return;
  }
  const name = activePens[0].name;
  const text = activePens[0].text;
  let isHit = false;
  if (pen.xylist.length > 0) {
    for (let i = 0; i < pen.xylist.length; i++) {
      isHit = pointInSimpleRect({ x: e.x, y: e.y }, pen.xylist[i]);
      if (isHit) {
        pen.highLightIndex = i + 1;
        lastHighLightId = pen.id;
        pen.list.splice(i + 1, 0, { text, name });
        pen.calculative.canvas.delete(pen.calculative.canvas.store.active);
        break;
      }
    }
  } else {
    // 内部无成员时，直接添加
    if (pen.calculative.canvas.store.active[0].name !== pen.name) {
      pen.list.push({ text, name });
      pen.calculative.canvas.delete(pen.calculative.canvas.store.active);
    }
  }
}
function mouseLeave(pen: Pen) {
}
function onMouseDown(pen: Pen, e: Point) {
  pen.currentState = MouseState.MOUSEDOWN;
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
      // 抛锚图元
      pen.dropAnchor = true;
      // 记录选中的图元id
      lastHighLightId = pen.id;
    }
  }
}
function add(pen: Pen) {
}