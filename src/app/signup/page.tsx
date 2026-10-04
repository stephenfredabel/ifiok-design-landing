import type { Metadata } from 'next';
import SignupForm from '@/components/auth/SignupForm';

export const metadata: Metadata = {
  title: 'Create an account | Ifiok',
  description: 'Create a free Ifiok account to design, print, learn and earn.',
};

export default function SignupPage() {
  return <SignupForm />;
}
