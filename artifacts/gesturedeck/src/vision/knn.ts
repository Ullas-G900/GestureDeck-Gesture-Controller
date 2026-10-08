import { normalizedFeatures, type Hand } from './features';
export type TrainingSample={name:string;features:number[]};
export function predictKnn(hand:Hand,samples:TrainingSample[],k=5):{name:string;confidence:number}|null {
  if(!samples.length)return null;
  const f=normalizedFeatures(hand);
  const nearest=samples.map(s=>({name:s.name,d:Math.sqrt(s.features.reduce((n,v,i)=>n+(v-(f[i]??0))**2,0))})).sort((a,b)=>a.d-b.d).slice(0,k);
  if(!nearest.length||nearest[0].d>4.5)return null;
  const votes=new Map<string,number>();nearest.forEach(x=>votes.set(x.name,(votes.get(x.name)||0)+1/(.1+x.d)));
  const [name,weight]=[...votes.entries()].sort((a,b)=>b[1]-a[1])[0];
  return {name,confidence:Math.min(.98,weight/nearest.reduce((n,x)=>n+1/(.1+x.d),0))};
}
