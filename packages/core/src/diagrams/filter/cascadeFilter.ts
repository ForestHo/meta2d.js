import { movingSuffix } from '../../canvas';
import { Pen, setElemPosition } from '../../pen';
import { Point } from '../../point';
import { rectInRect } from '../../rect';
import { deepClone, debounce } from '../../utils';

const TAG_WRAPPER = 'tag_wrapper_';
const TAG_PREFIX = 'tag_';

export function cascadeFilter(pen: Pen): Path2D {
  if (!pen.onDestroy) {
    pen.onDestroy = onDestroy;
    pen.onResize = resize;
  }
  const { x, y, width, height } = pen.calculative.worldRect;
  if (!pen.calculative.singleton) {
    pen.calculative.singleton = {};
  }
  if (!pen.calculative.singleton.div) {
    // 校验修正参数
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
    // // 下拉选项
    const dropMenu = document.createElement("div");
    dropMenu.style.position = 'absolute';
    dropMenu.style.left = '0';
    dropMenu.style.top = 'calc(100% + 6px)';
    // dropMenu.style.width = '100%';
    dropMenu.style.background = 'rgba(255, 255, 255, 0.9)';
    dropMenu.style.border = '1px solid #ccc';
    dropMenu.style.borderRadius = '4px';
    // dropMenu.className = DROPMENU_PREFIX + pen.id;
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
function renderData(data, dom, pen) {
  if (Object.prototype.toString.call(data) === '[object Array]') {
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
    .l-checkbox {
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

    const lPanel = document.createElement('div');
    lPanel.className = 'l-cascader__panel l-cascader--normal';
    lPanel.style.display = 'flex';
    lPanel.style.padding = '6px';

    const flowPath = [];
    getTreeFlowPathDefault(data, flowPath, item => item === 0);
    const fragMent = generateDomByData(data, flowPath, { penId: pen.id });
    lPanel.appendChild(fragMent);
    dom.appendChild(lPanel);

    window.meta2d.setValue({
      id: pen.id,
      flowPath,
    })
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
function generateDomByData(data, flowPath, opt) {
  const levelList = data.filter(el => el.value === flowPath[0]);
  const level = getLevel(levelList);
  const fragMent = document.createDocumentFragment();
  for (let i = 0; i < level; i++) {
    const cascaderMenu = document.createElement('ul');
    cascaderMenu.className = 'l-cascader__menu';

    // 生成li
    const liFragWrapper = document.createDocumentFragment();
    const liChilds = getChildrenByLevel(data, i, flowPath);
    for (let k = 0; k < liChilds.length; k++) {
      const liItem = liChilds[k];
      const liDom = assembleLi(liItem, i, opt);
      if (liItem.value === flowPath[i]) {
        liDom.className += ' l-is-expanded';
      }
      liFragWrapper.appendChild(liDom);
    }
    cascaderMenu.appendChild(liFragWrapper);

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
function resize(pen: any) {
  setElemPosition(pen, pen.calculative.singleton.div);
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
        delete item.children;
      }
    }
  })(arr, 0);
  return maxLevel;
};
function assembleInputBox(pen: Pen) {
  const box = document.createElement("div");
  box.style.width = '100%';
  box.style.height = '100%';
  box.style.padding = '0 8px';
  box.style.border = '1px solid #ccc';
  box.style.borderRadius = '4px';
  box.style.whiteSpace = 'nowrap';
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
  // input.oninput = debounce(onInputchange, 1000)


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
  // svgDom.onclick = tagClose;

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
  const tagDom = document.getElementsByClassName(`${e.target.dataset.key}`)[0];
  const penId = tagDom.dataset.penId;
  const pen = window.meta2d.findOne(penId);
  if (!pen) {
    return;
  }
  // const checked = deepClone(pen.checked);
  // const index = checked.indexOf(tagDom.dataset.key);
  // if (index > -1) {
  //   checked.splice(index, 1);
  // }
  // window.meta2d.setValue({
  //   id: penId,
  //   checked,
  // })
  // tagDom.remove();

  // 更新tree的checked
  // const dropMenu = document.querySelector(`.${DROPMENU_PREFIX}${pen.id}`);
  // const lTreeList = dropMenu.querySelector('.l-tree-list');
  // let len = lTreeList.children.length;
  // for (let i = 0; i < len; i++) {
  //   const item = lTreeList.children[i];
  //   if (item.dataset.value === tagDom.dataset.key) {
  //     const label = item.lastChild;
  //     const classList = label.className.split(' ');
  //     const index = classList.findIndex(el => el === 'to__checked');
  //     if (index > -1) {
  //       classList.splice(index, 1);
  //       label.className = classList.join(' ');
  //     }
  //     label.firstChild.checked = false;
  //   }
  // }

  // // 更新高度
  // adjustHeight(pen);
}

// 生成li
function assembleLi(item, level, opt) {
  const li = document.createElement('li');
  li.className = 'l-cascader__item';
  li.dataset.value = item.value;
  li.dataset.penId = opt.penId;
  li.dataset.level = level;
  li.innerHTML = level;
  li.onclick = liOnClick;

  const label = document.createElement('label');
  label.className = 'l-cascader-checkbox';

  const inputDom = document.createElement('input');
  inputDom.type = 'checkbox';
  inputDom.className = 'l-cascader-checkbox-former';
  label.appendChild(inputDom);

  const span = document.createElement('span');
  span.className = 'l-cascader-checkbox-input';
  label.appendChild(span);

  const spanLabel = document.createElement('span');
  spanLabel.className = 'l-cascader-checkbox-label';
  spanLabel.innerHTML = item.label;
  label.appendChild(spanLabel);

  li.appendChild(label);

  if (item.children && item.children.length > 0) {
    const svgDom = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svgDom.setAttribute('viewBox', '0 0 24 24');
    svgDom.style.fill = 'none';
    svgDom.style.width = '1em';
    svgDom.setAttribute("class", "l-icon l-cascader__item-icon");

    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('fill', 'currentColor');
    path.setAttribute('d', 'M8.09 17.5l5.5-5.5-5.5-5.5L9.5 5.09 16.41 12 9.5 18.91 8.09 17.5z');
    svgDom.appendChild(path);

    li.appendChild(svgDom);
  }
  return li;
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
  patchLeftMenu(value, parseInt(level), pen);
}
// 根据当前的level去patch后面的层级
function patchLeftMenu(value, level, pen) {
  // 根据当前点击的 更新flowPath
  // 找到子树
  const item = findItemByValue(pen.data, value);
  if (!item) {
    return;
  }
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
        for (let n = 0; n < liChilds.length; n++) {
          const liItem = liChilds[n];
          const liDom = assembleLi(liItem, startIndex, opt);
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
        const liDom = assembleLi(liItem, len + i, opt);
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