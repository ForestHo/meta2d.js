import { Pen } from './index';
import { Point } from '../point';
import { rectInRect } from '../rect';
import { deepClone } from '../utils';
import { movingSuffix } from '../canvas';

export function frame(pen: Pen, ctx?: CanvasRenderingContext2D): Path2D {
  const path = !ctx ? new Path2D() : ctx;
  if (!pen.onDestroy) {
    pen.onMouseLeave = mouseLeave;
    pen.onMouseUp = mouseUp;
  }
  const { x, y, width, height, ex, ey } = pen.calculative.worldRect;
  path.moveTo(x, y);
  path.lineTo(ex, y);
  path.lineTo(ex, ey);
  path.lineTo(x, ey);
  if (path instanceof Path2D) {
    return path;
  }
}

function mouseLeave(pen: Pen) {
  const activePens = pen.calculative.canvas.store.active;
  if (activePens && activePens.length) {
    activePens.forEach((activePen: Pen) => {
      // if(!rectInRect(activePen.calculative.worldRect,pen.calculative.worldRect,true)){
      //   if(!pen.followers){
      //     pen.followers =[];
      //   }
      //   if(!pen.followers.includes(activePen.id)){
      //     pen.followers.push(activePen.id);
      //   }
      // }
      if (pen.followers) {
        let idx = pen.followers.findIndex((id: string) => id === activePen.id);
        if (idx !== -1) {
          const movingPen =
            pen.calculative.canvas.store.pens[activePen.id + movingSuffix];
          if (movingPen && movingPen.calculative) {
            let isIn = rectInRect(
              movingPen.calculative.worldRect,
              pen.calculative.worldRect,
              true
            );
            if (!isIn) {
              pen.followers.splice(idx, 1);
            }
          }
        }
      }
    });
  }
}

function mouseUp(pen: Pen) {
  console.log('mouseUp',pen);
  const activePens = pen.calculative.canvas.store.active;
  // console.log('activePens',activePens);
  if (activePens && activePens.length) {
    activePens.forEach((activePen: Pen) => {
      // console.log('activePen',activePen);
        let inRect = deepClone(pen.calculative.worldRect);
        inRect.x -= 1;
        inRect.y -= 1;
        inRect.width += 2;
        inRect.height += 2;
        // console.log('inRect',rectInRect(activePen.calculative.worldRect, inRect, true));
        if (rectInRect(activePen.calculative.worldRect, inRect, true)) {
          if (!pen.followers) {
            pen.followers = [];
          }
          if (!pen.followers.includes(activePen.id)) {
            pen.followers.push(activePen.id);
          }
        }
    });
  }
}