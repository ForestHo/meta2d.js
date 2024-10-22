import { movingSuffix } from '../../canvas';
import { Pen, setElemPosition } from '../../pen';
import { Point } from '../../point';
import { rectInRect } from '../../rect';
import { deepClone, debounce } from '../../utils';

const DROPMENU_PREFIX = 'dropmenu_';
const TAG_WRAPPER = 'tag_wrapper_';
const TAG_PREFIX = 'tag_';
const DIV = 'DIV';
export function treeFilter(pen: Pen): Path2D {
  if (!pen.onDestroy) {
    pen.onDestroy = onDestroy;
    pen.onMouseUp = onMouseUp;
    pen.onMouseEnter = onMouseEnter;
    pen.onMouseLeave = onMouseLeave;
    pen.onMove = onMove;
    pen.onResize = resize;
    pen.onAdd = onAdd;
    pen.onRenderPenRaw = renderPenRaw;
  }
  const { x, y, width, height } = pen.calculative.worldRect;
  if (!pen.calculative.singleton) {
    pen.calculative.singleton = {};
  }
  if (!pen.calculative.singleton.div) {
    // 校验修正参数
    validateData(pen);
    //1.创建父容器，用于定位
    const div = document.createElement('div');
    div.style.position = 'absolute';
    div.style.outline = 'none';
    div.style.left = '-9999px';
    div.style.top = '-9999px';
    div.style.width = width + 'px';
    div.style.height = height + 'px';

    // 创建容器
    const container = document.createElement("div");
    container.style.position = 'relative';
    container.style.width = '100%';
    container.style.height = '100%';
    // 输入框
    const input = assembleInputBox(pen);
    container.appendChild(input);
    // 下拉选项
    const dropMenu = document.createElement("div");
    dropMenu.style.position = 'absolute';
    dropMenu.style.left = '0';
    dropMenu.style.top = 'calc(100% + 6px)';
    dropMenu.style.width = '100%';
    dropMenu.style.minHeight = '300px';
    dropMenu.style.background = 'rgba(255, 255, 255, 0.9)';
    dropMenu.style.border = '1px solid #ccc';
    dropMenu.style.borderRadius = '4px';
    dropMenu.className = DROPMENU_PREFIX + pen.id;
    dropMenu.style.display = 'block';
    dropMenu.style.overflow = 'auto';
    // dropMenu.style.pointerEvents = 'initial';
    container.appendChild(dropMenu);

    renderData(pen.data, dropMenu, pen)
    div.appendChild(container);
    // 2.加载到div layer
    pen.calculative.canvas.externalElements?.parentElement.appendChild(div);
    setElemPosition(pen, div);
    pen.calculative.singleton.div = div;
  }
  const path = new Path2D();
  return path;
}
function renderPenRaw(pen: Pen, mkey: string, data: any) {
  const dom = document.querySelector(`div[class^='to__subItem_${mkey}']`);
  dom.className = 'to__subItem_' + mkey + ' to__show';
  generateDomByData(data, dom, pen);
}
function onAdd(pen: Pen) {
  adjustHeight(pen);
}
// 过滤树结构，找到匹配过滤条件的直系亲属树path
function onRecursionData(data, val, paths) {
  for (let i = 0; i < data.length; i++) {
    const item = data[i];
    if (item.label.indexOf(val) > -1) {
      paths.push(item.key);
      // const pa = [];
      // treeFindPath(data, (item) => item.label.indexOf(val) !== -1, 'label',pa);
      // console.log('pa',pa)
    }
    if (item.children?.length > 0) {
      onRecursionData(item.children, val, paths);
    }
  }
}
function treeFindPath(data, func, field, path = []) {
  if (!data) {
    return;
  }
  for (let i = 0; i < data.length; i++) {
    field === "" ? path.push(data[i]) : path.push(data[i][field]);
    if (func(data[i])) return path;
    if (data[i].children) {
      const result = treeFindPath(data[i].children, func, field, path);
      if (result.length) return result;
    }
    path.pop();
  }
  return [];
}
function adjustHeight(pen: Pen) {
  if (pen.calculative.singleton.div) {
    // 判断是否需要调整高度
    const { offsetHeight: h1 } = pen.calculative.singleton.div;
    const { offsetHeight: h2 } = document.getElementsByClassName(`${TAG_WRAPPER}${pen.id}`)[0];
    if (h1 !== h2) {
      pen.height = h2 + 16;
      pen.calculative.canvas.updatePenRect(pen);
    }
  }
}
function assembleInputBox(pen: Pen) {
  const box = document.createElement("div");
  box.style.width = '100%';
  box.style.height = '100%';
  box.style.padding = '0 8px';
  box.style.border = '1px solid #ccc';
  box.style.borderRadius = '4px';
  box.style.background = 'transparent';

  const input = document.createElement("input");
  input.type = "text";
  input.style.width = 'auto';
  input.style.height = 'auto';
  input.style.border = 'none';
  input.readOnly = pen.filterable ? !pen.filterable : true;
  // input.style.outline = 'none';
  // input.style.border = '1px solid #ccc';
  input.style.background = 'transparent';
  input.className = `treefilter-${pen.id}`;
  input.dataset.penId = pen.id;
  input.oninput = debounce(onInputchange, 1000)


  const input_prefix = document.createElement("div");
  input_prefix.style.display = 'inline';
  input_prefix.style.textAlign = 'left';
  input_prefix.className = TAG_WRAPPER + pen.id;

  const frag = document.createDocumentFragment();
  for (let i = 0; i < pen.checked.length; i++) {
    const key = pen.checked[i];
    const title = recursionFindTitle(pen.data, key);
    const e = assembleTag(key, title, pen.id);
    frag.appendChild(e);
  }
  input_prefix.appendChild(frag);
  box.appendChild(input_prefix);

  box.appendChild(input);
  return box;
}
function onInputchange(e) {
  console.log(e.target.value)
  // 过滤树结构
  const paths = [];
  const penId = e.target.dataset.penId;
  const pen = window.meta2d.findOne(penId);
  if (!pen) {
    return;
  }
  onRecursionData(pen.data, e.target.value, paths);
  console.log('paths', paths)
  const dropMenu = document.querySelector(`.${DROPMENU_PREFIX}${pen.id}`);
  updateTree(pen.data, dropMenu, paths)
}
function updateTree(data, dropMenu, paths) {
  traverseByDFS(dropMenu);
  // for (let i = 0; i < data.length; i++) {
  //   const item = data[i];
  //   if(paths.includes(item.key)){
  //     const itemDom = dropMenu.getElementsByClassName(`item-key-${item.key}`)[0];
  //     const itemWrapper = itemDom.getElementsByClassName('to__item_wrapper')[0];
  //     if(itemWrapper.className.indexOf('to__visible') === -1){
  //       itemWrapper.className += ' to__visible';
  //     }
  //   }else{
  //     console.log('item.key',item.key)
  //     const itemDom = dropMenu.getElementsByClassName(`item-key-${item.key}`)[0];
  //     console.log('itemDom',itemDom)
  //     itemDom.className += ' to__hidden';
  //   }
  //   if(item.children?.length > 0){
  //     updateTree(item.children, dropMenu, paths)
  //   }
  // }
}

