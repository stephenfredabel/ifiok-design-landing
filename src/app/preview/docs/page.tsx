import type { Metadata } from 'next';
import DocsEditor from '@/components/docs/DocsEditor';

export const metadata: Metadata = {
  title: 'Docs editor preview | Ifiok',
  description: 'A clickable preview of the new Ifiok Docs editor.',
  robots: { index: false },
};

export default function Page() {
  return <DocsEditor />;
}
