import {
    Clock,
    Users,
    Key,
    ShieldCheck,
    Sparkles,
    Ban,
    AlertTriangle,
    Flame,
    LogOut,
    FileText,
    HeartHandshake
} from "lucide-react";

const rules = [
    {
        icon: HeartHandshake,
        title: "1. General Conduct",
        items: [
            "Residents must maintain a respectful and harmonious atmosphere.",
            "Loud music, disruptive behavior, or disturbing others is strictly prohibited.",
            "Residents should be polite to the owner and fellow residents."
        ]
    },
    {
        icon: FileText,
        title: "2. Admission & Docs",
        items: [
            "Only students with valid admission proof allowed.",
            "All required documents/ID proof must be submitted at admission.",
            "Report any information changes immediately."
        ]
    },
    {
        icon: Clock,
        title: "3. Timings",
        items: [
            "Gates close by 7:30 PM. All residents must return by this time.",
            "Prior permission required for late returns or night outs.",
            "Failure to comply may result in disciplinary action."
        ]
    },
    {
        icon: Users,
        title: "4. Visitors",
        items: [
            "Visitors allowed only during specified hours & must register.",
            "Male visitors are not allowed beyond the visitor's area.",
            "Residents are responsible for their visitors' conduct."
        ]
    },
    {
        icon: Key,
        title: "5. Room Allocation",
        items: [
            "Rooms are allocated by admin and cannot be changed without approval.",
            "Keep rooms clean. Throw garbage in the municipal dustbin.",
            "Damages to property will be charged to the resident."
        ]
    },
    {
        icon: ShieldCheck,
        title: "6. Security",
        items: [
            "Always carry hostel ID cards and present when requested.",
            "Premises under surveillance; report suspicious activity.",
            "Secure personal belongings; hostel is not responsible for loss."
        ]
    },
    {
        icon: Sparkles,
        title: "7. Hygiene",
        items: [
            "Maintain personal hygiene and keep common areas clean.",
            "Dispose of garbage in designated bins.",
            "No electric appliances (heaters, kettles, irons) allowed in rooms."
        ]
    },
    {
        icon: Ban,
        title: "8. Prohibited Items",
        items: [
            "Alcohol, drugs, and illegal substances are strictly prohibited.",
            "Smoking is not allowed within hostel premises.",
            "Possession of weapons or hazardous materials is forbidden."
        ]
    },
    {
        icon: AlertTriangle,
        title: "9. Disciplinary Action",
        items: [
            "Breach of rules results in fines, suspension, or expulsion.",
            "Repeated violations will be reported to guardians."
        ]
    },
    {
        icon: Flame,
        title: "10. Emergency",
        items: [
            "In emergency, immediately inform the hostel owner.",
            "Follow fire safety procedures.",
            "Familiarize yourself with emergency exits."
        ]
    },
    {
        icon: LogOut,
        title: "11. Vacating",
        items: [
            "Inform administration at least two weeks before vacating.",
            "Clear all dues before leaving.",
            "Hand over rooms in good condition."
        ]
    }
];

export function RulesSection() {
    return (
        <section className="py-24 bg-foreground text-background">
            <div className="container mx-auto px-4">
                {/* Section Header */}
                <div className="text-center max-w-2xl mx-auto mb-16">
                    <span className="text-primary font-medium text-sm uppercase tracking-wider">Guidelines</span>
                    <h2 className="font-display text-3xl md:text-4xl font-bold mt-2 mb-4">
                        Hostel Rules & Regulations
                    </h2>
                    <p className="text-background/70">
                        To ensure a safe and comfortable environment for all residents, please adhere to our hostel guidelines.
                    </p>
                </div>

                {/* Rules Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
                    {rules.map((rule, index) => (
                        <div
                            key={rule.title}
                            className="flex gap-4 p-6 rounded-xl bg-gradient-to-br from-background/5 to-background/10 border border-background/10 shadow-lg hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:-translate-y-1 hover:to-primary/5 transition-all duration-300"
                            style={{ animationDelay: `${index * 100}ms` }}
                        >
                            <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center shrink-0 h-fit">
                                <rule.icon className="w-6 h-6 text-primary" />
                            </div>
                            <div className="flex-1">
                                <h3 className="font-display text-lg font-semibold mb-3">
                                    {rule.title}
                                </h3>
                                <ul className="space-y-2">
                                    {rule.items.map((item, i) => (
                                        <li key={i} className="text-sm text-background/70 leading-relaxed flex items-start gap-2">
                                            <span className="w-1.5 h-1.5 rounded-full bg-primary/50 mt-1.5 shrink-0" />
                                            <span>{item}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
