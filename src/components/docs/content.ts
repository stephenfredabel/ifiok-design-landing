import { tr } from '@/i18n/tr';
import { esc } from './engine';

/* Sample content for the Docs mockup. Built with tr() so it follows the language the person picked. */
export const startHtml = () => `
<p class="dx-title">${esc(tr('Project proposal: community print kiosk'))}</p>
<p class="dx-subtitle">${esc(tr("Prepared for the Ikeja Traders' Association. Draft one, 12 July."))}</p>
<h1>${esc(tr('Summary'))}</h1>
<p>${esc(tr('We propose a small print kiosk at the Ikeja market gate. Traders design their flyers and receipts on their phones, send them to a verified printer nearby and collect the same day. This document explains the cost, the timeline and what we need from the association.'))}</p>
<h1>${esc(tr('What it costs'))}</h1>
<ul><li>${esc(tr('Set-up: ₦185,000 once'))}</li><li>${esc(tr('Running cost: ₦42,000 a month'))}</li><li>${esc(tr('Printing is paid per job to the printer'))}</li></ul>
<h1>${esc(tr('Timeline'))}</h1>
<p>${esc(tr('Four weeks from approval: week one for the site, week two for the kiosk, week three for training and week four for the launch.'))}</p>
<h2>${esc(tr('Risks'))}</h2>
<p>${esc(tr('Power cuts and paper supply are the two risks. A small inverter and a paper deal with the printer cover both.'))}</p>
<h1>${esc(tr('Next steps'))}</h1>
<p>${esc(tr('Please review this draft and send comments by Friday. Type / on an empty line to add a heading, a list or a divider.'))}</p>`;

export const blankHtml = () => '<p><br></p>';

export function blockHtml(id: string): string {
  switch (id) {
    case 'meeting': return `<h1>${esc(tr('Meeting notes'))}</h1><p><b>${esc(tr('Date'))}:</b> </p><p><b>${esc(tr('Attendees'))}:</b> </p><h2>${esc(tr('Agenda'))}</h2><ul><li><br></li></ul><h2>${esc(tr('Decisions'))}</h2><ul><li><br></li></ul><h2>${esc(tr('Action items'))}</h2><ul class="dx-check"><li><br></li></ul>`;
    case 'email': return `<p><b>${esc(tr('To'))}:</b> </p><p><b>${esc(tr('Subject'))}:</b> </p><p>${esc(tr('Dear'))} ,</p><p><br></p><p>${esc(tr('Kind regards'))},</p>`;
    case 'roadmap': return `<h1>${esc(tr('Project roadmap'))}</h1><table class="dx-table"><tbody><tr><td><b>${esc(tr('Phase'))}</b></td><td><b>${esc(tr('Owner'))}</b></td><td><b>${esc(tr('Due'))}</b></td></tr><tr><td><br></td><td><br></td><td><br></td></tr><tr><td><br></td><td><br></td><td><br></td></tr></tbody></table><p><br></p>`;
    case 'invoice': return `<h1>${esc(tr('Invoice'))} 0042</h1><table class="dx-table"><tbody><tr><td><b>${esc(tr('Item'))}</b></td><td><b>${esc(tr('Qty'))}</b></td><td><b>${esc(tr('Price'))}</b></td></tr><tr><td><br></td><td><br></td><td><br></td></tr></tbody></table><p><b>${esc(tr('Total'))}:</b> ₦</p>`;
    case 'cover': return `<p>${esc(tr('Dear Hiring Manager,'))}</p><p>${esc(tr('I am writing to apply for the position. I would welcome the chance to talk about how I can help your team.'))}</p><p>${esc(tr('Yours sincerely,'))}</p>`;
    case 'minutes': return `<h1>${esc(tr('Minutes of meeting'))}</h1><p><b>${esc(tr('Present'))}:</b> </p><p><b>${esc(tr('Apologies'))}:</b> </p><h2>${esc(tr('Matters arising'))}</h2><p><br></p><h2>${esc(tr('Any other business'))}</h2><p><br></p>`;
    default: return '';
  }
}

export const TEMPLATE_LIST = [
  { id: 'proposal', name: 'Project proposal' },
  { id: 'invoice', name: 'Invoice' },
  { id: 'cover', name: 'Cover letter' },
  { id: 'minutes', name: 'Minutes of meeting' },
  { id: 'blank', name: 'Blank document' },
];
export function templateHtml(id: string): string {
  if (id === 'proposal') return startHtml();
  if (id === 'blank') return blankHtml();
  if (id === 'invoice') return `<p class="dx-title">${esc(tr('Invoice'))} 0042</p><p class="dx-subtitle">Okafor Bakes · Ikeja, Lagos</p>${blockHtml('invoice').replace(/<h1>.*?<\/h1>/, '')}`;
  if (id === 'cover') return `<p class="dx-title">${esc(tr('Cover letter'))}</p><p class="dx-subtitle">${esc(tr('Graduate trainee application'))}</p>${blockHtml('cover')}`;
  return blockHtml('minutes');
}

export const RECENT = [
  { id: 'r1', title: 'Project proposal', when: 'Edited today', tpl: 'proposal' },
  { id: 'r2', title: 'Invoice 0042', when: 'Edited yesterday', tpl: 'invoice' },
  { id: 'r3', title: 'Cover letter', when: 'Edited 3 days ago', tpl: 'cover' },
  { id: 'r4', title: 'Minutes of meeting', when: 'Edited last week', tpl: 'minutes' },
];

export const FOLDERS = [{ id: 'f1', name: 'Projects' }, { id: 'f2', name: 'School' }, { id: 'f3', name: 'Business' }, { id: 'f4', name: 'Personal' }];

export const VERSIONS = [
  { id: 'v0', name: 'Current version', who: 'You', when: 'Just now' },
  { id: 'v1', name: 'Saved by Tunde', who: 'Tunde', when: 'Today, 9:41 am' },
  { id: 'v2', name: 'Saved by Amina', who: 'Amina', when: 'Yesterday, 4:12 pm' },
  { id: 'v3', name: 'First draft', who: 'You', when: '12 July, 11:05 am' },
];

export const PEOPLE = [{ id: 'u1', full: 'Tunde Adebayo' }, { id: 'u2', full: 'Amina Bello' }, { id: 'u3', full: 'Chioma Eze' }];

export const SEED_COMMENTS = [
  { id: 'c1', who: 'Tunde', text: 'Can we confirm the set-up cost with the printer first?', when: '2h', done: false },
  { id: 'c2', who: 'Amina', text: 'The timeline looks tight. Maybe add a week for training.', when: 'Yesterday', done: false },
];

export const AI_ACTIONS = ['Make it shorter', 'Fix spelling', 'Make it more formal', 'Summarise', 'Translate to Yorùbá'];
export const DOC_SIZES = [
  { id: 'a4', label: 'A4', w: 794, h: 1123 }, { id: 'letter', label: 'Letter', w: 816, h: 1056 },
  { id: 'legal', label: 'Legal', w: 816, h: 1344 }, { id: 'a5', label: 'A5', w: 559, h: 794 },
];
export const MARGIN_PRESETS = [{ id: 'normal', label: 'Normal', px: 96 }, { id: 'narrow', label: 'Narrow', px: 48 }, { id: 'moderate', label: 'Moderate', px: 72 }, { id: 'wide', label: 'Wide', px: 120 }];
export const PAGE_COLOURS = ['#ffffff', '#fff8e1', '#f1f8e9', '#e3f2fd', '#fce4ec', '#f3f0ff', '#f5f5f5'];
