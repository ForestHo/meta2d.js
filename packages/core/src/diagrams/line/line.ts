import { deleteTempAnchor, getFromAnchor, getGradientAnimatePath, getToAnchor, Pen } from '../../pen';
import { hitPoint, Point } from '../../point';
import { getRectOfPoints, pointInSimpleRect, Rect } from '../../rect';
import { Meta2dStore } from '../../store';
import { getBezierPoint, getQuadraticPoint } from './curve';
import { AnchorType } from '../../point/point';
import { round } from '../../utils/math';
import { s8 } from '../../utils/uuid';
import { deepClone, distance, lineFromPoints } from '../../utils';
enum LINE_NAME{
  LINE = 'line',
  POLYLINE = 'polyline',
  DLINE = 'dline',
  ACTIVATE = 'activate'
}
export function line(
  pen: Pen,
  ctx?: CanvasRenderingContext2D | Path2D
): Path2D {
  // console.log('line',pen);
  const path = !ctx ? new Path2D() : ctx;
  if (pen.lineName === LINE_NAME.LINE || pen.lineName === LINE_NAME.POLYLINE) {
    if (pen.calculative.lineSmooth) {
      let _path = getGradientAnimatePath(pen);
      (path as Path2D).addPath(_path);
      if (path instanceof Path2D) return path;
    }
  }
  const worldAnchors = pen.calculative.worldAnchors;
  // 计算dline的动态锚点
  if (pen.lineName === LINE_NAME.DLINE) {
    // console.log('worldAnchors',JSON.stringify(worldAnchors));
    const step = pen.lineStep || 20;
    // 备份锚点的连接关系
    const anchorBaks = pen.anchorBaks || [];
    for (let i = 0; i < worldAnchors.length; i++) {
      const an = worldAnchors[i];
      if (an.aType === AnchorType.DYNAMIC && an.connectTo) {
        const index = anchorBaks.findIndex(el=> el.connectTo === an.connectTo && el.anchorId === an.anchorId);
        if(index === -1){
          anchorBaks.push({
            index: i,
            connectTo: an.connectTo,
            anchorId: an.anchorId,
            id: an.id
          });
        }
      }
    }
    // 删除无效的动态锚点
    for (let i = 0; i < anchorBaks.length; i++) {
      const ana = anchorBaks[i];
      const index = pen.connectedLines.findIndex(el=> el.lineId === ana.connectTo && el.lineAnchor === ana.anchorId);
      if(index === -1){
        anchorBaks.splice(i,1);
        i--;
      }
    }
    // console.log('anchorBaks',(anchorBaks));
    if(anchorBaks.length > 0){
      pen.anchorBaks = deepClone(anchorBaks)
    }
    // 收集无效连接关系的锚点
    // 动态锚点的删除
    // for (let i = 0; i < worldAnchors.length; i++) {
    //   const an = worldAnchors[i];
    //   if (an.aType === AnchorType.DYNAMIC && an.connectTo) {
    //     const index = anchorBaks.findIndex(el=> el.id === an.id);
    //     if(index === -1){
    //       anchorBaks.push({
    //         index: i,
    //         connectTo: an.connectTo,
    //         anchorId: an.anchorId,
    //         id: an.id
    //       });
    //     }
    //   }
    // }
    for (let i = 0; i < worldAnchors.length; i++) {
      const an = worldAnchors[i];
      if (an.aType === AnchorType.DYNAMIC) {
        worldAnchors.splice(i, 1);
        i--;
      }
    }
    if(pen.direction === 'horizontal'){
      const startIndex = worldAnchors.findIndex(el=> el.x === pen.calculative.worldRect.x);
      const endIndex = worldAnchors.findIndex(el=> el.x === pen.calculative.worldRect.ex);
      if(startIndex > -1 && endIndex > -1){
        const dAnchors = [];
        let startX = worldAnchors[startIndex].x,endX = worldAnchors[endIndex].x,startY = worldAnchors[startIndex].y;
        const penId = worldAnchors[startIndex].penId;
        startX += step;
        let index = startIndex+1;
        while (startX < endX) {
          dAnchors.push({
            x: startX, 
            y: startY,
            index,
            penId,
            id: s8(),
            aType: AnchorType.DYNAMIC 
          });
          startX = startX + step;
        }
        const many = worldAnchors.length === 2 ? 0 : dAnchors.length
        if(many > 0){
          for (let k = 0; k < dAnchors.length; k++) {
            const d = dAnchors[k];
            worldAnchors[startIndex+k+1].x = d.x;
            worldAnchors[startIndex+k+1].y = d.y;
          }
        }else{
          worldAnchors.splice(startIndex+1,many,...dAnchors);
        }
        worldAnchors[worldAnchors.length-1].x = startY;
      }
    }else{
      const startIndex = worldAnchors.findIndex(el=> el.y === pen.calculative.worldRect.y);
      const endIndex = worldAnchors.findIndex(el=> el.y === pen.calculative.worldRect.ey);
      // console.log('startIndex  v',startIndex,endIndex);
      if(startIndex > -1 && endIndex > -1){
        const dAnchors = [];
        let startY = worldAnchors[startIndex].y,endY = worldAnchors[endIndex].y,startX = worldAnchors[startIndex].x;
        const penId = worldAnchors[startIndex].penId;
        startY += step;
        let index = startIndex+1;
        while (startY < endY) {
          dAnchors.push({
            x: startX,
            y: startY,
            penId,
            index,
            id: s8(),
            // hidden: true,
            aType: AnchorType.DYNAMIC
          });
          startY = startY + step;
          index++;
        }
        const many = worldAnchors.length === 2?0:dAnchors.length
        worldAnchors.splice(startIndex+1,many,...dAnchors);
        // console.log('worldAnchors22222',worldAnchors);
        // if(many > 0){
        //   for (let k = 0; k < dAnchors.length; k++) {
        //     const d = dAnchors[k];
        //     worldAnchors[startIndex+k+1].x = d.x;
        //     worldAnchors[startIndex+k+1].y = d.y;
        //   }
        // }else{
        //   worldAnchors.splice(startIndex+1,many,...dAnchors);
        // }
        worldAnchors[worldAnchors.length-1].x = startX;
        // 从备份的anchors中恢复连接关系
        for (let i = 0; i < anchorBaks.length; i++) {
          const ana = anchorBaks[i];
          // console.log('anchorBaks',JSON.stringify(anchorBaks));
          if(ana.index < worldAnchors.length){
            // console.log('worldAnchors[ana.index]',anchorBaks.length,i,ana.index);
            worldAnchors[ana.index].connectTo = ana.connectTo;
            worldAnchors[ana.index].anchorId = ana.anchorId;
            worldAnchors[ana.index].id = ana.id;
            const mIndex = pen.connectedLines.findIndex(el=> el.lineId === ana.connectTo);
            // console.log('mIndex',mIndex);
            if(mIndex > -1){
              // pen.connectedLines[mIndex].anchor = ana.anchorId;
            }
            // 恢复连到起点锚点的动态锚点的连接关系
            // console.log('ana.index <= worldAnchors.length-2',ana.index <= worldAnchors.length-2,pen.deltaH);
            if(ana.index <= worldAnchors.length-2 && pen.deltaH >= 0){
              // console.log("backup anchors");
              pen.connectedLines[mIndex].anchor = worldAnchors[ana.index].id;
              pen.calculative.worldAnchors[ana.index].connectTo = ana.connectTo;
              pen.calculative.worldAnchors[ana.index].anchorId = ana.anchorId;
              const anaPen = pen.calculative.canvas.store.data.pens.find(el=> el.id === ana.connectTo);
              if(anaPen){
                let anaIndex = -1;
                if(anaPen.lineName !== LINE_NAME.ACTIVATE){
                  anaIndex = anaPen.calculative.worldAnchors.findIndex(el=> el.id === ana.anchorId);
                }else{
                  anaIndex = ana.connectIndex;
                }
                if(anaIndex <= anaPen.calculative.worldAnchors.length - 1){
                  anaPen.calculative.worldAnchors[anaIndex].anchorId = worldAnchors[ana.index].id;
                  anaPen.anchors[anaIndex].anchorId = worldAnchors[ana.index].id;
                }
              }
              pen.calculative.canvas.updateLines(pen);
            }
          }
          if(ana.index >= worldAnchors.length-1){
            // console.log("worldAnchors[startIndex]",worldAnchors[startIndex]);
            // worldAnchors[ana.index].connectTo = worldAnchors[startIndex].connectTo;
            // worldAnchors[ana.index].anchorId = worldAnchors[startIndex].anchorId;
            // worldAnchors[ana.index].id = worldAnchors[startIndex].id;
            // ana.lastIndex = ana.index;
            // ana.index = 0;
            // worldAnchors[ana.index].connectTo = ana.connectTo;
            // worldAnchors[ana.index].anchorId = ana.anchorId;
            // worldAnchors[ana.index].id = ana.id;
            // const mpen = pen.calculative.canvas.store.data.pens.find(el=> el.id === worldAnchors[startIndex].connectTo);
            // console.log('mpen',mpen);
            const mIndex = pen.connectedLines.findIndex(el=> el.lineId === ana.connectTo);
            // console.log('mIndex',mIndex,ana.connectTo);
            if(mIndex === -1){
              // const anaPen = pen.calculative.canvas.store.data.pens.find(el=> el.id === ana.connectTo);
              // console.log('anaPen',anaPen);
              // const anaIndex = anaPen.calculative.worldAnchors.findIndex(el=> el.id === ana.anchorId);
              // console.log('anaIndex',anaIndex);
              // let obj = {
              //   anchor: worldAnchors[startIndex].anchorId,
              //   lineId: anaPen.id,
              //   lineAnchor: ana.anchorId
              // }
              // console.log('obj',obj);
              // mpen.connectedLines.push(obj);

              // anaPen.calculative.worldAnchors[anaIndex].connectTo = mpen.id;
              // anaPen.calculative.worldAnchors[anaIndex].anchorId = obj.anchor;
              // anaPen.anchors[anaIndex].connectTo = mpen.id;
              // anaPen.anchors[anaIndex].anchorId = obj.anchor;

              // pen.calculative.canvas.updateLines(mpen);
            }else{
              // console.log('pen.deltaH',pen.deltaH);
              // 中间动态锚点练到起点锚点
              if(pen.deltaH < 0 && ana.index <= pen.calculative.worldAnchors.length-1){
                pen.connectedLines[mIndex].anchor = worldAnchors[startIndex].id;
                pen.calculative.worldAnchors[ana.index].connectTo = ana.connectTo;
                pen.calculative.worldAnchors[ana.index].anchorId = ana.anchorId;
                const anaPen = pen.calculative.canvas.store.data.pens.find(el=> el.id === ana.connectTo);
                let anaIndex = -1;
                if(anaPen.lineName !== LINE_NAME.ACTIVATE){
                  anaIndex = anaPen.calculative.worldAnchors.findIndex(el=> el.id === ana.anchorId);
                }else{
                  anaIndex = ana.connectIndex;
                }
                if(anaIndex <= anaPen.calculative.worldAnchors.length - 1){
                  anaPen.calculative.worldAnchors[anaIndex].anchorId = worldAnchors[startIndex].id;
                  anaPen.anchors[anaIndex].anchorId = worldAnchors[startIndex].id;
                }
                pen.calculative.canvas.updateLines(pen);
              }
            }
          }
        }
      }
    }
  }
  // 计算激活的动态锚点 activate
  if(pen.lineName === LINE_NAME.ACTIVATE){
    // console.log('worldAnchors',JSON.stringify(worldAnchors));
    const step = pen.lineStep || 30;
    // 备份锚点的连接关系
    const anchorBaks = pen.anchorBaks || [];
    for (let i = 0; i < worldAnchors.length; i++) {
      const an = worldAnchors[i];
      if (an.aType === AnchorType.DYNAMIC && an.connectTo) {
        const index = anchorBaks.findIndex(el=> el.connectTo === an.connectTo && el.anchorId === an.anchorId);
        if(index === -1){
          anchorBaks.push({
            index: i,
            connectTo: an.connectTo,
            anchorId: an.anchorId,
            id: an.id
          });
        }
      }
    }
    // 删除无效的动态锚点
    for (let i = 0; i < anchorBaks.length; i++) {
      const ana = anchorBaks[i];
      const index = pen.connectedLines?.findIndex(el=> el.lineId === ana.connectTo && el.lineAnchor === ana.anchorId);
      if(index === -1){
        anchorBaks.splice(i,1);
        i--;
      }
    }
    // 动态锚点的删除
    for (let i = 0; i < worldAnchors.length; i++) {
      const an = worldAnchors[i];
      // 如果是动态锚点，并且是附属锚点
      if (an.aType === AnchorType.DYNAMIC && an.appurtenant) {
        worldAnchors.splice(i, 1);
        i--;
      }
    }
    const startIndex = worldAnchors.findIndex(el=> el.start);
    const endIndex = worldAnchors.findIndex(el=> el.end);
    if(startIndex > -1 && endIndex > -1){
      const dAnchors = [];
      let startY = worldAnchors[startIndex].y,startX = worldAnchors[startIndex].x,endX = worldAnchors[endIndex].x,endY = worldAnchors[endIndex].y;
      const penId = worldAnchors[startIndex].penId;
      const {lineWidth} = pen.calculative;
      // 1.计算斜率和线的长度
      const AB = round(distance(worldAnchors[startIndex],worldAnchors[endIndex]),0);
      // console.log('AB',AB);
      const { a, b, c } = lineFromPoints(worldAnchors[endIndex],worldAnchors[startIndex]);
      const k = - (a / b);
      // console.log('k',k,a);

      let k1 = 1;
      if (a !== 0) {
        // 垂直相交线的斜率
        k1 = b / a;
      } else {
        // a=0,则为平行于x轴的线
        k1 = worldAnchors[startIndex].y;
      }
      const radius = lineWidth /2 ;
      // 相对于起点的偏移量
      const deltaX = (round(Math.sqrt((radius * radius) / (k1 * k1 + 1)),2));
      const deltaY = (round(k1 * deltaX,2));
      // console.log('k1',k1,startX,startY,deltaX,deltaY);
      let index = 0;
      // 一对起点坐标
      const x1 = startX - deltaX, y1 = startY - deltaY;
      const x2 = startX + deltaX, y2 = startY + deltaY;
      const startPairs = [
        {
          x: x1,
          y: y1,
          penId,
          radius: 2,
          index,
          appurtenant: true,
          id: s8(),
          // hidden: true,
          aType: AnchorType.DYNAMIC
        },
        {
          x: x2,
          y: y2,
          penId,
          radius: 2,
          index,
          appurtenant: true,
          id: s8(),
          // hidden: true,
          aType: AnchorType.DYNAMIC
        }
      ]
      // 先push起点坐标
      dAnchors.push(...startPairs);

      let dX = Math.abs(round(Math.sqrt((step * step) / (k * k + 1)),2));
      let dY = Math.abs(round(k * dX,2));
      // console.log('startX startY',startX,startY);
      // console.log('endX endY',endX,endY);
      let x11 = x1, y11 = y1,x22 = x2, y22 = y2;
      // console.log('dX dY',dX,dY);
      if(isNaN(dY)){
        dY = step;
      }
      index++;
      for (let dis = step;dis <= AB;dis = dis + step,index++) {
        if(startX < endX){
          x11 = x11 + dX;
          x22 = x22 + dX;
        }else{
          x11 = x11 - dX;
          x22 = x22 - dX;
        }
        if(startY < endY){
          y11 = y11 + dY;
          y22 = y22 + dY;
        }else{
          y11 = y11 - dY;
          y22 = y22 - dY;
        }
        const pairs = [
          {
            x: x11,
            y: y11,
            penId,
            radius: 2,
            index,
            appurtenant: true,
            id: s8(),
            // hidden: true,
            aType: AnchorType.DYNAMIC
          },
          {
            x: x22,
            y: y22,
            penId,
            radius: 2,
            index,
            appurtenant: true,
            id: s8(),
            // hidden: true,
            aType: AnchorType.DYNAMIC
          }
        ]
        dAnchors.push(...pairs);
      }
      // console.log('dAnchors',dAnchors);
      const many = worldAnchors.length === 2?0:dAnchors.length
      worldAnchors.splice(startIndex+1,many,...dAnchors);

      // 给每个锚点加真实的顺序
      for (let n = 0; n < worldAnchors.length; n++) {
        const anc = worldAnchors[n];
        anc.sortIndex = n;
      }

      // 从备份的anchors中恢复连接关系
      for (let m = 0; m < anchorBaks.length; m++) {
        const ana = anchorBaks[m];
        // console.log('ana index',ana.index,worldAnchors.length,pen.deltaH);
        if((ana.index < (worldAnchors.length-2)/2) && pen.deltaH >= 0){
          // console.log('less',ana.index,worldAnchors.length)
          const mIndex = pen.connectedLines.findIndex(el=> el.lineId === ana.connectTo);
          // console.log('mIndex',mIndex,ana.sortIndex,ana);
          pen.connectedLines[mIndex].anchor = worldAnchors[ana.sortIndex].id;
          pen.calculative.worldAnchors[ana.sortIndex].connectTo = ana.connectTo;
          pen.calculative.worldAnchors[ana.sortIndex].anchorId = ana.anchorId;
          
          const anaPen = pen.calculative.canvas.store.data.pens.find(el=> el.id === ana.connectTo);
          // console.log('anaPen',anaPen);
          if(anaPen){
            const anaIndex = anaPen.calculative.worldAnchors.findIndex(el=> el.id === ana.anchorId);
            // console.log('anaIndex',anaIndex);
            anaPen.calculative.worldAnchors[anaIndex].anchorId = worldAnchors[ana.sortIndex].id;
            anaPen.anchors[anaIndex].anchorId = worldAnchors[ana.sortIndex].id;
          }
          pen.calculative.canvas.updateLines(pen);
        }
        if((ana.index >= (worldAnchors.length-2)/2) && pen.deltaH < 0){
          // console.log('than',ana.index,worldAnchors.length)
          anchorBaks.splice(m,1);
          m--;
        }
      }
    }
    // console.log('anchorBaks',(anchorBaks));
    if(anchorBaks.length > 0){
      pen.anchorBaks = deepClone(anchorBaks)
    }
  }
  if (worldAnchors.length > 1) {
    let from: Point; // 上一个点
    worldAnchors.forEach((pt: Point,index: number) => {
      // 附属锚点直接跳过，不参与绘制
      if(pt.appurtenant) return;
      if (from) {
        draw(path, from, pt);
      } else {
        pt.start = true;
      }
      if(index === worldAnchors.length-1){
        pt.end = true;
      }else{
        if(pt.end){
          // 删除绘制连线中间产生的结束标志
          delete pt.end;
        }
      }
      from = pt;
    });
    if (pen.close) {
      draw(path, from, worldAnchors[0]);
    }
  }
  if (path instanceof Path2D) return path;
}

