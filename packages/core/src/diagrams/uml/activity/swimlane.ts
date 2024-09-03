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
  pen.minFunTitleLen *= s;
  pen.minStageLen *= s;
  pen.stageLen *= s;
  pen.headHeight *= s;
  pen.data.forEach((item: any) => {
    item.len *= s;
    item.minLen *= s;
  });
  pen.calculative.scale = scale;
}
function mouseDown(pen: Pen, e: Point) {
  if (pen.calculative.resizeBox != 'none') { //不是拖拽调整子泳道大小
    pen.calculative.lastY = e.y;
    pen.calculative.lastX = e.x;
    pen.dropAnchor = true;
    return;
  }
  const { x, y } = pen.calculative.worldRect;
  const data = pen.data;
  const { stageLen, funTitleLen, headHeight } = pen;
  const mouseDown = pen.calculative.canvas.mouseDown;
  pen.calculative.activeFunIndex = -1;
  if (pen.direction === 'horizontal') {
    let startY = y + headHeight + stageLen;
    for (let i = 0; i < data.length; i++) {
      if(e.y > startY && e.y < startY + data[i].len) {
        if (e.x < x + funTitleLen &&e.x > x) {
          pen.calculative.activeFunIndex = i;
          pen.dropAnchor = true;
          pen.calculative.distanceX = mouseDown.x - x;
          pen.calculative.distanceY = mouseDown.y - startY + stageLen + headHeight;
        }
        return;
      }
      startY += data[i].len;
    }
  } else {
    let startX = x + stageLen,
      endY = y + headHeight + funTitleLen,
      startY = y + headHeight;
    for (let i = 0; i < data.length; i++) {
      if( e.x > startX &&e.x < startX + data[i].len) {
        if (
          e.y < endY &&
          e.y > startY
        ) {
          pen.calculative.activeFunIndex = i;
          pen.dropAnchor = true;
          pen.calculative.distanceX = mouseDown.x - startX + stageLen;
          pen.calculative.distanceY = mouseDown.y - y;
        }
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
    const { resizeBox, resizeIndex, lastX, lastY } = pen.calculative;
    const { activeRect } = pen.calculative.canvas;
    let offset = 0;
    let needCalculateRect = 'none';
    if (pen.direction == 'vertical') {
      const { height } = pen.calculative.worldRect;
      if (resizeBox == 'none') {
        pen.calculative.dragChild = true;
      } else {
        if (resizeBox == 'stage') {//移动
          const { stageLen, minStageLen } = pen;
          offset = e.x - lastX;
          const targetStageLen = stageLen + offset;
          if (targetStageLen > minStageLen) { // stage变大
            pen.stageLen = targetStageLen;
            pen.calculative.lastX = e.x;
            needCalculateRect = 'width';
            let followers = getAllFollowers(pen, pen.calculative.canvas.store);
            pen.calculative.canvas.translatePens(followers,  offset, 0, false, true);
          } else if (stageLen > minStageLen) { // stage临界将要小于最小值
            offset = -stageLen + minStageLen;
            pen.stageLen = minStageLen;
            needCalculateRect = 'width';
            let followers = getAllFollowers(pen, pen.calculative.canvas.store);
            pen.calculative.canvas.translatePens(followers,  offset, 0, false, true);
          }
        } else if (resizeIndex >= 0) {
          offset = e.x - lastX;
          const item = pen.data[resizeIndex];
          const targetLen = item.len + offset;
          if (targetLen >= item.minLen) {
            item.len = targetLen;
            pen.calculative.lastX = e.x;
            needCalculateRect = 'width';
            moveFollowersAfterIndex(pen, resizeIndex + 1, pen.data.length, offset,0);
          } else if(item.len > item.minLen){
            offset = -item.len + item.minLen;
            item.len = item.minLen;
            needCalculateRect = 'width';
            moveFollowersAfterIndex(pen, resizeIndex + 1, pen.data.length, offset,0);
          }
        } else {
          const {funTitleLen, headHeight, minFunTitleLen, maxFunTitleLen } = pen;
          offset = e.y - lastY;
          if(resizeBox == 'complete'){
            const targetHeight = height + offset;
            if (targetHeight > funTitleLen + headHeight) {
              pen.calculative.lastY = e.y;
              needCalculateRect = 'height';
            } else if(height > funTitleLen + headHeight) {
              offset = funTitleLen + headHeight - height;
              needCalculateRect = 'height';
            }
          } else {
            const targetFunTitleLen = funTitleLen + offset;
            if (
              targetFunTitleLen >= minFunTitleLen &&
              targetFunTitleLen <= maxFunTitleLen
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
          const {stageLen, minStageLen} = pen;
          const targetStageLen = stageLen + offset;
          if (targetStageLen > minStageLen) {
            pen.stageLen = targetStageLen;
            pen.calculative.lastY = e.y;
            needCalculateRect = 'height';
          } else if (stageLen > minStageLen) {
            offset = -stageLen + minStageLen;
            pen.stageLen = minStageLen;
            needCalculateRect = 'height';
          }
        } else if (resizeIndex >= 0) { // 移动子泳道的高度
          offset = e.y - lastY;
          const item = pen.data[resizeIndex];
          const targetHeight = item.len + offset;
          // const {x, y, ex, ey} = pen.calculative.worldRect;
          if (targetHeight >= item.minLen) {
            item.len = targetHeight;
            pen.calculative.lastY = e.y;
            needCalculateRect = 'height';
            moveFollowersAfterIndex(pen, resizeIndex + 1, pen.data.length, 0, offset);
          } else if(item.len > item.minLen) {
            offset = -item.len + item.minLen;
            item.len = item.minLen;
            needCalculateRect = 'height';
            moveFollowersAfterIndex(pen, resizeIndex + 1, pen.data.length, 0, offset);
          }
        } else{
          const { width } = pen.calculative.worldRect;
          const {funTitleLen, minFunTitleLen, maxFunTitleLen} = pen;
          offset = e.x - lastX;
          if (resizeBox == 'complete') {
            const targetWidth = width + offset;
            if (targetWidth > funTitleLen) {
              pen.calculative.lastX = e.x;
              needCalculateRect = 'width';
            } else {
              offset = funTitleLen - width;
              needCalculateRect = 'width';
            }
          } else {
            const targetFunHeight = funTitleLen + offset;
            if (
              targetFunHeight >= minFunTitleLen &&
              targetFunHeight <= maxFunTitleLen
            ) {
              pen.calculative.lastX = e.x;
              pen.funTitleLen += offset;
            }
          }
        }
      }
    }
    if (needCalculateRect != 'none') {
      activeRect[needCalculateRect] += offset;
      updatenWidthOrHeight(pen, needCalculateRect, offset);
    }
    pen.calculative.canvas.render();
  }
}
function mouseUp(pen: Pen, e: Point) {
  pen.dropAnchor = false;
  const activePens = pen.calculative.canvas.store.active;
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
        const activeFun = pen.data[activeFunIndex];
        let oldKey = 'height',
          newKey = 'width',
          start =
            hoverContainer.calculative.worldRect.x + hoverContainer.stageLen,
          eKey = 'x',
          subY = hoverContainer.calculative.worldRect.y - pen.calculative.worldRect.y,
          subX = 0,
          activeFunX = worldRect.x + pen.stageLen,
          activeFunY = 0;
          for(let i = 0 ;i < activeFunIndex; i++) {
            activeFunX += pen.data[i].len;
          }
        if (hoverContainer.direction == 'horizontal') {
          oldKey = 'width';
          newKey = 'height';
          start =
            hoverContainer.calculative.worldRect.y +
            hoverContainer.stageLen +
            hoverContainer.headHeight;
          eKey = 'y';
          activeFunY = worldRect.y + pen.headHeight + pen.stageLen;
          for(let i = 0 ;i < activeFunIndex; i++) {
            activeFunY += pen.data[i].len;
          }
          subX = hoverContainer.calculative.worldRect.x - pen.calculative.worldRect.x;
        }
        updateRectWorH(activeRect, pen.direction == 'horizontal' ?'height':'width', -activeFun.len);
        for (let i = 0; i < hoverContainer.data.length; i++) {
          const item = hoverContainer.data[i];
          if (e[eKey] > start && e[eKey] < start + item.len) {
            // 若原来的泳道有followers，则需要移动插入位置之后的followers,被合并子泳道的泳道移出位置之后的followers需要移动
            updatenWidthOrHeight(hoverContainer, newKey, activeFun.len);
            if(hoverContainer.direction == 'vertical') {
              moveFollowersAfterIndex(hoverContainer, i,hoverContainer.data.length, activeFun.len, 0);
              moveFollowersAfterIndex(pen, activeFunIndex + 1, pen.data.length, -activeFun.len, 0);
              subX = start - activeFunX;
            } else {
              moveFollowersAfterIndex(hoverContainer, i,hoverContainer.data.length, 0, activeFun.len);
              moveFollowersAfterIndex(pen, activeFunIndex + 1, pen.data.length, 0, -activeFun.len);
              subY = start - activeFunY;
            }
            hoverContainer.data.splice(i, 0, activeFun);
            hoverContainer.calculative.dataTextLines.splice(
              i,
              0,
              pen.calculative.dataTextLines[activeFunIndex]
            );
            // 若被合并的泳道有followers，则将followers添加到合并后的泳道中并移动
            if(activeFun.followersId.length > 0) {
              pen.followers = pen.followers.filter((follower) => !activeFun.followersId.includes(follower));
              hoverContainer.followers.push(...activeFun.followersId);
              moveFollowers(pen, activeFun.followersId, subX, subY);
            }
            if (pen.data.length === 1) {
              pen.calculative.canvas.parent.delete([pen]);
            } else {
              pen.data.splice(activeFunIndex, 1);
              pen.calculative.dataTextLines.splice(activeFunIndex, 1);
              if (pen.direction === hoverContainer.direction) {
                updatenWidthOrHeight(pen, newKey, -activeFun.len);
              } else {
                updatenWidthOrHeight(pen, oldKey, -activeFun.len);
              }
              pen.calculative.activeFunIndex = -1;
            }
            break;
          }
          start += item.len;
        }
      }  else if (pen.data.length > 1) {
        //当有多个子泳道且拖拽完毕没有拖到其他泳道
        const {mouseDown} = pen.calculative.canvas;
        const { activeFunIndex } = pen.calculative;
        const {stageLen, headHeight} = pen;
        const newSwimlane = deepClone(pen);
        const activeFun = pen.data[activeFunIndex];
        // 处理follows
        newSwimlane.followers = [...activeFun.followersId];
        pen.followers = pen.followers.filter((follower) => !newSwimlane.followers.includes(follower));
        // 计算点击的点位在子泳道距离起始点的偏移量
        let subx = e.x - mouseDown.x;
        let suby = e.y - mouseDown.y;
        moveFollowers(pen, activeFun.followersId, subx, suby);
        if (pen.direction == 'vertical') {
          newSwimlane.width = stageLen + activeFun.len;
          updatenWidthOrHeight(pen, 'width', -activeFun.len);
          moveFollowersAfterIndex(pen, activeFunIndex + 1,pen.data.length, -activeFun.len, 0);
        } else {
          newSwimlane.height = headHeight + stageLen + activeFun.len;
          updatenWidthOrHeight(pen, 'height', -activeFun.len);
          moveFollowersAfterIndex(pen, activeFunIndex + 1, pen.data.length,0, -activeFun.len);
        }
        newSwimlane.id = s8();
        newSwimlane.x = e.x -  pen.calculative.distanceX;
        newSwimlane.y = e.y -  pen.calculative.distanceY;
        newSwimlane.data = [activeFun];
        pen.data.splice(activeFunIndex, 1);
        pen.calculative.activeFunIndex = -1;
        pen.calculative.canvas.parent.addPen(newSwimlane);
        const store = pen.calculative.canvas.store;
        store.data.pens.splice(0, 0, newSwimlane);
        store.data.pens.pop();
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
          let followersId = [];
          if(pen.direction == 'vertical') {
            if(activeFunIndex < i) {
              for(let j = activeFunIndex + 1; j <= i; j++) {
                followersId = followersId.concat(pen.data[j].followersId);
              }
              moveFollowers(pen, followersId, -activeFun.len, 0);
              moveFollowers(pen, activeFun.followersId, start + item.len - distance - activeFun.len, 0);
            } else {
              for(let j = i; j < activeFunIndex; j++) {
                followersId = followersId.concat(pen.data[j].followersId);
              }
              moveFollowers(pen, followersId, activeFun.len, 0);
              moveFollowers(pen, activeFun.followersId, start - distance, 0);
            }
          } else {
            if(activeFunIndex < i) {
              for(let j = activeFunIndex + 1; j <= i; j++) {
                followersId = followersId.concat(pen.data[j].followersId);
              }
              moveFollowers(pen, followersId,0, -activeFun.len);
              moveFollowers(pen, activeFun.followersId,0, start + item.len - distance - activeFun.len);
            } else {
              for(let j = i; j < activeFunIndex; j++) {
                followersId = followersId.concat(pen.data[j].followersId);
              }
              moveFollowers(pen, followersId,0, activeFun.len);
              moveFollowers(pen, activeFun.followersId,0, start - distance);
            }
            
          }
          pen.data.splice(activeFunIndex, 1);
          pen.data.splice(i, 0, activeFun);
          const tempText = pen.calculative.dataTextLines[activeFunIndex];
          pen.calculative.dataTextLines.splice(activeFunIndex, 1);
          pen.calculative.dataTextLines.splice(i, 0, tempText);
          pen.calculative.activeFunIndex = i;
          break;
        }
        start += item.len;
      }
    }
    pen.calculative.dragChild = false;
  } else if(activePens.length > 0 && activePens.every((activePen) => activePen.id !== pen.id)) {
    let start = pen.calculative.worldRect.y + pen.headHeight + pen.stageLen, key = 'y';
    if(pen.direction == 'vertical') {
      start =  pen.calculative.worldRect.x + pen.stageLen;
      key = 'x';
    } 
    for(let i = 0; i < pen.data.length; i++) {
      if(e[key] > start && e[key] < start + pen.data[i].len) {
        
        activePens.forEach((activePen) => {
          if(pen.followers.includes(activePen.id)){
            for(let j = 0; j < pen.data.length; j++) {
              const index = pen.data[j].followersId.indexOf(activePen.id);
              if(index != -1) {
                pen.data[j].followersId.splice(index, 1);
              }
            }
            pen.data[i].followersId.push(activePen.id);
          } else {
            if(!activePen.type) {
              pen.followers.push(activePen.id);
              pen.data[i].followersId.push(activePen.id);
              if(pen.direction === 'vertical') {
                setTimeout(() => {
                  const {y, ex} = activePen.calculative.worldRect;
                  pen.data[i].minLen = Math.max(pen.data[i].minLen, ex - start);
                  pen.maxFunTitleLen = Math.min(pen.maxFunTitleLen,  y - pen.calculative.worldRect.y - pen.headHeight);
                }, 0);
              } else {
                setTimeout(() => {
                  const {x ,y, ex, ey} = activePen.calculative.worldRect;
                  pen.data[i].minLen = Math.max(pen.data[i].minLen, ey - start);
                  pen.maxFunTitleLen = Math.min(pen.maxFunTitleLen,  x - pen.calculative.worldRect.x);
                }, 0);
              }
            }
          }
        });
        for(let j = 0; j < pen.data.length; j++) { //移除原来的但是已经被删除了的 followers
          for(let m = 0; m < pen.data[j].followersId.length; m++) {
            const follower = pen.data[j].followersId[m];
            const followerPen = pen.calculative.canvas.store.pens[follower];
            if(!followerPen) {
              pen.data[j].followersId.splice(m, 1);
              m--;
            }
          }
        }
        break;
      }
      start += pen.data[i].len;
    }
  }
  // if (pen.calculative.dragChild) {
  //   this.delete([this.dragChild]);
  //   this.dragChild = undefined;
  // }
  pen.data.forEach((item, index) => {
    if (item.len === 0) {
      pen.data.splice(index, 1);
      pen.calculative.dataTextLines.splice(index, 1);
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
// 拆分合并后移动原来图元中的followers
function moveFollowersAfterIndex(pen: Pen, startindex: number,endIndex:number, distanceX: number, distanceY: number) {
  let followersId = [];
  for(let j = startindex; j < endIndex; j++) {
    followersId = followersId.concat(pen.data[j].followersId);
  }
  moveFollowers(pen, followersId, distanceX, distanceY);
}
function moveFollowers(pen: Pen, flowersId:string[], distanceX: number, distanceY: number) {
  const store = pen.calculative.canvas.store;
  let followers = [];
  flowersId.forEach((id) => {
    const follower = store.pens[id];
    if (follower&&!follower.parentId) {
      followers.push(follower);
      followers.push(...getAllFollowers(follower, store));
    }
  });
  pen.calculative.canvas.translatePens(followers,  distanceX, distanceY, false, true);
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
  pen.data.forEach((item) => {
    item.followersId = item.followersId.filter((follower) =>
      active.every((activePen) => activePen.id !== follower)
    );
  });
}
