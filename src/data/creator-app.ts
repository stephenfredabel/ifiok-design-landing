/*
 * Sample data and settings for the creator dashboard prototype. Real templates, earnings and payouts
 * come from the live app. Amounts here are examples; Ifiok sets the real amounts in the admin area.
 */
export type ThumbKind = 'card' | 'flyer' | 'poster' | 'banner' | 'id' | 'sticker' | 'doc' | 'receipt' | 'tshirt' | 'invite' | 'social' | 'type';
export type Group = 'Print' | 'Documents' | 'Social' | 'Font templates';

export type TKind = { id: string; group: Group; label: string; kind: ThumbKind; ratio: number; size: string; printable: boolean; bounty: number };

export const KINDS: TKind[] = [
  { id: 'card', group: 'Print', label: 'Business card', kind: 'card', ratio: 1.75, size: '3.5 × 2 in', printable: true, bounty: 1500 },
  { id: 'flyer', group: 'Print', label: 'Flyer', kind: 'flyer', ratio: 0.707, size: 'A5 or A4', printable: true, bounty: 2000 },
  { id: 'poster', group: 'Print', label: 'Poster', kind: 'poster', ratio: 0.707, size: 'A3', printable: true, bounty: 2500 },
  { id: 'banner', group: 'Print', label: 'Flex banner', kind: 'banner', ratio: 2, size: '6 × 3 ft', printable: true, bounty: 3000 },
  { id: 'id', group: 'Print', label: 'ID card', kind: 'id', ratio: 1.59, size: 'CR80', printable: true, bounty: 2000 },
  { id: 'sticker', group: 'Print', label: 'Sticker', kind: 'sticker', ratio: 1, size: '3 × 3 in', printable: true, bounty: 1500 },
  { id: 'invite', group: 'Print', label: 'Invitation', kind: 'invite', ratio: 0.714, size: '5 × 7 in', printable: true, bounty: 2000 },
  { id: 'receipt', group: 'Print', label: 'Receipt book', kind: 'receipt', ratio: 0.707, size: 'A5', printable: true, bounty: 2000 },
  { id: 'tshirt', group: 'Print', label: 'T-shirt print', kind: 'tshirt', ratio: 0.79, size: '11 × 14 in', printable: true, bounty: 2000 },
  { id: 'cv', group: 'Documents', label: 'CV / Resume', kind: 'doc', ratio: 0.707, size: 'A4', printable: true, bounty: 2500 },
  { id: 'cover', group: 'Documents', label: 'Cover letter', kind: 'doc', ratio: 0.707, size: 'A4', printable: true, bounty: 1500 },
  { id: 'invoice', group: 'Documents', label: 'Invoice', kind: 'doc', ratio: 0.707, size: 'A4', printable: true, bounty: 2000 },
  { id: 'proposal', group: 'Documents', label: 'Business proposal', kind: 'doc', ratio: 0.707, size: 'A4', printable: true, bounty: 3000 },
  { id: 'certificate', group: 'Documents', label: 'Certificate', kind: 'doc', ratio: 1.41, size: 'A4 landscape', printable: true, bounty: 2000 },
  { id: 'ig', group: 'Social', label: 'Instagram post', kind: 'social', ratio: 1, size: '1080 × 1080 px', printable: false, bounty: 1500 },
  { id: 'story', group: 'Social', label: 'Story', kind: 'social', ratio: 0.56, size: '1080 × 1920 px', printable: false, bounty: 1500 },
  { id: 'specimen', group: 'Font templates', label: 'Type specimen', kind: 'type', ratio: 0.707, size: 'A4', printable: true, bounty: 3000 },
  { id: 'lettering', group: 'Font templates', label: 'Lettering poster', kind: 'type', ratio: 0.707, size: 'A3', printable: true, bounty: 3000 },
  { id: 'pairing', group: 'Font templates', label: 'Font pairing sheet', kind: 'type', ratio: 1.41, size: 'A4 landscape', printable: false, bounty: 2500 },
];
export const kindById = (id: string) => KINDS.find((k) => k.id === id) ?? KINDS[0];
export const GROUPS: Group[] = ['Print', 'Documents', 'Social', 'Font templates'];

export type Status = 'draft' | 'review' | 'changes' | 'approved' | 'rejected';
export const STATUSES: { id: Status; label: string }[] = [
  { id: 'draft', label: 'Draft' },
  { id: 'review', label: 'In review' },
  { id: 'changes', label: 'Changes requested' },
  { id: 'approved', label: 'Approved' },
  { id: 'rejected', label: 'Not approved' },
];

export type Note = { by: 'reviewer' | 'you'; text: string; when: string };
export type CTemplate = {
  id: string; name: string; kindId: string; accent: string; headline: string; sub: string; status: Status;
  updated: string; submitted?: string; decided?: string; fonts?: string; theme?: string; notes: Note[];
};

