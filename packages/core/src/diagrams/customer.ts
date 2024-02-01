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
  // 初始渲染的时候,需要根据数据去更新pen的外观
  updatePen(pen);
  if (path instanceof Path2D) {
    return path;
  }
}
function onRenderPenRaw(pen: Pen) {
}
function onAdd(pen: Pen) {
  let parentId = pen.id, child = [];
  // 根据pen的url,获取自定义控件的JSON数据
  fetch((pen as any).url)
    .then(response => {
      try {
        return response.json()
      } catch (error) {
        throw new Error(error);
      }
    })
    .then(res => {
      res.meta && res.data && (res = res.data)
      for (let i = 0; i < res.pens.length; i++) {
        const elem = res.pens[i];
        // 如果name=combine，跳过
        if (elem.name === COMBINE) {
          continue;
        } else {
          // 指定子图元的parentId为当前pen的id
          elem.parentId = parentId;
          elem.customerId = `${elem.id}`;
          // 生成新的子图元id,避免拖拽多个自定义控件,子图元id重复
          elem.id = s8();
          // 将extend的数据，赋值给子图元的一级属性
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
          // 收集子图元的id
          child.push(elem.id);
        }
        // 设置子pen的属性值
        if (pen.properties && pen.properties.extend && pen.properties.extend.length > 0) {
          for (let j = 0; j < elem.propBindings.length; j++) {
            const pb = elem.propBindings[j];
            const exs = pen.properties.extend.find(el => el.attr === pb.src);
            if (pb.type === EXTEND) {
              if (elem.properties.extend.find(el => el.attr === pb.target)) {
                elem.properties.extend.find(el => el.attr === pb.target).value = exs.value;
              }
            }
          }
        }
        pen.calculative.canvas.makePen(elem);
        // 将子pen添加到父pen的children字段
        pen.calculative.canvas.parent.pushChildren(pen, [elem]);
      }
      // 根据自定义控件的宽高,换算成画布坐标系的宽高
      if (!pen.properties || !pen.properties.extend || pen.properties.extend.length == 0) {
      const rect = pen.calculative.canvas.reversePenRect({ x: 0, y: 0, width: res.width, height: res.height });
      pen.width = rect.width;
      pen.height = rect.height;
      }
      
      for (let i = 0; i < res.properties.length; i++) {
        const item = res.properties[i];
        item.value = item.defaultValue;
      }
      // 将properties赋值给当前pen的properties的extend字段
      if (!pen.properties || !pen.properties.extend || pen.properties.extend.length == 0) {
      pen.properties = {
        extend: res.properties
      };
      }
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
      // 将收集到的子图元的id，赋值给pen的children字段
      pen.children = child;
      // 根据最新的宽高，更新pen的rect
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
  // 父图元的属性变化,更新子图元绑定的属性
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
            // extend是一个数组,所以更新路径为properties.extend.${index}.value
            const index = child[0].properties.extend.findIndex(el => el.attr === pb.target);
            if (index !== -1) {
              Object.assign(obj, { [`${PROPERTIES}${DOT}${pb.type}${DOT}` + index + DOT + VALUE]: exs.value });
            }
          } else {
            // properties的其他属性,走以下更新路径,如properties.basic.width
            Object.assign(obj, { [PROPERTIES + DOT + pb.type + DOT + pb.target]: exs.value });
          }
          // text属性,更新路径为一级属性
          if (pb.target === TEXT) {
            Object.assign(obj, { [TEXT]: exs.value });
          }
        } else {
          // default默认属性走一级属性的更新路径
          Object.assign(obj, { [pb.target]: exs.value });
        }
        meta2d.setValue(obj, { render: false, doEvent: false });
      }
    }
  }
}