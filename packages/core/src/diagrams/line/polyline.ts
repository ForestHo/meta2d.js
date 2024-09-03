import { Direction } from '../../data';
import {
  deleteTempAnchor,
  facePen,
  getFromAnchor,
  getToAnchor,
  Pen,
} from '../../pen';
import { Point } from '../../point';
import { Meta2dStore } from '../../store';
import { s8 } from '../../utils';

let faceSpace = 10, fixFace = true;
export function polyline(store: Meta2dStore, pen: Pen, mousedwon?: Point) {
  if (!pen.calculative.worldAnchors) {
    pen.calculative.worldAnchors = [];
  }
  faceSpace = store.options.polylineSpace || 10;
  if (pen.calculative.worldAnchors.length < 2) {
    return;
  }

  let from = getFromAnchor(pen);
  let to = getToAnchor(pen);

  if (!from || !to) {
    return;
  }

  // 拖拽起点
  let dragFrom: boolean;
  if (pen.anchors?.length && from === pen.calculative.activeAnchor) {
    dragFrom = true;
    from = to;
    to = getFromAnchor(pen);
  } else if (
    (!pen.anchors || !pen.anchors.length) &&
    from !== pen.calculative.activeAnchor
  ) {
    from = pen.calculative.activeAnchor;
  }
  if (!from || !to) {
    return;
  }
  from.next = undefined;
  to.prev = undefined;
  const connected = to.connectTo;
  deleteTempAnchor(pen);

  const pts: Point[] = [];

  const fromPen = store.pens[from.connectTo];
  const toPen = store.pens[to.connectTo];
  
  let fromFace = facePen(from, fromPen);
  let toFace = facePen(to, toPen);
  // 如果起点位置为空白
  if(fromFace === -1){
    if(to.x > from.x){
      fromFace = Direction.Right;
    }
    if(to.x < from.x){
      fromFace = Direction.Left;
    }
  }
  // 处理下dline的fromFace
  // console.log(JSON.stringify(pen.calculative.worldAnchors));
  const anchors = pen.calculative.worldAnchors;
  if(anchors.length === 1){
    if(anchors[0].start && anchors[0].connectTo){
      // toFace = Direction.None;
      fromFace = Direction.Right;
      // console.log('case 1111',to.x);
      if(to.x < anchors[0].x){
        fromFace = Direction.Left;
      }
    }
    if(anchors[0].start && !anchors[0].connectTo){
      // console.log('case 3333',to.x);
      toFace = Direction.None;
    }
    if(anchors[0].end && !anchors[0].connectTo){
      // toFace = Direction.Left;
      fromFace = Direction.Right;
      // console.log('case 2222',to.x);
      if(to.x < anchors[0].x){
        toFace = Direction.Right;
        fromFace = Direction.Left;
      }else{
        toFace = Direction.Left;
        fromFace = Direction.Right;
      }
    }
    if(anchors[0].end && anchors[0].connectTo){
      // toFace = Direction.Left;
      fromFace = Direction.Right;
      // console.log('case 4444',to.x);
      if(to.x < anchors[0].x){
        toFace = Direction.Right;
        fromFace = Direction.Left;
      }else{

      }
    }
    // if(anchors[0].start && anchors[0].connectTo){
    //   toFace = Direction.Right;
    //   fromFace = Direction.Left;
    // }
  }
  // if(fromPen && fromPen.lineName === 'dline'){
  //   if(from.x < to.x){
  //     fromFace = Direction.Right;
  //   }else if(from.x > to.x){
  //     fromFace = Direction.Left;
  //   }
  // }
  // console.log('fromFace toFace 11111',fromFace,toFace,from.x,to.x);
  let a = getFacePoint(from, fromFace, faceSpace);
  if (a) {
    from = a;
    pts.push(a);
  }
  a = getFacePoint(to, toFace, faceSpace);
  const end = to;
  let corner = undefined;
  if (a) {
    to = a;
    if (end.connectTo) {
      if ((a.y > end.y && from.y < end.y) || (a.y < end.y && from.y > end.y)) {
        //拐角 防止连线覆盖
        corner = a;
        let _faceSpace = faceSpace;
        if (from.x < a.x) {
          _faceSpace = -_faceSpace;
        }
        if (Math.abs(from.x - a.x) < _faceSpace) {
          _faceSpace = -_faceSpace;
        }
        const point = { x: a.x + _faceSpace, y: a.y, id: s8() };
        to = point;
      }
    }
  }

  switch (fromFace) {
    case Direction.Up:
      pts.push(...getNextPointsOfUp(from, to, toFace));
      break;
    case Direction.Right:
      pts.push(...getNextPointsOfRight(from, to, toFace));
      break;
    case Direction.Bottom:
      pts.push(...getNextPointsOfBottom(from, to, toFace));
      break;
    case Direction.Left:
      pts.push(...getNextPointsOfLeft(from, to, toFace));
      break;
    default:
      pts.push(...getNextPoints(pen, from, to));
      break;
  }
  // 起点不存在，丢掉第一个拐点
  if(!fromPen){
    pts.shift();
  }
  pts.forEach((anchor: Point) => {
    anchor.id = s8();
    anchor.penId = pen.id;
    anchor.hidden = true;
    pen.calculative.worldAnchors.push(anchor);
  });

  pen.calculative.worldAnchors.push(to);
  if (corner) {
    pen.calculative.worldAnchors.push(corner);
  }
  if (a) {
    pen.calculative.worldAnchors.push(end);
  }

  if (dragFrom) {
    // console.log('dragFrom');
    pen.calculative.worldAnchors.reverse();
  }

  if (connected) {
    const i = pen.calculative.worldAnchors.length - 2;
    pen.calculative.worldAnchors[i].isTemp = false;
    pen.calculative.worldAnchors[1].isTemp = false;
  }
}

