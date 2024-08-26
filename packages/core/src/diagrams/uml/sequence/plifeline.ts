import { Pen, calcWorldAnchors } from '../../../pen';
import { round } from '../../../utils';
import { Point, AnchorType } from '../../../point'
import { s8 } from '../../../utils'

const dashAnchorStep = 40; //虚线锚点的固定步长

export function plifeline(ctx: CanvasRenderingContext2D, pen: Pen) {
  const { x, y, width, height, ey } = pen.calculative.worldRect;
  if (!pen.onDestroy) {
    // pen.onMouseDown = onMouseDown;
    pen.onAdd = onAdd;
    pen.onResize = onResize;
  }

  const fillStyle = pen.background || "";

  // const r1 = 100;
  // const offset = r1 / 10;
  // const h = 100;
  // const w = r1 / 2;
  // const rx = x + width / 2;
  // const yq = y - h;
  // const xq = rx - w / 2;
  // ctx.arc(
  //   rx,
  //   yq,
  //   offset,
  //   0,
  //   Math.PI * 2
  // );
  // const startY = yq + h / 2 + offset * 2;
  // const y1 = startY - offset * 4;
  // ctx.moveTo(xq, startY);
  // ctx.lineTo(xq, y1);

  // const y2 = y1 - offset / 2;
  // ctx.lineTo(xq + offset / 2, y2);
  // ctx.lineTo(xq + w - offset / 2, y2);
  // ctx.lineTo(xq + w, y1);
  // ctx.lineTo(xq + w, startY);
  // ctx.lineTo(xq + w - offset, startY);
  // ctx.lineTo(xq + w - offset, startY - offset * 2);

  // ctx.lineTo(xq + w - offset, startY);
  // ctx.lineTo(xq + w - offset, yq + h);
  // ctx.lineTo(xq + w / 2, yq + h);
  // ctx.lineTo(xq + w / 2, (yq + h / 2 + offset));
  // ctx.lineTo(xq + w / 2, yq + h);
  // ctx.lineTo(xq + offset, yq + h);
  // ctx.lineTo(xq + offset, startY - offset * 2);
  // ctx.lineTo(xq + offset, startY);
  // ctx.lineTo(xq, startY);
  // fillStyle && ctx.fill();
  // ctx.stroke();
  // ctx.closePath();

  // const headHeight =  height;
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
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + width, y, x + width, y + height, r);
  ctx.arcTo(x + width, y + height, x, y + height, r);
  ctx.arcTo(x, y + height, x, y, r);
  ctx.arcTo(x, y, x + width, y, r);
  fillStyle && ctx.fill();
  ctx.closePath();
  ctx.stroke();


  // pen.headHeight = headHeight;
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

  // 有效区域的大小
}
function onAdd(pen: Pen) {
  // pen.leftH = pen.height - pen.headHeight;
  if (!pen.followers) {
    pen.followers = [];
  }
  if (!pen.connectedLines) {
    pen.connectedLines = [];
  }
  if (!pen.partnerIds) {
    pen.partnerIds = [];
  }


  // 虚线
  const lId = s8(), startId = s8();
  const fromAnchor = pen.calculative.worldAnchors[2];
  const line = {
    width: 100,
    height: 300,
    name: 'line',
    anchorBaks: [],
    lineName: 'dline',
    direction: 'vertical',
    type: 1,
    x: fromAnchor.x,
    y: fromAnchor.y,
    lineStep: 24,
    lineDash: [10, 10],
    lineWidth: 1,
    id: lId,
    anchors: [
      {
        x: 0,
        y: 0,
        id: startId,
        penId: lId,
      },
      {
        x: 0,
        y: 1,
        id: s8(),
        penId: lId,
      },
    ],
  };


  // 参与者
  const pId = s8();
  const participant = {
    width: 60,
    height: 120,
    ratio: true,
    lineWidth: 1,
    id: pId,
    x: pen.x + pen.width / 2 - 30,
    y: pen.y - 120,
    tag: 'umlNode',
    menus: ['participant', 'usecase'],
    background: '#6495ED',
    name: 'participant'
  }
  console.log(pen.partnerIds,'peeee');
  pen.calculative.canvas.addPens([line]);
  line.partnerIds = [pen.id, pId];
  line.calculative.worldAnchors[0].connectTo = pen.id;
  line.calculative.worldAnchors[0].anchorId = "2";
  pen.partnerIds.push(lId);
  const obj = {
    anchor: "2",
    lineAnchor: startId,
    lineId: lId,
  }
  pen.connectedLines.push(obj);

  pen.calculative.canvas.makePen(participant);
  participant.partnerIds = [lId, pen.id];
  pen.partnerIds.push(pId);
}
function onResize(pen: Pen) {
  //找到它的partner
  const partner = pen.calculative.canvas.store.data.pens.find((item) => item.partnerIds.includes(pen.id) && item.name === 'participant');
  partner.x = pen.x + pen.width / 2 - partner.width / 2;
  partner.y = pen.y - partner.height;
  pen.calculative.canvas.updatePenRect(partner);
  // pen.calculative.canvas.ren;
  // const stepRatio = round(dashAnchorStep / pen.calculative.worldRect.height, 3);
  // const hRatio = pen.headHRatio;
  // const halfY = round(hRatio / 2, 3);
  // let startY = round(hRatio + stepRatio, 3), startX = 0.5;
  // for (let i = 0; i < pen.anchors.length; i++) {
  //   const an = pen.anchors[i];
  //   if (i === 3 || i === 7) {
  //     an.y = halfY;
  //   }
  //   if (i >= 4 && i <= 6) {
  //     an.y = hRatio;
  //   }
  //   // 拉伸之后，需要重新计算锚点的比例
  //   if (an.aType === AnchorType.DYNAMIC) {
  //     an.y = startY;
  //     startY = round(startY + stepRatio, 3);
  //   }
  // }
  // while (startY <= 1) {
  //   pen.anchors.push({ x: startX, y: startY, aType: AnchorType.DYNAMIC });
  //   startY = round(startY + stepRatio, 3);
  // }
  // // 超过1的锚点删除
  // for (let i = 0; i < pen.anchors.length; i++) {
  //   const an = pen.anchors[i];
  //   if (an.y > 1) {
  //     pen.anchors.splice(i, 1);
  //     i--;
  //   }
  // }
  // calcWorldAnchors(pen);
}
export function plifelineAnchors(pen: Pen) {
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
    return Object.assign(obj, item);
  });
}