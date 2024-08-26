
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
  // if (!pen.followers) {
  //   pen.followers = [];
  // }

  const id = s8();
  const p = {
    name: pen.free.type || "circle1",
    x: pen.free.x,
    y: pen.free.y,
    width: pen.width,
    height: pen.width,
    lineWidth: 0,
    disableSize: true,
    id,
    background: pen.background,
    anchors: [
      { id: '1', penId: id, x: 0.5, y: 0.5, hidden: true }
    ],
  };
  pen.calculative.canvas.makePen(p);
  // pen.followers.push(p.id);
  const toPen = pen.calculative.canvas.find(p.id)[0];
  const line = pen.calculative.canvas.parent.connectLine(
    pen,
    toPen,
    pen.calculative.worldAnchors[8],
    toPen.calculative.worldAnchors[0]);

  line.partnerIds = [pen.id, p.id];
  pen.partnerIds = [line.id, p.id];
  for (let i = 0; i < line.calculative.worldAnchors.length; i++) {
    const an = line.calculative.worldAnchors[i];
    an.hidden = true;
  }
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
      hidden: true,
    },
  ] as const;
  pen.anchors = points.map(({ x, y,hidden }, index) => {
    if(hidden){
      return {
        id: `${index}`,
        penId: pen.id,
        x,
        y,
        hidden,
      };
    }else{
      return {
        id: `${index}`,
        penId: pen.id,
        x,
        y,
      };
    }
  }) as any;
}