function getFacePoint(pt: Point, d: Direction, dis: number) {
  const point = { x: pt.x, y: pt.y, id: s8() };
  switch (d) {
    case Direction.Up:
      point.y -= dis;
      break;
    case Direction.Right:
      point.x += dis;
      break;
    case Direction.Bottom:
      point.y += dis;
      break;
    case Direction.Left:
      point.x -= dis;
      break;
    default: {
      return;
    }
  }
  return point;
}

function getNextPointsOfUp(from: Point, to: Point, toFace: Direction) {
  if (from.x === to.x || from.y === to.y) {
    return [];
  }

  const pts: Point[] = [];
  let x: number;
  let y: number;
  switch (toFace) {
    case Direction.Up:
      if (from.y < to.y) {
        x = to.x;
        y = from.y;
      } else {
        x = from.x;
        y = to.y;
      }
      pts.push({ x, y });
      break;
    case Direction.Bottom:
      x = to.x;
      y = from.y;
      if (to.y > from.y) {
        x = from.x + (to.x - from.x) / 2;
        pts.push({ x, y: from.y }, { x, y: to.y });
      } else {
        const centerY = (from.y + to.y) / 2;
        pts.push({ x: from.x, y: centerY }, { x: to.x, y: centerY });
      }

      break;
    case Direction.Right:
      x = to.x;
      y = from.y;
      if (to.x < from.x && to.y < from.y) {
        x = from.x;
        y = to.y;
      }
      pts.push({ x, y });
      break;
    case Direction.Left:
      x = to.x;
      y = from.y;
      if (to.x > from.x && to.y < from.y) {
        x = from.x;
        y = to.y;
      }
      pts.push({ x, y });
      break;
    default:
      if (to.y > from.y - faceSpace) {
        x = from.x + (to.x - from.x) / 2;
        pts.push({ x, y: from.y }, { x, y: to.y });
      } else {
        let y1;
        if(fixFace){
          y1 = from.y - faceSpace;
        }else{
          y1 = (from.y + to.y + faceSpace) / 2;
        }
        pts.push({ x: from.x, y: y1 }, { x: to.x, y: y1 });
      }
      break;
  }

  return pts;
}