export function lineSegment(store: Meta2dStore, pen: Pen, mousedwon?: Point) {
  if (!pen.calculative.worldAnchors) {
    pen.calculative.worldAnchors = [];
  }

  if (pen.calculative.worldAnchors.length < 2 || pen.anchors?.length > 1) {
    return;
  }

  const from = getFromAnchor(pen);
  const to = getToAnchor(pen);
  if (!from || !to || !to.id || from === to) {
    return;
  }
  from.next = undefined;
  deleteTempAnchor(pen);
  to.prev = undefined;
  pen.calculative.worldAnchors.push(to);
}

function draw(path: CanvasRenderingContext2D | Path2D, from: Point, to: Point) {
  if (!to || to.isTemp) {
    return;
  }
  from.start && path.moveTo(from.x, from.y);
  if (from.next) {
    if (to.prev) {
      path.bezierCurveTo(
        from.next.x,
        from.next.y,
        to.prev.x,
        to.prev.y,
        to.x,
        to.y
      );
    } else {
      path.quadraticCurveTo(from.next.x, from.next.y, to.x, to.y);
    }
  } else {
    if (to.prev) {
      path.quadraticCurveTo(to.prev.x, to.prev.y, to.x, to.y);
    } else {
      path.lineTo(to.x, to.y);
    }
  }
}

