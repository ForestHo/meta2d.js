import { Pen } from '../../../pen';
import { pointInSimpleRect } from '../../../rect';
const list = ['class1', 'enum1', 'interface1']
export function member(ctx: CanvasRenderingContext2D, pen: Pen) {
  if (!pen.onDestroy) {
    pen.onAdd = add;
  }
}
function add(pen: Pen) {
  console.log('add member', pen);
  // 检测是否有交集,找到最近有交集的图元
  const { x, y, ex, ey } = pen.calculative.worldRect;
  for (let i = 0; i < pen.calculative.canvas.store.data.pens.length; i++) {
    const p = pen.calculative.canvas.store.data.pens[i];
    if (p.container) {
      const lHit = pointInSimpleRect({ x, y }, p.calculative.worldRect);
      const rHit = pointInSimpleRect({ x: ex, y: ey }, p.calculative.worldRect);
      let x1 = 0, y1 = 0;
      if (lHit) {
        x1 = x;
        y1 = y;
      } else if (rHit) {
        x1 = ex;
        y1 = ey;
      }
      if (lHit || rHit) {
        if (!p.onIntersect || list.indexOf(p.name) === -1) continue;
        p.onIntersect(p, { x: x1, y: y1 }, pen);
        setTimeout(() => {
          pen.calculative.canvas.active([p]);
          pen.calculative.canvas.render();
        }, 50);
      }
    }
  }
}