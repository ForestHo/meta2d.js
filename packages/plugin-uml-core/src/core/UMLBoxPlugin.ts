import { disconnectLine, connectLine, deepClone, setLifeCycleFunc, Pen, Point, EditType, Meta2d } from "@meta2d/core";
import { UMLBox } from "./UMLBox";

declare const meta2d: Meta2d;


export const UMLBoxPlugin = {
  name: 'umlBox',
  timer: null,
  install: (() => {
    let addCallBack: any = null;
    return (pen, options) => {
      // console.log('install UMLBoxPlugin2');
      // console.log('install umlBox', pen, options, meta2d.canvas.externalElements.parentElement);
      let umlbox: any = (window as any).umlbox;
      if (!umlbox) {
        umlbox = new UMLBox(meta2d.canvas.externalElements.parentElement, options);
        (window as any).umlbox = umlbox;
      }
      // console.log('pen.tag',pen.tag);
      if (pen.tag !== 'umlNode') {
        return
      }
      // 避免多次安装的重复订阅
      if (typeof addCallBack === 'function') {
        meta2d.off('add', addCallBack);
      }
      addCallBack = (pens: any) => {
        let pen = pens[0];
        if (pen.tag === 'umlNode') {
          UMLBoxPlugin.combineUMLBox(pen);
        }
      }
      meta2d.on('add', addCallBack);
      
      const addNode = (param: any) => {
       
        // console.log('plugin:umlBox:addNode', param);
        if (param.plugin === 'umlBox') {
          meta2d.canvas.makePen(param.p);
          const pen = umlbox.getPen();
          const toPen = meta2d.find(param.p.id)[0];
          // console.log('addNode', pen, toPen);
          const p1 = meta2d.connectLine(
            pen,
            toPen)
          p1.toArrow = "triangleSolid";
          meta2d.render();
          if(param.p.tag === 'umlNode') {
            UMLBoxPlugin.combineUMLBox(toPen);
          }
          (window as any).umlbox.translateWithPen(toPen);
          meta2d.active([toPen]);
          if(toPen.undone) {
            toPen.onAdd(toPen);
          }
        }
      }
      meta2d.on("plugin:umlBox:addNode", addNode)
      const onScale = (param: any) => {
        if(UMLBoxPlugin.timer){
          umlbox.hide();
          umlbox.hideMenu();
          clearTimeout(UMLBoxPlugin.timer);
        }
        UMLBoxPlugin.timer = setTimeout(() => {
          // console.log('onScalexxxxxx');
          umlbox.show();
          umlbox.translateWithPen(meta2d.store.active[0]);
        }, 1000);
      }
      meta2d.on('scale', onScale);
    }
  })(),
  combineUMLBox(target: any) {
    let umlbox = (window as any).umlbox;

    const onMouseEnter = (targetPen: any) => {
      if(UMLBoxPlugin.timer){
        clearTimeout(UMLBoxPlugin.timer);
      }
      UMLBoxPlugin.timer = setTimeout(() => {
        umlbox.bindPen(targetPen);
        umlbox.setMenuList(targetPen.menus);
        umlbox.translateWithPen(targetPen);
        umlbox.show();
      }, 1000);
   
    }
    const onAdd = (targetPen: any) => {
      // console.log('onAdd22222', targetPen);
    }
    const onResize = (targetPen: any) => {
      umlbox.hide();
      umlbox.hideMenu();
    }
    const onDestroy = (targetPen: any) => {
      // console.log('onDestroy22222', targetPen);
    }
    const onMouseLeave = (targetPen: any) => {
      if(UMLBoxPlugin.timer){
        clearTimeout(UMLBoxPlugin.timer);
      }
      umlbox.hide();
      umlbox.hideMenu();
    }
    const onMouseMove = (targetPen: any) => {
      // console.log('onMouseMove',  );
      // umlbox.translateWithPen(targetPen);
    }
    const onMove = (targetPen: any) => {
      // console.log('onMove');
      if(UMLBoxPlugin.timer){
        clearTimeout(UMLBoxPlugin.timer);
      }
      umlbox.translateWithPen(targetPen);
      // umlbox.hide();
      // umlbox.hideMenu();
    }

    // console.log(target, 'target');
    setLifeCycleFunc(target, 'onAdd', onAdd);
    setLifeCycleFunc(target, 'onDestroy', onDestroy);
    setLifeCycleFunc(target, 'onMove', onMove);
    setLifeCycleFunc(target, 'onMouseMove', onMouseMove);
    setLifeCycleFunc(target, 'onResize', onResize);
    setLifeCycleFunc(target, 'onMouseEnter', onMouseEnter);
    setLifeCycleFunc(target, 'onMouseLeave', onMouseLeave);
  }
}