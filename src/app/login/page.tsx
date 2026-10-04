import type { Metadata } from 'next';
import LoginForm from '@/components/auth/LoginForm';

export const metadata: Metadata = {
  title: 'Log in | Ifiok',
  description: 'Log in to your Ifiok designs, orders and earnings.',
};

export default function LoginPage() {
  return <LoginForm />;
}
