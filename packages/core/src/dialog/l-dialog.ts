import Hammer from 'hammerjs';
import { Pen } from '../pen';
import { Event } from '../event';
interface StyleConfig {
  dialogBg: string;
  headBg: string;
  headColor: string;
  headFontSize: number;
  bodyBg: string;
  bodyColor: string;
  bodyFontSzie: string;
  footerBg: string;
  footerFontSize: string;
  cancelBtnBg: string;
  confirmBtnBg: string;
  cancelBtnColor: string;
  confirmBtnColor: string;
  borderWidth: number;
  borderColor: string;
}
let style;
export const registerDialogStyle = () => {
  style = document.createElement('style');
  style.type = 'text/css';
  document.head.appendChild(style);
  style.innerHTML = `
    .dialog_mask {
      position: fixed;inset:0;
      background-color: #0000006f;
      z-index: 9999;
    }
    .default_dialog {
      position: absolute;
      border-radius: 10px;
      z-index: 19999;
      display: flex;
      flex-direction: column;
      background-color: #fff;
      user-select: none;
      overflow:hidden;
      border-style: solid;
    }
    .default_dialog head {
      display: flex;
      justify-content: space-between;
      font-weight: 600;
      font-size: 20px;
      cursor: move;
      padding: 10px;
      background-color:#f3f3f3;
    }
    .default_dialog head .dialog_title{
      max-width:90%;
      text-overflow:ellipsis;
      white-space:noramp;
      overflow:hidden;
    }
    .default_dialog head .close_btn{
      cursor: pointer;
      font-size: 20px;
    }
    .default_dialog footer {
      display: flex;
      justify-content: center;
      justify-content: space-around;
      padding: 10px;
      background-color: #f3f3f3;
    }
    .default_dialog footer .btn {
      padding: 5px 10px;
      border: none;
      border-radius: 5px;
      cursor: pointer;
    }
    .default_dialog footer .cancel-btn {
      background-color: #ff4d4f;
      color: #fff;
    }
    .default_dialog footer .confirm-btn {
      background-color: #409eff;
      color: #fff;
    }
    .default_dialog iframe {
      flex: 1;
      border:none;
    }
    .default_dialog .confirm_tip {
      flex: 1;
      display:flex;
      justify-content:center;
      align-items: center;
      min-height:50px;
    }
    .default_dialog .value_input {
      display: flex;
      flex-direction: column;
      padding: 10px;
      font-size: 20px;
      flex: 1;
    }
    .default_dialog .value_input-screen{
      width: 100%;
      margin-bottom: 10px;
      border: 1px solid #ccc;
      border-radius: 3px;
      padding-inline: 10px;
      min-height: 50px;
      word-break:break-all;
      line-height: 1.5;
    }
    .default_dialog .value_input-btnbox{
      display: grid;
      grid-template-columns:auto auto auto auto;
      gap: 10px;
      height: 100%;
    }
    .default_dialog .value_input-btn{
      border: 1px solid #ccc;
      border-radius: 3px;
      background-color: #f9f9f9;
      cursor: pointer;
      text-align: center;
    }
    .default_dialog .value_input-btn:active{
      background-color: #e9e9e9;
    }
    .default_dialog .value_input-btn.confirm{
      grid-row: span 2;
      display: flex;
      justify-content: center;
      align-items: center;
    }
    `;
};