export const SAMPLE_TEMPLATES: CTemplate[] = [
  { id: 't1', name: 'Grand Opening Flyer', kindId: 'flyer', accent: '#B6322B', headline: 'GRAND OPENING', sub: 'Saturday · 10am', status: 'approved', updated: '16 Sep', submitted: '12 Sep', decided: '16 Sep', notes: [{ by: 'reviewer', text: 'Clear and easy to edit. Approved.', when: '16 Sep' }] },
  { id: 't2', name: 'Okafor Bakes Business Card', kindId: 'card', accent: '#0B7A7F', headline: 'Adaeze Okafor', sub: 'Founder · Okafor Bakes', status: 'approved', updated: '24 Sep', submitted: '20 Sep', decided: '24 Sep', notes: [{ by: 'reviewer', text: 'Nice layout. Approved.', when: '24 Sep' }] },
  { id: 't3', name: 'Class of 2026 Poster', kindId: 'poster', accent: '#0F3D3E', headline: 'CLASS OF 2026', sub: 'Faculty of Arts', status: 'review', updated: '29 Sep', submitted: '29 Sep', notes: [] },
  { id: 't4', name: 'Clean One-Page CV', kindId: 'cv', accent: '#1F3A8A', headline: 'Curriculum Vitae', sub: 'Clean, one page', status: 'changes', updated: '1 Oct', submitted: '27 Sep', notes: [{ by: 'reviewer', text: 'Raise the contrast of the headings and keep the contact details as real text, not an image. Then resubmit.', when: '1 Oct' }] },
  { id: 't5', name: 'Thanksgiving Programme', kindId: 'flyer', accent: '#1C2F6E', headline: 'Thanksgiving Service', sub: 'Sunday 9am', status: 'draft', updated: '2 Oct', notes: [] },
  { id: 't6', name: 'Aso Ebi Weekend Lettering', kindId: 'lettering', accent: '#7A1D4A', headline: 'Aso Ebi', sub: 'Weekend', status: 'draft', updated: '2 Oct', fonts: '', notes: [] },
  { id: 't7', name: 'Receipt Book — Store', kindId: 'receipt', accent: '#8A6100', headline: 'Receipt', sub: 'No. ____', status: 'rejected', updated: '18 Sep', submitted: '14 Sep', decided: '18 Sep', notes: [{ by: 'reviewer', text: 'The layout is too close to an existing template. Please make it your own and try again.', when: '18 Sep' }] },
  { id: 't8', name: 'Detty December Poster', kindId: 'poster', accent: '#3B1673', headline: 'DETTY DECEMBER', sub: 'Lagos · 2026', status: 'review', updated: '3 Oct', submitted: '3 Oct', theme: 'Detty December', notes: [] },
  { id: 't9', name: 'Wedding Invitation — Gold', kindId: 'invite', accent: '#7A1D4A', headline: 'Ade & Funmi', sub: 'Traditional wedding', status: 'approved', updated: '8 Sep', submitted: '4 Sep', decided: '8 Sep', notes: [] },
  { id: 't10', name: 'Instagram Quote Card', kindId: 'ig', accent: '#0B7A7F', headline: 'Keep going', sub: '@yourbrand', status: 'approved', updated: '2 Sep', submitted: '30 Aug', decided: '2 Sep', notes: [] },
  { id: 't11', name: 'Convocation Shirt', kindId: 'tshirt', accent: '#0F3D3E', headline: 'CLASS OF 2026', sub: 'Faculty of Arts', status: 'approved', updated: '27 Sep', submitted: '23 Sep', decided: '27 Sep', notes: [] },
];

export type EntryStatus = 'available' | 'requested' | 'paid';
export type Entry = { id: string; templateId: string; name: string; amount: number; date: string; status: EntryStatus; payoutId?: string };
export type PayoutStatus = 'processing' | 'paid' | 'failed';
export type Payout = { id: string; ref: string; amount: number; date: string; status: PayoutStatus; account: string };

export const SAMPLE_LEDGER: Entry[] = [
  { id: 'e1', templateId: 't10', name: 'Instagram Quote Card', amount: 1500, date: '2 Sep', status: 'paid', payoutId: 'p1' },
  { id: 'e2', templateId: 't9', name: 'Wedding Invitation — Gold', amount: 2000, date: '8 Sep', status: 'paid', payoutId: 'p1' },
  { id: 'e3', templateId: 't1', name: 'Grand Opening Flyer', amount: 2000, date: '16 Sep', status: 'available' },
  { id: 'e4', templateId: 't2', name: 'Okafor Bakes Business Card', amount: 1500, date: '24 Sep', status: 'available' },
  { id: 'e5', templateId: 't11', name: 'Convocation Shirt', amount: 2000, date: '27 Sep', status: 'available' },
];
export const SAMPLE_PAYOUTS: Payout[] = [
  { id: 'p1', ref: 'PO-0007', amount: 3500, date: '10 Sep', status: 'paid', account: 'GTBank •••• 4821' },
];

export const SETTINGS = {
  minPayout: 5000,
  reviewTime: 'about 5 working days',
  theme: { name: 'Detty December', blurb: 'Event posters, parties and gift flyers', closes: '30 Nov' },
};

export const BANKS = [
  'Access Bank', 'Citibank Nigeria', 'Ecobank Nigeria', 'Fidelity Bank', 'First Bank of Nigeria', 'First City Monument Bank (FCMB)', 'Globus Bank', 'Guaranty Trust Bank (GTBank)',
  'Heritage Bank', 'Keystone Bank', 'Kuda Microfinance Bank', 'Moniepoint Microfinance Bank', 'OPay', 'PalmPay', 'Polaris Bank', 'Providus Bank', 'Stanbic IBTC Bank', 'Standard Chartered',
  'Sterling Bank', 'Union Bank', 'United Bank for Africa (UBA)', 'Unity Bank', 'Wema Bank', 'Zenith Bank',
];

export const naira = (n: number) => '₦' + Math.round(n).toLocaleString('en-NG');
export const ACCENTS = ['#0B7A7F', '#DAA019', '#B6322B', '#1F3A8A', '#15241F', '#7A1D4A'];
