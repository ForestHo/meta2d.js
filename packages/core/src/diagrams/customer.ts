import { Pen } from '../pen';
import { s8 } from '../utils';

export function customer(pen: Pen, ctx?: CanvasRenderingContext2D): Path2D {
  console.log('hello',pen.url);
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
  console.log('onadd')
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
            if (Object.prototype.hasOwnProperty.call(elem.properties, key)) {
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
      const meta2d = pen.calculative.canvas.parent;
      pen.width = res.width;
      pen.height = res.height;
      for (let i = 0; i < res.properties.length; i++) {
        const item = res.properties[i];
        item.value = item.defaultValue;
      }
      pen.properties = {
        extend: res.properties
      };
      pen.children = child;
    }).catch(err => {
      console.log(err);
    })
}
function onDestroy(pen: Pen) {

}
function onValue(pen: any) {
  console.log('onvalue')
  updatePen(pen);
}
function updatePen(pen: Pen){
  const meta2d = pen.calculative.canvas.parent;
  console.log(meta2d,'meta2d');
  for (let i = 0; i < pen.children.length; i++) {
    const cId = pen.children[i];
    const child = meta2d.find(cId);
    console.log('child', child,cId,meta2d.store.data.pens.length);
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
          const obj = { id: child[0].id, [k]: exs.value };
          meta2d.setValue(obj, { render: false, doEvent: false });
        }
      }
    }
  }
}