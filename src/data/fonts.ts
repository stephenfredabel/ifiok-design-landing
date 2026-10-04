/*
 * Fonts: the library everyone can use, and the fonts creators make. Sample fonts below are real open-source
 * Google Fonts, used only so the prototype can show real type. The live app serves approved creator fonts.
 */
export type FontCat = 'Sans' | 'Serif' | 'Script' | 'Display' | 'Handwriting' | 'Mono';
export const FONT_CATS: FontCat[] = ['Sans', 'Serif', 'Script', 'Display', 'Handwriting', 'Mono'];
export const FONT_TAGS = ['Bold', 'Light', 'Rounded', 'Condensed', 'Wide', 'Elegant', 'Playful', 'Retro', 'African-inspired', 'Good for posters', 'Good for body text'];

export type FontStatus = 'draft' | 'review' | 'changes' | 'approved' | 'rejected';
export type FontFile = { name: string; size: number; style: string };

export type FontEntry = {
  id: string;
  family: string;
  /** CSS family name used to draw it. For samples this is a Google Fonts family. */
  css: string;
  by: string;
  cat: FontCat;
  tags: string[];
  styles: string[];
  marks: { yoruba: boolean; igbo: boolean; hausa: boolean };
  /** True for sample library fonts loaded from Google Fonts. */
  sample?: boolean;
  /** Creator-owned fonts only. */
  mine?: boolean;
  status?: FontStatus;
  updated?: string;
  submitted?: string;
  decided?: string;
  license?: string;
  description?: string;
  files?: FontFile[];
  /** Base64 data URL kept so the prototype can show the real uploaded font after a reload (small files only). */
  data?: { name: string; url: string }[];
  notes?: { by: 'reviewer' | 'you'; text: string; when: string }[];
};

const none = { yoruba: false, igbo: false, hausa: false };
const latin = { yoruba: true, igbo: true, hausa: false };

export const LIBRARY: FontEntry[] = [
  { id: 'f-archivo', family: 'Archivo', css: 'Archivo', by: 'Sample (open source)', cat: 'Sans', tags: ['Bold', 'Good for posters', 'Good for body text'], styles: ['Regular', 'Medium', 'SemiBold', 'Bold', 'ExtraBold'], marks: latin, sample: true },
  { id: 'f-poppins', family: 'Poppins', css: 'Poppins', by: 'Sample (open source)', cat: 'Sans', tags: ['Rounded', 'Good for body text'], styles: ['Light', 'Regular', 'Medium', 'SemiBold', 'Bold'], marks: none, sample: true },
  { id: 'f-oswald', family: 'Oswald', css: 'Oswald', by: 'Sample (open source)', cat: 'Sans', tags: ['Condensed', 'Good for posters'], styles: ['Light', 'Regular', 'Medium', 'SemiBold', 'Bold'], marks: latin, sample: true },
  { id: 'f-playfair', family: 'Playfair Display', css: 'Playfair Display', by: 'Sample (open source)', cat: 'Serif', tags: ['Elegant', 'Good for posters'], styles: ['Regular', 'Medium', 'SemiBold', 'Bold', 'Italic'], marks: latin, sample: true },
  { id: 'f-merri', family: 'Merriweather', css: 'Merriweather', by: 'Sample (open source)', cat: 'Serif', tags: ['Good for body text'], styles: ['Light', 'Regular', 'Bold', 'Italic'], marks: latin, sample: true },
  { id: 'f-dmserif', family: 'DM Serif Display', css: 'DM Serif Display', by: 'Sample (open source)', cat: 'Serif', tags: ['Elegant', 'Good for posters'], styles: ['Regular', 'Italic'], marks: none, sample: true },
  { id: 'f-pacifico', family: 'Pacifico', css: 'Pacifico', by: 'Sample (open source)', cat: 'Script', tags: ['Playful', 'Retro'], styles: ['Regular'], marks: latin, sample: true },
  { id: 'f-dancing', family: 'Dancing Script', css: 'Dancing Script', by: 'Sample (open source)', cat: 'Script', tags: ['Elegant'], styles: ['Regular', 'Medium', 'SemiBold', 'Bold'], marks: latin, sample: true },
  { id: 'f-bebas', family: 'Bebas Neue', css: 'Bebas Neue', by: 'Sample (open source)', cat: 'Display', tags: ['Condensed', 'Bold', 'Good for posters'], styles: ['Regular'], marks: none, sample: true },
  { id: 'f-lobster', family: 'Lobster', css: 'Lobster', by: 'Sample (open source)', cat: 'Display', tags: ['Retro', 'Playful'], styles: ['Regular'], marks: latin, sample: true },
  { id: 'f-caveat', family: 'Caveat', css: 'Caveat', by: 'Sample (open source)', cat: 'Handwriting', tags: ['Playful'], styles: ['Regular', 'Medium', 'SemiBold', 'Bold'], marks: none, sample: true },
  { id: 'f-spacemono', family: 'Space Mono', css: 'Space Mono', by: 'Sample (open source)', cat: 'Mono', tags: ['Retro', 'Wide'], styles: ['Regular', 'Bold', 'Italic'], marks: latin, sample: true },
];

