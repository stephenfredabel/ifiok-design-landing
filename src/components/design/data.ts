import {
  Bot, Brush, FileText, FolderOpen, Headphones, Home, Image as ImageIcon, LayoutGrid, Link2, type LucideIcon,
  Package, QrCode, Settings, Upload, GraduationCap, BookOpen,
} from 'lucide-react';

/* Everything on this page is sample data. Real designs, orders and templates come from the live app. */

export type Kind = 'card' | 'flyer' | 'poster' | 'banner' | 'id' | 'sticker' | 'doc' | 'receipt' | 'tshirt' | 'invite';
export type Stage = 'draft' | 'ready' | 'printing' | 'delivery' | 'delivered';

export type Format = { id: string; label: string; kind: Kind; w: number; h: number; unit: 'in'; bleed: number; qty: number; step: number; base: number; per: number; note: string };

/** Print formats with real sizes. Prices are examples only. */
export const FORMATS: Format[] = [
  { id: 'card', label: 'Business card', kind: 'card', w: 3.5, h: 2, unit: 'in', bleed: 0.125, qty: 100, step: 50, base: 3000, per: 50, note: 'Standard 3.5 × 2 in' },
  { id: 'flyer-a5', label: 'Flyer A5', kind: 'flyer', w: 5.8, h: 8.3, unit: 'in', bleed: 0.125, qty: 100, step: 50, base: 4000, per: 110, note: 'Handouts and inserts' },
  { id: 'flyer-a4', label: 'Flyer A4', kind: 'flyer', w: 8.3, h: 11.7, unit: 'in', bleed: 0.125, qty: 100, step: 50, base: 6000, per: 190, note: 'Full-page flyers' },
  { id: 'poster', label: 'Poster A3', kind: 'poster', w: 11.7, h: 16.5, unit: 'in', bleed: 0.125, qty: 10, step: 5, base: 1500, per: 1800, note: 'Walls and notice boards' },
  { id: 'banner', label: 'Flex banner', kind: 'banner', w: 72, h: 36, unit: 'in', bleed: 0.5, qty: 1, step: 1, base: 6000, per: 9000, note: '6 × 3 ft, hemmed edges' },
  { id: 'rollup', label: 'Roll-up banner', kind: 'poster', w: 33, h: 79, unit: 'in', bleed: 0.25, qty: 1, step: 1, base: 12000, per: 18000, note: '33 × 79 in with stand' },
  { id: 'sticker', label: 'Sticker (SAV)', kind: 'sticker', w: 3, h: 3, unit: 'in', bleed: 0.0625, qty: 50, step: 25, base: 2500, per: 140, note: 'Die-cut vinyl' },
  { id: 'id', label: 'ID card', kind: 'id', w: 3.375, h: 2.125, unit: 'in', bleed: 0.04, qty: 25, step: 25, base: 1500, per: 900, note: 'CR80, portrait or landscape' },
  { id: 'letterhead', label: 'Letterhead', kind: 'doc', w: 8.3, h: 11.7, unit: 'in', bleed: 0.125, qty: 100, step: 50, base: 5000, per: 160, note: 'A4 company paper' },
  { id: 'receipt', label: 'Receipt book', kind: 'receipt', w: 5.8, h: 8.3, unit: 'in', bleed: 0.125, qty: 10, step: 5, base: 3500, per: 2200, note: 'Numbered, duplicate sheets' },
  { id: 'tshirt', label: 'T-shirt print', kind: 'tshirt', w: 11, h: 14, unit: 'in', bleed: 0, qty: 12, step: 6, base: 4000, per: 2500, note: 'Front print area' },
  { id: 'invite', label: 'Invitation', kind: 'invite', w: 5, h: 7, unit: 'in', bleed: 0.125, qty: 100, step: 50, base: 5000, per: 220, note: 'Weddings, naming, launches' },
];

export const formatById = (id: string) => FORMATS.find((f) => f.id === id) ?? FORMATS[0];
export const naira = (n: number) => '₦' + Math.round(n).toLocaleString('en-NG');
export const priceFor = (f: Format, qty: number) => f.base + f.per * Math.pow(qty / f.qty, -0.12) * Math.max(0, qty - 1);
export const sizeLabel = (f: Format) => `${f.w}" × ${f.h}"`;

export type Design = { id: string; name: string; formatId: string; accent: string; headline: string; sub: string; stage: Stage; edited: string; warn?: string };

export const STAGES: { id: Stage; label: string }[] = [
  { id: 'draft', label: 'Draft' },
  { id: 'ready', label: 'Ready to print' },
  { id: 'printing', label: 'Printing' },
  { id: 'delivery', label: 'Out for delivery' },
  { id: 'delivered', label: 'Delivered' },
];

