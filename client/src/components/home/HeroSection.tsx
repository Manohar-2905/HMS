import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Star, Users, Shield } from "lucide-react";

export function HeroSection() {
    return (
        <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-background">
            {/* Background */}
            <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] opacity-40" />
            <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent" />

            {/* Decorative Elements */}
            <div className="absolute top-20 left-10 w-72 h-72 bg-primary/5 rounded-full blur-3xl animate-float" />
            <div className="absolute bottom-20 right-10 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-float delay-300" />

            <div className="container mx-auto px-4 relative z-10">
                <div className="max-w-4xl mx-auto text-center">
                    {/* Badge */}
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 backdrop-blur-sm mb-8 animate-fade-in">
                        <Star className="w-4 h-4 text-primary fill-primary" />
                        <span className="text-sm font-medium text-primary">Premium Hostel Experience</span>
                    </div>

                    {/* Heading */}
                    <h1 className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-foreground mb-6 animate-slide-up">
                        Your Home
                    </h1>

                    {/* Description */}
                    <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 animate-slide-up delay-100">
                        Experience comfortable living with modern amenities, a vibrant community, and the perfect environment for studying and growing together.
                    </p>

                    {/* CTA Buttons */}
                    <div className="flex flex-col sm:flex-row gap-4 justify-center animate-slide-up delay-200">
                        <Button variant="default" size="xl" asChild>
                            <Link to="/rooms">
                                Explore Rooms
                                <ArrowRight className="w-5 h-5 ml-2" />
                            </Link>
                        </Button>
                        <Button variant="outline" size="xl" asChild>
                            <Link to="/contact">Contact Us</Link>
                        </Button>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-3 gap-8 mt-16 animate-fade-in delay-300">
                        <div className="text-center">
                            <div className="flex justify-center mb-2">
                                <Users className="w-6 h-6 text-primary" />
                            </div>
                            <div className="font-display text-2xl md:text-3xl font-bold text-foreground">500+</div>
                            <div className="text-sm text-muted-foreground">Happy Residents</div>
                        </div>
                        <div className="text-center">
                            <div className="flex justify-center mb-2">
                                <Star className="w-6 h-6 text-primary fill-primary" />
                            </div>
                            <div className="font-display text-2xl md:text-3xl font-bold text-foreground">4.9</div>
                            <div className="text-sm text-muted-foreground">Average Rating</div>
                        </div>
                        <div className="text-center">
                            <div className="flex justify-center mb-2">
                                <Shield className="w-6 h-6 text-primary" />
                            </div>
                            <div className="font-display text-2xl md:text-3xl font-bold text-foreground">24/7</div>
                            <div className="text-sm text-muted-foreground">Security</div>
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
