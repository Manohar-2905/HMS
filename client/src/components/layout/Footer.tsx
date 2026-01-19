import { Link } from "react-router-dom";
import { Mail, Phone, MapPin, Facebook, Instagram } from "lucide-react";

export function Footer() {
    return (
        <footer className="bg-foreground text-background">
            <div className="container mx-auto px-4 py-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {/* Brand */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2">
                            <img
                                src="/logo.png"
                                alt="Yashoda Bhavan Logo"
                                className="w-10 h-10 rounded-lg object-cover"
                            />
                            <span className="font-display text-xl font-semibold">Yashoda bhavan</span>
                        </div>
                        <p className="text-background/70 text-sm leading-relaxed">
                            Your home away from home. Experience comfortable living with modern amenities and a vibrant community.
                        </p>
                        <div className="flex gap-3">
                            <a href="#" className="w-10 h-10 rounded-full bg-background/10 flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-colors">
                                <Facebook className="w-4 h-4" />
                            </a>
                            <a href="#" className="w-10 h-10 rounded-full bg-background/10 flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-colors">
                                <Instagram className="w-4 h-4" />
                            </a>

                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h4 className="font-display text-lg font-semibold mb-4">Quick Links</h4>
                        <ul className="space-y-3">
                            {["Home", "About", "Rooms", "Contact"].map((link) => (
                                <li key={link}>
                                    <Link
                                        to={link === "Home" ? "/" : `/${link.toLowerCase()}`}
                                        className="text-background/70 hover:text-primary transition-colors text-sm"
                                    >
                                        {link}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Facilities */}
                    <div>
                        <h4 className="font-display text-lg font-semibold mb-4">Facilities</h4>
                        <ul className="space-y-3">
                            {["24/7 Security", "Study-Friendly Environment", "High-Speed Wi-Fi", "Purified Water", "Inverter Backup"].map((service) => (
                                <li key={service} className="text-background/70 text-sm">
                                    {service}
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Contact */}
                    <div>
                        <h4 className="font-display text-lg font-semibold mb-4">Contact Us</h4>
                        <ul className="space-y-4">
                            <li className="flex items-start gap-3">
                                <MapPin className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                                <span className="text-background/70 text-sm">Lakhey, Hazaribagh, Jharkhand 825301</span>
                            </li>
                            <li className="flex items-center gap-3">
                                <Phone className="w-5 h-5 text-primary shrink-0" />
                                <span className="text-background/70 text-sm">+91 98765 43210</span>
                            </li>
                            <li className="flex items-center gap-3">
                                <Mail className="w-5 h-5 text-primary shrink-0" />
                                <span className="text-background/70 text-sm">info@yashodabhavan.com</span>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="border-t border-background/10 mt-8 pt-4 text-center">
                    <p className="text-background/50 text-sm">
                        © {new Date().getFullYear()} Yashoda bhavan. All rights reserved.
                    </p>
                </div>
            </div>
        </footer>
    );
}
