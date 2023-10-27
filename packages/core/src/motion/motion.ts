export type MotionType =
  'color'
  | 'vision'
  | 'text'
  | 'blink'
  | 'image'
  | 'rotate'
  | 'fill'
  | 'move'
  | 'flow'
  | 'customer';

interface ColorAct {
  borderColor: string;
  backgroundColor: string;
}
interface VisionAct {
  visibility: string;
}
interface TextAct {
  content: string;
}
export interface Motion {
  type: MotionType;
  nca: Boolean;
  when: When[];
  action: any;
  // action: ColorAct | VisionAct | TextAct;
}

export interface When {
  dataName: string;
  dataId: string;
  min: number;
  max: number;
  relation: string;
}
export interface PointVal {
  dataId: string;
  value: number;
}
export enum MotionAction {
  COLOR = 'color',
  VISION = 'vision',
  TEXT = 'text',
  BLINK = 'blink',
  IMAGE = 'image',
  ROTATE = 'rotate',
  FILL = 'fill',
  MOVE = 'move',
  FLOW = 'flow',
  CUSTOMER = 'customer',
}

export enum LogicType {
  AND = 'and',
  OR = 'or',
}
// 实现图元与动效的多对多的映射关系
// 图元类型与图元分类的对应
const PenMotionType = {
  text: ['text', 'newText'],
  shape: ['circle', 'rectangle', 'square', 'pentagon', 'line-line-irregularFigure'],
  line: ['line-line-default','line-line-eulerhabd', 'line-curve-undefined', 'arcLine'],
  connectline: ['line-line-connectLine', 'line-polyline-connectLine', 'line-curve-connectLine'],
  image: ['image'],
}
// 图元分类与动效的对应
const PenMotionMap = {
  text: [MotionAction.COLOR, MotionAction.VISION, MotionAction.TEXT, MotionAction.BLINK, MotionAction.ROTATE, MotionAction.MOVE],
  shape: [MotionAction.COLOR, MotionAction.VISION, MotionAction.BLINK, MotionAction.ROTATE, MotionAction.FILL, MotionAction.MOVE],
  line: [MotionAction.COLOR, MotionAction.VISION, MotionAction.BLINK, MotionAction.ROTATE, MotionAction.MOVE],
  connectline: [MotionAction.FLOW],
  image: [MotionAction.VISION, MotionAction.BLINK, MotionAction.IMAGE, MotionAction.ROTATE, MotionAction.MOVE],
}
export enum MotionWhenType {
  ISWHEN=0,
  ISMUILT,
  ISNCA,
}
// 实现图元与触发条件的映射关系
// 数组的第一个元素代表 是否支持创建动画条件，数组的第二个元素代表 是否支持创建多个动画场景，数组的第三个元素代表 是否支持无条件动画
// 这里为了后续判断的统一，数组都是固定3个元素
export const MotionWhenMap = {
  color: [true, true,],
  vision: [true, true,],
  text: [true, true,],
  blink: [true, true, true],
  image: [true, true, true],
  rotate: [true, true, true],
  fill: [true, ,],
  move: [true, ,],
  flow: [true, true, true],
}

/**
 * @description 根据图元类型，获取所属图元分类的动画类型
 * @author Joseph Ho
 * @date 27/10/2023
 * @export
 * @param {string} name 图元名称
 * @returns {*}  
 */
export function getMotionsByName(name: string) {
  const key = findKeyByValue(PenMotionType, name);
  if (key) {
    return PenMotionMap[key];
  }
}
function findKeyByValue(obj, value) {
  for (let key in obj) {
    if (obj[key].indexOf(value) !== -1) {
      return key;
    }
  }
  return null;
}