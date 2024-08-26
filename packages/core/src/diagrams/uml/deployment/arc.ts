import { Pen } from '../../../pen';
import { Point } from '../../../point'
let isMouseIn = false; // 判断是否是鼠标移入状态
export function arc(pen: Pen, ctx?: CanvasRenderingContext2D): Path2D {
  const path = !ctx ? new Path2D() : ctx;
  const { x, y, width, height } = pen.calculative.worldRect;
  if (!pen.onDestroy) {
    pen.onMouseEnter = onMouseEnter;
    pen.onMouseLeave = onMouseLeave;
    pen.onMove = onMove;
    pen.onDestroy = destroy;
  }
  path.ellipse(
    x + width / 2,
    y + height / 2,
    width / 2,
    height / 2,
    Math.PI,
    0,
    Math.PI
  );

  if (path instanceof Path2D) {
    return path;
  }
}

function destroy(pen: Pen) {
  const partners = pen.calculative.canvas.store.data.pens.filter(el=>el.partnerIds && el.partnerIds.includes(pen.id))
  pen.calculative.canvas.delete(partners);
}
function onMouseEnter(pen: Pen, e: Point) {
  isMouseIn = true;
}
function onMouseLeave(pen: Pen, e: Point) {
  isMouseIn = false;
}
function onMove(pen: Pen, e: Point) {
  // console.log('onMove',isMouseIn, pen, e);
  if (!isMouseIn) return;
  const p1 = pen.calculative.canvas.find(pen.connectedLines[0].lineId);
  const { a, b, c } = lineFromPoints(p1[0].calculative.worldAnchors[0], pen.calculative.worldRect.center);
  // 垂直相交线的斜率
  const k1 = -(b / a);
  const deg = getTanDegByK(k1);
  // 判断是否需要旋转180度
  let reverseAngle = false;

  const { x: x1, y: y1 } = p1[0].calculative.worldAnchors[0];
  const { x: x2, y: y2 } = pen.calculative.worldRect.center;
  if (x1 >= x2 && y1 > y2 || x1 <= x2 && y1 > y2) {
    reverseAngle = true;
  }
  // 更新旋转角度
  pen.calculative.rotate = !reverseAngle ? 360 - deg : 180 - deg;

  const ret = inteceptCircleLineSeg({ radius: pen.calculative.worldRect.width / 2, x: x2, y: y2 }, { p1: { x: x1, y: y1 }, p2: { x: x2, y: y2 } });
  if (!ret.length) return;
  // 更新切线的锚点
  pen.calculative.worldAnchors[0].x = ret[0].x;
  pen.calculative.worldAnchors[0].y = ret[0].y;

  // 更新连线
  pen.calculative.canvas.updateLines(pen);
  // 更新activeRect的旋转角度
  pen.calculative.canvas.activeRect.rotate = pen.calculative.rotate;
}
// 计算圆与直线的交点


// Function to find the line given two points 根据两个点返回一条直线的表达式
function lineFromPoints(p1: Point, p2: Point) {
  const a = p2.y - p1.y;
  const b = p1.x - p2.x;
  const c = a * (p1.x) + b * (p1.y);
  return { a, b, c };
}
// 根据斜率求角度
function getTanDegByK(tan) {
  var result = Math.atan(tan) / (Math.PI / 180);
  result = Math.round(result);
  return result;
}

// 求出一条经过圆心的直线与圆的两个交点
function inteceptCircleLineSeg(circle: any, line: any) {
  let a, b, c, d, u1, u2, ret, retP1, retP2, v1, v2;
  v1 = {};
  v2 = {};
  v1.x = line.p2.x - line.p1.x;
  v1.y = line.p2.y - line.p1.y;
  v2.x = line.p1.x - circle.x;
  v2.y = line.p1.y - circle.y;
  b = (v1.x * v2.x + v1.y * v2.y);
  c = 2 * (v1.x * v1.x + v1.y * v1.y);
  b *= -2;
  d = Math.sqrt(b * b - 2 * c * (v2.x * v2.x + v2.y * v2.y - circle.radius * circle.radius));
  if (isNaN(d)) { // no intercept
    return [];
  }
  u1 = (b - d) / c;  // these represent the unit distance of point one and two on the line
  u2 = (b + d) / c;
  retP1 = {};   // return points
  retP2 = {};
  ret = []; // return array
  if (u1 <= 1 && u1 >= 0) {  // add point if on the line segment
    retP1.x = line.p1.x + v1.x * u1;
    retP1.y = line.p1.y + v1.y * u1;
    ret[0] = retP1;
  }
  if (u2 <= 1 && u2 >= 0) {  // second add point if on the line segment
    retP2.x = line.p1.x + v1.x * u2;
    retP2.y = line.p1.y + v1.y * u2;
    ret[ret.length] = retP2;
  }
  return ret;
}