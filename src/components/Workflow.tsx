import { BarChart3, BookOpen, Download, Shield, Users, Zap } from 'lucide-react';

const features = [
  {
    icon: Zap,
    title: 'AI-powered design suggestions',
    description: 'Generate layouts, copy hooks, and visual direction with smart creative support.',
  },
  {
    icon: Users,
    title: 'Real-time collaboration',
    description: 'Bring your team, clients, and vendors into one seamless design flow.',
  },
  {
    icon: Download,
    title: 'Print and export ready',
    description: 'Download in PDF, PNG, SVG, or send directly to your print workflow.',
  },
  {
    icon: BookOpen,
    title: 'Brand kits and templates',
    description: 'Save fonts, colors, and logos so every design stays instantly on-brand.',
  },
  {
    icon: Shield,
    title: 'Fast, secure onboarding',
    description: 'Built for reliability, privacy, and team-level access control.',
  },
  {
    icon: BarChart3,
    title: 'Performance insights',
    description: 'Track engagement, conversion, and campaign reach from one dashboard.',
  },
];

export default function Features() {
  return (
    <section className="bg-white py-20 md:py-28">
      <div className="container-shell">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="section-title">Everything you need to create beautifully</h2>
          <p className="section-copy mx-auto">
            Ifiok Design combines speed, design quality, and production-ready output in a single platform.
          </p>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <div key={feature.title} className="glass-card p-6">
                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-[#008080]/10 text-[#008080]">
                  <Icon size={22} />
                </div>
                <h3 className="text-xl font-bold text-slate-900">{feature.title}</h3>
                <p className="mt-3 text-sm leading-6 text-slate-600">{feature.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
