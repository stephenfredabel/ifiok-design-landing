import type { Metadata } from 'next';
import DesignApp from '@/components/design/DesignApp';

export const metadata: Metadata = {
  title: 'Students | Ifiok',
  description: 'Free for students. Verify once with your school ID and unlock student perks.',
};

export default function StudentPage() {
  return <DesignApp student />;
}