/** Fonts the signed-in creator has made (sample). Real font files can be uploaded in the prototype. */
export const MY_FONTS: FontEntry[] = [
  { id: 'm1', family: 'Naija Sans', css: 'Archivo', by: 'You', cat: 'Sans', tags: ['Bold'], styles: ['Regular', 'Bold'], marks: latin, sample: true, mine: true, status: 'approved', updated: '20 Sep', submitted: '15 Sep', decided: '20 Sep', license: 'I made this font', description: 'Example entry. Upload your own font file to replace it.', files: [], notes: [{ by: 'reviewer', text: 'Clean spacing and complete character set. Approved.', when: '20 Sep' }] },
  { id: 'm2', family: 'Owambe Script', css: 'Lobster', by: 'You', cat: 'Display', tags: ['Retro'], styles: ['Regular'], marks: latin, sample: true, mine: true, status: 'review', updated: '2 Oct', submitted: '2 Oct', license: 'I made this font', description: 'Example entry in review.', files: [], notes: [] },
  { id: 'm3', family: 'Kano Hand', css: 'Caveat', by: 'You', cat: 'Handwriting', tags: ['Playful'], styles: ['Regular'], marks: none, sample: true, mine: true, status: 'changes', updated: '1 Oct', submitted: '28 Sep', license: 'I made this font', description: 'Example entry with feedback.', files: [], notes: [{ by: 'reviewer', text: 'The letters ẹ and ọ are missing their dots. Please add them, or remove the Yorùbá tick, then resubmit.', when: '1 Oct' }] },
];

export const fontStack = (f: Pick<FontEntry, 'css' | 'cat'>) => `"${f.css}", ${f.cat === 'Serif' ? 'Georgia, serif' : f.cat === 'Mono' ? 'ui-monospace, monospace' : f.cat === 'Script' || f.cat === 'Handwriting' ? 'cursive' : 'system-ui, sans-serif'}`;

/** One Google Fonts request for every sample family, so a sample shows in its real face. */
export const GOOGLE_FONTS_HREF = `https://fonts.googleapis.com/css2?${Array.from(new Set(LIBRARY.map((f) => f.css)))
  .map((c) => `family=${c.replace(/ /g, '+')}`)
  .join('&')}&display=swap`;

export const SPECIMEN = {
  upper: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
  lower: 'abcdefghijklmnopqrstuvwxyz',
  nums: '0123456789 ₦ & @ # % ! ? ( )',
  yoruba: 'ẹ ọ ṣ Ẹ Ọ Ṣ à á è é ì í ò ó ù ú',
  igbo: 'ị ọ ụ ṅ Ị Ọ Ụ Ṅ',
  hausa: 'ɓ ɗ ƙ ƴ Ɓ Ɗ Ƙ Ƴ',
  line: 'The quick brown fox jumps over the lazy dog',
};
