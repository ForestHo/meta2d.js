import { Pen, connectLine } from '../../../pen';
import { Point } from '../../../point'
import { s8 } from '../../../utils'

export function comment(pen: Pen, ctx?: CanvasRenderingContext2D): Path2D {
  const path = !ctx ? new Path2D() : ctx;
  const { x, y, width, ex, ey } = pen.calculative.worldRect;
  if (!pen.onDestroy) {
    pen.onAdd = onAdd;
    pen.onClick = onClick;
    pen.onMove = onMove;
    pen.onMouseEnter = onMouseEnter;
  }

  const offsetX = width / 10;
  path.moveTo(x, y);
  path.lineTo(ex - offsetX, y);
  path.lineTo(ex, y + offsetX);
  path.lineTo(ex, ey);
  path.lineTo(x, ey);
  path.closePath();
  path.moveTo(ex - offsetX, y);
  path.lineTo(ex - offsetX, y + offsetX);
  path.lineTo(ex, y + offsetX);

  path.closePath();

  if (!pen.free.x) {
    pen.free.x = x;
  }
  if (!pen.free.y) {
    pen.free.y = ey;
  }
  if (path instanceof Path2D) return path;
}

function onAdd(pen: Pen, e: Point) {
  const fromAnchor = pen.calculative.worldAnchors[8];
  const toAnchor = { x: pen.free.x + pen.width / 4, y: pen.free.y + pen.height };

  const absWidth = Math.abs(fromAnchor.x - toAnchor.x);
  const absHeight = Math.abs(fromAnchor.y - toAnchor.y);
  const line: Pen = {
    height: absHeight,
    lineName: 'line',
    lineWidth: 1,
    name: 'line',
    type: 1,
    width: absWidth,
    x: Math.min(fromAnchor.x, toAnchor.x),
    y: Math.min(fromAnchor.y, toAnchor.y),
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
  pen.calculative.canvas.addPens([line]);
  connectLine(pen, fromAnchor, line, line.calculative.worldAnchors[0]);

  pen.calculative.canvas.parent.top([pen]);
}
function onMouseEnter(pen: Pen, e: Point) {
  if (pen.calculative.canvas.active.length === 1) {
    const p1 = pen.calculative.canvas.find(pen.connectedLines[0].lineId);
    pen.calculative.canvas.active([p1[0], pen]);
  }

}
function onMove(pen: Pen, e: Point) {
}
function onClick(pen: Pen, e: Point) {

}
export function commentAnchors(pen: Pen) {
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
      y: 0.5,
    },
  ] as const;
  pen.anchors = points.map(({ x, y }, index) => {
    if(index !== points.length - 1) {
      return {
        id: `${index}`,
        penId: pen.id,
        x,
        y,
      };
    }else{
      return {
        id: `${index}`,
        penId: pen.id,
        x,
        y,
        hidden: true,
      };
    }
   
  });
}