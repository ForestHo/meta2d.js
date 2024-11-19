import { movingSuffix } from '../../../canvas';
import { Pen, setElemPosition } from '../../../pen';
import { Point, distance } from '../../../point';
import { rectInRect } from '../../../rect';
import { deepClone, debounce } from '../../../utils';
import '../datePicker/dayjs.min.js'
import '../datePicker/isoWeek.min.js'
import '../datePicker/weekOfYear.min.js'
import '../datePicker/isBetween.min.js'

import '../datePicker/isoWeeksInYear.min.js'
import '../datePicker/isLeapYear.min.js'

dayjs.extend(window.dayjs_plugin_isoWeek)
dayjs.extend(window.dayjs_plugin_weekOfYear)
dayjs.extend(window.dayjs_plugin_isBetween)

dayjs.extend(window.dayjs_plugin_isLeapYear)
dayjs.extend(window.dayjs_plugin_isoWeeksInYear)


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
enum HHMMSS {
  HOUR = 'hour',
  MINUTE = 'minute',
  SECOND = 'second'
}
enum TimeCount {
  HOUR = 24,
  MINUTE = 60,
  SECOND = 60
}
enum CTL_TYPE {
  PREV = 'prev',
  CURRENT = 'current',
  NEXT = 'next',
  CLOSE = 'close',
}
enum MonthType {
  PREV = 'prev-month',
  CURRENT = 'current-month',
  NEXT = 'next-month'
}
const PlaceHolder = {
  date: ['开始日期', '结束日期'],
  week: ['开始周', '结束周'],
  month: ['开始月份', '结束月份'],
  year: ['开始年份', '结束年份'],
  time: ['开始时间', '结束时间'],
}
const panelComp = {
  "date": ["date", "date"],
  "week": ["week", "week"],
  "month": ["month", "month"],
  "year": ["year", "year"],
  "time": ["date", "time"],
}
enum SwitchMode {
  DATE = "date",
  WEEK = "week",
  MONTH = "month",
  QUARTER = "quarter",
  YEAR = "year",
  TIME = "time"
}
enum More_Ctl {
  PREV = 'prev',
  NEXT = 'next',
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
// 生成最近一半年的数据
function getYearOptions(start, end, step = 1) {
  const options = [];
  for (let i = start; i <= end; i += step) {
    options.push({
      label: i + '',
      value: i + ''
    })
  }
  return options;
}
let yearOptions = getYearOptions(1900, 2200);
let yeartoYearOptions = [];
let monthOptions = [];
function getMonthOptions(monthOptions) {
  for (let i = 1; i <= 12; i++) {
    monthOptions.push({
      label: i + '',
      value: i + ''
    })
  }
}
getMonthOptions(monthOptions)
const svgMap = {
  [CTL_TYPE.PREV]: `M15.91 17.5l-5.5-5.5 5.5-5.5-1.41-1.41L7.59 12l6.91 6.91 1.41-1.41z`,
  [CTL_TYPE.CURRENT]: `M12 6a6 6 0 100 12 6 6 0 000-12zm-8 6a8 8 0 1116 0 8 8 0 01-16 0z`,
  [CTL_TYPE.NEXT]: `M8.09 17.5l5.5-5.5-5.5-5.5L9.5 5.09 16.41 12 9.5 18.91 8.09 17.5z`,
  [CTL_TYPE.CLOSE]: `M12 23a11 11 0 100-22 11 11 0 000 22zM8.82 7.4L12 10.6l3.18-3.19 1.42 1.42L13.4 12l3.19 3.18-1.42 1.42L12 13.4 8.82 16.6 7.4 15.18 10.6 12 7.4 8.82 8.82 7.4z`,
}
const weekDate = ['日', '一', '二', '三', '四', '五', '六'];
const weekWeek = ['一', '二', '三', '四', '五', '六', '日'];
export function dateRangePicker(pen: Pen): Path2D {
  if (!pen.onDestroy) {
    pen.onDestroy = onDestroy;
    pen.onMouseUp = onMouseUp;
    pen.onAdd = onAdd;
    pen.onResize = resize;
    pen.onMouseEnter = onMouseEnter;
    pen.onMouseLeave = onMouseLeave;
    pen.onRenderPenRaw = renderPenRaw;
    pen.onRenderPenRawRefresh = renderPenRawRefresh;
    pen.onClick = onClick;
  }
  const { x, y, width, height } = pen.calculative.worldRect;
  if (!pen.calculative.singleton) {
    pen.calculative.singleton = {};
  }
  if (!pen.mode) {
    pen.mode = SwitchMode.DATE;
  }
  if (!pen.focusIndex) {
    // focus的index
    pen.focusIndex = 0;
  }
  if (!pen.tempDate) {
    pen.tempDate = "";
  }
  if (!pen.rangeMode) {
    pen.rangeMode = "";
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
        if (pen.mode !== SwitchMode.TIME) {
          format = "YYYY-MM-DD"
        } else {
          format = "YYYY-MM-DD HH:mm:ss"
        }
        pickerTimes = pen.pickerTimes.map(item => dayjs(item).format(format));
      }
      const times = adjustPickertimes(pen.mode, pickerTimes);
      window.meta2d.setValue({
        id: pen.id,
        pickerTimes: times,
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
    div.id = pen.id;

    // 创建容器
    const container = document.createElement("div");
    container.style.position = 'relative';
    container.style.width = '100%';
    container.style.height = '100%';
    // 输入框
    const input = assembleRangeInputBox(pen);
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

    renderData(dropMenu, pen)

    if (pen.pickerTimes.length >= 1) {
      // console.log(pen.pickerTimes, 'pick done')
      // update input
      updateInput(dropMenu.previousElementSibling, pen.pickerTimes, pen);
    }
  }
  const path = new Path2D();
  return path;
}

function renderData(dom, pen) {
  generateStyle(pen)

  const lPanel = document.createElement('div');
  lPanel.className = 'l-date-range-picker__panel-content-wrapper';
  if (pen.mode === SwitchMode.TIME) {
    lPanel.classList.add('l-date-range-picker__panel--time');
  }else{
    lPanel.classList.remove('l-date-range-picker__panel--time');
  }
  const fragMent = generateDomByData(pen);
  lPanel.appendChild(fragMent);
  dom.appendChild(lPanel);
}
function generateDomByData(pen) {
  let key = SwitchMode.DATE;
  // 根据配置生成不同的面板
  if (pen.mode) {
    key = pen.mode;
  }
  const frag = document.createDocumentFragment();
  for (let i = 0; i < panelComp[key].length; i++) {
    // console.log(panelComp[key])
    const type = panelComp[key][i];
    let dateDom = null;
    if (type === SwitchMode.DATE) {
      dateDom = generateDateDom(pen, i)
      frag.appendChild(dateDom);
    } else if (type === SwitchMode.WEEK) {
      dateDom = generateWeekDom(pen, i)
      frag.appendChild(dateDom);
    } else if (type === SwitchMode.MONTH) {
      dateDom = generateMonthDom(pen, i)
      frag.appendChild(dateDom);
    } else if (type === SwitchMode.QUARTER) {
      dateDom = generateQuarterDom(pen, i)
      frag.appendChild(dateDom);
    } else if (type === SwitchMode.YEAR) {
      dateDom = generateYearDom(pen, i)
      frag.appendChild(dateDom);
    } else if (type === SwitchMode.TIME) {
      const timeDom = generateTimeDom(pen)
      frag.firstChild.appendChild(timeDom);
      const footer = generateFooter(pen);
      frag.appendChild(footer);
    }
  }
  return frag;
}
function generateFooter(pen) {
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
  const { penId } = this.dataset;
  // const content = this.parentElement.previousElementSibling
  // console.log(content)
  const pen = window.meta2d.findOne(penId);
  if (!pen) {
    return;
  }
  let focusIndex = pen.focusIndex;
  if (focusIndex === 0) {
    focusIndex = 1;
  } else if (focusIndex === 1) {
    focusIndex = 0;
  }
  window.meta2d.setValue({
    id: penId,
    focusIndex,
  })
  if (pen.pickerTimes.length === 1 || (pen.pickerTimes.length === 2 && !dayjs(pen.pickerTimes[0]).isValid())) {
    this.classList.add('l-is-disabled');
  }
  focusNextInput(penId, focusIndex);
  // resetDateTimePanel(penId);
  // updateTagsWithDate(penId, 0, '');
  // 隐藏下拉框
  if (pen.pickerTimes.length === 2 && pen.pickerTimes.every(el => dayjs(el).isValid())) {
    this.parentElement.parentElement.parentElement.style.display = 'none';
  }
}
/**
 * @description reset面板
 * @author Joseph Ho
 * @date 08/11/2024
 * @param {*} penId
 */
function resetDateTimePanel(penId) {

}
function generateWeekDom(pen, index) {
  const frag = document.createDocumentFragment();
  const currentYear = dayjs().year();
  let currentMonth = addMonth(dayjs().month(), 1);
  const content = document.createElement('div');
  content.className = 'l-date-picker__panel-content';

  const dateItem = assemleWeekItem(pen, {
    year: currentYear,
    month: (currentMonth + index),
    index
  });
  dateItem.className = 'l-date-picker__panel-week';
  dateItem.dataset.type = 'week';
  dateItem.dataset.index = index + '';
  dateItem.dataset.currentMonth = (currentMonth + index) + '';
  dateItem.dataset.currentYear = currentYear + '';
  dateItem.dataset.mode = SwitchMode.WEEK;
  // currentMonth++;

  content.appendChild(dateItem);

  frag.appendChild(content);
  return frag;
}
function assemleWeekItem(pen, opt) {
  const dateItem = document.createElement('div');
  const header = document.createElement('div');
  header.className = 'l-date-picker__header';
  const headerFrag = assembleHeader(pen, opt, SwitchMode.WEEK);
  header.appendChild(headerFrag);
  dateItem.appendChild(header);

  const tableItem = document.createElement('table');
  tableItem.className = 'l-date-picker__table';
  const tableFrag = assembleWeekTable(pen, opt);
  tableItem.appendChild(tableFrag);
  dateItem.appendChild(tableItem);

  return dateItem;
}
function assembleWeekTable(pen, opt) {
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
// function getWeekMonthOfYear(year: number, month: number, startWeek: number, endWeek: number) {
//   const weekList = [];
//   for (let i = startWeek; i <= endWeek; i++) {
//     // The first monday of the first week includes at least one day of the year
//     let firstMondayOfYear = dayjs().year(year).isoWeek(i).day(1);
//     // console.log("Monday 1:", firstMondayOfYear.format("YYYY-MM-DD"));

//     // Now make sure it really is the first monday of the year
//     if (firstMondayOfYear.year() !== year) {
//       firstMondayOfYear = firstMondayOfYear.add(7, "days");
//     }
//     // console.log("Monday 2:", firstMondayOfYear.format("YYYY-MM-DD"));

//     // return the week for that "real" first monday of the year
//     const list = new Array(7)
//       .fill(firstMondayOfYear)
//       .map((day, idx) => {
//         const _day = day.add(idx, "day");
//         const _month = Number(_day.format("M"));
//         const _year = _day.year();
//         const date = _day.format("YYYY-MM-DD");
//         const week = _day.isoWeek();
//         const value = `${_year}-${week}`;
//         console.log(_year, week, value)

//         let type = MonthType.CURRENT;
//         const deltaMonth = _month - month;
//         if (deltaMonth === -1) {
//           type = MonthType.PREV;
//         } else if (deltaMonth === 1) {
//           type = MonthType.NEXT;
//         } else {
//           if (deltaMonth < -1) {
//             type = MonthType.NEXT;
//           } else if (deltaMonth > 1) {
//             type = MonthType.PREV;
//           }
//         }
//         return {
//           label: _day.format("D"),
//           date: date,
//           week,
//           value,
//           type,
//           active: _month == month,
//           isCurrent: date === dayjs().format("YYYY-MM-DD")
//         }
//       });
//     weekList.push(list);
//   }
//   return weekList;
// }
const getChunks = (array, chunkSize) => {
  return array.reduce((resultArray, item, index) => {
    const chunkIndex = Math.floor(index / chunkSize);

    if (!resultArray[chunkIndex]) {
      resultArray[chunkIndex] = [];
    }

    resultArray[chunkIndex].push(item);

    return resultArray;
  }, []);
};
const getDaysOfMonth = (startOfMonth, endOfMonth) => {
  let results = [];
  let current = startOfMonth;

  while (
    current.isSame(endOfMonth, "day") ||
    current.isBefore(endOfMonth, "day")
  ) {
    results.push(current);
    current = current.add(1, "day");
  }
  return results;
};
function getWeekMonthOfYear(year: number, month: number) {
  const startOfMonth = dayjs().year(year).month(month - 1).startOf("month").startOf("isoWeek");
  const endOfMonth = dayjs().year(year).month(month - 1).endOf("month").endOf("isoWeek");
  const results = getChunks(getDaysOfMonth(startOfMonth, endOfMonth), 7)
  const weekList = results.map(el => {
    return el.map(day => {
      const date = day.format("YYYY-MM-DD");
      let type = MonthType.CURRENT;
      const _month = day.month();
      const deltaMonth = _month - month;
      const week = day.isoWeek();

      const isoYear = day.isoWeekYear();
      const value = `${isoYear}-${week}`;
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
        label: day.format("D"),
        date: date,
        week,
        type,
        value,
        active: day.month() == month - 1,
        isCurrent: dayjs().isSame(day, "day")
      }
    })
  })
  return weekList;
}
function trWeekClick(e) {
  const { mode, currentMonth, currentYear } = this.parentElement.parentElement.parentElement.dataset;
  // l-date-picker__table-week-row--active

  const _mode = parseInt(mode);
  let _currentMonth = parseInt(currentMonth);
  let _currentYear = parseInt(currentYear);

  // 这里还是需要计算一些边界情况，修改月和年的数据

  const { penId, week, value } = this.dataset;
  const pen = window.meta2d.findOne(penId);
  if ((pen.pickerTimes.length >= 1 && judgeWeekIsBefore(value, pen.pickerTimes[0]))
    || (pen.pickerTimes.length === 2 && judgeWeekIsAfter(value, pen.pickerTimes[1]))) {
    return;
  }
  if (!pen) {
    return;
  }

  // console.log(week, value)
  const pickerTimes = deepClone(pen.pickerTimes);
  const len = pickerTimes.length;
  let focusIndex = pen.focusIndex;
  if (focusIndex === 0) {
    if (len === 0) {
      pickerTimes.push(value);
    } else if (len >= 1) {
      pickerTimes.splice(0, 1, value);
    }
    // focus下一个
    focusIndex = 1;
    // focus下一个input
    focusNextInput(penId, focusIndex);
  } else if (focusIndex === 1) {
    if (len === 0) {
      pickerTimes.push(...["", value]);
    } else if (len === 1) {
      pickerTimes.push(value);
    } else if (len >= 2) {
      pickerTimes.splice(1, 1, value);
    }
    // focus下一个
    focusIndex = 0;
  }
  const times = adjustPickertimes(pen.mode, pickerTimes);
  window.meta2d.setValue({
    id: penId,
    pickerTimes: times,
    focusIndex,
  })


  const dropMenu = document.querySelector(`.${DROPMENU_PREFIX}${penId}`);
  let selector = '.l-date-picker__panel-week'
  // if (pen.mode === SwitchMode.DATE) {
  //   selector = '.l-date-picker__panel-date';
  // } else if (pen.mode === SwitchMode.MONTH) {
  //   selector = '.l-date-picker__panel-month';
  // } else if (pen.mode === SwitchMode.WEEK) {
  //   selector = '.l-date-picker__panel-week';
  // } else if (pen.mode === SwitchMode.YEAR) {
  //   selector = '.l-date-picker__panel-year';
  // }
  const list = dropMenu.querySelectorAll(selector);
  updateBody(list[0], penId);
  updateBody(list[1], penId);


  //update input
  if (pickerTimes.length >= 1) {
    // console.log(pickerTimes, 'pick done')
    // update input
    updateInput(dropMenu.previousElementSibling, pickerTimes, pen);
  }

  // console.log(pen)
  // const { value } = e.target.dataset;
  // const pickerTimes = deepClone(pen.pickerTimes);
  // const yyhhdd = `${_currentYear}-${week}`;
  // updateTags(pickerTimes, yyhhdd, pen);
  // window.meta2d.setValue({
  //   id: penId,
  //   pickerTimes,
  // })
  // adjustHeight(pen);

  // 还是需要更新月份和年份

  // 更新body
  // updateBody(this.parentElement.parentElement.parentElement, penId);
}
function isValidYearWeek(str) {
  const regex = /^\d{4}-\d{1,2}$/;
  return regex.test(str);
}
function judgeWeekIsBefore(yyww, yyww2) {
  const [year, week] = yyww.split('-');
  const [year2, week2] = yyww2.split('-');
  const _year = parseInt(year);
  const _week = parseInt(week);
  const _year2 = parseInt(year2);
  const _week2 = parseInt(week2);
  if (_year < _year2) {
    return true;
  }
  if (_year === _year2 && _week < _week2) {
    return true;
  }
  return false;
}
function judgeWeekIsAfter(yyww, yyww2) {
  const [year, week] = yyww.split('-');
  const [year2, week2] = yyww2.split('-');
  const _year = parseInt(year);
  const _week = parseInt(week);
  const _year2 = parseInt(year2);
  const _week2 = parseInt(week2);
  if (_year > _year2) {
    return true;
  }
  if (_year === _year2 && _week > _week2) {
    return true;
  }
  return false;
}
function judgeWeekIsBetween(yyww, yyww1, yyww2) {
  return !judgeWeekIsBefore(yyww, yyww1) && !judgeWeekIsAfter(yyww, yyww2);
}
function assembleWeekBodyTRs(pen, opt: { year: number, month: number }) {
  // const startWeek = dayjs().year(opt.year).month(opt.month - 1).startOf('month').week();
  // const endWeek = dayjs().year(opt.year).month(opt.month - 1).endOf('month').week();
  // const endWeek = startWeek + 5;
  const weeklist = getWeekMonthOfYear(opt.year, opt.month);
  // console.log(weeklist)
  const frag = document.createDocumentFragment();
  for (let i = 0; i < weeklist.length; i++) {
    const everyWeek = weeklist[i];
    const tr = document.createElement('tr');
    tr.dataset.penId = pen.id;
    tr.dataset.week = everyWeek[0].week + '';
    tr.dataset.value = everyWeek[0].value;
    tr.className = 'l-date-picker__table-week-row';
    const yyww = everyWeek[0].value;

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

    const index = pen.pickerTimes.findIndex((el) => el.startsWith(everyWeek[0].value));
    // console.log('index', index)
    if (pen.pickerTimes.length === 2) {
      // 并且起始日期不为空，是存在的
      if (pen.pickerTimes[0]) {
        // const isBetween = dayjs(item.value).isBetween(dayjs(pen.pickerTimes[0]), dayjs(pen.pickerTimes[1]), null, '[]')
        const isBetween = judgeWeekIsBetween(yyww, pen.pickerTimes[0], pen.pickerTimes[1]);
        // console.log(isBetween, yyww, 'isBetween')
        if (isBetween) {
          tr.classList.add('l-date-picker__table-week-row--range');
        }
        // 选定区间，不在区间内的日期不可选
        // const isBefore = dayjs(item.value).isBefore(dayjs(pen.pickerTimes[0]), 'month');
        const isBefore = judgeWeekIsBefore(yyww, pen.pickerTimes[0]);
        if (isBefore) {
          for (let i = 0; i < tr.children.length; i++) {
            tr.children[i].classList.add('l-date-picker__cell--disabled', 'kk');
          }
        }
        // const isAfter = dayjs(item.value).isAfter(dayjs(pen.pickerTimes[1]), 'month');
        const isAfter = judgeWeekIsAfter(yyww, pen.pickerTimes[1]);
        if (isAfter) {
          for (let i = 0; i < tr.children.length; i++) {
            tr.children[i].classList.add('l-date-picker__cell--disabled', 'dd');
          }
        }
      } else {
        // 选定结束日期，大于结束日期的日期不可选
        // const isAfter = dayjs(item.value).isAfter(dayjs(pen.pickerTimes[1]), 'month');
        const isAfter = judgeWeekIsAfter(yyww, pen.pickerTimes[1]);
        if (isAfter) {
          for (let i = 0; i < tr.children.length; i++) {
            tr.children[i].classList.add('l-date-picker__cell--disabled', 'tt');
          }
        }
      }
    } else if (pen.pickerTimes.length === 1) {
      // if (index === 0) {
      //   tr.classList.add('l-date-picker__cell--active-start', 'l-date-picker__table-week-row--active');
      // }
      // 选定开始日期，小于开始日期的日期不可选
      // const isBefore = dayjs(item.value).isBefore(dayjs(pen.pickerTimes[0]), 'month');
      // console.log(yyww, pen.pickerTimes[0], 'yyww')
      const isBefore = judgeWeekIsBefore(yyww, pen.pickerTimes[0]);
      if (isBefore) {
        for (let i = 0; i < tr.children.length; i++) {
          tr.children[i].classList.add('l-date-picker__cell--disabled', 'cc');
        }
      }
    }
    // if (index === 0) {
    //   tr.classList.add('l-date-picker__cell--active-start', 'l-date-picker__table-week-row--active');
    // } else if (index === 1) {
    //   tr.classList.add('l-date-picker__cell--active-end', 'l-date-picker__table-week-row--active');
    // }
    frag.appendChild(tr);
  }

  return frag;
}
function getYearByAddMonth(year: number, month: number, num: number) {
  return dayjs()
    .year(year)
    .month(month - 1)
    .add(num, 'month')
    .year()
}
function generateMonthDom(pen, index) {
  const frag = document.createDocumentFragment();
  const currentYear = dayjs().year();
  let currentMonth = dayjs().month() + 1;
  const content = document.createElement('div');
  content.className = 'l-date-picker__panel-content';

  const _year = addYear(currentYear, index);
  const dateItem = assemleMonthItem(pen, {
    year: _year,
    month: currentMonth,
    index
  });
  dateItem.className = 'l-date-picker__panel-month';
  dateItem.dataset.type = 'month';
  dateItem.dataset.index = index + '';
  dateItem.dataset.currentMonth = currentMonth + '';
  dateItem.dataset.currentYear = _year + '';
  dateItem.dataset.mode = SwitchMode.MONTH;

  content.appendChild(dateItem);

  frag.appendChild(content);
  return frag;
}
function generateQuarterDom(pen, index) {
  const frag = document.createDocumentFragment();
  return frag;
}
function generateYearDom(pen, index) {
  const frag = document.createDocumentFragment();
  let currentYear = dayjs().year() + (index === 0 ? 0 : 10);
  const content = document.createElement('div');
  content.className = 'l-date-picker__panel-content';

  //生成年份选项数据
  let curYear = currentYear;
  if (curYear % 10 !== 0) {
    curYear = curYear - curYear % 10;
  }
  if(yeartoYearOptions.length === 0){
    yeartoYearOptions = getYeartoYearOptions(curYear - 80, curYear + 70, 10);
  }
  // console.log(yeartoYearOptions)
  const yOpt = yeartoYearOptions.find(el => currentYear >= el.value[0] && currentYear <= el.value[1]);
  // console.log(currentYear, curYear, yOpt)
  const dateItem = assemleYearItem(pen, {
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
function generateTimeDom(pen) {
  const frag = document.createDocumentFragment();
  const timeItem = assembleTimeItem(pen);
  frag.appendChild(timeItem);
  return frag;
}
function generateDateDom(pen, index?) {
  const frag = document.createDocumentFragment();
  let currentYear, currentMonth, currentDay;
  if (pen.pickerTimes.length === 0) {
    currentYear = dayjs().year();
    currentMonth = addMonth(dayjs().month(), 1);
  } else {
    const date = dayjs(pen.pickerTimes[0]);
    currentYear = date.year();
    currentMonth = addMonth(date.month(), 1);
    currentDay = date.date();
  }

  const content = document.createElement('div');
  content.className = 'l-date-picker__panel-content';

  const _month = addMonth(currentMonth, index);
  const dateItem = assemleDateItem(pen, {
    year: currentYear,
    month: _month,
    index
  });
  dateItem.className = 'l-date-picker__panel-date';
  dateItem.dataset.type = 'date';
  dateItem.dataset.index = index + '';
  dateItem.dataset.currentMonth = _month + '';
  dateItem.dataset.currentYear = currentYear + '';
  dateItem.dataset.currentDay = currentDay + '';
  dateItem.dataset.mode = SwitchMode.DATE;
  // currentMonth++;

  content.appendChild(dateItem);

  frag.appendChild(content);
  return frag;
}
function addMonth(month: number, num: number) {
  return (
    dayjs()
      .month(month - 1)
      .add(num, 'month')
      .month() + 1
  );
}
function minusMonth(month: number, num: number) {
  return (
    dayjs()
      .month(month - 1)
      .subtract(num, 'month')
      .month() + 1
  );
}
function addYear(year: number, num: number) {
  return (
    dayjs()
      .year(year)
      .add(num, 'year')
      .year()
  );
}
function minusYear(year: number, num: number) {
  return (
    dayjs()
      .year(year)
      .subtract(num, 'year')
      .year()
  );
}
// 这个待定
function addWeek(year: number, week: number, num: number) {
  return (
    dayjs()
      .year(year)
      .isoWeek(week)
      .add(num, 'week')
      .isoWeek()
  );
}
function minusWeek(year: number, week: number, num: number) {
  return (
    dayjs()
      .year(year)
      .isoWeek(week)
      .subtract(num, 'week')
      .isoWeek()
  );
}
function assemleYearItem(pen, opt) {
  const dateItem = document.createElement('div');
  const header = document.createElement('div');
  header.className = 'l-date-picker__header';

  const headerFrag = assembleHeader(pen, opt, SwitchMode.YEAR);
  header.appendChild(headerFrag);
  dateItem.appendChild(header);

  const tableItem = document.createElement('table');
  tableItem.className = 'l-date-picker__table';
  const tableFrag = assembleYearTable(pen, opt);
  tableItem.appendChild(tableFrag);
  dateItem.appendChild(tableItem);
  return dateItem;
}
function generateDomByType(pen, type, i) {
  const frag = document.createDocumentFragment();
  const currentYear = dayjs().year();
  let currentMonth = dayjs().month() + 1;
  for (let i = 0; i < 2; i++) {
    const content = document.createElement('div');
    content.className = 'l-date-picker__panel-content';

    const dateItem = assemleDateItem(pen, {
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
    // currentMonth++;
    addMonth(currentMonth, 1);

    content.appendChild(dateItem);

    frag.appendChild(content);
  }
  return frag;
}
function onAdd(pen: Pen) {
  // adjustHeight(pen);
}
function assembleTimeItem(pen) {
  const timeItem = document.createElement('div');
  timeItem.className = 'l-date-picker__panel-time';
  let hour = "", minute = "", second = "";
  if (pen.mode === SwitchMode.TIME && pen.pickerTimes.length > 0) {
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
  hourDom.dataset.type = HHMMSS.HOUR;
  hourDom.className = 'l-time-picker__panel-body-scroll';
  hourDom.addEventListener('scroll', debounce((e) => hourScroll(e, pen.id), 200));
  hourDom.addEventListener('click', (e) => { hourClick(e, pen.id) });
  const hourFrag = assembleHour();
  const hIndex = parseInt(timeItem.dataset.hour);
  hourFrag.children[hIndex].classList.add('is-current');
  hourDom.appendChild(hourFrag);

  panelBody.appendChild(hourDom);

  const minuteDom = document.createElement('ul');
  minuteDom.dataset.type = HHMMSS.MINUTE;
  minuteDom.className = 'l-time-picker__panel-body-scroll';
  minuteDom.addEventListener('scroll', debounce((e) => minuteScroll(e, pen.id), 200));
  minuteDom.addEventListener('click', (e) => { minuteClick(e, pen.id) });
  const minuteFrag = assembleMinute();
  const mIndex = parseInt(timeItem.dataset.minute);
  minuteFrag.children[mIndex].classList.add('is-current');
  minuteDom.appendChild(minuteFrag);
  panelBody.appendChild(minuteDom);

  const secondDom = document.createElement('ul');
  secondDom.dataset.type = HHMMSS.SECOND;
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

  if (pen.mode === SwitchMode.TIME && pen.pickerTimes.length > 0) {
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
function adjustPickertimes(mode, times) {
  if (times.length === 2) {
    if (mode !== SwitchMode.WEEK) {
      if (dayjs(times[0]).isAfter(dayjs(times[1]))) {
        return [times[1], times[0]]
      }
      if (dayjs(times[0]).isSame(dayjs(times[1])) || dayjs(times[0]).isBefore(dayjs(times[1]))) {
        return times
      }
    } else {
      if (judgeWeekIsAfter(times[0], times[1])) {
        return [times[1], times[0]]
      }
      if (judgeWeekIsBefore(times[0], times[1]) || !judgeWeekIsBefore(times[0], times[1])) {
        return times
      }
    }
  } else {
    return times;
  }
  return [];
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
  // console.log(val, 'val')

  const pickerTimes = deepClone(pen.pickerTimes);
  pickerTimes.splice(pen.focusIndex, 1, val);
  const times = adjustPickertimes(pen.mode, pickerTimes);
  window.meta2d.setValue({
    id: penId,
    pickerTimes: times,
  })
  // const len = pickerTimes.length;
  // let focusIndex = pen.focusIndex;
  // if (focusIndex === 0) {
  //   if (len === 0) {
  //     pickerTimes.push(val);
  //   } else if (len >= 1) {
  //     pickerTimes.splice(0, 1, val);
  //   }
  //   // focus下一个
  //   focusIndex = 1;
  //   // focus下一个input
  //   focusNextInput(penId, focusIndex);
  // } else if (focusIndex === 1) {
  //   if (len === 0) {
  //     pickerTimes.push(...["", val]);
  //   } else if (len === 1) {
  //     pickerTimes.push(val);
  //   } else if (len >= 2) {
  //     pickerTimes.splice(1, 1, val);
  //   }
  //   // focus下一个
  //   focusIndex = 0;
  // }

  // const pickerTimes = deepClone(pen.pickerTimes);
  // updateTags(pickerTimes, val, pen);
  // window.meta2d.setValue({
  //   id: penId,
  //   pickerTimes,
  // })
  // adjustHeight(pen);

  // 更新footer
  // if (pen.enableTimePicker) {
  //   const button = panelTime.parentElement.nextElementSibling.lastChild;
  //   if (button.classList.contains('l-is-disabled')) {
  //     button.classList.remove('l-is-disabled');
  //   }
  // }

  // 更新body
  flag && updateBody(dateDom, penId);

  if (pickerTimes.length >= 1) {
    // console.log(pickerTimes, 'pick done')
    const dropMenu = document.querySelector(`.${DROPMENU_PREFIX}${penId}`);
    // update input
    updateInput(dropMenu.previousElementSibling, pickerTimes, pen);
  }
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
function assemleDateItem(pen, opt) {
  const dateItem = document.createElement('div');
  const header = document.createElement('div');
  header.className = 'l-date-picker__header';
  const headerFrag = assembleHeader(pen, opt, SwitchMode.DATE);
  header.appendChild(headerFrag);
  dateItem.appendChild(header);

  const tableItem = document.createElement('table');
  tableItem.className = 'l-date-picker__table';
  const tableFrag = assembleDateTable(pen, opt);
  tableItem.appendChild(tableFrag);
  dateItem.appendChild(tableItem);

  return dateItem;
}
function assemleMonthItem(pen, opt) {
  const dateItem = document.createElement('div');
  const header = document.createElement('div');
  header.className = 'l-date-picker__header';
  const headerFrag = assembleHeader(pen, opt, SwitchMode.MONTH);
  header.appendChild(headerFrag);
  dateItem.appendChild(header);

  const tableItem = document.createElement('table');
  tableItem.className = 'l-date-picker__table';
  const tableFrag = assembleMonthTable(pen, opt);
  tableItem.appendChild(tableFrag);
  dateItem.appendChild(tableItem);

  return dateItem;
}
function assembleDateTable(pen, opt) {
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
function assembleYearTable(pen, opt) {
  const frag = document.createDocumentFragment();

  // tbody
  const tbody = document.createElement('tbody');
  tbody.dataset.index = opt.index + '';
  const trs = assembleYearBodyTRs(pen, opt);
  tbody.appendChild(trs);
  frag.appendChild(tbody);
  return frag;
}
function assembleMonthTable(pen, opt) {
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
  const currentYear = dayjs().year()
  const list = [];
  for (let i = 1; i <= 12; i++) {
    let value = dayjs().year(year).month(i - 1).format('YYYY-MM');
    const month = {
      value,
      label: i,
      isCurrent: currentYear === year,
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
  console.log(yOpt,yeartoYearOptions,opt.year, 'yOpt')
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

      const index = pen.pickerTimes.findIndex((el) => el.startsWith(item.value));
      if (pen.pickerTimes.length === 2) {
        // 并且起始日期不为空，是存在的
        if (pen.pickerTimes[0]) {
          const startYear = parseInt(pen.pickerTimes[0]);
          const endYear = parseInt(pen.pickerTimes[1]);
          const isBetween = item.value >= startYear && item.value <= endYear;
          if (isBetween) {
            td.classList.add('l-date-picker__cell--highlight');
          }
          // 选定区间，不在区间内的日期不可选
          const isBefore = item.value < startYear;
          if (isBefore) {
            td.classList.add('l-date-picker__cell--disabled');
          }
          const isAfter = item.value > endYear;
          if (isAfter) {
            td.classList.add('l-date-picker__cell--disabled');
          }
        } else {
          const endYear = parseInt(pen.pickerTimes[1]);
          // 选定结束日期，大于结束日期的日期不可选
          const isAfter = item.value > endYear;
          if (isAfter) {
            td.classList.add('l-date-picker__cell--disabled');
          }
        }
      } else if (pen.pickerTimes.length === 1) {
        if (index === 0) {
          td.classList.add('l-date-picker__cell--active-start', 'l-date-picker__cell--active');
        }
        const startYear = parseInt(pen.pickerTimes[0]);
        // 选定开始日期，小于开始日期的日期不可选
        const isBefore = item.value < startYear;
        if (isBefore) {
          td.classList.add('l-date-picker__cell--disabled');
        }
      }
      if (index === 0) {
        td.classList.add('l-date-picker__cell--active-start', 'l-date-picker__cell--active');
      } else if (index === 1) {
        td.classList.add('l-date-picker__cell--active-end', 'l-date-picker__cell--active');
      }

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
      td.dataset.value = val + '';

      const index = pen.pickerTimes.findIndex((el) => el.startsWith(item.value));
      // console.log('index', index)
      if (pen.pickerTimes.length === 2) {
        // 并且起始日期不为空，是存在的
        if (pen.pickerTimes[0]) {
          const isBetween = dayjs(item.value).isBetween(dayjs(pen.pickerTimes[0]), dayjs(pen.pickerTimes[1]), null, '[]')
          // console.log(isBetween,item.value,pen.pickerTimes[0],pen.pickerTimes[1], 'isBetween')
          if (isBetween) {
            td.classList.add('l-date-picker__cell--highlight');
          }
          // 选定区间，不在区间内的日期不可选
          const isBefore = dayjs(item.value).isBefore(dayjs(pen.pickerTimes[0]), 'month');
          if (isBefore) {
            td.classList.add('l-date-picker__cell--disabled');
          }
          const isAfter = dayjs(item.value).isAfter(dayjs(pen.pickerTimes[1]), 'month');
          if (isAfter) {
            td.classList.add('l-date-picker__cell--disabled');
          }
        } else {
          // 选定结束日期，大于结束日期的日期不可选
          const isAfter = dayjs(item.value).isAfter(dayjs(pen.pickerTimes[1]), 'month');
          if (isAfter) {
            td.classList.add('l-date-picker__cell--disabled');
          }
        }
      } else if (pen.pickerTimes.length === 1) {
        if (index === 0) {
          td.classList.add('l-date-picker__cell--active-start', 'l-date-picker__cell--active');
        }
        // 选定开始日期，小于开始日期的日期不可选
        const isBefore = dayjs(item.value).isBefore(dayjs(pen.pickerTimes[0]), 'month');
        if (isBefore) {
          td.classList.add('l-date-picker__cell--disabled');
        }
      }
      if (index === 0) {
        td.classList.add('l-date-picker__cell--active-start', 'l-date-picker__cell--active');
      } else if (index === 1) {
        td.classList.add('l-date-picker__cell--active-end', 'l-date-picker__cell--active');
      }


      td.addEventListener("click", tdMonthClick);
      // console.log(val, currentMonth, item.isCurrent)
      if (val === currentMonth && item.isCurrent) {
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
  const { value } = this.dataset;
  const pickerTimes = deepClone(pen.pickerTimes);
  const len = pickerTimes.length;
  let focusIndex = pen.focusIndex;
  if (focusIndex === 0) {
    if (len === 0) {
      pickerTimes.push(value);
    } else if (len >= 1) {
      pickerTimes.splice(0, 1, value);
    }
    // focus下一个
    focusIndex = 1;
    // focus下一个input
    focusNextInput(penId, focusIndex);
  } else if (focusIndex === 1) {
    if (len === 0) {
      pickerTimes.push(...["", value]);
    } else if (len === 1) {
      pickerTimes.push(value);
    } else if (len >= 2) {
      pickerTimes.splice(1, 1, value);
    }
    // focus下一个
    focusIndex = 0;
  }
  const times = adjustPickertimes(pen.mode, pickerTimes);
  window.meta2d.setValue({
    id: penId,
    pickerTimes: times,
    focusIndex,
  })

  const dropMenu = document.querySelector(`.${DROPMENU_PREFIX}${penId}`);
  let selector = '.l-date-picker__panel-year'
  // if (pen.mode === SwitchMode.DATE) {
  //   selector = '.l-date-picker__panel-date';
  // } else if (pen.mode === SwitchMode.MONTH) {
  //   selector = '.l-date-picker__panel-month';
  // } else if (pen.mode === SwitchMode.WEEK) {
  //   selector = '.l-date-picker__panel-week';
  // } else if (pen.mode === SwitchMode.YEAR) {
  //   selector = '.l-date-picker__panel-year';
  // }
  const list = dropMenu.querySelectorAll(selector);
  updateBody(list[0], penId);
  updateBody(list[1], penId);
  // this.parentElement.parentElement.parentElement.parentElement.dataset.currentYear = value;

  //update input
  if (pickerTimes.length >= 1) {
    // console.log(pickerTimes, 'pick done')
    // update input
    updateInput(dropMenu.previousElementSibling, pickerTimes, pen);
  }

  // const pickerTimes = deepClone(pen.pickerTimes);
  // updateTags(pickerTimes, value, pen);
  // window.meta2d.setValue({
  //   id: penId,
  //   pickerTimes,
  // })
  // adjustHeight(pen);
  // 更新body
  // updateBody(this.parentElement.parentElement.parentElement.parentElement, penId);
}
function tdMonthClick(e) {
  e.stopPropagation();
  const { mode, currentMonth, currentYear } = this.parentElement.parentElement.parentElement.parentElement.dataset;
  let _currentMonth = parseInt(currentMonth);
  let _currentYear = parseInt(currentYear);
  const { value } = this.dataset;
  const penId = this.parentElement.dataset.penId
  const pen = window.meta2d.findOne(penId);
  if (!pen) {
    return;
  }
  // console.log(value, 'value')
  const pickerTimes = deepClone(pen.pickerTimes);
  const len = pickerTimes.length;
  let focusIndex = pen.focusIndex;
  if (focusIndex === 0) {
    if (len === 0) {
      pickerTimes.push(value);
    } else if (len >= 1) {
      pickerTimes.splice(0, 1, value);
    }
    // focus下一个
    focusIndex = 1;
    // focus下一个input
    focusNextInput(penId, focusIndex);
  } else if (focusIndex === 1) {
    if (len === 0) {
      pickerTimes.push(...["", value]);
    } else if (len === 1) {
      pickerTimes.push(value);
    } else if (len >= 2) {
      pickerTimes.splice(1, 1, value);
    }
    // focus下一个
    focusIndex = 0;
  }
  const times = adjustPickertimes(pen.mode, pickerTimes);
  window.meta2d.setValue({
    id: penId,
    pickerTimes: times,
    focusIndex,
  })
  // this.parentElement.parentElement.parentElement.parentElement.dataset.currentMonth = value.split('-')[1];
  // const pickerTimes = deepClone(pen.pickerTimes);
  // updateTags(pickerTimes, value, pen);
  // window.meta2d.setValue({
  //   id: penId,
  //   pickerTimes,
  // })
  // adjustHeight(pen);


  const dropMenu = document.querySelector(`.${DROPMENU_PREFIX}${penId}`);
  let selector = '.l-date-picker__panel-month'
  // if (pen.mode === SwitchMode.DATE) {
  //   selector = '.l-date-picker__panel-date';
  // } else if (pen.mode === SwitchMode.MONTH) {
  //   selector = '.l-date-picker__panel-month';
  // } else if (pen.mode === SwitchMode.WEEK) {
  //   selector = '.l-date-picker__panel-week';
  // } else if (pen.mode === SwitchMode.YEAR) {
  //   selector = '.l-date-picker__panel-year';
  // }
  const list = dropMenu.querySelectorAll(selector);
  updateBody(list[0], penId);
  updateBody(list[1], penId);


  //update input
  if (pickerTimes.length >= 1) {
    // console.log(pickerTimes, 'pick done')
    // update input
    updateInput(dropMenu.previousElementSibling, pickerTimes, pen);
  }

  // 更新body
  // updateBody(this.parentElement.parentElement.parentElement.parentElement, penId);
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
  // console.log(daylist, 'daylist')
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
      td.dataset.date = child.date;
      td.dataset.penId = pen.id;
      td.dataset.rowIndex = i + '';
      td.dataset.colIndex = k + '';
      td.dataset.type = child.type;
      const index = pen.pickerTimes.findIndex((el) => el.startsWith(child.date));
      // console.log('index', index)
      if (pen.pickerTimes.length === 2) {
        // 并且起始日期不为空，是存在的
        if (pen.pickerTimes[0]) {
          const isBetween = dayjs(child.date).isBetween(dayjs(pen.pickerTimes[0]), dayjs(pen.pickerTimes[1]), null, '[]')
          // console.log(isBetween,child.date,pen.pickerTimes[0],pen.pickerTimes[1], 'isBetween')
          if (isBetween && child.active) {
            td.classList.add('l-date-picker__cell--highlight');
          }
          // 选定区间，不在区间内的日期不可选
          const isBefore = dayjs(child.date).isBefore(dayjs(pen.pickerTimes[0]));
          if (isBefore) {
            td.classList.add('l-date-picker__cell--disabled');
          }
          const isAfter = dayjs(child.date).isAfter(dayjs(pen.pickerTimes[1]));
          if (isAfter) {
            td.classList.add('l-date-picker__cell--disabled');
          }
        } else {
          // 选定结束日期，大于结束日期的日期不可选
          const isAfter = dayjs(child.date).isAfter(dayjs(pen.pickerTimes[1]));
          if (isAfter) {
            td.classList.add('l-date-picker__cell--disabled');
          }
        }
      } else if (pen.pickerTimes.length === 1) {
        if (index === 0) {
          td.classList.add('l-date-picker__cell--active-start', 'l-date-picker__cell--active');
        }
        // 选定开始日期，小于开始日期的日期不可选
        const isBefore = dayjs(child.date).isBefore(dayjs(pen.pickerTimes[0]));
        if (isBefore) {
          td.classList.add('l-date-picker__cell--disabled');
        }
      }
      if (index === 0) {
        td.classList.add('l-date-picker__cell--active-start', 'l-date-picker__cell--active');
      } else if (index === 1) {
        td.classList.add('l-date-picker__cell--active-end', 'l-date-picker__cell--active');
      }
      if (pen.mode === SwitchMode.DATE) {
        td.addEventListener("click", tdDateClick);
      } else if (pen.mode === SwitchMode.TIME) {
        td.addEventListener("click", tdDateTimeClick);
      }
      td.addEventListener("mouseenter", tdMouseEnter);

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
function tdMouseEnter(e) {
  e.stopPropagation();
  return;
  const { date, value, penId } = this.dataset;
  const pen = window.meta2d.findOne(penId);
  if (!pen) {
    return;
  }
  if (pen.pickerTimes.length === 0 || pen.pickerTimes.length === 2) {
    return;
  }
  // console.log(date, value, 'value')
  let rangeMode = "";
  if (pen.pickerTimes.length === 1) {
    // console.log("start")
    rangeMode = "start";
  } else if (pen.pickerTimes.length === 2 && pen.pickerTimes[0] === "") {
    // console.log("end")
    rangeMode = "end";
  }
  window.meta2d.setValue({
    id: penId,
    tempDate: date,
    rangeMode,
  })
  // const { mode, currentMonth, currentYear } = this.parentElement.parentElement.parentElement.parentElement.dataset;
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
  // if (pen.mode === SwitchMode.DATE) {
  //   updateBody(list[0], penId);
  //   updateBody(list[1], penId);
  // } else if (pen.mode === SwitchMode.WEEK) {
  //   updateBody(list[0], penId);
  //   updateBody(list[1], penId);
  // } else if (pen.mode === SwitchMode.MONTH) {
  //   updateBody(list[0], penId);
  //   updateBody(list[1], penId);
  // } else if (pen.mode === SwitchMode.YEAR) {
  //   updateBody(list[0], penId);
  //   updateBody(list[1], penId);
  // } else if (pen.mode === SwitchMode.TIME) {
  //   // 更新body
  //   updateBody(list[0], penId);
  // }
}
function tdDateClick(e) {
  e.stopPropagation();
  const { mode, currentMonth, currentYear } = this.parentElement.parentElement.parentElement.parentElement.dataset;
  const _mode = parseInt(mode);
  let _currentMonth = parseInt(currentMonth);
  let _currentYear = parseInt(currentYear);
  let flag = -1;// -1: 不需要更新，1: 需要更新月份，2: 需要更新年份和月份 
  if (this.dataset.type === MonthType.PREV) {
    if (_currentMonth > 1) {
      // _currentMonth--;
      _currentMonth = minusMonth(_currentMonth, 1);
      flag = 1;
    } else if (_currentMonth === 1) {
      _currentMonth = 12;
      // _currentYear--;
      _currentYear = minusYear(_currentYear, 1);
      flag = 2;
    }
  } else if (this.dataset.type === MonthType.NEXT) {
    if (_currentMonth < 12) {
      // _currentMonth++;
      _currentMonth = addMonth(_currentMonth, 1);
      flag = 1;
    } else if (_currentMonth === 12) {
      _currentMonth = 1;
      // _currentYear++;
      _currentYear = addYear(_currentYear, 1);
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

  const { value } = this.dataset;
  let yyhhdd = '';
  if (pen.mode === SwitchMode.DATE) {
    yyhhdd = dayjs().year(_currentYear).month(_currentMonth - 1).date(value).format("YYYY-MM-DD");
  } else if (pen.mode === SwitchMode.TIME) {
    const { hour, minute, second } = this.parentElement.parentElement.parentElement.parentElement.nextElementSibling.dataset;
    yyhhdd = dayjs().year(_currentYear).month(_currentMonth - 1).date(value).hour(hour).minute(minute).second(second).format("YYYY-MM-DD HH:mm:ss");
  }
  // console.log(yyhhdd, 'yyhhdd')
  const pickerTimes = deepClone(pen.pickerTimes);
  const len = pickerTimes.length;
  let focusIndex = pen.focusIndex;
  if (focusIndex === 0) {
    if (len === 0) {
      pickerTimes.push(yyhhdd);
    } else if (len >= 1) {
      pickerTimes.splice(0, 1, yyhhdd);
    }
    // focus下一个
    focusIndex = 1;
    // focus下一个input
    focusNextInput(penId, focusIndex);
  } else if (focusIndex === 1) {
    if (len === 0) {
      pickerTimes.push(...["", yyhhdd]);
    } else if (len === 1) {
      pickerTimes.push(yyhhdd);
    } else if (len >= 2) {
      pickerTimes.splice(1, 1, yyhhdd);
    }
    // focus下一个
    focusIndex = 0;
  }
  const times = adjustPickertimes(pen.mode, pickerTimes);
  window.meta2d.setValue({
    id: penId,
    pickerTimes: times,
    focusIndex,
  })



  // updateTags(pickerTimes, yyhhdd, pen);
  // window.meta2d.setValue({
  //   id: penId,
  //   pickerTimes,
  // })
  // adjustHeight(pen);

  // 更新footer
  if (pen.mode === SwitchMode.TIME) {
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
  let selector = '.l-date-picker__panel-date'
  // if (pen.mode === SwitchMode.DATE) {
  //   selector = '.l-date-picker__panel-date';
  // } else if (pen.mode === SwitchMode.MONTH) {
  //   selector = '.l-date-picker__panel-month';
  // } else if (pen.mode === SwitchMode.WEEK) {
  //   selector = '.l-date-picker__panel-week';
  // } else if (pen.mode === SwitchMode.YEAR) {
  //   selector = '.l-date-picker__panel-year';
  // }
  // console.log(selector, 'selector')
  const list = dropMenu.querySelectorAll(selector);
  // console.log(list, 'list')
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
  if (pen.mode === SwitchMode.DATE) {
    updateBody(list[0], penId);
    updateBody(list[1], penId);
  } else if (pen.mode === SwitchMode.TIME) {
    // console.log('time', list[0])
    // 更新body
    updateBody(list[0], penId);
  }

  // if (mode === SwitchMode.DATE) {
  //   updateBody(list[0], penId);
  //   updateBody(list[1], penId);
  // } else if (mode === SwitchMode.WEEK) {
  //   updateBody(list[0], penId);
  //   updateBody(list[1], penId);
  // } else if (mode === SwitchMode.MONTH) {
  //   updateBody(list[0], penId);
  //   updateBody(list[1], penId);
  // } else if (mode === SwitchMode.YEAR) {
  //   updateBody(list[0], penId);
  //   updateBody(list[1], penId);
  // } else if (mode === SwitchMode.TIME) {
  //   // 更新body
  //   updateBody(list[_index], penId);
  // }

  //update input
  if (pickerTimes.length >= 1) {
    // console.log(pickerTimes, 'pick done')
    // update input
    updateInput(dropMenu.previousElementSibling, pickerTimes, pen);
  }

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
function tdDateTimeClick(e) {
  // console.log('tdDateTimeClick')
  e.stopPropagation();
  const { mode, currentMonth, currentYear } = this.parentElement.parentElement.parentElement.parentElement.dataset;
  const _mode = parseInt(mode);
  let _currentMonth = parseInt(currentMonth);
  let _currentYear = parseInt(currentYear);
  let flag = -1;// -1: 不需要更新，1: 需要更新月份，2: 需要更新年份和月份 
  if (this.dataset.type === MonthType.PREV) {
    if (_currentMonth > 1) {
      // _currentMonth--;
      _currentMonth = minusMonth(_currentMonth, 1);
      flag = 1;
    } else if (_currentMonth === 1) {
      _currentMonth = 12;
      // _currentYear--;
      _currentYear = minusYear(_currentYear, 1);
      flag = 2;
    }
  } else if (this.dataset.type === MonthType.NEXT) {
    if (_currentMonth < 12) {
      // _currentMonth++;
      _currentMonth = addMonth(_currentMonth, 1);
      flag = 1;
    } else if (_currentMonth === 12) {
      _currentMonth = 1;
      // _currentYear++;
      _currentYear = addYear(_currentYear, 1);
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

  const { value } = this.dataset;
  let yyhhdd = '';
  if (pen.mode === SwitchMode.DATE) {
    yyhhdd = dayjs().year(_currentYear).month(_currentMonth - 1).date(value).format("YYYY-MM-DD");
  } else if (pen.mode === SwitchMode.TIME) {
    const { hour, minute, second } = this.parentElement.parentElement.parentElement.parentElement.nextElementSibling.dataset;
    yyhhdd = dayjs().year(_currentYear).month(_currentMonth - 1).date(value).hour(hour).minute(minute).second(second).format("YYYY-MM-DD HH:mm:ss");
  }
  // console.log(yyhhdd, 'yyhhdd')
  const pickerTimes = deepClone(pen.pickerTimes);
  const len = pickerTimes.length;
  let focusIndex = pen.focusIndex;
  if (focusIndex === 0) {
    if (len === 0) {
      pickerTimes.push(yyhhdd);
    } else if (len >= 1) {
      pickerTimes.splice(0, 1, yyhhdd);
    }
    // focus下一个
    // focusIndex = 1;
    // focus下一个input
    focusNextInput(penId, focusIndex);
  } else if (focusIndex === 1) {
    if (len === 0) {
      pickerTimes.push(...["", yyhhdd]);
    } else if (len === 1) {
      pickerTimes.push(yyhhdd);
    } else if (len >= 2) {
      pickerTimes.splice(1, 1, yyhhdd);
    }
    // focus下一个
    // focusIndex = 0;
  }
  const times = adjustPickertimes(pen.mode, pickerTimes);
  window.meta2d.setValue({
    id: penId,
    pickerTimes: times,
    // focusIndex,
  })



  // updateTags(pickerTimes, yyhhdd, pen);
  // window.meta2d.setValue({
  //   id: penId,
  //   pickerTimes,
  // })
  // adjustHeight(pen);

  // 更新footer
  // if (pen.mode === SwitchMode.TIME && pen.enableTimePicker) {
  const button = this.parentElement.parentElement.parentElement.parentElement.parentElement.nextElementSibling.lastChild;
  if (button.classList.contains('l-is-disabled')) {
    button.classList.remove('l-is-disabled');
  }
  // }
  // this.parentElement.parentElement.dataset.lastdate = yyhhdd;
  this.parentElement.parentElement.dataset.rowIndex = this.dataset.rowIndex;
  this.parentElement.parentElement.dataset.colIndex = this.dataset.colIndex;

  // 最后去更新header和body
  const { index } = this.parentElement.parentElement.dataset;
  const dropMenu = document.querySelector(`.${DROPMENU_PREFIX}${penId}`);
  let selector = '.l-date-picker__panel-date'
  // if (pen.mode === SwitchMode.DATE) {
  //   selector = '.l-date-picker__panel-date';
  // } else if (pen.mode === SwitchMode.MONTH) {
  //   selector = '.l-date-picker__panel-month';
  // } else if (pen.mode === SwitchMode.WEEK) {
  //   selector = '.l-date-picker__panel-week';
  // } else if (pen.mode === SwitchMode.YEAR) {
  //   selector = '.l-date-picker__panel-year';
  // }
  // console.log(selector, 'selector')
  const list = dropMenu.querySelectorAll(selector);
  // console.log(list, 'list')
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
  if (pen.mode === SwitchMode.DATE) {
    updateBody(list[0], penId);
    updateBody(list[1], penId);
  } else if (pen.mode === SwitchMode.TIME) {
    // console.log('time', list[0])
    // 更新body
    updateBody(list[0], penId);
  }

  // if (mode === SwitchMode.DATE) {
  //   updateBody(list[0], penId);
  //   updateBody(list[1], penId);
  // } else if (mode === SwitchMode.WEEK) {
  //   updateBody(list[0], penId);
  //   updateBody(list[1], penId);
  // } else if (mode === SwitchMode.MONTH) {
  //   updateBody(list[0], penId);
  //   updateBody(list[1], penId);
  // } else if (mode === SwitchMode.YEAR) {
  //   updateBody(list[0], penId);
  //   updateBody(list[1], penId);
  // } else if (mode === SwitchMode.TIME) {
  //   // 更新body
  //   updateBody(list[_index], penId);
  // }

  //update input
  if (pickerTimes.length >= 1) {
    // console.log(pickerTimes, 'pick done')
    // update input
    updateInput(dropMenu.previousElementSibling, pickerTimes, pen);
  }

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
function focusNextInput(penId, index) {
  const dropMenu = document.querySelector(`.${DROPMENU_PREFIX}${penId}`);
  const input = dropMenu.previousElementSibling.querySelector(`.l-input__inner[data-index="${index}"]`);
  input.focus();
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
function assembleHeader(pen, opt, type) {
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
    const item = yeartoYearOptions.find(el => el.value[0] <= opt.year && el.value[1] >= opt.year);
    const year = document.createElement('div');
    year.className = 'l-select__wrap l-date-picker__header-controller-range-year';
    // 调用函数，生成从1920年起，前后各100年的年份选项，每10年一个选项
    const yearSelect = assembleSelect({
      type: DateSelectType.YEAR_RANGE,
      selectVal: item ? item.label : opt.year,
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
function getYeartoYearOptions(startYear, endYear, step = 10) {
  // 定义一个函数来生成年份选项
  const options = [];
  for (let year = startYear; year < endYear; year += step) {
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
  dropDown.style.top = '32px';
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
  popContent.dataset.type = opt.type + '';
  popContent.dataset.penId = opt.penId;
  popContent.dataset.index = opt.index;
  popContent.dataset.mode = opt.mode;
  popContent.addEventListener("scroll", selectScroll);

  const dropdownInner = document.createElement('div');
  dropdownInner.className = 'l-select__dropdown-inner';


  const ul = document.createElement('ul');
  ul.className = 'l-select__list';
  ul.addEventListener('click', onSelect);
  const liFrag = generateOptDom(options, opt);
  ul.appendChild(liFrag);
  dropdownInner.appendChild(ul);
  popContent.appendChild(dropdownInner);

  if (opt.type === DateSelectType.YEAR || opt.type === DateSelectType.YEAR_RANGE) {
    const topMoreDom = document.createElement('div');
    topMoreDom.className = 'l-select-option';
    topMoreDom.innerHTML = '...';
    topMoreDom.dataset.type = opt.type + '';
    topMoreDom.dataset.penId = opt.penId;
    topMoreDom.dataset.index = opt.index;
    topMoreDom.dataset.mode = opt.mode;
    topMoreDom.dataset.ctl = More_Ctl.PREV;
    topMoreDom.addEventListener('click', getMoreOptions);
    popContent.insertBefore(topMoreDom, popContent.firstChild);

    const bottomMoreDom = document.createElement('div');
    bottomMoreDom.className = 'l-select-option';
    bottomMoreDom.innerHTML = '...';
    bottomMoreDom.dataset.type = opt.type + '';
    bottomMoreDom.dataset.penId = opt.penId;
    bottomMoreDom.dataset.index = opt.index;
    bottomMoreDom.dataset.mode = opt.mode;
    bottomMoreDom.dataset.ctl = More_Ctl.NEXT
    bottomMoreDom.addEventListener('click', getMoreOptions);
    popContent.appendChild(bottomMoreDom);
  }

  popParent.appendChild(popContent);
  dropDown.appendChild(popParent);

  select.appendChild(dropDown);
  return select;
}
function generateOptDom(options, opt) {
  const frag = document.createDocumentFragment();
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
    frag.appendChild(li);
  }
  return frag;
}
function generateYearOptions(baseYear, range) {
  const options = [];
  for (let i = baseYear; i < baseYear + range; i++) {
    options.push({
      label: i + '',
      value: i + ''
    })
  }
  return options;
}
function getMoreOptions(e) {
  e.stopPropagation();
  const { type, ctl, mode, penId, index } = this.dataset;
  if (ctl === More_Ctl.PREV) {
    changeOption(this.nextElementSibling.firstChild, null, ctl, type, penId, index, mode);
  } else if (ctl === More_Ctl.NEXT) {
    changeOption(null, this.previousElementSibling.firstChild, ctl, type, penId, index, mode);
  }
  // const _type = parseInt(type);
  // if (ctl === More_Ctl.PREV) {
  //   if (_type === DateSelectType.YEAR) {
  //     const startYear = parseInt(yearOptions[0].value);
  //     const moreOpt = generateYearOptions(startYear - 10, 10);
  //     yearOptions.unshift(...moreOpt);
  //     const liFrag = generateOptDom(moreOpt, { index, penId, type, mode });
  //     this.nextElementSibling.firstChild.prepend(liFrag);
  //   } else if (_type === DateSelectType.YEAR_RANGE) {
  //     console.log('prev year range')
  //     const startYear = parseInt(yeartoYearOptions[0].value[0]);
  //     const moreOpt = getYeartoYearOptions(startYear - 50, 40);
  //     console.log(moreOpt, 'moreOpt 11')
  //     yeartoYearOptions.unshift(...moreOpt);
  //     const liFrag = generateOptDom(moreOpt, { index, penId, type, mode });
  //     this.nextElementSibling.firstChild.prepend(liFrag);
  //   }
  // } else if (ctl === More_Ctl.NEXT) {
  //   if (_type === DateSelectType.YEAR) {
  //     const startYear = parseInt(yearOptions[yearOptions.length - 1].value);
  //     const moreOpt = generateYearOptions(startYear + 1, 10);
  //     yearOptions.push(...moreOpt);
  //     const liFrag = generateOptDom(moreOpt, { index, penId, type, mode });
  //     this.previousElementSibling.firstChild.appendChild(liFrag);
  //   } else if (_type === DateSelectType.YEAR_RANGE) {
  //     console.log('next year range')
  //     const startYear = parseInt(yeartoYearOptions[yeartoYearOptions.length - 1].value[0]);
  //     const moreOpt = getYeartoYearOptions(startYear + 10, 40);
  //     console.log(moreOpt, 'moreOpt 22')
  //     yeartoYearOptions.push(...moreOpt);
  //     const liFrag = generateOptDom(moreOpt, { index, penId, type, mode });
  //     this.previousElementSibling.firstChild.appendChild(liFrag);
  //   }
  // }
}
function changeOption(prevDom, nextDom, ctl, type, penId, index, mode) {
  const _type = parseInt(type);
  if (ctl === More_Ctl.PREV) {
    if (_type === DateSelectType.YEAR) {
      const startYear = parseInt(yearOptions[0].value);
      const moreOpt = generateYearOptions(startYear - 10, 10);
      // console.log(moreOpt, 'moreOpt 00')
      yearOptions.unshift(...moreOpt);
      const liFrag = generateOptDom(moreOpt, { index, penId, type, mode });
      prevDom.prepend(liFrag);
    } else if (_type === DateSelectType.YEAR_RANGE) {
      // console.log('prev year range')
      const startYear = parseInt(yeartoYearOptions[0].value[0]);
      const moreOpt = getYeartoYearOptions(startYear - 50, startYear);
      // console.log(moreOpt, 'moreOpt 11')
      yeartoYearOptions.unshift(...moreOpt);
      const liFrag = generateOptDom(moreOpt, { index, penId, type, mode });
      prevDom.prepend(liFrag);
    }
  } else if (ctl === More_Ctl.NEXT) {
    if (_type === DateSelectType.YEAR) {
      const startYear = parseInt(yearOptions[yearOptions.length - 1].value);
      const moreOpt = generateYearOptions(startYear + 1, 10);
      yearOptions.push(...moreOpt);
      const liFrag = generateOptDom(moreOpt, { index, penId, type, mode });
      nextDom.appendChild(liFrag);
    } else if (_type === DateSelectType.YEAR_RANGE) {
      // console.log('next year range')
      const startYear = parseInt(yeartoYearOptions[yeartoYearOptions.length - 1].value[0]);
      const moreOpt = getYeartoYearOptions(startYear + 10, startYear + 50);
      // console.log(moreOpt, 'moreOpt 22')
      yeartoYearOptions.push(...moreOpt);
      const liFrag = generateOptDom(moreOpt, { index, penId, type, mode });
      nextDom.appendChild(liFrag);
    }
  }
}
function selectScroll(e) {
  // console.log('scroll')
  const { type, mode, penId, index } = this.dataset;
  const _type = parseInt(type);
  const isAtTop = this.scrollTop === 0;
  // 判断是否滚动到底部
  const isAtBottom = this.scrollTop + this.clientHeight >= this.scrollHeight;

  if (isAtTop) {
    // if (_type === DateSelectType.YEAR) {
    //   const startYear = parseInt(yearOptions[0].value);
    //   const moreOpt = generateYearOptions(startYear - 10, 10);
    //   yearOptions.unshift(...moreOpt);
    //   const liFrag = generateOptDom(moreOpt, { type, mode, index, penId });
    //   this.firstChild.nextElementSibling.firstChild.prepend(liFrag);
    // } else if (_type === DateSelectType.YEAR_RANGE) {
    //   console.log('prev year range')
    //   const startYear = parseInt(yeartoYearOptions[0].value[0]);
    //   const moreOpt = getYeartoYearOptions(startYear - 50, 40);
    //   console.log(moreOpt, 'moreOpt 11')
    //   yeartoYearOptions.unshift(...moreOpt);
    //   const liFrag = generateOptDom(moreOpt, { index, penId, type, mode });
    //   this.firstChild.nextElementSibling.firstChild.prepend(liFrag);
    // }
    changeOption(this.firstChild.nextElementSibling.firstChild, null,
      More_Ctl.PREV, type, penId, index, mode);
  }
  if (isAtBottom) {
    // if (_type === DateSelectType.YEAR) {
    //   const startYear = parseInt(yearOptions[yearOptions.length - 1].value);
    //   const moreOpt = generateYearOptions(startYear + 1, 10);
    //   yearOptions.push(...moreOpt);
    //   const liFrag = generateOptDom(moreOpt, { type, mode, index, penId });
    //   this.firstChild.nextElementSibling.firstChild.appendChild(liFrag);
    // } else if (_type === DateSelectType.YEAR_RANGE) {
    //   console.log('next year range')
    //   const startYear = parseInt(yeartoYearOptions[yeartoYearOptions.length - 1].value[0]);
    //   const moreOpt = getYeartoYearOptions(startYear + 10, 40);
    //   console.log(moreOpt, 'moreOpt 22')
    //   yeartoYearOptions.push(...moreOpt);
    //   const liFrag = generateOptDom(moreOpt, { index, penId, type, mode });
    //   this.firstChild.nextElementSibling.firstChild.appendChild(liFrag);
    // }
    changeOption(null, this.firstChild.nextElementSibling.firstChild, More_Ctl.NEXT, type, penId, index, mode);
  }

  // console.log(`Scroll Position: ${this.scrollTop}`);
  // console.log(`Is at top: ${isAtTop}`);
  // console.log(`Is at bottom: ${isAtBottom}`);
}
function onSelect(e) {
  // console.log('onSelect', e.target)
  // e.stopPropagation();
  const { type, index, penId, value, mode } = e.target.dataset;
  const dropMenu = document.querySelector(`.${DROPMENU_PREFIX}${penId}`);
  const _type = parseInt(type);
  const _index = parseInt(index);
  let selector = ''
  let _value = value;
  if (mode === SwitchMode.DATE) {
    selector = '.l-date-picker__panel-date';
  } else if (mode === SwitchMode.MONTH) {
    selector = '.l-date-picker__panel-month';
  } else if (mode === SwitchMode.WEEK) {
    selector = '.l-date-picker__panel-week';
  } else if (mode === SwitchMode.YEAR) {
    selector = '.l-date-picker__panel-year';
  } else if (mode === SwitchMode.TIME) {
    selector = '.l-date-picker__panel-date';
  }
  const list = dropMenu.querySelectorAll(selector);
  // 更新content的数据，存储下来
  if (_type === DateSelectType.MONTH) {
    list[_index].dataset.currentMonth = _value;
  } else if (_type === DateSelectType.YEAR) {
    list[_index].dataset.currentYear = _value;
  } else if (_type === DateSelectType.YEAR_RANGE) {
    list[_index].dataset.yearRange = _value;
    const _list = _value.split(',');
    list[_index].dataset.currentYear = _list[0];
    _value = _list.join(' - ');
  }
  console.log(type,_value, 'value')
  // 更新header
  updateHeader(list[_index], type, _value);


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
  } else if (pen.mode === SwitchMode.TIME) {
    trs = assembleDateBodyTRs(pen, { year, month });
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
// 处理年的边界情况，补充数据
function patchYearOptions(yearOptions, startYear, endYear) {

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
          // _currentMonth--;
          _currentMonth = minusMonth(_currentMonth, 1);
          list[_index].dataset.currentMonth = _currentMonth;
          // 更新header
          updateHeader(list[_index], DateSelectType.MONTH + '', _currentMonth + '');
        } else if (_currentMonth === 1) {
          _currentMonth = 12;
          // _currentYear--;
          _currentYear = minusYear(_currentYear, 1);
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
        // _currentMonth++;
        _currentMonth = addMonth(_currentMonth, 1);
        list[_index].dataset.currentMonth = _currentMonth;
        // 更新header
        updateHeader(list[_index], DateSelectType.MONTH + '', _currentMonth + '');
      } else if (_currentMonth === 12) {
        _currentMonth = 1;
        // _currentYear++;
        _currentYear = addYear(_currentYear, 1);
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
        // _currentMonth--;
        _currentMonth = minusMonth(_currentMonth, 1);
        this.parentElement.parentElement.parentElement.dataset.currentMonth = _currentMonth;
        // 更新header
        updateHeader(this.parentElement.parentElement.parentElement, DateSelectType.MONTH + '', _currentMonth + '');
      } else if (_currentMonth === 1) {
        _currentMonth = 12;
        // _currentYear--;
        _currentYear = minusYear(_currentYear, 1);
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
        // _currentMonth++;
        _currentMonth = addMonth(_currentMonth, 1);
        this.parentElement.parentElement.parentElement.dataset.currentMonth = _currentMonth;
        // 更新header
        updateHeader(this.parentElement.parentElement.parentElement, DateSelectType.MONTH + '', _currentMonth + '');
      } else if (_currentMonth === 12) {
        _currentMonth = 1;
        // _currentYear++;
        _currentYear = addYear(_currentYear, 1);
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
      // _currentYear--;
      _currentYear = minusYear(_currentYear, 1);
      this.parentElement.parentElement.parentElement.dataset.currentYear = _currentYear;
      updateHeader(this.parentElement.parentElement.parentElement,
        DateSelectType.YEAR + '', _currentYear);
    } else if (key === CTL_TYPE.NEXT) {
      // _currentYear++;
      _currentYear = addYear(_currentYear, 1);
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
      const firstYear = yeartoYearOptions[0].value[0];
      if(_currentYear < firstYear) {
        const startYear = yeartoYearOptions[0].value[0];
        const moreOpt = getYeartoYearOptions(startYear - 50, startYear);
        yeartoYearOptions.unshift(...moreOpt);
      }
      const yOpt = yeartoYearOptions.find(el => el.value[0] <= _currentYear && el.value[1] >= _currentYear);
      this.parentElement.parentElement.parentElement.dataset.currentYear = _currentYear;
      updateHeader(this.parentElement.parentElement.parentElement,
        DateSelectType.YEAR_RANGE + '', yOpt.label);
    } else if (key === CTL_TYPE.NEXT) {
      _currentYear += 10;
      let lastYear = yeartoYearOptions[yeartoYearOptions.length - 1].value[1];
      if(_currentYear > lastYear) {
        lastYear += 1;
        const startYear = yeartoYearOptions[yeartoYearOptions.length - 1].value[0];
        const moreOpt = getYeartoYearOptions(startYear + 10, startYear + 50);
        yeartoYearOptions.push(...moreOpt);
      }
      const yOpt = yeartoYearOptions.find(el => el.value[0] <= _currentYear && el.value[1] >= _currentYear);
      this.parentElement.parentElement.parentElement.dataset.currentYear = _currentYear;
      updateHeader(this.parentElement.parentElement.parentElement,
        DateSelectType.YEAR_RANGE + '', yOpt.label);
    } else if (key === CTL_TYPE.CURRENT) {
      // 获取当前的年月
      const currentYear = dayjs().year();
      const yOpt = yeartoYearOptions.find(el => el.value[0] <= currentYear && el.value[1] >= currentYear);
      this.parentElement.parentElement.parentElement.dataset.currentYear = currentYear;
      updateHeader(this.parentElement.parentElement.parentElement,
        DateSelectType.YEAR_RANGE + '', yOpt.label);
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
function assembleRangeInputBox(pen: Pen) {
  const box = document.createElement("div");
  box.className = 'l-range-input l-range-input--suffix';

  const inner = document.createElement("div");
  inner.className = 'l-range-input__inner';

  const left = document.createElement("div");
  left.className = 'l-input__wrap l-range-input__inner-left';
  const inputDiv = document.createElement("div");
  inputDiv.className = 'l-input';
  const leftInner = document.createElement("input");
  leftInner.className = 'l-input__inner';
  leftInner.type = 'text';
  leftInner.spellcheck = false;
  leftInner.placeholder = PlaceHolder[pen.mode][0];
  leftInner.dataset.index = '0';
  leftInner.dataset.penId = pen.id;
  leftInner.addEventListener('focus', inputFocus)
  inputDiv.appendChild(leftInner);
  left.appendChild(inputDiv);
  inner.appendChild(left);

  const seperator = document.createElement("div");
  seperator.className = 'l-range-input__inner-separator';
  seperator.innerHTML = ' - ';
  inner.appendChild(seperator);

  const right = document.createElement("div");
  right.className = 'l-input__wrap l-range-input__inner-right';
  const inputDiv2 = document.createElement("div");
  inputDiv2.className = 'l-input';
  const rightInner = document.createElement("input");
  rightInner.className = 'l-input__inner';
  rightInner.type = 'text';
  rightInner.spellcheck = false;
  rightInner.placeholder = PlaceHolder[pen.mode][1];
  rightInner.dataset.index = '1';
  rightInner.dataset.penId = pen.id;
  rightInner.addEventListener('focus', inputFocus)
  inputDiv2.appendChild(rightInner);
  right.appendChild(inputDiv2);
  inner.appendChild(right);

  const suffix = document.createElement("span");
  suffix.classList.add('l-range-input__suffix', 'l-range-input__suffix-icon');
  suffix.dataset.penId = pen.id;
  suffix.addEventListener('click', onSuffixClick);

  const svgDom = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svgDom.setAttribute('viewBox', '0 0 24 24');
  svgDom.style.width = '1em';
  svgDom.style.height = '1em';
  svgDom.style.fill = 'none';
  svgDom.classList.add('l-icon');

  const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  path.setAttribute('fill', 'currentColor');
  path.setAttribute('d', svgMap[CTL_TYPE.CLOSE]);
  svgDom.appendChild(path);
  suffix.appendChild(svgDom);
  inner.appendChild(suffix);


  box.appendChild(inner);

  // const input = document.createElement("input");
  // input.type = "text";
  // input.style.width = 'auto';
  // input.style.height = 'auto';
  // input.style.border = 'none';
  // input.readOnly = pen.filterable ? !pen.filterable : true;
  // // input.style.outline = 'none';
  // // input.style.border = '1px solid #ccc';
  // input.style.background = 'transparent';
  // input.className = `${CASCADE_PREFIX}${pen.id}`;
  // input.dataset.penId = pen.id;
  // // input.oninput = debounce(onInputchange, 1000)


  // const input_prefix = document.createElement("div");
  // input_prefix.style.display = 'inline';
  // input_prefix.style.textAlign = 'left';
  // input_prefix.className = TAG_WRAPPER + pen.id;

  // const frag = document.createDocumentFragment();
  // for (let i = 0; i < pen.pickerTimes.length; i++) {
  //   const yyhhdd = pen.pickerTimes[i];
  //   const e = assembleTag(yyhhdd, yyhhdd, pen.id, pen.mode);
  //   frag.appendChild(e);
  // }
  // input_prefix.appendChild(frag);
  // box.appendChild(input_prefix);

  // box.appendChild(input);
  return box;
}
/**
 * @description 清空区间日期
 * @author Joseph Ho
 * @date 06/11/2024
 * @param {*} e
 * @returns {*}  
 */
function onSuffixClick(e) {
  const { penId } = this.dataset;
  const pen = window.meta2d.findOne(penId);
  if (!pen) {
    return;
  }
  if (pen.pickerTimes.length === 2) {
    window.meta2d.setValue({
      id: penId,
      pickerTimes: [],
      focusIndex: 0,
    })

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
    } else if (pen.mode === SwitchMode.TIME) {
      selector = '.l-date-picker__panel-date';
    }
    if (pen.mode === SwitchMode.TIME) {
      // 更新时间
      resetTimePanel(pen);
    }
    // console.log(selector, 'selector')
    const list = dropMenu.querySelectorAll(selector);

    if (pen.mode === SwitchMode.DATE) {
      // update date1
      let currentMonth = dayjs().month() + 1;
      let currentYear = dayjs().year();
      list[0].dataset.currentMonth = currentMonth;
      list[0].dataset.currentYear = currentYear;
      updateHeader(list[0], DateSelectType.MONTH + '', currentMonth + '');
      updateHeader(list[0], DateSelectType.YEAR + '', currentYear + '');
      updateBody(list[0], penId);

      // update date2
      let nextCurrentMonth = addMonth(currentMonth, 1);
      let nextCurrentYear = currentMonth === 12 ? addYear(currentYear, 1) : currentYear;
      list[1].dataset.currentMonth = nextCurrentMonth;
      list[1].dataset.currentYear = nextCurrentYear;
      updateHeader(list[1], DateSelectType.MONTH + '', nextCurrentMonth + '');
      updateHeader(list[1], DateSelectType.YEAR + '', nextCurrentYear + '');
      updateBody(list[1], penId);
    } else if (pen.mode === SwitchMode.WEEK) {
      // update date1
      let currentMonth = dayjs().month() + 1;
      let currentYear = dayjs().year();
      list[0].dataset.currentMonth = currentMonth;
      list[0].dataset.currentYear = currentYear;
      updateHeader(list[0], DateSelectType.MONTH + '', currentMonth + '');
      updateHeader(list[0], DateSelectType.YEAR + '', currentYear + '');
      updateBody(list[0], penId);

      // update date2
      let nextCurrentMonth = addMonth(currentMonth, 1);
      let nextCurrentYear = currentMonth === 12 ? addYear(currentYear, 1) : currentYear;
      list[1].dataset.currentMonth = nextCurrentMonth;
      list[1].dataset.currentYear = nextCurrentYear;
      updateHeader(list[1], DateSelectType.MONTH + '', nextCurrentMonth + '');
      updateHeader(list[1], DateSelectType.YEAR + '', nextCurrentYear + '');
      updateBody(list[1], penId);
    } else if (pen.mode === SwitchMode.MONTH) {
      // update date1
      let currentMonth = dayjs().month() + 1;
      let currentYear = dayjs().year();
      list[0].dataset.currentMonth = currentMonth;
      list[0].dataset.currentYear = currentYear;
      updateHeader(list[0], DateSelectType.MONTH + '', currentMonth + '');
      updateHeader(list[0], DateSelectType.YEAR + '', currentYear + '');
      updateBody(list[0], penId);

      // update date2
      let nextCurrentMonth = currentMonth;
      let nextCurrentYear = addYear(currentYear, 1);
      list[1].dataset.currentMonth = nextCurrentMonth;
      list[1].dataset.currentYear = nextCurrentYear;
      updateHeader(list[1], DateSelectType.MONTH + '', nextCurrentMonth + '');
      updateHeader(list[1], DateSelectType.YEAR + '', nextCurrentYear + '');
      updateBody(list[1], penId);
    } else if (pen.mode === SwitchMode.YEAR) {
      updateBody(list[0], penId);
      updateBody(list[1], penId);
    } else if (pen.mode === SwitchMode.TIME) {
      // 更新body
      updateBody(list[0], penId);
    }
    // 清空input
    updateInput(this.parentElement, ["", ""], pen);
  }
}
function inputFocus(e) {
  const { index, penId } = this.dataset;
  const pen = window.meta2d.findOne(penId);
  if (!pen) {
    return;
  }
  window.meta2d.setValue({
    id: penId,
    focusIndex: parseInt(index),
  })
}
/**
 * @description 更新input的值，和placeholder值
 * @author Joseph Ho
 * @date 13/11/2024
 * @param {*} dom
 * @param {*} pickerTimes
 * @param {*} mode
 */
function updateInput(dom, pickerTimes, pen) {
  // console.log('updateInput', pickerTimes)
  let mode = pen.mode;
  let suffix = "";
  if (mode === SwitchMode.WEEK) {
    suffix = "周";
  } else if (mode === SwitchMode.MONTH) {
    suffix = "月";
  }
  if (pickerTimes.length === 1) {
    const leftInput = dom.querySelector('.l-input__inner[data-index="0"]');
    leftInput.value = pickerTimes[0] ? (pickerTimes[0] + suffix) : "";
    leftInput.placeholder = PlaceHolder[mode][0];
  } else if (pickerTimes.length === 2) {
    const leftInput = dom.querySelector('.l-input__inner[data-index="0"]');
    leftInput.value = pickerTimes[0] ? (pickerTimes[0] + suffix) : "";
    leftInput.placeholder = PlaceHolder[mode][0];

    const rightInput = dom.querySelector('.l-input__inner[data-index="1"]');
    rightInput.value = pickerTimes[1] ? (pickerTimes[1] + suffix) : "";
    rightInput.placeholder = PlaceHolder[mode][1];

    let checkEvery = false;
    checkEvery = pickerTimes.every(el=>el && dayjs(el).isValid());
    if(checkEvery){
      pen.calculative.canvas.store.emitter.emit('dateRange-pick', {
        pen,
        pickerTimes
      });
    }
  }
  if(pickerTimes.length === 0){
    pen.calculative.canvas.store.emitter.emit('dateRange-pick', {
      pen,
      pickerTimes
    });
  }
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
  } else if (pen.mode === SwitchMode.TIME) {
    selector = '.l-date-picker__panel-date';
  }
  if (pen.mode === SwitchMode.TIME) {
    // 更新时间
    resetTimePanel(pen);
  }

  const list = dropMenu.querySelectorAll(selector);

  // 更新cascader的checked
  updateBody(list[0], penId);

  // 更新高度
  // adjustHeight(pen);
}
function resetViewer(penId) {
  const dropMenu = document.querySelector(`.${DROPMENU_PREFIX}${penId}`);
  const viewer = dropMenu.querySelector(`.${DROPMENU_PREFIX}${penId} .l-date-picker__panel-time .l-date-picker__panel-time-viewer`);
  viewer.innerHTML = '00:00:00';
}
function resetTimePanel(pen: Pen) {
  resetViewer(pen.id);
  const dropMenu = document.querySelector(`.${DROPMENU_PREFIX}${pen.id}`);
  const timeItem = dropMenu.querySelector('.l-date-picker__panel-time');
  const { hour, minute, second } = timeItem.dataset;
  const _hour = parseInt(hour);
  const _minute = parseInt(minute);
  const _second = parseInt(second);
  const newHour = 0, newMinute = 0, newSecond = 0;
  timeItem.dataset.hour = newHour + '';
  timeItem.dataset.minute = newMinute + '';
  timeItem.dataset.second = newSecond + '';
  const panelBody = timeItem.querySelector('.l-time-picker__panel-body');
  const hourDom = panelBody.querySelector('ul[data-type="hour"]');
  hourDom.querySelector(`li[data-value="${_hour}"]`).classList.remove('is-current');
  hourDom.querySelector(`li[data-value="${newHour}"]`).classList.add('is-current');
  const minuteDom = panelBody.querySelector('ul[data-type="minute"]');
  minuteDom.querySelector(`li[data-value="${_minute}"]`).classList.remove('is-current');
  minuteDom.querySelector(`li[data-value="${newMinute}"]`).classList.add('is-current');
  const secondDom = panelBody.querySelector('ul[data-type="second"]');
  secondDom.querySelector(`li[data-value="${_second}"]`).classList.remove('is-current');
  secondDom.querySelector(`li[data-value="${newSecond}"]`).classList.add('is-current');
  setTimeout(() => {
    const hourDistance = newHour * TIME_HEIGHT;
    hourDom.scrollTo?.({
      top: hourDistance,
      behavior: 'smooth',
    });
    const minuteDistance = newMinute * TIME_HEIGHT;
    minuteDom.scrollTo?.({
      top: minuteDistance,
      behavior: 'smooth',
    });
    const secondDistance = newSecond * TIME_HEIGHT;
    secondDom.scrollTo?.({
      top: secondDistance,
      behavior: 'smooth',
    })
  }, 10)
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
function onClick(pen: Pen, e: Point) {
  // console.log('onClick', pen);
}
/**
 * @description 更新整个筛选器
 * @author Joseph Ho
 * @date 13/11/2024
 */
function renderPenRawRefresh(pen: Pen) {
  resetPenData(pen);

  const dropMenu = document.querySelector(`.${DROPMENU_PREFIX}${pen.id}`);
  // 重新渲染dropdown面板
  if (pen.mode === SwitchMode.TIME) {
    dropMenu.firstChild.classList.add('l-date-range-picker__panel--time');
  }else{
    dropMenu.firstChild.classList.remove('l-date-range-picker__panel--time');
  }
  const fragMent = generateDomByData(pen);
  dropMenu.firstChild.replaceChildren(fragMent);

  // 重置input
  updateInput(dropMenu.previousElementSibling, ["", ""], pen);
}
function resetPenData(pen: Pen) {
  window.meta2d.setValue({
    id: pen.id,
    pickerTimes: [],
    focusIndex: 0,
  })
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
    console.error('Error accessing style sheet:', e);
  }
  return false;
}
// 插入新的 CSS 规则到特定样式表
function insertCSSRuleInSheet(sheet, ruleText) {
  sheet.insertRule(ruleText, sheet.cssRules.length);
}
const style_prefix = 'style_';
function generateStyle(pen: Pen) {
  let extraStyle = document.createElement('style');
  extraStyle.type = 'text/css';
  extraStyle.id = style_prefix + pen.id;
  document.head.appendChild(extraStyle);
  // let sheet1 = extraStyle.sheet;
  extraStyle.innerHTML = pen.styles ? pen.styles : '';
  // if (pen.styles && pen.styles.length > 0) {
  //   pen.styles.forEach((rule) => {
  //     // sheet.insertRule(rule + '}', sheet.cssRules.length);
  //     const ruleToCheck = rule + '}';
  //     if (!hasCSSRuleInSheet(sheet1, ruleToCheck)) {
  //       insertCSSRuleInSheet(sheet1, ruleToCheck);
  //       // console.log(`The rule "${ruleToCheck}" was inserted.`);
  //     } else {
  //       // console.log(`The rule "${ruleToCheck}" already exists.`);
  //     }
  //   });
  // }


  let style = document.createElement('style');
  style.type = 'text/css';
  // style.id = pen.id;
  document.head.appendChild(style);
  // let sheet = style.sheet;

  style.innerHTML =
    `[class^="l-date-range-picker__panel_"] {
    width: auto;
    height: 300px;
  }
  
  .l-date-picker__panel-content,
  .l-date-range-picker__panel-content-wrapper {
    display: flex;
    width: 100%;
    height: 100%;
    // height:300px;
  }
  
  .l-date-picker__panel-year,
  .l-date-picker__panel-month,
  .l-date-picker__panel-quarter,
  .l-date-picker__panel-week,
  .l-date-picker__panel-date,
  .l-date-picker__panel-time {
    display: flex;
    flex-direction: column;
    padding: 12px;
    gap: 12px;
    width: 280px;
    box-sizing: border-box;
  }
  
  .l-date-picker__cell--now .l-date-picker__cell-inner {
    color: #366ef4;
    background: #f2f3ff;
  }
  
  .l-date-picker__cell--additional .l-date-picker__cell-inner {
    color: rgba(0, 0, 0, 0.26);
  }
  
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
    transition: box-shadow 0.2s cubic-bezier(0.38, 0, 0.24, 1),
      background-color 0.2s linear, border-color 0.2s linear, color 0.2s linear;
  }
  
  .l-date-picker__header-controller .l-date-picker__header-controller-month {
    width: 60px;
    display: flex;
    position: relative;
  }
  
  .l-date-picker__header-controller .l-date-picker__header-controller-year {
    width: 70px;
    display: flex;
    position: relative;
  }
  
  .l-date-picker__header-controller .l-date-picker__header-controller-range-year {
    width: 130px;
    display: flex;
    position: relative;
  }
  
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
    transition: border cubic-bezier(0.38, 0, 0.24, 1) 0.2s,
      box-shadow cubic-bezier(0.38, 0, 0.24, 1) 0.2s,
      background-color cubic-bezier(0.38, 0, 0.24, 1) 0.2s;
    display: flex;
    align-items: center;
    overflow: hidden;
  }
  
  .l-select-input,
  .l-input__wrap {
    width: 100%;
  }
  
  .l-date-picker__header-controller {
    display: inline-flex;
    gap: 8px;
  }
  
  .l-date-picker__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    width: 100%;
  }
  
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
  }
  
  .l-button {
    width: 24px;
    padding: 0;
    color: rgba(0, 0, 0, 0.9);
    background-color: transparent;
    border-color: transparent;
  }
  
  .l-popup__content {
    width: 100%;
    max-height: 160px;
    margin: 8px 0;
    padding: 0;
    overflow-y: auto;
    overscroll-behavior: contain;
    box-shadow: 0 3px 14px 2px rgba(0, 0, 0, 0.05),
      0 8px 10px 1px rgba(0, 0, 0, 6%), 0 5px 5px -3px rgba(0, 0, 0, 10%);
  
    position: relative;
    background: #fff;
    border-radius: 6px;
  
    box-sizing: border-box;
    word-break: break-all;
    z-index: 1000;
  }
  .l-select-option.l-is-selected:not(.l-is-disabled) {
    color: #0052d9;
    background-color: #f2f3ff;
    transition: all 0.2s linear;
  }
  
  .l-select-option {
    display: flex;
    align-items: center;
    border-radius: 3px;
    height: 28px;
    cursor: pointer;
    padding: 0 8px;
    color: rgba(0, 0, 0, 0.9);
    transition: background-color 0.2s cubic-bezier(0.38, 0, 0.24, 1);
    box-sizing: border-box;
  }
  
  .l-popup {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
    list-style: none;
    color: rgba(0, 0, 0, 0.9);
    display: inline-block;
  }
  .l-select__list {
    margin: 0;
    padding: 6px;
    list-style: none;
  }
  
  .l-select-option span {
    position: relative;
    white-space: nowrap;
    word-wrap: normal;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .l-button {
    cursor: pointer;
  }
  
  .l-date-picker__table th,
  .l-date-picker__table td.l-date-picker__cell {
    padding: 0;
    border: 0;
    line-height: 22px;
  }
  
  .l-date-picker__table th {
    text-align: center;
    color: rgba(0, 0, 0, 0.6);
    font-weight: 400;
  }
  
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
  
  .l-time-picker__panel-body {
    width: 100%;
    height: 216px;
    position: relative;
    user-select: none;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  ul,
  dl,
  ol {
    margin: 0;
    padding: 0 0 0 1.2em;
    line-height: 22px;
  }
  
  .l-time-picker__panel-body-scroll-item {
    height: 24px;
    line-height: 24px;
    color: rgba(0, 0, 0, 0.6);
    margin: 6px 4px;
    border-radius: 3px;
    text-align: center;
    cursor: pointer;
    transition: 0.2s linear;
  }
  
  .l-time-picker__panel-body-active-mask {
    position: absolute;
    top: 50%;
    height: 24px;
    width: 100%;
    display: flex;
  }
  
  .l-time-picker__panel-body-active-mask > div {
    flex: 1;
    transform: translateY(calc(0px - (calc(24px + 6px) / 2)));
    height: 24px;
    background-color: #f2f3ff;
    margin: 6px 4px;
    border-radius: 3px;
  }
  
  .l-date-picker__panel .l-time-picker__panel,
  .l-date-range-picker__panel .l-time-picker__panel {
    width: 216px;
  }
  
  .l-time-picker__panel {
    width: 280px;
    background: transparent;
    border-radius: 3px;
    display: inline-block;
    position: relative;
    --timePickerPanelOffsetTop: 15;
    --timePickerPanelOffsetBottom: 35;
  }
  
  .l-date-picker__panel-time-viewer,
  .l-date-range-picker__panel-time-viewer {
    display: flex;
    height: 32px;
    line-height: 22px;
    align-items: center;
    justify-content: center;
    color: rgba(0, 0, 0, 0.9);
  }
  
  .l-date-picker__panel-time,
  .l-date-range-picker__panel-time {
    display: flex;
    flex-direction: column;
    gap: 6px;
    padding: 12px 8px;
    border-left: 1px solid #e7e7e7;
  }
  
  .l-time-picker__panel-body-scroll:after {
    height: calc(50% - var(--timePickerPanelOffsetBottom, 0) * 1px);
  }
  
  .l-time-picker__panel-body-scroll:after,
  .l-time-picker__panel-body-scroll:before {
    display: block;
    height: 50%;
    content: "";
  }
  
  .l-time-picker__panel-body-scroll::-webkit-scrollbar {
    display: none;
  }
  
  .l-time-picker__panel-body-scroll:before {
    height: calc(50% - var(--timePickerPanelOffsetTop, 0) * 1px);
  }
  
  .l-time-picker__panel-body-scroll-item.is-current {
    color: #0052d9;
  }
  
  .l-date-picker__cell--active .l-date-picker__cell-inner {
    color: #fff !important;
    background-color: #0052d9 !important;
  }
  
  .l-date-picker__cell--highlight:before {
    opacity: 1;
    background-color: #f2f3ff;
  }
  
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
    transition: opacity 0.2s cubic-bezier(0, 0, 0.15, 1);
  }
  
  .l-date-picker__cell--active-start:before {
    opacity: 1;
    left: calc(calc(4px - 1px) * 2);
    border-top-left-radius: 3px;
    border-bottom-left-radius: 3px;
  }
  
  .l-date-picker__cell--active-end:before {
    opacity: 1;
    right: calc(calc(4px - 1px) * 2);
    border-top-right-radius: 3px;
    border-bottom-right-radius: 3px;
  }
  
  .l-date-picker__panel-year .l-date-picker__cell-inner,
  .l-date-picker__panel-month .l-date-picker__cell-inner,
  .l-date-picker__panel-quarter .l-date-picker__cell-inner {
    width: 48px;
  }
  
  .l-date-picker__panel-year .l-date-picker__table tbody tr,
  .l-date-picker__panel-month .l-date-picker__table tbody tr,
  .l-date-picker__panel-quarter .l-date-picker__table tbody tr {
    display: flex;
    justify-content: space-between;
  }
  
  .l-date-picker__table-week-row:hover:after {
    box-shadow: inset 0 0 0 1px #0052d9;
  }
  
  .l-date-picker__table-week-row:hover
    .l-date-picker__cell:first-child
    .l-date-picker__cell-inner {
    color: #0052d9;
  }
  
  .l-date-picker__table td.l-date-picker__cell {
    text-align: center;
    font-weight: 500;
  }
  
  .l-date-picker__table-week-row.l-date-picker__table-week-row--active:after {
    opacity: 1;
    z-index: 0;
    background-color: #0052d9;
  }
  
  .l-date-picker__table-week-row--active .l-date-picker__cell:first-child .l-date-picker__cell-inner {
    color: #0052d9;
  }
  
  .l-date-picker__table-week-row
    .l-date-picker__cell:first-child
    .l-date-picker__cell-inner {
    color: rgba(0, 0, 0, 0.26);
  }
  
  .l-date-picker__table-week-row {
    cursor: pointer;
    position: sticky;
  }
  
  .l-date-picker__table-week-row:after {
    content: "";
    position: absolute;
    left: 32px;
    right: 0;
    top: calc(4px - 1px);
    z-index: 10;
    height: 24px;
    border-radius: 3px;
    transition: box-shadow 0.2s cubic-bezier(0.38, 0, 0.24, 1),
      background-color 0.2s linear, border-color 0.2s linear, color 0.2s linear;
    pointer-events: none;
  }
  
  .l-date-picker__table-week-row--active .l-date-picker__cell .l-date-picker__cell-inner {
    background: transparent;
    color: #fff;
  }
  
  .l-date-picker__panel,
  .l-date-range-picker__panel {
    display: flex;
    flex-direction: column;
  }
  
  .l-date-picker__footer--bottom {
    border-top: 1px solid #e7e7e7;
  }
  
  .l-date-picker__footer {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    padding: 12px;
    gap: 8px;
  }
  
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
    transition: all 0.2s linear;
    touch-action: manipulation;
    text-decoration: none;
  }
  
  .l-button.l-button--theme-primary {
    color: #fff;
    background-color: #0052d9;
    border-color: #0052d9;
    width: auto;
    height: 24px;
    padding-left: 7px !important;
    padding-right: 7px !important;
  }
  
  .l-button.l-button--theme-primary.l-is-disabled {
    cursor: not-allowed;
    background-color: #b5c7ff;
    border-color: #b5c7ff;
  }
  
  .l-date-picker__panel-content,
  .l-date-range-picker__panel-content,
  .l-date-range-picker__panel-content-wrapper {
    display: flex;
  }
  
  .l-date-range-picker__panel--time.l-date-range-picker__panel-content-wrapper {
    display: flex;
    flex-direction: column;
  }
  
  .l-range-input__inner {
    height: 100%;
    display: flex;
    align-items: center;
    gap: 8px;
  }
  
  .l-range-input {
    margin: 0;
    padding: 0;
    list-style: none;
    height: 100%;
    width: 100%;
    position: relative;
    // font: var(--td-font-body-medium);
    // height: 32px;
    border-width: 1px;
    border-style: solid;
    border-radius: 3px;
    border-color: #dcdcdc;
    padding: 4px 8px;
    background-color: #fff;
    color: rgba(0, 0, 0, 0.9);
    // font-size: var(--td-font-body-medium);
    box-sizing: border-box;
    transition: all cubic-bezier(0.38, 0, 0.24, 1) 0.2s;
    display: inline-flex;
    flex-direction: column;
    gap: 4px;
  }
  
  .l-range-input__inner .l-input__wrap {
    height: 100%;
    border-radius: 2px;
  }
  
  .l-range-input__inner .l-input {
    padding: 0 4px;
    height: 100%;
    border: 0;
    box-shadow: none;
    font-size: inherit;
    border-radius: 2px;
  }
  
  .l-date-picker__cell {
    cursor: pointer;
    position: relative;
    padding: 0;
  }
  
  .l-date-picker__cell--highlight:before {
    opacity: 1;
    background-color: #f2f3ff;
  }
  
  .l-date-picker__cell--active-start:before,
  .l-date-picker__cell--active-end:before {
    opacity: 1;
    left: 6px;
    border-top-left-radius: 3px;
    border-bottom-left-radius: 3px;
  }
  
  .l-date-picker__cell--disabled .l-date-picker__cell-inner {
    cursor: not-allowed;
    color: rgba(0, 0, 0, 0.26);
    background-color: #eee;
  }
  
  .l-date-picker__cell--disabled + .l-date-picker__cell--disabled:before {
    opacity: 1;
    left: -100%;
    background-color: #eee;
    border-radius: 3px;
  }
  
  .l-date-picker__cell--disabled + .l-date-picker__cell--active-start:before {
    opacity: 1;
    left: -100%;
    background-color: #eee;
    border-radius: 3px;
  }
  
  .l-date-picker__cell--active-end + .l-date-picker__cell--disabled:before {
    opacity: 1;
    left: -100%;
    background-color: #eee;
    border-radius: 3px;
  }
  
  .l-icon {
    fill: currentColor;
  }
  
  .l-range-input__prefix > .l-icon,
  .l-range-input__suffix > .l-icon {
    transition: color 0.2s linear;
    font-size: 16px;
    color: rgba(0, 0, 0, 0.4);
    flex-shrink: 0;
  }
  
  .l-range-input.l-range-input--prefix .l-range-input__prefix,
  .l-range-input.l-range-input--suffix .l-range-input__suffix {
    height: 100%;
    text-align: center;
    display: flex;
    align-items: center;
    font-size: 14px;
  }
  
  .l-date-picker__table-week-row--range::after {
    opacity: 1;
    z-index: 0 !important;
    background-color: #f2f3ff;
  }
  
  .l-date-picker__panel-year
    .l-date-picker__cell--highlight
    + .l-date-picker__cell--highlight:before,
  .l-date-picker__panel-month
    .l-date-picker__cell--highlight
    + .l-date-picker__cell--highlight:before {
    left: calc(0px - calc(24px + 24px));
  }
  `
}

