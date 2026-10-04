import { Eye, FileText, Handshake, Palette, Printer, ShoppingBag, TrendingUp, Wrench, type LucideIcon } from 'lucide-react';

export type Status = 'live' | 'soon';
export type LayerId = 'sell' | 'create' | 'protect' | 'grow';

export type Surface = {
  status: Status;
  /** Where the button goes. Leave out while there is nothing to open. */
  url?: string;
  /** Android package id, shown in mono type. */
  pkg?: string;
};

export type AppEntry = {
  slug: string;
  name: string;
  short: string;
  layer: LayerId;
  Icon: LucideIcon;
  tagline: string;
  features: string[];
  web?: Surface;
  android?: Surface;
  /** CSS gradient for the icon tile when the app has no icon file. */
  tile: string;
  /** App icon taken from the Ifiok repo, under public/apps. */
  icon?: string;
};

export const LAYERS: { id: LayerId; label: string; blurb: string }[] = [
  { id: 'sell', label: 'Sell', blurb: 'Buy and order print' },
  { id: 'create', label: 'Create', blurb: 'Design and document work' },
  { id: 'protect', label: 'Protect', blurb: 'Secure what you own' },
  { id: 'grow', label: 'Grow', blurb: 'Understand your customers' },
];

/*
 * The one place to edit the app list. Change a status to 'live' and add a url when an app ships.
 * Entries marked CHECK carry details I could not confirm from the repository.
 */
export const APPS: AppEntry[] = [
  {
    slug: 'market',
    name: 'Ifiok Market',
    short: 'Market',
    layer: 'sell',
    Icon: ShoppingBag,
    tagline: 'Order printing online and have it delivered.',
    features: ['Set up a product and see the exact naira price', 'Pay by card or bank transfer', 'Track every order and chat with the print team'],
    web: { status: 'live', url: 'https://ifiok.ng' },
    android: { status: 'soon', pkg: 'ng.ifiok.market' },
    tile: 'linear-gradient(150deg, #e6a91a, #c2410c)',
    icon: 'market.png',
  },
  {
    slug: 'designs',
    name: 'Ifiok Designs',
    short: 'Designs',
    layer: 'create',
    Icon: Palette,
    tagline: 'Design at real print size, then order the print.',
    features: ['530+ free templates built at print size', 'Open and edit PDF and PowerPoint files', 'AI layouts and one-tap background removal'],
    web: { status: 'live', url: 'https://designs.ifiok.ng' },
    android: { status: 'live', url: 'https://ifiok.ng/get-app', pkg: 'ng.ifiok.designs' }, // CHECK: store link and package id
    tile: 'linear-gradient(150deg, #0b7a7f, #0a3a52)',
    icon: 'designs.png',
  },
  {
    slug: 'docs',
    name: 'Ifiok Docs',
    short: 'Docs',
    layer: 'create',
    Icon: FileText,
    tagline: 'Create, edit, sign and convert documents and PDFs.',
    features: ['Write letters, CVs and forms', 'Sign and fill PDFs', 'Convert between PDF and Word'],
    web: { status: 'live', url: 'https://docs.ifiok.ng' },
    android: { status: 'soon', pkg: 'ng.ifiok.docs' },
    tile: 'linear-gradient(150deg, #0b7a7f, #064e51)',
    icon: 'docs.png',
  },
  {
    slug: 'printers',
    name: 'Ifiok Printers',
    short: 'Printers',
    layer: 'sell',
    Icon: Printer,
    tagline: 'For print shops: receive, print and deliver Ifiok orders.',
    features: ['See incoming print jobs', 'Bid for work and track orders', 'Get paid for completed jobs'], // CHECK: confirm the printer portal feature list
    web: { status: 'live', url: 'https://ifiok.ng/printer' },
    android: { status: 'soon', pkg: 'ng.ifiok.printers' },
    tile: 'linear-gradient(150deg, #0b7a7f, #064e51)',
    icon: 'printers.png',
  },
  {
    slug: 'partners',
    name: 'Ifiok Partners',
    short: 'Partners',
    layer: 'sell',
    Icon: Handshake,
    tagline: 'Printers and installers: join the Ifiok partner network.',
    features: ['Signage, billboard and vehicle branding work', 'A dashboard for your jobs', 'Customers across Nigeria'], // CHECK: confirm copy
    web: { status: 'live', url: 'https://ifiok.ng/partners' },
    tile: 'linear-gradient(150deg, #0b7a7f, #064e51)',
    icon: 'partners.png',
  },
  {
    slug: 'tools',
    name: 'Ifiok Tools',
    short: 'Tools',
    layer: 'create',
    Icon: Wrench,
    tagline: 'Free PDF and QR tools that work on a phone.',
    features: ['Merge, split, compress and protect PDFs', 'Sign PDFs and fill in forms', 'Trackable QR codes and Link in Bio'],
    web: { status: 'live', url: 'https://ifiok.ng/tools' },
    android: { status: 'soon', pkg: 'ng.ifiok.tools' },
    tile: 'linear-gradient(150deg, #2f55c9, #1b1f6b)',
  },
  {
    slug: 'vigil',
    name: 'Ifiok Vigil',
    short: 'Vigil',
    layer: 'protect',
    Icon: Eye,
    tagline: 'Keep track of your Android devices and raise the alarm.',
    features: ['See every device with its zone and who holds it', 'Group devices and sound an alarm for one or a whole group', 'Give each teammate only the access they need'],
    web: { status: 'live' }, // CHECK: dashboard address
    android: { status: 'live' }, // CHECK: how the device app is distributed
    tile: 'linear-gradient(150deg, #d9433b, #7a1d4a)',
  },
  {
    slug: 'cjc',
    name: 'Customer Journey & Conversion',
    short: 'CJC',
    layer: 'grow',
    Icon: TrendingUp,
    tagline: 'See how customers go from first visit to paid order.',
    features: ['Map the steps from first visit to purchase', 'Find where people drop off', 'Measure what turns visits into orders'], // CHECK: placeholder copy
    web: { status: 'soon' },
    tile: 'linear-gradient(150deg, #8a2fc0, #3b1673)',
  },
];

export const NEXT_UP = { Icon: Printer, label: 'More to come' };

export const surfaceLabel = (s?: Surface) => (!s ? 'Not available' : s.status === 'live' ? 'Live' : 'Coming soon');
