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
const condCut = 60, padding = 0, lineHeight = 18, breakSymbol = '\n', xOffset2 = 7;
export function otherfragment(ctx: CanvasRenderingContext2D, pen: Pen) {
  const { x, y, width, height, ex, ey } = pen.calculative.worldRect;
  if (!pen.onDestroy) {
    pen.onDestroy = destory;
    // pen.onMove = onMove;
    // pen.onAdd = add;
    // pen.onIntersect = intersect;
    // pen.onMouseLeave = mouseLeave;
    // pen.onMouseMove = mouseMove;
    pen.onMouseDown = onMouseDown;
    pen.onShowInput = onShowInput;
    // pen.onMouseUp = onMouseUp;
    pen.onInput = onInput;
    // pen.onClick = click;
  }
  if (!pen.hasOwnProperty('xylist')) {
    // 记录内部成员的区域坐标
    pen.xylist = [];
  }
  if (!pen.hasOwnProperty('tlist')) {
    // 记录内部成员的文本区域坐标
    pen.tlist = [];
  }
  if (!pen.hasOwnProperty('currentState')) {
    pen.currentState = MouseState.NONE;
  }
  if (!pen.hasOwnProperty('moveChildFlag')) {
    pen.moveChildFlag = -1; //-1 未移动 0 
  }
  // 绘制header
  // 绘制body
  const startY = y, startX = x;
  let currentW = 0, currentY = y;
  pen.xylist = [];
  pen.tlist = [];
  ctx.fillStyle = pen.color;
  ctx.beginPath();
  for (let i = 0; i < pen.list.length; i++) {
    const item = pen.list[i];
    let h = item.ch;
    if (!item) return;
    if (item.name === 'title') {
      let th = item.th, tw = item.tw;
      // 超出宽度时，减去偏移量
      if (tw >= width) {
        tw -= xOffset2;
      }
      item.ch = item.th;
      // console.log('title', item.text, th, tw);
      // 绘制外框
      ctx.moveTo(x, y + th);
      ctx.lineTo(x + tw, y + th);
      ctx.lineTo(x + tw + xOffset2, y + th - xOffset2);
      ctx.lineTo(x + tw + xOffset2, y);
      ctx.stroke();

      ctx.fillStyle = pen.color;
      ctx.textBaseline = "middle";
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
      pen.xylist.push({ x: x, y: currentY, ex: x + width, ey: currentY + h, width, height: h });
      pen.tlist.push({ x: x, y: currentY, ex: x + item.tw, ey: currentY + item.th, width: item.tw, height: item.th, minH: item.minH, maxWidth: width });
      currentY += h;
    } else if (item.name === 'param') {
      ctx.beginPath();
      currentW = width - padding * 2;
      ctx.rect(startX, currentY, currentW, h);
      ctx.textBaseline = "middle";
      ctx.fillStyle = pen.color;
      const lines = item.text.split(breakSymbol);
      let tY = currentY + lineHeight / 2;
      if (lines.length === 1) {
        tY = currentY + item.th / 2;
      }
      for (let k = 0; k < lines.length; k++) {
        const l = lines[k];
        ctx.fillText(l, startX, tY);
        tY += lineHeight;
      }
      // 选中高亮某一个成员
      if (i === pen.highLightIndex) {
        ctx.strokeStyle = '#595959';
        ctx.stroke();
      }
      pen.xylist.push({ x: startX, y: currentY, ex: startX + currentW, ey: currentY + h, width: currentW, height: h });
      pen.tlist.push({ x: startX, y: currentY, ex: startX + item.tw, ey: currentY + item.th, width: item.tw, height: item.th, minH: item.minH, maxWidth: width });
      currentY = currentY + h;
    }
  }
  ctx.closePath();
  // 绘制body框
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.rect(x, y, width, currentY - startY + padding * 2);
  ctx.stroke();
  ctx.closePath();

  pen.calculative.worldRect.height = currentY - y + padding;
  pen.calculative.worldRect.ey = currentY - y + pen.calculative.worldRect.y;
  calcWorldAnchors(pen);
}
function destory(pen: Pen) { }
function onShowInput(pen: any, e: Point) {
  if (pen.highLightIndex > -1) {
    pen.calculative.tempText = pen.list[pen.highLightIndex].text || '';
    pen.calculative.canvas.showInput(pen, pen.tlist[pen.highLightIndex], '#ffffff');
  }
}
// function click(pen: Pen, e: Point) {
//   const ret = pen.xylist.findIndex((item, index) => {
//     return pointInSimpleRect(e, item);
//   })
//   pen.highLightIndex = ret;
// }
// function onMove(pen: Pen) {

