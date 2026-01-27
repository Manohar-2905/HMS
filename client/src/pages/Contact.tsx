import React, { useState } from 'react';
import api from '../api/axios';
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { SEO } from "@/components/layout/SEO";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, MapPin, Phone, Mail, Clock } from 'lucide-react';

const Contact = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        message: ''
    });
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus('loading');
        try {
            await api.post('/api/contact', formData);
            setStatus('success');
            setFormData({ name: '', email: '', phone: '', message: '' });
        } catch (error) {
            setStatus('error');
        }
    };

    return (
        <>
            <Navbar />
            <main>
                <SEO
                    title="Contact Us | Yashoda Bhavan"
                    description="Get in touch with us for inquiries, bookings, or any questions you may have."
                />

                {/* Page Header */}
                <div className="dark-gradient py-24">
                    <div className="container mx-auto px-4 text-center">
                        <h1 className="font-display text-4xl md:text-5xl font-bold text-primary-foreground mb-4">
                            Get in Touch
                        </h1>
                        <p className="text-primary-foreground/80 max-w-2xl mx-auto text-lg">
                            Have questions? We'd love to hear from you. Reach out to us for bookings or inquiries.
                        </p>
                    </div>
                </div>

                {/* Content Section */}
                <section className="py-16 bg-background">
                    <div className="container mx-auto px-4">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-6xl mx-auto">

                            {/* Contact Info */}
                            <div className="space-y-8">
                                <div>
                                    <h2 className="font-display text-2xl font-bold mb-4">Contact Information</h2>
                                    <p className="text-muted-foreground">
                                        Feel free to visit us or contact us via phone or email. We are always happy to show you around.
                                    </p>
                                </div>

                                <div className="space-y-6">
                                    <div className="flex items-start gap-4 p-4 rounded-lg bg-card border border-border/50 shadow-sm hover:shadow-md transition-shadow">
                                        <div className="p-3 rounded-full bg-primary/10 text-primary shrink-0">
                                            <MapPin className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold mb-1">Our Location</h3>
                                            <p className="text-muted-foreground text-sm">
                                                Lakhey, Hazaribagh, Jharkhand 825301
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-4 p-4 rounded-lg bg-card border border-border/50 shadow-sm hover:shadow-md transition-shadow">
                                        <div className="p-3 rounded-full bg-primary/10 text-primary shrink-0">
                                            <Phone className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold mb-1">Phone Number</h3>
                                            <p className="text-muted-foreground text-sm">
                                                +91 98765 43210
                                            </p>
                                            <p className="text-muted-foreground text-sm">
                                                +91 12345 67890
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-4 p-4 rounded-lg bg-card border border-border/50 shadow-sm hover:shadow-md transition-shadow">
                                        <div className="p-3 rounded-full bg-primary/10 text-primary shrink-0">
                                            <Mail className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold mb-1">Email Address</h3>
                                            <p className="text-muted-foreground text-sm">
                                                info@yashodabhavan.com
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-4 p-4 rounded-lg bg-card border border-border/50 shadow-sm hover:shadow-md transition-shadow">
                                        <div className="p-3 rounded-full bg-primary/10 text-primary shrink-0">
                                            <Clock className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold mb-1">Office Hours</h3>
                                            <p className="text-muted-foreground text-sm">
                                                Monday - Sunday: 9:00 AM - 7:00 PM
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Contact Form */}
                            <div className="glass-card rounded-2xl p-8 h-fit animate-slide-up relative overflow-hidden group">
                                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-orange-400"></div>
                                <h3 className="font-display text-2xl font-bold mb-6 text-foreground">Send us a Message</h3>

                                {status === 'success' && (
                                    <div className="bg-green-500/10 border border-green-500/20 text-green-600 p-4 rounded-xl mb-6 text-sm flex items-center gap-3 animate-fade-in">
                                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                                        Message sent successfully! We'll get back to you soon.
                                    </div>
                                )}
                                {status === 'error' && (
                                    <div className="bg-destructive/10 border border-destructive/20 text-destructive p-4 rounded-xl mb-6 text-sm flex items-center gap-3 animate-fade-in">
                                        <div className="w-2 h-2 rounded-full bg-destructive animate-pulse"></div>
                                        Failed to send message. Please try again.
                                    </div>
                                )}

                                <form onSubmit={handleSubmit} className="space-y-6">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-foreground/80">Name</label>
                                            <Input
                                                value={formData.name}
                                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                                required
                                                placeholder="Your Name"
                                                className="bg-background/50 border-border/50 focus:border-primary/50 transition-all rounded-xl h-12"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-foreground/80">Phone</label>
                                            <Input
                                                type="tel"
                                                value={formData.phone}
                                                onChange={(e) => { const val = e.target.value.replace(/\D/g, '').slice(0, 10); setFormData({ ...formData, phone: val }); }}
                                                required
                                                placeholder="Your Phone"
                                                className="bg-background/50 border-border/50 focus:border-primary/50 transition-all rounded-xl h-12"
                                                minLength={10}
                                                maxLength={10}
                                                pattern="[0-9]{10}"
                                                title="Phone number must be exactly 10 digits"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-foreground/80">Email</label>
                                        <Input
                                            type="email"
                                            value={formData.email}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                            required
                                            placeholder="your.email@example.com"
                                            className="bg-background/50 border-border/50 focus:border-primary/50 transition-all rounded-xl h-12"
                                            pattern="[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$"
                                            title="Please enter a valid email address"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-foreground/80">Message</label>
                                        <textarea
                                            className="flex min-h-[140px] w-full rounded-xl border border-border/50 bg-background/50 px-3 py-3 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:border-primary/50 transition-all disabled:cursor-not-allowed disabled:opacity-50"
                                            value={formData.message}
                                            onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                            required
                                            placeholder="How can we help you?"
                                        />
                                    </div>
                                    <Button
                                        type="submit"
                                        className="w-full rounded-xl h-12 text-lg font-semibold primary-gradient hover:shadow-lg hover:shadow-primary/20 transition-all duration-300"
                                        disabled={status === 'loading'}
                                    >
                                        {status === 'loading' ? (
                                            <span className="flex items-center gap-2">
                                                <Loader2 className="animate-spin w-5 h-5" /> Sending...
                                            </span>
                                        ) : 'Send Enquiry'}
                                    </Button>
                                </form>
                            </div>
                        </div>
                    </div>
                </section>
            </main>
            <Footer />
        </>
    );
};

export default Contact;
