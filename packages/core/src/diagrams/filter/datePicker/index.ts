import { movingSuffix } from '../../../canvas';
import { Pen, setElemPosition } from '../../../pen';
import { Point, distance } from '../../../point';
import { rectInRect } from '../../../rect';
import { deepClone, debounce } from '../../../utils';
import './dayjs.min.js'
import './isoWeek.min.js'
import './weekOfYear.min.js'
dayjs.extend(window.dayjs_plugin_isoWeek)
dayjs.extend(window.dayjs_plugin_weekOfYear)


const TAG_WRAPPER = 'dtag_wrapper_';
const TAG_PREFIX = 'dtag_';
const DROPMENU_PREFIX = 'l-date-range-picker__panel_';
const CASCADE_PREFIX = 'l-date-';
const TIME_HEIGHT = 30;
enum DateSelectType {
  MONTH,
  YEAR,
  YEAR_RANGE
}
enum TimeCount {
  HOUR = 24,
  MINUTE = 60,
  SECOND = 60
}
enum CTL_TYPE {
  PREV = 'prev',
  CURRENT = 'current',
  NEXT = 'next'
}
enum MonthType {
  PREV = 'prev-month',
  CURRENT = 'current-month',
  NEXT = 'next-month'
}
const panelComp = {
  "date": ["date"],
  "datetime": ["date", "time"],
  "daterange": ["date", "date"],
}
enum SwitchMode {
  DATE = "date",
  WEEK = "week",
  MONTH = "month",
  QUARTER = "quarter",
  YEAR = "year",
}
const pagiCtls = [
  {
    label: CTL_TYPE.PREV,
    key: CTL_TYPE.PREV
  },
  {
    label: CTL_TYPE.CURRENT,
    key: CTL_TYPE.CURRENT,
  },
  {
    label: CTL_TYPE.NEXT,
    key: CTL_TYPE.NEXT,
  }
]
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
let yeartoYearOptions = [];
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
const svgMap = {
  [CTL_TYPE.PREV]: `M15.91 17.5l-5.5-5.5 5.5-5.5-1.41-1.41L7.59 12l6.91 6.91 1.41-1.41z`,
  [CTL_TYPE.CURRENT]: `M12 6a6 6 0 100 12 6 6 0 000-12zm-8 6a8 8 0 1116 0 8 8 0 01-16 0z`,
  [CTL_TYPE.NEXT]: `M8.09 17.5l5.5-5.5-5.5-5.5L9.5 5.09 16.41 12 9.5 18.91 8.09 17.5z`
}
const weekDate = ['日', '一', '二', '三', '四', '五', '六'];
const weekWeek = ['一', '二', '三', '四', '五', '六', '日'];
export function datePicker(pen: Pen): Path2D {
  if (!pen.onDestroy) {
    pen.onDestroy = onDestroy;
    pen.onMouseUp = onMouseUp;
    pen.onAdd = onAdd;
    pen.onResize = resize;
    pen.onMouseEnter = onMouseEnter;
    pen.onMouseLeave = onMouseLeave;
    pen.onRenderPenRaw = renderPenRaw;
  }
  const { x, y, width, height } = pen.calculative.worldRect;
  if (!pen.calculative.singleton) {
    pen.calculative.singleton = {};
  }
  if (!pen.mode) {
    pen.mode = SwitchMode.DATE;
  }
  if (!pen.calculative.singleton.div) {
    // 校验修正参数

    if (pen.mode === SwitchMode.DATE) {
      //格式化数据
      let pickerTimes = deepClone(pen.pickerTimes);
      if (!pickerTimes) {
        pickerTimes = [];
      }
      if (pickerTimes.length > 0) {
        let format = ""
        if (!pen.enableTimePicker) {
          format = "YYYY-MM-DD"
        } else {
          format = "YYYY-MM-DD HH:mm:ss"
        }
        pickerTimes = pen.pickerTimes.map(item => dayjs(item).format(format));
      }
      window.meta2d.setValue({
        id: pen.id,
        pickerTimes,
      })
    }
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
  generateStyle()

  const lPanel = document.createElement('div');
  lPanel.className = 'l-date-picker__panel';
  lPanel.style.display = 'flex';
  const fragMent = generateDomByData(data, pen);
  lPanel.appendChild(fragMent);
  dom.appendChild(lPanel);
}
function generateDomByData(data, pen) {
  let key = "date";
  // 根据配置生成不同的面板
  if (pen.date) {
    key = "date";
  } else if (pen.enableTimePicker) {
    key = "datetime";
  }
  const frag = document.createDocumentFragment();
  for (let i = 0; i < panelComp[key].length; i++) {
    const type = panelComp[key][i];
    if (type === "date") {
      let dateDom = null;
      if (pen.mode === SwitchMode.DATE) {
        dateDom = generateDateDom(data, pen, i)
      } else if (pen.mode === SwitchMode.WEEK) {
        dateDom = generateWeekDom(data, pen, i)
      } else if (pen.mode === SwitchMode.MONTH) {
        dateDom = generateMonthDom(data, pen, i)
      } else if (pen.mode === SwitchMode.QUARTER) {
        dateDom = generateQuarterDom(data, pen, i)
      } else if (pen.mode === SwitchMode.YEAR) {
        dateDom = generateYearDom(data, pen, i)
      }
      frag.appendChild(dateDom);
    } else if (type === "time") {
      const timeDom = generateTimeDom(data, pen)
      frag.firstChild.appendChild(timeDom);
      const footer = generateFooter(data, pen);
      frag.appendChild(footer);
    }
  }
  return frag;
}
function generateFooter(data, pen) {
  const frag = document.createDocumentFragment();

  const footer = document.createElement('div');
  footer.className = 'l-date-picker__footer l-date-picker__footer--bottom';

  const presets = document.createElement('div');
  presets.className = 'l-date-picker__presets';
  footer.appendChild(presets);

  const btn = document.createElement('button');
  btn.className = 'l-button l-button--theme-primary l-is-disabled';
  btn.dataset.penId = pen.id;
  btn.addEventListener('click', onOk)

  const btnInner = document.createElement('span');
  btnInner.className = 'l-button__text';
  btnInner.innerHTML = '确定';
  btn.appendChild(btnInner);
  footer.appendChild(btn);
  frag.appendChild(footer);
  return frag;
}
function onOk(e) {
  // const content = this.parentElement.previousElementSibling
  // console.log(content)
  updateTagsWithDate(this.dataset.penId, 0, '');
  // 隐藏下拉框
  this.parentElement.parentElement.parentElement.style.display = 'none';
}
function generateWeekDom(data, pen, index) {
  const frag = document.createDocumentFragment();
  const currentYear = dayjs().year();
  let currentMonth = dayjs().month() + 1;
  const content = document.createElement('div');
  content.className = 'l-date-picker__panel-content';

  const dateItem = assemleWeekItem(data, pen, {
    year: currentYear,
    month: currentMonth,
    index
  });
  dateItem.className = 'l-date-picker__panel-week';
  dateItem.dataset.type = 'week';
  dateItem.dataset.index = index + '';
  dateItem.dataset.currentMonth = currentMonth + '';
  dateItem.dataset.currentYear = currentYear + '';
  dateItem.dataset.mode = SwitchMode.WEEK;
  // currentMonth++;

  content.appendChild(dateItem);

  frag.appendChild(content);
  return frag;
}
function assemleWeekItem(data, pen, opt) {
  const dateItem = document.createElement('div');
  const header = document.createElement('div');
  header.className = 'l-date-picker__header';
  const headerFrag = assembleHeader(data, pen, opt, SwitchMode.WEEK);
  header.appendChild(headerFrag);
  dateItem.appendChild(header);

  const tableItem = document.createElement('table');
  tableItem.className = 'l-date-picker__table';
  const tableFrag = assembleWeekTable(data, pen, opt);
  tableItem.appendChild(tableFrag);
  dateItem.appendChild(tableItem);

  return dateItem;
}
function assembleWeekTable(data, pen, opt) {
  const frag = document.createDocumentFragment();
  // thead
  const thead = document.createElement('thead');
  const tr = assembleTR(SwitchMode.WEEK);
  thead.appendChild(tr);
  frag.appendChild(thead);

  // tbody
  const tbody = document.createElement('tbody');
  tbody.dataset.index = opt.index + '';
  const trs = assembleWeekBodyTRs(pen, opt);
  tbody.appendChild(trs);
  frag.appendChild(tbody);
  return frag;
}
function getWeekMonthOfYear(year: number, month: number, startWeek: number, endWeek: number) {
  const weekList = [];
  for (let i = startWeek; i <= endWeek; i++) {
    // The first monday of the first week includes at least one day of the year
    let firstMondayOfYear = dayjs().year(year).isoWeek(i).day(1);
    // console.log("Monday 1:", firstMondayOfYear.format("YYYY-MM-DD"));

    // Now make sure it really is the first monday of the year
    if (firstMondayOfYear.year() !== year) {
      firstMondayOfYear = firstMondayOfYear.add(7, "days");
    }
    // console.log("Monday 2:", firstMondayOfYear.format("YYYY-MM-DD"));

    // return the week for that "real" first monday of the year
    const list = new Array(7)
      .fill(firstMondayOfYear)
      .map((day, idx) => {
        const _day = day.add(idx, "day");
        const _month = Number(_day.format("M"));
        const date = _day.format("YYYY-MM-DD");

        let type = MonthType.CURRENT;
        const deltaMonth = _month - month;
        if (deltaMonth === -1) {
          type = MonthType.PREV;
        } else if (deltaMonth === 1) {
          type = MonthType.NEXT;
        } else {
          if (deltaMonth < -1) {
            type = MonthType.NEXT;
          } else if (deltaMonth > 1) {
            type = MonthType.PREV;
          }
        }
        return {
          label: _day.format("D"),
          date: date,
          week: day.isoWeek(),
          type,
          active: _month == month,
          isCurrent: date === dayjs().format("YYYY-MM-DD")
        }
      });
    weekList.push(list);
  }
  return weekList;
}
function trWeekClick(e) {
  const { mode, currentMonth, currentYear } = this.parentElement.parentElement.parentElement.dataset;
  // l-date-picker__table-week-row--active

  const _mode = parseInt(mode);
  let _currentMonth = parseInt(currentMonth);
  let _currentYear = parseInt(currentYear);

  // 这里还是需要计算一些边界情况，修改月和年的数据

  const { penId, week } = this.dataset;
  const pen = window.meta2d.findOne(penId);
  if (!pen) {
    return;
  }

  // const { value } = e.target.dataset;
  const pickerTimes = deepClone(pen.pickerTimes);
  const yyhhdd = `${_currentYear}-${week}`;
  updateTags(pickerTimes, yyhhdd, pen);
  window.meta2d.setValue({
    id: penId,
    pickerTimes,
  })
  adjustHeight(pen);

  // 还是需要更新月份和年份

  // 更新body
  updateBody(this.parentElement.parentElement.parentElement, penId);
}
function assembleWeekBodyTRs(pen, opt: { year: number, month: number }) {
  const startWeek = dayjs().year(opt.year).month(opt.month - 1).startOf('month').week();
  // const endWeek = dayjs().year(opt.year).month(opt.month - 1).endOf('month').week();
  const endWeek = startWeek + 5;
  const weeklist = getWeekMonthOfYear(opt.year, opt.month, startWeek, endWeek);
  const frag = document.createDocumentFragment();
  for (let i = 0; i < weeklist.length; i++) {
    const everyWeek = weeklist[i];
    const tr = document.createElement('tr');
    tr.dataset.penId = pen.id;
    tr.dataset.week = everyWeek[0].week + '';
    tr.className = 'l-date-picker__table-week-row';
    const yyww = `${opt.year}-${everyWeek[0].week}`;
    if (pen.pickerTimes.indexOf(yyww) > -1) {
      tr.classList.add('l-date-picker__table-week-row--active');
    }
    tr.addEventListener('click', trWeekClick);

    for (let k = 0; k < everyWeek.length; k++) {
      const date = everyWeek[k];
      if (k === 0) {
        const td = document.createElement('td');
        td.className = 'l-date-picker__cell';

        const inner = document.createElement('div');
        inner.className = 'l-date-picker__cell-inner';
        inner.innerHTML = date.week;

        td.appendChild(inner);
        tr.appendChild(td);
      }
      const td = document.createElement('td');
      td.className = 'l-date-picker__cell';
      td.dataset.value = date.label;
      td.dataset.rowIndex = i + '';
      td.dataset.colIndex = k + '';
      td.dataset.type = date.type;
      if (date.type === MonthType.CURRENT && pen.pickerTimes.indexOf(date.date) > -1) {
        td.classList.add('l-date-picker__cell--active');
      }
      // td.addEventListener("click", tdClick);

      const inner = document.createElement('div');
      inner.className = 'l-date-picker__cell-inner';
      inner.dataset.value = date.label;
      inner.innerHTML = date.label;
      if (date.isCurrent && date.active) {
        td.className += ' l-date-picker__cell--now';
      }
      if (!date.active) {
        td.className += ' l-date-picker__cell--additional';
      }
      td.appendChild(inner);
      tr.appendChild(td);
    }
    frag.appendChild(tr);
  }

  return frag;
}
function generateMonthDom(data, pen, index) {
  const frag = document.createDocumentFragment();
  const currentYear = dayjs().year();
  let currentMonth = dayjs().month() + 1;
  const content = document.createElement('div');
  content.className = 'l-date-picker__panel-content';

  const dateItem = assemleMonthItem(data, pen, {
    year: currentYear,
    month: currentMonth,
    index
  });
  dateItem.className = 'l-date-picker__panel-month';
  dateItem.dataset.type = 'month';
  dateItem.dataset.index = index + '';
  dateItem.dataset.currentMonth = currentMonth + '';
  dateItem.dataset.currentYear = currentYear + '';
  dateItem.dataset.mode = SwitchMode.MONTH;
  // currentMonth++;

  content.appendChild(dateItem);

  frag.appendChild(content);
  return frag;
}
function generateQuarterDom(data, pen, index) {

}
function generateYearDom(data, pen, index) {
  const frag = document.createDocumentFragment();
  const currentYear = dayjs().year();
  const content = document.createElement('div');
  content.className = 'l-date-picker__panel-content';

  //生成年份选项数据
  let curYear = currentYear;
  if (curYear % 10 !== 0) {
    curYear = curYear - curYear % 10;
  }
  yeartoYearOptions = getYeartoYearOptions(curYear, 50, 10);
  const yOpt = yeartoYearOptions.find(el => currentYear >= el.value[0] && currentYear <= el.value[1]);
  const dateItem = assemleYearItem(data, pen, {
    year: yOpt.value[0],
    index
  });

  dateItem.className = 'l-date-picker__panel-year';
  dateItem.dataset.type = 'year';
  dateItem.dataset.index = index + '';
  dateItem.dataset.currentYear = currentYear + '';
  dateItem.dataset.yearRange = yOpt.value + '';
  dateItem.dataset.mode = SwitchMode.YEAR;

  content.appendChild(dateItem);

  frag.appendChild(content);
  return frag;
}
function generateTimeDom(data, pen) {
  const frag = document.createDocumentFragment();
  const timeItem = assembleTimeItem(data, pen);
  frag.appendChild(timeItem);
  return frag;
}
function generateDateDom(data, pen, index?) {
  const frag = document.createDocumentFragment();
  let currentYear, currentMonth, currentDay;
  if (pen.pickerTimes.length === 0) {
    currentYear = dayjs().year();
    currentMonth = dayjs().month() + 1;
  } else {
    const date = dayjs(pen.pickerTimes[0]);
    currentYear = date.year();
    currentMonth = date.month() + 1;
    currentDay = date.date();
  }

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
  dateItem.dataset.currentDay = currentDay + '';
  dateItem.dataset.mode = SwitchMode.DATE;
  currentMonth++;

  content.appendChild(dateItem);

  frag.appendChild(content);
  return frag;
}
function assemleYearItem(data, pen, opt) {
  const dateItem = document.createElement('div');
  const header = document.createElement('div');
  header.className = 'l-date-picker__header';

  const headerFrag = assembleHeader(data, pen, opt, SwitchMode.YEAR);
  header.appendChild(headerFrag);
  dateItem.appendChild(header);

  const tableItem = document.createElement('table');
  tableItem.className = 'l-date-picker__table';
  const tableFrag = assembleYearTable(data, pen, opt);
  tableItem.appendChild(tableFrag);
  dateItem.appendChild(tableItem);
  return dateItem;
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
function onAdd(pen: Pen) {
  adjustHeight(pen);
}
function assembleTimeItem(data, pen) {
  const timeItem = document.createElement('div');
  timeItem.className = 'l-date-picker__panel-time';
  let hour = "", minute = "", second = "";
  if (pen.enableTimePicker && pen.pickerTimes.length > 0) {
    const hhmmss = dayjs(pen.pickerTimes[0]).format("HH:mm:ss");
    const list = hhmmss.split(':');
    hour = list[0];
    minute = list[1];
    second = list[2];
  } else {
    hour = "00";
    minute = "00";
    second = "00";
  }
  timeItem.dataset.hour = hour;
  timeItem.dataset.minute = minute;
  timeItem.dataset.second = second;

  const viewer = document.createElement('div');
  viewer.className = 'l-date-picker__panel-time-viewer';
  viewer.innerHTML = `${hour}:${minute}:${second}`;
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

  const hourDom = document.createElement('ul');
  hourDom.className = 'l-time-picker__panel-body-scroll';
  hourDom.addEventListener('scroll', debounce((e) => hourScroll(e, pen.id), 200));
  hourDom.addEventListener('click', (e) => { hourClick(e, pen.id) });
  const hourFrag = assembleHour();
  const hIndex = parseInt(timeItem.dataset.hour);
  hourFrag.children[hIndex].classList.add('is-current');
  hourDom.appendChild(hourFrag);

  panelBody.appendChild(hourDom);

  const minuteDom = document.createElement('ul');
  minuteDom.className = 'l-time-picker__panel-body-scroll';
  minuteDom.addEventListener('scroll', debounce((e) => minuteScroll(e, pen.id), 200));
  minuteDom.addEventListener('click', (e) => { minuteClick(e, pen.id) });
  const minuteFrag = assembleMinute();
  const mIndex = parseInt(timeItem.dataset.minute);
  minuteFrag.children[mIndex].classList.add('is-current');
  minuteDom.appendChild(minuteFrag);
  panelBody.appendChild(minuteDom);

  const secondDom = document.createElement('ul');
  secondDom.className = 'l-time-picker__panel-body-scroll';
  secondDom.addEventListener('scroll', debounce((e) => secondScroll(e, pen.id), 200));
  secondDom.addEventListener('click', (e) => { secondClick(e, pen.id) });
  const secondFrag = assembleSecond();
  const sIndex = parseInt(timeItem.dataset.second);
  secondFrag.children[sIndex].classList.add('is-current');
  secondDom.appendChild(secondFrag);
  panelBody.appendChild(secondDom);

  sectionBody.appendChild(panelBody);
  panel.appendChild(sectionBody);
  timeItem.appendChild(panel);

  if (pen.enableTimePicker && pen.pickerTimes.length > 0) {
    setTimeout(() => {
      const hourDistance = hIndex * TIME_HEIGHT;
      hourDom.scrollTo?.({
        top: hourDistance,
        behavior: 'smooth',
      });
      const minuteDistance = mIndex * TIME_HEIGHT;
      minuteDom.scrollTo?.({
        top: minuteDistance,
        behavior: 'smooth',
      });
      const secondDistance = sIndex * TIME_HEIGHT;
      secondDom.scrollTo?.({
        top: secondDistance,
        behavior: 'smooth',
      })
    }, 10)

  }
  return timeItem;
}
function hourClick(e, penId) {
  if (e.target.tagName !== 'LI') return;
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
  // update tags
  updateTagsWithDate(penId, index, 'hour');
}
function minuteClick(e, penId) {
  if (e.target.tagName !== 'LI') return;
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
  // update tags
  updateTagsWithDate(penId, index, 'hour');
}
function secondClick(e, penId) {
  if (e.target.tagName !== 'LI') return;
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
  // update tags
  updateTagsWithDate(penId, index, 'hour');
}
function updateActiveTime(target, index, key, penId) {
  const panelTime = document.querySelector(`.${DROPMENU_PREFIX}${penId} .l-date-picker__panel-time`);
  const lastIndex = parseInt(panelTime.dataset[key])
  target.parentElement.children[lastIndex].classList.remove('is-current');
  target.classList.add('is-current');
  panelTime.dataset[key] = index + '';
}
function hourScroll(e, penId) {
  const index = Math.round(e.target.scrollTop / TIME_HEIGHT);
  const distance = index * TIME_HEIGHT;
  const scrollTop = e.target.scrollTop;
  if (distance !== scrollTop) {
    const scrollCtrl = e.target;

    if (!scrollCtrl || scrollCtrl.scrollTop === distance) return;
    scrollCtrl.scrollTo?.({
      top: distance,
      behavior: 'smooth',
    });
    updateViewer(e.target, index, 'hour', penId);
    updateActiveTime(e.target.children[index], index, 'hour', penId);

    // update tags
    updateTagsWithDate(penId, index, 'hour');
  }
}
function minuteScroll(e, penId) {
  const index = Math.round(e.target.scrollTop / TIME_HEIGHT);
  const distance = index * TIME_HEIGHT;
  const scrollTop = e.target.scrollTop;
  if (distance !== scrollTop) {
    const scrollCtrl = e.target;

    if (!scrollCtrl || scrollCtrl.scrollTop === distance) return;
    scrollCtrl.scrollTo?.({
      top: distance,
      behavior: 'smooth',
    });
    updateViewer(e.target, index, 'minute', penId);
    updateActiveTime(e.target.children[index], index, 'minute', penId);

    // update tags
    updateTagsWithDate(penId, index, 'hour');
  }
}
function secondScroll(e, penId) {
  const index = Math.round(e.target.scrollTop / TIME_HEIGHT);
  const distance = index * TIME_HEIGHT;
  const scrollTop = e.target.scrollTop;
  if (distance !== scrollTop) {
    const scrollCtrl = e.target;

    if (!scrollCtrl || scrollCtrl.scrollTop === distance) return;
    scrollCtrl.scrollTo?.({
      top: distance,
      behavior: 'smooth',
    });
    updateViewer(e.target, index, 'second', penId);
    updateActiveTime(e.target.children[index], index, 'second', penId);

    // update tags
    updateTagsWithDate(penId, index, 'hour');
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
function updateTagsWithDate(penId, index, key) {
  const panelTime = document.querySelector(`.${DROPMENU_PREFIX}${penId} .l-date-picker__panel-time`);
  const { hour, minute, second } = panelTime.dataset;
  const dateDom = panelTime.previousElementSibling;
  const { currentMonth, currentYear, currentDay } = dateDom.dataset;
  const _currentMonth = parseInt(currentMonth);
  const _currentYear = parseInt(currentYear);
  let _currentDay = parseInt(currentDay);
  let flag = false;
  if (isNaN(_currentDay)) {
    _currentDay = dayjs().date();
    flag = true;
  }
  const val = dayjs().year(_currentYear).month(_currentMonth - 1).date(_currentDay).hour(hour).minute(minute).second(second).format("YYYY-MM-DD HH:mm:ss");

  const pen = window.meta2d.findOne(penId);
  if (!pen) {
    return;
  }
  const pickerTimes = deepClone(pen.pickerTimes);
  updateTags(pickerTimes, val, pen);
  window.meta2d.setValue({
    id: penId,
    pickerTimes,
  })
  adjustHeight(pen);

  // 更新footer
  if (pen.enableTimePicker) {
    const button = panelTime.parentElement.nextElementSibling.lastChild;
    if (button.classList.contains('l-is-disabled')) {
      button.classList.remove('l-is-disabled');
    }
  }

  // 更新body
  flag && updateBody(dateDom, penId);
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
  const headerFrag = assembleHeader(data, pen, opt, SwitchMode.DATE);
  header.appendChild(headerFrag);
  dateItem.appendChild(header);

  const tableItem = document.createElement('table');
  tableItem.className = 'l-date-picker__table';
  const tableFrag = assembleDateTable(data, pen, opt);
  tableItem.appendChild(tableFrag);
  dateItem.appendChild(tableItem);

  return dateItem;
}
function assemleMonthItem(data, pen, opt) {
  const dateItem = document.createElement('div');
  const header = document.createElement('div');
  header.className = 'l-date-picker__header';
  const headerFrag = assembleHeader(data, pen, opt, SwitchMode.MONTH);
  header.appendChild(headerFrag);
  dateItem.appendChild(header);

  const tableItem = document.createElement('table');
  tableItem.className = 'l-date-picker__table';
  const tableFrag = assembleMonthTable(data, pen, opt);
  tableItem.appendChild(tableFrag);
  dateItem.appendChild(tableItem);

  return dateItem;
}
function assembleDateTable(data, pen, opt) {
  const frag = document.createDocumentFragment();
  // thead
  const thead = document.createElement('thead');
  const tr = assembleTR(SwitchMode.DATE);
  thead.appendChild(tr);
  frag.appendChild(thead);

  // tbody
  const tbody = document.createElement('tbody');
  tbody.dataset.index = opt.index + '';
  const trs = assembleDateBodyTRs(pen, opt);
  tbody.appendChild(trs);
  frag.appendChild(tbody);
  return frag;
}
function assembleYearTable(data, pen, opt) {
  const frag = document.createDocumentFragment();

  // tbody
  const tbody = document.createElement('tbody');
  tbody.dataset.index = opt.index + '';
  const trs = assembleYearBodyTRs(pen, opt);
  tbody.appendChild(trs);
  frag.appendChild(tbody);
  return frag;
}
function assembleMonthTable(data, pen, opt) {
  const frag = document.createDocumentFragment();
  // thead
  // const thead = document.createElement('thead');
  // const tr = assembleTR(data, pen);
  // thead.appendChild(tr);
  // frag.appendChild(thead);

  // tbody
  const tbody = document.createElement('tbody');
  tbody.dataset.index = opt.index + '';
  const trs = assembleMonthBodyTRs(pen, opt);
  tbody.appendChild(trs);
  frag.appendChild(tbody);
  return frag;
}
function getMonthList(year) {
  const list = [];
  for (let i = 1; i <= 12; i++) {
    let value = dayjs().year(year).month(i - 1).format('YYYY-MM');
    const month = {
      value,
      label: i,
    };
    list.push(month);
  }
  return list;
}
/**
 * @description 生成年选择器的tbody的tr列表
 * @author Joseph Ho
 * @date 04/11/2024
 * @param {*} pen
 * @param {{ year: number }} opt
 */
function assembleYearBodyTRs(pen, opt: { year: number }) {
  const frag = document.createDocumentFragment();
  const yOpt = yeartoYearOptions.find(el => opt.year >= el.value[0] && opt.year <= el.value[1]);
  if (!yOpt) return;
  const yearList = [];
  for (let i = yOpt.value[0]; i <= yOpt.value[1]; i++) {
    const obj = {
      value: i,
      label: i + '',
    }
    yearList.push(obj);
  }
  const currentYear = dayjs().year();
  // 生成4行3列的10年份tr数据
  for (let i = 0; i < 4; i++) {
    const tr = document.createElement('tr');
    tr.className = 'l-date-picker__table-year-row';
    tr.dataset.penId = pen.id;

    for (let k = 0; k < 3; k++) {
      if ((i * 3 + k) >= yearList.length) {
        break;
      }
      const item = yearList[i * 3 + k];
      const td = document.createElement('td');
      td.className = 'l-date-picker__cell';
      const val = item.value
      const label = item.label;
      td.dataset.value = val + '';

      td.addEventListener("click", tdYearClick);
      if (val === currentYear) {
        td.className += ' l-date-picker__cell--now';
      }
      if (pen.pickerTimes.indexOf(item.label) > -1) {
        td.classList.add('l-date-picker__cell--active');
      }

      const inner = document.createElement('div');
      inner.className = 'l-date-picker__cell-inner';
      inner.dataset.value = val + '';
      inner.innerHTML = label + '';

      td.appendChild(inner);
      tr.appendChild(td);

    }
    frag.appendChild(tr);
  }
  return frag;
}
/**
 * @description 生成月选择器的tbody的tr列表
 * @author Joseph Ho
 * @date 02/11/2024
 * @param {*} pen
 * @param {{ year: number, month: number }} opt
 */
function assembleMonthBodyTRs(pen, opt: { year: number, month: number }) {
  const monthList = getMonthList(opt.year);
  const frag = document.createDocumentFragment();
  const month_suffix = '月';
  let currentMonth = dayjs().year(opt.year).month(opt.month - 1).format('YYYY-MM');
  for (let i = 0; i < 4; i++) {
    const tr = document.createElement('tr');
    tr.className = 'l-date-picker__table-month-row';
    tr.dataset.penId = pen.id;

    for (let k = 0; k < 3; k++) {
      const item = monthList[i * 3 + k];
      const td = document.createElement('td');
      td.className = 'l-date-picker__cell';
      const val = item.value
      const label = item.label;

      td.addEventListener("click", tdMonthClick);
      if (val === currentMonth) {
        td.className += ' l-date-picker__cell--now';
      }
      if (pen.pickerTimes.indexOf(item.value) > -1) {
        td.classList.add('l-date-picker__cell--active');
      }

      const inner = document.createElement('div');
      inner.className = 'l-date-picker__cell-inner';
      inner.dataset.value = val + '';
      inner.innerHTML = label + month_suffix;

      td.appendChild(inner);
      tr.appendChild(td);
    }
    frag.appendChild(tr);
  }
  return frag;
}
function tdYearClick(e) {
  e.stopPropagation();
  const { mode, currentYear } = this.parentElement.parentElement.parentElement.parentElement.dataset;
  const penId = this.parentElement.dataset.penId
  const pen = window.meta2d.findOne(penId);
  if (!pen) {
    return;
  }
  const { value } = e.target.dataset;
  this.parentElement.parentElement.parentElement.parentElement.dataset.currentYear = value;

  const pickerTimes = deepClone(pen.pickerTimes);
  updateTags(pickerTimes, value, pen);
  window.meta2d.setValue({
    id: penId,
    pickerTimes,
  })
  adjustHeight(pen);
  // 更新body
  updateBody(this.parentElement.parentElement.parentElement.parentElement, penId);
}
function tdMonthClick(e) {
  e.stopPropagation();
  const { mode, currentMonth, currentYear } = this.parentElement.parentElement.parentElement.parentElement.dataset;
  let _currentMonth = parseInt(currentMonth);
  let _currentYear = parseInt(currentYear);
  const { value } = e.target.dataset;
  const penId = this.parentElement.dataset.penId
  const pen = window.meta2d.findOne(penId);
  if (!pen) {
    return;
  }

  this.parentElement.parentElement.parentElement.parentElement.dataset.currentMonth = value.split('-')[1];
  const pickerTimes = deepClone(pen.pickerTimes);
  updateTags(pickerTimes, value, pen);
  window.meta2d.setValue({
    id: penId,
    pickerTimes,
  })
  adjustHeight(pen);

  // 更新body
  updateBody(this.parentElement.parentElement.parentElement.parentElement, penId);
}
/**
 * @description 生成日期选择器的tbody的tr列表
 * @author Joseph Ho
 * @date 02/11/2024
 * @param {*} pen
 * @param {{ year: number, month: number }} opt
 * @returns {*}  
 */
function assembleDateBodyTRs(pen, opt: { year: number, month: number }) {
  const daylist = getTimeListByYearAndMonth(opt.year, opt.month);
  const frag = document.createDocumentFragment();
  for (let i = 0; i < daylist.length; i++) {
    const item = daylist[i];
    const tr = document.createElement('tr');
    tr.dataset.penId = pen.id;
    tr.className = 'l-date-picker__table-date-row';

    for (let k = 0; k < item.children.length; k++) {
      const child = item.children[k];
      const td = document.createElement('td');
      td.className = 'l-date-picker__cell';
      td.dataset.value = child.label;
      td.dataset.rowIndex = i + '';
      td.dataset.colIndex = k + '';
      td.dataset.type = child.type;
      if (child.type === MonthType.CURRENT && pen.pickerTimes.findIndex((el) => el.startsWith(child.date)) > -1) {
        td.classList.add('l-date-picker__cell--active');
      }
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
  const { mode, currentMonth, currentYear } = this.parentElement.parentElement.parentElement.parentElement.dataset;
  const _mode = parseInt(mode);
  let _currentMonth = parseInt(currentMonth);
  let _currentYear = parseInt(currentYear);
  let flag = -1;// -1: 不需要更新，1: 需要更新月份，2: 需要更新年份和月份 
  if (this.dataset.type === MonthType.PREV) {
    if (_currentMonth > 1) {
      _currentMonth--;
      flag = 1;
    } else if (_currentMonth === 1) {
      _currentMonth = 12;
      _currentYear--;
      flag = 2;
    }
  } else if (this.dataset.type === MonthType.NEXT) {
    if (_currentMonth < 12) {
      _currentMonth++;
      flag = 1;
    } else if (_currentMonth === 12) {
      _currentMonth = 1;
      _currentYear++;
      flag = 2;
    }
  }
  const penId = this.parentElement.dataset.penId
  const pen = window.meta2d.findOne(penId);
  if (!pen) {
    return;
  }
  // if (!pen.multiple) {
  //   // 清除上一个选中的
  //   const { rowIndex, colIndex } = this.parentElement.parentElement.dataset;
  //   if (rowIndex && colIndex) {
  //     const _rowIndex = parseInt(rowIndex);
  //     const _colIndex = parseInt(colIndex);
  //     if (_rowIndex > -1 && _colIndex > -1) {
  //       this.parentElement.parentElement.children[_rowIndex].children[_colIndex].classList.remove('l-date-picker__cell--active');
  //     }
  //   }
  // } else {

  // }


  // const { mode, currentMonth, currentYear } = this.parentElement.parentElement.parentElement.parentElement.dataset;
  const { value } = e.target.dataset;
  const pickerTimes = deepClone(pen.pickerTimes);
  let yyhhdd = '';
  if (!pen.enableTimePicker) {
    yyhhdd = dayjs().year(_currentYear).month(_currentMonth - 1).date(value).format("YYYY-MM-DD");
  } else {
    const { hour, minute, second } = this.parentElement.parentElement.parentElement.parentElement.nextElementSibling.dataset;
    yyhhdd = dayjs().year(_currentYear).month(_currentMonth - 1).date(value).hour(hour).minute(minute).second(second).format("YYYY-MM-DD HH:mm:ss");
  }
  updateTags(pickerTimes, yyhhdd, pen);
  window.meta2d.setValue({
    id: penId,
    pickerTimes,
  })
  adjustHeight(pen);

  // 更新footer
  if (pen.enableTimePicker) {
    const button = this.parentElement.parentElement.parentElement.parentElement.parentElement.nextElementSibling.lastChild;
    if (button.classList.contains('l-is-disabled')) {
      button.classList.remove('l-is-disabled');
    }
  }
  // this.parentElement.parentElement.dataset.lastdate = yyhhdd;
  this.parentElement.parentElement.dataset.rowIndex = this.dataset.rowIndex;
  this.parentElement.parentElement.dataset.colIndex = this.dataset.colIndex;

  // 最后去更新header和body
  const { index } = this.parentElement.parentElement.dataset;
  const dropMenu = document.querySelector(`.${DROPMENU_PREFIX}${penId}`);
  const list = dropMenu.querySelectorAll('.l-date-picker__panel-date');
  const _index = parseInt(index);
  // 如果不是当前月份的日期，更新月份，
  if (flag === 1) {
    list[_index].dataset.currentMonth = _currentMonth;
    // 更新header
    updateHeader(list[_index], DateSelectType.MONTH + '', _currentMonth + '');
  } else if (flag === 2) {
    list[_index].dataset.currentMonth = _currentMonth;
    list[_index].dataset.currentYear = _currentYear;
    // 更新header
    updateHeader(list[_index], DateSelectType.MONTH + '', _currentMonth + '');
    updateHeader(list[_index], DateSelectType.YEAR + '', _currentYear + '');
  }
  list[_index].dataset.currentDay = value;
  // 更新body
  updateBody(list[_index], penId);



  // this.parentElement.parentElement.children[this.dataset.rowIndex].children[this.dataset.colIndex].classList.add('l-date-picker__cell--active');
  // if (this.dataset.type === MonthType.PREV) {
  //   if (_mode === SwitchMode.MONTH) {
  //     if (_currentMonth >= 1 && _currentMonth < 12) {
  //       // _currentMonth--;
  //       list[_index].dataset.currentMonth = _currentMonth;
  //       // 更新header
  //       updateHeader(list[_index], DateSelectType.MONTH + '', _currentMonth + '');
  //     } else if (_currentMonth === 12) {
  //       // _currentMonth = 12;
  //       // _currentYear--;
  //       list[_index].dataset.currentMonth = _currentMonth;
  //       list[_index].dataset.currentYear = _currentYear;
  //       // 更新header
  //       updateHeader(list[_index], DateSelectType.MONTH + '', _currentMonth + '');
  //       updateHeader(list[_index], DateSelectType.YEAR + '', _currentYear + '');
  //     }
  //     // 更新body
  //     updateBody(list[_index], penId);
  //   }
  // } else if (this.dataset.type === MonthType.NEXT) {
  //   if (currentMonth > 1 && _currentMonth <= 12) {
  //     // _currentMonth++;
  //     list[_index].dataset.currentMonth = _currentMonth;
  //     // 更新header
  //     updateHeader(list[_index], DateSelectType.MONTH + '', _currentMonth + '');
  //   } else if (_currentMonth === 1) {
  //     // _currentMonth = 1;
  //     // _currentYear++;
  //     list[_index].dataset.currentMonth = _currentMonth;
  //     list[_index].dataset.currentYear = _currentYear;
  //     // 更新header
  //     updateHeader(list[_index], DateSelectType.MONTH + '', _currentMonth + '');
  //     updateHeader(list[_index], DateSelectType.YEAR + '', _currentYear + '');
  //   }
  //   // 更新body
  //   updateBody(list[_index], penId);
  // }
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
/**
 * @description 根据不同的type生成不同的table的thead的tr列表
 * @author Joseph Ho
 * @date 04/11/2024
 * @param {*} type
 * @returns {*}  
 */
function assembleTR(type) {
  const tr = document.createElement('tr');
  let list = [];
  if (type === SwitchMode.DATE) {
    list = weekDate;
  } else {
    list = weekWeek;
  }
  for (let i = 0; i < list.length; i++) {
    const day = list[i];
    const th = document.createElement('th');
    th.innerHTML = day;
    tr.appendChild(th);
  }
  if (type === SwitchMode.WEEK) {
    const th = document.createElement('th');
    th.ariaLabel = "empty-cell";
    tr.insertBefore(th, tr.firstChild);
  }
  return tr;
}
/**
 * @description 根据不同的类型组装header
 * @author Joseph Ho
 * @date 02/11/2024
 * @param {*} data
 * @param {*} pen
 * @param {*} opt
 * @param {*} type
 * @returns {*}  
 */
function assembleHeader(data, pen, opt, type) {
  const frag = document.createDocumentFragment();
  const controller = document.createElement('div');
  controller.className = 'l-date-picker__header-controller';
  const month = document.createElement('div');
  month.className = 'l-select__wrap l-date-picker__header-controller-month';

  if (type === SwitchMode.DATE) {
    // 组装日期选择的select
    const monthSelect = assembleSelect({
      type: DateSelectType.MONTH,
      selectVal: opt.month,
      index: opt.index,
      penId: pen.id,
      mode: SwitchMode.DATE
    }, monthOptions);
    month.appendChild(monthSelect);
    controller.appendChild(month);

    const year = document.createElement('div');
    year.className = 'l-select__wrap l-date-picker__header-controller-year';
    const yearSelect = assembleSelect({
      type: DateSelectType.YEAR,
      selectVal: opt.year,
      index: opt.index,
      penId: pen.id,
      mode: SwitchMode.DATE
    }, yearOptions);
    year.appendChild(yearSelect);
    controller.appendChild(year);
  } else if (type === SwitchMode.MONTH) {
    // 组装月份选择的select
    const year = document.createElement('div');
    year.className = 'l-select__wrap l-date-picker__header-controller-year';
    const yearSelect = assembleSelect({
      type: DateSelectType.YEAR,
      selectVal: opt.year,
      index: opt.index,
      penId: pen.id,
      mode: SwitchMode.MONTH
    }, yearOptions);
    year.appendChild(yearSelect);
    controller.appendChild(year);
  } else if (type === SwitchMode.WEEK) {
    // 组装日期选择的select
    const monthSelect = assembleSelect({
      type: DateSelectType.MONTH,
      selectVal: opt.month,
      index: opt.index,
      penId: pen.id,
      mode: SwitchMode.WEEK
    }, monthOptions);
    month.appendChild(monthSelect);
    controller.appendChild(month);

    const year = document.createElement('div');
    year.className = 'l-select__wrap l-date-picker__header-controller-year';
    const yearSelect = assembleSelect({
      type: DateSelectType.YEAR,
      selectVal: opt.year,
      index: opt.index,
      penId: pen.id,
      mode: SwitchMode.WEEK
    }, yearOptions);
    year.appendChild(yearSelect);
    controller.appendChild(year);
  } else if (type === SwitchMode.YEAR) {
    const year = document.createElement('div');
    year.className = 'l-select__wrap l-date-picker__header-controller-year';
    // 调用函数，生成从1920年起，前后各100年的年份选项，每10年一个选项
    const yearSelect = assembleSelect({
      type: DateSelectType.YEAR_RANGE,
      selectVal: opt.year,
      index: opt.index,
      penId: pen.id,
      mode: SwitchMode.YEAR
    }, yeartoYearOptions);
    year.appendChild(yearSelect);
    controller.appendChild(year);
  }
  frag.appendChild(controller);

  const pagination = document.createElement('div');
  pagination.className = 'l-pagination-mini';
  const pageFrag = assemblePagination({
    index: opt.index,
    penId: pen.id,
    type,
  });
  pagination.appendChild(pageFrag);

  frag.appendChild(pagination);
  return frag;
}
function getYeartoYearOptions(baseYear, range, step = 10) {
  // 定义一个函数来生成年份选项
  const options = [];
  // 计算起始年份
  const startYear = baseYear - range;
  // 计算结束年份
  const endYear = baseYear + range;

  for (let year = startYear; year <= endYear; year += step) {
    const obj = {
      label: year + ' - ' + (year + step - 1),
      value: [year, (year + step - 1)]
    }
    options.push(obj);
  }

  return options;
}
function selectClick(e) {
  e.stopPropagation();
  this.lastChild.firstChild.style.display = this.lastChild.firstChild.style.display === 'none' ? 'block' : 'none';
}
function assembleSelect(opt: { type, selectVal, index, penId, mode }, options) {
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
    li.dataset.mode = opt.mode;

    const span = document.createElement('span');
    span.innerHTML = item.label;
    span.dataset.value = item.value;
    span.dataset.type = opt.type;
    span.dataset.index = opt.index;
    span.dataset.penId = opt.penId;
    span.dataset.mode = opt.mode;

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
  const { type, index, penId, value, mode } = e.target.dataset;
  const dropMenu = document.querySelector(`.${DROPMENU_PREFIX}${penId}`);
  const _type = parseInt(type);
  const _index = parseInt(index);
  let selector = ''
  if (mode === SwitchMode.DATE) {
    selector = '.l-date-picker__panel-date';
  } else if (mode === SwitchMode.MONTH) {
    selector = '.l-date-picker__panel-month';
  } else if (mode === SwitchMode.WEEK) {
    selector = '.l-date-picker__panel-week';
  } else if (mode === SwitchMode.YEAR) {
    selector = '.l-date-picker__panel-year';
  }
  const list = dropMenu.querySelectorAll(selector);
  // 更新content的数据，存储下来
  if (_type === DateSelectType.MONTH) {
    list[_index].dataset.currentMonth = value;
  } else if (_type === DateSelectType.YEAR) {
    list[_index].dataset.currentYear = value;
  } else if (_type === DateSelectType.YEAR_RANGE) {
    list[_index].dataset.yearRange = value;
    list[_index].dataset.currentYear = value.split(',')[0];
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
  const year = parseInt(dom.dataset.currentYear);
  const month = parseInt(dom.dataset.currentMonth);
  const tbody = dom.querySelector('tbody');
  const pen = window.meta2d.findOne(penId);
  let trs = null
  if (pen.mode === SwitchMode.DATE) {
    trs = assembleDateBodyTRs(pen, { year, month });
  } else if (pen.mode === SwitchMode.MONTH) {
    trs = assembleMonthBodyTRs(pen, { year, month });
  } else if (pen.mode === SwitchMode.WEEK) {
    trs = assembleWeekBodyTRs(pen, { year, month });
  } else if (pen.mode === SwitchMode.YEAR) {
    trs = assembleYearBodyTRs(pen, { year });
  }
  tbody.replaceChildren(trs);
}
function assemblePagination(opt) {
  const frag = document.createDocumentFragment();
  for (let i = 0; i < pagiCtls.length; i++) {
    const item = pagiCtls[i];
    const btn = document.createElement('button');
    btn.className = 'l-button';
    btn.title = item.label;
    btn.dataset.key = item.key;
    btn.dataset.index = opt.index;
    btn.dataset.penId = opt.penId;
    btn.dataset.type = opt.type;
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
  const { key, index, penId, type } = this.dataset;
  if (type === SwitchMode.DATE) {
    const dropMenu = document.querySelector(`.${DROPMENU_PREFIX}${penId}`);
    const list = dropMenu.querySelectorAll('.l-date-picker__panel-date');
    const _index = parseInt(index);
    const { mode, currentMonth, currentYear } = list[_index].dataset;
    let _currentMonth = parseInt(currentMonth);
    let _currentYear = parseInt(currentYear);
    if (key === CTL_TYPE.PREV) {
      // ?? 这里是否需要判断当前的mode
      if (mode === SwitchMode.DATE) {
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
    } else if (key === CTL_TYPE.NEXT) {
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

    } else if (key === CTL_TYPE.CURRENT) {
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
  } else if (type === SwitchMode.WEEK) {
    const { currentMonth, currentYear, mode, index } = this.parentElement.parentElement.parentElement.dataset
    let _currentMonth = parseInt(currentMonth);
    let _currentYear = parseInt(currentYear);
    if (key === CTL_TYPE.PREV) {
      if (_currentMonth > 1) {
        _currentMonth--;
        this.parentElement.parentElement.parentElement.dataset.currentMonth = _currentMonth;
        // 更新header
        updateHeader(this.parentElement.parentElement.parentElement, DateSelectType.MONTH + '', _currentMonth + '');
      } else if (_currentMonth === 1) {
        _currentMonth = 12;
        _currentYear--;
        this.parentElement.parentElement.parentElement.dataset.currentMonth = _currentMonth;
        this.parentElement.parentElement.parentElement.dataset.currentYear = _currentYear;
        // 更新header
        updateHeader(this.parentElement.parentElement.parentElement, DateSelectType.MONTH + '', _currentMonth + '');
        updateHeader(this.parentElement.parentElement.parentElement, DateSelectType.YEAR + '', _currentYear + '');
      }
      // 更新body
      updateBody(this.parentElement.parentElement.parentElement, penId);
    } else if (key === CTL_TYPE.NEXT) {
      if (_currentMonth < 12) {
        _currentMonth++;
        this.parentElement.parentElement.parentElement.dataset.currentMonth = _currentMonth;
        // 更新header
        updateHeader(this.parentElement.parentElement.parentElement, DateSelectType.MONTH + '', _currentMonth + '');
      } else if (_currentMonth === 12) {
        _currentMonth = 1;
        _currentYear++;
        this.parentElement.parentElement.parentElement.dataset.currentMonth = _currentMonth;
        this.parentElement.parentElement.parentElement.dataset.currentYear = _currentYear;
        // 更新header
        updateHeader(this.parentElement.parentElement.parentElement, DateSelectType.MONTH + '', _currentMonth + '');
        updateHeader(this.parentElement.parentElement.parentElement, DateSelectType.YEAR + '', _currentYear + '');
      }
      // 更新body
      updateBody(this.parentElement.parentElement.parentElement, penId);
    } else if (key === CTL_TYPE.CURRENT) {
      // 获取当前的年月
      const currentYear = dayjs().year();
      const currentMonth = dayjs().month() + 1;
      // 更新content的数据，存储下来
      this.parentElement.parentElement.parentElement.dataset.currentYear = currentYear;
      this.parentElement.parentElement.parentElement.dataset.currentMonth = currentMonth;
      // 更新header
      updateHeader(this.parentElement.parentElement.parentElement, DateSelectType.YEAR + '', currentYear);
      updateHeader(this.parentElement.parentElement.parentElement, DateSelectType.MONTH + '', currentMonth);

      // 更新body
      updateBody(this.parentElement.parentElement.parentElement, penId);
    }
  } else if (type === SwitchMode.MONTH) {
    const { currentMonth, currentYear, mode, index } = this.parentElement.parentElement.parentElement.dataset
    let _currentYear = parseInt(currentYear);
    if (key === CTL_TYPE.PREV) {
      _currentYear--;
      this.parentElement.parentElement.parentElement.dataset.currentYear = _currentYear;
      updateHeader(this.parentElement.parentElement.parentElement,
        DateSelectType.YEAR + '', _currentYear);
    } else if (key === CTL_TYPE.NEXT) {
      _currentYear++;
      this.parentElement.parentElement.parentElement.dataset.currentYear = _currentYear;
      updateHeader(this.parentElement.parentElement.parentElement,
        DateSelectType.YEAR + '', _currentYear);
    } else if (key === CTL_TYPE.CURRENT) {
      // 获取当前的年月
      const currentYear = dayjs().year();
      this.parentElement.parentElement.parentElement.dataset.currentYear = currentYear;
      updateHeader(this.parentElement.parentElement.parentElement,
        DateSelectType.YEAR + '', currentYear);
    }
    // 更新body
    updateBody(this.parentElement.parentElement.parentElement, penId);
  } else if (type === SwitchMode.YEAR) {
    const { currentMonth, currentYear, mode, index } = this.parentElement.parentElement.parentElement.dataset
    let _currentYear = parseInt(currentYear);
    if (key === CTL_TYPE.PREV) {
      _currentYear -= 10;
      this.parentElement.parentElement.parentElement.dataset.currentYear = _currentYear;
      updateHeader(this.parentElement.parentElement.parentElement,
        DateSelectType.YEAR + '', _currentYear);
    } else if (key === CTL_TYPE.NEXT) {
      _currentYear += 10;
      this.parentElement.parentElement.parentElement.dataset.currentYear = _currentYear;
      updateHeader(this.parentElement.parentElement.parentElement,
        DateSelectType.YEAR + '', _currentYear);
    } else if (key === CTL_TYPE.CURRENT) {
      // 获取当前的年月
      const currentYear = dayjs().year();
      this.parentElement.parentElement.parentElement.dataset.currentYear = currentYear;
      updateHeader(this.parentElement.parentElement.parentElement,
        DateSelectType.YEAR + '', currentYear);
    }
    // 更新body
    updateBody(this.parentElement.parentElement.parentElement, penId);
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
  for (let i = 0; i < pen.pickerTimes.length; i++) {
    const yyhhdd = pen.pickerTimes[i];
    const e = assembleTag(yyhhdd, yyhhdd, pen.id, pen.mode);
    frag.appendChild(e);
  }
  input_prefix.appendChild(frag);
  box.appendChild(input_prefix);

  box.appendChild(input);
  return box;
}
function updateTags(pickerTimes, value, pen) {
  if (pen.multiple) {
    // 多选
    const index = pickerTimes.findIndex(item => item === value);
    if (index > -1) {
      pickerTimes.splice(index, 1);
      // 移除tag
      const tagDom = document.getElementsByClassName(`${TAG_PREFIX}${value}`)[0];
      if (tagDom) {
        tagDom.remove();
      }
    } else {
      pickerTimes.push(value);

      const tagWrapper = document.getElementsByClassName(`${TAG_WRAPPER}${pen.id}`)[0];
      const tag = assembleTag(value, value, pen.id, pen.mode);
      tagWrapper.appendChild(tag);
    }
  } else {
    // 单选
    if (pickerTimes.length > 0) {
      pickerTimes.splice(0, 1, value);
    } else {
      pickerTimes.push(value);
    }

    const tagWrapper = document.getElementsByClassName(`${TAG_WRAPPER}${pen.id}`)[0];
    const tag = assembleTag(value, value, pen.id, pen.mode);
    tagWrapper.replaceChildren(tag);
  }

}
function assembleTag(key: string, title: string, penId: string, mode: SwitchMode) {
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
  span.innerHTML = title + (mode !== SwitchMode.WEEK ? '' : '周');
  tagDom.appendChild(span);

  const svgDom = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svgDom.setAttribute('viewBox', '0 0 24 24');
  svgDom.style.marginLeft = '8px';
  svgDom.dataset.key = key;
  svgDom.dataset.penId = penId;
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
function tagClose(e) {
  e.stopPropagation();
  e.cancelBubble = true;

  // const tagDom = document.getElementsByClassName(`${e.target.dataset.key}`)[0];
  const { penId, key } = this.dataset;
  const pen = window.meta2d.findOne(penId);
  if (!pen) {
    return;
  }
  const pickerTimes = deepClone(pen.pickerTimes);
  const index = pickerTimes.indexOf(key);
  if (index > -1) {
    pickerTimes.splice(index, 1);
  }
  window.meta2d.setValue({
    id: penId,
    pickerTimes,
  })
  this.parentElement.remove();

  const dropMenu = document.querySelector(`.${DROPMENU_PREFIX}${penId}`);
  let selector = ''
  if (pen.mode === SwitchMode.DATE) {
    selector = '.l-date-picker__panel-date';
  } else if (pen.mode === SwitchMode.MONTH) {
    selector = '.l-date-picker__panel-month';
  } else if (pen.mode === SwitchMode.WEEK) {
    selector = '.l-date-picker__panel-week';
  } else if (pen.mode === SwitchMode.YEAR) {
    selector = '.l-date-picker__panel-year';
  }
  const list = dropMenu.querySelector(selector);

  // 更新cascader的checked
  updateBody(list, penId);

  // 更新高度
  adjustHeight(pen);
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

const getTimeListByYearAndMonth = (year: number, month: number) => {
  // !清空选中日期
  // selectDate.value = null
  // 获取当前选中月份的1号
  let selectDay = `${year}-${month}-01`
  // const _month = parseInt(month);
  // 选中时间是周几
  const weekDay = dayjs(selectDay).day()
  // 日历组件的起始日期
  const firstDay = dayjs(selectDay).subtract(weekDay, 'day')
  const dayList = []
  for (let i = 0; i < 6; i++) {
    const childrenList = []
    for (let time = 0; time < 7; time++) {
      let day = dayjs(firstDay).add(i * 7 + time, "day")
      const date = day.format("YYYY-MM-DD")
      // active 代表是不是当前月的日期
      // isCurrent 代表是不是今天
      let type = MonthType.CURRENT;
      const deltaMonth = Number(day.format("M")) - month;
      if (deltaMonth === -1) {
        type = MonthType.PREV;
      } else if (deltaMonth === 1) {
        type = MonthType.NEXT;
      } else {
        if (deltaMonth < -1) {
          type = MonthType.NEXT;
        } else if (deltaMonth > 1) {
          type = MonthType.PREV;
        }
      }
      childrenList.push(
        {
          label: day.format("D"),
          date,
          type,
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

  return dayList
}
function generateStyle() {
  let style = document.createElement('style');
  style.type = 'text/css';
  document.head.appendChild(style);
  let sheet = style.sheet;
  sheet.insertRule(
    `.l-date-picker__panel-content,
    .l-date-range-picker__panel-content-wrapper {
        display: flex;
        // height:300px;
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

  sheet.insertRule(`
  .l-date-picker__panel-year .l-date-picker__cell-inner, 
  .l-date-picker__panel-month .l-date-picker__cell-inner, 
  .l-date-picker__panel-quarter .l-date-picker__cell-inner {
    width: 48px;
}
  `)

  sheet.insertRule(`
  .l-date-picker__panel-year .l-date-picker__table tbody tr,
  .l-date-picker__panel-month .l-date-picker__table tbody tr, 
  .l-date-picker__panel-quarter .l-date-picker__table tbody tr {
    display: flex;
    justify-content: space-between;
}
  `)

  sheet.insertRule(`
  .l-date-picker__table-week-row:hover:after {
    box-shadow: inset 0 0 0 1px #0052d9;
}
  `)
  sheet.insertRule(`
  .l-date-picker__table-week-row:hover 
  .l-date-picker__cell:first-child .l-date-picker__cell-inner {
    color: #0052d9;
}
  `)
  sheet.insertRule(`
  .l-date-picker__table td.l-date-picker__cell {
    text-align: center;
    font-weight: 500;
}
  `)
  sheet.insertRule(`
  .l-date-picker__table-week-row--active:after {
    opacity: 1;
    z-index: 0;
    background-color: #0052d9;
}
  `)

  sheet.insertRule(`
  .l-date-picker__table-week-row--active .l-date-picker__cell:first-child .l-date-picker__cell-inner {
    color: #0052d9;
  }
  `)
  sheet.insertRule(`
  .l-date-picker__table-week-row .l-date-picker__cell:first-child .l-date-picker__cell-inner {
    color: rgba(0,0,0,0.26);
}
  `)
  sheet.insertRule(`
  .l-date-picker__table-week-row {
    cursor: pointer;
    position: sticky;
}
  `)
  sheet.insertRule(`
  .l-date-picker__table-week-row:after {
    content: "";
    position: absolute;
    left: 32px;
    right: 0;
    top: calc(4px - 1px);
    z-index: 10;
    height: 24px;
    border-radius: 3px;
    transition: box-shadow .2s cubic-bezier(.38,0,.24,1), background-color .2s linear, border-color .2s linear, color .2s linear;
    pointer-events: none;
}
  `)
  sheet.insertRule(`
  .l-date-picker__table-week-row--active .l-date-picker__cell .l-date-picker__cell-inner {
    background: transparent;
    color: #fff;
}
  `)
  sheet.insertRule(`
  .l-date-picker__panel, .l-date-range-picker__panel {
    display: flex;
    flex-direction: column;
}
  `)
  sheet.insertRule(`
  .l-date-picker__footer--bottom {
    border-top: 1px solid #e7e7e7;
}
  `)
  sheet.insertRule(`
  .l-date-picker__footer {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    padding: 12px;
    gap: 8px;
}
  `)

  sheet.insertRule(`
  .l-button {
    // font: var(--td-font-body-medium);
    // color: var(--td-text-color-primary);
    box-sizing: border-box;
    margin: 0;
    padding: 0;
    list-style: none;
    position: relative;
    z-index: 0;
    overflow: hidden;
    // font-size: var(--td-font-body-medium);
    outline: none;
    border-width: 1px;
    border-style: solid;
    // border-color: transparent;
    // background-color: transparent;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    vertical-align: middle;
    white-space: nowrap;
    border-radius: 3px;
    transition: all .2s linear;
    touch-action: manipulation;
    text-decoration: none;
}
  `)
  sheet.insertRule(`
  .l-button.l-button--theme-primary {
    color: #fff;
    background-color: #0052d9;
    border-color: #0052d9;
    width: auto;
    height:24px;
    padding-left: 7px !important;
    padding-right: 7px !important;
}
  `)
  sheet.insertRule(`
  .l-button.l-button--theme-primary.l-is-disabled {
    cursor: not-allowed;
    background-color: #b5c7ff;
    border-color: #b5c7ff;
}
  `)
}

