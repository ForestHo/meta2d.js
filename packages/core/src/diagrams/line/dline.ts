import { Direction } from '../../data';
import { facePen, getToAnchor, Pen } from '../../pen';
import { distance, Point, PrevNextType, rotatePoint } from '../../point';
import { Meta2dStore } from '../../store';
import { s8 } from '../../utils';

export function dline(store: Meta2dStore, pen: Pen, mousedwon?: Point) {
  if (!pen.calculative.worldAnchors) {
    pen.calculative.worldAnchors = [];
  }

  if (mousedwon) {
    // if (pen.calculative.activeAnchor) {
    //   pen.calculative.activeAnchor.next = {
    //     penId: pen.id,
    //     x: mousedwon.x,
    //     y: mousedwon.y,
    //   };
    //   if (
    //     distance(
    //       pen.calculative.activeAnchor.next,
    //       pen.calculative.activeAnchor
    //     ) < 5
    //   ) {
    //     pen.calculative.activeAnchor.next = undefined;
    //   } else {
    //     pen.calculative.activeAnchor.prev = {
    //       ...pen.calculative.activeAnchor.next,
    //     };
    //     rotatePoint(
    //       pen.calculative.activeAnchor.prev,
    //       180,
    //       pen.calculative.activeAnchor
    //     );
    //   }
    // }
  } else {
    // const from = pen.calculative.worldAnchors[0];
    // if (!from.next) {
    //   const fromFace = facePen(from, store.pens[from.connectTo]);
    //   calcCurveCP(from, fromFace, 50);
    //   from.prev = undefined;
    // }

    // const to =
    //   pen.calculative.worldAnchors[pen.calculative.worldAnchors.length - 1];
    // if (to && to !== from && !to.prev) {
    //   const toFace = facePen(to, store.pens[to.connectTo]);
    //   calcCurveCP(to, toFace, -50);
    //   to.next = undefined;
    // }
  }
}