function traverseByDFS(root) {
  if (!root) {
      root = document.documentElement; // html
  }
  if(root.nodeName !== DIV){
    return
  }
  // console.log(root.nodeName);
  let len = root.children.length;
  for (let i = 0; i < len; i++) {
    console.log(root.children[i].nodeName,root.children[i].className);
    if(root.children[i].nodeName === DIV){
      const classList = root.children[i].className.split(' ');
      if(classList.some((el)=> el.indexOf("to__subItem_") > -1) && classList.indexOf('to__show') === -1){
        root.children[i].className += ' to__show';
      }
      if(classList.indexOf('to__item') > -1 && classList.indexOf("to__hidden") === -1){
        root.children[i].className += ' to__hidden';
      }
      traverseByDFS(root.children[i]);
    }
  }
}
function recursionFindTitle(data, key) {
  for (let i = 0; i < data.length; i++) {
    if (data[i].key === key) {
      return data[i].label;
    }
    if (data[i].children?.length > 0) {
      const title = recursionFindTitle(data[i].children, key);
      if (title) {
        return title;
      }
    }
  }
}
function assembleTag(key: string, title: string, penId: string) {
  let _key = TAG_PREFIX + key;
  const tagDom = document.createElement('div');
  tagDom.className = _key;
  tagDom.style.display = 'inline-flex';
  tagDom.style.alignItems = 'center';
  tagDom.style.flexDirection = 'row';
  tagDom.style.background = '#e7e7e7';
  tagDom.style.margin = '3px 4px 3px 0';
  tagDom.style.padding = '0 8px';
  tagDom.style.height = '24px';
  tagDom.dataset.penId = penId;
  tagDom.dataset.key = key;
  tagDom.style.color = 'rgba(0, 0, 0, 0.9)';

  const span = document.createElement('span');
  span.className = 'tag__text';
  span.style.maxWidth = '300px';
  span.innerHTML = title;
  tagDom.appendChild(span);

  const svgDom = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svgDom.setAttribute('viewBox', '0 0 24 24');
  svgDom.style.marginLeft = '8px';
  svgDom.dataset.key = _key;
  svgDom.style.fill = 'none';
  svgDom.style.width = '1em';
  svgDom.style.height = '100%';
  svgDom.onclick = tagClose;

  const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  path.dataset.key = _key;
  path.setAttribute('fill', 'currentColor');
  path.setAttribute('d', 'M7.05 5.64L12 10.59l4.95-4.95 1.41 1.41L13.41 12l4.95 4.95-1.41 1.41L12 13.41l-4.95 4.95-1.41-1.41L10.59 12 5.64 7.05l1.41-1.41z');
  svgDom.appendChild(path);

  tagDom.appendChild(svgDom);

  return tagDom;
}
function validateData(pen: Pen) {
  const obj = {
    id: pen.id,
  }
  // 校验multiply与checked
  if (!pen.multiply && pen.checked.length > 0) {
    Object.assign(obj, {
      checked: [pen.checked[0]]
    })
  }
  window.meta2d.setValue(obj, { render: false });
}
function onDestroy(pen: Pen) {
  if (pen.calculative.singleton && pen.calculative.singleton.div) {
    pen.calculative.singleton.div.remove();

    delete pen.calculative.singleton.div;
  }
}
function resize(pen: any) {
  setElemPosition(pen, pen.calculative.singleton.div);
}
function onMouseEnter(pen: Pen, e: Point) {
  const locked = pen.calculative.canvas.store.data.locked;
  if (locked === 1 || locked === 2) {
    pen.calculative.singleton.div.style.pointerEvents = 'initial';
  } else if (locked === 0) {
    pen.calculative.singleton.div.style.pointerEvents = 'none';
  }
}
function onMouseLeave(pen: Pen, e: Point) {
  pen.calculative.singleton.div.style.pointerEvents = 'none';
}
function onMouseUp(pen: Pen, e: Point) {
  const dropMenu = document.querySelector(`.${DROPMENU_PREFIX}${pen.id}`);
  dropMenu.style.display = dropMenu.style.display === 'none' ? 'block' : 'none';
}