export function getLineRect(pen: Pen) {
  getLineLength(pen);
  return getRectOfPoints(getLinePoints(pen));
}

/**
 * 获取连线的 points ，并非 worldAnchors ，worldAnchors 之前的路径点也会记录
 */
export function getLinePoints(pen: Pen) {
  const pts: Point[] = [];
  let from: Point; // 上一个点
  pen.calculative.worldAnchors.forEach((pt: Point) => {
    pts.push(pt);
    from && pts.push(...getPoints(from, pt, pen));
    from = pt;
  });
  if (pen.close && pen.calculative.worldAnchors.length > 1) {
    pts.push(...getPoints(from, pen.calculative.worldAnchors[0], pen));
  }
  return pts;
}

export function getLineR(pen: Pen) {
  return pen?.lineWidth ? pen.lineWidth / 2 + 4 : 4;
}

export function getPoints(from: Point, to: Point, pen?: Pen) {
  const pts: Point[] = [];
  if (!to) {
    return pts;
  }

  let step = 0.02;
  if (from.lineLength) {
    const r = getLineR(pen);
    step = r / from.lineLength;
  }
  if (from.next) {
    if (to.prev) {
      for (let i = step; i < 1; i += step) {
        pts.push(getBezierPoint(i, from, from.next, to.prev, to));
      }
    } else {
      for (let i = step; i < 1; i += step) {
        pts.push(getQuadraticPoint(i, from, from.next, to));
      }
    }
  } else {
    if (to.prev) {
      for (let i = step; i < 1; i += step) {
        pts.push(getQuadraticPoint(i, from, to.prev, to));
      }
    } else {
      pts.push({ x: to.x, y: to.y });
    }
  }
  if (pts.length > 1) {
    from.curvePoints = pts;
  }

  return pts;
}

