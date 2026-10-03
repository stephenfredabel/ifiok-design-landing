'use client';

import { Eraser, FileText, IdCard, Palette, Presentation, Printer, QrCode, Sparkles } from 'lucide-react';
import { useState } from 'react';
import { T } from '@/i18n/LangProvider';

type Card = { cls: string; title: string; copy: string; cta: string; href: string; Icon: typeof Printer };
const TABS: { id: string; label: string; Icon: typeof Printer; cards: [Card, Card] }[] = [
  {
    id: 'print',
    label: 'Print',
    Icon: Printer,
    cards: [
      { cls: 'g-teal', title: 'Design at real size, then order the print', copy: 'Inches, 300 DPI, CMYK and bleed from the first click. The price updates as you work.', cta: 'Open the editor', href: 'https://designs.ifiok.ng/editor', Icon: Printer },
      { cls: 'g-gold', title: 'Make ID cards for a whole team', copy: 'Upload a sheet of names and photos. Get one card per person.', cta: 'Try bulk ID cards', href: 'https://designs.ifiok.ng/editor', Icon: IdCard },
    ],
  },
  {
    id: 'ai',
    label: 'AI',
    Icon: Sparkles,
    cards: [
      { cls: 'g-plum', title: 'Describe it. Get a layout you can edit.', copy: 'Not a flat picture. Every word and shape stays editable.', cta: 'Design with AI', href: 'https://designs.ifiok.ng/editor', Icon: Sparkles },
      { cls: 'g-red', title: 'Remove a background in one tap', copy: 'Shoot your product on any table and drop it in.', cta: 'Remove background', href: 'https://designs.ifiok.ng/editor', Icon: Eraser },
    ],
  },
  {
    id: 'docs',
    label: 'Documents',
    Icon: FileText,
    cards: [
      { cls: 'g-blue', title: 'Open PDF and PowerPoint files and keep editing', copy: 'Text stays text. Export back to PowerPoint when you are done.', cta: 'Open a file', href: 'https://designs.ifiok.ng/editor', Icon: Presentation },
      { cls: 'g-teal', title: 'Letters, CVs and forms, signed and filled', copy: 'Sign and fill PDFs in the same account.', cta: 'Open the document editor', href: 'https://designs.ifiok.ng/editor', Icon: FileText },
    ],
  },
  {
    id: 'mkt',
    label: 'Marketing',
    Icon: Palette,
    cards: [
      { cls: 'g-gold', title: 'Trackable QR codes and a Link in Bio page', copy: 'See scans and clicks for every campaign.', cta: 'Make a QR code', href: 'https://ifiok.ng/tools/qr-code-generator', Icon: QrCode },
      { cls: 'g-plum', title: 'A brand kit your whole team shares', copy: 'Logos, cards and letterheads that use the same colours and fonts.', cta: 'Build a brand kit', href: 'https://designs.ifiok.ng/editor', Icon: Palette },
    ],
  },
];

export default function FeatureTabs() {
  const [tab, setTab] = useState('print');
  const cur = TABS.find((x) => x.id === tab)!;
  return (
    <>
      <div className="tabbar">
        <div className="tabs" role="tablist" aria-label="What you can make">
          {TABS.map(({ id, label, Icon }) => (
            <button key={id} type="button" role="tab" aria-selected={tab === id} onClick={() => setTab(id)}>
              <Icon aria-hidden="true" /> {label}
            </button>
          ))}
        </div>
      </div>
      <div className="gcards" role="tabpanel">
        {cur.cards.map((c) => (
          <div key={c.title} className={`gcard ${c.cls}`}>
            <h3>{c.title}</h3>
            <p>{c.copy}</p>
            <a className="btn" href={c.href}>{c.cta}</a>
            <span className="art" aria-hidden="true"><c.Icon strokeWidth={1.2} /></span>
          </div>
        ))}
      </div>
    </>
  );
}
