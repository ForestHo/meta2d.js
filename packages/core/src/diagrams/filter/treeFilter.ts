import { movingSuffix } from '../../canvas';
import { Pen, setElemPosition } from '../../pen';
import { Point } from '../../point';
import { rectInRect } from '../../rect';
import { deepClone, debounce } from '../../utils';

const DROPMENU_PREFIX = 'l-select__dropdown-inner_';
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
    pen.onRenderPenRaw2 = renderPenRaw2;
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
    container.dataset.penId = pen.id;
    container.addEventListener("mouseleave", containerMouseLeave);
    container.addEventListener("mouseenter", containerMouseEnter);
    // container.style.width = '100%';
    // container.style.height = '100%';
    // 输入框
    const input = assembleInputBox(pen);
    container.appendChild(input);
    // 下拉选项
    const dropMenu = document.createElement("div");
    dropMenu.style.position = 'absolute';
    dropMenu.style.left = '0';
    dropMenu.style.top = 'calc(100% - 0px)';
    dropMenu.style.width = '100%';
    dropMenu.style.minHeight = '300px';
    dropMenu.style.background = 'rgba(255, 255, 255, 0.9)';
    dropMenu.style.border = '1px solid #ccc';
    dropMenu.style.borderRadius = '4px';
    dropMenu.className = DROPMENU_PREFIX + pen.id;
    if (pen.autoDropdown) {
      dropMenu.classList.add("l-is-hidden")
    }
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
  const lTreeList = document.querySelector('.l-tree-list');
  const { index: insertIndex, level } = getChildIndex(lTreeList, mkey);
  const showIds = collectExpandShowIds(data, pen);
  generateDomByData(data, lTreeList, pen, { index: insertIndex + 1, level: level + 1 }, showIds, [], null);
  window.meta2d.setValue({
    id: pen.id,
    showIds: showIds
  })
}
function renderPenRaw2(pen: Pen, data: any) {
  const lTreeList = document.querySelector('.l-tree-list');
  const showIds = collectExpandShowIds(data, pen);
  console.log(showIds, data, 'renderPenRaw2');
  addLevelToTree(data);
  const frag = generateDomByData(data, null, pen, null, showIds, [], generateDomByData);
  // console.log(frag, 'frag');
  lTreeList.replaceChildren(frag);
  window.meta2d.setValue({
    id: pen.id,
    showIds: showIds
  })
}
function getChildIndex(dom, key: string) {
  var childNodes = dom.childNodes;
  var count = childNodes.length;
  var child_index, level;
  for (var i = 0; i < count; ++i) {
    if (childNodes[i].dataset.value === key) {
      child_index = i;
      level = parseInt(childNodes[i].dataset.level);
      break;
    }
  }
  return { index: child_index, level };
}
function onAdd(pen: Pen) {
  adjustHeight(pen);
}
// 过滤树结构，找到匹配过滤条件的直系亲属树path
function onRecursionData(data, val, paths) {
  for (let i = 0; i < data.length; i++) {
    const item = data[i];
    if (item.label.indexOf(val) > -1) {
      paths.push(item.value);
      // const pa = [];
      // treeFindPath(data, (item) => item.label.indexOf(val) !== -1, 'label',pa);
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
  // if (pen.calculative.singleton.div) {
  //   // 判断是否需要调整高度
  //   const { offsetHeight: h1 } = pen.calculative.singleton.div;
  //   const { offsetHeight: h2 } = document.getElementsByClassName(`${TAG_WRAPPER}${pen.id}`)[0];
  //   if (h1 !== h2) {
  //     pen.height = h2 + 16;
  //     pen.calculative.canvas.updatePenRect(pen);
  //   }
  // }
}
function containerMouseEnter(e) {
  // console.log('inputMouseLeave',e);
  const { penId } = this.dataset;
  const pen = window.meta2d.findOne(penId);
  if (!pen) {
    return;
  }
  if (pen.autoDropdown) {
    const dropMenu = document.querySelector(`.${DROPMENU_PREFIX}${pen.id}`);
    dropMenu.classList.remove("l-is-hidden");
  }
}
function containerMouseLeave(e) {
  // console.log('inputMouseLeave',e);
  const { penId } = this.dataset;
  const pen = window.meta2d.findOne(penId);
  if (!pen) {
    return;
  }
  if (pen.autoDropdown) {
    const dropMenu = document.querySelector(`.${DROPMENU_PREFIX}${pen.id}`);
    dropMenu.classList.add("l-is-hidden");
  }
}
function assembleInputBox(pen: Pen) {
  const box = document.createElement("div");
  box.className = 'l-tree__input';
  // box.style.width = '100%';
  // box.style.height = '100%';
  // box.style.padding = '0 8px';
  // box.style.border = '1px solid #ccc';
  // box.style.borderRadius = '4px';
  // box.style.whiteSpace = 'nowrap';
  // box.style.background = 'transparent';

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
  input.placeholder = pen.placeholder || '请输入关键字';
  input.dataset.penId = pen.id;
  input.oninput = debounce(onInputchange, 200)


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
  // 过滤树结构
  const paths = [];
  const penId = e.target.dataset.penId;
  const pen = window.meta2d.findOne(penId);
  if (!pen || !pen.filterable) {
    return;
  }
  const dropMenu = document.querySelector(`.${DROPMENU_PREFIX}${pen.id}`);
  if (e.target.value) {
    onRecursionData(pen.data, e.target.value, paths);
    // console.log(paths, 'paths');
    console.log(paths, 'paths');
    const disableIds = [];
    recursionCollectDisableIds(pen.data, paths, disableIds);
    console.log(disableIds, 'disableIds');
    // 去重
    const _disableIds = [...new Set(disableIds)];
    updateTree(pen.data, dropMenu, paths, _disableIds)
  } else {
    const lTreeList = dropMenu.querySelector('.l-tree-list');
    let len = lTreeList.children.length;
    for (let i = 0; i < len; i++) {
      if (lTreeList.children[i].nodeName === DIV) {
        if (lTreeList.children[i].classList.contains('l-disabled')) {
          lTreeList.children[i].classList.remove('l-disabled');
          lTreeList.children[i].classList.add('l-visible');
        }
      }
    }
  }

  // 输入结束，面板显示
  if (pen.autoDropdown) {
    if (dropMenu.classList.contains("l-is-hidden")) {
      dropMenu.classList.remove("l-is-hidden");
    }
  }
}
function recursionCollectDisableIds(data, paths, disableIds) {
  for (let i = 0; i < paths.length; i++) {
    const id = paths[i];
    const everyIds = [];
    recursionUpTreeFindParents(data, id, everyIds);
    disableIds.push(...everyIds);
  }
}
function recursionUpTreeFindParents(data, value, parentIds) {
  const parent = recursionFindParentByChildKey(data, value);
  if (!parent) {
    if (parentIds.indexOf(value) === -1) {
      parentIds.push(value);
    }
    return
  };
  if (parent) {
    if (parentIds.indexOf(parent.value) === -1) {
      parentIds.push(parent.value);
    }
    const grandParent = recursionFindParentByChildKey(data, parent.value);
    if (grandParent) {
      const _value = grandParent ? grandParent.value : null;
      recursionUpTreeFindParents(data, _value, parentIds);
    }
  }
}
function expandedChild(dropMenu, ids, show) {
  const lTreeList = dropMenu.querySelector('.l-tree-list');
  let len = lTreeList.children.length;
  for (let i = 0; i < len; i++) {
    if (lTreeList.children[i].nodeName === DIV) {
      //收起
      // console.log(ids, lTreeList.children[i].dataset.value, 'expandedChild');
      if (ids.indexOf(lTreeList.children[i].dataset.value) !== -1) {
        if (show) {
          lTreeList.children[i].classList.add('l-item-open');
        } else {
          // console.log('remove l-item-open', lTreeList.children[i].dataset.value);
          lTreeList.children[i].classList.remove('l-item-open');
        }
      }
    }
  }
}
function showHideChild(dropMenu, ids, hideIds, showHide) {
  const lTreeList = dropMenu.querySelector('.l-tree-list');
  let len = lTreeList.children.length;
  for (let i = 0; i < len; i++) {
    if (lTreeList.children[i].nodeName === DIV) {
      // const classList = lTreeList.children[i].className.split(' ');
      if (ids.indexOf(lTreeList.children[i].dataset.value) !== -1) {
        if (showHide === Direction.Down) {
          lTreeList.children[i].classList.remove('l-hidden');
          lTreeList.children[i].classList.add('l-visible');
          // const index = classList.findIndex((item) => item.indexOf('l-hidden') > -1);
          // if (index > -1) {
          //   classList.splice(index, 1, ['l-visible']);
          //   lTreeList.children[i].className = classList.join(' ');
          // }
        } else {
          lTreeList.children[i].classList.remove('l-visible');
          lTreeList.children[i].classList.add('l-hidden');
          // const index = classList.findIndex((item) => item.indexOf('l-visible') > -1);
          // if (index > -1) {
          //   classList.splice(index, 1, ['l-hidden']);
          //   lTreeList.children[i].className = classList.join(' ');
          // }
        }
      }
      // console.log(hideIds, lTreeList.children[i].dataset.value, 'lTreeList.children[i].dataset.value');
      if (hideIds.indexOf(lTreeList.children[i].dataset.value) !== -1) {
        lTreeList.children[i].classList.remove('l-visible');
        lTreeList.children[i].classList.add('l-hidden');
      }
    }
  }
}
function updateTree(data, dropMenu, paths, disableIds) {
  const lTreeList = dropMenu.querySelector('.l-tree-list');
  let len = lTreeList.children.length;
  for (let i = 0; i < len; i++) {
    if (lTreeList.children[i].nodeName === DIV) {
      // const classList = lTreeList.children[i].className.split(' ');
      if (paths.includes(lTreeList.children[i].dataset.value)) {
        if (lTreeList.children[i].classList.contains('l-hidden')) {
          lTreeList.children[i].classList.remove('l-hidden');
          lTreeList.children[i].classList.add('l-visible');
        }
        // const index = classList.findIndex((item) => item.indexOf('l-hidden') > -1);
        // if (index > -1) {
        //   classList.splice(index, 1, ['l-visible']);
        //   lTreeList.children[i].className = classList.join(' ');
        // }
      } else {
        if (lTreeList.children[i].classList.contains('l-visible')) {
          lTreeList.children[i].classList.remove('l-visible');
          lTreeList.children[i].classList.add('l-hidden');
        }
        // const index = classList.findIndex((item) => item.indexOf('l-visible') > -1);
        // if (index > -1) {
        //   classList.splice(index, 1, ['l-hidden']);
        //   lTreeList.children[i].className = classList.join(' ');
        // }
      }
      if (disableIds.includes(lTreeList.children[i].dataset.value)) {
        if (lTreeList.children[i].classList.contains('l-hidden')) {
          lTreeList.children[i].classList.remove('l-hidden');
          lTreeList.children[i].classList.add('l-visible', 'l-disabled');
        }
      }
    }
  }
  // for (let i = 0; i < data.length; i++) {
  //   const item = data[i];
  //   if(paths.includes(item.key)){
  //     const itemDom = dropMenu.getElementsByClassName(`item-key-${item.key}`)[0];
  //     const itemWrapper = itemDom.getElementsByClassName('to__item_wrapper')[0];
  //     if(itemWrapper.className.indexOf('to__visible') === -1){
  //       itemWrapper.className += ' to__visible';
  //     }
  //   }else{
  //     const itemDom = dropMenu.getElementsByClassName(`item-key-${item.key}`)[0];
  //     itemDom.className += ' to__hidden';
  //   }
  //   if(item.children?.length > 0){
  //     updateTree(item.children, dropMenu, paths)
  //   }
  // }
}

function recursionFindTitle(data, key) {
  for (let i = 0; i < data.length; i++) {
    if (data[i].value === key) {
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
  svgDom.dataset.penId = penId;
  svgDom.dataset.value = key;
  svgDom.onclick = tagClose;

  const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  path.dataset.key = _key;
  path.setAttribute('fill', 'currentColor');
  path.setAttribute('d', 'M7.05 5.64L12 10.59l4.95-4.95 1.41 1.41L13.41 12l4.95 4.95-1.41 1.41L12 13.41l-4.95 4.95-1.41-1.41L10.59 12 5.64 7.05l1.41-1.41z');
  svgDom.appendChild(path);

  tagDom.appendChild(svgDom);

  return tagDom;
}
// 递归收集tree的所有父亲节点的id，
function collectExpandIds(data, ids = []) {
  for (let i = 0; i < data.length; i++) {
    const item = data[i];
    if (item.children?.length > 0) {
      ids.push(item.value);
    }
    if (data[i].children?.length > 0) {
      collectExpandIds(data[i].children, ids);
    }
  }
}
function validateData(pen: Pen) {
  const obj = {
    id: pen.id,
  }
  if (!pen.halfChecked) {
    Object.assign(obj, {
      halfChecked: []
    })
  }
  // 校验multiply与checked
  if (!pen.multiple && pen.checked.length > 0) {
    Object.assign(obj, {
      checked: [pen.checked[0]]
    })
  }

  // 校验checked
  if (pen.checked.length > 0) {
    let list = [];
    for (let i = 0; i < pen.checked.length; i++) {
      const ck = pen.checked[i];
      // 找到哪一个节点
      const item = recursionTreeFindItem(pen.data, ck);
      if (item) {
        const ids = [];
        recursionTreeFindAllIds(item.children, ids);
        list = list.concat(ids);
      }
    }
    list = list.concat(pen.checked);
    // console.log(list, 'list');
    Object.assign(obj, {
      checked: list
    })
  }


  if (pen.expandAll) {
    const ids = []
    collectExpandIds(pen.data, ids)
    Object.assign(obj, {
      expanded: ids
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
  if (pen.autoDropdown) {
    const dropMenu = document.querySelector(`.${DROPMENU_PREFIX}${pen.id}`);
    dropMenu.classList.remove("l-is-hidden");
  }
}
function onMouseLeave(pen: Pen, e: Point) {
  pen.calculative.singleton.div.style.pointerEvents = 'none';
  if (pen.autoDropdown) {
    const dropMenu = document.querySelector(`.${DROPMENU_PREFIX}${pen.id}`);
    dropMenu.classList.add("l-is-hidden");
  }
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
// let level = 0
function treeIconClick(e) {
  const { level } = this.dataset;
  const _level = parseInt(level);
  const key = e.target.dataset.key;
  const lTreeList = document.querySelector('.l-tree-list');
  let len = lTreeList.children.length;
  let child = null;
  for (let i = 0; i < len; i++) {
    if (lTreeList.children[i].nodeName === DIV) {
      // console.log(lTreeList.children[i].dataset.value, key, 'key');
      if (lTreeList.children[i].dataset.value === key) {
        child = lTreeList.children[i];
        break;
      }
    }
  }
  if (!child) {
    return;
  }
  let flag = Direction.None;
  const classList = child.className.split(' ');
  const index = classList.findIndex(el => el === 'l-item-open');
  // 切换样式状态
  if (index > -1) {
    classList.splice(index, 1);
    flag = Direction.Right;
  } else {
    classList.push('l-item-open');
    flag = Direction.Down;
  }
  child.className = classList.join(' ');

  // update expanded
  const penId = child.dataset.penId;
  const pen = window.meta2d.findOne(penId);
  if (!pen) {
    return;
  }
  const expanded = deepClone(pen.expanded);
  const _key = key;

  let d = null;
  if (level > 0) {
    d = pen.data
  } else {
    d = [{ children: pen.data }]
  }

  const { list, siblings } = handleToggleExpand(pen.accordion, d, expanded, _key);
  // console.log(expanded, list, _key, 'expanded');

  if (flag === Direction.Down) {
    // 展开
    if (!list.includes(_key)) {
      list.push(_key)
    }
  } else {
    // 收起
    if (list.includes(_key)) {
      const index = list.indexOf(_key);
      list.splice(index, 1);
    }
  }

  window.meta2d.setValue({
    id: penId,
    expanded: list
  })
  // 递归判断树结构的某个节点是否有children
  const hasChild = recursionFindHasChild(pen.data, _key);
  console.log(hasChild, 'hasChild');
  if (!hasChild) {
    // 加载数据
    const { level } = this.parentElement.dataset;
    pen.loadFn && pen.loadFn(pen, { level, key: _key, title: key });
  } else {
    const pen1 = window.meta2d.findOne(penId);
    if (!pen1.accordion) {
      // 获取树的某个节点
      const currentItem = recursionTreeFindItem(pen.data, _key);
      let ids = [];
      // recursionTreeFindAllIds(currentItem.children, ids);

      // 根据展开状态显示或隐藏子节点
      if (flag === Direction.Down) {
        //展开
        //递归收集所有需要展开的节点
        // console.log(currentItem.children, list,_key,'currentItem.children');
        recursionCollectExpandIds([currentItem], list, ids);
        // console.log(ids, 'ids');
        // 直接子节点显示
        // const firstChilds = currentItem.children.map(el => el.value);
        // ids = ids.concat(firstChilds);
      } else if (flag === Direction.Right) {
        //收起
        // 收集所有的子节点
        recursionTreeFindAllIds(currentItem.children, ids);
      }
      // console.log(ids, 'ids');
      const dropMenu = document.querySelector(`.${DROPMENU_PREFIX}${pen.id}`);
      showHideChild(dropMenu, ids, [], flag);
    } else {
      const currentItem = recursionTreeFindItem(pen.data, _key);
      let ids = [];
      // 找到所有兄弟节点
      const siblings = recursionFindSiblings(d, key);
      console.log(siblings, currentItem, 'siblings 收起');
      if (flag === Direction.Down) {
        // 收起兄弟节点,隐藏兄弟节点的所有子节点
        let siblingChildIds = [];
        for (let k = 0; k < siblings.length; k++) {
          const sib = siblings[k];
          const sibItem = recursionTreeFindItem(pen.data, sib);
          let arr = [];
          recursionTreeFindAllIds(sibItem.children, arr);
          siblingChildIds = siblingChildIds.concat(arr);
        }
        // 收集当前需要展开的节点的所有子节点
        recursionCollectExpandIds([currentItem], list, ids);
        console.log(ids, JSON.stringify(list), '展开 ids');
        const dropMenu = document.querySelector(`.${DROPMENU_PREFIX}${pen.id}`);
        // 隐藏兄弟节点的所有子节点
        showHideChild(dropMenu, ids, siblingChildIds, flag);
        // 收起兄弟节点
        expandedChild(dropMenu, siblings, false);
      } else if (flag === Direction.Right) {
        recursionTreeFindAllIds(currentItem.children, ids);
        console.log(ids, '收起 ids');
        const dropMenu = document.querySelector(`.${DROPMENU_PREFIX}${pen.id}`);
        showHideChild(dropMenu, ids, [], flag);
      }
    }
  }

  // const showIds = collectExpandShowIds(pen.data, pen);
  // const frag = generateDomByData(pen.data, null, pen, null, showIds, generateDomByData);
  // console.log(frag, lTreeList, 'frag');
  // lTreeList.replaceChildren(frag);
}
function recursionCollectExpandIds(data, expanded, ids) {
  for (let i = 0; i < data.length; i++) {
    if (expanded.includes(data[i].value)) {
      const list = data[i].children.map(el => el.value);
      ids.push(...list);
    } else {
      // console.log(data[i].value,expanded.includes(data[i].value)  , 'data[i]'); 
      // 这里递归返回，很重要
      continue;
      // return;
      // if(data[i].children?.length > 0){
      //   const arr = [];
      //   recursionTreeFindAllIds(data[i].children, arr);
      //   console.log(data[i],arr, 'data[i].value not expanded');
      //   for (let k = 0; k < arr.length; k++) {
      //     const el = arr[k];
      //     const index = 
      //     ids.splice(ids.findIndex(item => item === el), 1);
      //   }
      // }
    }
    if (data[i].children?.length > 0) {
      recursionCollectExpandIds(data[i].children, expanded, ids);
    }
  }
}
function recursionTreeFindAllIds(data, ids) {
  for (let i = 0; i < data.length; i++) {
    ids.push(data[i].value);
    if (data[i].children?.length > 0) {
      recursionTreeFindAllIds(data[i].children, ids);
    }
  }
}
function recursionTreeFindItem(data, key) {
  for (let i = 0; i < data.length; i++) {
    const item = data[i];
    if (item.value === key) {
      return item;
    }
    if (item.children?.length > 0) {
      const result = recursionTreeFindItem(item.children, key);
      if (result) {
        return result;
      }
    }
  }
}
function recursionFindSiblings(data, key,) {
  for (let i = 0; i < data.length; i++) {
    const item = data[i];
    if (Array.isArray(item.children) && item.children.findIndex(el => el.value === key) > -1) {
      return item.children.filter(el => el.value !== key).map(el => el.value);
    }
    if (Array.isArray(item.children) && item.children.length > 0) {
      const ret = recursionFindSiblings(item.children, key,);
      if (ret) {
        return ret;
      }
    }
  }
}
function recursionFindHasChild(data, key) {
  for (let i = 0; i < data.length; i++) {
    if (data[i].value === key) {
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
  const { penId, value } = this.dataset;
  const pen = window.meta2d.findOne(penId);
  if (!pen) {
    return;
  }
  const checkedList = deepClone(pen.checked);
  const index = checkedList.indexOf(value);
  console.log(checkedList, value, index, 'checkedList');
  if (index > -1) {
    checkedList.splice(index, 1);
  }
  // window.meta2d.setValue({
  //   id: penId,
  //   checked: checkedList,
  // })

  // 更新树结构的checked状态
  // const { penId, value } = this.parentElement.firstChild.dataset;
  const dropMenu = document.querySelector(`.${DROPMENU_PREFIX}${pen.id}`);
  const lTreeList = dropMenu.querySelector('.l-tree-list');
  const curItem = lTreeList.querySelector(`.l-tree-item[data-value="${value}"]`);
  // console.log(curItem, 'curItem');
  const { pid } = curItem.dataset;
  curItem.lastChild.classList.remove('l-is-checked');
  // console.log(pid, value, 'checkedList');
  let checkedIds = deepClone(checkedList);
  // let halfCheckedIds = deepClone(pen.halfChecked);

  if (!pen.checkStrictly) {
    {
      //取消勾选
      const currentItem = recursionTreeFindItem(pen.data, value);
      if (currentItem && currentItem.children?.length > 0) {
        const ids = [];
        recursionTreeFindAllIds(currentItem.children, ids);
        checkedIds = checkedIds.filter(el => !ids.includes(el));
        for (let i = 0; i < ids.length; i++) {
          const id = ids[i];
          if (checkedIds.includes(id)) {
            const index = checkedIds.findIndex(el => el === id);
            if (index > -1) {
              checkedIds.splice(checkedIds.findIndex(el => el === id), 1);
            }
          }
        }
      }
      const index = checkedIds.findIndex(el => el === value);
      if (index > -1) {
        checkedIds.splice(index, 1);
      }
      const dropMenu = document.querySelector(`.${DROPMENU_PREFIX}${pen.id}`);
      checkChild(dropMenu, checkedIds);

      // 收集半选中的节点
      const halfIds = [];
      const lTreeList = dropMenu.querySelector('.l-tree-list');
      recursionUpTree(lTreeList, pen.data, checkedIds, pid, value, false, halfIds, penId);
    }
    //根据最新的checked情况，更新checked数据
    const list = [];
    const checkedItems = lTreeList.querySelectorAll('.l_tree_lable.l-is-checked');
    for (let i = 0; i < checkedItems.length; i++) {
      const ck = checkedItems[i];
      list.push(ck.parentElement.dataset.value);
    }

    window.meta2d.setValue({
      id: penId,
      checked: list
    })

    // 根据最新的checked情况，更新checked的tag
    replaceAlltags(penId, list);
  } else {
    // console.log(JSON.stringify(checkedList), 'checkedList');
    window.meta2d.setValue({
      id: penId,
      checked: checkedList,
    })
    replaceAlltags(penId, checkedList);
  }
}
function checkboxNewClick(e) {
  e.stopPropagation();
  // console.log(this,this.previousElementSibling, 'e.target');
  const { penId, value } = this.parentElement.firstChild.dataset;
  const { pid } = this.parentElement.parentElement.dataset;
  // const checkDom = document.querySelector(`.l-checkbox__former[data-value="${value}"]`);
  // console.log(11111,checkDom,checkDom.checked);
  // checkDom.checked = !checkDom.checked;
  // console.log(e.target.parentElement, 'penId, value');
  const rawChecked = e.target.parentElement.classList.contains('l-is-checked');
  // console.log(rawChecked, 'rawChecked');
  if (rawChecked) {
    e.target.parentElement.classList.remove('l-is-checked');
  } else {
    e.target.parentElement.classList.add('l-is-checked');

  }
  const checked = !rawChecked;
  // console.log(checked, 'checked');
  const pen = window.meta2d.findOne(penId);
  if (!pen) {
    return;
  }
  let checkedIds = deepClone(pen.checked);
  // let halfCheckedIds = deepClone(pen.halfChecked);

  if (!pen.checkStrictly) {
    // 父子勾选关联
    // console.log(checkedIds, checked, 'iddddd')
    if (checked) {
      //勾选
      const currentItem = recursionTreeFindItem(pen.data, value);
      // console.log(222222)
      if (currentItem && currentItem.children?.length > 0) {
        const ids = [];
        recursionTreeFindAllIds(currentItem.children, ids);
        for (let k = 0; k < ids.length; k++) {
          const id = ids[k];
          if (!checkedIds.includes(id)) {
            checkedIds.push(id);
          }
        }
      }
      checkedIds.push(value);
      const dropMenu = document.querySelector(`.${DROPMENU_PREFIX}${pen.id}`);
      checkChild(dropMenu, checkedIds);


      const halfIds = [];
      const lTreeList = dropMenu.querySelector('.l-tree-list');
      // console.log('1111111111111111', lTreeList);
      recursionUpTree(lTreeList, pen.data, checkedIds, pid, value, checked, halfIds, penId);
    } else {
      //取消勾选
      const currentItem = recursionTreeFindItem(pen.data, value);
      if (currentItem && currentItem.children?.length > 0) {
        const ids = [];
        recursionTreeFindAllIds(currentItem.children, ids);
        checkedIds = checkedIds.filter(el => !ids.includes(el));
        for (let i = 0; i < ids.length; i++) {
          const id = ids[i];
          if (checkedIds.includes(id)) {
            const index = checkedIds.findIndex(el => el === id);
            if (index > -1) {
              checkedIds.splice(checkedIds.findIndex(el => el === id), 1);
            }
          }
        }
      }
      const index = checkedIds.findIndex(el => el === value);
      if (index > -1) {
        checkedIds.splice(index, 1);
      }
      // console.log(checkedIds, 'checkedIds del');
      const dropMenu = document.querySelector(`.${DROPMENU_PREFIX}${pen.id}`);
      checkChild(dropMenu, checkedIds);

      // 收集半选中的节点
      const halfIds = [];
      const lTreeList = dropMenu.querySelector('.l-tree-list');
      // console.log('1111111111111111', lTreeList);
      recursionUpTree(lTreeList, pen.data, checkedIds, pid, value, checked, halfIds, penId);
    }
  } else {
    //父子勾选不关联
    if (checked) {
      const index = checkedIds.findIndex(el => el === value);
      if (index === -1) {
        checkedIds.push(value);
      }
    } else {
      const index = checkedIds.findIndex(el => el === value);
      if (index > -1) {
        checkedIds.splice(index, 1);
      }
    }
  }

  //根据最新的checked情况，更新checked数据
  const list = [];
  const dropMenu = document.querySelector(`.${DROPMENU_PREFIX}${pen.id}`);
  const lTreeList = dropMenu.querySelector('.l-tree-list');
  const checkedItems = lTreeList.querySelectorAll('.l_tree_lable.l-is-checked');
  // console.log(checkedItems, 'checkedItems');
  for (let i = 0; i < checkedItems.length; i++) {
    const ck = checkedItems[i];
    // console.log(ck.parentElement.dataset.value, 'ck');
    list.push(ck.parentElement.dataset.value);
  }

  window.meta2d.setValue({
    id: penId,
    checked: list
  })

  // 根据最新的checked情况，更新checked的tag
  replaceAlltags(penId, list);
}
function replaceAlltags(penId, list) {
  const pen = window.meta2d.findOne(penId);
  if (!pen) {
    return;
  }
  const input_prefix = document.querySelector(`.${TAG_WRAPPER}${penId}`);
  // input_prefix.replaceChildren('');
  const frag = document.createDocumentFragment();
  for (let i = 0; i < list.length; i++) {
    const key = list[i];
    const title = recursionFindTitle(pen.data, key);
    const e = assembleTag(key, title, penId);
    frag.appendChild(e);
  }
  input_prefix.replaceChildren(frag);
  console.log(frag.children.length, 'frag');
}
// 判断所有子元素是否都具有某个特定的类
function checkAllHaveClass(dom, className) {
  const items = Array.from(dom);
  const allHaveClass = items.every(item => item.classList.contains(className));
  return allHaveClass;
}
function recursionUpTree(lTreeList, data, checked, pid, value, checkVal, halfIds, penId) {
  // console.log('2222222222222', pid);
  if (!pid) return;
  let isAll = true, has = false;
  const parent = lTreeList.querySelector(`.l-tree-item[data-value="${pid}"]`);
  // console.log( '11333333333333',parent);
  if (parent) {
    // console.log(parent, 'parent');
    const currentItem = recursionTreeFindItem(data, parent.dataset.value);
    const childIds = [];
    recursionTreeFindAllIds(currentItem.children, childIds);
    // console.log(childIds, parent.dataset.value, JSON.stringify(checked), 'childIds');
    if (checkVal) {
      const ret1 = childIds.every(el => checked.indexOf(el) > -1);
      if (ret1) {
        // console.log('ret1 all In',parent.dataset.value);
        isAll = true;
        checked.push(parent.dataset.value);
        if (parent.lastChild.classList.contains('l-is-indeterminate')) {
          parent.lastChild.classList.remove('l-is-indeterminate');
        }
        parent.lastChild.classList.add('l-is-checked');
      } else {
        isAll = false;
        let index = checked.findIndex(el => el === parent.dataset.value);
        if (index > -1) {
          checked.splice(index, 1);
        }
        if (parent.lastChild.classList.contains('l-is-checked')) {
          parent.lastChild.classList.remove('l-is-checked');
        }
        parent.lastChild.classList.add('l-is-indeterminate');
      }
      // const ret2 = 
    } else {
      const ret1 = childIds.every(el => checked.indexOf(el) === -1);
      if (ret1) {
        // console.log('ret1 all In',parent.dataset.value);
        isAll = true;
        let index = checked.findIndex(el => el === parent.dataset.value);
        if (index > -1) {
          checked.splice(index, 1);
        }
        parent.lastChild.classList.remove('l-is-checked');
        parent.lastChild.classList.remove('l-is-indeterminate');
      } else {
        isAll = false;
        let index = checked.findIndex(el => el === parent.dataset.value);
        if (index > -1) {
          checked.splice(index, 1);
        }
        if (parent.lastChild.classList.contains('l-is-checked')) {
          parent.lastChild.classList.remove('l-is-checked');
        }
        parent.lastChild.classList.add('l-is-indeterminate');
      }
    }


    // const children = lTreeList.querySelectorAll(`.l-tree-item[data-pid="${pid}"]`);
    // const allActive = checkAllHaveClass(children,'l-is-checked');
    // console.log(allActive, pid,'allActive');
    // for (let i = 0; i < children.length; i++) {
    //   const child = children[i];
    //   if(!child.classList.contains('l-is-checked')){
    //     isAll = false;
    //     console.log( 'isAll',isAll);
    //   }
    // }

    // const grandParent = recursionFindParentByChildKey(data, pid);
    // console.log(grandParent, 'grandParent');
    // if(grandParent){
    //   const allChilds = grandParent.children.map(el => el.value);
    //   const ret = allChilds.every(el => checked.indexOf(el) > -1);
    //   console.log(ret, 'ret');
    //   if(ret){
    //     isAll = true;

    //     for (let k = 0; k < allChilds.length; k++) {
    //       const child = allChilds[k];
    //       console.log(child, 'child');
    //       const childDom = lTreeList.querySelector(`.l-tree-item[data-value="${child}"]`);
    //       childDom.lastChild.classList.add('l-is-checked');
    //     }
    //   }else{
    //     isAll = false;
    //   }
    // }
    // console.log(isAll,parent, 'isAll');
    // if (isAll) {
    //   // parent.lastChild.classList.add('l-is-checked');
    //   // for (let i = 0; i < parent.children.length; i++) {
    //   //   const child = parent.children[i];
    //   //   child.firstChild.classList.add('l-is-checked');
    //   // }
    // } else if (has) {
    //   // parent.classList.add('l-is-indeterminate');
    // }

    const _pid = parent.dataset.pid;
    const _value = parent.dataset.value;
    recursionUpTree(lTreeList, data, checked, _pid, _value, checkVal, halfIds, penId);
  }
}
// function recursionUpTree(lTreeList, data,checked, pid, value,checkVal, halfIds) {
//   console.log('2222222222222', pid);
//   if (!pid) return;
//   let isAll = true, has = false;
//   const parent = lTreeList.querySelector(`.l-tree-item[data-value="${pid}"]`);
//   // console.log( '11333333333333',parent);
//   if (parent) {
//     // console.log(parent, 'parent');
//     // const children = lTreeList.querySelectorAll(`.l-tree-item[data-pid="${pid}"]`);
//     // const allActive = checkAllHaveClass(children,'l-is-checked');
//     // console.log(allActive, pid,'allActive');
//     // for (let i = 0; i < children.length; i++) {
//     //   const child = children[i];
//     //   if(!child.classList.contains('l-is-checked')){
//     //     isAll = false;
//     //     console.log( 'isAll',isAll);
//     //   }
//     // }

//     const grandParent = recursionFindParentByChildKey(data, pid);
//     console.log(grandParent, 'grandParent');
//     if(grandParent){
//       const allChilds = grandParent.children.map(el => el.value);
//       const ret = allChilds.every(el => checked.indexOf(el) > -1);
//       console.log(ret, 'ret');
//       if(ret){
//         isAll = true;

//         for (let k = 0; k < allChilds.length; k++) {
//           const child = allChilds[k];
//           console.log(child, 'child');
//           const childDom = lTreeList.querySelector(`.l-tree-item[data-value="${child}"]`);
//           childDom.lastChild.classList.add('l-is-checked');
//         }
//       }else{
//         isAll = false;
//       }
//     }
//     console.log(isAll,parent, 'isAll');
//     if (isAll) {
//       // parent.lastChild.classList.add('l-is-checked');
//       // for (let i = 0; i < parent.children.length; i++) {
//       //   const child = parent.children[i];
//       //   child.firstChild.classList.add('l-is-checked');
//       // }
//     } else if (has) {
//       // parent.classList.add('l-is-indeterminate');
//     }

//     const _pid = parent.dataset.pid;
//     const _value = parent.dataset.value;
//     recursionUpTree(lTreeList, data,checked, _pid, _value,checkVal, halfIds);
//   }
// }
function checkChild(dropMenu, ids) {
  const lTreeList = dropMenu.querySelector('.l-tree-list');
  let len = lTreeList.children.length;
  for (let i = 0; i < len; i++) {
    if (lTreeList.children[i].nodeName === DIV) {
      if (ids.indexOf(lTreeList.children[i].dataset.value) !== -1) {
        lTreeList.children[i].lastChild.classList.add('l-is-checked');
      } else {
        lTreeList.children[i].lastChild.classList.remove('l-is-checked');
      }
    }
  }
}
// 向下递归
// function downAccess(data,checked,allCheckeds, status) {
//   $('[pId=' + id + ']').each(function (n, item) {
//     if (status) accessClass(item, checkedClass);
//     else accessClass(item, unCheckClass);

//     downAccess($(item).attr('nodeId'),id, status);
//   });

//   for (let i = 0; i < data.length; i++) {
//     const item = data[i];
//     if(checked.includes(item.value)){
//       allCheckeds
//     }
//     if(item.children?.length > 0){
//       downAccess(item.children, id, status);
//     }
//   }
// }
function accessClass(node, cls) {
  // var classes = [checkedClass, middleClass, unCheckClass];
  // classes.map(function (item) {
  //   if (item == cls) node.classList.add(item);
  //   else node.classList.remove(item);
  // });
}
// function checkboxClick(e) {
//   e.stopPropagation();
//   e.cancelBubble = true;
//   const parentDom = e.target.parentNode;
//   const checkedVal = e.target.checked;
//   if (!checkedVal && parentDom.className.indexOf('to__checked') > -1) {
//     parentDom.className = 'to__item_wrapper'
//   } else if (checkedVal && parentDom.className.indexOf('to__checked') == -1) {
//     parentDom.className = 'to__item_wrapper to__checked'
//   }
//   const penId = e.target.dataset.penId;
//   const pen = window.meta2d.findOne(penId);
//   if (!pen) {
//     return;
//   }
//   const val = e.target.value;
//   const checked = deepClone(pen.checked);
//   updateTags(checkedVal, checked, val, penId, pen);



//   // 收集当前节点的所有儿子节点的id
//   const currentItem = recursionTreeFindItem(pen.data, val);
//   let ids = [val];
//   currentItem?.children && recursionTreeFindAllIds(currentItem.children, ids);
//   if (checkedVal) {
//     let arr = []
//     for (let i = 0; i < ids.length; i++) {
//       if (!checked.includes(ids[i])) {
//         arr.push(ids[i]);
//       }
//     }
//     ids = checked.concat(arr);
//     // ids = ids.concat(checked);
//   } else {
//     // 移除当前节点的所有儿子节点的id
//     ids = checked.filter(el => !ids.includes(el));
//   }

//   window.meta2d.setValue({
//     id: penId,
//     checked: ids,
//   })
//   adjustHeight(pen);
//   renderPenRaw2(pen, pen.data);
// }
function upAccess(pId) {
  // if(!pId) return;
  // var isAll = true, has = false,
  //     pckbox = $('[nodeId='+pId+']').get(0);
  // if(pckbox) {
  //     $('[pId='+pId+']').each(function(n,item){
  //       var clist = Array.from(item.classList),
  //           status = clist.includes(checkedClass);
  //       if(!status) isAll = false;
  //       else has = true;
  //       if(clist.includes(middleClass)) has = true;
  //     });

  //     if(isAll) accessClass(pckbox,checkedClass);
  //     else if(has)  accessClass(pckbox,middleClass);
  //     else accessClass(pckbox,unCheckClass);

  //     upAccess($(pckbox).attr('pId'));
  // }
}
function updateTags(checkedVal, checked, val, penId, pen) {
  if (pen.multiple) {
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
        if (tagDom) {
          tagDom.remove();
        }
      }
    }
  } else {
    // 单选
    checked.splice(0, checked.length, val);
    const tagWrapper = document.getElementsByClassName(`${TAG_WRAPPER}${penId}`)[0];
    const title = recursionFindTitle(pen.data, val);
    const tag = assembleTag(val, title, penId);
    tagWrapper.replaceChildren(tag);
  }
}
function lableClick(e) {
  e.stopPropagation();
  // console.log(this,this.previousElementSibling, 'e.target');
  const { penId, value } = this.dataset;
  const { pid } = this.parentElement.parentElement.dataset;

  const pen = window.meta2d.findOne(penId);
  if (!pen) {
    return;
  }
  let checkedIds = deepClone(pen.checked);
  if (pen.multiple) {
    // const checkDom = document.querySelector(`.l-checkbox__former[data-value="${value}"]`);
    // console.log(11111,checkDom,checkDom.checked);
    // checkDom.checked = !checkDom.checked;
    // console.log(e.target.parentElement, 'penId, value');
    const rawChecked = e.target.parentElement.classList.contains('l-is-checked');
    // console.log(rawChecked, 'rawChecked');
    if (rawChecked) {
      e.target.parentElement.classList.remove('l-is-checked');
    } else {
      e.target.parentElement.classList.add('l-is-checked');

    }
    const checked = !rawChecked;
    // console.log(checked, 'checked');

    // let halfCheckedIds = deepClone(pen.halfChecked);
    console.log(checkedIds, checked, 'iddddd')
    if (checked) {
      //勾选
      const currentItem = recursionTreeFindItem(pen.data, value);
      // console.log(222222)
      if (currentItem && currentItem.children?.length > 0) {
        const ids = [];
        recursionTreeFindAllIds(currentItem.children, ids);
        for (let k = 0; k < ids.length; k++) {
          const id = ids[k];
          if (!checkedIds.includes(id)) {
            checkedIds.push(id);
          }
        }
      }
      checkedIds.push(value);
      const dropMenu = document.querySelector(`.${DROPMENU_PREFIX}${pen.id}`);
      checkChild(dropMenu, checkedIds);


      const halfIds = [];
      const lTreeList = dropMenu.querySelector('.l-tree-list');
      // console.log('1111111111111111', lTreeList);
      recursionUpTree(lTreeList, pen.data, checkedIds, pid, value, checked, halfIds, penId);
    } else {
      //取消勾选
      const currentItem = recursionTreeFindItem(pen.data, value);
      if (currentItem && currentItem.children?.length > 0) {
        const ids = [];
        recursionTreeFindAllIds(currentItem.children, ids);
        checkedIds = checkedIds.filter(el => !ids.includes(el));
        for (let i = 0; i < ids.length; i++) {
          const id = ids[i];
          if (checkedIds.includes(id)) {
            const index = checkedIds.findIndex(el => el === id);
            if (index > -1) {
              checkedIds.splice(checkedIds.findIndex(el => el === id), 1);
            }
          }
        }
      }
      const index = checkedIds.findIndex(el => el === value);
      if (index > -1) {
        checkedIds.splice(index, 1);
      }
      // console.log(checkedIds, 'checkedIds del');
      const dropMenu = document.querySelector(`.${DROPMENU_PREFIX}${pen.id}`);
      checkChild(dropMenu, checkedIds);

      // 收集半选中的节点
      const halfIds = [];
      const lTreeList = dropMenu.querySelector('.l-tree-list');
      // console.log('1111111111111111', lTreeList);
      recursionUpTree(lTreeList, pen.data, checkedIds, pid, value, checked, halfIds, penId);
    }
    //根据最新的checked情况，更新checked数据
    const list = [];
    const dropMenu = document.querySelector(`.${DROPMENU_PREFIX}${pen.id}`);
    const lTreeList = dropMenu.querySelector('.l-tree-list');
    const checkedItems = lTreeList.querySelectorAll('.l_tree_lable.l-is-checked');
    // console.log(checkedItems, 'checkedItems');
    for (let i = 0; i < checkedItems.length; i++) {
      const ck = checkedItems[i];
      // console.log(ck.parentElement.dataset.value, 'ck');
      list.push(ck.parentElement.dataset.value);
    }

    window.meta2d.setValue({
      id: penId,
      checked: list
    })

    // 根据最新的checked情况，更新checked的tag
    replaceAlltags(penId, list);
  } else {
    // 单选
    e.target.parentElement.classList.add('l-is-checked');
    if (checkedIds.length > 0) {
      const value = checkedIds[0];
      const lTreeList = document.querySelector('.l-tree-list');
      const curItem = lTreeList.querySelector(`.l-tree-item[data-value="${value}"]`);
      curItem.lastChild.classList.remove('l-is-checked');
    }
    checkedIds = [];
    checkedIds.push(value);
    window.meta2d.setValue({
      id: penId,
      checked: checkedIds
    })
    // console.log(checkedIds, 'checkedIds');
    // 根据最新的checked情况，更新checked的tag
    replaceAlltags(penId, checkedIds);
  }

}
// function lableClick(e) {
//   e.stopPropagation();

//   const lTreeList = document.querySelector('.l-tree-list');
//   let len = lTreeList.children.length;
//   let child = null;
//   for (let i = 0; i < len; i++) {
//     if (lTreeList.children[i].nodeName === DIV) {
//       if (lTreeList.children[i].dataset.value === e.target.dataset.key) {
//         child = lTreeList.children[i];
//         break;
//       }
//     }
//   }
//   if (child) {
//     const classList = child.lastChild.className.split(' ');
//     const index = classList.findIndex(el => el === 'to__checked');
//     if (index > -1) {
//       classList.splice(index, 1);
//     } else {
//       classList.push('to__checked');
//     }
//     child.firstChild.checked = !child.firstChild.checked;
//     child.lastChild.className = classList.join(' ');
//   }

//   const penId = e.target.dataset.penId;
//   const pen = window.meta2d.findOne(penId);
//   if (!pen) {
//     return;
//   }
//   const val = e.target.dataset.key;
//   const checked = deepClone(pen.checked);

//   updateTags(child.firstChild.checked, checked, val, penId, pen);
//   window.meta2d.setValue({
//     id: penId,
//     checked,
//   })
// }
function renderData(data, dom, pen) {
  if (Array.isArray(data)) {
    generateStyle(pen);
    const lTree = document.createElement('div');
    lTree.className = 'l-tree';
    lTree.style.padding = '6px';

    const lTreeList = document.createElement('div');
    lTreeList.className = 'l-tree-list';
    const showIds = collectExpandShowIds(data, pen);
    addLevelToTree(data);
    // const siblings = recursionFindSiblings(data, "10");
    // console.log(showIds, 'showIds');
    const frag = generateDomByData(data, null, pen, null, showIds, [], generateDomByData);
    // console.log(frag, lTreeList, 'frag');
    lTreeList.appendChild(frag);

    lTree.appendChild(lTreeList);
    dom.appendChild(lTree);
  }
}
function recursionFindParentByChildKey(data, key) {
  for (let i = 0; i < data.length; i++) {
    const item = data[i];
    if (Array.isArray(item.children) && item.children.findIndex(el => el.value === key) > -1) {
      return item;
    }
    if (item.children && item.children.length > 0) {
      const ret = recursionFindParentByChildKey(item.children, key);
      if (ret) {
        return ret;
      }
    }
  }
}
function generateDomByData(data, lTreeList, pen, opt, showIds, hideIds, fn?) {
  const frag = document.createDocumentFragment();
  for (let i = 0; i < data.length; i++) {
    // 添加标题
    const lTreeItem = document.createElement('div')
    lTreeItem.className = 'l-tree-item';
    // 控制层级的显示与隐藏
    if (data[i].level === 0 || showIds.includes(data[i].value)) {
      // 默认显示第一级
      lTreeItem.classList.add('l-visible')
    } else {
      // 超过第一级的都隐藏
      lTreeItem.classList.add('l-hidden')
    }
    // 控制展开与收起
    if (pen.expanded.includes(data[i].value)) {
      lTreeItem.classList.add('l-item-open')
    }
    // 控制disabled
    if(pen.multiple && pen.onlyLeafCheck && data[i].children && data[i].children.length > 0){
      lTreeItem.classList.add('l-disabled')
    }

    lTreeItem.dataset.penId = pen.id;
    lTreeItem.style.display = 'flex';
    lTreeItem.style.flexWrap = 'nowrap';
    lTreeItem.style.alignItems = 'center';
    lTreeItem.style.padding = `0 0 0 calc(24px * var(--level))`;
    lTreeItem.dataset.value = data[i].value;
    // find parent
    const parent = recursionFindParentByChildKey(pen.data, data[i].value);
    // console.log(parent, 'parent');
    if (parent) {
      lTreeItem.dataset.pid = parent.value;
    }
    if (!opt) {
      lTreeItem.dataset.level = data[i].level + '';
      lTreeItem.style.setProperty("--level", data[i].level + '');
    } else {
      lTreeItem.dataset.level = opt.level + '';
      lTreeItem.style.setProperty("--level", opt.level + '');
    }

    let key = data[i].value;
    let arrow = `<svg t="1550632829702" class="icon" data-key=${key} style="width:12px;height:12px;" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="1783" xmlns:xlink="http://www.w3.org/1999/xlink" width="100%" height="100%"><defs><style type="text/css"></style></defs><path data-key=${key} d="M959.52557 254.29773 511.674589 702.334953 63.824631 254.29773Z" p-id="1784"></path></svg>`
    // 设置箭头
    if (!data[i].children || data[i].children?.length == 0) {
      arrow = ''
    }
    const lTreeIcon = document.createElement("span");
    if (arrow) {
      lTreeIcon.className = 'to__downList';
      lTreeIcon.innerHTML = arrow;
      lTreeIcon.dataset.key = key;
      lTreeIcon.id = key;
      lTreeIcon.dataset.penId = pen.id;
      lTreeIcon.dataset.level = data[i].level + '';
      lTreeIcon.onclick = treeIconClick;
    }
    lTreeItem.appendChild(lTreeIcon)

    const lTreeLable = document.createElement("label");
    lTreeLable.style.marginLeft = '8px';
    lTreeLable.style.whiteSpace = 'nowrap';
    lTreeLable.style.width = '100%';
    lTreeLable.style.height = '100%';
    lTreeLable.style.lineHeight = '100%';
    lTreeLable.style.display = 'inline-block';
    lTreeLable.style.fontSize = '18px';
    lTreeLable.style.paddingLeft = '6px';
    lTreeLable.style.borderRadius = '4px';
    lTreeLable.className = 'l_tree_lable';
    if (pen.multiple && pen.checked.includes(data[i].value)) {
      lTreeLable.classList.add('l-is-checked')
    } else {
      if (pen.checked.length > 0 && pen.checked[0] === data[i].value) {
        lTreeLable.classList.add('l-is-checked')
      }
    }

    // checkboxDom
    if (pen.multiple) {
      const checkboxDom = document.createElement("input");
      checkboxDom.type = "checkbox";
      checkboxDom.name = "cName";
      checkboxDom.className = 'l-checkbox__former';
      // checkboxDom.style.width = '18px';
      // checkboxDom.style.height = '18px';
      // checkboxDom.style.verticalAlign = 'middle';
      if (pen.checked.includes(data[i].value)) {
        checkboxDom.checked = true;
      }
      checkboxDom.dataset.value = data[i].value;
      checkboxDom.dataset.penId = pen.id;
      // checkboxDom.onclick = checkboxClick;
      lTreeLable.appendChild(checkboxDom);

      const checkDom = document.createElement("span");
      // checkDom.style.marginLeft = '-80px';
      // checkDom.style.paddingLeft = '100px';
      // checkDom.style.width = '16px';
      // checkDom.style.height = '16px';
      // checkDom.style.whiteSpace = 'nowrap';
      // checkDom.style.marginBottom = '8px';
      checkDom.className = 'l-checkbox__input';
      checkDom.dataset.penId = pen.id;
      checkDom.dataset.value = data[i].value;
      if (parent) {
        checkDom.dataset.pid = parent.value;
      }
      checkDom.addEventListener('click', checkboxNewClick);
      lTreeLable.appendChild(checkDom);
    }

    // label
    const labelDom = document.createElement("span");
    labelDom.className = "l-checkbox_label";
    labelDom.style.display = 'inline-block';
    labelDom.style.height = '40px';
    labelDom.style.lineHeight = '40px';
    labelDom.style.width = 'calc(100% - 18px)';
    labelDom.style.marginLeft = '6px';
    labelDom.innerHTML = data[i].label + '-' + data[i].value;
    labelDom.dataset.key = data[i].value;
    labelDom.dataset.penId = pen.id;
    labelDom.dataset.value = data[i].value;
    labelDom.onclick = lableClick;
    // 添加到lTreeLable
    lTreeLable.appendChild(labelDom);

    lTreeItem.appendChild(lTreeLable)
    if (!opt) {
      // lTreeList.appendChild(lTreeItem)
      frag.appendChild(lTreeItem);
    } else {
      // lTreeList.insertBefore(lTreeItem, lTreeList.children[opt.index + i])
      frag.insertBefore(lTreeItem, frag.children[opt.index + i]);
    }
    // const toItemDom = document.createElement("div");
    // toItemDom.style.marginLeft = '-80px';
    // toItemDom.style.paddingLeft = '100px';
    // toItemDom.style.height = '40px';
    // toItemDom.style.lineHeight = '40px';
    // toItemDom.style.whiteSpace = 'nowrap';
    // toItemDom.style.marginBottom = '8px';
    // toItemDom.className = 'to__item level-' + level + ' item-key-' + data[i].key;

    // item.appendChild(toItemDom);
    // if (data[i].children?.length > 0 || data[i].children) {
    //   toItemDom.appendChild(arrowDom)
    // }
    // toItemDom.appendChild(rightDom)

    // 添加子元素
    // const subItem = document.createElement('div')
    // if (!pen.expanded.includes(data[i].key)) {
    //   subItem.className = 'to__subItem_' + data[i].key
    // } else {
    //   subItem.className = 'to__subItem_' + data[i].key + ' to__show'
    // }
    // subItem.dataset.key = data[i].key;
    // subItem.style.display = 'none'
    // subItem.style.paddingLeft = '24px'
    // item.appendChild(subItem)


    // 递归
    if (fn) {
      if (data[i].children?.length > 0) {
        // level++
        const childFrag = fn(data[i].children, lTreeList, pen, null, showIds, [], fn)
        frag.appendChild(childFrag);
      } else {
        if (i == data.length - 1) {
          // level = 0
        }
      }
    }
  }
  return frag;
}
function addLevelToTree(tree, level = 0) {
  // 遍历当前层级的节点
  tree.forEach(item => {
    // 为当前节点添加 level 属性
    item.level = level;

    // 如果当前节点有子节点，递归处理子节点
    if (item.children && item.children.length > 0) {
      addLevelToTree(item.children, level + 1);
    }
  });
}
/**
 * @description 手风琴模式下，展开节点时，关闭兄弟节点的展开状态
 * @author Joseph Ho
 * @date 07/11/2024
 * @param {*} id
 */
function handleToggleExpand(accordion, data, expandedKeys, key) {
  // 展开节点
  if (!expandedKeys.includes(key)) {
    // 手风琴模式
    if (accordion) {
      // console.log('accordion');
      // 所有兄弟节点id
      const siblings = recursionFindSiblings(data, key);
      // console.log(siblings, 'siblings');
      // console.log(expandedKeys.filter(key => !siblings.includes(key),), 'expandedKeys');
      // const siblings = Object.values(this.treeNodesMap)
      //   .filter(
      //     node => node.parentId === treeNode.parentId && node.id !== id,
      //   )
      //   .map(node => node.id);
      // 剔除兄弟节点
      return {
        list: expandedKeys.filter(
          key => !siblings.includes(key),
        ), siblings
      };
    }
  }
  return { list: expandedKeys, siblings: [] };
}
/** 
 * @description 收集要展开显示的子节点的id
 * @author Joseph Ho
 * @date 07/11/2024
 * @param {*} data
 * @param {*} pen
 * @returns {*}  
 */
function collectExpandShowIds(data, pen) {
  const expandList = [];
  if (pen.expanded && pen.expanded.length > 0) {
    for (let i = 0; i < pen.expanded.length; i++) {
      const id = pen.expanded[i];
      // console.log(JSON.stringify(pen.expanded), JSON.stringify(pen.showIds), ' pen.expanded');
      const item = recursionTreeFindItem(data, id);
      if (item && Array.isArray(item.children) && item.children.length > 0) {
        expandList.push(...item.children.map(el => el.value));
      }
    }
  }
  return expandList;
}
// 判断特定样式表中是否存在某条 CSS 规则
function hasCSSRuleInSheet(sheet, ruleText) {
  try {
    const rules = sheet.cssRules || sheet.rules;
    for (let i = 0; i < rules.length; i++) {
      if (rules[i].cssText === ruleText) {
        return true;
      }
    }
  } catch (e) {
    // 忽略跨域样式表的错误
    // console.error('Error accessing style sheet:', e);
  }
  return false;
}
// 插入新的 CSS 规则到特定样式表
function insertCSSRuleInSheet(sheet, ruleText) {
  sheet.insertRule(ruleText, sheet.cssRules.length);
}
const style_prefix = 'style_';
function generateStyle(pen) {
  let extraStyle = document.createElement('style');
  extraStyle.type = 'text/css';
  extraStyle.id = style_prefix + pen.id;
  document.head.appendChild(extraStyle);
  let sheet1 = extraStyle.sheet;
  if (pen.styles && pen.styles.length > 0) {
    pen.styles.forEach((rule) => {
      // sheet.insertRule(rule + '}', sheet.cssRules.length);
      const ruleToCheck = rule + '}';
      if (!hasCSSRuleInSheet(sheet1, ruleToCheck)) {
        insertCSSRuleInSheet(sheet1, ruleToCheck);
        // console.log(`The rule "${ruleToCheck}" was inserted.`);
      } else {
        // console.log(`The rule "${ruleToCheck}" already exists.`);
      }
    });
  }


  let style = document.createElement('style');
  style.type = 'text/css';
  document.head.appendChild(style);
  let sheet = style.sheet;

  const defaultText = pen.defaultText ? pen.defaultText : '请选择';
  sheet.insertRule(`
  .${TAG_WRAPPER}${pen.id}::before {
    content: '${defaultText}';
    display: block;
    color: gray;
  }
  `)
  sheet.insertRule(`
  .${TAG_WRAPPER}${pen.id}:not(:empty)::before {
    display: none;
  }
  `)
  sheet.insertRule(`
  .l-is-hidden[class^="l-select__dropdown-inner_"]{
    visibility: hidden; 
  }
  `)
  sheet.insertRule(
    `div[class^="to__subItem"].to__show {
      display: block !important;
    }`
  );
  sheet.insertRule(
    `.l-tree{
      max-height: 300px;
    }`
  );
  sheet.insertRule(
    `.l-tree .l-visible{
      display: flex;
    }`
  );
  sheet.insertRule(
    `.l-tree .l-hidden{
      max-height: 0;
      overflow: hidden;
    }`
  );
  // sheet.insertRule(
  //   `.l-tree .l-disabled{
  //     cursor: not-allowed;
  //   }`
  // );
  sheet.insertRule(
    `.l-tree .l-tree-item.l-disabled .l_tree_lable{
      cursor: not-allowed;
      pointer-events: none;
      background-color: #fff;
      color: rgba(0, 0, 0, 0.26);
    }`
  );
  // sheet.insertRule(
  //   `.l-tree .l-disabled .l_tree_lable{
  //     cursor: not-allowed;
  //     background-color: #fff;
  //     color: rgba(0, 0, 0, 0.26);
  //   }`
  // );
  sheet.insertRule(
    `.to__downList .icon{
      transform: rotate(-90deg);
    }`
  );
  sheet.insertRule(
    `.l-tree-item.l-item-open .to__downList .icon{
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
  sheet.insertRule(`
  .l-tree__input{
    width: 100%;
    height: ${pen.height}px;
    overflow: auto;
    padding: 0 8px;
    border: 1px solid #ccc;
    borderRadius: 4px;
    // whiteSpace: nowrap;
    background: transparent;
  }
  `)
  sheet.insertRule(`
  .l-checkbox__former {
    border: 0;
    clip: rect(0 0 0 0);
    height: 1px;
    margin: -1px;
    overflow: hidden;
    padding: 0;
    position: absolute;
    width: 1px;
    outline: 0;
    appearance: none;
}
  `)
  sheet.insertRule(`
  .l_checkbox_input{
      position: relative;
      display: inline-block;
      width: 16px;
      height: 16px;
      vertical-align: middle;
      border: 1px solid #dcdcdc;
      border-radius: 3px;
      background-color: #fff;
      box-sizing: border-box;
  }
  `)
  sheet.insertRule(`
  .l-checkbox__input {
    position: relative;
    display: inline-block;
    width: 16px;
    height: 16px;
    vertical-align: middle;
    border: 1px solid #dcdcdc;
    border-radius: 3px;
    // background-color: var(--td-bg-color-container);
    box-sizing: border-box;
}
  `)
  sheet.insertRule(`
  .l_tree_lable.l-is-checked {
    font-weight: 500;
    color: rgba(0, 0, 0, 0.9);
    background-color: #f2f3ff;
}
  `)
  sheet.insertRule(`
  .l_tree_lable.l-is-checked .l-checkbox__input {
    border-color: #0052d9;
    background-color: #0052d9;
    transition: background-color .2s cubic-bezier(.82,0,1,.9);
}
  `)
  sheet.insertRule(`
  .l-checkbox__input:after {
    content: "";
    position: absolute;
    opacity: 0;
    box-sizing: border-box;
}
  `)
  sheet.insertRule(`
  .l_tree_lable.l-is-checked .l-checkbox__input:after {
    opacity: 1;
    top: 6px;
    left: 3px;
    width: 5px;
    height: 9px;
    border: 2px solid #fff;
    border-radius: 0 0 1px;
    border-top: 0;
    border-left: 0;
    transform: rotate(45deg) scale(1) translate(-50%, -50%);
    background: transparent;
}
  `)
  sheet.insertRule(`
  .l_tree_lable.l-is-indeterminate .l-checkbox__input:after {
    opacity: 1;
    width: 16px;
    height: 4px;
    left: -1px;
    right: 0;
    top: 5px;
    border: unset;
    transform: scale(.5);
    background-color: white;
}
  `)
  sheet.insertRule(`
  .l_tree_lable.l-is-indeterminate .l-checkbox__input {
    border-color: #0052d9;
    background-color: #0052d9;;
    transition: background-color .2s cubic-bezier(.82,0,1,.9);
}
  `)
}