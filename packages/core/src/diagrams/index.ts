export * from './rectangle';
export * from './circle';
export * from './svgPath';
export * from './diamond';
export * from './triangle';
export * from './pentagon';
export * from './pentagram';
export * from './hexagon';
export * from './arrow';
export * from './message';
export * from './cloud';
export * from './file';
export * from './cube';
export * from './people';
export * from './line';
export * from './iframe';
export * from './video';
export * from './panel';
export * from './uml/usecase/participant';
export * from './uml/usecase/usecase';
export * from './uml/usecase/childsys';
export * from './uml/activity/action';
export * from './uml/activity/judgement';
export * from './uml/activity/merge';
export * from './uml/activity/initial';
export * from './uml/activity/terminate';
export * from './uml/activity/branch';
export * from './uml/activity/converge';
export * from './uml/activity/swimlane';
export * from './uml/activity/comment';
export * from './uml/deployment/node';
export * from './uml/deployment/nodeexample';
export * from './uml/deployment/project';
export * from './uml/deployment/projectexample';
export * from './uml/deployment/deployspec';
export * from './uml/deployment/deployspecexample';
export * from './uml/deployment/component';
export * from './uml/deployment/componentexample';
export * from './uml/deployment/pack';
export * from './uml/sequence/lifeline';
export * from './uml/sequence/recyclefragment';
export * from './uml/sequence/otherfragment';
export * from './uml/sequence/selectfragment';
export * from './uml/communication/lifelineC';
export * from './uml/communication/comoverview';
export * from './uml/sequence/plifeline';
export * from './uml/sequence/backupfragment';
export * from './uml/sequence/cond';
export * from './uml/state/terminate1';
export * from './uml/state/title';
export * from './uml/state/titlec';
export * from './uml/state/status1';
export * from './uml/state/istatus';
export * from './uml/state/cstatus';
export * from './uml/state/substatus';
export * from './uml/class/divider';
export * from './uml/class/member';
export * from './uml/class/class1';
export * from './uml/class/interface1';
export * from './uml/class/enum1';
export * from './uml/deployment/supplyinterface';
export * from './uml/deployment/needinterface';
export * from './uml/deployment/arc';
export * from './uml/deployment/vtext';
export * from './uml/deployment/reloverview';

import { rectangle, square } from './rectangle';
import { circle } from './circle';
import { svgPath } from './svgPath';
import { diamond } from './diamond';
import { triangle, triangleAnchors } from './triangle';
import { pentagon, pentagonAnchors } from './pentagon';
import { pentagram, pentagramAnchors } from './pentagram';
import { hexagon } from './hexagon';
import { leftArrow, rightArrow, twowayArrow } from './arrow';
import { message } from './message';
import { cloud } from './cloud';
import { file } from './file';
// import { cube } from './cube';
import { people } from './people';
import { line } from './line';
import { iframe } from './iframe';
import { video } from './video';
import { gif } from './gif';
import { mindNode, mindNodeAnchors } from './mindNode';
import { mindLine, mindLineAnchors } from './mindLine';
import { panel } from './panel';
import { usecase } from './uml/usecase/usecase';
import { participant } from './uml/usecase/participant';
import { childsys } from './uml/usecase/childsys';
import { action } from './uml/activity/action';
import { judgement } from './uml/activity/judgement';
import { merge } from './uml/activity/merge';
import { initial } from './uml/activity/initial';
import { terminate } from './uml/activity/terminate';
import { branch } from './uml/activity/branch';
import { converge } from './uml/activity/converge';
import { swimlane } from './uml/activity/swimlane';
import { comment,commentAnchors } from './uml/activity/comment';
import { deployspec } from './uml/deployment/deployspec';
import { deployspecexample } from './uml/deployment/deployspecexample';
import { component } from './uml/deployment/component';
import { componentexample } from './uml/deployment/componentexample';
import { project } from './uml/deployment/project';
import { projectexample } from './uml/deployment/projectexample';
import { lifelineC } from './uml/communication/lifelineC';
import { participantC } from './uml/communication/participantC';
import { supplyinterfaceAnchors } from './uml/deployment/supplyinterface';
// import { lifelineAnchors } from './uml/sequence/lifeline';
// import { plifelineAnchors } from './uml/sequence/plifeline';
import { needinterfaceAnchors } from './uml/deployment/needinterface';
import { arc } from './uml/deployment/arc';

export function commonPens() {
  return {
    rectangle,
    square,
    circle,
    svgPath,
    diamond,
    triangle,
    pentagon,
    pentagram,
    hexagon,
    leftArrow,
    rightArrow,
    twowayArrow,
    message,
    cloud,
    file,
    people,
    line,
    iframe,
    video,
    gif,
    mindNode,
    mindLine,
    mindNode2:rectangle,
    panel,
    usecase,
    participant,
    childsys,
    action,
    judgement,
    merge,
    initial,
    terminate,
    branch,
    converge,
    comment,
    deployspec,
    deployspecexample,
    component,
    componentexample,
    project,
    projectexample,
    lifelineC,
    "participant-c": participantC,
    arc
  };
}

export function commonAnchors() {
  return {
    triangle: triangleAnchors,
    pentagon: pentagonAnchors,
    pentagram: pentagramAnchors,
    mindNode: mindNodeAnchors,
    mindLine: mindLineAnchors,
    supplyinterface: supplyinterfaceAnchors,
    needinterface: needinterfaceAnchors,
    comment: commentAnchors,
    // lifeline: lifelineAnchors,
    // plifeline: plifelineAnchors,
  };
}
