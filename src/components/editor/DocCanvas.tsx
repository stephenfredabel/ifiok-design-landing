'use client';

import { Bold, Heading1, Heading2, Highlighter, Italic, Link2, List, MessageSquarePlus, Minus, Sparkles, Table2, Underline } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { tr } from '@/i18n/tr';

type Pos = { x: number; y: number };
const run = (cmd: string, v?: string) => { document.execCommand(cmd, false, v); };

/** A real, editable page. Click anywhere to type, Ctrl+A selects everything, select text to format it, type / on an empty line for blocks. */
export default function DocCanvas({ edRef, html, editable, onChange, onComment, onAsk, zoom }: {
  edRef: React.RefObject<HTMLDivElement | null>; html: string; editable: boolean; onChange: () => void; onComment: (text: string) => void; onAsk: (text: string) => void; zoom: number;
}) {
  const [bar, setBar] = useState<Pos | null>(null);
  const [slash, setSlash] = useState<Pos | null>(null);

  useEffect(() => { if (edRef.current) { edRef.current.innerHTML = html; onChange(); } }, [html]); // eslint-disable-line react-hooks/exhaustive-deps

  const measure = useCallback(() => {
    const s = document.getSelection();
    const ed = edRef.current;
    if (!s || !ed || s.rangeCount === 0 || s.isCollapsed || !ed.contains(s.anchorNode)) { setBar(null); return; }
    const r = s.getRangeAt(0).getBoundingClientRect();
    if (!r.width) { setBar(null); return; }
    setBar({ x: r.left + r.width / 2, y: Math.max(8, r.top - 54) });
  }, [edRef]);
  useEffect(() => {
    document.addEventListener('selectionchange', measure);
    window.addEventListener('scroll', measure, true);
    return () => { document.removeEventListener('selectionchange', measure); window.removeEventListener('scroll', measure, true); };
  }, [measure]);

  const onKeyUp = () => {
    const s = document.getSelection();
    const node = s?.anchorNode;
    const block = node && (node.nodeType === 3 ? node.parentElement : (node as HTMLElement));
    if (s && s.isCollapsed && block && block.textContent === '/' && edRef.current?.contains(block)) {
      const r = (block as HTMLElement).getBoundingClientRect();
      const h = 230; // menu height
      const y = r.bottom + 6 + h > window.innerHeight ? Math.max(8, r.top - h - 6) : r.bottom + 6;
      setSlash({ x: Math.max(8, Math.min(r.left, window.innerWidth - 236)), y });
    } else setSlash(null);
  };
  const pick = (fn: () => void) => { run('delete'); fn(); setSlash(null); onChange(); };
  const keep = (e: React.MouseEvent) => e.preventDefault();

  return (
    <div className="ex-docstage">
      <div className="ex-docscale" style={{ transform: `scale(${zoom})`, transformOrigin: 'top center' }}>
        <div
          ref={edRef}
          className="ex-sheet"
          contentEditable={editable}
          suppressContentEditableWarning
          spellCheck
          role="textbox"
          aria-multiline="true"
          aria-label={tr('Document')}
          onInput={onChange}
          onKeyUp={onKeyUp}
          onKeyDown={(e) => { if (e.key === 'Escape') setSlash(null); }}
        />
      </div>

      {bar && editable && (
        <div className="ex-ctx ex-float" style={{ left: bar.x, top: bar.y }} role="toolbar" aria-label={tr('Text tools')} onMouseDown={keep}>
          <button type="button" aria-label={tr('Bold')} onClick={() => run('bold')}><Bold aria-hidden="true" /></button>
          <button type="button" aria-label={tr('Italic')} onClick={() => run('italic')}><Italic aria-hidden="true" /></button>
          <button type="button" aria-label={tr('Underline')} onClick={() => run('underline')}><Underline aria-hidden="true" /></button>
          <button type="button" aria-label={tr('Highlight')} onClick={() => run('hiliteColor', '#FDE68A')}><Highlighter aria-hidden="true" /></button>
          <button type="button" aria-label={tr('Link')} onClick={() => { const u = window.prompt(tr('Link address'), 'https://'); if (u) run('createLink', u); }}><Link2 aria-hidden="true" /></button>
          <i className="ex-sep" aria-hidden="true" />
          <button type="button" aria-label={tr('Comment')} onClick={() => onComment(document.getSelection()?.toString() ?? '')}><MessageSquarePlus aria-hidden="true" /></button>
          <button type="button" className="ex-ask" onClick={() => onAsk(document.getSelection()?.toString() ?? '')}><Sparkles aria-hidden="true" />{tr('Ask Ifiok')}</button>
        </div>
      )}

      {slash && editable && (
        <div className="ex-slash" style={{ left: slash.x, top: slash.y }} role="menu" aria-label={tr('Insert a block')} onMouseDown={keep}>
          <button type="button" role="menuitem" onClick={() => pick(() => run('formatBlock', 'h1'))}><Heading1 aria-hidden="true" />{tr('Heading 1')}</button>
          <button type="button" role="menuitem" onClick={() => pick(() => run('formatBlock', 'h2'))}><Heading2 aria-hidden="true" />{tr('Heading 2')}</button>
          <button type="button" role="menuitem" onClick={() => pick(() => run('insertUnorderedList'))}><List aria-hidden="true" />{tr('Bulleted list')}</button>
          <button type="button" role="menuitem" onClick={() => pick(() => run('insertHTML', '<table><tbody><tr><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td></tr><tr><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td></tr></tbody></table><p><br></p>'))}><Table2 aria-hidden="true" />{tr('Table')}</button>
          <button type="button" role="menuitem" onClick={() => pick(() => run('insertHorizontalRule'))}><Minus aria-hidden="true" />{tr('Divider')}</button>
        </div>
      )}
    </div>
  );
}
