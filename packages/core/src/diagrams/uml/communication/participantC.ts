import { Pen } from '../../../pen';

export function participantC(pen: Pen, ctx?: CanvasRenderingContext2D): Path2D {
  const path = !ctx ? new Path2D() : ctx;
  const { x, y, width, height } = pen.calculative.worldRect;
  const offset = width / 5;
  path.ellipse(
    x + width / 2,
    y + offset,
    offset,
    offset,
    0,
    0,
    Math.PI * 2
  );
  const startY = y + height / 2 + offset*2;
  const y1 = startY - offset * 4;
  path.moveTo(x, startY);
  path.lineTo(x, y1);

  const y2 = y1 - offset/2;
  path.lineTo(x + offset/2, y2);
  path.lineTo(x + width - offset/2, y2);
  path.lineTo(x + width, y1);
  path.lineTo(x + width, startY);
  path.lineTo(x + width-offset, startY);
  path.lineTo(x + width-offset, startY-offset*2);

  path.lineTo(x + width-offset, startY);
  path.lineTo(x + width-offset, y+height);
  path.lineTo(x + width/2, y+height);
  path.lineTo(x + width/2, (y+height/2+offset));
  path.lineTo(x + width/2, y+height);
  path.lineTo(x + offset, y+height);
  path.lineTo(x + offset, startY-offset*2);
  path.lineTo(x + offset, startY);
  path.lineTo(x , startY);
  path.closePath();
  if (path instanceof Path2D) {
    return path;
  }
}
