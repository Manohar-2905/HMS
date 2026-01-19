import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Star, Users, Shield } from "lucide-react";

export function HeroSection() {
    return (
        <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
            {/* Background */}
            <div className="absolute inset-0 hero-gradient" />

            {/* Decorative Elements */}
            <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-float" />
            <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-float delay-300" />

            {/* Pattern Overlay */}
            <div className="absolute inset-0 opacity-5" style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
            }} />

            <div className="container mx-auto px-4 relative z-10">
                <div className="max-w-4xl mx-auto text-center">
                    {/* Badge */}
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 backdrop-blur-sm mb-8 animate-fade-in">
                        <Star className="w-4 h-4 text-primary fill-primary" />
                        <span className="text-sm font-medium text-primary-foreground/90">Premium Hostel Experience</span>
                    </div>

                    {/* Heading */}
                    <h1 className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-primary-foreground mb-6 animate-slide-up">
                        Your Home
                    </h1>

                    {/* Description */}
                    <p className="text-lg md:text-xl text-primary-foreground/70 max-w-2xl mx-auto mb-10 animate-slide-up delay-100">
                        Experience comfortable living with modern amenities, a vibrant community, and the perfect environment for studying and growing together.
                    </p>

                    {/* CTA Buttons */}
                    <div className="flex flex-col sm:flex-row gap-4 justify-center animate-slide-up delay-200">
                        <Button variant="hero" size="xl" asChild>
                            <Link to="/rooms">
                                Explore Rooms
                                <ArrowRight className="w-5 h-5" />
                            </Link>
                        </Button>
                        <Button variant="heroOutline" size="xl" asChild>
                            <Link to="/contact">Contact Us</Link>
                        </Button>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-3 gap-8 mt-16 animate-fade-in delay-300">
                        <div className="text-center">
                            <div className="flex justify-center mb-2">
                                <Users className="w-6 h-6 text-primary" />
                            </div>
                            <div className="font-display text-2xl md:text-3xl font-bold text-primary-foreground">500+</div>
                            <div className="text-sm text-primary-foreground/60">Happy Residents</div>
                        </div>
                        <div className="text-center">
                            <div className="flex justify-center mb-2">
                                <Star className="w-6 h-6 text-primary fill-primary" />
                            </div>
                            <div className="font-display text-2xl md:text-3xl font-bold text-primary-foreground">4.9</div>
                            <div className="text-sm text-primary-foreground/60">Average Rating</div>
                        </div>
                        <div className="text-center">
                            <div className="flex justify-center mb-2">
                                <Shield className="w-6 h-6 text-primary" />
                            </div>
                            <div className="font-display text-2xl md:text-3xl font-bold text-primary-foreground">24/7</div>
                            <div className="text-sm text-primary-foreground/60">Security</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Scroll Indicator */}
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
                <div className="w-6 h-10 rounded-full border-2 border-primary-foreground/30 flex items-start justify-center p-2">
                    <div className="w-1.5 h-3 bg-primary rounded-full" />
                </div>
            </div>
        </section>
    );
}