export function pointInLine(pt: Point, pen: Pen) {
  const r = getLineR(pen);

  let i = 0;
  let from: Point; // 上一个点
  let point: Point;
  for (const anchor of pen.calculative.worldAnchors) {
    if (from) {
      point = pointInLineSegment(pt, from, anchor, r);
      if (point) {
        return {
          i,
          point,
        };
      }
      ++i;
    }
    from = anchor;
  }
  if (
    pen.close &&
    pen.calculative.worldAnchors.length > 1 &&
    (point = pointInLineSegment(pt, from, pen.calculative.worldAnchors[0], r))
  ) {
    return {
      i,
      point,
    };
  }
}
export function pointInLineSegment(pt: Point, pt1: Point, pt2: Point, r = 4) {
  if (!pt1.next && !pt2.prev) {
    const { x: x1, y: y1 } = pt1;
    const { x: x2, y: y2 } = pt2;
    const minX = Math.min(x1, x2);
    const maxX = Math.max(x1, x2);
    const minY = Math.min(y1, y2);
    const maxY = Math.max(y1, y2);
    if (
      !(
        pt.x >= minX - r &&
        pt.x <= maxX + r &&
        pt.y >= minY - r &&
        pt.y <= maxY + r
      )
    ) {
      return;
    }
    return pointToLine(pt, pt1, pt2, r);
  } else if (pt1.curvePoints) {
    for (const point of pt1.curvePoints) {
      if (hitPoint(pt, point, r)) {
        return point;
      }
    }
  }
}

