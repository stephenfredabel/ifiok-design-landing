/* Menu bar for the Docs editor. Every label is passed through tr() when it is drawn. */
export type MI = {
  id?: string;            // action id handled by DocsEditor.act()
  label?: string;
  icon?: string;          // key of ICONS in DocsEditor
  key?: string;           // shortcut text
  sub?: MI[];             // submenu
  sep?: boolean;          // divider
  badge?: string;
  check?: string;         // name of a toggle shown with a tick
  grid?: boolean;         // the table size picker
  hint?: string;
};

const S: MI = { sep: true };

export const MENUS: { id: string; label: string; items: MI[] }[] = [
  {
    id: 'file', label: 'File', items: [
      { id: 'new', label: 'New document', icon: 'filePlus' },
      { id: 'open', label: 'Open', icon: 'folder', key: 'Ctrl+O' },
      { id: 'copy-doc', label: 'Make a copy', icon: 'copy' },
      S,
      { id: 'share', label: 'Share', icon: 'userPlus', key: 'Ctrl+Alt+S' },
      { id: 'email', label: 'Email this document', icon: 'mail' },
      {
        label: 'Download', icon: 'download', sub: [
          { id: 'dl-pdf', label: 'PDF document (.pdf)' },
          { id: 'dl-doc', label: 'Microsoft Word (.doc)' },
          { id: 'dl-txt', label: 'Plain text (.txt)' },
          { id: 'dl-html', label: 'Web page (.html)' },
          { id: 'dl-md', label: 'Markdown (.md)' },
        ],
      },
      S,
      { id: 'send', label: 'Send to a verified printer', icon: 'printer', badge: 'Ifiok Market' },
      { id: 'rename', label: 'Rename', icon: 'pen', key: 'F2' },
      { id: 'move', label: 'Move to folder', icon: 'folderInput' },
      { id: 'trash', label: 'Move to trash', icon: 'trash' },
      S,
      { id: 'versions', label: 'Version history', icon: 'history' },
      { id: 'offline', label: 'Make available offline', icon: 'cloudOff', check: 'offline' },
      { id: 'details', label: 'Details', icon: 'info' },
      {
        label: 'Language', icon: 'globe', sub: [
          { id: 'lang-en', label: 'English' }, { id: 'lang-fr', label: 'Français' }, { id: 'lang-pcm', label: 'Pidgin' },
          { id: 'lang-yo', label: 'Yorùbá' }, { id: 'lang-ha', label: 'Hausa' }, { id: 'lang-ig', label: 'Igbo' },
        ],
      },
      S,
      { id: 'page-setup', label: 'Page setup', icon: 'fileCog' },
      { id: 'print', label: 'Print', icon: 'printer', key: 'Ctrl+P' },
    ],
  },
  {
    id: 'edit', label: 'Edit', items: [
      { id: 'undo', label: 'Undo', icon: 'undo', key: 'Ctrl+Z' },
      { id: 'redo', label: 'Redo', icon: 'redo', key: 'Ctrl+Y' },
      S,
      { id: 'cut', label: 'Cut', icon: 'scissors', key: 'Ctrl+X' },
      { id: 'copy', label: 'Copy', icon: 'copy', key: 'Ctrl+C' },
      { id: 'paste', label: 'Paste', icon: 'clipboard', key: 'Ctrl+V' },
      { id: 'paste-plain', label: 'Paste without formatting', icon: 'clipboardType', key: 'Ctrl+Shift+V' },
      S,
      { id: 'select-all', label: 'Select all', icon: 'boxSelect', key: 'Ctrl+A' },
      { id: 'delete', label: 'Delete', icon: 'eraser' },
      S,
      { id: 'find', label: 'Find', icon: 'search', key: 'Ctrl+F' },
      { id: 'replace', label: 'Find and replace', icon: 'replace', key: 'Ctrl+H' },
    ],
  },
  {
    id: 'view', label: 'View', items: [
      {
        label: 'Mode', icon: 'pencilLine', sub: [
          { id: 'mode-edit', label: 'Editing', hint: 'Edit the document directly', check: 'mode-edit' },
          { id: 'mode-suggest', label: 'Suggesting', hint: 'Your edits become suggestions', check: 'mode-suggest' },
          { id: 'mode-view', label: 'Viewing', hint: 'Read the final document', check: 'mode-view' },
        ],
      },
      S,
      { id: 'toggle-ruler', label: 'Show ruler', icon: 'ruler', check: 'ruler' },
      { id: 'toggle-outline', label: 'Show document tabs and outline', icon: 'panelLeft', check: 'sidebar' },
      { id: 'toggle-pagebreaks', label: 'Show page dividers', icon: 'split', check: 'dividers' },
      { id: 'toggle-hidden', label: 'Show non-printing characters', icon: 'pilcrow', check: 'hidden' },
      S,
      {
        label: 'Zoom', icon: 'zoomIn', sub: [
          { id: 'zoom-fit', label: 'Fit to width' },
          { id: 'zoom-50', label: '50%' }, { id: 'zoom-75', label: '75%' }, { id: 'zoom-100', label: '100%' },
          { id: 'zoom-125', label: '125%' }, { id: 'zoom-150', label: '150%' }, { id: 'zoom-200', label: '200%' },
        ],
      },
      { id: 'fullscreen', label: 'Full screen', icon: 'maximize' },
      { id: 'toggle-toolbar', label: 'Compact controls', icon: 'chevronUp', key: 'Ctrl+Shift+F', check: 'compact' },
    ],
  },
  {
    id: 'insert', label: 'Insert', items: [
      {
        label: 'Image', icon: 'image', sub: [
          { id: 'img-upload', label: 'Upload from computer', icon: 'upload' },
          { id: 'img-url', label: 'By web address', icon: 'link2' },
          { id: 'img-brand', label: 'From my Ifiok brand kit', icon: 'palette' },
          { id: 'img-design', label: 'From my Ifiok Designs', icon: 'shapes' },
        ],
      },
      { label: 'Table', icon: 'table', sub: [{ grid: true }] },
      {
        label: 'Building blocks', icon: 'blocks', sub: [
          { id: 'bb-meeting', label: 'Meeting notes' }, { id: 'bb-email', label: 'Email draft' }, { id: 'bb-roadmap', label: 'Project roadmap' },
          { id: 'bb-invoice', label: 'Invoice' }, { id: 'bb-cover', label: 'Cover letter' }, { id: 'bb-minutes', label: 'Minutes of meeting' },
        ],
      },
      {
        label: 'Smart chips', icon: 'atSign', sub: [
          { id: 'chip-date', label: 'Date', icon: 'calendar' }, { id: 'chip-person', label: 'People', icon: 'user' },
          { id: 'chip-printer', label: 'Verified printer', icon: 'store', badge: 'Ifiok Market' }, { id: 'chip-file', label: 'File', icon: 'file' },
          { id: 'chip-place', label: 'Place', icon: 'mapPin' },
        ],
      },
      { id: 'esign', label: 'Sign this document', icon: 'signature', badge: 'PDF tools' },
      { id: 'link', label: 'Link', icon: 'link2', key: 'Ctrl+K' },
      { id: 'drawing', label: 'Drawing', icon: 'penTool' },
      {
        label: 'Chart', icon: 'barChart', sub: [
          { id: 'chart-bar', label: 'Bar', icon: 'barChart' }, { id: 'chart-line', label: 'Line', icon: 'lineChart' }, { id: 'chart-pie', label: 'Pie', icon: 'pieChart' },
        ],
      },
      { id: 'qr', label: 'QR code', icon: 'qr', badge: 'Ifiok' },
      { id: 'symbols', label: 'Special characters', icon: 'omega' },
      { id: 'emoji', label: 'Emoji', icon: 'smile' },
      S,
      { id: 'hr', label: 'Horizontal line', icon: 'minus' },
      {
        label: 'Break', icon: 'split', sub: [
          { id: 'pagebreak', label: 'Page break', key: 'Ctrl+Enter' }, { id: 'colbreak', label: 'Column break' },
        ],
      },
      { id: 'comment', label: 'Comment', icon: 'messagePlus', key: 'Ctrl+Alt+M' },
      { id: 'footnote', label: 'Footnote', icon: 'footnote', key: 'Ctrl+Alt+F' },
      { id: 'equation', label: 'Equation', icon: 'sigma' },
      { id: 'bookmark', label: 'Bookmark', icon: 'bookmark' },
      S,
      { id: 'toc', label: 'Table of contents', icon: 'listTree' },
      { id: 'hf', label: 'Headers and footers', icon: 'panelTop' },
      {
        label: 'Page numbers', icon: 'hash', sub: [
          { id: 'pn-footer', label: 'Footer, centred' }, { id: 'pn-header', label: 'Header, right' }, { id: 'pn-off', label: 'No page numbers' },
        ],
      },
    ],
  },
  {
    id: 'format', label: 'Format', items: [
      {
        label: 'Text', icon: 'type', sub: [
          { id: 'bold', label: 'Bold', icon: 'bold', key: 'Ctrl+B' }, { id: 'italic', label: 'Italic', icon: 'italic', key: 'Ctrl+I' },
          { id: 'underline', label: 'Underline', icon: 'underline', key: 'Ctrl+U' }, { id: 'strike', label: 'Strikethrough', icon: 'strikethrough', key: 'Alt+Shift+5' },
          { id: 'sup', label: 'Superscript', icon: 'superscript', key: 'Ctrl+.' }, { id: 'sub', label: 'Subscript', icon: 'subscript', key: 'Ctrl+,' },
          S,
          { label: 'Size', sub: [{ id: 'size-up', label: 'Increase font size', key: 'Ctrl+Shift+.' }, { id: 'size-down', label: 'Decrease font size', key: 'Ctrl+Shift+,' }] },
          { label: 'Capitalisation', sub: [{ id: 'case-lower', label: 'Lowercase' }, { id: 'case-upper', label: 'Uppercase' }, { id: 'case-title', label: 'Title Case' }] },
        ],
      },
      {
        label: 'Paragraph styles', icon: 'heading', sub: [
          { id: 'st-p', label: 'Normal text', key: 'Ctrl+Alt+0' }, { id: 'st-title', label: 'Title' }, { id: 'st-subtitle', label: 'Subtitle' },
          { id: 'st-h1', label: 'Heading 1', key: 'Ctrl+Alt+1' }, { id: 'st-h2', label: 'Heading 2', key: 'Ctrl+Alt+2' }, { id: 'st-h3', label: 'Heading 3', key: 'Ctrl+Alt+3' },
          { id: 'st-quote', label: 'Quote' },
        ],
      },
      {
        label: 'Align and indent', icon: 'alignLeft', sub: [
          { id: 'al-left', label: 'Left', icon: 'alignLeft', key: 'Ctrl+Shift+L' }, { id: 'al-center', label: 'Centre', icon: 'alignCenter', key: 'Ctrl+Shift+E' },
          { id: 'al-right', label: 'Right', icon: 'alignRight', key: 'Ctrl+Shift+R' }, { id: 'al-justify', label: 'Justified', icon: 'alignJustify', key: 'Ctrl+Shift+J' },
          S,
          { id: 'indent', label: 'Increase indent', icon: 'indent', key: 'Ctrl+]' }, { id: 'outdent', label: 'Decrease indent', icon: 'outdent', key: 'Ctrl+[' },
        ],
      },
      {
        label: 'Line and paragraph spacing', icon: 'lineHeight', sub: [
          { id: 'ls-1', label: 'Single' }, { id: 'ls-115', label: '1.15' }, { id: 'ls-15', label: '1.5' }, { id: 'ls-2', label: 'Double' },
          S,
          { id: 'ps-before', label: 'Add space before paragraph' }, { id: 'ps-after', label: 'Add space after paragraph' },
        ],
      },
      {
        label: 'Columns', icon: 'columns', sub: [{ id: 'col-1', label: 'One column' }, { id: 'col-2', label: 'Two columns' }, { id: 'col-3', label: 'Three columns' }],
      },
      {
        label: 'Bullets and numbering', icon: 'list', sub: [
          { id: 'ul', label: 'Bulleted list', icon: 'list', key: 'Ctrl+Shift+8' }, { id: 'ol', label: 'Numbered list', icon: 'listOrdered', key: 'Ctrl+Shift+7' },
          { id: 'check', label: 'Checklist', icon: 'listChecks', key: 'Ctrl+Shift+9' },
        ],
      },
      S,
      { id: 'hf', label: 'Headers and footers', icon: 'panelTop' },
      { id: 'orientation', label: 'Switch page orientation', icon: 'rotate' },
      {
        label: 'Table', icon: 'table', sub: [
          { id: 'tb-row-above', label: 'Insert row above' }, { id: 'tb-row-below', label: 'Insert row below' },
          { id: 'tb-col-left', label: 'Insert column left' }, { id: 'tb-col-right', label: 'Insert column right' },
          S,
          { id: 'tb-del-row', label: 'Delete row' }, { id: 'tb-del-col', label: 'Delete column' }, { id: 'tb-del', label: 'Delete table' },
        ],
      },
      S,
      { id: 'clear-format', label: 'Clear formatting', icon: 'removeFormatting', key: 'Ctrl+\\' },
    ],
  },
  {
    id: 'tools', label: 'Tools', items: [
      { id: 'spell', label: 'Spelling and grammar check', icon: 'spellCheck', check: 'spell', key: 'Ctrl+Alt+X' },
      { id: 'wordcount', label: 'Word count', icon: 'hash', key: 'Ctrl+Shift+C' },
      S,
      { id: 'review', label: 'Review suggested edits', icon: 'listChecks', key: 'Ctrl+Alt+O' },
      { id: 'compare', label: 'Compare documents', icon: 'diff' },
      { id: 'ask', label: 'Ask Ifiok', icon: 'sparkles' },
      {
        label: 'Translate this document', icon: 'languages', sub: [
          { id: 'tl-fr', label: 'Français' }, { id: 'tl-pcm', label: 'Pidgin' }, { id: 'tl-yo', label: 'Yorùbá' }, { id: 'tl-ha', label: 'Hausa' }, { id: 'tl-ig', label: 'Igbo' },
        ],
      },
      { id: 'dictionary', label: 'Dictionary', icon: 'bookOpen', key: 'Ctrl+Shift+Y' },
      S,
      { id: 'voice', label: 'Voice typing', icon: 'mic', key: 'Ctrl+Shift+S' },
      { id: 'notify', label: 'Notification settings', icon: 'bell' },
      { id: 'access', label: 'Accessibility', icon: 'accessibility' },
    ],
  },
  {
    id: 'ext', label: 'Extensions', items: [
      { id: 'ext-market', label: 'Ifiok Market (print)', icon: 'store' },
      { id: 'ext-pdf', label: 'PDF tools', icon: 'fileText' },
      { id: 'ext-brand', label: 'Brand kit', icon: 'palette' },
      { id: 'ext-data', label: 'Data Studio', icon: 'barChart' },
      S,
      { id: 'ext-get', label: 'Get more extensions', icon: 'puzzle' },
    ],
  },
  {
    id: 'help', label: 'Help', items: [
      { id: 'search-menus', label: 'Search the menus', icon: 'search', key: 'Alt+/' },
      S,
      { id: 'help-docs', label: 'Ifiok Docs help', icon: 'lifeBuoy' },
      { id: 'help-learn', label: 'Training and tips', icon: 'graduationCap' },
      { id: 'help-news', label: 'What is new', icon: 'sparkles' },
      S,
      { id: 'report', label: 'Report a problem', icon: 'flag' },
      { id: 'shortcuts', label: 'Keyboard shortcuts', icon: 'keyboard', key: 'Ctrl+/' },
    ],
  },
];

