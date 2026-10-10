import { Bot, Fan, Lightbulb } from 'lucide-react';
import type { ReactNode } from 'react';
import type { VirtualDevices } from '../apps/VirtualDevices';

type VirtualDevicesPanelProps = {
  devices: VirtualDevices;
  onToggle: (device: keyof VirtualDevices) => void;
};

export function VirtualDevicesPanel({ devices, onToggle }: VirtualDevicesPanelProps) {
  return (
    <div>
      <div className="mb-4">
        <div className="eyebrow">LOCAL CARE SIMULATION</div>
        <h2 className="mt-1 text-lg font-extrabold">Virtual Devices</h2>
        <p className="mt-1 text-xs leading-5 text-slate-400">
          Gesture-controlled examples only. No physical devices are connected.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <DeviceCard
          title="LED bulb"
          detail="Virtual bedside light"
          active={devices.lamp}
          icon={<Lightbulb size={22} className={devices.lamp ? 'animate-pulse text-amber-200' : 'text-slate-500'} />}
          onToggle={() => onToggle('lamp')}
        />
        <DeviceCard
          title="Desk fan"
          detail="Virtual airflow control"
          active={devices.fan}
          icon={<Fan size={22} className={devices.fan ? 'animate-spin text-cyan-200' : 'text-slate-500'} />}
          onToggle={() => onToggle('fan')}
        />
      </div>

      <div className="mt-3 flex items-center gap-3 rounded-xl border border-white/7 bg-[#0a1929] px-4 py-3">
        <div className="grid h-10 w-10 place-items-center rounded-xl bg-cyan-200/[.07] text-cyan-200">
          <Bot size={21} aria-hidden="true" />
        </div>
        <div>
          <div className="text-sm font-bold">Care companion</div>
          <div className="text-[10px] text-slate-500">Simulated robot status · ready</div>
        </div>
        <span className="ml-auto chip"><i className="dot live" />Local</span>
      </div>

      <div className="mt-4 rounded-xl border border-white/5 bg-white/[.025] p-3 text-[10px] leading-5 text-slate-500">
        Thumbs Up starts the light, Closed Fist stops devices, and Circle gestures toggle the fan
        in Bedside Patient mode.
      </div>
    </div>
  );
}

function DeviceCard({
  title,
  detail,
  active,
  icon,
  onToggle,
}: {
  title: string;
  detail: string;
  active: boolean;
  icon: ReactNode;
  onToggle: () => void;
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-white/7 bg-[#0a1929] px-4 py-3">
      <div className={`grid h-10 w-10 place-items-center rounded-xl ${active ? 'bg-cyan-200/10' : 'bg-white/[.03]'}`}>
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <div className="text-sm font-bold">{title}</div>
        <div className="text-[10px] text-slate-500">{detail}</div>
      </div>
      <button
        type="button"
        className={`btn ${active ? 'btn-primary' : ''}`}
        aria-pressed={active}
        onClick={onToggle}
      >
        {active ? 'On' : 'Off'}
      </button>
    </div>
  );
}