export function pointToLine(pt: Point, pt1: Point, pt2: Point, r = 4) {
  // 竖线
  if (pt1.x === pt2.x) {
    const len = Math.abs(pt.x - pt1.x);
    if (len <= r) {
      return {
        x: pt1.x,
        y: pt.y,
      };
    }
  } else {
    const A = (pt1.y - pt2.y) / (pt1.x - pt2.x);
    const B = pt1.y - A * pt1.x;
    const len = Math.abs((A * pt.x + B - pt.y) / Math.sqrt(A * A + 1));
    if (len <= r) {
      const m = pt.x + A * pt.y;
      const x = (m - A * B) / (A * A + 1);
      return {
        x,
        y: A * x + B,
      };
    }
  }
}

function lineLen(from: Point, cp1?: Point, cp2?: Point, to?: Point): number {
  if (!cp1 && !cp2) {
    return (
      Math.sqrt(
        Math.pow(Math.abs(from.x - to.x), 2) +
          Math.pow(Math.abs(from.y - to.y), 2)
      ) || 0
    );
  }

  const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  if (cp1 && cp2) {
    path.setAttribute(
      'd',
      `M${from.x} ${from.y} C${cp1.x} ${cp1.y} ${cp2.x} ${cp2.y} ${to.x} ${to.y}`
    );
  } else if (cp1) {
    path.setAttribute(
      'd',
      `M${from.x} ${from.y} Q${cp1.x} ${cp1.y} ${to.x} ${to.y}`
    );
  } else {
    path.setAttribute(
      'd',
      `M${from.x} ${from.y} Q${cp2.x} ${cp2.y} ${to.x} ${to.y}`
    );
  }
  return path.getTotalLength() || 0;
}

