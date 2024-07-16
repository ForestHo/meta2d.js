
import { Meta2dStore } from '../store';
import { Canvas } from './canvas';
import { createOffscreen } from './offscreen';

export class ColorMonitor {
  canvas = document.createElement('canvas');
  constructor(
    public parentCanvas: Canvas,
    public parentElement: HTMLElement,
    public store: Meta2dStore
  ) {
    parentElement.appendChild(this.canvas);
    this.canvas.style.backgroundRepeat = 'no-repeat';
    // this.canvas.style.backgroundSize = '170px 170px';
    this.canvas.style.position = 'absolute';
    this.canvas.style.top = '24px';
    this.canvas.style.right = '24px';
    this.canvas.style.border = '1px solid black';
    this.canvas.width = 200;
    this.canvas.height = 200;
  }
  render(data) {
    const ctx = this.canvas.getContext('2d');
    ctx.putImageData(data, 0, 0, 0, 0, 200, 200);
    this.renderGrid(ctx);
  }
  renderGrid(
    ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D
  ) {
    // const { data, options } = this.store;
    // const { grid, gridRotate, gridColor, gridSize, scale, origin } = data;
    // if (!(grid ?? options.grid)) {
    //   // grid false 时不绘制, undefined 时看 options.grid
    //   return;
    // }
    let scale = 1;
    let w = 200, h = 200;
    ctx.save();
    const width = w * scale;
    const height = h * scale;
    const startX = 0;
    const startY = 0;
    ctx.lineWidth = 1;
    ctx.strokeStyle = "#ddd";
    ctx.beginPath();
    const size = 8 * scale;
    if (!width || !height) {
      const ratio = 1.5;
      const cW = w / ratio;
      const cH = h / ratio;
      const m = startX / size;
      const n = startY / size;
      const offset = size * 10; //补偿值
      const newX = startX - Math.ceil(m) * size;
      const newY = startY - Math.ceil(n) * size;
      const endX = cW + newX + offset;
      const endY = cH + newY + offset;
      for (let i = newX; i <= endX; i += size) {
        ctx.moveTo(i, newY);
        ctx.lineTo(i, cH + newY + offset);
      }
      for (let i = newY; i <= endY; i += size) {
        ctx.moveTo(newX, i);
        ctx.lineTo(cW + newX + offset, i);
      }
    } else {
      const endX = width + startX;
      const endY = height + startY;
      for (let i = startX; i <= endX; i += size) {
        ctx.moveTo(i, startY);
        ctx.lineTo(i, height + startY);
      }
      for (let i = startY; i <= endY; i += size) {
        ctx.moveTo(startX, i);
        ctx.lineTo(width + startX, i);
      }
    }
    ctx.stroke();
    ctx.restore();
  }
}