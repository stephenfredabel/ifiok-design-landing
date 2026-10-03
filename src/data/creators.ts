/*
 * Everything an admin would edit on the creators page lives here: which blocks show and in what order,
 * the copy, FAQ, categories, themes and the campus list. In the live app this comes from the admin area.
 */

export type BlockId = 'hero' | 'steps' | 'create' | 'apply' | 'standards' | 'campuses' | 'themes' | 'learn' | 'faq' | 'waitlist' | 'cta';

export const DEFAULT_BLOCKS: { id: BlockId; label: string; visible: boolean }[] = [
  { id: 'hero', label: 'Hero', visible: true },
  { id: 'steps', label: 'How it works', visible: true },
  { id: 'create', label: 'What you can create', visible: true },
  { id: 'apply', label: 'Apply (checklist and form)', visible: true },
  { id: 'standards', label: 'Quality standards', visible: true },
  { id: 'campuses', label: 'Every campus', visible: true },
  { id: 'themes', label: 'Monthly themes', visible: true },
  { id: 'learn', label: 'Learn', visible: true },
  { id: 'faq', label: 'FAQ', visible: true },
  { id: 'waitlist', label: 'Other countries (waitlist)', visible: true },
  { id: 'cta', label: 'Closing banner', visible: true },
];

export const PROGRAM = {
  name: 'Ifiok Creators',
  sub: 'Campus Creator Program',
  status: 'Applications open to verified students in Nigeria',
  reviewTime: 'about 5 working days',
  cohort: '2026',
};

export const STEPS = [
  { t: 'Sign up and verify', p: 'Use your Ifiok account and confirm you are a student, a corps member or an individual creator.' },
  { t: 'Create templates', p: 'Design CVs, flyers, invoices, posters and more in the Ifiok editor, from your phone or a laptop.' },
  { t: 'Get approved by Ifiok', p: 'The Ifiok team reviews every submission for quality, originality and print readiness.' },
  { t: 'See your payout', p: 'Approved work and your payouts appear on your creator dashboard when you sign in.' },
];

export type CreateTab = { id: string; label: string; blurb: string; looks: string[]; art: { kind: 'card' | 'flyer' | 'poster' | 'banner' | 'id' | 'doc' | 'invite'; title: string; sub: string; accent: string }[] };
export const CREATE_TABS: CreateTab[] = [
  {
    id: 'print', label: 'Print', blurb: 'Business cards, flyers, posters and banners that shops and small businesses order every day.',
    looks: ['Real print sizes with bleed', 'Clear hierarchy: one headline, one message', 'Space for the business to add its own details'],
    art: [
      { kind: 'card', title: 'Kemi Adebayo', sub: 'Tailor · Kano', accent: '#0B7A7F' },
      { kind: 'flyer', title: 'GRAND OPENING', sub: 'Saturday · 10am', accent: '#B6322B' },
      { kind: 'banner', title: 'MEGA SALE', sub: 'Up to 40% off', accent: '#E11D2E' },
    ],
  },
  {
    id: 'docs', label: 'Documents', blurb: 'CVs, cover letters, invoices, receipts, proposals and certificates people need on campus and at work.',
    looks: ['Easy to edit: real text, no flattened images', 'Readable fonts and sensible spacing', 'Works for many people, not one name'],
    art: [
      { kind: 'doc', title: 'Curriculum Vitae', sub: 'Clean, one page', accent: '#1F3A8A' },
      { kind: 'doc', title: 'Invoice', sub: 'No. 0001', accent: '#8A6100' },
      { kind: 'doc', title: 'Certificate', sub: 'of Achievement', accent: '#0F3D3E' },
    ],
  },
  {
    id: 'school', label: 'School & ID', blurb: 'ID cards, convocation designs, class shirts and department materials.',
    looks: ['Correct card sizes such as CR80', 'Room for a photo and a name', 'Strong contrast so it reads when printed small'],
    art: [
      { kind: 'id', title: 'Student', sub: 'Matric no.', accent: '#1F3A8A' },
      { kind: 'poster', title: 'CLASS OF 2026', sub: 'Faculty of Arts', accent: '#0F3D3E' },
      { kind: 'flyer', title: 'Departmental Week', sub: 'Mon to Fri', accent: '#7A1D4A' },
    ],
  },
  {
    id: 'events', label: 'Church & events', blurb: 'Programmes, posters, birthday flyers and naming ceremony designs.',
    looks: ['Layouts that survive long names and long text', 'Cultural detail done with care', 'Date, place and time easy to find'],
    art: [
      { kind: 'flyer', title: 'Thanksgiving Service', sub: 'Sunday 9am', accent: '#1C2F6E' },
      { kind: 'poster', title: 'LIVE NIGHT', sub: 'Doors open 6pm', accent: '#3B1673' },
      { kind: 'invite', title: 'Welcome, Oluwaseun', sub: 'Eighth day', accent: '#9D3A66' },
    ],
  },
  {
    id: 'wed', label: 'Weddings', blurb: 'Invitations, programmes and thank-you cards for traditional and white weddings.',
    looks: ['Elegant type that stays legible', 'Colour themes that work in print', 'Both languages and local touches where needed'],
    art: [
      { kind: 'invite', title: 'Ade & Funmi', sub: 'Traditional wedding', accent: '#7A1D4A' },
      { kind: 'invite', title: 'Together', sub: 'Join us', accent: '#2B2B2B' },
      { kind: 'flyer', title: 'Order of Service', sub: 'White wedding', accent: '#0B7A7F' },
    ],
  },
];

