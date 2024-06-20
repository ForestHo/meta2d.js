import { Pen } from '../../../pen';
import { Point } from '../../../point'

let timer = null;
export function arc(pen: Pen, ctx?: CanvasRenderingContext2D): Path2D {
  const path = !ctx ? new Path2D() : ctx;
  const { x, y, width, height } = pen.calculative.worldRect;
  if (!pen.onDestroy) {
    pen.onMouseUp = onMouseUp;
    pen.onMove = onMove;
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

function onMouseUp(pen: Pen, e: Point) {
  // console.log('onMouseUp arc', pen, e);
  // const p1 = pen.calculative.canvas.find(pen.connectedLines[0].lineId);
  // const { a, b, c } = lineFromPoints(p1[0].calculative.worldAnchors[0], p1[0].calculative.worldAnchors[1]);
  // const k =  (a / b);
  // // 垂直相交线的斜率
  // const k1 = -(b / a);
  // const angle = slopeToAngle(k1);
  // const anan = getTanDeg(k1);
  // console.log('k1',k1,anan);
  // pen.calculative.canvas.parent.setValue({
  //   id: pen.id,
  //   rotate: 360 - anan
  // })
}
function onMove(pen: Pen, e: Point) {
  // console.log('onMove arc', pen, e);
  // pen.calculative.rotate += 90;
  useTimer(() => {
    console.log('last one');
    const p1 = pen.calculative.canvas.find(pen.connectedLines[0].lineId);
    const { a, b, c } = lineFromPoints(p1[0].calculative.worldAnchors[0], p1[0].calculative.worldAnchors[1]);
    // const k =  (a / b);
    // 垂直相交线的斜率
    const k1 = -(b / a);
    const deg = getTanDeg(k1);
    console.log('k1', k1, deg);
    let reverseAngle = false;

    const { x: x1, y: y1 } = p1[0].calculative.worldAnchors[0];
    const { x: x2, y: y2 } = p1[0].calculative.worldAnchors[1];
    if (x1 >= x2 && y1 > y2 || x1 <= x2 && y1 > y2) {
      reverseAngle = true;
    }
    pen.calculative.rotate = !reverseAngle ? 360 - deg : 180 - deg;

    const ret = inteceptCircleLineSeg({ radius: pen.calculative.worldRect.width / 2, x: x2, y: y2 }, { p1: { x: x1, y: y1 }, p2: { x: x2, y: y2 } });
    // pen.calculative.worldAnchors[0].x = ret[0].x;
    // pen.calculative.worldAnchors[0].y = ret[0].y;
    // p1[0].calculative.worldAnchors[1].x = ret[0].x;
    // p1[0].calculative.worldAnchors[1].y = ret[0].y;


    console.log('ret', ret);
  }, 10)
}
// 计算圆与直线的交点

const useTimer = (cb, time) => {
  if (timer) {
    clearTimeout(timer);
  }
  timer = setTimeout(() => {
    cb && cb();
    timer = null;
  }, time);
};

// Function to find the line given two points 根据两个点返回一条直线的表达式
function lineFromPoints(p1: Point, p2: Point) {
  const a = p2.y - p1.y;
  const b = p1.x - p2.x;
  const c = a * (p1.x) + b * (p1.y);
  return { a, b, c };
}

function slopeToAngle(slope) {
  return Math.atan(slope) * (180 / Math.PI);
}
function getTanDeg(tan) {
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