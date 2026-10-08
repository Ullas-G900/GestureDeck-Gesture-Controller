import type { Hand, Point3 } from './features';
export type Detector={detect(video:HTMLVideoElement,time:number):Hand|null;close():void};
type VisionModule={FilesetResolver:{forVisionTasks(url:string):Promise<unknown>};HandLandmarker:{createFromOptions(fileset:unknown,opts:unknown):Promise<any>}};
const WASM='https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/wasm';
const MODEL='https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task';
export async function createDetector():Promise<Detector>{
  const moduleUrl:string='https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/+esm';
  const vision=await import(/* @vite-ignore */ moduleUrl) as VisionModule;
  const files=await vision.FilesetResolver.forVisionTasks(WASM);
  let landmarker:any;
  try { landmarker=await vision.HandLandmarker.createFromOptions(files,{baseOptions:{modelAssetPath:MODEL,delegate:'GPU'},runningMode:'VIDEO',numHands:1});}
  catch {landmarker=await vision.HandLandmarker.createFromOptions(files,{baseOptions:{modelAssetPath:MODEL,delegate:'CPU'},runningMode:'VIDEO',numHands:1});}
  return {detect(video,time){const result=landmarker.detectForVideo(video,time);const raw=result.landmarks?.[0];return raw?raw.map((p:any)=>({x:1-p.x,y:p.y,z:p.z??0} as Point3)):null;},close(){landmarker.close();}};
}
