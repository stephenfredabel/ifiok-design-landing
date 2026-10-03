'use client';

import { Check } from 'lucide-react';

const plans = [
  {
    name: 'Free',
    price: '₦0',
    description: 'For creators testing the platform',
    features: ['Access to basic templates', 'Simple exports', 'Limited brand kits'],
    highlighted: false,
  },
  {
    name: 'Pro',
    price: '₦12,000',
    description: 'For freelancers and product teams',
    features: ['Everything in Free', 'AI design suggestions', 'Unlimited exports', 'Advanced brand kits'],
    highlighted: true,
  },
  {
    name: 'Teams',
    price: '₦48,000',
    description: 'For growing companies and agencies',
    features: ['Everything in Pro', 'Unlimited collaborators', 'Admin controls', 'Priority support'],
    highlighted: false,
  },
];

export default function Pricing() {
  return (
    <section className="bg-white py-20 md:py-28">
      <div className="container-shell">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="section-title">Simple pricing for every stage</h2>
          <p className="section-copy mx-auto">Choose the plan that moves your work forward.</p>
        </div>

        <div className="mt-12 grid gap-6 lg:grid-cols-3">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative rounded-[28px] border p-7 ${
                plan.highlighted
                  ? 'border-[#008080] bg-gradient-to-br from-[#008080]/5 to-[#eab308]/10 shadow-[0_28px_70px_rgba(0,128,128,0.12)]'
                  : 'border-slate-200 bg-slate-50'
              }`}
            >
              {plan.highlighted && (
                <span className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#008080] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-white">
                  Most popular
                </span>
              )}

              <div className="space-y-2">
                <h3 className="text-2xl font-bold text-slate-900">{plan.name}</h3>
                <p className="text-sm text-slate-600">{plan.description}</p>
              </div>

              <div className="mt-6 flex items-end gap-1">
                <span className="text-4xl font-black tracking-tight text-slate-900">{plan.price}</span>
                <span className="pb-1 text-sm text-slate-500">/ month</span>
              </div>

              <button className={plan.highlighted ? 'primary-btn mt-6 w-full' : 'secondary-btn mt-6 w-full'}>
                Get started
              </button>

              <ul className="mt-8 space-y-4">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3 text-sm text-slate-700">
                    <Check size={18} className="mt-0.5 shrink-0 text-[#008080]" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
