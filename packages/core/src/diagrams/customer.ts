import { Pen } from '../pen';
import { s8 } from '../utils';

export function customer(pen: Pen, ctx?: CanvasRenderingContext2D): Path2D {
  // console.log('hello',pen.url);
  if (!pen.onDestroy) {
    pen.onDestroy = onDestroy;
    pen.onAdd = onAdd;
    pen.onValue = onValue;
    pen.onRenderPenRaw = onRenderPenRaw;
  }
  const path = !ctx ? new Path2D() : ctx;
  updatePen(pen);
  if (path instanceof Path2D) {
    return path;
  }
}
function onRenderPenRaw(pen: Pen) {
}
function onAdd(pen: Pen) {
  // console.log('onadd')
  const meta2d = pen.calculative.canvas.parent;
  let parentId = pen.id, child = [];
  fetch((pen as any).url)
    .then(response => response.json())
    .then(res => {
      for (let i = 0; i < res.components.length; i++) {
        const elem = res.components[i];
        if (elem.name === 'combine') {
          continue;
        } else {
          elem.parentId = parentId;
          elem.id = s8();
          for (const key in elem.properties) {
            if (Object.prototype.hasOwnProperty.call(elem.properties, key) && key !== 'extend') {
              const value = elem.properties[key];
              for (const k in value) {
                if (Object.prototype.hasOwnProperty.call(value, k)) {
                  const v = value[k];
                  elem[k] = v;
                }
              }
            }
          }
          child.push(elem.id);
        }
        pen.calculative.canvas.makePen(elem);
        pen.calculative.canvas.parent.pushChildren(pen, [elem]);
      }
      const rect = pen.calculative.canvas.reversePenRect({x:0,y:0,width:res.width,height:res.height});
      pen.width = rect.width;
      pen.height = rect.height;
      for (let i = 0; i < res.properties.length; i++) {
        const item = res.properties[i];
        item.value = item.defaultValue;
      }
      pen.properties = {
        extend: res.properties
      };
      // 根据extend的数据，初始化databinds的数据
      const arr = [];
      for (let i = 0; i < res.properties.length; i++) {
        const item = res.properties[i];
        const obj = {
          source: { dataId: '', name: '' },
          target: item.attr,
          function: null
        };
        arr.push(obj);
      }
      pen.databindings = arr;
      pen.children = child;
      pen.calculative.canvas.updatePenRect(pen);
    }).catch(err => {
      console.log(err);
    })
}
function onDestroy(pen: Pen) {

}
function onValue(pen: any) {
  // console.log('onvalue')
  updatePen(pen);
}
function updatePen(pen: Pen){
  const meta2d = pen.calculative.canvas.parent;
  for (let i = 0; i < pen.children.length; i++) {
    const cId = pen.children[i];
    const child = meta2d.find(cId);
    if(!child[0]) continue;
    for (let j = 0; j < child[0].propBindings.length; j++) {
      const bis = child[0].propBindings[j];
      const ks = Object.keys(bis);
      const vs = Object.values(bis);
      for (let n = 0; n < ks.length; n++) {
        const k = ks[n];
        const id = vs[n].func.split('@')[1];
        const exs = pen.properties.extend.find(el=>el.attr === id);
        if(exs){
          const obj = { id: child[0].id };
          if(!child[0][k] || k === 'text'){
            const index = child[0].properties.extend.findIndex(el=>el.attr === k);
            if(index !== -1){
              Object.assign(obj, { ['properties.extend.'+index+'.value']: exs.value });
            }
            if(k === 'text'){
              Object.assign(obj, { ['text']: exs.value });
            }
          }else{
            Object.assign(obj, { [k]: exs.value });
          }
          meta2d.setValue(obj, { render: false, doEvent: false });
        }
      }
    }
  }
}