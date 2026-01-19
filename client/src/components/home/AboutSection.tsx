
export function AboutSection() {
    return (
        <section className="py-24 bg-secondary/30">
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                    {/* Text Content */}
                    <div className="space-y-8">
                        <div>
                            <span className="text-primary font-medium text-sm uppercase tracking-wider">About Us</span>
                            <h2 className="font-display text-3xl md:text-4xl font-bold mt-2 mb-4 text-foreground">
                                A Legacy of Care & Comfort
                            </h2>
                            <p className="text-muted-foreground text-lg leading-relaxed">
                                Welcome to Yashoda Bhavan, where we believe in providing more than just accommodation. We strive to create a nurturing environment that feels like a true "home away from home" for every resident.
                            </p>
                        </div>

                        <div className="space-y-4">
                            <p className="text-muted-foreground leading-relaxed">
                                Established with a vision to provide safe, hygienic, and affordable housing for students and working professionals, Yashoda Bhavan has grown into a trusted name in the community. Our facility is designed to foster both personal growth and academic success.
                            </p>
                            <p className="text-muted-foreground leading-relaxed">
                                We take pride in our strict security measures, nutritious home-cooked meals, and a supportive community atmosphere that helps our residents thrive.
                            </p>
                        </div>

                        <div className="flex gap-8 pt-4">
                            <div>
                                <div className="font-display text-4xl font-bold text-primary mb-1">10+</div>
                                <div className="text-sm text-muted-foreground uppercase tracking-wide">Years of Trust</div>
                            </div>
                            <div>
                                <div className="font-display text-4xl font-bold text-primary mb-1">500+</div>
                                <div className="text-sm text-muted-foreground uppercase tracking-wide">Happy Residents</div>
                            </div>
                        </div>
                    </div>

                    {/* Owner Image / Card */}
                    <div className="relative">
                        <div className="absolute top-10 -left-10 w-20 h-20 bg-primary/10 rounded-full blur-2xl animate-pulse" />
                        <div className="absolute bottom-10 -right-10 w-32 h-32 bg-orange-500/10 rounded-full blur-3xl" />

                        <div className="relative bg-background p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-border/50">
                            <div className="flex flex-col items-center text-center">
                                <div className="w-32 h-32 rounded-full p-1 bg-gradient-to-br from-primary to-orange-400 mb-6 shadow-lg">
                                    <div className="w-full h-full rounded-full overflow-hidden bg-muted">
                                        <img
                                            src="https://images.unsplash.com/photo-1556157382-97eda2d62296?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80"
                                            alt="Owner of Yashoda Bhavan"
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                </div>

                                <blockquote className="font-display text-xl font-medium text-foreground mb-6 italic">
                                    "Our mission is to ensure that every student feels safe, valued, and empowered to achieve their dreams while staying with us."
                                </blockquote>

                                <div>
                                    <h4 className="font-display text-lg font-bold text-foreground">Mrs. Yashoda Devi</h4>
                                    <p className="text-primary font-medium text-sm">Founder & Owner</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