function getNextPointsOfRight(from: Point, to: Point, toFace: Direction) {
  if (from.x === to.x || from.y === to.y) {
    return [];
  }

  const pts: Point[] = [];
  let x: number;
  let y: number;
  switch (toFace) {
    case Direction.Up:
      x = from.x;
      y = to.y;
      if (to.x > from.x && to.y > from.y) {
        x = to.x;
        y = from.y;
      }
      pts.push({ x, y });
      break;
    case Direction.Bottom:
      x = from.x;
      y = to.y;
      if (to.x > from.x && to.y < from.y) {
        x = to.x;
        y = from.y;
      }
      pts.push({ x, y });
      break;
    case Direction.Left:
      x = to.x;
      y = from.y;
      if (to.x < from.x) {
        y = from.y + (to.y - from.y) / 2;
        pts.push({ x: from.x, y }, { x: to.x, y });
      } else {
        const centerX = (from.x + to.x) / 2;
        pts.push({ x: centerX, y }, { x: centerX, y: to.y });
      }
      break;
    case Direction.Right:
      if (to.x < from.x) {
        pts.push({ x: from.x, y: to.y });
      } else {
        pts.push({ x: to.x, y: from.y });
      }
      break;
    default:
      x = to.x;
      y = to.y;
      if (to.x < from.x + faceSpace) {
        pts.push({ x: from.x, y });
      } else {
        let x1;
        if(fixFace){
          x1 = from.x  +  faceSpace;
        }else{
          x1 = (from.x + to.x - faceSpace) / 2;
        }
        pts.push({ x: x1, y: from.y }, { x: x1, y });
      }
      break;
  }

  return pts;
}

function getNextPointsOfBottom(from: Point, to: Point, toFace: Direction) {
  if (from.x === to.x || from.y === to.y) {
    return [];
  }

  const pts: Point[] = [];
  let x: number;
  let y: number;
  switch (toFace) {
    case Direction.Up:
      x = from.x;
      y = to.y;
      if (to.y < from.y) {
        x = from.x + (to.x - from.x) / 2;
        pts.push({ x, y: from.y }, { x, y: to.y });
      } else {
        const centerY = (from.y + to.y) / 2;
        pts.push({ x, y: centerY }, { x: to.x, y: centerY });
      }
      break;
    case Direction.Right:
      x = to.x;
      y = from.y;
      if (to.x < from.x && to.y > from.y) {
        x = from.x;
        y = to.y;
      }
      pts.push({ x, y });
      break;
    case Direction.Bottom:
      if (from.y > to.y) {
        x = to.x;
        y = from.y;
      } else {
        x = from.x;
        y = to.y;
      }
      pts.push({ x, y });

      break;
    case Direction.Left:
      x = to.x;
      y = from.y;
      if (to.x > from.x && to.y > from.y) {
        x = from.x;
        y = to.y;
      }
      pts.push({ x, y });
      break;
    default:
      x = from.x;
      if (to.y < from.y + faceSpace) {
        x = from.x + (to.x - from.x) / 2;
        pts.push({ x, y: from.y }, { x, y: to.y });
      } else {
        let y1;
        if(fixFace){
          y1 = from.y + faceSpace;
        }else{
          y1 = (from.y + to.y - faceSpace) / 2;
        }
        pts.push({ x, y: y1 }, { x: to.x, y: y1 });
      }
      break;
  }

  return pts;
}