function onMove(pen: Pen) {
  pen.calculative.singleton.div &&
    setElemPosition(pen, pen.calculative.singleton.div);
}
enum Direction {
  None,
  Right,
  Down
}
let level = 1
const ITEM_PREFIX = 'item_';
function arrowClick(e) {
  const key = e.target.dataset.key;
  const dom = document.getElementById(key);
  let flag = Direction.None;
  // 切换样式状态
  if (dom.className.indexOf('to__roate') > -1) {
    dom.className = 'to__downList'
    flag = Direction.Right;
  } else {
    dom.className = 'to__downList to__roate'
    flag = Direction.Down;
  }

  // 显示隐藏内容
  const domShow = dom.parentNode.nextElementSibling
  if (domShow.className.indexOf('to__show') > -1) {
    domShow.className = 'to__subItem_' + domShow.dataset.key
  } else {
    domShow.className = 'to__subItem_' + domShow.dataset.key + ' to__show'
  }
  // update expanded
  const penId = dom.dataset.penId;
  const pen = window.meta2d.findOne(penId);
  if (!pen) {
    return;
  }
  const expanded = deepClone(pen.expanded);
  const _key = dom.dataset._key;
  if (flag === Direction.Down) {
    if (!expanded.includes(_key)) {
      expanded.push(_key)
    }
  } else {
    if (expanded.includes(_key)) {
      const index = expanded.indexOf(_key);
      expanded.splice(index, 1);
    }
  }
  window.meta2d.setValue({
    id: penId,
    expanded
  })
  // 递归判断树结构的某个节点是否有children
  const hasChild = recursionFindHasChild(pen.data, _key);
  if (!hasChild) {
    // 加载数据
    pen.loadFn && pen.loadFn(pen, { level, key: _key, title: key });
  }
}
function recursionFindHasChild(data, key) {
  for (let i = 0; i < data.length; i++) {
    if (data[i].key === key) {
      return data[i].children?.length > 0;
    }
    if (data[i].children?.length > 0) {
      const flag = recursionFindHasChild(data[i].children, key);
      if (flag) {
        return true;
      }
    }
  }
}
function tagClose(e) {
  e.stopPropagation();
  e.cancelBubble = true;
  const tagDom = document.getElementsByClassName(`${e.target.dataset.key}`)[0];
  const penId = tagDom.dataset.penId;
  const pen = window.meta2d.findOne(penId);
  if (!pen) {
    return;
  }
  const checked = deepClone(pen.checked);
  const index = checked.indexOf(tagDom.dataset.key);
  if (index > -1) {
    checked.splice(index, 1);
  }
  window.meta2d.setValue({
    id: penId,
    checked,
  })
  tagDom.remove();

  // 更新tree的checked
  const toItemDom = document.getElementsByClassName(`item-key-${tagDom.dataset.key}`)[0];
  toItemDom.style.backgroundColor = 'transparent';
  const item = toItemDom.getElementsByClassName('to__item_wrapper')[0];
  item.className = 'to__item_wrapper';
  item.firstChild.checked = false;

  // 更新高度
  adjustHeight(pen);
}
function checkboxClick(e) {
  e.stopPropagation();
  const parentDom = e.target.parentNode;
  const checkedVal = e.target.checked;
  if (!checkedVal && parentDom.className.indexOf('to__checked') > -1) {
    parentDom.className = 'to__item_wrapper'
  } else if (checkedVal && parentDom.className.indexOf('to__checked') == -1) {
    parentDom.className = 'to__item_wrapper to__checked'
  }
  const penId = e.target.dataset.penId;
  const pen = window.meta2d.findOne(penId);
  if (!pen) {
    return;
  }
  const val = e.target.value;
  const checked = deepClone(pen.checked);
  if (checkedVal) {
    if (!checked.includes(val)) {
      checked.push(val);

      // 添加tag
      const tagWrapper = document.getElementsByClassName(`${TAG_WRAPPER}${penId}`)[0];
      const title = recursionFindTitle(pen.data, val);
      const tag = assembleTag(val, title, penId);
      tagWrapper.appendChild(tag);
    }
  } else {
    const index = checked.indexOf(val);
    if (index > -1) {
      checked.splice(index, 1);
      // 移除tag
      const tagDom = document.getElementsByClassName(`${TAG_PREFIX}${val}`)[0];
      tagDom.remove();
    }
  }
  window.meta2d.setValue({
    id: penId,
    checked,
  })
  adjustHeight(pen);
}
function domClick(e) {
}
function itemClick(e) {
  e.stopPropagation();
  const checkDom = e.target.previousElementSibling
  if (checkDom) {
    checkDom.checked = !checkDom.checked
    const parentDom = checkDom.parentNode;
    if (!checkDom.checked && parentDom.className.indexOf('to__checked') > -1) {
      parentDom.className = 'to__item_wrapper'
    } else if (checkDom.checked && parentDom.className.indexOf('to__checked') == -1) {
      parentDom.className = 'to__item_wrapper to__checked'
    }
  }
  const penId = e.target.dataset.penId;
  const pen = window.meta2d.findOne(penId);
  if (!pen) {
    return;
  }
  const val = e.target.dataset.key;
  const checked = deepClone(pen.checked);
  if (checkDom.checked) {
    if (!checked.includes(val)) {
      checked.push(val);
    }
  } else {
    const index = checked.indexOf(val);
    if (index > -1) {
      checked.splice(index, 1);
    }
  }
  window.meta2d.setValue({
    id: penId,
    checked,
  })
}
function renderData(data, dom, pen) {
  if (Object.prototype.toString.call(data) === '[object Array]') {
    let style = document.createElement('style');
    style.type = 'text/css';
    document.head.appendChild(style);
    let sheet = style.sheet;
    sheet.insertRule(
      `div[class^="to__subItem"].to__show {
        display: block !important;
      }`
    );
    sheet.insertRule(
      `.to__downList .icon{
        transform: rotate(-90deg);
      }`
    );
    sheet.insertRule(
      `.to__downList.to__roate .icon{
        transform: rotate(0deg);
      }`
    );
    sheet.insertRule(
      `
      .to__item_wrapper.to__checked{
        background-color: #f2f3ff;
      }
      `
    )
    sheet.insertRule(
      `
      .to__item_wrapper.to__hidden{
        max-height: 0;
      }
      `
    )
    sheet.insertRule(
      `
      .to__item_wrapper.to__visible{
        max-height: auto;
      }
      `
    )
    sheet.insertRule(
      `
      .to__item.to__hidden{
        overflow: hidden;
      }
      `
    )
    generateDomByData(data, dom, pen, renderData);

  }
}
function generateDomByData(data, dom, pen, fn?) {
  for (let i = 0; i < data.length; i++) {
    // 添加标题
    const item = document.createElement('div')
    let key = ITEM_PREFIX + data[i].key;
    let arrow = `<svg t="1550632829702" class="icon" data-key=${key} style="width:12px;height:12px;" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="1783" xmlns:xlink="http://www.w3.org/1999/xlink" width="100%" height="100%"><defs><style type="text/css"></style></defs><path data-key=${key} d="M959.52557 254.29773 511.674589 702.334953 63.824631 254.29773Z" p-id="1784"></path></svg>`
    // 设置箭头
    if (data[i].children?.length == 0) {
      arrow = ''
    }
    const arrowDom = document.createElement("span");
    if (arrow) {
      if (!pen.expanded.includes(data[i].key)) {
        arrowDom.className = 'to__downList';
      } else {
        arrowDom.className = 'to__downList to__roate';
      }
      arrowDom.innerHTML = arrow;
      arrowDom.dataset.key = key;
      arrowDom.id = key;
      arrowDom.dataset.penId = pen.id;
      arrowDom.dataset._key = data[i].key;
      arrowDom.onclick = arrowClick;
    }
    const rightDom = document.createElement("span");
    rightDom.style.marginLeft = '8px';
    rightDom.style.whiteSpace = 'nowrap';
    rightDom.style.width = '100%';
    rightDom.style.height = '100%';
    rightDom.style.lineHeight = '100%';
    rightDom.style.display = 'inline-block';
    rightDom.style.fontSize = '18px';
    rightDom.style.paddingLeft = '6px';
    rightDom.style.borderRadius = '4px';
    rightDom.onclick = domClick;
    rightDom.className = 'to__item_wrapper'
    if (pen.multiply && pen.checked.includes(data[i].key)) {
      rightDom.className += ' to__checked'
    } else {
      if (pen.checked.length > 0 && pen.checked[0] === data[i].key) {
        rightDom.className += ' to__checked'
      }
    }

    // checkboxDom
    if (pen.multiply) {
      const checkboxDom = document.createElement("input");
      checkboxDom.type = "checkbox";
      checkboxDom.name = "cName";
      checkboxDom.style.width = '18px';
      checkboxDom.style.height = '18px';
      checkboxDom.style.verticalAlign = 'middle';
      if (pen.checked.includes(data[i].key)) {
        checkboxDom.checked = true;
      }
      checkboxDom.value = data[i].key;
      checkboxDom.dataset.penId = pen.id;
      checkboxDom.onclick = checkboxClick;
      rightDom.appendChild(checkboxDom);
    }

    // titleDom
    const titleDom = document.createElement("div");
    titleDom.className = "to__name";
    titleDom.style.display = 'inline-block';
    titleDom.style.height = '40px';
    titleDom.style.lineHeight = '40px';
    titleDom.style.width = 'calc(100% - 18px)';
    titleDom.style.marginLeft = '6px';
    titleDom.innerHTML = data[i].label;
    titleDom.dataset.key = data[i].key;
    titleDom.dataset.penId = pen.id;
    titleDom.onclick = itemClick;
    // 添加到rightDom
    rightDom.appendChild(titleDom);


    const toItemDom = document.createElement("div");
    toItemDom.style.marginLeft = '-80px';
    toItemDom.style.paddingLeft = '100px';
    toItemDom.style.height = '40px';
    toItemDom.style.lineHeight = '40px';
    toItemDom.style.whiteSpace = 'nowrap';
    toItemDom.style.marginBottom = '8px';
    toItemDom.className = 'to__item level-' + level + ' item-key-' + data[i].key;

    item.appendChild(toItemDom);
    if (data[i].children?.length > 0 || data[i].children) {
      toItemDom.appendChild(arrowDom)
    }
    toItemDom.appendChild(rightDom)

    // 添加子元素
    const subItem = document.createElement('div')
    if (!pen.expanded.includes(data[i].key)) {
      subItem.className = 'to__subItem_' + data[i].key
    } else {
      subItem.className = 'to__subItem_' + data[i].key + ' to__show'
    }
    subItem.dataset.key = data[i].key;
    subItem.style.display = 'none'
    subItem.style.paddingLeft = '24px'
    item.appendChild(subItem)
    dom.appendChild(item)
    // 递归
    if (fn) {
      if (data[i].children?.length > 0) {
        level++
        fn(data[i].children, subItem, pen)
      } else {
        if (i == data.length - 1) {
          level--
        }
      }
    }
  }
}