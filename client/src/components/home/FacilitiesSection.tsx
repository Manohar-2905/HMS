import { ShieldCheck, BookOpen, MapPin, TrendingUp, HandHelping, Wifi, Droplets, Zap } from "lucide-react";

const facilities = [
    {
        icon: ShieldCheck,
        title: "Safety and Security",
        description: "24/7 surveillance and secure access control to ensure a safe living environment for all residents."
    },
    {
        icon: BookOpen,
        title: "Study-Friendly Environment",
        description: "Quiet, well-lit spaces designed specifically to help students focus and excel in their academics."
    },
    {
        icon: Wifi,
        title: "High-Speed Wi-Fi",
        description: "Blazing fast internet connectivity throughout the hostel to support online classes and research."
    },
    {
        icon: Droplets,
        title: "Purified Drinking Water",
        description: "Advanced RO filtration system providing clean and safe drinking water for all students."
    },
    {
        icon: Zap,
        title: "Inverter/Backup Facility",
        description: "Uninterrupted power supply ensures that your studies and daily needs never face a blackout."
    },
    {
        icon: MapPin,
        title: "Prime Location",
        description: "Conveniently located near NH-100, providing easy access to transport, markets, and institutions."
    },
    {
        icon: TrendingUp,
        title: "Empowerment and Growth",
        description: "An environment that fosters personal development, confidence, and future success."
    },
    {
        icon: HandHelping,
        title: "Guidance and Support",
        description: "Dedicated mentorship and assistance to help students navigate their hostel life and beyond."
    }
];

export function FacilitiesSection() {
    return (
        <section className="py-16 md:py-24 bg-slate-100">
            <div className="container mx-auto px-4">
                {/* Section Header */}
                <div className="text-center max-w-2xl mx-auto mb-16">
                    <span className="text-primary font-medium text-sm uppercase tracking-wider">Our Advantages</span>
                    <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mt-2 mb-4">
                        Benefits & Facilities
                    </h2>
                    <p className="text-muted-foreground">
                        We offer a comprehensive range of benefits designed to provide a secure, productive, and supportive home away from home.
                    </p>
                </div>

                {/* Facilities Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {facilities.map((facility, index) => (
                        <div
                            key={facility.title}
                            className="group glass-card rounded-xl p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
                            style={{ animationDelay: `${index * 100}ms` }}
                        >
                            <div className="w-14 h-14 rounded-xl primary-gradient flex items-center justify-center mb-4 group-hover:shadow-glow transition-shadow duration-300">
                                <facility.icon className="w-7 h-7 text-primary-foreground" />
                            </div>
                            <h3 className="font-display text-lg font-semibold text-foreground mb-2">
                                {facility.title}
                            </h3>
                            <p className="text-sm text-muted-foreground leading-relaxed">
                                {facility.description}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
