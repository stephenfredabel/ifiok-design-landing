/* Sample content for the editor mockup. Nothing here is saved or sent anywhere. */

export const PAGE = { w: 560, h: 792 } as const; // A5 flyer at screen size
export const SAFE = 24; // safe area inside the trim, in the same units

export type ObjType = 'text' | 'shape' | 'image' | 'qr';
export type Obj = {
  id: string; type: ObjType; x: number; y: number; w: number; h: number;
  text?: string; color: string; bg?: string; size?: number; weight?: number; align?: 'left' | 'center' | 'right';
  round?: boolean; label?: string; dpi?: number;
};

let n = 100;
export const uid = () => 'o' + n++;

export const BRAND_COLORS = ['#0B7A7F', '#DAA019', '#B6322B', '#1F3A8A', '#15241F', '#7A1D4A', '#FFFFFF', '#F6F9F8'];

export const START_OBJS: Obj[] = [
  { id: 'a1', type: 'shape', x: -60, y: -60, w: 300, h: 300, color: '#DAA019', bg: '#DAA019', round: true },
  { id: 'a2', type: 'text', x: 40, y: 118, w: 480, h: 130, text: 'GRAND OPENING', color: '#FFFFFF', size: 56, weight: 800, align: 'center' },
  { id: 'a3', type: 'text', x: 60, y: 270, w: 440, h: 40, text: 'Saturday 12 July · 10am', color: '#FFFFFF', size: 24, weight: 500, align: 'center' },
  { id: 'a4', type: 'image', x: 120, y: 340, w: 320, h: 200, color: '#0B7A7F', bg: 'linear-gradient(135deg,#0B7A7F,#14A5AB)', label: 'Photo', dpi: 300 },
  { id: 'a5', type: 'shape', x: 150, y: 560, w: 260, h: 60, color: '#B6322B', bg: '#B6322B' },
  { id: 'a6', type: 'text', x: 150, y: 570, w: 260, h: 40, text: '20% off everything', color: '#FFFFFF', size: 22, weight: 700, align: 'center' },
  { id: 'a7', type: 'qr', x: 40, y: 650, w: 90, h: 90, color: '#15241F', bg: '#FFFFFF' },
  { id: 'a8', type: 'text', x: 150, y: 668, w: 370, h: 60, text: '27 Adeola Odeku St, Victoria Island, Lagos', color: '#FFFFFF', size: 18, weight: 500, align: 'left' },
];

export type DesignTemplate = { id: string; name: string; page: string; objs: Obj[] };
export const TEMPLATES: DesignTemplate[] = [
  { id: 'tp1', name: 'Grand Opening Flyer', page: '#B6322B', objs: START_OBJS },
  {
    id: 'tp2', name: 'Mega Sale Poster', page: '#15241F',
    objs: [
      { id: 'b1', type: 'text', x: 40, y: 90, w: 480, h: 140, text: 'MEGA SALE', color: '#DAA019', size: 96, weight: 900, align: 'center' },
      { id: 'b2', type: 'text', x: 60, y: 250, w: 440, h: 50, text: 'Up to 70% off', color: '#FFFFFF', size: 36, weight: 700, align: 'center' },
      { id: 'b3', type: 'shape', x: 120, y: 340, w: 320, h: 200, color: '#B6322B', bg: '#B6322B', round: true },
      { id: 'b4', type: 'text', x: 120, y: 410, w: 320, h: 60, text: 'THIS WEEKEND', color: '#FFFFFF', size: 32, weight: 800, align: 'center' },
      { id: 'b5', type: 'text', x: 60, y: 660, w: 440, h: 40, text: 'Balogun Market · Lagos', color: '#FFFFFF', size: 22, weight: 500, align: 'center' },
    ],
  },
  {
    id: 'tp3', name: 'Wedding Invitation', page: '#7A1D4A',
    objs: [
      { id: 'c1', type: 'text', x: 40, y: 150, w: 480, h: 100, text: 'Ade & Funmi', color: '#FFFFFF', size: 72, weight: 700, align: 'center' },
      { id: 'c2', type: 'shape', x: 240, y: 270, w: 80, h: 4, color: '#DAA019', bg: '#DAA019' },
      { id: 'c3', type: 'text', x: 60, y: 300, w: 440, h: 40, text: 'Traditional wedding', color: '#FFFFFF', size: 28, weight: 500, align: 'center' },
      { id: 'c4', type: 'text', x: 60, y: 360, w: 440, h: 40, text: 'Saturday · 11am · Lagos', color: '#FFFFFF', size: 22, weight: 500, align: 'center' },
    ],
  },
];

export const ELEMENT_SHAPES: { id: string; label: string; round?: boolean; bg: string; w: number; h: number }[] = [
  { id: 'rect', label: 'Rectangle', bg: '#0B7A7F', w: 200, h: 120 },
  { id: 'circle', label: 'Circle', round: true, bg: '#DAA019', w: 160, h: 160 },
  { id: 'line', label: 'Line', bg: '#15241F', w: 240, h: 6 },
  { id: 'badge', label: 'Badge', bg: '#B6322B', w: 180, h: 56 },
];