// }
// function onMouseUp(pen: Pen, e: any) {
//   if (pen.currentState === MouseState.MOUSEMOVE) {
//     pen.currentState = MouseState.MOUSEDUP;
//   }
//   const isIn = pointInSimpleRect(e, pen.calculative.worldRect);
//   if (!isIn && pen.currentState === MouseState.MOUSEDUP) {
//     if (pen.moveChildFlag && pen.highLightIndex > -1) {
//       pen.moveChildFlag = false;
//       const item = pen.list[pen.highLightIndex];
//       if (!item || item.fixed) return;
//       const name = item.name;
//       let h = item.ch;
//       const p: Pen = {
//         name,
//         x: e.x,
//         y: e.y,
//         disableSize: true,
//         disableAnchor: true,
//         width: pen.calculative.worldRect.width - condCut,
//         height: h,
//         ratio: true,
//         lineWidth: 1,
//         id: s8(),
//       };
//       p.trect = pen.list[pen.highLightIndex];
//       pen.list.splice(pen.highLightIndex, 1);
//       pen.xylist.splice(pen.highLightIndex, 1);
//       pen.tlist.splice(pen.highLightIndex, 1);
//       pen.calculative.canvas.makePen(p);
//       pen.highLightIndex = -1;
//       setTimeout(() => {
//         pen.calculative.canvas.calcActiveRect();
//         pen.calculative.canvas.render();
//         pen.calculative.canvas.inactive();
//         pen.dropAnchor = false;
//         const p1 = pen.calculative.canvas.find(p.id);
//         pen.calculative.canvas.active(p1);
//       }, 50);
//     }
//     pen.currentState = MouseState.NONE;
//   }

//   if (isIn) {
//     // 内部交换成员顺序
//     for (let i = 0; i < pen.xylist.length; i++) {
//       let isHit = pointInSimpleRect(e, pen.xylist[i]);
//       if (isHit && pen.highLightIndex > 0 && pen.highLightIndex !== i) {
//         if (pen.list[i].fixed || pen.list[pen.highLightIndex].fixed) {
//           continue;
//         }
//         const temp = pen.list[i];
//         pen.list[i] = pen.list[pen.highLightIndex];
//         pen.list[pen.highLightIndex] = temp;
//         pen.highLightIndex = i;
//         lastHighLightId = pen.id;
//       }
//     }
//   }
// }
// function mouseMove(pen: Pen, e: any) {
//   if (pen.currentState === MouseState.MOUSEDOWN) {
//     pen.currentState = MouseState.MOUSEMOVE;
//   }
//   if (pen.highLightIndex > -1) {
//     pen.moveChildFlag = true;
//   }
// }

//将输入的数据写入到对应的data中
function onInput(pen: any, text: string, { h, w }) {
  // console.log('onInput', text, h, w);
  pen.list[pen.highLightIndex].text = text;
  pen.list[pen.highLightIndex].tw = parseInt(w);
  pen.list[pen.highLightIndex].th = parseInt(h);
  pen.calculative.canvas.store.emitter.emit('valueUpdate', pen);
  pen.calculative.isInput = false;
  pen.calculative.isHover = true;
  pen.calculative.canvas.render();
}

// function intersect(pen: Pen, e: Point) {
//   const activePens = pen.calculative.canvas.store.active;
//   if (!activePens || activePens.length === 0 || ['param'].indexOf(activePens[0].name) === -1) {
//     return;
//   }
//   const name = activePens[0].name;
//   const text = activePens[0].text;
//   let isHit = false;
//   if (pen.xylist.length > 0) {
//     for (let i = 0; i < pen.xylist.length; i++) {
//       isHit = pointInSimpleRect({ x: e.x, y: e.y }, pen.xylist[i]);
//       if (isHit) {
//         pen.highLightIndex = i + 1;
//         lastHighLightId = pen.id;
//         const h = pen.calculative.canvas.store.active[0].height;
//         pen.list.splice(i + 1, 0, pen.calculative.canvas.store.active[0].trect);
//         pen.calculative.canvas.delete(pen.calculative.canvas.store.active);
//         break;
//       }
//     }
//   } else {
//     // 内部无成员时，直接添加
//     if (pen.calculative.canvas.store.active[0].name !== pen.name) {
//       const h = pen.calculative.canvas.store.active[0].height;
//       pen.list.push(pen.calculative.canvas.store.active[0].trect);
//       pen.calculative.canvas.delete(pen.calculative.canvas.store.active);
//     }
//   }
// }
// function mouseLeave(pen: Pen) {
// }
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
      if (!pen.list[pen.highLightIndex].fixed) {
        // 抛锚图元
        pen.dropAnchor = true;
      }
      // 记录选中的图元id
      lastHighLightId = pen.id;
    }
  }
}
// function add(pen: Pen) {
// }