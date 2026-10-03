import type { Metadata } from 'next';
import CreatorsPage from '@/components/creators/CreatorsPage';
import Footer from '@/components/Footer';
import Header from '@/components/Header';

export const metadata: Metadata = {
  title: 'Ifiok Creators | Get paid for what you design',
  description: 'Design templates for Ifiok. When the team approves them, you get paid. Open to verified students in Nigeria.',
};

export default function CreatorsRoute() {
  return (
    <>
      <Header />
      <main id="top-main">
        <CreatorsPage />
      </main>
      <Footer />
    </>
  );
}
