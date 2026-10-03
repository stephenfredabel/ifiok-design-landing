import type { Metadata } from 'next';
import CreatorApp from '@/components/creator/CreatorApp';

export const metadata: Metadata = {
  title: 'Creator dashboard | Ifiok Creators',
  description: 'Design templates, submit them for review and follow your payouts.',
};

export default function CreatorDashboardPage() {
  return <CreatorApp />;
}