export const SAMPLE_DESIGNS: Design[] = [
  { id: 'd1', name: 'Okafor Bakes — business card', formatId: 'card', accent: '#0B7A7F', headline: 'Adaeze Okafor', sub: 'Founder · Okafor Bakes', stage: 'ready', edited: '2 hours ago' },
  { id: 'd2', name: 'Grand Opening — flyer', formatId: 'flyer-a5', accent: '#B6322B', headline: 'GRAND OPENING', sub: 'Saturday 12 July · 10am', stage: 'printing', edited: 'Yesterday' },
  { id: 'd3', name: 'Mega Sale — flex banner', formatId: 'banner', accent: '#E11D2E', headline: 'MEGA SALE', sub: 'Up to 40% off · Balogun Market', stage: 'delivery', edited: '3 days ago' },
  { id: 'd4', name: 'Staff ID — Okafor Bakes', formatId: 'id', accent: '#1F3A8A', headline: 'Chidi Eze', sub: 'Production · OKB-0041', stage: 'draft', edited: '4 days ago', warn: 'Photo is under 300 DPI at this size' },
  { id: 'd5', name: 'Thanksgiving Service — programme', formatId: 'flyer-a4', accent: '#1C2F6E', headline: 'Thanksgiving Service', sub: 'Sunday 9am · Surulere', stage: 'delivered', edited: 'Last week' },
  { id: 'd6', name: 'Ade & Funmi — invitation', formatId: 'invite', accent: '#7A1D4A', headline: 'Ade & Funmi', sub: 'Traditional wedding', stage: 'draft', edited: '2 weeks ago' },
  { id: 'd7', name: 'Mama Tolu Stores — receipt book', formatId: 'receipt', accent: '#8A6100', headline: 'Mama Tolu Stores', sub: 'No. 0001', stage: 'delivered', edited: '3 weeks ago' },
  { id: 'd8', name: 'Class of 2026 — T-shirt', formatId: 'tshirt', accent: '#0F3D3E', headline: 'CLASS OF 2026', sub: 'Faculty of Arts', stage: 'ready', edited: 'Last month' },
];

export type Template = { id: string; name: string; cat: string; formatId: string; accent: string; headline: string; sub: string };
export const TEMPLATE_CATS = ['Marketing', 'Business', 'Church & events', 'School & ID', 'Weddings'] as const;
export const TEMPLATES: Template[] = [
  { id: 't1', name: 'Grand Opening Flyer', cat: 'Marketing', formatId: 'flyer-a5', accent: '#B6322B', headline: 'GRAND OPENING', sub: '20% off everything' },
  { id: 't2', name: 'Mega Sale Poster', cat: 'Marketing', formatId: 'poster', accent: '#E11D2E', headline: 'MEGA SALE', sub: 'Up to 70% off' },
  { id: 't3', name: 'Discount Flyer', cat: 'Marketing', formatId: 'flyer-a5', accent: '#0F5C3A', headline: 'Special Offer', sub: '15% off all services' },
  { id: 't4', name: 'Flex Banner — Sale', cat: 'Marketing', formatId: 'banner', accent: '#C2410C', headline: 'FLASH SALE', sub: 'This weekend only' },
  { id: 't5', name: 'RidgeHaus Business Card', cat: 'Business', formatId: 'card', accent: '#0B7A7F', headline: 'RidgeHaus', sub: 'Build · Sell · Manage' },
  { id: 't6', name: 'Spice Route Card', cat: 'Business', formatId: 'card', accent: '#7A1D4A', headline: 'Spice Route', sub: 'Authentic kitchen' },
  { id: 't7', name: 'Company Letterhead', cat: 'Business', formatId: 'letterhead', accent: '#1F3A8A', headline: 'SwiftHaul', sub: 'Logistics · Lagos' },
  { id: 't8', name: 'Receipt Book — Store', cat: 'Business', formatId: 'receipt', accent: '#8A6100', headline: 'Receipt', sub: 'No. ____' },
  { id: 't9', name: 'Thanksgiving Programme', cat: 'Church & events', formatId: 'flyer-a4', accent: '#1C2F6E', headline: 'Thanksgiving', sub: 'Sunday service' },
  { id: 't10', name: 'Naming Ceremony', cat: 'Church & events', formatId: 'invite', accent: '#9D3A66', headline: 'Welcome, Oluwaseun', sub: 'Eighth day · Lagos' },
  { id: 't11', name: 'Concert Poster', cat: 'Church & events', formatId: 'poster', accent: '#3B1673', headline: 'LIVE NIGHT', sub: 'Doors open 6pm' },
  { id: 't12', name: 'Staff ID Card', cat: 'School & ID', formatId: 'id', accent: '#0B7A7F', headline: 'Staff', sub: 'ID · 0001' },
  { id: 't13', name: 'Student ID Card', cat: 'School & ID', formatId: 'id', accent: '#1F3A8A', headline: 'Student', sub: 'Matric no.' },
  { id: 't14', name: 'Convocation T-shirt', cat: 'School & ID', formatId: 'tshirt', accent: '#0F3D3E', headline: 'CLASS OF 2026', sub: 'University of Ibadan' },
  { id: 't15', name: 'Traditional Wedding', cat: 'Weddings', formatId: 'invite', accent: '#7A1D4A', headline: 'Ade & Funmi', sub: 'Saturday · Asọ-ẹbí' },
  { id: 't16', name: 'White Wedding', cat: 'Weddings', formatId: 'invite', accent: '#2B2B2B', headline: 'Together', sub: 'Join us' },
];

