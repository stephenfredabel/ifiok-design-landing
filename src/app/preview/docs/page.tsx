import type { Metadata } from 'next';
import EditorShell from '@/components/editor/EditorShell';

export const metadata: Metadata = {
  title: 'Docs editor preview | Ifiok',
  description: 'A clickable preview of the new Ifiok Docs editor.',
  robots: { index: false },
};

export default function Page() {
  return <EditorShell mode="doc" />;
}
