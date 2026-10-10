import { AlertTriangle, X } from 'lucide-react';

type CallNurseBannerProps = {
  active: boolean;
  onDismiss: () => void;
};

export function CallNurseBanner({ active, onDismiss }: CallNurseBannerProps) {
  if (!active) return null;

  return (
    <section
      role="alert"
      aria-live="assertive"
      aria-atomic="true"
      aria-label="Simulated nurse call alert"
      className="w-full animate-pulse border-y border-red-200/40 bg-[#a91f32] text-white shadow-[0_8px_30px_rgba(127,29,43,.32)]"
    >
      <div className="mx-auto flex max-w-[1560px] flex-wrap items-center justify-between gap-4 px-4 py-4 sm:px-6">
        <div className="flex min-w-0 items-center gap-3">
          <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-white/35 bg-white/10">
            <AlertTriangle size={23} aria-hidden="true" />
          </div>
          <div className="min-w-0">
            <div className="text-[10px] font-extrabold uppercase tracking-[.16em] text-red-100">
              Simulated care-mode alert
            </div>
            <h2 className="mt-0.5 text-xl font-extrabold leading-tight tracking-tight sm:text-2xl">
              Call Nurse
            </h2>
            <p className="mt-1 text-xs font-semibold text-red-50/90">
              Demo status only · No call has been placed
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={onDismiss}
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-white/60 bg-white px-4 py-2 text-sm font-extrabold text-[#811b2b] transition-colors hover:bg-red-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#a91f32]"
          aria-label="Dismiss simulated Call Nurse alert"
        >
          <X size={16} aria-hidden="true" />
          Dismiss
        </button>
      </div>
    </section>
  );
}
