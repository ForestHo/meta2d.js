import { movingSuffix } from '../../../canvas';
import { Pen, setElemPosition } from '../../../pen';
import { Point, distance } from '../../../point';
import { rectInRect } from '../../../rect';
import { deepClone, debounce } from '../../../utils';
import '../datePicker/dayjs.min.js'

const TAG_WRAPPER = 'dtag_wrapper_';
const TAG_PREFIX = 'dtag_';
const DROPMENU_PREFIX = 'l-date-range-picker__panel_';
const CASCADE_PREFIX = 'l-date-';
const TIME_HEIGHT = 30;
let isScrolling = false;
enum DateSelectType {
  MONTH,
  YEAR
}
enum TimeCount {
  HOUR = 24,
  MINUTE = 60,
  SECOND = 60
}
const panelComp = {
  "date": ["date"],
  "datetime": ["date", "time"],
  "daterange": ["date", "date"],
}
enum SwitchMode {
  WEEK,
  MONTH,
  QUARTER,
  YEAR,
}
const pagiMonth = [
  {
    label: '上个月',
    key: 'prev'
  },
  {
    label: '当前',
    key: 'current'
  },
  {
    label: '下个月',
    key: 'next'
  }
]
const svgMap = {
  "prev": `M15.91 17.5l-5.5-5.5 5.5-5.5-1.41-1.41L7.59 12l6.91 6.91 1.41-1.41z`,
  "current": `M12 6a6 6 0 100 12 6 6 0 000-12zm-8 6a8 8 0 1116 0 8 8 0 01-16 0z`,
  "next": `M8.09 17.5l5.5-5.5-5.5-5.5L9.5 5.09 16.41 12 9.5 18.91 8.09 17.5z`
}
const weekDays = ['日', '一', '二', '三', '四', '五', '六'];
export function dateRangePicker(pen: Pen): Path2D {
  if (!pen.onDestroy) {
    pen.onDestroy = onDestroy;
    pen.onMouseUp = onMouseUp;
    pen.onResize = resize;
    pen.onMouseEnter = onMouseEnter;
    pen.onMouseLeave = onMouseLeave;
    pen.onRenderPenRaw = renderPenRaw;
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
  let style = document.createElement('style');
  style.type = 'text/css';
  document.head.appendChild(style);
  let sheet = style.sheet;
  sheet.insertRule(
    `.l-date-picker__panel-content,
    .l-date-range-picker__panel-content-wrapper {
        display: flex;
        height:300px;
      }`
  );

  sheet.insertRule(`
  .l-date-picker__panel-year, 
  .l-date-picker__panel-month, 
  .l-date-picker__panel-quarter, 
  .l-date-picker__panel-week, 
  .l-date-picker__panel-date {
    display: flex;
    flex-direction: column;
    padding: 12px;
    gap: 12px;
    width: 280px;
    box-sizing: border-box;
}
  `)

  sheet.insertRule(`
  .l-date-picker__cell--now .l-date-picker__cell-inner {
    color: #366ef4;
    background: #f2f3ff;
  }`)

  sheet.insertRule(`
  .l-date-picker__cell--additional .l-date-picker__cell-inner {
    color: rgba(0, 0, 0, 0.26);
}
  `)
  sheet.insertRule(`
  .l-date-picker__cell-inner {
    position: relative;
    z-index: 5;
    display: inline-flex;
    justify-content: center;
    align-items: center;
    width: 24px;
    height: 24px;
    margin: calc(4px - 1px);
    border-radius: 3px;
    transition: box-shadow .2s cubic-bezier(.38,0,.24,1), background-color .2s linear, border-color .2s linear, color .2s linear;
}
  `)

  sheet.insertRule(`
  .l-date-picker__header-controller .l-date-picker__header-controller-month {
    width: 80px;
    display: flex;
    position: relative;
}
  `)
  sheet.insertRule(`
  .l-date-picker__header-controller .l-date-picker__header-controller-year {
    width: 78px;
    display: flex;
    position: relative;
}
  `)

  sheet.insertRule(`
  .l-input {
    margin: 0;
    padding: 0;
    list-style: none;
    position: relative;
    height: 32px;
    border-width: 1px;
    border-style: solid;
    border-radius: 3px;
    border-color: #dcdcdc;
    padding: 0 8px;
    background-color: #fff;
    outline: none;
    color: rgba(0, 0, 0, 0.9);
    width: 100%;
    box-sizing: border-box;
    transition: border cubic-bezier(.38,0,.24,1) .2s, box-shadow cubic-bezier(.38,0,.24,1) .2s, background-color cubic-bezier(.38,0,.24,1) .2s;
    display: flex;
    align-items: center;
    overflow: hidden;
}
  `)

  sheet.insertRule(`
  .l-select-input,
  .l-input__wrap{
    width: 100%;
  }
  `)

  sheet.insertRule(`
  .l-date-picker__header-controller {
    display: inline-flex;
    gap: 8px;
  }`)

  sheet.insertRule(`
  .l-date-picker__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    width: 100%;
}
  `)
  sheet.insertRule(`
  .l-input__inner {
    flex: 1;
    border: none;
    outline: none;
    padding: 0;
    max-width: 100%;
    min-width: 0;
    color: rgba(0, 0, 0, 0.9);
    font: inherit;
    background-color: transparent;
    box-sizing: border-box;
    white-space: nowrap;
    word-wrap: normal;
    overflow: hidden;
    text-overflow: ellipsis;
  `)

  sheet.insertRule(`
  .l-button {
    width: 24px;
    padding: 0;
    color: rgba(0, 0, 0, 0.9);
    background-color: transparent;
    border-color: transparent;
}
  `)
  sheet.insertRule(`
  .l-popup__content{
    max-height: 160px;
    margin: 8px 0;
    padding: 0;
    overflow-y: auto;
    overscroll-behavior: contain;
    box-shadow: 0 3px 14px 2px rgba(0, 0, 0, .05),0 8px 10px 1px rgba(0, 0, 0, 6%),0 5px 5px -3px rgba(0, 0, 0, 10%);

    position: relative;
    background: #fff;
    border-radius: 6px;

    box-sizing: border-box;
    word-break: break-all;
    z-index: 1000;
  }`)
  sheet.insertRule(`
  .l-select-option.l-is-selected:not(.l-is-disabled) {
    color: #0052d9;
    background-color: #f2f3ff;
    transition: all .2s linear;
}
  `)
  sheet.insertRule(`
  .l-select-option {
    display: flex;
    align-items: center;
    border-radius: 3px;
    height: 28px;
    cursor: pointer;
    padding: 0 8px;
    color: rgba(0, 0, 0, 0.9);
    transition: background-color .2s cubic-bezier(.38,0,.24,1);
    box-sizing: border-box;
}
  `)
  sheet.insertRule(`
  .l-popup {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
    list-style: none;
    color: rgba(0, 0, 0, 0.9);
    display: inline-block;
  }`)
  sheet.insertRule(`
  .l-select__list {
    margin: 0;
    padding: 6px;
    list-style: none;
}
  `)
  sheet.insertRule(`
  .l-select-option span {
    position: relative;
    white-space: nowrap;
    word-wrap: normal;
    overflow: hidden;
    text-overflow: ellipsis;
  }`)
  sheet.insertRule(`
  .l-button{
    cursor: pointer;
  }
  `)
  sheet.insertRule(`
  .l-date-picker__table th, 
  .l-date-picker__table td.l-date-picker__cell {
    padding: 0;
    border: 0;
    line-height: 22px;
  }
  `)
  sheet.insertRule(`
  .l-date-picker__table th {
    text-align: center;
    color: rgba(0, 0, 0, 0.6);
    font-weight: 400;
}
  `)

  sheet.insertRule(`
  .l-time-picker__panel-body-scroll {
    flex: 1;
    height: 100%;
    overflow-y: scroll;
    text-align: center;
    position: relative;
    list-style: none;
    padding: 0;
    margin: 0;
}
  `)
  sheet.insertRule(`
  .l-time-picker__panel-body {
    width: 100%;
    height: 216px;
    position: relative;
    user-select: none;
    display: flex;
    align-items: center;
    justify-content: center;

  `)
  sheet.insertRule(`
  ul, dl, ol {
    margin: 0;
    padding: 0 0 0 1.2em;
    line-height: 22px;
}
  `)
  sheet.insertRule(`
  .l-time-picker__panel-body-scroll-item {
    height: 24px;
    line-height: 24px;
    color: rgba(0, 0, 0, 0.6);
    margin: 6px 4px;
    border-radius: 3px;
    text-align: center;
    cursor: pointer;
    transition: .2s linear;
}
  `)
  sheet.insertRule(`
  .l-time-picker__panel-body-active-mask{
      position: absolute;
      top: 50%;
      height: 24px;
      width: 100%;
      display: flex;
  }
  `)
  sheet.insertRule(`
  .l-time-picker__panel-body-active-mask>div {
    flex: 1;
    transform: translateY(calc(0px -(calc(24px + 6px) / 2)));
    height: 24px;
    background-color: #f2f3ff;
    margin: 6px 4px;
    border-radius: 3px;
}
  `)
  sheet.insertRule(`
  .l-date-picker__panel .l-time-picker__panel, 
  .l-date-range-picker__panel .l-time-picker__panel {
    width: 216px;
}
  `)

  sheet.insertRule(`
  .l-time-picker__panel {
    width: 280px;
    background: transparent;
    border-radius: 3px;
    display: inline-block;
    position: relative;
    --timePickerPanelOffsetTop: 15;
    --timePickerPanelOffsetBottom: 35;
}
  `)
  sheet.insertRule(`
  .l-date-picker__panel-time-viewer, 
  .l-date-range-picker__panel-time-viewer {
    display: flex;
    height: 32px;
    line-height: 22px;
    align-items: center;
    justify-content: center;
    color: rgba(0, 0, 0, 0.9);
}
  `)
  sheet.insertRule(`
  .l-date-picker__panel-time, 
  .l-date-range-picker__panel-time {
    display: flex;
    flex-direction: column;
    gap: 6px;
    padding: 12px 8px;
    border-left: 1px solid #e7e7e7;
}
  `)

  sheet.insertRule(`
  .l-time-picker__panel-body-scroll:after {
    height: calc(50% - var(--timePickerPanelOffsetBottom, 0)* 1px);
}
  `)

  sheet.insertRule(`
  .l-time-picker__panel-body-scroll:after,
  .l-time-picker__panel-body-scroll:before {
    display: block;
    height: 50%;
    content: "";
}
  `)
  sheet.insertRule(`
  .l-time-picker__panel-body-scroll::-webkit-scrollbar {
    display: none;
  }
  `)
  sheet.insertRule(`
  .l-time-picker__panel-body-scroll:before {
    height: calc(50% - var(--timePickerPanelOffsetTop, 0)* 1px);
  }
  `)
  sheet.insertRule(`
  .l-time-picker__panel-body-scroll-item.is-current {
    color: #0052d9;
  }
  `)
  sheet.insertRule(`
  .l-date-picker__cell--active .l-date-picker__cell-inner {
    color: #fff !important;
    background-color: #0052d9 !important;
}
  `)

  sheet.insertRule(`
  .l-date-picker__cell--highlight:before {
    opacity: 1;
    background-color: #f2f3ff;
}
  `)
  sheet.insertRule(`
  .l-date-picker__cell:before,
  .l-date-picker__cell:after {
    content: "";
    position: absolute;
    top: 50%;
    right: -5%;
    left: -5%;
    z-index: 1;
    opacity: 0;
    border-radius: 3px;
    height: 24px;
    transform: translateY(-50%);
    transition: opacity .2s cubic-bezier(0,0,.15,1);
}
  `)

  sheet.insertRule(`
  .l-date-picker__cell--active-start:before {
    opacity: 1;
    left: calc(calc(4px - 1px)* 2);
    border-top-left-radius: 3px;
    border-bottom-left-radius: 3px;
}
  `)
  sheet.insertRule(`
  .l-date-picker__cell--active-end:before {
    opacity: 1;
    right: calc(calc(4px - 1px)* 2);
    border-top-right-radius: 3px;
    border-bottom-right-radius: 3px;
}
  `)
  const lPanel = document.createElement('div');
  lPanel.className = 'l-date-range-picker__panel-content-wrapper';
  lPanel.style.display = 'flex';
  const fragMent = generateDomByData(data, pen);
  lPanel.appendChild(fragMent);
  dom.appendChild(lPanel);
}
function generateDomByData(data, pen) {
  let key = "daterange";
  // 根据配置生成不同的面板
  // if (pen.date) {
  //   key = "date";
  // } else if (pen.datetime) {
  //   key = "datetime";
  // } else if (pen.daterange) {
  //   key = "daterange";
  // }
  const frag = document.createDocumentFragment();
  for (let i = 0; i < panelComp[key].length; i++) {
    const type = panelComp[key][i];
    if (type === "date") {
      const dateDom = generateDateDom(data, pen,i)
      frag.appendChild(dateDom);
    } else if (type === "time") {
      const timeDom = generateTimeDom(data, pen)
      frag.firstChild.appendChild(timeDom);
    }
  }
  return frag;
}
function generateTimeDom(data, pen) {
  const frag = document.createDocumentFragment();
  const timeItem = assembleTimeItem(data, pen);
  frag.appendChild(timeItem);
  return frag;
}
function generateDateDom(data, pen,index?) {
  const frag = document.createDocumentFragment();
  const currentYear = dayjs().year();
  let currentMonth = dayjs().month() + 1;
  const content = document.createElement('div');
  content.className = 'l-date-picker__panel-content';

  const dateItem = assemleDateItem(data, pen, {
    year: currentYear,
    month: currentMonth,
    index
  });
  dateItem.className = 'l-date-picker__panel-date';
  dateItem.dataset.type = 'date';
  dateItem.dataset.index = index + '';
  dateItem.dataset.currentMonth = currentMonth + '';
  dateItem.dataset.currentYear = currentYear + '';
  dateItem.dataset.mode = SwitchMode.MONTH + '';
  currentMonth++;

  content.appendChild(dateItem);

  frag.appendChild(content);
  return frag;
}
function generateDomByType(data, pen, type, i) {
  const frag = document.createDocumentFragment();
  const currentYear = dayjs().year();
  let currentMonth = dayjs().month() + 1;
  for (let i = 0; i < 2; i++) {
    const content = document.createElement('div');
    content.className = 'l-date-picker__panel-content';

    const dateItem = assemleDateItem(data, pen, {
      year: currentYear,
      month: currentMonth,
      index: i
    });
    dateItem.className = 'l-date-picker__panel-date';
    dateItem.dataset.type = 'date';
    dateItem.dataset.index = i + '';
    dateItem.dataset.currentMonth = currentMonth + '';
    dateItem.dataset.currentYear = currentYear + '';
    dateItem.dataset.mode = SwitchMode.MONTH + '';
    currentMonth++;

    content.appendChild(dateItem);

    frag.appendChild(content);
  }
  return frag;
}
function assembleTimeItem(data, pen) {
  const timeItem = document.createElement('div');
  timeItem.className = 'l-date-picker__panel-time';
  timeItem.dataset.hour = "00";
  timeItem.dataset.minute = "00";
  timeItem.dataset.second = "00";

  const viewer = document.createElement('div');
  viewer.className = 'l-date-picker__panel-time-viewer';
  viewer.innerHTML = `${timeItem.dataset.hour}:${timeItem.dataset.minute}:${timeItem.dataset.second}`;
  timeItem.appendChild(viewer);

  const panel = document.createElement('div');
  panel.className = 'l-time-picker__panel';

  const sectionBody = document.createElement('div');
  sectionBody.className = 'l-time-picker__panel-section-body';

  const panelBody = document.createElement('div');
  panelBody.className = 'l-time-picker__panel-body';

  const mask = document.createElement('div');
  mask.className = 'l-time-picker__panel-body-active-mask';
  for (let i = 0; i < 3; i++) {
    const div = document.createElement('div');
    mask.appendChild(div);
  }
  panelBody.appendChild(mask);

  const hour = document.createElement('ul');
  hour.className = 'l-time-picker__panel-body-scroll';
  hour.addEventListener('scroll', debounce((e) => hourScroll(e, pen.id), 200));
  hour.addEventListener('click', (e) => { hourClick(e, pen.id) });
  const hourFrag = assembleHour();
  const hIndex = parseInt(timeItem.dataset.hour);
  hourFrag.children[hIndex].classList.add('is-current');
  hour.appendChild(hourFrag);

  panelBody.appendChild(hour);

  const minute = document.createElement('ul');
  minute.className = 'l-time-picker__panel-body-scroll';
  minute.addEventListener('scroll', debounce((e) => minuteScroll(e, pen.id), 200));
  minute.addEventListener('click', (e) => { minuteClick(e, pen.id) });
  const minuteFrag = assembleMinute();
  const mIndex = parseInt(timeItem.dataset.minute);
  minuteFrag.children[mIndex].classList.add('is-current');
  minute.appendChild(minuteFrag);
  panelBody.appendChild(minute);

  const second = document.createElement('ul');
  second.className = 'l-time-picker__panel-body-scroll';
  second.addEventListener('scroll', debounce((e) => secondScroll(e, pen.id), 200));
  second.addEventListener('click', (e) => { secondClick(e, pen.id) });
  const secondFrag = assembleSecond();
  const sIndex = parseInt(timeItem.dataset.second);
  secondFrag.children[sIndex].classList.add('is-current');
  second.appendChild(secondFrag);
  panelBody.appendChild(second);

  sectionBody.appendChild(panelBody);
  panel.appendChild(sectionBody);
  timeItem.appendChild(panel);
  return timeItem;
}
function hourClick(e, penId) {
  if (e.target.tagName !== 'LI') return;
  console.log(e.target, 'hourClick')
  const index = parseInt(e.target.dataset.value);
  const distance = index * TIME_HEIGHT
  e.target.parentElement.scrollTo?.({
    top: distance,
    behavior: 'smooth',
  });
  updateViewer(null, index, 'hour', penId);

  // const panelTime = document.querySelector(`.${DROPMENU_PREFIX}${penId} .l-date-picker__panel-time`);
  // const lastHour = parseInt(panelTime.dataset.hour)
  // e.target.parentElement.children[lastHour].classList.remove('is-current');
  // e.target.classList.add('is-current');
  // panelTime.dataset.hour = index + '';

  updateActiveTime(e.target, index, 'hour', penId);
}
function minuteClick(e, penId) {
  if (e.target.tagName !== 'LI') return;
  console.log(e.target.dataset, 'hourClick')
  const index = parseInt(e.target.dataset.value);
  const distance = index * TIME_HEIGHT
  e.target.parentElement.scrollTo?.({
    top: distance,
    behavior: 'smooth',
  });
  updateViewer(null, index, 'minute', penId);

  // const panelTime = document.querySelector(`.${DROPMENU_PREFIX}${penId} .l-date-picker__panel-time`);
  // const lastMinute = parseInt(panelTime.dataset.minute)
  // e.target.parentElement.children[lastMinute].classList.remove('is-current');
  // e.target.classList.add('is-current');
  // panelTime.dataset.minute = index + '';

  updateActiveTime(e.target, index, 'minute', penId);
}
function secondClick(e, penId) {
  if (e.target.tagName !== 'LI') return;
  console.log(e.target.dataset, 'hourClick')
  const index = parseInt(e.target.dataset.value);
  const distance = index * TIME_HEIGHT
  e.target.parentElement.scrollTo?.({
    top: distance,
    behavior: 'smooth',
  });
  updateViewer(null, index, 'second', penId);

  // const panelTime = document.querySelector(`.${DROPMENU_PREFIX}${penId} .l-date-picker__panel-time`);
  // const lastSecond = parseInt(panelTime.dataset.second)
  // e.target.parentElement.children[lastSecond].classList.remove('is-current');
  // e.target.classList.add('is-current');
  // panelTime.dataset.second = index + '';

  updateActiveTime(e.target, index, 'second', penId);
}
function updateActiveTime(target, index, key, penId) {
  const panelTime = document.querySelector(`.${DROPMENU_PREFIX}${penId} .l-date-picker__panel-time`);
  const lastIndex = parseInt(panelTime.dataset[key])
  target.parentElement.children[lastIndex].classList.remove('is-current');
  target.classList.add('is-current');
  panelTime.dataset[key] = index + '';
}
function hourScroll(e, penId) {
  console.log(e.target.scrollTop, 'hourScroll')
  const index = Math.round(e.target.scrollTop / TIME_HEIGHT);
  const distance = index * TIME_HEIGHT;
  const scrollTop = e.target.scrollTop;
  console.log(distance, scrollTop, 'hourWheel')
  if (distance !== scrollTop) {
    const scrollCtrl = e.target;

    if (!scrollCtrl || scrollCtrl.scrollTop === distance) return;
    scrollCtrl.scrollTo?.({
      top: distance,
      behavior: 'smooth',
    });
    updateViewer(e.target, index, 'hour', penId);
    updateActiveTime(e.target.children[index], index, 'hour', penId);
  }
}
function minuteScroll(e, penId) {
  console.log(e, 'minuteScroll')
  console.log(e.target.scrollTop, 'hourScroll')
  const index = Math.round(e.target.scrollTop / TIME_HEIGHT);
  const distance = index * TIME_HEIGHT;
  const scrollTop = e.target.scrollTop;
  console.log(distance, scrollTop, 'hourWheel')
  if (distance !== scrollTop) {
    const scrollCtrl = e.target;

    if (!scrollCtrl || scrollCtrl.scrollTop === distance) return;
    scrollCtrl.scrollTo?.({
      top: distance,
      behavior: 'smooth',
    });
    updateViewer(e.target, index, 'minute', penId);
    updateActiveTime(e.target.children[index], index, 'minute', penId);
  }
}
function secondScroll(e, penId) {
  console.log(e, 'secondScroll')
  console.log(e.target.scrollTop, 'hourScroll')
  const index = Math.round(e.target.scrollTop / TIME_HEIGHT);
  const distance = index * TIME_HEIGHT;
  const scrollTop = e.target.scrollTop;
  console.log(distance, scrollTop, 'hourWheel')
  if (distance !== scrollTop) {
    const scrollCtrl = e.target;

    if (!scrollCtrl || scrollCtrl.scrollTop === distance) return;
    scrollCtrl.scrollTo?.({
      top: distance,
      behavior: 'smooth',
    });
    updateViewer(e.target, index, 'second', penId);
    updateActiveTime(e.target.children[index], index, 'second', penId);
  }
}
function updateViewer(target, index, type, penId) {
  const dropMenu = document.querySelector(`.${DROPMENU_PREFIX}${penId}`);
  const viewer = dropMenu.querySelector(`.${DROPMENU_PREFIX}${penId} .l-date-picker__panel-time .l-date-picker__panel-time-viewer`);
  const times = viewer.innerHTML.split(':');
  let value = '';
  if (index < 10) {
    value = '0' + index;
  } else {
    value = index + '';
  }
  if (type === 'hour') {
    times[0] = value;
  } else if (type === 'minute') {
    times[1] = value;
  } else {
    times[2] = value;
  }
  viewer.innerHTML = times.join(':');
}
function assembleSecond() {
  const frag = document.createDocumentFragment();
  for (let i = 0; i < TimeCount.SECOND; i++) {
    const li = document.createElement('li');
    li.className = 'l-time-picker__panel-body-scroll-item';
    li.dataset.value = i + '';
    if (i < 10) {
      li.innerHTML = '0' + i;
    } else {
      li.innerHTML = i + '';
    }
    frag.appendChild(li);
  }
  return frag;
}
function assembleMinute() {
  const frag = document.createDocumentFragment();
  for (let i = 0; i < TimeCount.MINUTE; i++) {
    const li = document.createElement('li');
    li.className = 'l-time-picker__panel-body-scroll-item';
    li.dataset.value = i + '';
    if (i < 10) {
      li.innerHTML = '0' + i;
    } else {
      li.innerHTML = i + '';
    }
    frag.appendChild(li);
  }
  return frag;
}
function assembleHour() {
  const frag = document.createDocumentFragment();
  for (let i = 0; i < TimeCount.HOUR; i++) {
    const li = document.createElement('li');
    li.className = 'l-time-picker__panel-body-scroll-item';
    li.dataset.value = i + '';
    if (i < 10) {
      li.innerHTML = '0' + i;
    } else {
      li.innerHTML = i + '';
    }
    frag.appendChild(li);
  }
  return frag;
}
function assemleDateItem(data, pen, opt) {
  const dateItem = document.createElement('div');
  const header = document.createElement('div');
  header.className = 'l-date-picker__header';
  const headerFrag = assembleHeader(data, pen, opt);
  header.appendChild(headerFrag);
  dateItem.appendChild(header);

  const tableItem = document.createElement('table');
  tableItem.className = 'l-date-picker__table';
  const tableFrag = assembleTable(data, pen, opt);
  tableItem.appendChild(tableFrag);
  dateItem.appendChild(tableItem);

  return dateItem;
}
function assembleTable(data, pen, opt) {
  const frag = document.createDocumentFragment();
  // thead
  const thead = document.createElement('thead');
  const tr = assembleTR(data, pen);
  thead.appendChild(tr);
  frag.appendChild(thead);

  // tbody
  const tbody = document.createElement('tbody');
  const trs = assembleBodyTRs(data, pen.id, opt);
  tbody.appendChild(trs);
  frag.appendChild(tbody);
  return frag;
}
function assembleBodyTRs(data, penId, opt: { year: number, month: number }) {
  const daylist = getTimeListByYearAndMonth(opt.year, opt.month);
  const frag = document.createDocumentFragment();
  for (let i = 0; i < daylist.length; i++) {
    const item = daylist[i];
    const tr = document.createElement('tr');
    tr.dataset.penId = penId;
    tr.className = 'l-date-picker__table-date-row';

    for (let k = 0; k < item.children.length; k++) {
      const child = item.children[k];
      const td = document.createElement('td');
      td.className = 'l-date-picker__cell';
      td.dataset.value = child.label;
      td.dataset.rowIndex = i + '';
      td.dataset.colIndex = k + '';
      td.addEventListener("click", tdClick);

      const inner = document.createElement('div');
      inner.className = 'l-date-picker__cell-inner';
      inner.dataset.value = child.label;
      inner.innerHTML = child.label;
      if (child.isCurrent && child.active) {
        td.className += ' l-date-picker__cell--now';
      }
      if (!child.active) {
        td.className += ' l-date-picker__cell--additional';
      }
      td.appendChild(inner);
      tr.appendChild(td);
    }
    frag.appendChild(tr);
  }

  return frag;
}
function tdClick(e) {
  e.stopPropagation();
  console.log(e.target.dataset, this, e.target, 'e')

  const penId = this.parentElement.dataset.penId
  const pen = window.meta2d.findOne(penId);
  if (!pen) {
    return;
  }
  if (!pen.multiple) {
    // 清除上一个选中的
    const { rowIndex, colIndex } = this.parentElement.parentElement.dataset;
    if (rowIndex && colIndex) {
      const _rowIndex = parseInt(rowIndex);
      const _colIndex = parseInt(colIndex);
      if (_rowIndex > -1 && _colIndex > -1) {
        console.log(this.parentElement.parentElement.children[_rowIndex].children[_colIndex], 'hello')
        this.parentElement.parentElement.children[_rowIndex].children[_colIndex].classList.remove('l-date-picker__cell--active');
      }
    }
  } else {

  }
  this.classList.add('l-date-picker__cell--active');

  this.parentElement.parentElement.dataset.lastdate = e.target.dataset.value;
  this.parentElement.parentElement.dataset.rowIndex = this.dataset.rowIndex;
  this.parentElement.parentElement.dataset.colIndex = this.dataset.colIndex;
}
function assembleTR(data, pen) {
  const tr = document.createElement('tr');
  for (let i = 0; i < weekDays.length; i++) {
    const day = weekDays[i];
    const th = document.createElement('th');
    th.innerHTML = day;
    tr.appendChild(th);
  }
  return tr;
}
function assembleHeader(data, pen, opt) {
  const frag = document.createDocumentFragment();
  const controller = document.createElement('div');
  controller.className = 'l-date-picker__header-controller';
  const month = document.createElement('div');
  month.className = 'l-select__wrap l-date-picker__header-controller-month';
  const monthOptions = [
    {
      label: '1',
      value: '1'
    },
    {
      label: '2',
      value: '2'
    },
    {
      label: '3',
      value: '3'
    },
    {
      label: '4',
      value: '4'
    },
    {
      label: '5',
      value: '5'
    },
    {
      label: '6',
      value: '6'
    },
    {
      label: '7',
      value: '7'
    },
    {
      label: '8',
      value: '8'
    },
    {
      label: '9',
      value: '9'
    },
    {
      label: '10',
      value: '10'
    },
    {
      label: '11',
      value: '11'
    },
    {
      label: '12',
      value: '12'
    }
  ];
  const monthSelect = assembleSelect({
    type: DateSelectType.MONTH,
    selectVal: opt.month,
    index: opt.index,
    penId: pen.id
  }, monthOptions);
  month.appendChild(monthSelect);
  controller.appendChild(month);

  const year = document.createElement('div');
  year.className = 'l-select__wrap l-date-picker__header-controller-year';
  const yearOptions = [
    {
      label: '2021',
      value: '2021'
    },
    {
      label: '2022',
      value: '2022'
    },
    {
      label: '2023',
      value: '2023'
    },
    {
      label: '2024',
      value: '2024'
    },
    {
      label: '2025',
      value: '2025'
    },
    {
      label: '2026',
      value: '2026'
    },
    {
      label: '2027',
      value: '2027'
    },
    {
      label: '2028',
      value: '2028'
    },
    {
      label: '2029',
      value: '2029'
    },
    {
      label: '2030',
      value: '2030'
    }
  ];
  const yearSelect = assembleSelect({
    type: DateSelectType.YEAR,
    selectVal: opt.year,
    index: opt.index,
    penId: pen.id
  }, yearOptions);
  year.appendChild(yearSelect);
  controller.appendChild(year);



  frag.appendChild(controller);

  const pagination = document.createElement('div');
  pagination.className = 'l-pagination-mini';
  const pageFrag = assemblePagination({
    index: opt.index,
    penId: pen.id
  });
  pagination.appendChild(pageFrag);

  frag.appendChild(pagination);
  return frag;
}
function selectClick(e) {
  e.stopPropagation();
  console.log(this.lastChild.firstChild.style.display, 'e');
  this.lastChild.firstChild.style.display = this.lastChild.firstChild.style.display === 'none' ? 'block' : 'none';
}
function assembleSelect(opt: { type, selectVal, index, penId }, options) {
  const select = document.createElement('div');
  select.className = 'l-select-input l-select';
  select.addEventListener('click', selectClick);

  const inputWrap = document.createElement('div');
  inputWrap.className = 'l-input__wrap';
  const lInput = document.createElement('div');
  lInput.className = 'l-input';


  const inputInner = document.createElement('input');
  inputInner.readOnly = true;
  inputInner.className = 'l-input__inner';
  inputInner.value = opt.selectVal;
  inputInner.dataset.type = opt.type;

  const inputSuffix = document.createElement('span');
  inputSuffix.className = 'l-input__suffix';
  lInput.appendChild(inputInner);
  lInput.appendChild(inputSuffix);
  inputWrap.appendChild(lInput);

  select.appendChild(inputWrap);

  const dropDown = document.createElement('div');
  dropDown.style.position = 'absolute';
  dropDown.style.left = '0';
  dropDown.style.top = '0';
  dropDown.style.width = '100%';

  const popParent = document.createElement('div');
  popParent.className = 'l-popup l-select__dropdown';
  popParent.style.display = 'none';
  // popParent.style.position = 'absolute';
  // popParent.style.inset = '0px auto auto 0px';
  // popParent.style.margin = '0px';
  // popParent.style.transform = 'translate3d(12px, 44px, 0px)';

  const popContent = document.createElement('div');
  popContent.className = 'l-popup__content';
  popContent.style.width = '80px';

  const dropdownInner = document.createElement('div');
  dropdownInner.className = 'l-select__dropdown-inner';

  const ul = document.createElement('ul');
  ul.className = 'l-select__list';
  ul.addEventListener('click', onSelect);
  for (let i = 0; i < options.length; i++) {
    const item = options[i];
    const li = document.createElement('li');
    li.className = 'l-select-option';
    li.dataset.value = item.value;
    li.dataset.type = opt.type;
    li.dataset.index = opt.index;
    li.dataset.penId = opt.penId;

    const span = document.createElement('span');
    span.innerHTML = item.label;
    span.dataset.value = item.value;
    span.dataset.type = opt.type;
    span.dataset.index = opt.index;
    span.dataset.penId = opt.penId;

    li.appendChild(span);
    ul.appendChild(li);
  }
  dropdownInner.appendChild(ul);
  popContent.appendChild(dropdownInner);

  popParent.appendChild(popContent);
  dropDown.appendChild(popParent);

  select.appendChild(dropDown);
  return select;
}
function onSelect(e) {
  // e.stopPropagation();
  const { type, index, penId, value } = e.target.dataset;
  const dropMenu = document.querySelector(`.${DROPMENU_PREFIX}${penId}`);
  const _type = parseInt(type);
  const _index = parseInt(index);
  const list = dropMenu.querySelectorAll('.l-date-picker__panel-date');
  // 更新content的数据，存储下来
  if (_type === DateSelectType.MONTH) {
    list[_index].dataset.currentMonth = value;
  } else {
    list[_index].dataset.currentYear = value;
  }
  // 更新header
  updateHeader(list[_index], type, value);

  // 更新body
  updateBody(list[_index], penId);
}
function updateHeader(dom: any, type: string, value) {
  const inputs = dom.querySelectorAll(".l-input__inner");
  for (const item of inputs) {
    if (item.dataset.type === type) {
      item.value = value;
    }
  }
}
function updateBody(dom, penId) {
  const year = dom.dataset.currentYear;
  const month = dom.dataset.currentMonth;
  const trs = assembleBodyTRs(null, penId, { year, month });
  const tbody = dom.querySelector('tbody');
  tbody.replaceChildren(trs);
}
function assemblePagination(opt) {
  const frag = document.createDocumentFragment();
  for (let i = 0; i < pagiMonth.length; i++) {
    const item = pagiMonth[i];
    const btn = document.createElement('button');
    btn.className = 'l-button';
    btn.title = item.label;
    btn.dataset.key = item.key;
    btn.dataset.index = opt.index;
    btn.dataset.penId = opt.penId;
    btn.onclick = btnClick;

    const svgDom = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svgDom.setAttribute("viewBox", "0 0 24 24");
    svgDom.style.width = '1em';
    svgDom.style.height = '1em';
    svgDom.style.fill = 'none';
    svgDom.dataset.key = item.key;

    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute("fill", "currentColor");
    path.setAttribute("d", svgMap[item.key]);
    path.dataset.key = item.key;
    svgDom.appendChild(path);

    btn.appendChild(svgDom);
    frag.appendChild(btn);
  }
  return frag;
}
function btnClick(e) {
  console.log(e.target.dataset, this, 'click')
  const { key, index, penId } = this.dataset;
  const dropMenu = document.querySelector(`.${DROPMENU_PREFIX}${penId}`);
  const list = dropMenu.querySelectorAll('.l-date-picker__panel-date');
  const _index = parseInt(index);
  console.log(list[_index].dataset, 'dataset');
  const { mode, currentMonth, currentYear } = list[_index].dataset;
  const _mode = parseInt(mode);
  let _currentMonth = parseInt(currentMonth);
  let _currentYear = parseInt(currentYear);
  if (key === 'prev') {
    if (_mode === SwitchMode.MONTH) {
      if (_currentMonth > 1) {
        _currentMonth--;
        list[_index].dataset.currentMonth = _currentMonth;
        // 更新header
        updateHeader(list[_index], DateSelectType.MONTH + '', _currentMonth + '');
      } else if (_currentMonth === 1) {
        _currentMonth = 12;
        _currentYear--;
        list[_index].dataset.currentMonth = _currentMonth;
        list[_index].dataset.currentYear = _currentYear;
        // 更新header
        updateHeader(list[_index], DateSelectType.MONTH + '', _currentMonth + '');
        updateHeader(list[_index], DateSelectType.YEAR + '', _currentYear + '');
      }
      // 更新body
      updateBody(list[_index], penId);
    }
  } else if (key === 'next') {
    if (_currentMonth < 12) {
      _currentMonth++;
      list[_index].dataset.currentMonth = _currentMonth;
      // 更新header
      updateHeader(list[_index], DateSelectType.MONTH + '', _currentMonth + '');
    } else if (_currentMonth === 12) {
      _currentMonth = 1;
      _currentYear++;
      list[_index].dataset.currentMonth = _currentMonth;
      list[_index].dataset.currentYear = _currentYear;
      // 更新header
      updateHeader(list[_index], DateSelectType.MONTH + '', _currentMonth + '');
      updateHeader(list[_index], DateSelectType.YEAR + '', _currentYear + '');
    }
    // 更新body
    updateBody(list[_index], penId);

  } else if (key === 'current') {
    // 获取当前的年月
    const currentYear = dayjs().year();
    const currentMonth = dayjs().month() + 1;
    // 更新content的数据，存储下来
    list[_index].dataset.currentYear = currentYear;
    list[_index].dataset.currentMonth = currentMonth;
    // 更新header
    updateHeader(list[_index], DateSelectType.YEAR + '', currentYear);
    updateHeader(list[_index], DateSelectType.MONTH + '', currentMonth);

    // 更新body
    updateBody(list[_index], penId);
  }
}
function assembleInputBox(pen: Pen) {
  const box = document.createElement("div");
  box.style.width = '100%';
  box.style.height = '100%';
  box.style.padding = '0 8px';
  box.style.border = '1px solid #ccc';
  box.style.borderRadius = '4px';
  // box.style.whiteSpace = 'nowrap';
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
  input.className = `${CASCADE_PREFIX}${pen.id}`;
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
function renderPenRaw(pen: Pen, mkey: string, data: any) {
  // const flowPath = [];
  // getTreeFlowPathDefault(data, flowPath, item => item === 0);
  // const opt = {
  //   penId: pen.id,
  //   checked: pen.checked,
  // };
  // const fragMent = generateDomByData(data, flowPath, opt);
  // const cascaderPanel = document.querySelector('.l-cascader__panel');
  // cascaderPanel.appendChild(fragMent);
}

/**
 * @description 组装下拉选择器
 * @author Joseph Ho
 * @date 30/10/2024
 */
function assembleSelectPicker() {

}

const getTimeListByYearAndMonth = (year, month) => {
  // !清空选中日期
  // selectDate.value = null
  // 获取当前选中月份的1号
  let selectDay = `${year}-${month}-01`
  // 选中时间是周几
  const weekDay = dayjs(selectDay).day()
  // 日历组件的起始日期
  const firstDay = dayjs(selectDay).subtract(weekDay, 'day')
  console.log(firstDay.day(), 'firstDay');
  const dayList = []
  for (let i = 0; i < 6; i++) {
    const childrenList = []
    for (let time = 0; time < 7; time++) {
      let day = dayjs(firstDay).add(i * 7 + time, "day")
      const date = day.format("YYYY-MM-DD")
      // active 代表是不是当前月的日期
      // isCurrent 代表是不是今天
      childrenList.push(
        {
          label: day.format("D"),
          date,
          active: Number(day.format("M")) == month,
          isCurrent: date === dayjs().format("YYYY-MM-DD")
        }
      )
    }
    dayList.push({
      time: dayjs(firstDay).add(i * 7, "day").format("YYYY-MM-DD"),
      children: childrenList
    })
  }
  console.log('dayList: ', dayList);

  return dayList
}
// const daylist  = getTimeListByYearAndMonth(dayjs().year(), dayjs().month())

// function getDates() {
//   const tableRows = [[], [], [], [], [], []];
//   const rows_ = [[], [], [], [], [], []];
//   const cols = 7
//   // 当前选中的日期
//   const cur = dayjs("2024-9-28");
//   const startDayOfMonth = cur.startOf('month')
//   const startDate = dayjs().startOf('month').subtract(startDayOfMonth.day() || 7, 'day');
//   // 当月第一天
//   const monthDstartDay = cur.startOf('month').day()
//   // 当月最后一天
//   const lastDate = cur.endOf('month').date()

//   let count = 1
//   // 循环填充表格，6行7列
//   for (let row = 0; row < tableRows.length; row++) {
//     for (let col = 0; col < cols; col++) {
//       const cellDate = startDate.add(count, 'day')
//       const text = cellDate.date()

//       // 是否选中
//       // const disabled = isFunction(datePicker?.disabledDate) && datePicker!.disabledDate(cellDate.toDate())

//       // 默认当月日期
//       // const isSelected = cellDate.format('YYYY-MM-DD') === datePicker?.date.value.format('YYYY-MM-DD')
//       let type = 'normal'
//       if (count < monthDstartDay) { // 上个月日期
//         type = 'prev-month'
//       } else if (count - monthDstartDay >= lastDate) { // 下个月日期
//         type = 'next-month'
//       }
//       rows_[row][col] = {
//         type,
//         date: cellDate,
//         text,
//         // isSelected,
//         // disabled
//       }
//       count++
//     }
//   }

//   return rows_
// }
// const dates = getDates()
// console.log(dates, 'dates');

function generateMonthCalendar(year, month) {
  // 创建一个新的 Day.js 对象，设置为指定年份和月份的第一天
  const firstDayOfMonth = dayjs().year(year).month(month - 1).date(1);
  // 获取当月第一天是星期几 (0-6, 0 表示星期日)
  const startDayOfWeek = firstDayOfMonth.day();
  console.log(startDayOfWeek, 'startDayOfWeek');
  // 获取该月总天数
  const daysInMonth = firstDayOfMonth.daysInMonth();

  // 初始化一个空的二维数组来存放每周的数据
  let calendar = [];
  // 当前处理的日期
  let currentDate = 1;
  // 循环直到所有的天数都被添加到calendar中
  for (let week = 0; ; week++) {
    // 每周开始时初始化一个新的数组
    calendar[week] = [];

    // 遍历一周中的每一天
    for (let day = 0; day < 7; day++) {
      // 如果当前天是本月的第一天之前，则填充空值
      if (week === 0 && day < startDayOfWeek) {
        calendar[week].push(null);
      } else if (currentDate > daysInMonth) {
        // 如果已经超过了这个月的天数，退出循环
        break;
      } else {
        // 否则，添加当天的日期
        calendar[week].push(currentDate++);
      }
    }

    // 如果已经填满了整个月份的天数，退出循环
    if (currentDate > daysInMonth) {
      break;
    }
  }

  return calendar;
}

// 使用示例
const year = 2024;  // 可以替换为你想要查询的年份
const month = 10;   // 可以替换为你想要查询的月份
const calendarData = generateMonthCalendar(year, month);

// 打印出月份的日历数据
console.log(calendarData);