export function getLineLength(pen: Pen): number {
  if (pen.calculative.worldAnchors.length < 2) {
    return 0;
  }

  let len = 0;
  let from: Point; // 上一个点
  pen.calculative.worldAnchors.forEach((pt: Point) => {
    if (from) {
      from.lineLength = lineLen(from, from.next, pt.prev, pt);
      len += from.lineLength;
    }
    from = pt;
  });
  if (pen.close) {
    // pen.close ，下一个点即第一个点
    const to = getFromAnchor(pen);
    from.lineLength = lineLen(from, from.next, to.prev, to);
    len += from.lineLength;
  }
  if (pen.calculative.animatePos) {
    pen.calculative.animatePos =
      (len / pen.length) * pen.calculative.animatePos;
  }
  pen.length = len;
  return len;
}

/**
 * 连线在 rect 内， 连线与 rect 相交
 */
export function lineInRect(line: Pen, rect: Rect) {
  // 判断是直线还是贝塞尔
  const worldAnchors = line.calculative.worldAnchors;
  for (let index = 0; index < worldAnchors.length - 1; index++) {
    const current = worldAnchors[index];
    const next = worldAnchors[index + 1];
    if (!current.next && !next.prev) {
      // 线段
      if (isLineIntersectRectangle(current, next, rect)) {
        return true;
      }
    } else {
      // 贝塞尔
      if (isBezierIntersectRectangle(current, next, rect)) {
        return true;
      }
    }
  }
  return false;
}

