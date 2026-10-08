export type Point3 = { x: number; y: number; z: number };
export type Hand = Point3[];
export const CONNECTIONS: [number, number][] = [
  [0,1],[1,2],[2,3],[3,4],[0,5],[5,6],[6,7],[7,8],[5,9],[9,10],[10,11],[11,12],
  [9,13],[13,14],[14,15],[15,16],[13,17],[17,18],[18,19],[19,20],[0,17],
];
export function distance(a: Point3, b: Point3): number {
  return Math.hypot(a.x-b.x,a.y-b.y,a.z-b.z);
}
export function handScale(hand: Hand): number { return Math.max(.0001, distance(hand[0], hand[9])); }
export function normalizedFeatures(hand: Hand): number[] {
  const s=handScale(hand), wrist=hand[0];
  return hand.flatMap(p=>[(p.x-wrist.x)/s,(p.y-wrist.y)/s,(p.z-wrist.z)/s]);
}
export function smoothHand(previous: Hand | null, next: Hand, alpha=.42): Hand {
  if (!previous || previous.length!==next.length) return next.map(p=>({...p}));
  return next.map((p,i)=>({x:previous[i].x+(p.x-previous[i].x)*alpha,y:previous[i].y+(p.y-previous[i].y)*alpha,z:previous[i].z+(p.z-previous[i].z)*alpha}));
}
export function extendedFingers(hand: Hand): boolean[] {
  const s=handScale(hand);
  // Compare tip and PIP reach from wrist, normalized by palm length; unlike an up/down test this also works for sideways pointing.
  return [false,...[8,12,16,20].map((tip,i)=>{
    const pip=[6,10,14,18][i];
    return distance(hand[0],hand[tip]) > distance(hand[0],hand[pip])*1.12 && distance(hand[pip],hand[tip])/s > .2;
  })];
}
export function thumbExtended(hand: Hand): boolean {
  const scale=handScale(hand);
  const proximal={x:hand[3].x-hand[2].x,y:hand[3].y-hand[2].y,z:hand[3].z-hand[2].z};
  const distal={x:hand[4].x-hand[3].x,y:hand[4].y-hand[3].y,z:hand[4].z-hand[3].z};
  const proximalLength=distance(hand[2],hand[3]);
  const distalLength=distance(hand[3],hand[4]);
  const alignment=(proximal.x*distal.x+proximal.y*distal.y+proximal.z*distal.z)/(proximalLength*distalLength||1);
  // Judge the thumb by its own MCP→IP→tip axis, not screen-x, so mirrored and rotated hands behave consistently.
  return distalLength/scale>.16 && distance(hand[2],hand[4])>proximalLength*1.22 && alignment>.12;
}
export function classifyStatic(hand: Hand): {name:string; confidence:number} | null {
  if (hand.length<21) return null;
  const ext=extendedFingers(hand), count=ext.slice(1).filter(Boolean).length;
  const palm=handScale(hand);
  const thumbOut=thumbExtended(hand);
  if (count===4 && thumbOut) return {name:'Open Palm',confidence:.91};
  if (count===0 && !thumbOut) return {name:'Closed Fist',confidence:.88};
  if (ext[1] && ext[2] && !ext[3] && !ext[4]) return {name:'Victory',confidence:.88};
  if (ext[1] && !ext[2] && !ext[3] && !ext[4]) {
    if (hand[8].x < hand[5].x-.35*palm) return {name:'Point Left',confidence:.84};
    if (hand[8].x > hand[5].x+.35*palm) return {name:'Point Right',confidence:.84};
    return {name:'Point',confidence:.68};
  }
  if (thumbOut && count<=1 && hand[4].y < hand[3].y-.24*palm) return {name:'Thumbs Up',confidence:.86};
  return null;
}
export function signedCircularity(points: {x:number;y:number}[]): number {
  if(points.length<8)return 0;
  const cx=points.reduce((s,p)=>s+p.x,0)/points.length,cy=points.reduce((s,p)=>s+p.y,0)/points.length;
  let angle=0;
  for(let i=1;i<points.length;i++){
    const a=Math.atan2(points[i-1].y-cy,points[i-1].x-cx),b=Math.atan2(points[i].y-cy,points[i].x-cx);
    let d=b-a;while(d>Math.PI)d-=2*Math.PI;while(d< -Math.PI)d+=2*Math.PI;angle+=d;
  }
  return angle;
}
export function circularity(points: {x:number;y:number}[]): number { return Math.abs(signedCircularity(points)); }
