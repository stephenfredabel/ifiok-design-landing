import { ArrowRight } from 'lucide-react';

const templates = [
  {
    icon: '📱',
    title: 'Social Posts',
    description: 'Launch-ready creatives for Instagram, LinkedIn, and Facebook.',
    accent: 'from-pink-500 to-rose-500',
  },
  {
    icon: '📊',
    title: 'Pitch Deck',
    description: 'Professional slides built to impress investors and clients.',
    accent: 'from-blue-500 to-cyan-500',
  },
  {
    icon: '🎨',
    title: 'Brand Kit',
    description: 'Keep logos, type, and colors consistent across every asset.',
    accent: 'from-violet-500 to-fuchsia-500',
  },
  {
    icon: '🖨️',
    title: 'Print Ready',
    description: 'Create vendor-ready artwork for cards, flyers, and signage.',
    accent: 'from-[#008080] to-[#0f172a]',
  },
];

export default function Templates() {
  return (
    <section className="py-20 md:py-28">
      <div className="container-shell">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="section-title">Start from a beautiful template</h2>
          <p className="section-copy mx-auto">
            Built for marketing teams, agencies, founders, and creators who need premium results without the bottleneck.
          </p>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {templates.map((template) => (
            <div key={template.title} className="glass-card group p-6">
              <div className={`mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br ${template.accent} text-3xl shadow-lg`}>
                {template.icon}
              </div>
              <h3 className="text-xl font-bold text-slate-900">{template.title}</h3>
              <p className="mt-3 text-sm leading-6 text-slate-600">{template.description}</p>
              <button className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-[#008080] group-hover:text-[#006d6d]">
                Use template
                <ArrowRight size={16} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