export type Order = { id: string; ref: string; item: string; formatId: string; qty: number; total: number; stage: Stage; eta: string; printer: string; designId: string };
export const SAMPLE_ORDERS: Order[] = [
  { id: 'o1', ref: 'IFK-20418', item: 'Grand Opening — flyer', formatId: 'flyer-a5', qty: 500, total: 52000, stage: 'printing', eta: 'Delivery by Fri 17 Oct', printer: 'Yaba print shop', designId: 'd2' },
  { id: 'o2', ref: 'IFK-20391', item: 'Mega Sale — flex banner', formatId: 'banner', qty: 2, total: 24000, stage: 'delivery', eta: 'Arrives today', printer: 'Balogun print shop', designId: 'd3' },
  { id: 'o3', ref: 'IFK-20277', item: 'Thanksgiving Service — programme', formatId: 'flyer-a4', qty: 300, total: 58000, stage: 'delivered', eta: 'Delivered 2 Oct', printer: 'Surulere print shop', designId: 'd5' },
  { id: 'o4', ref: 'IFK-20190', item: 'Mama Tolu Stores — receipt book', formatId: 'receipt', qty: 20, total: 41000, stage: 'delivered', eta: 'Delivered 14 Sep', printer: 'Yaba print shop', designId: 'd7' },
];

export type NavItem = { id: string; label: string; Icon: LucideIcon; badge?: string; href?: string; blurb?: string; group: 'create' | 'grow' | 'print' | 'foot' };
export const NAV: NavItem[] = [
  { id: 'home', label: 'Home', Icon: Home, group: 'create' },
  { id: 'projects', label: 'My files', Icon: FolderOpen, group: 'create' },
  { id: 'templates', label: 'Templates', Icon: LayoutGrid, group: 'create' },
  { id: 'brand', label: 'Brand kit', Icon: Brush, group: 'create', blurb: 'Keep your logos, colours and fonts in one kit, then apply them to any design in a tap.' },
  { id: 'uploads', label: 'Uploads', Icon: Upload, group: 'create', blurb: 'Your photos, logos and PDFs, ready to drop into any design.' },
  { id: 'stock', label: 'Stock images', Icon: ImageIcon, group: 'create', blurb: 'Browse photos and graphics you can use in your designs.' },
  { id: 'ai', label: 'AI assistant', Icon: Bot, badge: 'New', group: 'create', blurb: 'Describe a flyer and get a layout you can edit, not a flat picture.' },
  { id: 'qr', label: 'Trackable QR', Icon: QrCode, badge: 'New', group: 'grow', href: 'https://ifiok.ng/tools/my-qr-codes' },
  { id: 'links', label: 'Link pages', Icon: Link2, badge: 'New', group: 'grow', href: 'https://ifiok.ng/tools/link-in-bio' },
  { id: 'student', label: 'Student perks', Icon: GraduationCap, group: 'grow', blurb: 'Verify once with your school ID and unlock student perks.' },
  { id: 'orders', label: 'Orders & prints', Icon: Package, group: 'print' },
  { id: 'docs', label: 'Documents', Icon: FileText, group: 'foot', href: 'https://ifiok.ng/tools' },
  { id: 'settings', label: 'Settings', Icon: Settings, group: 'foot', blurb: 'Your profile, delivery addresses and payment preferences.' },
  { id: 'support', label: 'Support', Icon: Headphones, group: 'foot', blurb: 'Chat with the Ifiok team, voice notes included.' },
];

export const QUICK = ['card', 'flyer-a5', 'banner', 'poster', 'sticker', 'id', 'letterhead', 'receipt', 'rollup', 'tshirt', 'invite'] as const;

export const TOOL_LINKS = [
  { label: 'Merge PDF', href: 'https://ifiok.ng/tools/merge-pdf', Icon: BookOpen },
  { label: 'Split PDF', href: 'https://ifiok.ng/tools/split-pdf', Icon: FileText },
  { label: 'Compress PDF', href: 'https://ifiok.ng/tools/compress-pdf', Icon: FileText },
  { label: 'PDF to Word', href: 'https://ifiok.ng/tools/pdf-to-word', Icon: FileText },
  { label: 'Scan to PDF', href: 'https://ifiok.ng/tools/scan-to-pdf', Icon: FileText },
  { label: 'QR generator', href: 'https://ifiok.ng/tools/qr-code-generator', Icon: QrCode },
];

export const USER = { name: 'Stephenfredabel', initial: 'S' };
