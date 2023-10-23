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

interface ColorAct{
  borderColor: string;
  backgroundColor: string;
}
interface VisionAct{
  visibility: string;
}
interface TextAct{
  content: string;
}
export interface Motion {
  type: MotionType;
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