export class LDialog {
  mask: HTMLElement;
  dialog: HTMLElement;
  hammer: any;
  constructor(pen: Pen, e: Event) {
    try {
      let styleConfig: StyleConfig;
      if (e.style) {
        styleConfig = JSON.parse(e.style);
      }
      // 遮罩
      if (!e.notModal) {
        this.mask = this.createDom(document.body, 'div', `dialog_mask`);
        this.mask.onclick = () => {
          this.destroy(pen);
        };
      }
      // 对话框
      this.dialog = this.createDom(document.body, 'div', `default_dialog`);
      e.id && (this.dialog.id = e.id);
      this.dialog.style.width = `${e.w || 400}px`;
      e.h && (this.dialog.style.height = `${e.h}px`);
      this.dialog.onclick = (e) => {
        e.stopPropagation();
      };
      this.creteHeader(pen, e, styleConfig);
      this.createContent(pen, e, styleConfig);
      const { width, height } = this.dialog.getBoundingClientRect();
      this.dialog.style.left = `${e.x || (window.innerWidth - width) / 2}px`;
      this.dialog.style.top = `${e.y || (window.innerHeight - height) / 2}px`;
      this.dialog.style.borderWidth = styleConfig.borderWidth == undefined ? `1px`: `${styleConfig.borderWidth}px`;
      this.dialog.style.borderColor = `${styleConfig.borderColor || "#000"}`;
      this.setStyle(this.dialog, styleConfig, ['dialogBg']);
      pen.calculative.dialog = this;
    } catch (error) {
      pen.calculative.dialog = null;
      alert('错误！检查下配置是否正确！');
    }
  }
  creteHeader(pen, e, styleConfig) {
    // 头
    let header = this.createDom(this.dialog, 'head');
    this.setStyle(header, styleConfig, ['headBg', 'headColor', 'headFontSize']);
    // 标题
    let title = this.createDom(header, 'span', `dialog_title`);
    title.innerHTML = e.title || '';
    this.drag(header, this.dialog);
    // 关闭按钮
    const closeDom = this.createDom(header, 'span', `close_btn`);
    closeDom.innerHTML = `
      <svg fill="none" viewBox="0 0 16 16" width="1em" height="1em">
      <path
        fill="currentColor"
        d="M8 8.92L11.08 12l.92-.92L8.92 8 12 4.92 11.08 4 8 7.08 4.92 4 4 4.92 7.08 8 4 11.08l.92.92L8 8.92z"
        fill-opacity="0.9"
      ></path>
    </svg>`;
    closeDom.onclick = () => {
      this.destroy(pen);
    };
  }
  createContent(pen, e, styleConfig) {
    // 内容
    if (e.dialogType === 'iframe') {
      const iframeDom = this.createDom(this.dialog, 'iframe');
      const src = (e.iframeSrc || '') + (e.params || '');
      iframeDom.setAttribute('src', src);
    } else if (e.dialogType === 'confirm') {
      const body = this.createDom(this.dialog, 'span', 'confirm_tip');
      body.innerHTML = e.params || '';
      this.createFooter(pen, e, styleConfig);
      this.setStyle(body, styleConfig, ['bodyBg', 'bodyColor', 'bodyFontSzie']);
    } else {
      // 值输入弹窗
      const body = this.createDom(this.dialog, 'div', 'value_input');
      this.setStyle(body, styleConfig, ['bodyBg', 'bodyColor', 'bodyFontSzie']);
      // 创建显示区域
      const screen = this.createDom(body, 'p', 'value_input-screen');
      // 定义按钮文本
      const buttons = [
        ['1', '2', '3', '<-'],
        ['4', '5', '6', 'C'],
        ['7', '8', '9', '确定'],
        ['0', '.', '-'],
      ];
      // 创建按钮
      const buttonContainer = this.createDom(body, 'div', 'value_input-btnbox');
      buttons.forEach((row) => {
        row.forEach((text) => {
          let button = this.createDom(
            buttonContainer,
            'div',
            'value_input-btn'
          );
          button.innerText = text;
          if (text === '确定') {
            button.classList.add('confirm');
          }
          // 添加按钮交互
          button.addEventListener('click', () => {
            if (text === '确定') {
              // 这里可以添加确定按钮的逻辑，例如计算结果
              e.ok && new Function('pen', 'value', e.ok)(pen, screen.innerText);
              this.destroy(pen);
            } else if (text === 'C') {
              screen.innerText = '';
            } else if (text === '<-') {
              screen.innerText = screen.innerText.slice(0, -1);
            } else {
              screen.innerText += text;
            }
          });
        });
      });
    }
  }
  createFooter(pen, e, styleConfig) {
    let footer = this.createDom(this.dialog, 'footer');
    this.setStyle(footer, styleConfig, ['footerBg', 'footerFontSize']);
    // 取消按钮
    let cancel = this.createDom(footer, 'button', `btn cancel-btn`);
    this.setStyle(cancel, styleConfig, ['cancelBtnBg', 'cancelBtnColor']);
    cancel.innerText = e.cancelText || '取消';
    cancel.onclick = () => {
      let fn = null;
      e.cancel && (fn = new Function('pen', e.cancel));
      fn && fn(pen);
      this.destroy(pen);
    };
    // 确定按钮
    let ok = this.createDom(footer, 'button', `btn confirm-btn`);
    this.setStyle(ok, styleConfig, ['confirmBtnBg', 'confirmBtnColor']);
    ok.innerText = e.confirmText || '确定';
    ok.onclick = () => {
      let fn = null;
      e.ok && (fn = new Function('pen', e.ok));
      fn && fn(pen);
      this.destroy(pen);
    };
  }
  drag(dragDom: HTMLElement, moveDom: HTMLElement) {
    let x, y;
    dragDom.onmousedown = (e) => {
      const { left, top } = moveDom.getBoundingClientRect();
      x = left;
      y = top;
    };
    this.hammer = new Hammer(dragDom);
    this.hammer.on('panmove', (event) => {
      moveDom.style.top = y + event.deltaY + 'px';
      moveDom.style.left = x + event.deltaX + 'px';
    });
  }
  createDom(parentElement: HTMLElement, tag: string, className?: string) {
    let dom = document.createElement(tag);
    className && (dom.className = className);
    parentElement.appendChild(dom);
    return dom;
  }
  setStyle(dom: HTMLElement, config: StyleConfig, keys: string[]) {
    if (!config) return;
    keys.forEach((key) => {
      if (key.endsWith('Bg') && config[key]) {
        dom.style.backgroundColor = config[key];
      } else if (key.endsWith('Color') && config[key]) {
        dom.style.color = config[key];
      } else if (config[key]) {
        dom.style.fontSize = config[key] + 'px';
      }
    });
  }
  destroy(pen: Pen) {
    this.mask?.remove();
    this.dialog?.remove();
    this.mask = null;
    this.dialog = null;
    this.hammer.destroy();
    pen.calculative.dialog = null;
  }
}
