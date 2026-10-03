const partners = ['Notion', 'Stripe', 'Shopify', 'Figma', 'Dropbox'];

export default function SocialProof() {
  return (
    <section className="border-y border-slate-200 bg-white py-8 md:py-10">
      <div className="container-shell">
        <p className="mb-8 text-center text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
          Trusted by modern teams
        </p>
        <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-4 text-sm font-semibold text-slate-500 md:gap-x-12">
          {partners.map((partner) => (
            <div key={partner} className="opacity-80 hover:text-[#008080]">
              {partner}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
