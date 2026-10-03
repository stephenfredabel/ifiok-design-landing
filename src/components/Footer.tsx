import { ArrowRight } from 'lucide-react';

export default function FinalCTA() {
  return (
    <section className="bg-gradient-to-r from-[#008080] to-[#0f172a] py-20 md:py-28">
      <div className="container-shell">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="text-3xl font-black tracking-tight text-white sm:text-5xl">
            Ready to build your next standout design?
          </h2>
          <p className="mt-5 text-lg text-slate-200">
            Join the growing team moving faster with Ifiok Design.
          </p>
          <div className="mt-10 flex flex-col justify-center gap-4 sm:flex-row">
            <button className="primary-btn bg-white text-[#008080] hover:bg-slate-100">
              Start free
              <ArrowRight size={18} />
            </button>
            <button className="secondary-btn border-white bg-transparent text-white hover:bg-white/10 hover:text-white">
              Book a demo
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
