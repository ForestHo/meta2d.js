
import { Pen } from '../../../pen';
import { Point } from '../../../point'
import { s8 } from '../../../utils'

const offset = 20, rectH = 36, two = 2;
export function supplyinterface(ctx: CanvasRenderingContext2D, pen: Pen) {
  const { x, y, width, height, ex, ey } = pen.calculative.worldRect;
  if (!pen.onDestroy) {
    pen.onMouseDown = onMouseDown;
    pen.onMouseUp = onMouseUp;
    pen.onAdd = onAdd;
  }
  const fillStyle = pen.background || "";

  ctx.beginPath();
  ctx.rect(x, y + offset, width, rectH);
  ctx.stroke();
  ctx.closePath();
  fillStyle && ctx.fill();

  // console.log(pen.free.type, 'type');
  // 绘制游离的圆形
  ctx.beginPath();
  // ctx.arc(
  //   x + width / two,
  //   ey+50,
  //   width / two,
  //   0,
  //   Math.PI * two
  // );

  if (!pen.free.x) {
    pen.free.x = x + width / two;
  }
  if (!pen.free.y) {
    pen.free.y = ey;
  }
  // ctx.moveTo(x + width / two, y + rectH / two + offset);
  // ctx.lineTo(pen.free.x, pen.free.y);
  // ctx.stroke();
  // ctx.closePath();
  fillStyle && ctx.fill();
}
function onMouseDown(pen: Pen, e: Point) {
  // console.log('onMouseDown', pen, e);
}
function onAdd(pen: Pen) {
  // console.log('onAdd', pen, e);
  if (!pen.followers) {
    pen.followers = [];
  }

  const id = s8();
  const p = {
    name: pen.free.type || "circle",
    x: pen.free.x,
    y: pen.free.y,
    width: pen.width,
    height: pen.width,
    lineWidth: 0,
    disableSize: true,
    disableDelete: true,
    id,
    background: pen.background,
    anchors: [
      { id: '1', penId: id, x: 0.5, y: 0.5 }
    ],
  };
  pen.calculative.canvas.makePen(p);
  pen.followers.push(p.id);
  const toPen = pen.calculative.canvas.find(p.id)[0];
  const p1 = pen.calculative.canvas.parent.connectLine(
    pen,
    toPen,
    pen.calculative.worldAnchors[8],
    toPen.calculative.worldAnchors[0]);
  p1.disableDelete = true;
}
function onMouseUp(pen: Pen, e: Point) { }
export function supplyinterfaceAnchors(pen: Pen) {
  const points = [
    {
      x: 0,
      y: 0,
    },
    {
      x: 0.5,
      y: 0,
    },
    {
      x: 1,
      y: 0,
    },
    {
      x: 0,
      y: 1,
    },
    {
      x: 0.5,
      y: 1,
    },
    {
      x: 1,
      y: 1,
    },
    {
      x: 0,
      y: 0.5,
    },
    {
      x: 1,
      y: 0.5,
    },
    {
      x: 0.5,
      y: 0.13,
    },
  ] as const;
  pen.anchors = points.map(({ x, y }, index) => {
    return {
      id: `${index}`,
      penId: pen.id,
      x,
      y,
    };
  });
}
function pointInsideCircle(p: any, circle, r) {
  if (r === 0) return false;
  return (circle.x - p.x) ** 2 + (circle.y - p.y) ** 2 < r ** 2;
}