export const TEMPLATE_TYPES = ['CVs & Resumes', 'Cover Letters', 'Invoices & Receipts', 'Business Proposals', 'Certificates', 'Event Posters', 'Birthday Flyers', 'Business Cards', 'Instagram Posts', 'Wedding Invitations', 'Restaurant Menus', 'Roll-up Banners', 'ID Cards', 'Letterheads'];
export const TOOLS = ['Ifiok editor', 'Canva', 'Photoshop', 'Illustrator', 'CorelDRAW', 'Figma', 'Phone apps only'];

export const CHECKLIST = [
  { t: 'Proof you belong', p: 'A photo of your school ID card (students), your NYSC details (corps members) or a link to your work (individuals).' },
  { t: 'A sample of your work', p: 'A link to a few pieces you made. Students can skip it; we will ask for a first template instead.' },
  { t: 'About five minutes', p: 'Four short steps. Your answers are saved on this device as you go.' },
];

export const STANDARDS: { good: boolean; t: string; p: string }[] = [
  { good: true, t: 'Original work', p: 'You made it yourself, and the fonts, photos and icons in it are ones you may use.' },
  { good: true, t: 'Print-ready', p: 'Right size, 300 DPI images, enough bleed, and text that is not too close to the edge.' },
  { good: true, t: 'Easy to edit', p: 'Real text and shapes that someone else can change in a few taps.' },
  { good: false, t: 'Copied or traced designs', p: 'Work that copies another designer, a brand or a template from somewhere else.' },
  { good: false, t: 'Flattened pictures', p: 'A single image with the words baked in, so nothing can be edited.' },
  { good: false, t: 'Low-resolution images', p: 'Blurry or stretched photos that will look poor once printed.' },
];

export const THEMES = [
  { m: 'Sallah', t: 'Eid greetings and shop promos' },
  { m: 'Back to school', t: 'Departmental and fresher materials' },
  { m: 'Convocation', t: 'Class shirts, programmes and certificates' },
  { m: 'Detty December', t: 'Event posters, parties and gift flyers' },
];

export const LEARN = [
  { t: 'Design on your phone', p: 'You do not need a laptop. The Ifiok editor works on a phone.' },
  { t: 'Print basics', p: 'Bleed, CMYK and 300 DPI explained in plain words, with examples.' },
  { t: 'Submission checklist', p: 'The ten checks reviewers use, so you can pass them before you submit.' },
];

