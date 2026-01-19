import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { HeroSection } from "@/components/home/HeroSection";
import { FacilitiesSection } from "@/components/home/FacilitiesSection";
import { RoomsPreview } from "@/components/home/RoomsPreview";
import { RulesSection } from "@/components/home/RulesSection";
import { CTASection } from "@/components/home/CTASection";
import { SEO } from "@/components/layout/SEO";
import { GallerySection } from "@/components/home/GallerySection";
import { AboutSection } from "@/components/home/AboutSection";

const Home = () => {
    return (
        <>
            <Navbar />
            <main>
                <SEO />
                <HeroSection />
                <FacilitiesSection />
                <RoomsPreview />
                <GallerySection />
                <RulesSection />
                <AboutSection />
                <CTASection />
            </main>
            <Footer />
        </>
    );
};

export default Home;