export const FONTS: { family: string; stack: string }[] = [
  { family: 'Arial', stack: 'Arial, Helvetica, sans-serif' },
  { family: 'Archivo', stack: "Archivo, Arial, sans-serif" },
  { family: 'Georgia', stack: 'Georgia, serif' },
  { family: 'Times New Roman', stack: "'Times New Roman', Times, serif" },
  { family: 'Verdana', stack: 'Verdana, Geneva, sans-serif' },
  { family: 'Trebuchet MS', stack: "'Trebuchet MS', sans-serif" },
  { family: 'Tahoma', stack: 'Tahoma, Geneva, sans-serif' },
  { family: 'Courier New', stack: "'Courier New', monospace" },
  { family: 'Comic Sans MS', stack: "'Comic Sans MS', cursive" },
];

export const STYLES: { id: string; label: string; cls?: string; el: string }[] = [
  { id: 'p', label: 'Normal text', el: 'p' },
  { id: 'title', label: 'Title', el: 'p', cls: 'dx-title' },
  { id: 'subtitle', label: 'Subtitle', el: 'p', cls: 'dx-subtitle' },
  { id: 'h1', label: 'Heading 1', el: 'h1' },
  { id: 'h2', label: 'Heading 2', el: 'h2' },
  { id: 'h3', label: 'Heading 3', el: 'h3' },
  { id: 'quote', label: 'Quote', el: 'blockquote' },
];

