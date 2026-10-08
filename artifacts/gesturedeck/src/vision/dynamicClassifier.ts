import { signedCircularity, type Point3 } from './features';
export type DynamicResult='Swipe Left'|'Swipe Right'|'Swipe Up'|'Swipe Down'|'Circle CW'|'Circle CCW'|null;
export class DynamicClassifier {
  private points:Point3[]=[];
  push(point:Point3):DynamicResult {
    this.points.push(point);if(this.points.length>15)this.points.shift();
    if(this.points.length<12)return null;
    const a=this.points[0],b=this.points[this.points.length-1],dx=b.x-a.x,dy=b.y-a.y;
    if(Math.hypot(dx,dy)>.32) {
      this.points=[b];
      if(Math.abs(dx)>Math.abs(dy))return dx<0?'Swipe Left':'Swipe Right';
      return dy<0?'Swipe Up':'Swipe Down';
    }
    const pts=this.points.map(p=>({x:p.x,y:p.y}));
    const circ=signedCircularity(pts);
    if(Math.abs(circ)>Math.PI*1.2){this.points=[b];return circ>0?'Circle CW':'Circle CCW';}
    return null;
  }
  reset(){this.points=[];}
}
