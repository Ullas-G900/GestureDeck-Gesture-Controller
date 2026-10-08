import test from 'node:test';
import assert from 'node:assert/strict';
import { distance, normalizedFeatures, circularity, thumbExtended, type Hand, type Point3 } from './features';
import { DynamicClassifier } from './dynamicClassifier';

function handAt(scale=1):Hand {
  const points:Point3[]=Array.from({length:21},()=>({x:.5,y:.5,z:0}));
  points[0]={x:.5,y:.85,z:0};points[9]={x:.5,y:.52,z:0};
  return points.map((p,i)=>({x:.5+(p.x+(i%4)*.02-.5)*scale,y:.5+(p.y+(i%5)*.01-.5)*scale,z:p.z*scale}));
}
test('landmark distance and normalized feature vector are stable',()=>{
  assert.equal(distance({x:0,y:0,z:0},{x:3,y:4,z:0}),5);
  const h=handAt();const f=normalizedFeatures(h);
  assert.equal(f.length,63);assert.equal(f[0],0);assert.equal(f[1],0);
  const scaled=handAt(2);const a=normalizedFeatures(h),b=normalizedFeatures(scaled);
  assert.ok(a.every((v,i)=>Math.abs(v-b[i])<1e-8));
});
test('thumb extension is evaluated along the thumb joints rather than screen direction',()=>{
  const hand=handAt();
  hand[2]={x:.46,y:.62,z:0};
  hand[3]={x:.42,y:.58,z:0};
  hand[4]={x:.38,y:.54,z:0};
  assert.equal(thumbExtended(hand),true);
  hand[4]={x:.46,y:.60,z:0};
  assert.equal(thumbExtended(hand),false);
});
test('dynamic detector recognizes directional swipes after a stable window',()=>{
  const d=new DynamicClassifier();let result=null;
  for(let i=0;i<15;i++)result=d.push({x:.9-i*.045,y:.5,z:0})||result;
  assert.equal(result,'Swipe Left');
  const reverse=new DynamicClassifier();let other=null;
  for(let i=0;i<15;i++)other=reverse.push({x:.1+i*.045,y:.5,z:0})||other;
  assert.equal(other,'Swipe Right');
});
test('dynamic detector distinguishes circular movement',()=>{
  const d=new DynamicClassifier();let result=null;
  for(let i=0;i<15;i++){const angle=i*Math.PI*2/14;result=d.push({x:.5+Math.cos(angle)*.12,y:.5+Math.sin(angle)*.12,z:0})||result;}
  assert.ok(circularity(Array.from({length:15},(_,i)=>({x:.5+Math.cos(i*Math.PI*2/14)*.12,y:.5+Math.sin(i*Math.PI*2/14)*.12})))>Math.PI*1.2);
  assert.equal(result,'Circle CW');
  const clockwise=new DynamicClassifier();let clockwiseResult=null;
  for(let i=0;i<15;i++){const angle=-i*Math.PI*2/14;clockwiseResult=clockwise.push({x:.5+Math.cos(angle)*.12,y:.5+Math.sin(angle)*.12,z:0})||clockwiseResult;}
  assert.equal(clockwiseResult,'Circle CCW');
});