/* ─────────── Docs ─────────── */
export const DOC_START_HTML = `
<h1>Project proposal: community print kiosk</h1>
<p class="lead">Prepared for the Ikeja Traders' Association. Draft one, 12 July.</p>
<h2>Summary</h2>
<p>We propose a small print kiosk at the Ikeja market gate. Traders design their flyers and receipts on their phones, send them to a verified printer nearby and collect the same day. This document explains the cost, the timeline and what we need from the association.</p>
<h2>What it costs</h2>
<ul><li>Set-up: ₦185,000 once</li><li>Running cost: ₦42,000 a month</li><li>Printing is paid per job to the printer</li></ul>
<h2>Timeline</h2>
<p>Four weeks from approval: week one for the site, week two for the kiosk, week three for training and week four for the launch.</p>
<h2>Next steps</h2>
<p>Please review this draft and send comments by Friday. Type <b>/</b> on an empty line to add a heading, a list or a divider.</p>
`;

export const DOC_TEMPLATES: { id: string; name: string; html: string }[] = [
  { id: 'dt1', name: 'Project proposal', html: DOC_START_HTML },
  { id: 'dt2', name: 'Invoice', html: '<h1>Invoice 0042</h1><p class="lead">Okafor Bakes · Ikeja, Lagos</p><h2>Items</h2><ul><li>Birthday cake, 3 tier: ₦95,000</li><li>Small chops tray ×4: ₦60,000</li><li>Delivery: ₦8,500</li></ul><h2>Total</h2><p><b>₦163,500</b> due in 7 days.</p><h2>Pay to</h2><p>GTBank · 0123456789 · Okafor Bakes</p>' },
  { id: 'dt3', name: 'Cover letter', html: '<h1>Cover letter</h1><p class="lead">Graduate trainee application</p><p>Dear Hiring Manager,</p><p>I am writing to apply for the graduate trainee programme. I finished my degree in Business Administration this year and I have run a small online shop for two years.</p><p>I would welcome the chance to talk about how I can help your team.</p><p>Yours sincerely,<br/>Adaeze Okafor</p>' },
];

export const DOC_COMMENTS = [
  { id: 'c1', who: 'Tunde', text: 'Can we confirm the set-up cost with the printer first?', when: '2h' },
  { id: 'c2', who: 'Amina', text: 'The timeline looks tight. Maybe add a week for training.', when: 'Yesterday' },
];

/* ─────────── Send to printer (synced with the print marketplace) ─────────── */
export type Printer = { id: string; shop: string; area: string; km: number; rating: number; reviews: number; days: number; unit: number; setup: number; pickup: boolean; delivery: boolean; badge?: string };
export const PRINTERS: Printer[] = [
  { id: 'p1', shop: 'Yaba Print Hub', area: 'Yaba, Lagos', km: 1.2, rating: 4.8, reviews: 212, days: 2, unit: 92, setup: 1500, pickup: true, delivery: true, badge: 'Top rated' },
  { id: 'p2', shop: 'Balogun Express Press', area: 'Balogun, Lagos', km: 3.4, rating: 4.6, reviews: 144, days: 1, unit: 118, setup: 1000, pickup: true, delivery: true, badge: 'Fastest' },
  { id: 'p3', shop: 'Surulere PrintWorks', area: 'Surulere, Lagos', km: 6.1, rating: 4.9, reviews: 97, days: 3, unit: 78, setup: 2000, pickup: true, delivery: false, badge: 'Best price' },
  { id: 'p4', shop: 'Ikeja Colour Lab', area: 'Ikeja, Lagos', km: 9.8, rating: 4.4, reviews: 63, days: 2, unit: 99, setup: 1200, pickup: false, delivery: true },
  { id: 'p5', shop: 'Mainland Digital Press', area: 'Ebute Metta, Lagos', km: 5.0, rating: 4.5, reviews: 118, days: 2, unit: 105, setup: 800, pickup: true, delivery: true },
];
export const PAPERS = [
  { id: 'g130', label: '130gsm gloss', f: 1 },
  { id: 'g170', label: '170gsm gloss', f: 1.25 },
  { id: 'm250', label: '250gsm matt', f: 1.7 },
];
export const FINISHES = [
  { id: 'none', label: 'No finish', f: 1 },
  { id: 'lam', label: 'Lamination', f: 1.35 },
  { id: 'uv', label: 'Spot UV', f: 1.8 },
];
export const DOC_PAPERS = [
  { id: 'b80', label: '80gsm bond', f: 1 },
  { id: 'b100', label: '100gsm bond', f: 1.2 },
];
export const DOC_FINISHES = [
  { id: 'none', label: 'Loose pages', f: 1 },
  { id: 'staple', label: 'Stapled', f: 1.1 },
  { id: 'spiral', label: 'Spiral bound', f: 1.6 },
];
export const priceOf = (p: Printer, qty: number, paper: number, finish: number) => Math.round(p.setup + p.unit * qty * paper * finish * (qty >= 500 ? 0.82 : qty >= 200 ? 0.9 : 1));
export const naira = (n: number) => '₦' + Math.round(n).toLocaleString('en-NG');
