import { useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, FileUp, Presentation, Trash2 } from 'lucide-react';
import { loadImportedPresentation, type ImportedPresentation } from '../apps/importedPresentation';
import { slides } from '../apps/Slides';

const ACCEPTED_FILES = '.pdf,.pptx,.png,.jpg,.jpeg,.webp,.gif,.bmp';

type PresentationViewerProps = {
  slide: number;
  onSlideChange: (slide: number) => void;
  imported: ImportedPresentation | null;
  onImportedChange: (presentation: ImportedPresentation | null) => void;
  isPresenting: boolean;
  onPresent: () => void;
};

function ImportedSlideRenderer({
  presentation,
  index,
}: {
  presentation: ImportedPresentation;
  index: number;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [loading, setLoading] = useState(presentation.kind !== 'images');
  const [error, setError] = useState('');

  useEffect(() => {
    if (presentation.kind === 'images') {
      setLoading(false);
      setError('');
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;

    let active = true;
    let renderTask: { cancel: () => void } | null = null;
    setLoading(true);
    setError('');

    const render = async () => {
      if (presentation.kind === 'pdf') {
        const page = await presentation.document.getPage(index + 1);
        if (!active) return;
        const baseViewport = page.getViewport({ scale: 1 });
        const viewport = page.getViewport({
          scale: Math.min(1.5, 1200 / baseViewport.width),
        });
        const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
        const context = canvas.getContext('2d', { alpha: false });
        if (!context) throw new Error('This browser could not create a PDF canvas.');
        canvas.width = Math.round(viewport.width * pixelRatio);
        canvas.height = Math.round(viewport.height * pixelRatio);
        canvas.style.width = '100%';
        canvas.style.height = 'auto';
        const task = page.render({
          canvas,
          canvasContext: context,
          viewport,
          transform:
            pixelRatio === 1 ? undefined : [pixelRatio, 0, 0, pixelRatio, 0, 0],
        });
        renderTask = task;
        await task.promise;
      } else {
        const output = document.createElement('canvas');
        await presentation.renderer.renderSlide(index, output, 1200);
        if (!active) return;
        canvas.width = output.width;
        canvas.height = output.height;
        canvas.style.width = '100%';
        canvas.style.height = 'auto';
        const context = canvas.getContext('2d');
        if (!context) throw new Error('This browser could not create a slide canvas.');
        context.clearRect(0, 0, canvas.width, canvas.height);
        context.drawImage(output, 0, 0);
      }
    };

    void render()
      .then(() => {
        if (active) setLoading(false);
      })
      .catch((reason: unknown) => {
        if (!active) return;
        const message =
          reason instanceof Error ? reason.message : 'Could not render this page.';
        if (message.includes('RenderingCancelledException')) return;
        setError(message);
        setLoading(false);
      });

    return () => {
      active = false;
      renderTask?.cancel();
    };
  }, [index, presentation]);

  if (presentation.kind === 'images') {
    return (
      <div className="relative grid h-full w-full place-items-center">
        <img
          src={presentation.images[index]}
          alt={`Imported image ${index + 1} of ${presentation.pageCount}`}
          className="max-h-full max-w-full object-contain shadow-2xl"
          onError={() => setError('This image could not be displayed.')}
        />
        {error && (
          <div role="alert" className="absolute inset-x-4 bottom-4 rounded-lg border border-red-300/20 bg-red-950/80 p-3 text-center text-xs text-red-100">
            {error}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="relative flex h-full w-full items-center justify-center">
      <canvas
        ref={canvasRef}
        aria-label={`Page ${index + 1} of ${presentation.pageCount}`}
        className={`block max-h-full max-w-full bg-white shadow-2xl ${loading ? 'opacity-0' : 'opacity-100'}`}
      />
      {loading && (
        <div className="absolute inset-0 grid place-items-center text-xs text-slate-400">
          Rendering page…
        </div>
      )}
      {error && (
        <div role="alert" className="absolute inset-x-4 bottom-4 rounded-lg border border-red-300/20 bg-red-950/80 p-3 text-center text-xs text-red-100">
          {error}
        </div>
      )}
    </div>
  );
}

export function PresentationViewer({
  slide,
  onSlideChange,
  imported,
  onImportedChange,
  isPresenting,
  onPresent,
}: PresentationViewerProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [dragging, setDragging] = useState(false);
  const slideCount = imported?.pageCount ?? slides.length;
  const currentSlide = Math.min(Math.max(slide, 0), slideCount - 1);

  const importFiles = async (files: readonly File[]) => {
    if (files.length === 0) return;
    setLoading(true);
    setError('');
    try {
      const next = await loadImportedPresentation(files);
      onImportedChange(next);
      onSlideChange(0);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Could not open those files.');
    } finally {
      setLoading(false);
    }
  };

  const clearImport = () => {
    onImportedChange(null);
    onSlideChange(0);
    setError('');
    if (inputRef.current) inputRef.current.value = '';
  };

  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="eyebrow">GESTURE-CONTROLLED PRESENTATION</div>
          <div className="mt-1 text-xs font-bold text-slate-200">
            {imported?.name ?? 'GestureDeck introduction'} · {slideCount} {imported?.kind === 'pdf' ? 'pages' : 'slides'}
          </div>
          <div className="mt-1 text-[10px] text-slate-500">
            PDF, PowerPoint, or images · files stay in this browser session
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {imported && (
            <button className="btn !py-2" onClick={clearImport} title="Return to the demo slides">
              <Trash2 size={13} /> Demo slides
            </button>
          )}
          <button
            className="btn btn-primary !py-2"
            onClick={() => inputRef.current?.click()}
            disabled={loading}
          >
            <FileUp size={14} /> {loading ? 'Opening…' : 'Add files'}
          </button>
          <input
            ref={inputRef}
            type="file"
            accept={ACCEPTED_FILES}
            multiple
            className="sr-only"
            aria-label="Choose a PDF, PowerPoint, or images"
            onChange={(event) => {
              void importFiles(Array.from(event.currentTarget.files ?? []));
              event.currentTarget.value = '';
            }}
          />
        </div>
      </div>

      {error && (
        <div role="alert" className="mb-3 rounded-lg border border-red-300/20 bg-red-950/35 px-3 py-2 text-xs text-red-100">
          {error}
        </div>
      )}

      <div
        id="slide-stage"
        className={`relative flex aspect-[16/9] min-h-[360px] flex-col items-center justify-center overflow-hidden rounded-xl border bg-[#091522] p-4 sm:p-6 ${dragging ? 'border-cyan-200/70' : 'border-cyan-100/10'}`}
        onDragOver={(event) => {
          event.preventDefault();
          setDragging(true);
        }}
        onDragLeave={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
            setDragging(false);
          }
        }}
        onDrop={(event) => {
          event.preventDefault();
          setDragging(false);
          void importFiles(Array.from(event.dataTransfer.files));
        }}
      >
        {imported ? (
          <ImportedSlideRenderer presentation={imported} index={currentSlide} />
        ) : (
          <>
            <div className="absolute -right-12 -top-20 h-72 w-72 rounded-full border border-cyan-200/10" />
            <div className="absolute -right-3 -top-11 h-52 w-52 rounded-full border border-cyan-200/10" />
            <div className="relative w-full">
              <div className="eyebrow text-cyan-200">{slides[currentSlide].eyebrow}</div>
              <h3 className="mt-5 whitespace-pre-line text-3xl font-extrabold leading-[1.08] tracking-[-.055em] sm:text-4xl">
                {slides[currentSlide].title}
              </h3>
              <p className="mt-5 max-w-sm text-sm leading-6 text-slate-400">
                {slides[currentSlide].body}
              </p>
            </div>
          </>
        )}
        {dragging && (
          <div className="absolute inset-0 z-10 grid place-items-center bg-[#071320]/90 text-sm font-bold text-cyan-100">
            Drop PDF, PowerPoint, or images to open
          </div>
        )}
        {loading && (
          <div className="absolute inset-0 z-10 grid place-items-center bg-[#071320]/80 text-xs text-slate-300">
            Preparing your presentation…
          </div>
        )}
        <div className="absolute bottom-0 left-0 h-[2px] bg-cyan-300 transition-all" style={{ width: `${((currentSlide + 1) / slideCount) * 100}%` }} />
      </div>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
        <div className="mono text-[10px] text-slate-500">
          {String(currentSlide + 1).padStart(2, '0')} / {String(slideCount).padStart(2, '0')}
          {imported?.kind === 'images' ? ` · ${imported.name}` : ''}
        </div>
        <div className="flex items-center gap-2">
          <button
            className="btn"
            aria-label="Previous slide"
            disabled={currentSlide === 0}
            onClick={() => onSlideChange(Math.max(0, currentSlide - 1))}
          >
            <ChevronLeft size={15} />
          </button>
          <button
            className="btn"
            aria-label="Next slide"
            disabled={currentSlide >= slideCount - 1}
            onClick={() => onSlideChange(Math.min(slideCount - 1, currentSlide + 1))}
          >
            <ChevronRight size={15} />
          </button>
          <button className="btn btn-primary" onClick={onPresent}>
            <Presentation size={14} /> {isPresenting ? 'Exit' : 'Present'}
          </button>
        </div>
      </div>
    </div>
  );
}