function getNextPointsOfLeft(from: Point, to: Point, toFace: Direction) {
  if (from.x === to.x || from.y === to.y) {
    return [];
  }

  const pts: Point[] = [];
  let x: number;
  let y: number;
  switch (toFace) {
    case Direction.Up:
      x = from.x;
      y = to.y;
      if (to.x < from.x && to.y > from.y) {
        x = to.x;
        y = from.y;
      }
      pts.push({ x, y });
      break;
    case Direction.Bottom:
      x = from.x;
      y = to.y;
      if (to.x < from.x && to.y < from.y) {
        x = to.x;
        y = from.y;
      }
      pts.push({ x, y });
      break;
    case Direction.Right:
      x = from.x;
      y = to.y;
      if (to.x > from.x) {
        x = to.x;
        y = from.y + (to.y - from.y) / 2;
        pts.push({ x: from.x, y }, { x: to.x, y });
      } else {
        const centerX = (from.x + to.x) / 2;
        pts.push({ x: centerX, y: from.y }, { x: centerX, y: to.y });
      }
      break;
    case Direction.Left:
      if (to.x > from.x) {
        pts.push({ x: from.x, y: to.y });
      } else {
        pts.push({ x: to.x, y: from.y });
      }
      break;
    default:
      x = from.x;
      y = to.y;
      if (to.x < from.x - faceSpace) {
        let x1;
        if(fixFace){
          x1 = from.x - faceSpace;
        }else{
          x1 = (from.x + to.x + faceSpace) / 2;
        }
        pts.push({ x: x1, y: from.y }, { x: x1, y });
      } else {
        pts.push({ x: from.x, y });
      }
      break;
  }

  return pts;
}

function getNextPoints(pen: Pen, from: Point, to: Point) {
  const pts: Point[] = [];

  if (pen.calculative.drawlineH == undefined) {
    pen.calculative.drawlineH =
      Math.abs(to.x - from.x) > Math.abs(to.y - from.y);
  }
  let index = pen.calculative.worldAnchors.findIndex(
    (anchor) => anchor.id == from.id
  );
  if (index > 1) {
    let prev = pen.calculative.worldAnchors[index - 1];
    if (prev.x === from.x && prev.y !== from.y) {
      //水平
      pts.push({ x: to.x, y: from.y });
      return pts;
    } else if (prev.y === from.y && prev.x !== from.x) {
      //垂直
      pts.push({ x: from.x, y: to.y });
      return pts;
    }
  }

  if (pen.calculative.worldAnchors.length) {
    to.isTemp = undefined;
    if (pen.calculative.drawlineH) {
      pts.push({ x: to.x, y: from.y });
      // if (Math.abs(to.y - from.y) < faceSpace) {
      //   console.log('to.isTemp 111');
      //   to.isTemp = true;
      // }
    } else {
      pts.push({ x: from.x, y: to.y });
      // if (Math.abs(to.x - from.x) < faceSpace) {
      //   console.log('to.isTemp 222');
      //   to.isTemp = true;
      // }
    }
  }

  return pts;
}

export function anchorInHorizontal(pen: Pen, anchor: Point, from = true) {
  let anchors = pen.calculative.worldAnchors;
  if (!from) {
    anchors = [];
    pen.calculative.worldAnchors.forEach((item) => {
      anchors.unshift(item);
    });
  }
  for (let i = 0; i < anchors.length; i++) {
    if (anchors[i].id === anchor.id) {
      break;
    }

    if (anchors[i].y !== anchor.y) {
      return false;
    }

    if (
      anchors[i].x === anchors[i + 1]?.x &&
      anchors[i].y !== anchors[i + 1]?.y
    ) {
      return false;
    }
  }

  return true;
}

export function anchorInVertical(pen: Pen, anchor: Point, from = true) {
  let anchors = pen.calculative.worldAnchors;
  if (!from) {
    anchors = [];
    pen.calculative.worldAnchors.forEach((item) => {
      anchors.unshift(item);
    });
  }
  for (let i = 0; i < anchors.length; i++) {
    if (anchors[i].id === anchor.id) {
      break;
    }

    if (anchors[i].x !== anchor.x) {
      return false;
    }

    if (
      anchors[i].y === anchors[i + 1]?.y &&
      anchors[i].x !== anchors[i + 1]?.x
    ) {
      return false;
    }
  }

  return true;
}

