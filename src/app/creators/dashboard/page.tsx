import type { Metadata } from 'next';
import DesignApp from '@/components/design/DesignApp';

export const metadata: Metadata = {
  title: 'Creator dashboard | Ifiok Creators',
  description: 'Design templates, submit them for review and follow your payouts.',
};

export default function CreatorDashboardPage() {
  return <DesignApp creator />;
}
