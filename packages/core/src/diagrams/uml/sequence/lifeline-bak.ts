import { Pen,connectLine } from '../../../pen';
import { Point } from '../../../point'
import { s8 } from '../../../utils'
let offsetY = 300;
export function lifeline(ctx: CanvasRenderingContext2D, pen: Pen) {
  const headHeight = (pen as any).headHeight ?? 50;
  const { x, y, width, height, ey } = pen.calculative.worldRect;

  if (!pen.onDestroy) {
    // pen.onMouseDown = onMouseDown;
    // pen.onMouseUp = onMouseUp;
    pen.onAdd = onAdd;
  }
  
  let wr = pen.calculative.borderRadius || 0,
    hr = wr;
  if (pen.calculative.borderRadius < 1) {
    wr *= width;
    hr *= height;
  }
  let r = wr < hr ? wr : hr;
  if (width < 2 * r) {
    r = width / 2;
  }
  if (headHeight < 2 * r) {
    r = headHeight / 2;
  }
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + width, y, x + width, y + headHeight, r);
  ctx.arcTo(x + width, y + headHeight, x, y + headHeight, r);
  ctx.arcTo(x, y + headHeight, x, y, r);
  ctx.arcTo(x, y, x + width, y, r);
  ctx.closePath();
  ctx.stroke();

  // ctx.save();
  // ctx.beginPath();
  // ctx.lineWidth = 1;
  // ctx.setLineDash([7, 7]);
  // const middle = x + width / 2;
  // ctx.moveTo(middle, y + headHeight + 1);
  // ctx.lineTo(middle, ey);
  // ctx.stroke();
  // ctx.restore();
}
function onAdd(pen: Pen, e: Point) {
  if (!pen.followers) {
    pen.followers = [];
  }
  
  const id = s8();
  const p = {
    width: 60,
    height: 120,
    ratio: true,
    lineWidth: 1,
    background: '#6495ED',
    name: 'participant',
    disableSize: true,
    disableDelete: true,
    id,
    x:0,
    y:0
  };
  p.x = pen.x + pen.width / 2 - p.width / 2;
  p.y = pen.y - p.height;
  pen.calculative.canvas.makePen(p);
  pen.followers.push(p.id);


  const fromAnchor = pen.calculative.worldAnchors[5];
  const toAnchor = { x: pen.x + pen.width / 2, y: pen.y + offsetY };

  const absWidth = Math.abs(fromAnchor.x - toAnchor.x);
  const absHeight = Math.abs(fromAnchor.y - toAnchor.y);
  const line: Pen = {
    height: absHeight,
    lineName: 'line',
    lineWidth: 1,
    name: 'line',
    type: 1,
    width: absWidth,
    id: s8(),
    x: Math.min(fromAnchor.x, toAnchor.x),
    y: Math.min(fromAnchor.y, toAnchor.y),
    lineDash: [7, 7],
    anchors: [
      {
        x: 1,
        y: 0,
        id: s8(),
      },
      {
        x: 0,
        y: 1,
        id: s8(),
      },
    ],
  };
  line.disableDelete = true;
  pen.calculative.canvas.addPens([line]);
  // pen.followers.push(line.id);
  connectLine(pen, fromAnchor, line, line.calculative.worldAnchors[0]);

  pen.calculative.canvas.parent.top([pen]);
}
export function lifelineAnchors(pen: Pen) {
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
      x: 1,
      y: 0.5,
    },
    {
      x: 1,
      y: 1,
    },
    {
      x: 0.5,
      y: 1,
    },
    {
      x: 0,
      y: 1,
    },
    {
      x: 0,
      y: 0.5,
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