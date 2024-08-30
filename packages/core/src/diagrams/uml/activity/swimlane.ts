import { Pen, calcWorldRects, getWords, wrapLines,getAllFollowers } from '../../../pen';
import { Point } from '../../../point';
import { resizeRect, Rect, rectInRect } from '../../../rect';
import { deepClone, s8 } from '../../../utils';
import { getFont } from '../../../pen';
let textPadding = 5;
export function swimlane(ctx: CanvasRenderingContext2D, pen: Pen) {
  if (!pen.onMouseUp) {
    // pen.onResize = resize;
    pen.onScale = onScale;
    // pen.onClick = click;
    pen.onMouseDown = mouseDown;
    pen.onMouseMove = mouseMove;
    pen.onMouseUp = mouseUp;
    pen.onShowInput = showInput;
    pen.onInputDone = onInputDone;
    pen.onMouseLeave = mouseLeave;
    // pen.onMouseEnter = mouseEnter;
    // pen.onAdd = onAdd;
    onScale(pen, true);
  }
  if (!pen.calculative.headTextLines) {
    pen.calculative.headTextLines = calcTextLines(pen.headText, pen);
    pen.calculative.stageTextLines = calcTextLines(pen.stageText, pen);
    pen.calculative.dataTextLines = pen.data.map((item: any) =>
      calcTextLines(item.text, pen)
    );
  }
  // const scale = pen.calculative.canvas.store.data.scale || 1;
  let { x, y, width, height } = pen.calculative.worldRect;
  let { fontSize, lineHeight, fontStyle, fontWeight, fontFamily } =
    pen.calculative;
  let { funTitleLen, stageLen, headHeight, data } = pen;
  const realLineHeight = lineHeight * fontSize;
  const textColor = pen.textColor || '#fff';
  // textPadding *= scale;
  ctx.save();
  ctx.font = getFont({
    fontStyle,
    fontWeight,
    fontFamily: fontFamily || pen.calculative.canvas.store.options.fontFamily,
    fontSize,
    lineHeight,
  });
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
    drawText(ctx, pen.calculative.stageTextLines, {
      x: x + width - textPadding,
      y: stagey,
      color: pen.textColor || '#fff',
      textAlign: 'right',
      totalLen: stageLen,
      realLineHeight,
    });
    data?.forEach((item: any, index: number) => {
      let { len: itemWidth } = item;
      ctx.fillStyle = pen.color || '#3d64ac';
      ctx.fillRect(x, funy, funTitleLen, itemWidth);
      if (index < data.length - 1) {
        ctx.moveTo(x, funy + itemWidth);
        ctx.lineTo(x + width, funy + itemWidth);
      }
      drawText(ctx, pen.calculative.dataTextLines[index], {
        x,
        y: funy + itemWidth / 2,
        color: textColor,
        roate: true,
        totalLen: funTitleLen,
        realLineHeight,
        textAlign: 'center',
      });
      if (pen.calculative.activeFunIndex === index) {
        ctx.save();
        ctx.strokeStyle = 'red';
        ctx.lineWidth = 2;
        ctx.strokeRect(x, funy, width, itemWidth);
        ctx.restore();
      }
      funy += itemWidth;
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
    drawText(ctx, pen.calculative.stageTextLines, {
      x,
      y: y + height - textPadding,
      color: textColor,
      roate: true,
      totalLen: stageLen,
      realLineHeight,
    });
    data?.forEach((item: any, index: number) => {
      let { len: itemHeight } = item;
      ctx.fillStyle = pen.color || '#3d64ac';
      ctx.fillRect(funx, funy, itemHeight, funTitleLen); //渲染功能区头部
      drawText(ctx, pen.calculative.dataTextLines[index], {
        x: funx + itemHeight / 2,
        y: funy,
        color: textColor,
        textAlign: 'center',
        totalLen: funTitleLen,
        realLineHeight,
      });
      if (index < data.length - 1) {
        ctx.moveTo(funx + itemHeight, funy);
        ctx.lineTo(funx + itemHeight, funy + height - headHeight);
      }
      if (pen.calculative.activeFunIndex === index) {
        ctx.save();
        ctx.strokeStyle = 'red';
        ctx.lineWidth = 2;
        ctx.strokeRect(funx, funy, itemHeight, height - headHeight);
        ctx.restore();
      }
      funx += itemHeight;
    });
  }
  drawText(ctx, pen.calculative.headTextLines, {
    x: x + textPadding,
    y,
    color: textColor,
    totalLen: headHeight,
    realLineHeight,
    textAlign: 'left',
  });
  ctx.strokeStyle = pen.borderColor || '#31528f';
  ctx.stroke();
  ctx.restore();
}
function drawText(
  ctx: CanvasRenderingContext2D,
  lines: string[],
  options: any
) {
  let {
    x,
    y,
    textAlign,
    textBaseline,
    color,
    roate,
    realLineHeight,
    totalLen,
  } = options;
  let offset = (totalLen - realLineHeight * (lines.length - 1)) / 2;
  ctx.save();
  if (textAlign) {
    ctx.textAlign = textAlign;
  }
  if (textBaseline) {
    ctx.textBaseline = textBaseline;
  }
  ctx.fillStyle = color;
  if (roate) {
    ctx.rotate(-Math.PI / 2);
    [x, y] = [-y, x];
  }
  y += offset;
  lines.forEach((lineText) => {
    ctx.fillText(lineText, x, y);
    y += realLineHeight;
  });
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
          const minStageLen = fontSize + 10;
          if (targetStageLen > minStageLen) {
            pen.width += offset;
            pen.stageLen = targetStageLen;
            pen.calculative.lastX = e.x;
            needCalculateRect = 'width';
            let followers = getAllFollowers(pen, pen.calculative.canvas.store);
            pen.calculative.canvas.translatePens(followers,  offset, 0, false, true);
          } else if (pen.stageLen > minStageLen) {
            pen.width -= pen.stageLen - minStageLen;
            offset = -pen.stageLen + minStageLen;
            pen.stageLen = minStageLen;
            needCalculateRect = 'width';
            let followers = getAllFollowers(pen, pen.calculative.canvas.store);
            pen.calculative.canvas.translatePens(followers,  offset, 0, false, true);
          }
          
        } else if (resizeIndex >= 0) {
          offset = e.x - lastX;
          const item = pen.data[resizeIndex];
          const targetWidth = item.len + offset;
          const {x, y, ex, ey} = pen.calculative.worldRect;
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
          let startX = pen.calculative.worldRect.x + pen.stageLen;
          for(let i = 0; i <= resizeIndex; i++) {
            startX += pen.data[i].len;
          }
          moveFollowers(pen, {x:startX, y:y + headHeight, ex, ey}, offset, 0);
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
              targetFunTitleLen >= fontSize + 10 &&
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
          const minStageHeight = fontSize + 20;
          if (targetStageHeight > minStageHeight) {
            pen.height += offset;
            pen.stageLen = targetStageHeight;
            pen.calculative.lastY = e.y;
            needCalculateRect = 'height';
            let followers = getAllFollowers(pen, pen.calculative.canvas.store);
            pen.calculative.canvas.translatePens(followers, 0, offset,false, true);
          } else if (stageLen > minStageHeight) {
            pen.height -= stageLen - minStageHeight;
            offset = -stageLen + minStageHeight;
            pen.stageLen = minStageHeight;
            needCalculateRect = 'height';
            let followers = getAllFollowers(pen, pen.calculative.canvas.store);
            pen.calculative.canvas.translatePens(followers, 0, offset,false, true);
          }
          // moveFollowers(pen, pen.calculative.worldRect, 0, offset);
          this.activeRect = null;
        } else if (resizeIndex >= 0) { // 移动子泳道的高度
          offset = e.y - lastY;
          const item = pen.data[resizeIndex];
          const targetHeight = item.len + offset;
          const {x, y, ex, ey} = pen.calculative.worldRect;
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
          let startY = pen.calculative.worldRect.y + pen.headHeight + pen.stageLen;
          for(let i = 0; i <= resizeIndex; i++) {
            startY += pen.data[i].len;
          }
          moveFollowers(pen, {x, y:startY, ex, ey}, 0, offset);
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
              targetFunHeight >= fontSize + 20 &&
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
      // needCalculateRect === 'width'
      //   ? resizeRect(activeRect, offset, 0, 5)
      //   : resizeRect(activeRect, 0, offset, 6);
      needCalculateRect === 'width' ? activeRect.width += offset : activeRect.height += offset;
      calcWorldRects(pen);
    }
    pen.calculative.canvas.render();
  }
}
function mouseUp(pen: Pen, e: Point) {
  pen.dropAnchor = false;
  if (pen.calculative.dragChild) {
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
        const { activeFunIndex, worldRect } = pen.calculative;
        const { mouseDown } = pen.calculative.canvas;
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
          // resizeRect(activeRect, -activeFun.len, 0, 5);
        }
        if (pen.direction == 'horizontal') {
          updateRectWorH(activeRect, 'height', -activeFun.len);
        } else {
          updateRectWorH(activeRect, 'width', -activeFun.len);
        }
        for (let i = 0; i < hoverContainer.data.length; i++) {
          const item = hoverContainer.data[i];
          console.log('的方式', e[eKey] > start , e[eKey] < start + item.len);
          
          if (e[eKey] > start && e[eKey] < start + item.len) {
            // hoverContainer[newKey] += activeFun.len;
            updatenWidthOrHeight(hoverContainer, newKey, activeFun.len);
            hoverContainer.data.splice(i, 0, activeFun);
            hoverContainer.calculative.dataTextLines.splice(
              i,
              0,
              pen.calculative.dataTextLines[activeFunIndex]
            );
            
            
            // 若原来的泳道有followers，则需要移动插入位置之后的followers
            if(hoverContainer.direction == 'vertical') {
              let flowPens = getActiveFunFollowers(hoverContainer, undefined, 'x', start);
              pen.calculative.canvas.translatePens(flowPens, activeFun.len, 0, false, true);
            } else {
              let flowPens = getActiveFunFollowers(hoverContainer, undefined, 'y', start);
              pen.calculative.canvas.translatePens(flowPens, 0, activeFun.len , false, true);
            }
             // 若被合并的泳道有followers，则将followers添加到合并后的泳道中并移动
            const rect1 = getActiveFunRect(pen, activeFunIndex);
            const subx1 = mouseDown.x - rect1.x;
            const suby1 = mouseDown.y - rect1.y;
            
            let flowPens = getActiveFunFollowers(pen, rect1);
            if(flowPens.length > 0) {
              const rect2 = getActiveFunRect(hoverContainer, i);
              const subx2 = e.x - rect2.x;
              const suby2 = e.y - rect2.y;
              flowPens.forEach((flowPen) => {
                hoverContainer.followers.push(flowPen.id);
              });
              let subx = e.x - mouseDown.x - subx2 + subx1;
              let suby = e.y - mouseDown.y - suby2 + suby1;
              pen.calculative.canvas.translatePens(flowPens, subx, suby, false, true);
            }
            console.log(111)
            if(pen.direction == 'vertical') {
              let distance = worldRect.x + pen.stageLen;
              for(let i = 0; i < activeFunIndex; i++) {
                distance += pen.data[i].len;
              }
              
              moveFollowers(pen,{x:distance + activeFun.len, y:worldRect.y + pen.headHeight, ex:worldRect.ex, ey:worldRect.ey}, -activeFun.len, 0);
              // let flowPens = getActiveFunFollowers(hoverContainer, undefined, 'x', start);
              // pen.calculative.canvas.translatePens(flowPens, activeFun.len, 0, false, true);
            } else {
              let distance = worldRect.y + pen.headHeight + pen.stageLen;
              for(let i = 0; i < activeFunIndex; i++) {
                distance += pen.data[i].len;
              }
              moveFollowers(pen,{x:worldRect.x, y:worldRect.y + pen.headHeight + pen.stageLen, ex:worldRect.ex, ey:worldRect.ey}, 0,-activeFun.len);
              // let flowPens = getActiveFunFollowers(hoverContainer, undefined, 'y', start);
              // pen.calculative.canvas.translatePens(flowPens, 0, activeFun.len , false, true);
            }
            // calcWorldRects(hoverContainer);
            // updatenWidthOrHeight(pen, 'width', activeFun.len);
            if (pen.data.length === 1) {
              pen.calculative.canvas.parent.delete([pen]);
            } else {
              pen.data.splice(activeFunIndex, 1);
              if (pen.direction === hoverContainer.direction) {
                
                updatenWidthOrHeight(pen, newKey, -activeFun.len);
              } else {
                // pen[oldKey] -= activeFun.len;
                updatenWidthOrHeight(pen, oldKey, -activeFun.len);
              }
              // calcWorldRects(pen);
              pen.calculative.activeFunIndex = -1;
            }
            break;
          }
          start += item.len;
        }
      }  
      // else  if(pen.data.length === 1){
      //   //当只有一个子泳道且拖拽完毕没有拖到其他泳道
      //   const { mouseDown } = pen.calculative.canvas;
      //   pen.calculative.canvas.translatePens(
      //     [pen],
      //     e.x - mouseDown.x,
      //     e.y - mouseDown.y
      //   );
      // }
      else if (pen.data.length > 1) {
        //当有多个子泳道且拖拽完毕没有拖到其他泳道
        const {mouseDown} = pen.calculative.canvas;
        const { activeFunIndex } = pen.calculative;
        const newSwimlane = deepClone(pen);
        const activeFun = pen.data[activeFunIndex];
        // 计算点击的点位在子泳道距离起始点的偏移量
        let rect = getActiveFunRect(pen, activeFunIndex);
        let flowPens = getActiveFunFollowers(pen, rect);
        newSwimlane.followers = [];
        flowPens.forEach((flowPen) =>{
          newSwimlane.followers.push(flowPen.id);
        })
        pen.followers = pen.followers.filter((follower) => !newSwimlane.followers.includes(follower));
        let subx = e.x - mouseDown.x;
        let suby = e.y - mouseDown.y;
        let offsetX = 0, offsetY = 0;
        pen.calculative.canvas.translatePens(flowPens, subx, suby, false, true);
        if (pen.direction == 'vertical') {
          offsetX = rect.x - pen.stageLen;
          offsetY = rect.y - pen.headHeight;
          newSwimlane.width = newSwimlane.stageLen + activeFun.len;
          updatenWidthOrHeight(pen, 'width', -activeFun.len);
          flowPens = getActiveFunFollowers(pen, undefined, 'x', rect.x + activeFun.len);
          pen.calculative.canvas.translatePens(flowPens, -activeFun.len, 0, false, true);
        } else {
          newSwimlane.height =
            newSwimlane.headHeight + newSwimlane.stageLen + activeFun.len;
            offsetY = rect.y - pen.stageLen - pen.headHeight;
            offsetX = rect.x;
          updatenWidthOrHeight(pen, 'height', -activeFun.len);
          flowPens = getActiveFunFollowers(pen, undefined, 'y', rect.y + activeFun.len);
          pen.calculative.canvas.translatePens(flowPens, 0, -activeFun.len, false, true);
        }
        newSwimlane.id = s8();
        newSwimlane.x = e.x - mouseDown.x + offsetX;
        newSwimlane.y = e.y - mouseDown.y + offsetY;
        newSwimlane.data = [activeFun];
        pen.data.splice(activeFunIndex, 1);
        pen.calculative.activeFunIndex = -1;
        pen.calculative.canvas.parent.addPen(newSwimlane);
        console.log('pen', newSwimlane);
      }
    } else {
      // 拖拽移动子泳道顺序
      const { activeFunIndex, worldRect } = pen.calculative;
      const { stageLen, headHeight } = pen;
      const activeFun = pen.data[activeFunIndex];
      let distance = worldRect.x + stageLen;
      let eKey = 'x',
        start = worldRect.x + stageLen;
      if (pen.direction == 'horizontal') {
        eKey = 'y';
        start = worldRect.y + headHeight + stageLen;
        distance = worldRect.y + headHeight + stageLen;
      }
      
      for(let i = 0; i < activeFunIndex; i++) {
        distance += pen.data[i].len;
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
          if(pen.direction == 'vertical') {
            let flowPens = getActiveFunFollowers(pen, {x:distance, y:worldRect.y + headHeight, ex:distance + activeFun.len, ey:worldRect.ey});
            if(start > distance) {
              // flowPensTarget = getActiveFunFollowers(pen, {x:distance + activeFun.len, y:worldRect.y + headHeight, ex:start + item.len, ey:worldRect.ey});
              moveFollowers(pen,{x:distance + activeFun.len, y:worldRect.y + headHeight, ex:start + item.len, ey:worldRect.ey}, -activeFun.len, 0);
            } else {
              // flowPensTarget = getActiveFunFollowers(pen, {x:start, y:worldRect.y + headHeight, ex:distance, ey:worldRect.ey});
              moveFollowers(pen, {x:start, y:worldRect.y + headHeight, ex:distance, ey:worldRect.ey}, activeFun.len, 0);
            }
            pen.calculative.canvas.translatePens(flowPens, start - distance, 0, false, true);//移动选中的子泳道和在其范围内的follower到目标位置
            // pen.calculative.canvas.translatePens(flowPensTarget,start - distance > 0 ? -activeFun.len : activeFun.len, 0);
            // moveFollowers(pen,{x:distance, y:worldRect.y + headHeight, ex:distance + activeFun.len, ey:worldRect.ey}, start - distance, 0);
          } else {
            let flowPens = getActiveFunFollowers(pen, {x:worldRect.x, y:distance, ex:worldRect.ex, ey:distance + activeFun.len});
            if(start > distance) {
              // let flowPensTarget = getActiveFunFollowers(pen, );
              // pen.calculative.canvas.translatePens(flowPensTarget, 0 , -activeFun.len);
              moveFollowers(pen, {x:worldRect.x, y:distance + activeFun.len, ex:worldRect.ex, ey:start + item.len},0,-activeFun.len);
            } else {
              moveFollowers(pen, {x:worldRect.x, y:start, ex:worldRect.ex, ey:distance}, 0, activeFun.len);
              // let flowPensTarget = getActiveFunFollowers(pen, {x:worldRect.x, y:start, ex:worldRect.ex, ey:distance});
              // pen.calculative.canvas.translatePens(flowPensTarget, 0 , activeFun.len);
            }
            // moveFollowers(pen, {x:worldRect.x, y:distance, ex:worldRect.ex, ey:distance + activeFun.len}, 0, start - distance);
            pen.calculative.canvas.translatePens(flowPens, 0 ,start - distance, false, true );
          }
          break;
        }
        start += item.len;
      }
    }
    pen.calculative.dragChild = false;
  } else {
    const activePens = pen.calculative.canvas.store.active;
    if (activePens.some((activePen) => activePen.id === pen.id)) return;
    activePens.forEach((activePen) => {
      !pen.followers.includes(activePen.id) && pen.followers.push(activePen.id);
    });
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
}
function showInput(pen: Pen, e) {
  pen.calculative.editeKey = undefined;
  const { x, y, width, height } = pen.calculative.worldRect;
  const { funTitleLen, stageLen, headHeight, data } = pen;
  const headEndY = y + headHeight;
  const canvas = pen.calculative.canvas;
  let textAlign = 'center';
  let rect = {
    x: x,
    y: y,
    width: width,
    height: height,
    minH: height,
  };
  if (pen.direction == 'horizontal') {
    let funy = headEndY + stageLen;
    if (e.offsetY < headEndY) {
      rect.height = headHeight;
      rect.minH = headHeight;
      pen.calculative.editeKey = 'headText';
      pen.calculative.tempText = pen.headText;
      pen.calculative.worldTextRect.width = width;
      textAlign = 'left';
    } else if (e.offsetY > headEndY && e.offsetY < funy) {
      rect.y = headEndY;
      rect.height = stageLen;
      rect.minH = stageLen;
      pen.calculative.editeKey = 'stageText';
      pen.calculative.tempText = pen.stageText;
      pen.calculative.worldTextRect.width = width;
      textAlign = 'right';
    } else if (e.offsetX < x + funTitleLen) {
      for (let i = 0; i < data.length; i++) {
        const item = data[i];
        if (e.offsetY > funy && e.offsetY < funy + item.len) {
          rect.height = funTitleLen;
          rect.width = item.len;
          rect.minH = funTitleLen;
          rect.y = funy + item.len / 2 - funTitleLen / 2;
          rect.x -= item.len / 2 - funTitleLen / 2;
          pen.calculative.editeKey = i;
          pen.calculative.tempText = item.text;
          pen.calculative.worldTextRect.width = item.len;
          break;
        }
        funy += item.len;
      }
    }
  } else {
    let funx = x + stageLen;
    if (e.offsetY < headEndY) {
      rect.height = headHeight;
      rect.minH = headHeight;
      pen.calculative.editeKey = 'headText';
      pen.calculative.tempText = pen.headText;
      pen.calculative.worldTextRect.width = width;
      textAlign = 'left';
    } else if (e.offsetX < funx) {
      rect.width = height - headHeight;
      rect.height = stageLen;
      rect.x -= rect.width / 2 - rect.height / 2;
      rect.y += height / 2;
      rect.minH = stageLen;
      pen.calculative.editeKey = 'stageText';
      pen.calculative.tempText = pen.stageText;
      pen.calculative.worldTextRect.width = height - headHeight;
      textAlign = 'left';
    } else if (e.offsetY < headEndY + funTitleLen) {
      for (let i = 0; i < data.length; i++) {
        const item = data[i];
        if (e.offsetX > funx && e.offsetX < funx + item.len) {
          rect.height = funTitleLen;
          rect.width = item.len;
          rect.x = funx;
          rect.y = headEndY;
          pen.calculative.editeKey = i;
          pen.calculative.tempText = item.text;
          pen.calculative.worldTextRect.width = item.len;
          break;
        }
        funx += item.len;
      }
      rect.minH = funTitleLen;
    }
  }
  if(pen.calculative.editeKey === undefined) return;
  canvas.showInput(pen, rect);
  canvas.inputDiv.style.textAlign = textAlign;
}
function onInputDone(pen: Pen, text: string, { h }) {
  const { editeKey } = pen.calculative;
  console.log('editeKey', editeKey, text);
  
  const { stageLen, funTitleLen, headHeight, direction } = pen;
  h = parseInt(h);
  if (editeKey === 'headText') {
    pen.headText = text;
    pen.calculative.headTextLines = calcTextLines(text, pen);
    if (h && h > headHeight) {
      pen.headHeight = h;
      updatenWidthOrHeight(pen, 'height', h - headHeight);
    }
    pen.calculative.worldTextRect.width = pen.width;
  } else if (editeKey === 'stageText') {
    pen.stageText = text;
    pen.calculative.stageTextLines = calcTextLines(text, pen);
    if (h && h > stageLen) {
      pen.stageLen = h;
      if (direction === 'horizontal') {
        updatenWidthOrHeight(pen, 'height', h - stageLen);
      } else {
        updatenWidthOrHeight(pen, 'width', h - stageLen);
      }
    }
    pen.calculative.worldTextRect.width = pen.width;
  } else {
    pen.data[editeKey].text = text;
    pen.calculative.dataTextLines[editeKey] = calcTextLines(text, pen);
    if (h && h > funTitleLen) {
      pen.funTitleLen = h;
      if (direction === 'horizontal') {
        updatenWidthOrHeight(pen, 'width', h - funTitleLen);
      } else {
        updatenWidthOrHeight(pen, 'height', h - funTitleLen);
      }
    }
  }
}
function updatenWidthOrHeight(pen: Pen, key: string, offset: number) {
  pen[key] += offset;
  updateRectWorH(pen.calculative.worldRect, key, offset);
}
function updateRectWorH(rect: Rect, key: string, offset: number) {
  rect[key] += offset;
  rect[key === 'height' ? 'ey' : 'ex'] += offset;
}
function calcTextLines(text: string, pen: Pen) {
  pen.calculative.worldTextRect.width -= 2 * textPadding; // 边距
  const lines = [];
  const paragraphs = text.split(/[\n]/g);
  for (const paragraph of paragraphs) {
    const words = getWords(paragraph);
    let items = wrapLines(words, pen);
    // 空行换行的情况
    if (items.length === 0) items = [''];
    lines.push(...items);
  }
  return lines;
}
function pointAroundResizeLine(pen: Pen, pt: Point) {
  pen.calculative.resizeIndex = -1;
  pen.calculative.resizeBox = 'none';
  const minDistance = 8;
  const { x, y, ey, ex } = pen.calculative.worldRect;
  let completeDistance = 0,
    funDistance = 0,
    stageDistance = 0,
    // stageY = y + headHeight,
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
  if (completeDistance < minDistance * 2) {
    pen.calculative.resizeBox = 'complete';
    return true;
  }
  if (funDistance < minDistance && pt.y > y + pen.headHeight) {
    // 只允许鼠标在功能区头部上方10像素范围内拖拽调整大小，避免和选中功能区冲突
    pen.calculative.resizeBox = 'fun';
    return true;
  }
  if (stageDistance < minDistance && pt.y > y + pen.headHeight) {
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
function getActiveFunFollowers(pen: Pen, rect:Rect, translateKey?:'x'|'y', translateStart?:number) {
  return getAllFollowers(pen, pen.calculative.canvas.store).filter((flowPen) =>{
    if(rect && rectInRect(flowPen.calculative.worldRect, rect, true)){
      return true;
    }
    if(translateKey && flowPen.calculative.worldRect[translateKey] > translateStart){
      return true;
    }
  })
}
function moveFollowers(pen: Pen, rect: Rect, distanceX: number, distanceY: number) {
  let flowPens = getActiveFunFollowers(pen, rect);
  console.log('flowPens',rect, flowPens,distanceX , distanceY,);
  pen.calculative.canvas.translatePens(flowPens, distanceX , distanceY, false, true);
}
function getActiveFunRect(pen: Pen, activeFunIndex: number) {
  const { worldRect:{x, y, ex, ey}} = pen.calculative;
  const { stageLen, headHeight } = pen;
  const activeFun = pen.data[activeFunIndex];
  let rect: Rect;
  if(pen.direction === 'vertical') {
    let startX = x + stageLen;
    const startY = y + headHeight;
    for(let i = 0; i < activeFunIndex; i++){
      startX += pen.data[i].len;
    }
    rect = {
      x:startX,
      y:startY,
      ex: startX + activeFun.len,
      ey
    }
  } else {
    const startX = x;
    let startY = y + headHeight + stageLen;
    for(let i = 0; i < activeFunIndex; i++){
      startY += pen.data[i].len;
    }
    rect = {
      x:startX,
      y:startY,
      ex,
      ey: startY + activeFun.len
    }
  }
  return rect;
}
function mouseLeave(pen: Pen) {
  const {
    mouseDown,
    store: { active },
  } = pen.calculative.canvas;
  if (!mouseDown || active.length === 0) return;
  pen.followers = pen.followers.filter((follower) =>
    active.every((activePen) => activePen.id !== follower)
  );
}