export function translatePolylineAnchor(
  pen: Pen,
  anchor: Point,
  pt: { x: number; y: number }
) {
  if (!pen.calculative.worldAnchors) {
    return;
  }

  const i = pen.calculative.worldAnchors.findIndex(
    (item) => item.id === anchor.id
  );

  const from = getFromAnchor(pen);
  const to = getToAnchor(pen);

  let prev = pen.calculative.worldAnchors[i - 1];
  let next = pen.calculative.worldAnchors[i + 1];
  if (pen.calculative.h == undefined) {
    if (from.connectTo) {
      if (anchorInHorizontal(pen, anchor, true)) {
        pen.calculative.h = true;
      } else if (anchorInVertical(pen, anchor, true)) {
        pen.calculative.h = false;
      }
    }
    if (pen.calculative.h == undefined && to.connectTo) {
      if (anchorInHorizontal(pen, anchor, false)) {
        pen.calculative.h = true;
      } else if (anchorInVertical(pen, anchor, false)) {
        pen.calculative.h = false;
      }
    }

    if (pen.calculative.h == undefined) {
      if (prev) {
        pen.calculative.h = prev.y === anchor.y;
      } else if (next) {
        pen.calculative.h = next.y === anchor.y;
      }
    }
  }

  // 水平
  if (pen.calculative.h) {
    anchor.x = pt.x;

    if (from.connectTo && anchorInHorizontal(pen, anchor, true)) {
      if (next && next.y !== anchor.y) {
        next.x = anchor.x;
      }

      return;
    }

    if (to.connectTo && anchorInHorizontal(pen, anchor, false)) {
      if (prev && prev.y !== anchor.y) {
        prev.x = anchor.x;
      }
      return;
    }

    const a = pen.anchors[i];
    let d: any;
    for (let pos = i - 1; pos > -1; pos--) {
      prev = pen.anchors[pos];
      if (d == undefined) {
        d = prev.y === a.y;
      }
      if (d === true) {
        if (prev.y === a.y) {
          pen.calculative.worldAnchors[pos].y = pt.y;
        } else {
          break;
        }
      } else {
        if (prev.x === a.x) {
          pen.calculative.worldAnchors[pos].x = pt.x;
        } else {
          break;
        }
      }
    }

    d = undefined;
    for (let pos = i + 1; pos < pen.calculative.worldAnchors.length; pos++) {
      next = pen.anchors[pos];
      if (next) {
        if (d == undefined) {
          d = next.y === a.y;
        }

        if (d === true) {
          if (next.y === a.y) {
            pen.calculative.worldAnchors[pos].y = pt.y;
          } else {
            break;
          }
        } else {
          if (next.x === a.x) {
            pen.calculative.worldAnchors[pos].x = pt.x;
          } else {
            break;
          }
        }
      } else {
        break;
      }
    }

    anchor.y = pt.y;
  }
  // 垂直
  else {
    anchor.y = pt.y;

    if (from.connectTo && anchorInVertical(pen, anchor, true)) {
      if (next && next.x !== anchor.x) {
        next.y = anchor.y;
      }

      return;
    }

    if (to.connectTo && anchorInVertical(pen, anchor, false)) {
      if (prev && prev.x !== anchor.x) {
        prev.y = anchor.y;
      }
      return;
    }

    const a = pen.anchors[i];
    let d: any;
    for (let pos = i - 1; pos > -1; pos--) {
      prev = pen.anchors[pos];
      if (d == undefined) {
        d = prev.x === a.x;
      }
      if (d === true) {
        if (prev.x === a.x) {
          pen.calculative.worldAnchors[pos].x = pt.x;
        } else {
          break;
        }
      } else {
        if (prev.y === a.y) {
          pen.calculative.worldAnchors[pos].y = pt.y;
        } else {
          break;
        }
      }
    }

    d = undefined;
    for (let pos = i + 1; pos < pen.calculative.worldAnchors.length; pos++) {
      next = pen.anchors[pos];
      if (next) {
        if (d == undefined) {
          d = next.x === a.x;
        }

        if (d === true) {
          if (next.x === a.x) {
            pen.calculative.worldAnchors[pos].x = pt.x;
          } else {
            break;
          }
        } else {
          if (next.y === a.y) {
            pen.calculative.worldAnchors[pos].y = pt.y;
          } else {
            break;
          }
        }
      } else {
        break;
      }
    }

    anchor.x = pt.x;
  }
}
