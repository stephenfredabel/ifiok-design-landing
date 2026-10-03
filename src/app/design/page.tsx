import type { Metadata } from 'next';
import DesignApp from '@/components/design/DesignApp';

export const metadata: Metadata = {
  title: 'Dashboard | Ifiok Designs',
  description: 'Your designs, templates and print orders in one place.',
};

export default function DesignPage() {
  return <DesignApp />;
}
