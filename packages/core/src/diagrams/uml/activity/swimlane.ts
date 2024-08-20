import { Pen, calcWorldRects } from '../../../pen';
import { Point } from '../../../point';
import { resizeRect } from '../../../rect';
import { deepClone, s8 } from '../../../utils';
export function swimlane(ctx: CanvasRenderingContext2D, pen: Pen) {
  if (!pen.onMouseUp) {
    // pen.onResize = resize;
    pen.onScale = onScale;
    // pen.onClick = click;
    pen.onMouseDown = mouseDown;
    pen.onMouseMove = mouseMove;
    pen.onMouseUp = mouseUp;
    // pen.onMouseLeave = mouseLeave;
    // pen.onMouseEnter = mouseEnter;
    // pen.onAdd = onAdd;
    onScale(pen, true);
  }
  const scale = pen.calculative.canvas.store.data.scale || 1;
  let { x, y, width, height } = pen.calculative.worldRect;
  let { fontSize } = pen.calculative;
  let { funTitleLen, stageLen, headHeight, data } = pen;
  ctx.save();
  ctx.fillStyle = pen.color || '#3d64ac';
  if (pen.direction === 'horizontal') {
    let stagey = y + headHeight,
      funy = stagey + stageLen;
    ctx.fillRect(x, y, width, headHeight);
    ctx.fillRect(x, stagey, width, stageLen);
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
      y: stagey + stageLen / 2,
      color: pen.textColor || '#fff',
      measureWidth: true,
      fontSize,
      scale,
    });
    ctx.textAlign = 'center';
    data?.forEach((item: any, index: number) => {
      let { len: itemHeight, text } = item;
      ctx.fillStyle = pen.color || '#3d64ac';
      ctx.fillRect(x, funy, funTitleLen, itemHeight);
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
    let funx = x + stageLen,
      funy = y + headHeight;
    ctx.fillRect(x, y, width, headHeight); //渲染头部
    ctx.fillRect(x, funy, stageLen, height - headHeight); //渲染阶段
    ctx.rect(x, y, width, height); //渲染边框
    ctx.moveTo(x, funy);
    ctx.lineTo(x + width, funy); //渲染头部和阶段的分割线
    ctx.moveTo(funx, funy);
    ctx.lineTo(funx, y + height); // 渲染阶段和功能区的分割线
    ctx.moveTo(funx, funy + funTitleLen);
    ctx.lineTo(x + width, funy + funTitleLen); // 渲染功能区的分割线
    drawText(ctx, pen.headText, {
      x: x + 10 * scale,
      y: y + headHeight / 2,
      fontSize,
      color: pen.textColor || '#fff',
    });
    drawText(ctx, pen.stageText, {
      x: x + stageLen / 2,
      y: y + height,
      fontSize,
      color: 'red',
      // roate:true,
      measureHeight: true,
      scale,
    });
    data?.forEach((item: any, index: number) => {
      let { len: itemWidth, text } = item;
      ctx.fillStyle = pen.color || '#3d64ac';
      ctx.fillRect(funx, funy, itemWidth, funTitleLen); //渲染功能区头部
      drawText(ctx, text, {
        x: funx + itemWidth / 2,
        y: funy + funTitleLen / 2,
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
function onScale(pen: Pen, isInit: boolean = false) {
  const scale = pen.calculative.canvas.store.data.scale || 1;
  const preScale = pen.calculative.scale || scale;
  const s = isInit ? scale : scale / preScale;
  pen.funTitleLen *= s;
  pen.stageLen *= s;
  pen.headHeight *= s;
  pen.data.forEach((item: any) => {
    item.len *= s;
  });
  pen.calculative.scale = scale;
}
function mouseDown(pen: Pen, e: Point) {
  if (pen.calculative.resizeBox != 'none') {
    pen.calculative.lastY = e.y;
    pen.calculative.lastX = e.x;
    pen.dropAnchor = true;
    return;
  }
  const { x, y } = pen.calculative.worldRect;
  const data = pen.data;
  const { stageLen, funTitleLen, headHeight } = pen;
  pen.calculative.activeFunIndex = -1;
  if (pen.direction === 'horizontal') {
    let startY = y + headHeight + stageLen;
    for (let i = 0; i < data.length; i++) {
      if (
        e.x > x &&
        e.x < x + funTitleLen &&
        e.y > startY &&
        e.y < startY + data[i].len
      ) {
        pen.calculative.activeFunIndex = i;
        pen.dropAnchor = true;
        return;
      }
      startY += data[i].len;
    }
  } else {
    let startX = x + stageLen,
      endY = y + headHeight + funTitleLen,
      startY = y + headHeight;
    for (let i = 0; i < data.length; i++) {
      if (
        e.x > startX &&
        e.x < startX + data[i].len &&
        e.y < endY &&
        e.y > startY
      ) {
        pen.calculative.activeFunIndex = i;
        pen.dropAnchor = true;
        return;
      }
      startX += data[i].len;
    }
  }
}
function mouseMove(pen: Pen, e: Point) {
  if (!pen.calculative.canvas.mouseDown) {
    pointAroundResizeLine(pen, e);
  } else if (pen.dropAnchor) {
    const { resizeBox, resizeIndex, fontSize, lastX, lastY } = pen.calculative;
    const { stageLen, funTitleLen, headHeight } = pen;
    const { activeRect } = pen.calculative.canvas;
    let offset = 0;
    let needCalculateRect = 'none';
    if (pen.direction == 'vertical') {
      const { height } = pen.calculative.worldRect;
      if (resizeBox == 'none') {
        pen.calculative.dragChild = true;
        // let x = p2.x - p1.x;
        // let offsetX = x - pen.calculative.lastOffsetX;
        // let y = p2.y - p1.y;
        // let offsetY = y - pen.calculative.lastOffsetY;
        // pen.calculative.lastOffsetY = y;
        // pen.calculative.lastOffsetX = x;
        // if(!this.dragChild) {
        //   this.dragChild = await this.addPen({
        //     name:'rectangle',
        //     x: pen.calculative.worldRect.x + pen.StageLen,
        //     y: pen.calculative.worldRect.y + pen.headHeight,
        //     width: pen.data[pen.calculative.activeFunIndex].width,
        //     height: pen.height - pen.headHeight,
        //   });
        // } else {
        //   this.translatePens(this.dragChild, offsetX, offsetY, true);
        // }
        // translateRect(activeRect, x, y);
      } else {
        if (resizeBox == 'stage') {
          offset = e.x - lastX;
          const targetStageLen = stageLen + offset;
          const scale = pen.calculative.scale || 1;
          const minStageLen = fontSize + 20 * scale;
          if (targetStageLen > minStageLen) {
            pen.width += offset;
            pen.stageLen = targetStageLen;
            pen.calculative.lastX = e.x;
            needCalculateRect = 'width';
          } else if (pen.stageLen > minStageLen) {
            pen.width -= pen.stageLen - minStageLen;
            offset = -pen.stageLen + minStageLen;
            pen.stageLen = minStageLen;
            needCalculateRect = 'width';
          }
        } else if (resizeIndex >= 0) {
          offset = e.x - lastX;
          const item = pen.data[resizeIndex];
          const targetWidth = item.len + offset;
          if (targetWidth >= 0) {
            pen.width += offset;
            item.len = targetWidth;
            pen.calculative.lastX = e.x;
            needCalculateRect = 'width';
          } else {
            pen.width -= item.len;
            offset = -item.len;
            item.len = 0;
            needCalculateRect = 'width';
          }
        } else {
          offset = e.y - lastY;
          if (resizeBox == 'complete') {
            const targetHeight = height + offset;
            if (targetHeight > funTitleLen + headHeight) {
              pen.height = targetHeight;
              pen.calculative.lastY = e.y;
              needCalculateRect = 'height';
            } else {
              offset = funTitleLen + headHeight - height;
              pen.height = funTitleLen + headHeight;
              needCalculateRect = 'height';
            }
          } else {
            const scale = pen.calculative.scale || 1;
            const targetFunTitleLen = funTitleLen + offset;
            if (
              targetFunTitleLen >= fontSize + 20 * scale &&
              targetFunTitleLen <= height - headHeight - 100 * scale
            ) {
              pen.calculative.lastY = e.y;
              pen.funTitleLen = targetFunTitleLen;
            }
          }
        }
      }
    } else {
      if (resizeBox == 'none') {
        pen.calculative.dragChild = true;
        // const p1 = { x: this.mouseDown.x, y: this.mouseDown.y };
        // const p2 = { x: e.x, y: e.y };
        // let x = p2.x - p1.x;
        // let offsetX = x - pen.calculative.lastOffsetX;
        // let y = p2.y - p1.y;
        // let offsetY = y - pen.calculative.lastOffsetY;
        // pen.calculative.lastOffsetY = y;
        // pen.calculative.lastOffsetX = x;
        // if(!this.dragChild) {
        //   this.dragChild = await this.addPen({
        //     name:'rectangle',
        //     x: pen.calculative.worldRect.x + pen.StageLen,
        //     y: pen.calculative.worldRect.y + pen.headHeight,
        //     width: pen.data[pen.calculative.activeFunIndex].width,
        //     height: pen.height - pen.headHeight,
        //   });
        // } else {
        //   this.translatePens(this.dragChild, offsetX, offsetY, true);
        // }
        // translateRect(activeRect, x, y);
      } else {
        if (resizeBox == 'stage') {
          offset = e.y - lastY;
          const targetStageHeight = stageLen + offset;
          const scale = pen.calculative.scale;
          const minStageHeight = fontSize + 20 * scale;
          if (targetStageHeight > minStageHeight) {
            pen.height += offset;
            pen.stageLen = targetStageHeight;
            pen.calculative.lastY = e.y;
            needCalculateRect = 'height';
          } else if (stageLen > minStageHeight) {
            pen.height -= stageLen - minStageHeight;
            offset = -stageLen + minStageHeight;
            pen.stageLen = minStageHeight;
            needCalculateRect = 'height';
          }
        } else if (resizeIndex >= 0) {
          offset = e.y - lastY;
          const item = pen.data[resizeIndex];
          const targetHeight = item.len + offset;
          if (targetHeight >= 0) {
            pen.height += offset;
            item.len = targetHeight;
            pen.calculative.lastY = e.y;
            needCalculateRect = 'height';
          } else {
            pen.height -= item.len;
            offset = -item.len;
            item.len = 0;
            needCalculateRect = 'height';
          }
        } else {
          const { width } = pen.calculative.worldRect;
          offset = e.x - lastX;
          if (resizeBox == 'complete') {
            const targetWidth = width + offset;
            if (targetWidth > funTitleLen) {
              pen.width = targetWidth;
              pen.calculative.lastX = e.x;
              needCalculateRect = 'width';
            } else {
              offset = funTitleLen - width;
              pen.width = funTitleLen;
              needCalculateRect = 'width';
            }
          } else {
            let { fontSize } = pen.calculative;
            const targetFunHeight = funTitleLen + offset;
            const scale = pen.calculative.scale;
            if (
              targetFunHeight >= fontSize + 20 * scale &&
              targetFunHeight <= width - 100 * scale
            ) {
              pen.calculative.lastX = e.x;
              pen.funTitleLen += offset;
            }
          }
        }
      }
    }
    if (needCalculateRect != 'none') {
      needCalculateRect === 'width'
        ? resizeRect(activeRect, offset, 0, 5)
        : resizeRect(activeRect, 0, offset, 6);
      calcWorldRects(pen);
    }
    pen.calculative.canvas.render();
  }
}
function mouseUp(pen: Pen, e: Point) {
  if (!pen.calculative.dragChild) return;
  const {
    store: { hoverContainer },
    activeRect,
  } = pen.calculative.canvas;
  // this.delete(this.dragChild);
  const { x, y, ex, ey } = pen.calculative.worldRect;
  if (
    //拖拽到另一个泳道合并
    e.x < x ||
    e.x > ex ||
    e.y < y ||
    e.y > ey
  ) {
    if (hoverContainer && hoverContainer.resizeChild) {
      const { activeFunIndex } = pen.calculative;
      const activeFun = pen.data[activeFunIndex];
      let oldKey = 'height',
        newKey = 'width',
        start =
          hoverContainer.calculative.worldRect.x + hoverContainer.stageLen,
        eKey = 'x';
      if (hoverContainer.direction == 'horizontal') {
        oldKey = 'width';
        newKey = 'height';
        start =
          hoverContainer.calculative.worldRect.y +
          hoverContainer.stageLen +
          hoverContainer.headHeight;
        eKey = 'y';
        resizeRect(activeRect, -activeFun.len, 0, 5);
      } else {
        resizeRect(activeRect, 0, -activeFun.len, 6);
      }
      for (let i = 0; i < hoverContainer.data.length; i++) {
        const item = hoverContainer.data[i];
        if (e[eKey] > start && e[eKey] < start + item.len) {
          hoverContainer[newKey] += activeFun.len;
          hoverContainer.data.splice(i, 0, activeFun);
          if (pen.data.length === 1) {
            pen.calculative.canvas.parent.delete([pen]);
          } else {
            pen.data.splice(activeFunIndex, 1);
            if (pen.direction == hoverContainer.direction) {
              pen[newKey] -= activeFun.len;
            } else {
              pen[oldKey] -= activeFun.len;
            }
            calcWorldRects(pen);
            pen.calculative.activeFunIndex = -1;
          }
          calcWorldRects(hoverContainer);
          break;
        }
        start += item.len;
      }
    } else if (pen.data.length === 1) {
      //当只有一个子泳道且拖拽完毕没有拖到其他泳道
      const { mouseDown } = pen.calculative.canvas;
      pen.calculative.canvas.translatePens(
        [pen],
        e.x - mouseDown.x,
        e.y - mouseDown.y
      );
    } else {
      //当有多个子泳道且拖拽完毕没有拖到其他泳道
      const { activeFunIndex } = pen.calculative;
      const newSwimlane = deepClone(pen);
      const activeFun = pen.data[activeFunIndex];
      newSwimlane.id = s8();
      newSwimlane.x = e.x;
      newSwimlane.y = e.y;
      newSwimlane.data = [activeFun];
      // this.addCaches = [newSwimlane];
      if (pen.direction == 'vertical') {
        newSwimlane.width = newSwimlane.stageLen + activeFun.len;
        pen.width -= activeFun.len;
      } else {
        pen.height -= activeFun.len;
        newSwimlane.height =
          newSwimlane.headHeight + newSwimlane.stageLen + activeFun.len;
      }
      pen.data.splice(activeFunIndex, 1);
      pen.calculative.activeFunIndex = -1;
      pen.calculative.canvas.parent.addPen(newSwimlane);
      calcWorldRects(pen);
    }
  } else {
    // 拖拽移动子泳道顺序
    const { activeFunIndex, worldRect } = pen.calculative;
    const { stageLen, headHeight } = pen;
    let key = 'width',
      eKey = 'x',
      start = worldRect.x + stageLen;
    if (pen.direction == 'horizontal') {
      key = 'height';
      eKey = 'y';
      start = worldRect.y + headHeight + stageLen;
    }
    for (let i = 0; i < pen.data.length; i++) {
      const item = pen.data[i];
      if (
        e[eKey] > start &&
        e[eKey] < start + item.len &&
        i != activeFunIndex
      ) {
        let temp = pen.data[i];
        pen.data[i] = pen.data[activeFunIndex];
        pen.data[activeFunIndex] = temp;
        pen.calculative.activeFunIndex = i;
        break;
      }
      start += item.len;
    }
  }

  // if (pen.calculative.dragChild) {
  //   this.delete([this.dragChild]);
  //   this.dragChild = undefined;
  // }
  pen.data.forEach((item, index) => {
    if (item.len === 0) {
      pen.data.splice(index, 1);
    }
  });
  pen.dropAnchor = false;
  pen.calculative.dragChild = false;
}
function mouseLeave(pen: Pen, e: Point) {
  pen.calculative.leave = true;
  // if()
  // if(pen.calculative.mouseDown && pen.calculative.activeFunIndex >= 0) {
  //   const newpen = {
  //     x: e.x,
  //     y: e.y,
  //     name: 'swimlaneV',
  //     text: '',
  //     width: pen.stageLen + pen.calculative.data[pen.calculative.activeFunIndex].width,
  //     height: pen.height,
  //     data: [pen.data[pen.calculative.activeFunIndex]],
  //     textColor: '#fff',
  //     hoverTextColor: '#fff',
  //     activeTextColor: '#fff',
  //     borderColor: '#31528f',
  //     titleHeight:50,
  //     stageLen:30,
  //     funTitleLen:50,
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
function mouseEnter(pen: Pen, e: Point) {
  pen.calculative.leave = false;
  console.log('enter');
}
function onAdd(pen: Pen) {
  // pen.calculative.activeFunIndex = -1;
  // pen.calculative.resizeBox = 'none';
  // pen.calculative.resizeIndex = -1;
  // pen.calculative.lastOffsetX = 0;
  // pen.calculative.lastOffsetY = 0;
}
function pointAroundResizeLine(pen: Pen, pt: Point) {
  pen.calculative.resizeIndex = -1;
  pen.calculative.resizeBox = 'none';
  const minDistance = 10;
  const { x, y, ey, ex } = pen.calculative.worldRect;
  let completeDistance = 0,
    funDistance = 0,
    stageDistance = 0,
    start = 0;
  let { funTitleLen, stageLen, headHeight } = pen;
  if (pen.direction == 'horizontal') {
    completeDistance = Math.abs(pt.x - ex);
    funDistance = Math.abs(pt.x - x - funTitleLen);
    stageDistance = Math.abs(pt.y - y - headHeight - stageLen);
    start = pt.y - y - headHeight - stageLen;
  } else {
    completeDistance = Math.abs(pt.y - ey);
    funDistance = Math.abs(pt.y - y - headHeight - funTitleLen);
    stageDistance = Math.abs(pt.x - x - stageLen);
    start = pt.x - x - stageLen;
  }
  if (completeDistance < minDistance) {
    pen.calculative.resizeBox = 'complete';
    return true;
  }
  if (funDistance < minDistance) {
    // 只允许鼠标在功能区头部上方10像素范围内拖拽调整大小，避免和选中功能区冲突
    pen.calculative.resizeBox = 'fun';
    return true;
  }
  if (stageDistance < minDistance) {
    pen.calculative.resizeBox = 'stage';
    return true;
  }
  for (let i = 0; i < pen.data.length; i++) {
    const l = pen.data[i].len;
    if (pt.y > y + pen.headHeight && Math.abs(start - l) < minDistance) {
      pen.calculative.resizeIndex = i;
      pen.calculative.resizeBox = 'fun';
      return true;
    }
    start -= l;
  }
  return false;
}
