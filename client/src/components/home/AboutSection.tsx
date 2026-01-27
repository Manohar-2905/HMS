
export function AboutSection() {
    return (
        <section className="py-16 md:py-24 bg-secondary/30 relative overflow-hidden">
            <div className="container mx-auto px-4 relative z-10">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
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
                    <div className="relative mt-8 lg:mt-0 lg:pl-10">
                        <div className="absolute top-10 -left-10 w-32 h-32 bg-primary/10 rounded-full blur-3xl animate-pulse" />
                        <div className="absolute bottom-10 -right-10 w-48 h-48 bg-orange-500/10 rounded-full blur-3xl" />

                        <div className="relative bg-background p-8 md:p-14 rounded-[3rem] shadow-[0_20px_50px_rgba(0,0,0,0.05)] border border-border/50 backdrop-blur-sm">
                            <div className="flex flex-col items-center text-center">
                                <div className="w-40 h-40 md:w-48 md:h-48 rounded-full p-1.5 bg-gradient-to-br from-primary via-orange-400 to-primary mb-8 shadow-2xl scale-110 lg:scale-125 transition-transform duration-500 hover:scale-115">
                                    <div className="w-full h-full rounded-full overflow-hidden bg-muted border-4 border-background">
                                        <img
                                            src="/ownerImage.jpg"
                                            alt="Mr. Binay Kumar - Owner of Yashoda Bhavan"
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                </div>

                                <blockquote className="font-display text-xl md:text-2xl font-medium text-foreground mb-8 italic leading-relaxed">
                                    "Our mission is to ensure that every student feels safe, valued, and empowered to achieve their dreams while staying with us."
                                </blockquote>

                                <div className="space-y-1">
                                    <h4 className="font-display text-2xl font-bold text-foreground">Mr. Binay Kumar</h4>
                                    <p className="text-primary font-semibold text-base tracking-widest uppercase">Founder & Owner</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
