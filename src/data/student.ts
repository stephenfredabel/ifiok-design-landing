import { BookOpen, GraduationCap, Printer, Users, Wand2, Wrench, type LucideIcon } from 'lucide-react';

/*
 * Student perks. Ifiok controls what is included; edit this list (or the admin area in the live app).
 * The verification flow mirrors the live one: school + ID photo, reviewed by Ifiok, valid for up to a year.
 */
export type Perk = { id: string; title: string; blurb: string; Icon: LucideIcon; status: 'included' | 'soon'; action?: { label: string; view?: string; href?: string } };

export const PERKS: Perk[] = [
  { id: 'templates', title: 'Student templates', blurb: 'CVs, cover letters, assignment covers, project posters and defence slides, ready to edit.', Icon: BookOpen, status: 'included', action: { label: 'Browse templates', view: 'templates' } },
  { id: 'tools', title: 'Free student tools', blurb: 'Merge, split and compress PDFs, scan to PDF and make QR codes, right on your phone.', Icon: Wrench, status: 'included', action: { label: 'Open tools', href: 'https://ifiok.ng/tools' } },
  { id: 'creator', title: 'Earn as a Campus Creator', blurb: 'Make templates for Ifiok. If the team approves one, you are paid.', Icon: Wand2, status: 'included', action: { label: 'See the program', href: '/creators/' } },
  { id: 'collab', title: 'Design with classmates', blurb: 'Edit the same design together with your group, free.', Icon: Users, status: 'soon' },
  { id: 'print', title: 'Student print offers', blurb: 'Offers on printing for verified students, announced here when they are available.', Icon: Printer, status: 'soon' },
];

export const STUDENT_QUICK = ['cv', 'cover', 'slides', 'poster', 'flyer-a5', 'card', 'id'] as const;

export const STUDENT_STEPS = [
  { id: 'account', label: 'Account' },
  { id: 'school', label: 'Your school' },
  { id: 'proof', label: 'Proof' },
  { id: 'review', label: 'Ifiok review' },
] as const;

export const LEVELS = ['100 level', '200 level', '300 level', '400 level', '500 level', '600 level', 'Postgraduate', 'ND / HND', 'NCE'];
export const VALID_MONTHS = 12;
export const ICON = GraduationCap;
