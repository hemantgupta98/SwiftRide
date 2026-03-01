import Navbar from "../../components/layout/navbar";
import Hero from "../../components/layout/hero";
import AppPreview from "../../components/ui/screen";
import Booking from "../../components/ui/booking";
import Features from "../../components/layout/feature";
import CTA from "../../components/layout/cta";
import Footer from "../../components/layout/footer";
import Work from "../../components/layout/work";
import Service from "../../components/layout/service";
import Why from "../../components/layout/why";
export default function Home() {
  return (
    <>
      <div>
        <Navbar />
        <Hero />
        <AppPreview />
        <Features />
        <CTA />
        <Booking />
        <Work />
        <Service />
        <Why />
        <Footer />
      </div>
    </>
  );
}