export const SIZES = [8, 9, 10, 11, 12, 14, 16, 18, 24, 30, 36, 48, 60, 72];
export const SPACINGS = [{ v: '1', label: 'Single' }, { v: '1.15', label: '1.15' }, { v: '1.5', label: '1.5' }, { v: '2', label: 'Double' }];

export const SYMBOL_GROUPS: { id: string; label: string; chars: string }[] = [
  { id: 'ng', label: 'Nigerian letters', chars: 'ẹ ọ ṣ ɓ ɗ ƙ ị ụ ṅ ɔ ɛ ŋ Ẹ Ọ Ṣ Ɓ Ɗ Ƙ Ị Ụ à á è é ì í ò ó ù ú ǹ ń ā ē ī ō ū' },
  { id: 'cur', label: 'Currency', chars: '₦ $ € £ ¥ ₵ ₹ ¢ ₣ ₿ ƒ ¤' },
  { id: 'pun', label: 'Punctuation', chars: '“ ” ‘ ’ « » – — … • · † ‡ § ¶ © ® ™ ° ‰ № ¿ ¡' },
  { id: 'math', label: 'Maths', chars: '± × ÷ ≠ ≈ ≤ ≥ ∞ √ ∑ ∏ ∫ ∂ π Δ Ω µ ½ ¼ ¾ ² ³ ⁿ' },
  { id: 'arr', label: 'Arrows', chars: '← → ↑ ↓ ↔ ↕ ⇐ ⇒ ⇑ ⇓ ⇔ ➔ ➜ ✓ ✔ ✗ ✘ ★ ☆ ♥ ☎ ✉' },
  { id: 'emo', label: 'Emoji', chars: '😀 😂 😍 🙏🏾 👍🏾 👏🏾 🎉 🔥 💡 ✅ ❌ ⭐ 📌 📎 📄 🖨️ 🇳🇬 🤝🏾 💪🏾 ❤️' },
];

