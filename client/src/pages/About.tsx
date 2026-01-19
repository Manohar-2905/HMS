import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { SEO } from "@/components/layout/SEO";
import { AboutSection } from "@/components/home/AboutSection";

const About = () => {
    return (
        <>
            <Navbar />
            <main>
                <SEO
                    title="About Us | Yashoda Bhavan"
                    description="Learn more about Yashoda Bhavan, our mission, and the people behind your home away from home."
                />

                {/* Page Header */}
                <div className="hero-gradient py-24">
                    <div className="container mx-auto px-4 text-center">
                        <h1 className="font-display text-4xl md:text-5xl font-bold text-primary-foreground mb-4">
                            Our Story
                        </h1>
                        <p className="text-primary-foreground/80 max-w-2xl mx-auto text-lg">
                            Discover the heart and soul of Yashoda Bhavan.
                        </p>
                    </div>
                </div>

                <AboutSection />

                {/* Additional Content could go here */}
            </main>
            <Footer />
        </>
    );
};

export default About;
