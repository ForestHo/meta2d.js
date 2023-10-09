import { Pen } from '.';
import { Canvas } from '../canvas';
import { calcRightBottom, Rect } from '../rect';
import { getFont } from './render';

export function calcTextRect(pen: Pen) {
  const {
    paddingTop,
    paddingBottom,
    paddingLeft,
    paddingRight,
    worldRect,
    canvas,
  } = pen.calculative;
  let { textLeft, textTop, textWidth, textHeight } = pen.calculative;
  let x = paddingLeft;
  let y = paddingTop;
  if (textLeft && Math.abs(textLeft) < 1) {
    textLeft *= worldRect.width;
  }
  if (textTop && Math.abs(textTop) < 1) {
    textTop *= worldRect.height;
  }

  const width =
    worldRect.width -
    paddingLeft -
    paddingRight -
    ((pen.textAlign === 'right' ? -textLeft : textLeft) || 0);
  const height =
    worldRect.height -
    paddingTop -
    paddingBottom -
    ((pen.textBaseline === 'bottom' ? -textTop : textTop) || 0);
  if (textWidth && textWidth < 1) {
    textWidth *= worldRect.width;
  }
  if (textHeight && textHeight < 1) {
    textHeight *= worldRect.height;
  }
  if (textWidth < pen.calculative.fontSize) {
    textWidth = pen.calculative.fontSize;
  }
  // 默认居左，居上
  x += (textLeft || 0) + worldRect.x;
  y += (textTop || 0) + worldRect.y;
  const textAlign = pen.textAlign || canvas.store.options.textAlign;
  const textBaseline = pen.textBaseline || canvas.store.options.textBaseline;

  switch (textAlign) {
    case 'center':
      x += (width - (textWidth || width)) / 2;
      break;
    case 'right':
      x += width - (textWidth || width);
      break;
  }

  switch (textBaseline) {
    case 'middle':
      y += (height - (textHeight || height)) / 2;
      break;
    case 'bottom':
      y += height - (textHeight || height);
      break;
  }

  const rect: Rect = {
    x,
    y,
    width: textWidth || width,
    height: textHeight || height,
  };
  calcRightBottom(rect);
  pen.calculative.worldTextRect = rect;

  calcTextLines(pen);
  pen.calculative.textDrawRect = undefined;
}

export function calcTextDrawRect(ctx: CanvasRenderingContext2D, pen: Pen) {
  // By default, the text is center aligned.
  const lineHeight = pen.calculative.fontSize * pen.calculative.lineHeight;
  const h = pen.calculative.textLines.length * lineHeight;
  const textWidth = calcTextAdaptionWidth(ctx, pen); // 多行文本最大宽度
  const rect = pen.calculative.worldTextRect;
  let x = rect.x + (rect.width - textWidth) / 2;
  let y = rect.y + (rect.height - h) / 2;
  const options = pen.calculative.canvas.store.options;
  const textAlign = pen.textAlign || options.textAlign;
  switch (textAlign) {
    case 'left':
      x = rect.x;
      break;
    case 'right':
      x = rect.x + rect.width - textWidth;
      break;
  }
  const textBaseline = pen.textBaseline || options.textBaseline;
  switch (textBaseline) {
    case 'top':
      y = rect.y;
      break;
    case 'bottom':
      y = rect.ey - h;
      break;
  }

  pen.calculative.textDrawRect = {
    x,
    y,
    width: textWidth,
    height: h,
  };
  calcRightBottom(pen.calculative.textDrawRect);
}

