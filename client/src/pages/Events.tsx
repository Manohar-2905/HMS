import { useEffect, useState } from 'react';
import api from '../api/axios';
import { Navbar } from "../components/layout/Navbar";
import { Footer } from "../components/layout/Footer";
import { SEO } from "../components/layout/SEO";
import { Loader2, Calendar, X, ChevronLeft, ChevronRight, PartyPopper } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';

export default function Events() {
    const { user } = useAuth();
    const [events, setEvents] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedImage, setSelectedImage] = useState<number | null>(null);

    useEffect(() => {
        const fetchEvents = async () => {
            try {
                const token = user?.token;
                const config = { headers: { Authorization: `Bearer ${token}` } };
                const { data } = await api.get('/api/events', config);
                setEvents(data);
            } catch (error) {
                console.error('Error fetching events', error);
            } finally {
                setIsLoading(false);
            }
        };
        if (user) {
            fetchEvents();
        }
    }, [user]);

    const nextImage = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (selectedImage !== null && selectedImage < events.length - 1) {
            setSelectedImage(selectedImage + 1);
        }
    };

    const prevImage = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (selectedImage !== null && selectedImage > 0) {
            setSelectedImage(selectedImage - 1);
        }
    };

    return (
        <>
            <Navbar />
            <main className="min-h-screen">
                <SEO
                    title="Celebration Events | Yashoda Bhavan"
                    description="Memories from our latest celebrations and events at Yashoda Bhavan."
                />

                {/* Page Header */}
                <div className="dark-gradient pt-32 pb-16 md:pt-40 md:pb-24">
                    <div className="container mx-auto px-4 text-center">
                        <div className="flex justify-center mb-6">
                            <div className="p-4 rounded-full bg-white/10 backdrop-blur-md border border-white/20">
                                <PartyPopper className="w-10 h-10 text-primary-foreground" />
                            </div>
                        </div>
                        <h1 className="font-display text-4xl md:text-5xl font-bold text-primary-foreground mb-4">
                            Celebration Events
                        </h1>
                        <p className="text-primary-foreground/80 max-w-2xl mx-auto text-lg">
                            Capturing the joy and togetherness of our resident community.
                        </p>
                    </div>
                </div>

                <section className="py-16 bg-background">
                    <div className="container mx-auto px-4">
                        {isLoading ? (
                            <div className="flex flex-col items-center justify-center py-20 gap-4">
                                <Loader2 className="w-10 h-10 animate-spin text-primary" />
                                <p className="text-muted-foreground font-medium">Loading Memories...</p>
                            </div>
                        ) : events.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-32 text-center opacity-40">
                                <Calendar className="w-20 h-20 mb-4" />
                                <p className="text-xl font-medium">No events captured yet.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                {events.map((event, index) => (
                                    <motion.div
                                        key={event._id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.05 }}
                                        className="group relative aspect-square rounded-3xl overflow-hidden cursor-zoom-in shadow-lg border-2 border-border/50 hover:border-primary/40 transition-all"
                                        onClick={() => setSelectedImage(index)}
                                    >
                                        <img src={event.image} alt={event.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                        <div className="absolute bottom-6 left-6 right-6 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                                            <p className="text-white font-bold text-lg mb-1">{event.title}</p>
                                            <p className="text-white/60 text-xs uppercase tracking-wider">
                                                {new Date(event.date).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}
                                            </p>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        )}
                    </div>
                </section>
            </main>

            {/* Lightbox */}
            <AnimatePresence>
                {selectedImage !== null && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[110] bg-black/95 backdrop-blur-2xl flex items-center justify-center p-4 md:p-10"
                        onClick={() => setSelectedImage(null)}
                    >
                        <button
                            className="absolute top-8 right-8 text-white/60 hover:text-white transition-colors"
                            onClick={() => setSelectedImage(null)}
                        >
                            <X className="w-10 h-10" />
                        </button>

                        <button
                            className="absolute left-4 md:left-8 w-12 h-12 md:w-16 md:h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white hover:bg-white/10 transition-colors disabled:opacity-20"
                            onClick={prevImage}
                            disabled={selectedImage === 0}
                        >
                            <ChevronLeft className="w-8 h-8" />
                        </button>

                        <motion.div
                            key={selectedImage}
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="max-w-6xl w-full h-full flex flex-col items-center justify-center"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <img
                                src={events[selectedImage].image}
                                alt={events[selectedImage].title}
                                className="max-w-full max-h-[80vh] object-contain rounded-xl shadow-2xl"
                            />
                            <div className="mt-8 text-center bg-white/5 backdrop-blur-md px-8 py-4 rounded-2xl border border-white/10 max-w-xl">
                                <h3 className="text-white text-2xl font-bold mb-2">{events[selectedImage].title}</h3>
                                <p className="text-white/60 mb-2">{new Date(events[selectedImage].date).toLocaleDateString()}</p>
                                <p className="text-white/70 leading-relaxed">{events[selectedImage].description}</p>
                            </div>
                        </motion.div>

                        <button
                            className="absolute right-4 md:right-8 w-12 h-12 md:w-16 md:h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white hover:bg-white/10 transition-colors disabled:opacity-20"
                            onClick={nextImage}
                            disabled={selectedImage === events.length - 1}
                        >
                            <ChevronRight className="w-8 h-8" />
                        </button>

                        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 bg-white/10 backdrop-blur-md px-6 py-2 rounded-full border border-white/10 text-white/80 text-sm font-bold">
                            {selectedImage + 1} / {events.length}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <Footer />
        </>
    );
}
