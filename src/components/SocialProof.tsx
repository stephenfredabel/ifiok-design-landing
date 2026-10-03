import { ArrowRight, Sparkles } from 'lucide-react';

export default function Hero() {
  return (
    <section id="top" className="relative overflow-hidden pb-16 pt-10 sm:pt-16">
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute left-[-120px] top-20 h-72 w-72 rounded-full bg-[#008080]/10 blur-3xl" />
        <div className="absolute right-[-60px] top-10 h-80 w-80 rounded-full bg-[#eab308]/10 blur-3xl" />
      </div>

      <div className="container-shell grid items-center gap-14 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-8">
          <span className="inline-flex items-center gap-2 rounded-full border border-[#008080]/20 bg-[#008080]/5 px-3 py-1 text-xs font-semibold uppercase tracking-[0.15em] text-[#008080]">
            <Sparkles size={12} />
            AI design workspace
          </span>

          <div className="space-y-5">
            <h1 className="max-w-xl text-balance text-4xl font-black tracking-[-0.06em] text-slate-900 sm:text-5xl lg:text-7xl">
              Design smarter.
              <span className="block bg-gradient-to-r from-[#008080] to-[#0f172a] bg-clip-text text-transparent">
                Print faster.
              </span>
            </h1>
            <p className="max-w-xl text-lg leading-8 text-slate-600 sm:text-xl">
              Create brand assets, social campaigns, pitch decks, and print-ready visuals from one collaborative workspace built for modern teams.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <button className="primary-btn">
              Start designing free
              <ArrowRight size={18} />
            </button>
            <button className="secondary-btn">Watch demo</button>
          </div>

          <div className="grid max-w-lg grid-cols-3 gap-4 border-t border-slate-200 pt-6">
            <div>
              <div className="text-2xl font-black text-[#008080]">10x</div>
              <p className="mt-1 text-sm text-slate-600">faster workflow</p>
            </div>
            <div>
              <div className="text-2xl font-black text-[#008080]">2M+</div>
              <p className="mt-1 text-sm text-slate-600">designs created</p>
            </div>
            <div>
              <div className="text-2xl font-black text-[#008080]">4.9/5</div>
              <p className="mt-1 text-sm text-slate-600">creator rating</p>
            </div>
          </div>
        </div>

        <div className="relative">
          <div className="glass-card relative h-[520px] overflow-hidden p-5">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(0,128,128,0.10),transparent_38%),radial-gradient(circle_at_bottom_right,_rgba(234,179,8,0.14),transparent_35%)]" />

            <div className="relative h-full rounded-[28px] border border-slate-200 bg-white p-4 shadow-[0_25px_60px_rgba(15,23,42,0.12)]">
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded-full bg-[#ef4444]" />
                  <span className="h-3 w-3 rounded-full bg-[#fbbf24]" />
                  <span className="h-3 w-3 rounded-full bg-[#22c55e]" />
                </div>
                <span className="rounded-full bg-[#008080]/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#008080]">
                  Design board
                </span>
              </div>

              <div className="grid gap-4 md:grid-cols-[1.1fr_0.9fr]">
                <div className="rounded-2xl bg-slate-100 p-3">
                  <div className="mb-3 flex items-center justify-between">
                    <span className="text-xs font-medium uppercase tracking-[0.18em] text-slate-500">Template</span>
                    <span className="rounded-full bg-[#eab308]/15 px-2 py-1 text-[10px] font-semibold text-[#a16207]">Brand kit</span>
                  </div>
                  <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-4">
                    <div className="mb-4 h-32 rounded-xl bg-gradient-to-br from-[#008080]/20 via-white to-[#eab308]/20" />
                    <div className="space-y-2">
                      <div className="h-2.5 w-3/4 rounded-full bg-slate-200" />
                      <div className="h-2.5 w-2/4 rounded-full bg-slate-200" />
                      <div className="h-2.5 w-3/5 rounded-full bg-slate-200" />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="rounded-2xl bg-[#008080] p-4 text-white">
                    <div className="text-[10px] uppercase tracking-[0.2em] text-white/80">Campaign</div>
                    <div className="mt-3 text-xl font-bold">Launch Week</div>
                    <div className="mt-4 flex items-center justify-between text-xs text-white/80">
                      <span>Engagement</span>
                      <span>78%</span>
                    </div>
                    <div className="mt-2 h-2 rounded-full bg-white/20">
                      <div className="h-2 w-[78%] rounded-full bg-[#eab308]" />
                    </div>
                  </div>

                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <div className="mb-3 flex items-center justify-between">
                      <span className="text-xs font-medium uppercase tracking-[0.18em] text-slate-500">Quick actions</span>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between rounded-xl bg-white px-3 py-2 text-sm text-slate-700">
                        <span>Resize</span>
                        <span className="text-[#008080]">AI</span>
                      </div>
                      <div className="flex items-center justify-between rounded-xl bg-white px-3 py-2 text-sm text-slate-700">
                        <span>Translate</span>
                        <span className="text-[#008080]">2x</span>
                      </div>
                      <div className="flex items-center justify-between rounded-xl bg-white px-3 py-2 text-sm text-slate-700">
                        <span>Export</span>
                        <span className="text-[#008080]">PDF</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
