import type { Metadata } from 'next';
import AppDashboard from '@/components/AppDashboard';
import Footer from '@/components/Footer';
import Header from '@/components/Header';

export const metadata: Metadata = {
  title: 'Get the apps | Ifiok',
  description: 'Every Ifiok app in one place: Market, Designs, Tools, Vigil and Customer Journey & Conversion, on the web and on Android.',
};

export default function GetAppPage() {
  return (
    <>
      <Header />
      <main id="top">
        <AppDashboard />
      </main>
      <Footer />
    </>
  );
}
