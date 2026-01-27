import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Phone } from "lucide-react";

export function CTASection() {
    return (
        <section className="py-16 md:py-24 bg-white">
            <div className="container mx-auto px-4">
                <div className="relative rounded-3xl overflow-hidden shadow-2xl">
                    {/* Background */}
                    <div className="absolute inset-0 bg-slate-900" />
                    <div className="absolute inset-0 bg-[radial-gradient(hsl(var(--primary))_1px,transparent_1px)] [background-size:20px_20px] opacity-15" />
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-primary/5" />

                    <div className="relative z-10 py-16 px-8 md:py-20 md:px-16 text-center">
                        <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-slate-50 mb-6">
                            Ready to Make This Your Home?
                        </h2>
                        <p className="text-lg text-slate-300 max-w-2xl mx-auto mb-10">
                            Join our community of students and professionals. Contact us today to book your room or schedule a visit to our hostel.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-5 justify-center">
                            <Button size="xl" className="primary-gradient text-white hover:opacity-90 border-none shadow-xl glow-effect px-8 h-14 rounded-full transition-all duration-300 hover:scale-105 active:scale-95 group" asChild>
                                <Link to="/contact">
                                    Get in Touch
                                    <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                                </Link>
                            </Button>
                            <Button size="xl" variant="outline" className="bg-white/5 backdrop-blur-md border border-slate-700 text-slate-100 hover:bg-white/10 hover:text-white px-8 h-14 rounded-full transition-all duration-300 hover:border-slate-500" asChild>
                                <a href="tel:+12345678900">
                                    <Phone className="w-5 h-5 mr-3 text-primary" />
                                    Call Now
                                </a>
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
