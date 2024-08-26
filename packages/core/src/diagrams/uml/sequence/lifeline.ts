import { Pen, calcWorldAnchors,connectLine } from '../../../pen';
import { round } from '../../../utils';
import { Point,AnchorType } from '../../../point'
import { s8 } from '../../../utils'

const dashAnchorStep = 40; //虚线锚点的固定步长
export function lifeline(ctx: CanvasRenderingContext2D, pen: Pen) {
  const { x, y, width, height, ey } = pen.calculative.worldRect;
  if (!pen.onDestroy) {
    // pen.onMouseDown = onMouseDown;
    pen.onAdd = onAdd;
    // pen.onResize = onResize;
  }
  // console.log('lifeline', pen.leftH);
  // const headHeight =  height;
  // const headHeight = (pen as any).headHRatio * height ?? 50;
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
  if (height < 2 * r) {
    r = height / 2;
  }
  const fillStyle = pen.background || "";
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + width, y, x + width, y + height, r);
  ctx.arcTo(x + width, y + height, x, y + height, r);
  ctx.arcTo(x, y + height, x, y, r);
  ctx.arcTo(x, y, x + width, y, r);
  fillStyle && ctx.fill();
  ctx.stroke();
  ctx.closePath();
  
  // pen.height = height;

  // ctx.save();
  // ctx.beginPath();
  // ctx.lineWidth = 1;
  // ctx.setLineDash([7, 7]);
  // const middle = x + width / 2;
  // const leftY = y + headHeight + 1;
  // ctx.moveTo(middle, leftY);
  // const endY = !pen.leftH ? ey : leftY + pen.leftH;
  // ctx.lineTo(middle, endY);
  // ctx.stroke();
  // ctx.restore();

}

function onAdd(pen: Pen) {
  // pen.leftH = pen.height - pen.headHeight;
  if (!pen.followers) {
    pen.followers = [];
  }
  if (!pen.connectedLines) {
    pen.connectedLines = [];
  }



  const id = s8(),startId = s8();
  const fromAnchor = pen.calculative.worldAnchors[2];
  const line = {
    width: 100,
    height: 300,
    name: 'line',
    lineName: 'dline',
    anchorBaks: [],
    direction: 'vertical',
    type: 1,
    x:fromAnchor.x,
    y:fromAnchor.y,
    lineStep: 24,
    lineDash: [10, 10],
    lineWidth: 1,
    id,
    anchors: [
      {
        x: 0,
        y: 0,
        id: startId,
        penId: id,
      },
      {
        x: 0,
        y: 1,
        id: s8(),
        penId: id,
      },
    ],
  };
  pen.calculative.canvas.addPens([line]);
  line.partnerIds = [pen.id];
  line.calculative.worldAnchors[0].connectTo = pen.id;
  line.calculative.worldAnchors[0].anchorId = "2";
  pen.partnerIds = [id];
  const obj = {
    anchor:"2",
    lineAnchor:startId,
    lineId:id,
  }
  pen.connectedLines.push(obj);

  // const id = s8();
  // const p = {
  //   name: "dline",
  //   x: pen.x + pen.width/2 - 10,
  //   y: pen.y+pen.height,
  //   width: 20,
  //   height: 300,
  //   disableDelete: true,
  //   id,
  // };
  // pen.calculative.canvas.makePen(p);
  // pen.followers.push(p.id);
}

function onResize(pen: Pen) {
  // console.log('onResize', pen.headHRatio);
  const stepRatio = round(dashAnchorStep / pen.calculative.worldRect.height, 3);
  const hRatio = pen.headHRatio;
  const halfY = round(hRatio / 2, 3);
  let startY = round(hRatio + stepRatio, 3), startX = 0.5;
  for (let i = 0; i < pen.anchors.length; i++) {
    const an = pen.anchors[i];
    if(i === 3 || i===7){
      an.y = halfY;
    }
    if(i >=4 && i <= 6){
      an.y = hRatio;
    }
    // 拉伸之后，需要重新计算锚点的比例
    if (an.aType === AnchorType.DYNAMIC) {
      an.y = startY;
      startY = round(startY + stepRatio, 3);
    }
  }
  while (startY <= 1) {
    pen.anchors.push({ x: startX, y: startY, aType: AnchorType.DYNAMIC });
    startY = round(startY + stepRatio, 3);
  }
  // 超过1的锚点删除
  for (let i = 0; i < pen.anchors.length; i++) {
    const an = pen.anchors[i];
    if (an.y > 1) {
      pen.anchors.splice(i, 1);
      i--;
    }
  }
  calcWorldAnchors(pen);
}
export function lifelineAnchors(pen: Pen) {
  const stepRatio = dashAnchorStep / pen.height;
  const hRatio = pen.headHRatio;
  const halfY = round(hRatio / 2, 3);
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
      y: halfY,
    },
    {
      x: 1,
      y: hRatio,
    },
 
    {
      x: 0.5,
      y: hRatio,
    },
    {
      x: 0,
      y: hRatio,
    },
    {
      x: 0,
      y: halfY,
    },
  ] as const;
  // 下方虚线的锚点
  let startY = round(hRatio + stepRatio, 3), startX = 0.5;
  const arr = [];
  while (startY <= 1) {
    arr.push({ x: startX, y: startY, aType: AnchorType.DYNAMIC });
    startY = round(startY + stepRatio, 3);
  }
  points.push(...arr);
  points.push({
    x: 0.5,
    y: 1,
    aType: AnchorType.OUTOFRECT
  })
  pen.anchors = points.map((item, index) => {
    const obj = {
      id: `${index}`,
      penId: pen.id,
      x: item.x,
      y: item.y,
    }
    return Object.assign(obj,item);
  });
}