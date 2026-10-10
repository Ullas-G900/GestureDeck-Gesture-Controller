import { useEffect, useRef } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Maximize,
  Pause,
  Play,
  RotateCw,
  Square,
  ZoomIn,
  ZoomOut,
} from 'lucide-react';

type MedicalViewerProps = {
  slice: number;
  sliceCount: number;
  zoom: number;
  rotation: number;
  playing: boolean;
  onPrevious: () => void;
  onNext: () => void;
  onPlayPause: () => void;
  onStop: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onRotate: () => void;
};

function SyntheticScan({ index, selected }: { index: number; selected: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext('2d');
    if (!canvas || !context) return;

    const width = 640;
    const height = 420;
    canvas.width = width;
    canvas.height = height;

    const background = context.createLinearGradient(0, 0, width, height);
    background.addColorStop(0, '#10273a');
    background.addColorStop(0.5, '#071522');
    background.addColorStop(1, '#132d40');
    context.fillStyle = background;
    context.fillRect(0, 0, width, height);

    // Procedural rings and fine grain create a clearly synthetic scan-like image.
    const centerX = width * (0.5 + Math.sin(index * 0.7) * 0.035);
    const centerY = height * 0.49;
    const phase = index * 0.19;
    for (let ring = 0; ring < 30; ring += 1) {
      const radiusX = 30 + ring * 7.1;
      const radiusY = 22 + ring * 4.65;
      context.beginPath();
      context.ellipse(centerX, centerY, radiusX, radiusY, phase * 0.12, 0, Math.PI * 2);
      context.strokeStyle = `rgba(135, 210, 221, ${0.016 + (ring % 4) * 0.008})`;
      context.lineWidth = ring % 5 === 0 ? 2 : 1;
      context.stroke();
    }

    const anatomy = context.createRadialGradient(centerX, centerY, 10, centerX, centerY, 155);
    anatomy.addColorStop(0, 'rgba(185, 225, 224, 0.34)');
    anatomy.addColorStop(0.22, 'rgba(91, 157, 169, 0.27)');
    anatomy.addColorStop(0.62, 'rgba(41, 93, 112, 0.12)');
    anatomy.addColorStop(1, 'rgba(7, 21, 34, 0)');
    context.fillStyle = anatomy;
    context.fillRect(0, 0, width, height);

    // Deterministic local grain; no image files, network requests, or patient data.
    let seed = (index + 1) * 7919;
    const random = () => {
      seed = (seed * 16807) % 2147483647;
      return (seed - 1) / 2147483646;
    };
    for (let speck = 0; speck < 1500; speck += 1) {
      const x = random() * width;
      const y = random() * height;
      context.fillStyle = `rgba(181, 221, 223, ${random() * 0.17})`;
      context.fillRect(x, y, random() * 2 + 0.4, random() * 2 + 0.4);
    }

    context.strokeStyle = 'rgba(94, 217, 229, 0.32)';
    context.lineWidth = 1;
    context.setLineDash([4, 7]);
    context.beginPath();
    context.moveTo(24, centerY);
    context.lineTo(width - 24, centerY);
    context.moveTo(centerX, 22);
    context.lineTo(centerX, height - 22);
    context.stroke();
    context.setLineDash([]);
  }, [index]);

  return (
    <canvas
      ref={canvasRef}
      aria-label={`Synthetic demonstration scan placeholder ${index + 1} of 8`}
      className={`block h-full w-full object-cover transition-opacity duration-200 ${
        selected ? 'opacity-100' : 'opacity-70'
      }`}
    />
  );
}

