import { Pen } from '../../../pen';
import { Point } from '../../../point';
export function swimlane(ctx: CanvasRenderingContext2D, pen: Pen) {
  if (!pen.onMouseUp) {
    // pen.onResize = resize;
    pen.onScale = onScale;
    // pen.onClick = click;
    pen.onMouseDown = mouseDown;
    // pen.onMouseMove = mouseMove;
    pen.onMouseUp = mouseUp;
    // pen.onMouseLeave = mouseLeave;
    onScale(pen, true);
  }
  const scale = pen.calculative.canvas.store.data.scale || 1;
  let { x, y, width, height } = pen.calculative.worldRect;
  let { fontSize } = pen.calculative;
  ctx.save();
  if (pen.direction === 'horizontal') {
    let { funWidth, stageHeight, headHeight, data } = pen;
    let stagey = y + headHeight,
      funy = stagey + stageHeight;
    ctx.fillStyle = pen.color || '#3d64ac';
    ctx.fillRect(x, y, width, headHeight);
    ctx.fillRect(x, stagey, width, stageHeight);
    ctx.rect(x, y, width, height);
    ctx.moveTo(x, stagey);
    ctx.lineTo(x + width, stagey);
    ctx.moveTo(x, funy);
    ctx.lineTo(x + width, funy);
    ctx.moveTo(x, funy);
    ctx.lineTo(x, y + height);
    drawText(ctx, pen.headText, {
      x: x + 10 * scale,
      y: y + headHeight / 2,
      fontSize,
      color: pen.textColor || '#fff',
    });
    drawText(ctx, pen.stageText, {
      x: x + width,
      y: stagey + stageHeight / 2,
      color: pen.textColor || '#fff',
      measureWidth: true,
      fontSize,
      scale,
    });
    ctx.textAlign = 'center';
    data?.forEach((item: any, index: number) => {
      let { height: itemHeight, text } = item;
      ctx.fillStyle = pen.color || '#3d64ac';
      ctx.fillRect(x, funy, funWidth, itemHeight); //渲染阶段
      if (index < data.length - 1) {
        ctx.moveTo(x, funy + itemHeight);
        ctx.lineTo(x + width, funy + itemHeight);
      }
      if (pen.calculative.activeFunIndex === index) {
        ctx.save();
        ctx.strokeStyle = 'red';
        ctx.lineWidth = 2;
        ctx.strokeRect(x, funy, width, itemHeight);
        ctx.restore();
      }
      funy += itemHeight;
    });
  } else {
    let { funHeight, stageWidth, headHeight, data } = pen;
    let funx = x + stageWidth,
      funy = y + headHeight;
    ctx.fillStyle = pen.color || '#3d64ac';
    ctx.fillRect(x, y, width, headHeight); //渲染头部
    ctx.fillRect(x, funy, stageWidth, height - headHeight); //渲染阶段
    ctx.rect(x, y, width, height); //渲染边框
    ctx.moveTo(x, funy);
    ctx.lineTo(x + width, funy); //渲染头部和阶段的分割线
    ctx.moveTo(funx, funy);
    ctx.lineTo(funx, y + height); // 渲染阶段和功能区的分割线
    ctx.moveTo(funx, funy + funHeight);
    ctx.lineTo(x + width, funy + funHeight); // 渲染功能区的分割线
    drawText(ctx, pen.headText, {
      x: x + 10 * scale,
      y: y + headHeight / 2,
      fontSize,
      color: pen.textColor || '#fff',
    });
    drawText(ctx, pen.stageText, {
      x: x + stageWidth / 2,
      y: y + height,
      fontSize,
      color: 'red',
      // roate:true,
      measureHeight: true,
      scale,
    });
    data?.forEach((item: any, index: number) => {
      let { width: itemWidth, text } = item;
      ctx.fillStyle = pen.color || '#3d64ac';
      ctx.fillRect(funx, funy, itemWidth, funHeight); //渲染功能区头部
      drawText(ctx, text, {
        x: funx + itemWidth / 2,
        y: funy + funHeight / 2,
        fontSize,
        color: pen.textColor || '#fff',
        textAlign: 'center',
      });
      if (index < data.length - 1) {
        ctx.moveTo(funx + itemWidth, funy);
        ctx.lineTo(funx + itemWidth, funy + height - headHeight);
      }
      if (pen.calculative.activeFunIndex === index) {
        ctx.save();
        ctx.strokeStyle = 'red';
        ctx.lineWidth = 2;
        ctx.strokeRect(funx, funy, itemWidth, height - headHeight);
        ctx.restore();
      }
      funx += itemWidth;
    });
    
  }
  ctx.strokeStyle = pen.borderColor || '#31528f';
  ctx.stroke();
  ctx.restore();
}
function drawText(ctx: CanvasRenderingContext2D, text: string, options: any) {
  let {
    x,
    y,
    fontSize,
    textAlign,
    textBaseline,
    color,
    width,
    roate,
    measureWidth,
    measureHeight,
    scale,
  } = options;
  ctx.save();
  ctx.font = `${fontSize}px Arial`;
  if (measureWidth) {
    x = x - ctx.measureText(text).width - 10 * scale;
  } else if (measureHeight) {
    y = y - ctx.measureText(text).width - 10 * scale;
  }
  if (roate) {
    ctx.translate(100, 100);
    ctx.rotate(Math.PI / 2);
  }
  if (textAlign) {
    ctx.textAlign = textAlign;
  }
  if (textBaseline) {
    ctx.textBaseline = textBaseline;
  }
  ctx.fillStyle = color;

  ctx.fillText(text, x, y, width);
  ctx.restore();
}
function click(pen: Pen, e: Point) {
  if (pen.calculative.resizeBox != 'none') return;
  const { x, y } = pen.calculative.worldRect;
  const data = pen.data;
  const { stageWidth, funHeight, headHeight } = pen;
  pen.calculative.activeFunIndex = -1;
  if (pen.direction === 'horizontal') {
    const {headHeight, stageHeight, funWidth} = pen;
    let startY = y + headHeight + stageHeight;
    for (let i = 0; i < data.length; i++) {
      if (e.x > x && e.x < x + funWidth && e.y > startY &&  e.y < startY + data[i].height) {
        pen.calculative.activeFunIndex = i;
        return;
      }
      startY += data[i].height;
    }
  } else {
    let startX = x + stageWidth,
      endY = y + headHeight + funHeight,
      startY = y + headHeight;
    for (let i = 0; i < data.length; i++) {
      if (
        e.x > startX &&
        e.x < startX + data[i].width &&
        e.y < endY &&
        e.y > startY
      ) {
        pen.calculative.activeFunIndex = i;
        return;
      }
      startX += data[i].width;
    }
  }
}
function onScale(pen: Pen, isInit: boolean = false) {
  const scale = pen.calculative.canvas.store.data.scale || 1;
  const preScale = pen.calculative.scale || scale;
  const s = isInit ? scale : scale / preScale;
  if (pen.direction === 'horizontal') {
    // 横向
    pen.stageHeight *= s;
    pen.funWidth *= s;
    pen.headHeight *= s;
    pen.data.forEach((item: any) => {
      item.height *= s;
    });
  } else {
    // 纵向
    pen.stageWidth *= s;
    pen.funHeight *= s;
    pen.headHeight *= s;
    pen.data.forEach((item: any) => {
      item.width *= s;
    });
  }
  pen.calculative.scale = scale;
}
function mouseDown(pen: Pen, e: Point) {
  click(pen, e);
}
function mouseMove(pen: Pen, e: Point) {
  if (!pen.calculative.canvas.mouseDown) {
    // pointInResizeLine(pen, e);
  }
  // if (
  //   this.mouseDown &&
  //   pen.calculative.activeFunIndex >= 0 &&
  //   pen.calculative.resizeBox == 'none'
  // ) {
  //   pen.calculative.drag = true;
  // } else if (this.store.hover?.calculative.resizeBox != 'none') {
  //   const { resizeBox, resizeIndex } = pen.calculative;
  //   const p1 = { x: this.mouseDown.x, y: this.mouseDown.y };
  //   const p2 = { x: e.x, y: e.y };
  //   const scale = this.store.data.scale;
  //   if (resizeIndex >= 0) {
  //     let x = p2.x - p1.x;
  //     let offsetX = x - this.lastOffsetX;
  //     const item = pen.calculative.data[resizeIndex];
  //     const targetWidth = item.width + offsetX;
  //     if (targetWidth >= 0) {
  //       pen.width += offsetX;
  //       pen.data[resizeIndex].width += offsetX;
  //       item.width = targetWidth;
  //       this.lastOffsetX = x;
  //     } else {
  //       pen.width -= item.width;
  //       pen.calculative.worldRect.width -= item.width;
  //       offsetX = -item.width;
  //       item.width = 0;
  //     }
  //     resizeRect(this.activeRect, offsetX, 0, 5);
  //     this.updatePenRect(pen);
  //     this.getSizeCPs();
  //   } else {
  //     let { funHeight, titleHeight } = pen.calculative;
  //     const { height } = pen.calculative.worldRect;
  //     let y = p2.y - p1.y;
  //     let offsetY = y - this.lastOffsetY;
  //     if (resizeBox == 'complete') {
  //       const targetHeight = height + offsetY;
  //       if (targetHeight > funHeight + titleHeight) {
  //         pen.height = pen.calculative.worldRect.height = targetHeight;
  //         this.lastOffsetY = y;
  //       } else {
  //         offsetY = funHeight + titleHeight - pen.calculative.worldRect.height;
  //         pen.height = pen.calculative.worldRect.height =
  //           funHeight + titleHeight;
  //       }
  //       resizeRect(this.activeRect, 0, offsetY, 6);
  //       this.updatePenRect(pen);
  //       this.getSizeCPs();
  //     } else {
  //       const targetFunHeight = funHeight + offsetY;
  //       if (
  //         targetFunHeight >= pen.calculative.fontSize + 20 * scale &&
  //         targetFunHeight <= height - titleHeight - 100 * scale
  //       ) {
  //         this.lastOffsetY = y;
  //         pen.funHeight += offsetY;
  //         pen.calculative.funHeight = targetFunHeight;
  //       }
  //     }
  //   }
  //   this.render();
  // }
}
function mouseUp(pen: Pen) {
  pen.data.forEach((item, index) => {
    if (item.width === 0) {
      pen.data.splice(index, 1);
    }
  });
  if (pen.calculative.resizeBox !== 'none') {
    pen.calculative.resizeBox = 'none';
    pen.calculative.resizeIndex = -1;
  }
}
function mouseLeave(pen: Pen, e: Point) {
  console.log(
    'mouseLeave',
    e,
    pen.calculative.mouseDown,
    pen.calculative.activeFunIndex >= 0
  );
  // if()
  // if(pen.calculative.mouseDown && pen.calculative.activeFunIndex >= 0) {
  //   const newpen = {
  //     x: e.x,
  //     y: e.y,
  //     name: 'swimlaneV',
  //     text: '',
  //     width: pen.stageWidth + pen.calculative.data[pen.calculative.activeFunIndex].width,
  //     height: pen.height,
  //     data: [pen.data[pen.calculative.activeFunIndex]],
  //     textColor: '#fff',
  //     hoverTextColor: '#fff',
  //     activeTextColor: '#fff',
  //     borderColor: '#31528f',
  //     titleHeight:50,
  //     stageWidth:30,
  //     funHeight:50,
  //     head: '功能',
  //     stage: '阶段',
  //     disableRotate: true,
  //     disableSize: true,
  //     resizeChild: true,
  //     disableAnchor: true,
  //     disableInput: true,
  //   };
  //   console.log('pen',newpen);

  //   pen.calculative.canvas.parent.addPen(newpen);
  // }
}
