import Header from "@/components/Header";
import Hero from "@/components/Hero";
import SocialProof from "@/components/SocialProof";
import Templates from "@/components/Templates";
import Features from "@/components/Features";
import Workflow from "@/components/Workflow";
import Pricing from "@/components/Pricing";
import Testimonials from "@/components/Testimonials";
import FinalCTA from "@/components/FinalCTA";
import Footer from "@/components/Footer";

export default function HomePage() {
  return (
    <main className="bg-[#f8fafc] text-slate-900">
      <Header />
      <Hero />
      <SocialProof />
      <Templates />
      <Features />
      <Workflow />
      <Pricing />
      <Testimonials />
      <FinalCTA />
      <Footer />
    </main>
  );
}
