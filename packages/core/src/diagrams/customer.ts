import { Pen } from '../pen';
import { s8 } from '../utils';
const EXTEND = 'extend';
const COMBINE = 'combine';
const PROPERTIES = 'properties';
const DOT = '.';
const TEXT = 'text';
const VALUE = 'value';
const DEFAULT = 'default';
export function customer(pen: Pen, ctx?: CanvasRenderingContext2D): Path2D {
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
  let parentId = pen.id, child = [];
  fetch((pen as any).url)
    .then(response => {
      try {
        return response.json()
      } catch (error) {
        throw new Error(error);
      }
    })
    .then(res => {
      for (let i = 0; i < res.pens.length; i++) {
        const elem = res.pens[i];
        if (elem.name === COMBINE) {
          continue;
        } else {
          elem.parentId = parentId;
          elem.id = s8();
          for (const key in elem.properties) {
            if (Object.prototype.hasOwnProperty.call(elem.properties, key) && key !== EXTEND) {
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
      const rect = pen.calculative.canvas.reversePenRect({ x: 0, y: 0, width: res.width, height: res.height });
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
  updatePen(pen);
}
function updatePen(pen: Pen) {
  const meta2d = pen.calculative.canvas.parent;
  for (let i = 0; i < pen.children.length; i++) {
    const cId = pen.children[i];
    const child = meta2d.find(cId);
    if (!child[0]) continue;
    for (let j = 0; j < child[0].propBindings.length; j++) {
      const pb = child[0].propBindings[j];
      const exs = pen.properties.extend.find(el => el.attr === pb.src);
      if (exs) {
        const obj = { id: child[0].id };
        // 除开内置属性的其他属性，更新流程都走properties.extend
        if (pb.type !== DEFAULT) {
          if (pb.type === EXTEND) {
            const index = child[0].properties.extend.findIndex(el => el.attr === pb.target);
            if (index !== -1) {
              Object.assign(obj, { [`${PROPERTIES}${DOT}${pb.type}${DOT}` + index + DOT + VALUE]: exs.value });
            }
          } else {
            Object.assign(obj, { [PROPERTIES + DOT + pb.type + DOT + pb.target]: exs.value });
          }
          if (pb.target === TEXT) {
            Object.assign(obj, { [TEXT]: exs.value });
          }
        } else {
          // 内置属性走一级属性
          Object.assign(obj, { [pb.target]: exs.value });
        }
        meta2d.setValue(obj, { render: false, doEvent: false });
      }
    }
  }
}