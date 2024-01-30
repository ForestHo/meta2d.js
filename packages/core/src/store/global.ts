import pkg from '../../package.json';
import { Pen } from '../pen';

// 全局store，存储一些全局变量，如版本号、path2d绘制函数、canvas绘制函数、锚点函数、html元素等
export const globalStore: {
  version: string;
  path2dDraws: {
    [key: string]: (pen: Pen, ctx?: CanvasRenderingContext2D) => Path2D;
  };
  canvasDraws: {
    [key: string]: (ctx: CanvasRenderingContext2D, pen: Pen) => void;
  };
  anchors: { [key: string]: (pen: Pen) => void }; // TODO: 存储的是 副作用 函数，函数内修改 anchors
  htmlElements: { [key: string]: HTMLImageElement }; // 目前只存在图片资源，此处使用 HTMLImageElement
} = {
  version: pkg.version,
  path2dDraws: {},
  canvasDraws: {},
  anchors: {},
  htmlElements: {},
};

/**
 * @description 注册 path2d 绘制函数
 * @author Joseph Ho
 * @date 29/01/2024
 * @export
 * @param {{
 *   [key: string]: (pen: Pen, ctx?: CanvasRenderingContext2D) => Path2D;
 * }} path2dFns
 */
export function register(path2dFns: {
  [key: string]: (pen: Pen, ctx?: CanvasRenderingContext2D) => Path2D;
}) {
  Object.assign(globalStore.path2dDraws, path2dFns);
}

/**
 * @description 注册 canvas 绘制函数
 * @author Joseph Ho
 * @date 29/01/2024
 * @export
 * @param {{
 *   [key: string]: (ctx: CanvasRenderingContext2D, pen: Pen) => void;
 * }} drawFns
 */
export function registerCanvasDraw(drawFns: {
  [key: string]: (ctx: CanvasRenderingContext2D, pen: Pen) => void;
}) {
  Object.assign(globalStore.canvasDraws, drawFns);
}

/**
 * @description 注册锚点函数
 * @author Joseph Ho
 * @date 29/01/2024
 * @export
 * @param {{
 *   [key: string]: (pen: Pen) => void;
 * }} anchorsFns
 */
export function registerAnchors(anchorsFns: {
  [key: string]: (pen: Pen) => void;
}) {
  Object.assign(globalStore.anchors, anchorsFns);
}