export function MedicalViewer({
  slice,
  sliceCount,
  zoom,
  rotation,
  playing,
  onPrevious,
  onNext,
  onPlayPause,
  onStop,
  onZoomIn,
  onZoomOut,
  onRotate,
}: MedicalViewerProps) {
  const totalSlices = sliceCount > 0 ? sliceCount : 8;
  const currentSlice = Math.min(Math.max(Math.trunc(slice), 0), 7);
  const zoomLabel = `${Math.round((zoom > 0 ? zoom : 1) * 100)}%`;

  return (
    <section
      aria-label="Synthetic scan demonstration viewer"
      className="overflow-hidden rounded-2xl border border-cyan-100/15 bg-[#091827] shadow-[0_18px_48px_rgba(0,0,0,.22)]"
    >
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 px-4 py-3 sm:px-5">
        <div>
          <div className="eyebrow text-cyan-200">CARE MODE · DEMONSTRATION</div>
          <h2 className="mt-1 text-base font-extrabold tracking-tight text-slate-100">Synthetic scan viewer</h2>
        </div>
        <span className="inline-flex items-center gap-2 rounded-full border border-cyan-200/25 bg-cyan-200/10 px-3 py-1.5 text-xs font-bold text-cyan-100">
          <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-cyan-200" />
          Sterile Mode: touch-free
        </span>
      </header>

      <div className="grid gap-4 p-4 sm:p-5 lg:grid-cols-[minmax(0,1fr)_190px]">
        <div className="min-w-0">
          <div className="relative flex aspect-[16/10] min-h-[230px] items-center justify-center overflow-hidden rounded-xl border border-cyan-100/10 bg-[#06111d] subtle-grid">
            <div className="absolute inset-0 flex items-center justify-center">
              <div
                className="relative aspect-[16/10] w-[min(100%,640px)] overflow-hidden rounded-lg border border-cyan-100/10 shadow-2xl"
                style={{
                  transform: `scale(${Math.min(Math.max(zoom > 0 ? zoom : 1, 0.5), 2.5)}) rotate(${rotation}deg)`,
                  transition: 'transform 240ms ease',
                }}
              >
                {Array.from({ length: 8 }, (_, index) => (
                  <div
                    key={index}
                    className={`absolute inset-0 ${index === currentSlice ? 'z-10' : 'z-0'}`}
                    aria-hidden={index !== currentSlice}
                  >
                    <SyntheticScan index={index} selected={index === currentSlice} />
                  </div>
                ))}
                <div className="pointer-events-none absolute inset-0 z-20 border border-white/[.04]" />
              </div>
            </div>
            <div className="absolute left-3 top-3 z-30 rounded-md border border-white/10 bg-[#071522]/90 px-3 py-2 shadow-lg">
              <div className="eyebrow text-slate-300">CURRENT SLICE</div>
              <div className="mono mt-0.5 text-lg font-medium text-white" aria-live="polite">
                Slice {currentSlice + 1}/{totalSlices}
              </div>
            </div>
            <div className="absolute bottom-3 left-3 z-30 rounded-md border border-amber-200/20 bg-[#071522]/90 px-3 py-2 text-[11px] font-semibold leading-4 text-amber-100">
              Synthetic demo only · Not patient data
            </div>
            <div className="absolute bottom-3 right-3 z-30 rounded-md border border-white/10 bg-[#071522]/90 px-2.5 py-1.5 mono text-[10px] text-slate-200">
              {zoomLabel} · {rotation}°
            </div>
          </div>

          <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2" aria-label="Slice navigation">
              <button className="btn" aria-label="Previous slice" onClick={onPrevious}>
                <ChevronLeft size={16} /> Previous
              </button>
              <button className="btn" aria-label="Next slice" onClick={onNext}>
                Next <ChevronRight size={16} />
              </button>
            </div>
            <div className="flex items-center gap-2" aria-label="Scan display controls">
              <button className="btn !px-2.5" aria-label="Zoom out" onClick={onZoomOut}>
                <ZoomOut size={15} />
              </button>
              <button className="btn !px-2.5" aria-label="Zoom in" onClick={onZoomIn}>
                <ZoomIn size={15} />
              </button>
              <button className="btn !px-2.5" aria-label="Rotate scan" onClick={onRotate}>
                <RotateCw size={15} />
              </button>
              <span className="sr-only" aria-live="polite">
                Zoom {zoomLabel}; rotation {rotation} degrees
              </span>
            </div>
          </div>
        </div>

        <aside aria-label="Synthetic slice thumbnails" className="min-w-0">
          <div className="mb-2 flex items-center justify-between">
            <span className="eyebrow">SLICE STACK</span>
            <span className="mono text-[10px] text-slate-400">08 DEMO FRAMES</span>
          </div>
          <div className="grid grid-cols-4 gap-2 lg:grid-cols-2">
            {Array.from({ length: 8 }, (_, index) => (
              <div
                key={index}
                className={`relative aspect-[4/3] overflow-hidden rounded-lg border ${
                  index === currentSlice
                    ? 'border-cyan-200/70 ring-1 ring-cyan-200/25'
                    : 'border-white/10'
                }`}
                aria-label={`Synthetic frame ${index + 1}${index === currentSlice ? ', current slice' : ''}`}
              >
                <SyntheticScan index={index} selected={index === currentSlice} />
                <span className="absolute bottom-1 right-1 rounded bg-[#06111d]/85 px-1.5 py-0.5 mono text-[9px] text-white">
                  {String(index + 1).padStart(2, '0')}
                </span>
              </div>
            ))}
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              className="btn btn-primary min-w-[92px] !py-2"
              aria-label={playing ? 'Pause playback' : 'Play slices'}
              aria-pressed={playing}
              onClick={onPlayPause}
            >
              {playing ? <Pause size={14} /> : <Play size={14} />}
              {playing ? 'Pause' : 'Play'}
            </button>
            <button className="btn !py-2" aria-label="Stop playback" onClick={onStop}>
              <Square size={13} /> Stop
            </button>
            <span className="sr-only" aria-live="polite">
              Playback {playing ? 'playing' : 'paused'}
            </span>
          </div>
          <div className="mt-3 flex items-start gap-2 border-t border-white/10 pt-3 text-[10px] leading-4 text-slate-400">
            <Maximize size={13} className="mt-0.5 shrink-0 text-cyan-200" aria-hidden="true" />
            <span>Illustrative synthetic imagery for touch-free demo use. Not diagnostic.</span>
          </div>
        </aside>
      </div>
    </section>
  );
}