export const FAQ = [
  { q: 'Who can apply?', a: 'Right now the program is open to verified students in Nigeria, NYSC corps members, and individual creators. It is free to join.' },
  { q: 'Who approves my templates?', a: 'The Ifiok team. Every submission is reviewed for quality, originality and print readiness before it is approved.' },
  { q: 'How long does review take?', a: 'About 5 working days. We review quality, not quantity, so send your best work.' },
  { q: 'How do I get paid?', a: 'Your payouts appear on your creator dashboard when you sign in. You add your payout details there after you are approved, so the application never asks for a bank account.' },
  { q: 'Do I need a laptop?', a: 'No. The editor works on a phone, and many creators design entirely on one.' },
  { q: 'What can I submit?', a: 'Original templates such as CVs, flyers, invoices, posters, business cards and wedding invitations. Work you did not make yourself is not accepted.' },
  { q: 'I am not in Nigeria. Can I join?', a: 'Not yet. Join the waitlist below and we will tell you when your country opens.' },
];

export const WAITLIST_COUNTRIES = ['Ghana', 'Kenya', 'South Africa', 'Uganda', 'Tanzania', 'Rwanda', 'Cameroon', "Côte d'Ivoire", 'Senegal', 'Ethiopia', 'Egypt', 'Other'];

export const LEVELS = ['100 level', '200 level', '300 level', '400 level', '500 level', '600 level', 'Postgraduate', 'ND / HND', 'NCE'];

/** Sample of the campus list. The live app keeps the full list in the admin area. */
export const CAMPUSES = [
  'University of Lagos (UNILAG)', 'University of Ibadan (UI)', 'Obafemi Awolowo University (OAU)', 'University of Nigeria, Nsukka (UNN)',
  'Ahmadu Bello University (ABU)', 'University of Benin (UNIBEN)', 'University of Ilorin (UNILORIN)', 'University of Port Harcourt (UNIPORT)',
  'University of Calabar (UNICAL)', 'University of Jos (UNIJOS)', 'University of Maiduguri (UNIMAID)', 'Bayero University Kano (BUK)',
  'Federal University of Technology, Akure (FUTA)', 'Federal University of Technology, Minna (FUTMINNA)', 'Federal University of Technology, Owerri (FUTO)',
  'Nnamdi Azikiwe University (UNIZIK)', 'University of Uyo (UNIUYO)', 'Usmanu Danfodiyo University (UDUS)', 'Federal University of Agriculture, Abeokuta (FUNAAB)',
  'Michael Okpara University of Agriculture, Umudike (MOUAU)', 'University of Abuja (UNIABUJA)', 'Federal University, Oye-Ekiti (FUOYE)', 'Federal University, Lokoja',
  'Federal University, Dutse', 'Federal University, Lafia', 'Federal University, Otuoke', 'Federal University, Wukari', 'National Open University of Nigeria (NOUN)',
  'Lagos State University (LASU)', 'Lagos State University of Science and Technology (LASUSTECH)', 'Ladoke Akintola University of Technology (LAUTECH)',
  'Olabisi Onabanjo University (OOU)', 'Ekiti State University (EKSU)', 'Ambrose Alli University (AAU)', 'Delta State University (DELSU)', 'Rivers State University',
  'Abia State University', 'Enugu State University of Science and Technology (ESUT)', 'Imo State University', 'Kaduna State University (KASU)', 'Kwara State University',
  'Niger Delta University', 'Akwa Ibom State University', 'Benue State University', 'Adekunle Ajasin University (AAUA)', 'Tai Solarin University of Education', 'Osun State University (UNIOSUN)',
  'Covenant University', 'Babcock University', 'Afe Babalola University', 'Bells University of Technology', "Redeemer's University", 'Landmark University', 'Pan-Atlantic University',
  'American University of Nigeria', 'Bowen University', 'Lead City University', 'Baze University', 'Nile University of Nigeria', 'Veritas University', 'Madonna University', 'Caleb University', 'Crawford University',
  'Yaba College of Technology (YABATECH)', 'Federal Polytechnic, Nekede', 'Kaduna Polytechnic', 'Federal Polytechnic, Ilaro', 'The Polytechnic, Ibadan', 'Lagos State Polytechnic (LASPOTECH)', 'Auchi Polytechnic', 'Federal Polytechnic, Bida',
  'Federal College of Education (Technical), Akoka', 'Adeyemi Federal University of Education', 'Alvan Ikoku Federal College of Education',
];
