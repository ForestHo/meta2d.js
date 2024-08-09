import { s8 } from "@meta2d/core";
import { svgShapes, shapeDatas } from '../config'
enum DIRECTION {
  TOP = 'top',
  RIGHT = 'right',
  BOTTOM = 'bottom',
  LEFT = 'left'
}
const direction = [DIRECTION.TOP, DIRECTION.RIGHT, DIRECTION.BOTTOM, DIRECTION.LEFT];
const arrowW = 20, arrowH = 20, offset = 20, menuOffset = 20, menuItemW = 40, menuH = 40, nextGap = 60;
const arrowL = `<svg t="1722493719361" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="12953" width="200" height="200"><path d="M614.228 713.348l0.151-402.664c0.006-14.139-11.451-25.605-25.59-25.61a25.6 25.6 0 0 0-16.398 5.934L330.792 492.34c-10.861 9.05-12.329 25.193-3.277 36.055a25.6 25.6 0 0 0 3.271 3.273L572.234 733c10.858 9.054 27.001 7.592 36.056-3.267a25.6 25.6 0 0 0 5.938-16.385z" fill="#1296db" p-id="12954"></path></svg>`
const arrowT = `<svg t="1722493687664" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="11955" width="200" height="200"><path d="M713.348 614.228l-402.664 0.151c-14.139 0.006-25.605-11.451-25.61-25.59a25.6 25.6 0 0 1 5.934-16.398L492.34 330.792c9.05-10.861 25.193-12.329 36.055-3.277a25.6 25.6 0 0 1 3.273 3.271L733 572.234c9.054 10.858 7.592 27.001-3.267 36.056a25.6 25.6 0 0 1-16.385 5.938z" fill="#1296db" p-id="11956"></path></svg>`
const arrowB = `<svg t="1722493660435" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="11769" width="200" height="200"><path d="M713.348 409.772l-402.664-0.151c-14.139-0.006-25.605 11.451-25.61 25.59a25.6 25.6 0 0 0 5.934 16.398L492.34 693.208c9.05 10.861 25.193 12.329 36.055 3.277a25.6 25.6 0 0 0 3.273-3.271L733 451.766c9.054-10.858 7.592-27.001-3.267-36.056a25.6 25.6 0 0 0-16.385-5.938z" fill="#1296db" p-id="11770"></path></svg>`
const arrowR = `<svg t="1722493615601" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="11480" width="200" height="200"><path d="M409.772 713.348l-0.151-402.664c-0.006-14.139 11.451-25.605 25.59-25.61a25.6 25.6 0 0 1 16.398 5.934L693.208 492.34c10.861 9.05 12.329 25.193 3.277 36.055a25.6 25.6 0 0 1-3.271 3.273L451.766 733c-10.858 9.054-27.001 7.592-36.056-3.267a25.6 25.6 0 0 1-5.938-16.385z" fill="#1296db" p-id="11481"></path></svg>`
const arrowList = [arrowT, arrowR, arrowB, arrowL];
const FullOpacity = '1', HalfOpacity = '0.5';
export class UMLBox {
  static instance: UMLBox;
  parentHtml: HTMLElement;
  box: HTMLElement = document.createElement('div');
  menu: HTMLElement = document.createElement('div');
  arrow: HTMLElement[] = [];
  boxDom: any;
  menuList: any[] = [];
  hoverDirection: string = '';
  boxRect: any = {};
  pen:any = null;
  constructor(parentHtml: HTMLElement, config = {}) {
    if (!UMLBox.instance) {
      UMLBox.instance = this;
      this.parentHtml = parentHtml;
      this.init();
      this.parentHtml.appendChild(this.box);
      this.parentHtml.appendChild(this.menu);
    }
    return UMLBox.instance;
  }
  init() {
    this.box.id = 'uml-box';
    this.menu.id = 'uml-menu';
    const leaveFunc = (e: any) => {
      const className = e.target.className;
      if (className.indexOf(DIRECTION.TOP) > -1) {
        this.arrow[0].style.opacity = HalfOpacity;
      } else if (className.indexOf(DIRECTION.RIGHT) > -1) {
        this.arrow[1].style.opacity = HalfOpacity;
      } else if (className.indexOf(DIRECTION.BOTTOM) > -1) {
        this.arrow[2].style.opacity = HalfOpacity;
      } else if (className.indexOf(DIRECTION.LEFT) > -1) {
        this.arrow[3].style.opacity = HalfOpacity;
      }
    }
    const func = (e: any) => {
      const rect = {
        x: 0,
        y: 0,
        width: 0,
        height: 0
      }
      let menuW = this.menuList.length * menuItemW;
      const className = e.target.className;
      const w = this.boxRect.width;
      const h = this.boxRect.height;
      const x = this.boxRect.x;
      const y = this.boxRect.y;
      if (className.indexOf(DIRECTION.TOP) > -1) {
        rect.x = x + (w / 2) - (menuW / 2);
        rect.y = y - menuH - menuOffset;
        rect.width = menuW;
        rect.height = menuH;
        this.arrow[0].style.opacity = FullOpacity;
        this.menu.children[0].style.flexDirection = 'row';
        this.hoverDirection = DIRECTION.TOP;
      } else if (className.indexOf(DIRECTION.RIGHT) > -1) {
        rect.x = x + w + menuOffset;
        rect.y = y + (h / 2) - menuW / 2;
        rect.width = menuH;
        rect.height = menuW;
        this.arrow[1].style.opacity = FullOpacity;
        this.menu.children[0].style.flexDirection = 'column';
        this.hoverDirection = DIRECTION.RIGHT;
      } else if (className.indexOf(DIRECTION.BOTTOM) > -1) {
        rect.x = x + (w / 2) - (menuW / 2);
        rect.y = y + h + menuOffset;
        rect.width = menuW;
        rect.height = menuH;
        this.arrow[2].style.opacity = FullOpacity;
        this.menu.children[0].style.flexDirection = 'row';
        this.hoverDirection = DIRECTION.BOTTOM;
      } else if (className.indexOf(DIRECTION.LEFT) > -1) {
        rect.x = x - menuH - menuOffset;
        rect.y = y + (h / 2) - (menuW / 2);
        rect.width = menuH;
        rect.height = menuW;
        this.arrow[3].style.opacity = FullOpacity;
        this.menu.children[0].style.flexDirection = 'column';
        this.hoverDirection = DIRECTION.LEFT;
      }
      this.showMenu();
      this.traslateMenuPosition(rect);
      // console.log('rect', e.target.className);
    }
    const fragment = new DocumentFragment();
    for (let i = 0; i < 4; i++) {
      const arrow = document.createElement('div');
      arrow.innerHTML = arrowList[i];
      arrow.className = 'uml-box-arrow ' + direction[i];
      arrow['onmouseenter'] = func;
      arrow['onmouseleave'] = leaveFunc;
      this.arrow.push(arrow);
      fragment.appendChild(arrow);
    }
    this.box.appendChild(fragment);

    const menuFunc = (e: any) => {
      // console.log('menuFunc', e);
      this.showMenu();
    }
    const menuLeaveFunc = (e: any) => {
      // console.log('menuLeaveFunc', e);
      this.hideMenu();
    }
    this.menu['onmouseenter'] = menuFunc;
    this.menu['onmouseleave'] = menuLeaveFunc;

    const clickMenuFunc = (e: any) => {
      const key = e.target.dataset.key;
      // console.log('clickMenuFunc', key, e);
      const id = s8();
      const p = {
        name: key,
        x: 0,
        y: 0,
        id,
      };
      Object.assign(p, shapeDatas[key]);
      const w = this.boxRect.width;
      const h = this.boxRect.height;
      const x = this.boxRect.x;
      const y = this.boxRect.y;
      if (this.hoverDirection === DIRECTION.TOP) {
        p.x = x + (w / 2) - (p.width / 2);
        p.y = y - p.height - nextGap;
      } else if (this.hoverDirection === DIRECTION.RIGHT) {
        p.x = x + w + nextGap;
        p.y = y + (h / 2) - p.height / 2;
      } else if (this.hoverDirection === DIRECTION.BOTTOM) {
        p.x = x + (w / 2) - (p.width / 2);
        p.y = y + h + nextGap;
      } else if (this.hoverDirection === DIRECTION.LEFT) {
        p.x = x - p.width - nextGap;
        p.y = y + (h / 2) - p.height / 2;
      }
      meta2d.emit('plugin:umlBox:addNode', { plugin: 'umlBox', p });
      this.hideMenu();
    }
    const menuContainer = document.createElement('div');
    menuContainer.className = 'uml-menu-container';
    menuContainer['onclick'] = clickMenuFunc;
    menuContainer.style.width = '100%';
    menuContainer.style.height = '100%';
    this.menu.appendChild(menuContainer);

    const style = document.createElement('style');
    style.type = 'text/css';
    document.head.appendChild(style);
    let stylesheet = style.sheet;
    stylesheet.insertRule(`
      #uml-box{
        display:none;
        position: absolute;
        top:0;
        left:0;
        width:0;
        height:0;
        z-index:9999;
      }`);
    stylesheet.insertRule(`
      #uml-menu{
        display:none;
        position: absolute;
        top:0;
        left:0;
        width:0px;
        height:0px;
        background: #fff;
        border-radius: 8px;
        box-shadow: 0px 6px 20px rgba(25,25,26,.06), 0px 2px 12px rgba(25,25,26,.04);
        z-index:9999;
      }`);
    stylesheet.insertRule(`
      .uml-menu-container{
        display:flex;
        align-items:center;
        justify-content:center;
      }`);
    stylesheet.insertRule(`
      .uml-menu-item{
        width:100%;
        height:100%;
      }`);
    stylesheet.insertRule(`
      .uml-menu-item svg{
        width: 32px;
        height: 32px;
      }`);
    stylesheet.insertRule(`
    .uml-box-arrow svg{
      width:100%;
      height:100%;
    }`);
    stylesheet.insertRule(`
    .uml-box-arrow.top{
      width:20px;
      height:20px;
      position: absolute;
      top:0;
      left:0;
      opacity:0.5;
      z-index:10000;
    }`);
    stylesheet.insertRule(`
    .uml-box-arrow.right{
      width:20px;
      height:20px;
      position: absolute;
      top:0;
      right:0;
      opacity:0.5;
      z-index:10000;
    }`);
    stylesheet.insertRule(`
    .uml-box-arrow.bottom{
      width:20px;
      height:20px;
      position: absolute;
      left:0;
      bottom:0;
      opacity:0.5;
      z-index:10000;
    }`);
    stylesheet.insertRule(`
    .uml-box-arrow.left{
      width:20px;
      height:20px;
      position: absolute;
      top:0;
      left:0;
      opacity:0.5;
      z-index:10000;
    }`);
  }
  renderMenuList() {
    const fragment = new DocumentFragment();
    this.menu.children[0].innerHTML = '';
    this.menuList.forEach((item, index) => {
      const d = this.setChildDom();
      d.className = 'uml-menu-item';
      d.dataset.key = item;
      const htmlStr = svgShapes[item];
      if (htmlStr) {
        d.innerHTML = htmlStr;
      }
      fragment.appendChild(d);
    })
    this.menu.children[0].appendChild(fragment);
  }
  setMenuList(list) {
    this.menuList = list || [];
    this.renderMenuList();
  }
  setChildDom() {
    const dom = document.createElement('div');
    return dom;
  }
  bindPen(pen: any) {
    this.pen = pen;
  }
  getPen(){
    return this.pen;
  }
  showMenu() {
    this.menu.style.display = 'flex';
  }
  hideMenu() {
    this.menu.style.display = 'none';
  }
  show() {
    this.box.style.display = 'flex';
  }
  hide() {
    this.box.style.display = 'none';
  }
  translateWithPen(pen: any) {
    // console.log('translateWithPen');
    if (!pen) {
      pen = this.pen;
    }
    const store = pen.calculative.canvas.store;
    const worldRect = pen.calculative.worldRect;
    const pos = {
        x: worldRect.x + store.data.x,
        y: worldRect.y + store.data.y,
        width: worldRect.width,
        height: worldRect.height
    }
    this.traslatePosition(pos);
  }
  traslatePosition(pos: any) {
    // this.hide();
    this.box.style.left = pos.x + 'px';
    this.box.style.top = pos.y + 'px';
    this.boxRect.x = pos.x;
    this.boxRect.y = pos.y;
    this.boxRect.width = pos.width;
    this.boxRect.height = pos.height;
    // top
    this.arrow[0].style.left = (pos.width / 2 - arrowW / 2) + 'px';
    this.arrow[0].style.top = -offset + 'px';
    // right
    this.arrow[1].style.right = -pos.width + (-offset) + 'px';
    this.arrow[1].style.top = (pos.height / 2 - arrowH / 2) + 'px';
    // bottom
    this.arrow[2].style.bottom = -pos.height + (-offset) + 'px';
    this.arrow[2].style.left = (pos.width / 2 - arrowW / 2) + 'px';
    // left
    this.arrow[3].style.left = -offset + 'px';
    this.arrow[3].style.top = (pos.height / 2 - arrowH / 2) + 'px';
    // this.show();
  }
  traslateMenuPosition(pos: any) {
    this.menu.style.left = pos.x + 'px';
    this.menu.style.top = pos.y + 'px';
    this.menu.style.width = pos.width + 'px';
    this.menu.style.height = pos.height + 'px';
  }
}