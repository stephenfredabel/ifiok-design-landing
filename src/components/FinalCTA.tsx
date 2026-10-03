const testimonials = [
  {
    text: 'Ifiok Design cut our design time by half. We now produce social, print, and proposal assets from one workspace.',
    name: 'Chioma Okafor',
    role: 'Founder, Kaizen Studio',
    emoji: '✨',
  },
  {
    text: 'Our team finally has one tool for marketing design and print prep. The brand kit workflow is incredibly smooth.',
    name: 'Tunde Adebayo',
    role: 'Marketing Lead, Exult Labs',
    emoji: '🎯',
  },
  {
    text: 'The quality feels premium, and the speed is unmatched. We ship creative work faster without sacrificing polish.',
    name: 'Zainab Bello',
    role: 'Creative Director, Nivea Works',
    emoji: '🚀',
  },
];

export default function Testimonials() {
  return (
    <section className="py-20 md:py-28">
      <div className="container-shell">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="section-title">Loved by creators and growing teams</h2>
          <p className="section-copy mx-auto">The right mix of speed, polish, and collaboration for real business work.</p>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {testimonials.map((item) => (
            <div key={item.name} className="glass-card p-6">
              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-[#008080] to-[#eab308] text-xl shadow-sm">
                {item.emoji}
              </div>
              <p className="text-base leading-7 text-slate-700">“{item.text}”</p>
              <div className="mt-6 border-t border-slate-200 pt-4">
                <p className="font-bold text-slate-900">{item.name}</p>
                <p className="text-sm text-slate-500">{item.role}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
