import Navbar from "../../components/layout/navbar";
import Hero from "../../components/layout/hero";
import AppPreview from "../../components/ui/screen";
import Features from "../../components/layout/feature";
import CTA from "../../components/layout/cta";
import Footer from "../../components/layout/feature";

export default function Home() {
  return (
    <>
      <Navbar />
      <Hero />
      <AppPreview />
      <Features />
      <CTA />
      <Footer />
    </>
  );
}
