import { CheckCircle2 } from 'lucide-react';

const steps = [
  {
    number: '01',
    title: 'Pick a template',
    description: 'Choose a design starting point built for campaign, brand, or product work.',
  },
  {
    number: '02',
    title: 'Customize with AI',
    description: 'Tailor messaging, color, layout, and branding in minutes with guided creative help.',
  },
  {
    number: '03',
    title: 'Publish or print',
    description: 'Share the final asset online or send it straight into your print production workflow.',
  },
];

export default function Workflow() {
  return (
    <section className="py-20 md:py-28">
      <div className="container-shell">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="section-title">A faster creative workflow</h2>
          <p className="section-copy mx-auto">From blank canvas to publish-ready output in three simple steps.</p>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {steps.map((step, index) => (
            <div key={step.number} className="relative">
              <div className="glass-card p-6">
                <div className="mb-4 flex items-center justify-between">
                  <span className="text-4xl font-black text-[#eab308]/25">{step.number}</span>
                  <CheckCircle2 className="text-[#008080]" size={28} />
                </div>
                <h3 className="text-xl font-bold text-slate-900">{step.title}</h3>
                <p className="mt-3 text-sm leading-6 text-slate-600">{step.description}</p>
              </div>
              {index < steps.length - 1 && (
                <div className="hidden md:block absolute right-[-18px] top-1/2 -translate-y-1/2 text-3xl text-[#008080]/30">
                  →
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