export function calcTextLines(pen: Pen, text = pen.calculative.text) {
  if (text == undefined) {
    pen.calculative.textLines = [];
    return;
  }
  text = text.toString();
  let lines: string[] = [];
  const oneRowHeight = pen.calculative.fontSize * pen.calculative.lineHeight;
  const textHeight = pen.calculative.worldTextRect.height;
  const calcRows = Math.floor(textHeight / oneRowHeight);
  // 最小值为 1
  const maxRows = calcRows > 1 ? calcRows : 1;
  if(pen.name != 'text') { // 新文本不需要进行计算
    switch (pen.whiteSpace) {
      case 'nowrap':
        if (pen.ellipsis !== false) {
          const allLines = wrapLines(text.split(''), pen);
          if (allLines[0]) {
            lines.push(allLines[0]);
            if (allLines.length > 1) {
              // 存在第二行，说明宽度超出
              setEllipsisOnLastLine(lines);
            }
          }
        } else {
          lines.push(text);
        }
        break;
      case 'pre-line':
        lines = text.split(/[\n]/g);
        if (pen.ellipsis !== false && lines.length > maxRows) {
          lines = lines.slice(0, maxRows);
          setEllipsisOnLastLine(lines);
        }
        break;
      case 'break-all':
      default:
        const paragraphs = text.split(/[\n]/g);
        let currentRow = 0;
        outer: for (const paragraph of paragraphs) {
          const words =
            pen.whiteSpace === 'break-all'
              ? paragraph.split('')
              : getWords(paragraph);
          let items = wrapLines(words, pen);
          // 空行换行的情况
          if (items.length === 0) items = [''];
          if (pen.ellipsis != false) {
            for (const l of items) {
              currentRow++;
              if (currentRow > maxRows) {
                setEllipsisOnLastLine(lines);
                break outer;
              } else {
                lines.push(l);
              }
            }
          } else {
            lines.push(...items);
          }
        }
        break;
    }
  } else{
    if(pen.direction == 'vertical') {
      // const words = getWords(pen.text);
      // let items = wrapLines(words, pen);
      // // 空行换行的情况
      // if (items.length === 0) items = [''];
      //   lines.push(...items);
      lines = pen.text.split('');
    } else {
      lines.push(text);
    }
  }
  const keepDecimal = pen.calculative.keepDecimal;
  if (keepDecimal != undefined) {
    lines.forEach((text, i) => {
      const textNum = Number(text);
      if (!isNaN(textNum)) {
        lines[i] = textNum.toFixed(keepDecimal);
      }
    });
  }

  pen.calculative.textLines = lines;

  return lines;
}

export function getWords(txt: string = '') {
  const words: string[] = [];
  let word = '';
  for (let i = 0; i < txt.length; ++i) {
    const ch = txt.charCodeAt(i);
    if (ch < 33 || ch > 126) {
      if (word) {
        words.push(word);
        word = '';
      }
      words.push(txt[i]);
    } else {
      word += txt[i];
    }
  }

  if (word) {
    words.push(word);
  }

  return words;
}

export function wrapLines(words: string[], pen: Pen) {
  const canvas: Canvas = pen.calculative.canvas;
  const ctx = canvas.offscreen.getContext('2d') as CanvasRenderingContext2D;
  const { fontStyle, fontWeight, fontSize, fontFamily, lineHeight } =
    pen.calculative;
  ctx.save();
  const lines: string[] = [];
  let currentLine = words[0] || '';
  for (let i = 1; i < words.length; ++i) {
    const word = words[i] || '';
    const text = currentLine + word;
    let currentWidth = 0;
    if (canvas.store.options.measureTextWidth) {
      ctx.font = getFont({
        fontStyle,
        fontWeight,
        fontFamily: fontFamily || canvas.store.options.fontFamily,
        fontSize,
        lineHeight,
      });
      currentWidth = ctx.measureText(text).width;
    } else {
      // 近似计算
      const chinese = text.match(/[^\x00-\xff]/g) || '';
      const chineseWidth = chinese.length * fontSize; // 中文占用的宽度
      const spaces = text.match(/\s/g) || '';
      const spaceWidth = spaces.length * fontSize * 0.3; // 空格占用的宽度
      const otherWidth =
        (text.length - chinese.length - spaces.length) * fontSize * 0.6; // 其他字符占用的宽度
      currentWidth = chineseWidth + spaceWidth + otherWidth;
    }
    const textWidth = pen.calculative.worldTextRect.width;
    if (currentWidth <= textWidth) {
      currentLine += word;
    } else {
      currentLine.length && lines.push(currentLine);
      currentLine = word;
    }
  }
  currentLine.length && lines.push(currentLine);
  ctx.restore();
  return lines;
}

export function calcTextAdaptionWidth(
  ctx: CanvasRenderingContext2D,
  pen: Pen
): number {
  let maxWidth = 0;
  pen.calculative.textLineWidths = [];
  pen.calculative.textLines.forEach((text: string) => {
    const width = ctx.measureText(text).width;
    pen.calculative.textLineWidths.push(width);
    maxWidth < width && (maxWidth = width);
  });
  return maxWidth;
}
/**
 * 副作用函数，会修改传入的参数
 * 把最后一行的最后变成 ...
 * TODO: 中文的三个字符宽度比 . 大，显示起来像是删多了
 * @param lines
 */
function setEllipsisOnLastLine(lines: string[]) {
  lines[lines.length - 1] = lines[lines.length - 1].slice(0, -3) + '...';
}