/**
 * 线段与矩形是否相交
 * @param rect 矩形
 */
export function isLineIntersectRectangle(pt1: Point, pt2: Point, rect: Rect) {
  if (pointInSimpleRect(pt1, rect) || pointInSimpleRect(pt2, rect)) {
    // 存在一个点在矩形内部
    return true;
  }
  const linePointX1 = pt1.x;
  const linePointY1 = pt1.y;
  const linePointX2 = pt2.x;
  const linePointY2 = pt2.y;

  let rectangleLeftTopX = rect.x;
  let rectangleLeftTopY = rect.y;
  let rectangleRightBottomX = rect.ex;
  let rectangleRightBottomY = rect.ey;

  const lineHeight = linePointY1 - linePointY2;
  const lineWidth = linePointX2 - linePointX1; // 计算叉乘
  const c = linePointX1 * linePointY2 - linePointX2 * linePointY1;
  if (
    (lineHeight * rectangleLeftTopX + lineWidth * rectangleLeftTopY + c >= 0 &&
      lineHeight * rectangleRightBottomX +
        lineWidth * rectangleRightBottomY +
        c <=
        0) ||
    (lineHeight * rectangleLeftTopX + lineWidth * rectangleLeftTopY + c <= 0 &&
      lineHeight * rectangleRightBottomX +
        lineWidth * rectangleRightBottomY +
        c >=
        0) ||
    (lineHeight * rectangleLeftTopX + lineWidth * rectangleRightBottomY + c >=
      0 &&
      lineHeight * rectangleRightBottomX + lineWidth * rectangleLeftTopY + c <=
        0) ||
    (lineHeight * rectangleLeftTopX + lineWidth * rectangleRightBottomY + c <=
      0 &&
      lineHeight * rectangleRightBottomX + lineWidth * rectangleLeftTopY + c >=
        0)
  ) {
    if (rectangleLeftTopX > rectangleRightBottomX) {
      const temp = rectangleLeftTopX;
      rectangleLeftTopX = rectangleRightBottomX;
      rectangleRightBottomX = temp;
    }
    if (rectangleLeftTopY < rectangleRightBottomY) {
      const temp1 = rectangleLeftTopY;
      rectangleLeftTopY = rectangleRightBottomY;
      rectangleRightBottomY = temp1;
    }
    if (
      (linePointX1 < rectangleLeftTopX && linePointX2 < rectangleLeftTopX) ||
      (linePointX1 > rectangleRightBottomX &&
        linePointX2 > rectangleRightBottomX) ||
      (linePointY1 > rectangleLeftTopY && linePointY2 > rectangleLeftTopY) ||
      (linePointY1 < rectangleRightBottomY &&
        linePointY2 < rectangleRightBottomY)
    ) {
      return false;
    } else {
      return true;
    }
  } else {
    return false;
  }
}

/**
 * 贝塞尔曲线与矩形是否相交
 * @param from 前点
 * @param to 后点
 * @param rect 矩形
 */
export function isBezierIntersectRectangle(from: Point, to: Point, rect: Rect) {
  const step = 0.02;
  if (!from.next && !to.prev) {
    // 直线
    return isLineIntersectRectangle(from, to, rect);
  } else if (from.next && to.prev) {
    for (let i = step; i < 1; i += step) {
      const point = getBezierPoint(i, from, from.next, to.prev, to);
      if (pointInSimpleRect(point, rect)) {
        return true;
      }
    }
  } else if (from.next || to.prev) {
    for (let i = step; i < 1; i += step) {
      const point = getQuadraticPoint(i, from, from.next || to.prev, to);
      if (pointInSimpleRect(point, rect)) {
        return true;
      }
    }
  }

  return false;
}
