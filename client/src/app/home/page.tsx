import Navbar from "../../components/layout/navbar";
import Hero from "../../components/layout/hero";
import AppPreview from "../../components/ui/screen";
import Features from "../../components/layout/feature";
import CTA from "../../components/layout/cta";
import Footer from "../../components/layout/footer";

export default function Home() {
  return (
    <>
      <div>
        <Navbar />
        <Hero />
        <AppPreview />
        <Features />
        <CTA />
        <Footer />
      </div>
    </>
  );
}
