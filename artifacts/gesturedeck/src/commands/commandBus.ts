export type Command='Pause'|'Play'|'Previous'|'Next'|'Stop'|'Volume up'|'Volume down'|'Mute'|'Seek'|'Rotate'|'Start'|'Exit fullscreen';
export type CommandEvent={command:Command;gesture:string;at:number;confidence:number};
type Listener=(event:CommandEvent)=>void;
class Bus {
  private listeners=new Set<Listener>();
  subscribe(listener:Listener){this.listeners.add(listener);return()=>this.listeners.delete(listener);}
  emit(command:Command,gesture='Keyboard',confidence=1){const event={command,gesture,confidence,at:Date.now()};this.listeners.forEach(fn=>fn(event));return event;}
}
export const commandBus=new Bus();