export const SHORTCUTS: { group: string; rows: { label: string; key: string }[] }[] = [
  { group: 'Text', rows: [{ label: 'Bold', key: 'Ctrl+B' }, { label: 'Italic', key: 'Ctrl+I' }, { label: 'Underline', key: 'Ctrl+U' }, { label: 'Insert link', key: 'Ctrl+K' }, { label: 'Clear formatting', key: 'Ctrl+\\' }] },
  { group: 'Paragraph', rows: [{ label: 'Normal text', key: 'Ctrl+Alt+0' }, { label: 'Heading 1', key: 'Ctrl+Alt+1' }, { label: 'Heading 2', key: 'Ctrl+Alt+2' }, { label: 'Bulleted list', key: 'Ctrl+Shift+8' }, { label: 'Numbered list', key: 'Ctrl+Shift+7' }] },
  { group: 'Edit', rows: [{ label: 'Undo', key: 'Ctrl+Z' }, { label: 'Redo', key: 'Ctrl+Y' }, { label: 'Select all', key: 'Ctrl+A' }, { label: 'Find', key: 'Ctrl+F' }, { label: 'Find and replace', key: 'Ctrl+H' }] },
  { group: 'Document', rows: [{ label: 'Page break', key: 'Ctrl+Enter' }, { label: 'Add comment', key: 'Ctrl+Alt+M' }, { label: 'Word count', key: 'Ctrl+Shift+C' }, { label: 'Search the menus', key: 'Alt+/' }, { label: 'Print', key: 'Ctrl+P' }] },
];
