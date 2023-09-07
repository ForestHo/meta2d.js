import { Pen } from '../pen';
import { Point } from '../point';
export function pentagon(pen: Pen, ctx?: CanvasRenderingContext2D): Path2D {
  const path = !ctx ? new Path2D() : ctx;
  const { x, y, width, height } = pen.calculative.worldRect;
  const R = width < height ? width / 2 : height / 2;
  const edge = pen.edge || 5;
  createPolygonPath(path, x + R, y + R, R, edge, 0,pen);
  // path.moveTo(x + width / 2, y);
  // path.lineTo(x + width, y + (height * 2) / 5);
  // path.lineTo(x + (width * 4) / 5, y + height);
  // path.lineTo(x + width / 5, y + height);
  // path.lineTo(x, y + (height * 2) / 5);

  path.closePath();
  if (path instanceof Path2D) return path;
}
function createPolygonPath(ctx, centerX, centerY, radius, sides, startAngle,pen) {
  let angle = startAngle || 0,
    points:{x:number,y:number}[] = [];
  ctx.moveTo(
    centerX + radius * Math.sin(angle),
    centerY - radius * Math.cos(angle)
  );
  // points.push({
  //   x: centerX + radius * Math.sin(angle),
  //   y: centerY - radius * Math.cos(angle),
  // });
  for (let i = 0; i < sides; ++i) {
    ctx.lineTo(
      centerX + radius * Math.sin(angle),
      centerY - radius * Math.cos(angle)
    );
    // points.push({
    //   x: centerX + radius * Math.sin(angle),
    //   y: centerY - radius * Math.cos(angle),
    // });

    angle += (2 * Math.PI) / sides;
  }
  ctx.closePath();
  // pentagonAnchors(pen,points);
}

// export function pentagonAnchors(pen: Pen,points:{x:number,y:number}) {
  // const points = [
  //   {
  //     x: 0.5,
  //     y: 0,
  //   },
  //   {
  //     x: 1,
  //     y: 0.4,
  //   },
  //   {
  //     x: 0.8,
  //     y: 1,
  //   },
  //   {
  //     x: 0.2,
  //     y: 1,
  //   },
  //   {
  //     x: 0,
  //     y: 0.4,
  //   },
  // ] as const;
  // pen.anchors = points.map(({ x, y }, index) => {
  //   return {
  //     id: `${index}`,
  //     penId: pen.id,
  //     x,
  //     y,
  //   };
  // });
// }
