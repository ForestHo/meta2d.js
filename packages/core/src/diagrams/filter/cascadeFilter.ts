import { movingSuffix } from '../../canvas';
import { Pen, setElemPosition } from '../../pen';
import { Point } from '../../point';
import { rectInRect } from '../../rect';
import { deepClone, debounce } from '../../utils';

const TAG_WRAPPER = 'ctag_wrapper_';
const TAG_PREFIX = 'ctag_';
const DROPMENU_PREFIX = 'l-cascade-dropdown-';
const CASCADE_PREFIX = 'l-cascader-';
const DIV = 'DIV';
export function cascadeFilter(pen: Pen): Path2D {
  if (!pen.onDestroy) {
    pen.onDestroy = onDestroy;
    pen.onMouseUp = onMouseUp;
    pen.onResize = resize;
    pen.onMouseEnter = onMouseEnter;
    pen.onMouseLeave = onMouseLeave;
    pen.onRenderPenRaw = renderPenRaw;
    pen.onRenderPenRaw2 = renderPenRaw2;

  }
  const { x, y, width, height } = pen.calculative.worldRect;
  if (!pen.calculative.singleton) {
    pen.calculative.singleton = {};
  }
  if (!pen.calculative.singleton.div) {
    // 校验修正参数
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
    // container.style.width = '100%';
    // container.style.height = '100%';
    // 输入框
    const input = assembleInputBox(pen);
    container.appendChild(input);
    // // 下拉选项
    const dropMenu = document.createElement("div");
    dropMenu.style.position = 'absolute';
    dropMenu.style.left = '0';
    dropMenu.style.top = 'calc(100% + 6px)';
    // dropMenu.style.width = '100%';
    dropMenu.style.background = 'rgba(255, 255, 255, 0.9)';
    dropMenu.style.border = '1px solid #ccc';
    dropMenu.style.borderRadius = '4px';
    dropMenu.className = DROPMENU_PREFIX + pen.id;
    dropMenu.style.display = 'block';
    dropMenu.style.overflow = 'auto';
    // dropMenu.style.pointerEvents = 'initial';
    container.appendChild(dropMenu);

    div.appendChild(container);
    // 2.加载到div layer
    pen.calculative.canvas.externalElements?.parentElement.appendChild(div);
    setElemPosition(pen, div);
    pen.calculative.singleton.div = div;


    renderData(pen.data, dropMenu, pen)
  }
  const path = new Path2D();
  return path;
}
function renderData(data, dom, pen) {
  if (Object.prototype.toString.call(data) === '[object Array]') {
    generateStyle(pen);
    const lPanel = document.createElement('div');
    lPanel.className = 'l-cascader__panel l-cascader--normal';
    lPanel.style.display = 'flex';
    lPanel.style.padding = '6px';

    const flowPath = [];
    getTreeFlowPathDefault(data, flowPath, item => item === 0);
    const opt = {
      penId: pen.id,
      checked: pen.checked,
    };
    const fragMent = generateDomByData(pen, data, flowPath, opt);
    // console.log(fragMent.children.length)
    lPanel.appendChild(fragMent);
    dom.appendChild(lPanel);


    window.meta2d.setValue({
      id: pen.id,
      flowPath,
    })
    if (pen.checked) {
      for (let i = 0; i < pen.checked.length; i++) {
        const ck = pen.checked[i];
        updateTags(true, pen.checked, ck, pen.id, pen);
      }
      adjustHeight(pen);
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
function validateData(pen: Pen) {
  const obj = {
    id: pen.id,
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
      if (item && item.children?.length > 0) {
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


  // if (pen.expandAll) {
  //   const ids = []
  //   collectExpandIds(pen.data, ids)
  //   Object.assign(obj, {
  //     expanded: ids
  //   })
  // }

  window.meta2d.setValue(obj, { render: false });
}
function recursionTreeFindAllIds(data, ids) {
  for (let i = 0; i < data.length; i++) {
    ids.push(data[i].value);
    if (data[i].children?.length > 0) {
      recursionTreeFindAllIds(data[i].children, ids);
    }
  }
}
function getTreeFlowPathDefault(data, flowPath, fn) {
  for (let i = 0; i < data.length; i++) {
    const item = data[i];
    if (fn(i, item)) {
      flowPath.push(item.value);
      if (item.children && item.children.length > 0) {
        getTreeFlowPathDefault(item.children, flowPath, fn);
      }
    }
  }
}
function generateDomByData(pen, data, flowPath, opt) {
  const levelList = data.filter(el => el.value === flowPath[0]);
  const level = getLevel(levelList);
  const fragMent = document.createDocumentFragment();
  for (let i = 0; i < level; i++) {
    const cascaderMenu = document.createElement('ul');
    cascaderMenu.className = 'l-cascader__menu';

    // 生成li
    const liFragWrapper = document.createDocumentFragment();
    const liChilds = getChildrenByLevel(data, i, flowPath);
    if (liChilds) {
      for (let k = 0; k < liChilds.length; k++) {
        const liItem = liChilds[k];
        const liDom = assembleLi(pen, liItem, i, opt);
        if (liItem.value === flowPath[i]) {
          liDom.className += ' l-is-expanded';
        }
        liFragWrapper.appendChild(liDom);
      }
      cascaderMenu.appendChild(liFragWrapper);
    }


    if (i !== level - 1) {
      cascaderMenu.className += ' l-cascader__menu--segment';
    }
    fragMent.appendChild(cascaderMenu);
  }

  return fragMent;
}
function getChildrenByLevel(data, level, flowPath) {
  if (level === 0) {
    return data;
  } else {
    return recursionFindItem(data, level, flowPath);
  }
}
// 广度优先遍历
function recursionFindItem(data, level, flowPath) {
  for (let i = 0; i < data.length; i++) {
    const item = data[i];
    if (item.children && item.children.findIndex(el => el.value === flowPath[level]) > -1) {
      return item.children;
    }
    if (item.children && item.children.length > 0) {
      const ret = recursionFindItem(item.children, level, flowPath);
      if (ret) {
        return ret;
      }
    }
  }
}
function onDestroy(pen: Pen) {
  if (pen.calculative.singleton && pen.calculative.singleton.div) {
    pen.calculative.singleton.div.remove();

    delete pen.calculative.singleton.div;
  }
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
function resize(pen: any) {
  setElemPosition(pen, pen.calculative.singleton.div);
}
function renderPenRaw(pen: Pen, mkey: string, data: any, params) {
  const { level } = params;
  const _level = parseInt(level);
  const nextLevel = _level + 1;
  // console.log('renderPenRaw', params)
  const flowPath = [];
  getTreeFlowPathDefault(data, flowPath, item => item === 0);
  const opt = {
    penId: pen.id,
    checked: pen.checked,
  };
  const fragMent = generateDomByData(pen, data, flowPath, opt);
  const cascaderPanel = document.querySelector('.l-cascader__panel');
  if (cascaderPanel.children[nextLevel]) {
    cascaderPanel.replaceChild(fragMent, cascaderPanel.children[nextLevel]);
  } else {
    cascaderPanel.appendChild(fragMent);
  }
}
function renderPenRaw2(pen: Pen, data: any) {
  let flowPath = [];
  if (pen.flowPath.length > 0) {
    flowPath = deepClone(pen.flowPath);
  } else {
    getTreeFlowPathDefault(data, flowPath, item => item === 0);
  }
  const opt = {
    penId: pen.id,
    checked: pen.checked,
  };
  const cascaderPanel = document.querySelector('.l-cascader__panel');
  const fragMent = generateDomByData(pen, pen.data, flowPath, opt);
  cascaderPanel.replaceChildren(fragMent);


  if (pen.checked.length === 0 && !pen.multiple) {
    // 清空tag
    const tagWrapper = document.getElementsByClassName(`${TAG_WRAPPER}${pen.id}`)[0];
    tagWrapper.innerHTML = '';
    adjustHeight(pen);
  }
}
// 计算方法
function getLevel(arr) {
  let maxLevel = 0;
  (function callBack(arr, level) {
    ++level;
    maxLevel = Math.max(level, maxLevel);
    for (let i = 0; i < arr.length; i++) {
      let item = arr[i];
      if (item.children && item.children.length > 0) {
        callBack(item.children, level);
      } else {
        // delete item.children;
      }
    }
  })(arr, 0);
  return maxLevel;
};
function assembleInputBox(pen: Pen) {
  const box = document.createElement("div");
  box.className = 'l-cascader__input';
  // box.style.width = '100%';
  // box.style.height = '100%';
  // box.style.padding = '0 8px';
  // box.style.border = '1px solid #ccc';
  // box.style.borderRadius = '4px';
  // // box.style.whiteSpace = 'nowrap';
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
  input.className = `${CASCADE_PREFIX}${pen.id}`;
  input.dataset.penId = pen.id;
  input.oninput = debounce(onInputchange, 1000)


  const input_prefix = document.createElement("div");
  input_prefix.style.display = 'inline';
  input_prefix.style.textAlign = 'left';
  input_prefix.className = TAG_WRAPPER + pen.id;

  const frag = document.createDocumentFragment();
  // for (let i = 0; i < pen.checked.length; i++) {
  //   const key = pen.checked[i];
  //   const title = recursionFindTitle(pen.data, key);
  //   const e = assembleTag(key, title, pen.id);
  //   frag.appendChild(e);
  // }
  input_prefix.appendChild(frag);
  box.appendChild(input_prefix);

  box.appendChild(input);
  return box;
}
function onInputchange(e) {
  const { value } = e.target;
  // 过滤树结构
  const penId = e.target.dataset.penId;
  const pen = window.meta2d.findOne(penId);
  if (!pen || !pen.filterable) {
    return;
  }
  const cascaderPanel = document.querySelector('.l-cascader__panel');
  if (value) {
    const paths = getAllPaths(pen.data);
    const filterPaths = paths.filter(el => el.some(item => item.label.includes(value)));
    updateDropdown(pen, cascaderPanel, filterPaths)
  } else {
    const flowPath = [];
    getTreeFlowPathDefault(pen.data, flowPath, item => item === 0);
    const opt = {
      penId: pen.id,
      checked: pen.checked,
    };
    const fragMent = generateDomByData(pen, pen.data, flowPath, opt);
    cascaderPanel.replaceChildren(fragMent);

    setTimeout(() => {
      // 根据最新的tag去更新checked
      const checkedIds = deepClone(pen.checked);
      const halfIds = [];
      recursionDownTree(pen.data, pen.checked, halfIds);
      // reviewChecked(cascaderPanel, pen, pen.data, checkedIds);
      reviewPanel(pen, cascaderPanel, checkedIds, halfIds);
    }, 20)
  }
}
function reviewPanel(pen, cascaderPanel, checkedIds, halfIds) {
  // 先全部清空
  const list = cascaderPanel.querySelectorAll('.l-cascader__item');
  for (let i = 0; i < list.length; i++) {
    const item = list[i];
    if (item.firstChild.classList.contains('l-is-checked')) {
      item.firstChild.classList.remove('l-is-checked');
    }
    if (item.firstChild.classList.contains('l-is-indeterminate')) {
      item.firstChild.classList.remove('l-is-indeterminate');
    }
  }

  for (let i = 0; i < checkedIds.length; i++) {
    const ck = checkedIds[i];
    const item = cascaderPanel.querySelector(`.l-cascader__item[data-value="${ck}"]`);
    if (item) {
      item.firstChild.classList.add('l-is-checked');
    }
  }
  for (let i = 0; i < halfIds.length; i++) {
    const halfId = halfIds[i];
    const item = cascaderPanel.querySelector(`.l-cascader__item[data-value="${halfId}"]`);
    if (item) {
      item.firstChild.classList.add('l-is-indeterminate');
    }
  }
}
function reviewChecked(cascaderPanel, pen, data, checkedIds) {
  for (let i = 0; i < checkedIds.length; i++) {
    const ck = checkedIds[i];
    const item = cascaderPanel.querySelector(`.l-cascader__item[data-value="${ck}"]`);
    if (item) {
      item.firstChild.classList.add('l-is-checked');
    }
    const isLeaf = isLeafNode(data, ck);
    // console.log(ck, isLeaf, 'isLeaf');
    if (isLeaf) {
      // 向上更新父节点
      {
        //勾选
        // const currentItem = recursionTreeFindItem(data, ck);
        // console.log(222222)
        // if (currentItem && currentItem.children?.length > 0) {
        //   const ids = [];
        //   recursionTreeFindAllIds(currentItem.children, ids);
        //   console.log(value, JSON.stringify(ids), 'check on ids');
        //   for (let k = 0; k < ids.length; k++) {
        //     const id = ids[k];
        //     if (!checkedIds.includes(id)) {
        //       checkedIds.push(id);
        //     }
        //   }
        // }
        // checkedIds.push(value);
        // console.log('check on 0000', JSON.stringify(checkedIds));
        // const dropMenu = document.querySelector(`.${DROPMENU_PREFIX}${pen.id}`);
        // checkChild(dropMenu, checkedIds);

        const parent = recursionFindParentByChildKey(pen.data, ck);
        const halfIds = [];
        // const lTreeList = dropMenu.querySelector('.l-tree-list');
        // console.log('check on', parent.value, JSON.stringify(checkedIds));
        recursionUpTree(cascaderPanel, pen.data, checkedIds, parent.value, ck, true, halfIds, pen.id);
        // console.log('check on recursionUpTree after', JSON.stringify(checkedIds));
      }
    } else {

    }
  }
}
function isLeafNode(data, value) {
  const item = recursionTreeFindItem(data, value);
  return !(item.children?.length > 0);
}
function updateDropdown(pen, cascaderPanel, filterPaths) {
  for (let k = 0; k < cascaderPanel.children.length; k++) {
    if (k !== 0) {
      cascaderPanel.children[k].remove();
      k--;
    }
  }
  // 更新当前层级的active,当前层级的dom肯定是存在的
  const liFragWrapper = document.createDocumentFragment();
  //  const liChilds = recursionFindItem([startNode], startIndex, flowPath);
  if (filterPaths.length > 0) {
    const opt = {
      penId: pen.id,
      checked: pen.checked,
    }
    for (let n = 0; n < filterPaths.length; n++) {
      const item = filterPaths[n];
      const obj = {
        label: item.map(el => el.label).join('/'),
        value: item[item.length - 1].value,
        children: item.children
      }
      let level = item.length - 1;
      const liDom = assembleLi(pen, obj, level, opt);
      //  if (liItem.value === flowPath[startIndex]) {
      //    liDom.className += ' l-is-expanded';
      //  }
      liFragWrapper.appendChild(liDom);
    }
    if (cascaderPanel.children[0].className.indexOf('l-cascader__menu--filter') === -1) {
      cascaderPanel.children[0].className += ' l-cascader__menu--filter';
    }
    cascaderPanel.children[0].replaceChildren(liFragWrapper);
  } else {
    const emptyDom = document.createElement('div');
    emptyDom.style.textAlign = 'center';
    emptyDom.style.padding = '8px';
    emptyDom.className = 'l-cascader-panel-empty';
    emptyDom.innerHTML = '暂无数据';
    cascaderPanel.children[0].replaceChildren(emptyDom);
  }

}
// 获取所有路径的函数
function getAllPaths(nodes, currentPath = [], allPaths = []) {
  nodes.forEach(node => {
    const type = typeof node.children;
    const obj = { value: node.value, label: node.label }
    Object.assign(obj, type === 'boolean' ? { children: node.children } : {});
    const newPath = [...currentPath, obj]; // 添加当前节点到路径

    if (node.children && node.children.length > 0) {
      // 如果有子节点，递归处理子节点
      getAllPaths(node.children, newPath, allPaths);
    } else {
      // 如果没有子节点，说明这是一个叶子节点，将路径加入结果列表
      allPaths.push(newPath);
    }
  });

  return allPaths;
}
function getEveryBranchByTree(data, value, paths, level) {
  level++;
  for (let i = 0; i < data.length; i++) {
    const item = data[i];
    paths.push(item.value);
    if (item.children && item.children.length > 0) {
      getEveryBranchByTree(item.children, value, paths, level);
      paths.push("kk");
    }
  }
}
function recursionFindTitle(data, key, val) {
  for (let i = 0; i < data.length; i++) {
    if (data[i][key] === val) {
      return data[i].label;
    }
    if (data[i].children?.length > 0) {
      const title = recursionFindTitle(data[i].children, key, val);
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
function tagClose(e) {
  e.stopPropagation();
  e.cancelBubble = true;
  const { penId, value } = this.dataset;
  // const tagDom = document.getElementsByClassName(`${e.target.dataset.key}`)[0];
  // const penId = tagDom.dataset.penId;
  const pen = window.meta2d.findOne(penId);
  if (!pen) {
    return;
  }
  const checkedList = deepClone(pen.checked);
  const index = checkedList.indexOf(value);
  if (index > -1) {
    checkedList.splice(index, 1);
  }
  window.meta2d.setValue({
    id: penId,
    checked: checkedList,
  })
  // tagDom.remove();

  // 更新cascader的checked状态
  const dropMenu = document.querySelector(`.${DROPMENU_PREFIX}${pen.id}`);
  const cascaderPanel = dropMenu.querySelector('.l-cascader__panel');
  const curItem = cascaderPanel.querySelector(`.l-cascader__item[data-value="${value}"]`);
  // console.log(curItem, 'curItem');
  if (!curItem) {
    this.parentElement.remove();
    // 根据最新的tag去更新checked
    const halfIds = [];
    recursionDownTree(pen.data, pen.checked, halfIds);
    // console.log('tagClose', JSON.stringify(checkedList), JSON.stringify(halfIds));
    // reviewChecked(cascaderPanel, pen, pen.data, checkedIds);
    reviewPanel(pen, cascaderPanel, checkedList, halfIds);
    return;
  }
  const { pid } = curItem.dataset;
  curItem.classList.remove('l-is-checked');
  // console.log(pid, value, 'checkedList');
  let checkedIds = deepClone(pen.checked);
  let halfCheckedIds = deepClone(pen.halfChecked);
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
    // const lTreeList = dropMenu.querySelector('.l-tree-list');
    recursionUpTree(cascaderPanel, pen.data, checkedIds, pid, value, false, halfIds, penId);
  }
  //根据最新的checked情况，更新checked数据
  // const list = [];
  // const checkedItems = lTreeList.querySelectorAll('.l_tree_lable.l-is-checked');
  // for (let i = 0; i < checkedItems.length; i++) {
  //   const ck = checkedItems[i];
  //   list.push(ck.parentElement.dataset.value);
  // }

  window.meta2d.setValue({
    id: penId,
    checked: checkedIds
  })

  // 根据最新的checked情况，更新checked的tag
  replaceAlltags(penId, checkedIds);

  return;
  const flowPath = [];
  getTreeFlowPathDefault(pen.data, flowPath, item => item === 0);
  const opt = {
    penId: pen.id,
    checked: checkedIds,
  };
  const fragMent = generateDomByData(pen, pen.data, flowPath, opt);
  // const cascaderPanel = document.querySelector('.l-cascader__panel');
  cascaderPanel.replaceChildren(fragMent);

  // 更新树结构的checked

  // 更新高度
  // adjustHeight(pen);
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
// 生成li
function assembleLi(pen, item, level, opt) {
  const li = document.createElement('li');
  li.className = 'l-cascader__item';
  li.dataset.value = item.value;
  li.dataset.penId = opt.penId;
  li.dataset.level = level;
  li.onclick = liOnClick;

  const parent = recursionFindParentByChildKey(pen.data, item.value);
  if (parent) {
    li.dataset.pid = parent.value;
  }
  const label = document.createElement('label');
  label.className = 'l-cascader-checkbox';
  if (pen.multiple && pen.checked.includes(item.value)) {
    label.classList.add('l-is-checked')
  } else {
    if (pen.checked.length > 0 && pen.checked[0] === item.value) {
      label.classList.add('l-is-checked')
    }
  }

  // checkboxDom
  if (pen.multiple) {
    const inputDom = document.createElement('input');
    inputDom.type = 'checkbox';
    inputDom.className = 'l-cascader-checkbox-former';
    inputDom.dataset.penId = opt.penId;
    inputDom.dataset.value = item.value;
    inputDom.dataset.level = level;
    if (pen.checked?.indexOf(item.value) > -1) {
      inputDom.checked = true;
    }
    // inputDom.onclick = checkboxClick;
    label.appendChild(inputDom);

    const checkDom = document.createElement('span');
    checkDom.className = 'l-cascader-checkbox-input';
    checkDom.dataset.penId = pen.id;
    checkDom.dataset.value = item.value;
    if (parent) {
      checkDom.dataset.pid = parent.value;
    }
    checkDom.addEventListener('click', checkboxNewClick);
    label.appendChild(checkDom);
  }

  const spanLabel = document.createElement('span');
  spanLabel.className = 'l-cascader-checkbox-label';
  spanLabel.innerHTML = item.label;
  spanLabel.dataset.penId = opt.penId;
  spanLabel.dataset.value = item.value;
  spanLabel.dataset.level = level;
  spanLabel.addEventListener('click', labelClick);
  label.appendChild(spanLabel);

  li.appendChild(label);

  if (item.children) {
    // console.log('item.children', item.value)
    const svgDom = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svgDom.setAttribute('viewBox', '0 0 24 24');
    svgDom.style.fill = 'none';
    svgDom.style.width = '1em';
    svgDom.dataset.value = item.value;
    svgDom.dataset.penId = opt.penId;
    svgDom.dataset.level = level;
    svgDom.setAttribute("class", "l-icon l-cascader__item-icon");
    svgDom.onclick = nextLevelClick;

    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.dataset.value = item.value;
    path.dataset.penId = opt.penId;
    path.setAttribute('fill', 'currentColor');
    path.setAttribute('d', 'M8.09 17.5l5.5-5.5-5.5-5.5L9.5 5.09 16.41 12 9.5 18.91 8.09 17.5z');
    svgDom.appendChild(path);

    li.appendChild(svgDom);
  }
  return li;
}
function checkboxNewClick(e) {
  // console.log('checkboxNewClick');
  e.stopPropagation();
  // console.log(this,this.previousElementSibling, 'e.target');
  const { penId, value } = this.dataset;
  const { pid } = this.parentElement.parentElement.dataset;
  // const checkDom = document.querySelector(`.l-checkbox__former[data-value="${value}"]`);
  // console.log(11111,checkDom,checkDom.checked);
  // checkDom.checked = !checkDom.checked;
  // console.log(e.target.parentElement, 'penId, value');
  const rawChecked = this.parentElement.classList.contains('l-is-checked');
  // console.log(rawChecked, 'rawChecked');
  if (rawChecked) {
    this.parentElement.classList.remove('l-is-checked');
  } else {
    this.parentElement.classList.add('l-is-checked');

  }
  const checked = !rawChecked;
  // console.log(checked, pid, penId, value, 'checked');
  const pen = window.meta2d.findOne(penId);
  if (!pen) {
    return;
  }
  let checkedIds = deepClone(pen.checked);
  let halfCheckedIds = deepClone(pen.halfChecked);


  // console.log(checkedIds, checked, 'iddddd')
  const dropMenu = document.querySelector(`.${DROPMENU_PREFIX}${pen.id}`);
  const cascaderPanel = dropMenu.querySelector('.l-cascader__panel');
  if (checked) {
    //勾选
    const currentItem = recursionTreeFindItem(pen.data, value);
    // console.log(222222)
    if (currentItem && currentItem.children?.length > 0) {
      const ids = [];
      recursionTreeFindAllIds(currentItem.children, ids);
      // console.log(value, JSON.stringify(ids), 'check on ids');
      for (let k = 0; k < ids.length; k++) {
        const id = ids[k];
        if (!checkedIds.includes(id)) {
          checkedIds.push(id);
        }
      }
    }
    checkedIds.push(value);
    // console.log('check on 0000', JSON.stringify(checkedIds));
    const dropMenu = document.querySelector(`.${DROPMENU_PREFIX}${pen.id}`);
    checkChild(dropMenu, checkedIds);


    const halfIds = [];
    // const lTreeList = dropMenu.querySelector('.l-tree-list');
    // console.log('check on', JSON.stringify(checkedIds));
    recursionUpTree(cascaderPanel, pen.data, checkedIds, pid, value, checked, halfIds, penId);
    // console.log('check on recursionUpTree after', JSON.stringify(checkedIds));
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
    // const dropMenu = document.querySelector(`.${DROPMENU_PREFIX}${pen.id}`);
    checkChild(dropMenu, checkedIds);

    // 收集半选中的节点
    const halfIds = [];
    // const lTreeList = dropMenu.querySelector('.l-tree-list');
    // console.log('1111111111111111', lTreeList);
    recursionUpTree(cascaderPanel, pen.data, checkedIds, pid, value, checked, halfIds, penId);
  }
  //根据最新的checked情况，更新checked数据
  // const list = [];
  // const cascaderList = cascaderPanel.querySelectorAll('.l-cascader-checkbox.l-is-checked');
  // for (let i = 0; i < cascaderList.length; i++) {
  //   const ck = cascaderList[i];
  //   list.push(ck.parentElement.dataset.value);
  // }

  // 如果是搜索模式，还需要更新搜索模式下的checked
  if (pen.filterable) {
    const tagWrapper = document.querySelector(`.${TAG_WRAPPER}${pen.id}`);
    const text = tagWrapper.nextElementSibling.value;
    // console.log(text, JSON.stringify(checkedIds), 'text');
    if (text) {
      // 这种情况的勾选，更新checkedIds
      recursionAllTree(pen.data, checkedIds);
    }
  }

  // console.log(JSON.stringify(checkedIds), 'checkedIds end');
  window.meta2d.setValue({
    id: penId,
    checked: checkedIds
  })

  // 根据最新的checked情况，更新checked的tag
  replaceAlltags(penId, checkedIds);
}
function recursionAllTree(data, checkedIds) {
  for (let i = 0; i < data.length; i++) {
    const item = data[i];
    if (Array.isArray(item.children) && item.children.length > 0) {
      const childIds = [];
      recursionTreeFindAllIds(item.children, childIds);
      // console.log(JSON.stringify(childIds), 'childIds');
      const every = childIds.every(el => checkedIds.includes(el));
      // console.log(every, 'every');
      if (every) {
        if (!checkedIds.includes(item.value)) {
          checkedIds.push(item.value);
        }
      } else {
        if (checkedIds.includes(item.value)) {
          const index = checkedIds.findIndex(el => el === item.value);
          if (index > -1) {
            checkedIds.splice(index, 1);
          }
        }
      }
      recursionAllTree(item.children, checkedIds);
    }
  }
}
function recursionUpTree(cascaderPanel, data, checked, pid, value, checkVal, halfIds, penId) {
  // console.log('2222222222222', pid, value, JSON.stringify(checked), checkVal);
  if (!pid) {
    const currentItem = recursionTreeFindItem(data, value);
    const childIds = [];
    recursionTreeFindAllIds(currentItem.children, childIds);
    const parent = cascaderPanel.querySelector(`.l-cascader__item[data-value="${value}"]`);
    const ret1 = childIds.every(el => checked.indexOf(el) === -1);
    if (!checkVal && ret1) {
      parent.firstChild.classList.remove('l-is-checked');
      parent.firstChild.classList.remove('l-is-indeterminate');
    }
    return
  };
  let isAll = true, has = false;
  const parent = cascaderPanel.querySelector(`.l-cascader__item[data-value="${pid}"]`);
  // console.log('11333333333333', parent);
  if (parent) {
    // console.log(parent, 'parent');
    const currentItem = recursionTreeFindItem(data, parent.dataset.value);
    const childIds = [];
    recursionTreeFindAllIds(currentItem.children, childIds);
    // console.log(childIds, parent.dataset.value, JSON.stringify(checked), 'childIds');
    if (checkVal) {
      const ret1 = childIds.every(el => checked.indexOf(el) > -1);
      // console.log(ret1, JSON.stringify(childIds), JSON.stringify(checked), 'ret1');
      if (ret1) {
        // console.log('ret1 all In',parent.dataset.value);
        isAll = true;
        checked.push(parent.dataset.value);
        if (parent.firstChild.classList.contains('l-is-indeterminate')) {
          parent.firstChild.classList.remove('l-is-indeterminate');
        }
        parent.firstChild.classList.add('l-is-checked');
      } else {
        isAll = false;
        let index = checked.findIndex(el => el === parent.dataset.value);
        if (index > -1) {
          checked.splice(index, 1);
        }
        if (parent.firstChild.classList.contains('l-is-checked')) {
          parent.firstChild.classList.remove('l-is-checked');
        }
        parent.firstChild.classList.add('l-is-indeterminate');
      }
      // const ret2 = 
    } else {
      const ret1 = childIds.every(el => checked.indexOf(el) === -1);
      if (ret1) {
        // console.log('ret1 all In',parent.dataset.value);
        isAll = true;
        // console.log(checked.findIndex(el => el === parent.dataset.value), parent.dataset.value, 'checked splice');
        let index = checked.findIndex(el => el === parent.dataset.value);
        if (index > -1) {
          checked.splice(index, 1);
        }
        parent.firstChild.classList.remove('l-is-checked');
        parent.firstChild.classList.remove('l-is-indeterminate');
      } else {
        isAll = false;
        let index = checked.findIndex(el => el === parent.dataset.value);
        if (index > -1) {
          checked.splice(index, 1);
        }
        if (parent.firstChild.classList.contains('l-is-checked')) {
          parent.firstChild.classList.remove('l-is-checked');
        }
        parent.firstChild.classList.add('l-is-indeterminate');
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
    // console.log('next', parent.dataset.pid, parent.dataset.value);
    const _pid = parent.dataset.pid;
    const _value = parent.dataset.value;
    recursionUpTree(cascaderPanel, data, checked, _pid, _value, checkVal, halfIds, penId);
  }
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
    const parents = [];
    findNodeAndParentByValue(pen.data, key, parents);
    const title = parents.map(el => el.label).join('/');
    const e = assembleTag(key, title, penId);
    frag.appendChild(e);
  }
  input_prefix.replaceChildren(frag);
}
function checkChild(dropMenu, ids) {
  const cascaderPanel = dropMenu.querySelector('.l-cascader__panel');
  const cascaderList = cascaderPanel.querySelectorAll('.l-cascader__item');
  let len = cascaderList.length;
  for (let i = 0; i < len; i++) {
    // console.log(ids.indexOf(cascaderList[i].dataset.value), cascaderList[i].dataset.value, 'index');
    if (ids.indexOf(cascaderList[i].dataset.value) !== -1) {
      cascaderList[i].firstChild.classList.add('l-is-checked');
    } else {
      cascaderList[i].firstChild.classList.remove('l-is-checked');
    }
  }
}
function labelClick(e) {
  // console.log('labelClick')
  e.stopPropagation();
  const { value, penId, level } = this.dataset;
  // const checkedVal = e.target.checked;
  const pen = window.meta2d.findOne(penId);
  if (!pen) {
    return;
  }
  const checked = deepClone(pen.checked);
  updateTags(true, checked, value, penId, pen);
  window.meta2d.setValue({
    id: penId,
    checked,
  })
  adjustHeight(pen);
}
function recursionFindHasChild(data, key) {
  for (let i = 0; i < data.length; i++) {
    if (data[i].value === key) {
      const typeOf = typeof data[i].children;
      // console.log('typeOf', typeOf, data[i].value)
      if (typeOf === 'boolean') {
        return false;
      }
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
async function nextLevelClick(e) {
  e.stopPropagation();
  const { value, penId, level } = e.target.dataset;
  const pen = window.meta2d.findOne(penId);
  if (!pen) {
    return;
  }
  const hasChild = recursionFindHasChild(pen.data, value)
  // console.log('hasChild', hasChild)
  if (!hasChild) {
    // 加载数据
    // pen.loadFn && pen.loadFn(pen, { level, key: value });
    const ret = pen.loadFn && await pen.loadFn(pen, { level, key: value })
  } else {

  }
}
function checkboxClick(e) {
  e.stopPropagation();
  const { value, penId, level } = this.dataset;
  const checkedVal = this.checked;
  const pen = window.meta2d.findOne(penId);
  if (!pen) {
    return;
  }
  const checked = deepClone(pen.checked);
  updateTags(checkedVal, checked, value, penId, pen);
  // window.meta2d.setValue({
  //   id: penId,
  //   checked,
  // })
  // adjustHeight(pen);


  // 收集当前节点的所有儿子节点的id
  const currentItem = recursionTreeFindItem(pen.data, value);
  let ids = [value];
  currentItem?.children && recursionTreeFindAllIds(currentItem.children, ids);
  if (checkedVal) {
    ids = ids.concat(checked);
  } else {
    // 移除当前节点的所有儿子节点的id
    ids = checked.filter(el => !ids.includes(el));
  }

  window.meta2d.setValue({
    id: penId,
    checked: ids,
  })
  adjustHeight(pen);
  // renderPenRaw2(pen, pen.data);
  if (currentItem) {
    const _level = getLevel([currentItem]);
    // console.log('flowPath', JSON.stringify(pen.data))
    // 根据最新的flowPath去patch
    patchCascadeMenu(pen, level, _level, pen.flowPath, { penId: pen.id });
  }
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
function updateTags(checkedVal, checked, value, penId, pen) {
  if (pen.multiple) {
    if (checkedVal) {
      if (!checked.includes(value)) {
        checked.push(value);
      }
      const tagWrapper = document.getElementsByClassName(`${TAG_WRAPPER}${penId}`)[0];
      const parents = [];
      findNodeAndParentByValue(pen.data, value, parents);
      const title = parents.map(el => el.label).join('/');
      const tag = assembleTag(value, title, penId);
      tagWrapper.appendChild(tag);
    } else {
      const index = checked.indexOf(value);
      if (index > -1) {
        checked.splice(index, 1);
        // 删除tag
        const tagDom = document.getElementsByClassName(`${TAG_PREFIX}${value}`)[0];
        if (tagDom) {
          tagDom.remove();
        }
      }
    }
  } else {
    checked.splice(0, checked.length, value);
    const tagWrapper = document.getElementsByClassName(`${TAG_WRAPPER}${penId}`)[0];
    const parents = [];
    findNodeAndParentByValue(pen.data, value, parents);
    const title = parents.map(el => el.label).join('/');
    const tag = assembleTag(value, title, penId);
    tagWrapper.replaceChildren(tag);
  }
}
function findNodeAndParentByValue(tree, value, parents = []) {
  for (let i = 0; i < tree.length; i++) {
    const item = tree[i];
    if (item.value === value) {
      const type = typeof item.children;
      const obj = { value: item.value, label: item.label }
      Object.assign(obj, type === 'boolean' ? { children: item.children } : {});
      parents.unshift(obj);
      return parents;
    }
    if (item.children) {
      const result = findNodeAndParentByValue(item.children, value, parents);
      if (result) {
        const type = typeof item.children;
        const obj = { value: item.value, label: item.label }
        Object.assign(obj, type === 'boolean' ? { children: item.children } : {});
        parents.unshift(obj);
        return parents;
      }
    }
  }
  return null;
}
function liOnClick(e) {
  const { value, penId, level } = e.target.dataset;
  if (!value || !penId) {
    return;
  }
  const pen = window.meta2d.findOne(penId);
  if (!pen) {
    return;
  }

  if (pen.filterable) {
    const tagWrapper = document.querySelector(`.${TAG_WRAPPER}${pen.id}`);
    const text = tagWrapper.nextElementSibling.value;
    if (text) {
      return;
    }
  }

  patchLeftMenu(value, parseInt(level), pen);

  // 向下去更新半选状态
  const currentItem = recursionTreeFindItem(pen.data, value);
  // console.log(currentItem, 'currentItem')
  if (currentItem && currentItem.children?.length > 0) {
    const halfIds = [];
    // console.log('pen.checked 11', JSON.stringify(pen.checked))
    recursionDownTree(currentItem.children, pen.checked, halfIds);
    // console.log('halfIds', JSON.stringify(halfIds))
    const dropMenu = document.querySelector(`.${DROPMENU_PREFIX}${pen.id}`);
    const cascaderPanel = dropMenu.querySelector('.l-cascader__panel');
    for (let i = 0; i < halfIds.length; i++) {
      const elem = halfIds[i];
      const item = cascaderPanel.querySelector(`.l-cascader__item[data-value="${elem}"]`);
      if (item) {
        item.firstChild.classList.remove('l-is-checked');
        item.firstChild.classList.add('l-is-indeterminate');
      }
    }
  }
}
function recursionDownTree(data, checked, halfIds) {
  for (let i = 0; i < data.length; i++) {
    const item = data[i];
    if (Array.isArray(item.children) && item.children?.length > 0) {
      const allChilds = [];
      recursionTreeFindAllIds(item.children, allChilds);
      const everyFlag = allChilds.every(el => checked.includes(el));
      const someFlag = allChilds.some(el => checked.includes(el));
      if (!everyFlag && someFlag) {
        halfIds.push(item.value);
      }
      recursionDownTree(item.children, checked, halfIds);
    }
  }
}
// 根据当前的level去patch后面的层级
function patchLeftMenu(value, level, pen) {
  // console.log('1111', JSON.stringify(pen.data))
  // 根据当前点击的 更新flowPath
  // 找到子树
  const item = findItemByValue(pen.data, value);
  if (!item) {
    return;
  }
  // console.log('2222', JSON.stringify(pen.data))
  const pathFlowPath = [];
  const flowPath = deepClone(pen.flowPath);
  if (item.children && item.children.length > 0) {
    getTreeFlowPathDefault(item.children, pathFlowPath, (item) => item === 0);
    pathFlowPath.unshift(item.value);
    flowPath.splice(level, flowPath.length - level, ...pathFlowPath);
  } else {
    flowPath.splice(level, flowPath.length - level, item.value);
  }
  const _level = getLevel([item]);
  // console.log('flowPath', JSON.stringify(pen.data))
  // 根据最新的flowPath去patch
  patchCascadeMenu(pen, level, _level, flowPath, { penId: pen.id });

  window.meta2d.setValue({
    id: pen.id,
    flowPath,
  })
}
function findItemByValue(data, value) {
  for (let i = 0; i < data.length; i++) {
    const item = data[i];
    if (item.value === value) {
      return item;
    }
    if (item.children && item.children.length > 0) {
      const ret = findItemByValue(item.children, value);
      if (ret) {
        return ret;
      }
    }
  }
}
function patchCascadeMenu(pen, lv, level, flowPath, opt) {
  const cascaderPanel = document.querySelector('.l-cascader__panel');
  // 从当前点击的层级，更新后面的层级
  let startIndex = lv;
  const startNode = findItemByValue(pen.data, flowPath[lv]);
  // console.log('pen.data', JSON.stringify(pen.data))
  if (!startNode) {
    return;
  }
  const totalLevel = lv + level;
  for (let j = lv, m = 0; j < totalLevel; j++) {
    if (j === lv) {
      // 更新当前层级的active,当前层级的dom肯定是存在的
      const lastPath = pen.flowPath[j]
      for (let l = 0; l < cascaderPanel.children[j].children.length; l++) {
        const elem = cascaderPanel.children[j].children[l];
        if (elem.dataset.value === lastPath && elem.className.indexOf('l-is-expanded') > -1) {
          elem.className = elem.className.replace('l-is-expanded', '');
        }
        if (elem.dataset.value === flowPath[j] && elem.className.indexOf('l-is-expanded') === -1) {
          elem.className += ' l-is-expanded';
        }
      }
    } else {
      //更新剩余的层级  
      if (cascaderPanel.children[j]) {
        startIndex++;
        // 更新当前层级的active,当前层级的dom肯定是存在的
        const liFragWrapper = document.createDocumentFragment();
        const liChilds = recursionFindItem([startNode], startIndex, flowPath);
        // console.log('liChilds', JSON.stringify(startNode), liChilds)
        for (let n = 0; n < liChilds.length; n++) {
          const liItem = liChilds[n];
          const liDom = assembleLi(pen, liItem, startIndex, opt);
          if (liItem.value === flowPath[startIndex]) {
            liDom.className += ' l-is-expanded';
          }
          liFragWrapper.appendChild(liDom);
        }
        cascaderPanel.children[j].replaceChildren(liFragWrapper);
      } else {
      }
    }
  }
  // console.log('ddddddd', cascaderPanel.children.length, pen.flowPath.length, flowPath.length)
  if (cascaderPanel.children.length > flowPath.length) {
    // 删除多余的层级
    const len = cascaderPanel.children.length;
    for (let k = len - 1; k > flowPath.length - 1; k--) {
      if (cascaderPanel.children[k]) {
        cascaderPanel.children[k].remove();
      }
    }
    // 删除最后一个的class
    if (cascaderPanel.children[flowPath.length - 1].className.indexOf('l-cascader__menu--segment') > -1) {
      cascaderPanel.children[flowPath.length - 1].className = cascaderPanel.children[flowPath.length - 1].className.replace('l-cascader__menu--segment', '');
    }
  }
  if (pen.flowPath.length > flowPath.length) {
    // 删除多余的层级
    for (let k = pen.flowPath.length - 1; k > flowPath.length - 1; k--) {
      if (cascaderPanel.children[k]) {
        cascaderPanel.children[k].remove();
      }
    }
    // 删除最后一个的class
    if (cascaderPanel.children[flowPath.length - 1].className.indexOf('l-cascader__menu--segment') > -1) {
      cascaderPanel.children[flowPath.length - 1].className = cascaderPanel.children[flowPath.length - 1].className.replace('l-cascader__menu--segment', '');
    }
  } else if (pen.flowPath.length < flowPath.length) {
    // 增加新的层级
    const fragMent = document.createDocumentFragment();
    const currentLi = flowPath[pen.flowPath.length - 1];
    const currentItem = findItemByValue(pen.data, currentLi);
    if (!currentItem) {
      return;
    }
    let i = 0;
    const leftFlowPath = flowPath.slice(pen.flowPath.length);
    let len = cascaderPanel.children.length;
    for (let k = pen.flowPath.length - 1; k < flowPath.length - 1; k++) {
      const cascaderMenu = document.createElement('ul');
      cascaderMenu.className = 'l-cascader__menu';
      // 生成li
      const liFragWrapper = document.createDocumentFragment();
      const liChilds = recursionFindItem([currentItem], i, leftFlowPath);
      for (let n = 0; n < liChilds.length; n++) {
        const liItem = liChilds[n];
        const liDom = assembleLi(pen, liItem, len + i, opt);
        if (liItem.value === flowPath[len + i]) {
          liDom.className += ' l-is-expanded';
        }
        liFragWrapper.appendChild(liDom);
      }
      cascaderMenu.appendChild(liFragWrapper);
      i++;
      if (k !== (flowPath.length - 1 - 1)) {
        cascaderMenu.className += ' l-cascader__menu--segment';
      }
      fragMent.appendChild(cascaderMenu);
    }
    cascaderPanel.appendChild(fragMent);
  }
}
function onMouseUp(pen: Pen, e: Point) {
  const dropMenu = document.querySelector(`.${DROPMENU_PREFIX}${pen.id}`);
  dropMenu.style.display = dropMenu.style.display === 'none' ? 'block' : 'none';
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
  sheet.insertRule(
    `.l-cascader__panel {
      display: flex;
    }`
  );
  sheet.insertRule(
    `.l-cascader__panel.l-cascader--normal {
      height: 200px;
    }`
  );
  sheet.insertRule(
    `.l-cascader__menu {
      width: 148px;
      overflow: auto;
      box-sizing: content-box;
      padding: 6px;
      background: #fff;
    }`
  );
  sheet.insertRule(
    `.l-cascader__menu--segment {
        border-right: 1px solid #e8e8e8;
    }`
  );

  sheet.insertRule(
    `
    .l-cascader__item-icon.l-icon {
      position: absolute;
      height: 100%;
      right: 0;
      top: 0;
      background: transparent;
      margin: 0 8px;
      font-size: 16px;
      color: rgba(0, 0, 0, 0.4);
  }
    `
  )
  sheet.insertRule(
    `
    .l-icon {
      display: inline-block;
      vertical-align: middle;
      width: 1em;
  }
    `
  )
  sheet.insertRule(
    `
    .l-cascader__item {
      position: relative;
      display: flex;
      align-items: center;
      height: 28px;
      color: rgba(0, 0, 0, 0.9);
      padding: 0 8px;
      border-radius: 3px;
      margin-top: 2px;
      transition: background-color 0.2s cubic-bezier(0.82, 0, 1, 0.9);
      list-style: none;
  }
    `
  )
  sheet.insertRule(
    `
  .l-cascader-checkbox {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
    list-style: none;
    display: inline-flex;
    align-items: center;
    position: relative;
    cursor: pointer;
    color: rgba(0, 0, 0, 0.9);
  `
  )
  sheet.insertRule(
    `
  .l-cascader-checkbox-former {
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
  `
  )
  sheet.insertRule(
    `
  .l-cascader-checkbox {
    max-width: 100%;
    box-sizing: border-box;
    margin: 0;
    padding: 0;
    list-style: none;
    display: inline-flex;
    align-items: center;
    position: relative;
    cursor: pointer;
    color: rgba(0, 0, 0, 0.9);
    white-space: nowrap;
}
  `
  )
  sheet.insertRule(`
  .l-cascader-checkbox-input:after {
    content: "";
    position: absolute;
    opacity: 0;
    box-sizing: border-box;
}
  `)
  sheet.insertRule(`
  .l-cascader-checkbox.l-is-checked .l-cascader-checkbox-input:after {
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
  .l-cascader-checkbox.l-is-indeterminate .l-cascader-checkbox-input {
    border-color: #0052d9;
    background-color: #0052d9;
    transition: background-color .2s cubic-bezier(.82,0,1,.9);
}
  `)
  sheet.insertRule(`
  .l-cascader-checkbox.l-is-indeterminate .l-cascader-checkbox-input:after {
    opacity: 1;
    width: 16px;
    height: 4px;
    left: -1px;
    right: 0;
    top: 5px;
    border: unset;
    transform: scale(.5);
    background-color: #fff;
}
  `)
  sheet.insertRule(`
  .l-cascader-checkbox.l-is-checked .l-cascader-checkbox-input {
    border-color: #0052d9;
    background-color: #0052d9;
    transition: background-color .2s cubic-bezier(.82,0,1,.9);
}
  `)
  sheet.insertRule(
    `
  .l-cascader-checkbox-input {
    position: relative;
    display: inline-block;
    width: 16px;
    height: 16px;
    vertical-align: middle;
    border: 1px solid #ddd;
    border-radius: 3px;
    background-color: #fff;
    box-sizing: border-box;
  `)

  sheet.insertRule(`
  .l-cascader-checkbox-label {
    display: inline-block;
    margin-left: 8px;
    vertical-align: middle;
  }`)

  sheet.insertRule(`
  .l-cascader__item.l-is-expanded {
    background: #f2f3ff;
    color: #0052d9;
  }`)

  sheet.insertRule(`
  .l-cascader__item.l-is-selected {
    color: #0052d9;
    background: #f2f3ff;
}
  `)
  sheet.insertRule(`
  .l-cascader__menu.l-cascader__menu--filter {
    width: auto;
    min-width: 148px;
  }
  `)

  sheet.insertRule(`
  .l-cascader-panel-empty {
    width: 100%;
    height: 28px;
    line-height: 28px;
    color: rgba(0, 0, 0, 0.26);
    margin: 6px;
    text-align: center;
    padding-left: 0;
  }
  `)
  sheet.insertRule(`
  .l-cascader__input{
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
}