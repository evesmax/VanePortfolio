import Navigation from "@/components/navigation";
import HeroSection from "@/components/hero-section";
import FeaturedWork from "@/components/featured-work";
import AboutSection from "@/components/about-section";
import PortfolioGallery from "@/components/portfolio-gallery";
import ServicesSection from "@/components/services-section";
import ContactSection from "@/components/contact-section";
import Footer from "@/components/footer";
import Lightbox, { LightboxProvider, useLightbox } from "@/components/lightbox";

function HomeContent() {
  const { openLightbox } = useLightbox();

  const handleImageClick = (image: string, images: string[]) => {
    openLightbox(image, images);
  };

  return (
    <div className="font-sans text-gray-800 scroll-smooth">
      <Navigation />
      <HeroSection />
      <FeaturedWork onImageClick={handleImageClick} />
      <AboutSection />
      <PortfolioGallery onImageClick={handleImageClick} />
      <ServicesSection />
      <ContactSection />
      <Footer />
      <Lightbox />
    </div>
  );
}

export default function Home() {
  return (
    <LightboxProvider>
      <HomeContent />
    </LightboxProvider>
  );
}
