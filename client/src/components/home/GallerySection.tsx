import { useEffect, useState } from 'react';
import api from '../../api/axios';
import { useNavigate } from 'react-router-dom';
import { Loader2, Maximize, Folder } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';

export function GallerySection() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [gallery, setGallery] = useState<any[]>([]);
    const [events, setEvents] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [galleryRes, eventsRes] = await Promise.all([
                api.get('/api/gallery'),
                api.get('/api/events')
            ]);
            setGallery(galleryRes.data);
            setEvents(eventsRes.data);
        } catch (error) {
            console.error('Error fetching data', error);
        } finally {
            setIsLoading(false);
        }
    };

    const FolderCard = ({ title, count, image, onClick }: any) => (
        <motion.div
            whileHover={{ y: -10 }}
            className="group relative cursor-pointer"
            onClick={onClick}
        >
            <div className="relative h-80 rounded-[2.5rem] overflow-hidden shadow-2xl border-4 border-white/10 group-hover:border-primary/50 transition-all duration-500">
                <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/80 z-10" />
                <img
                    src={image || "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=800&q=80"}
                    alt={title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 z-20 flex flex-col items-center justify-center p-6 text-center">
                    <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center mb-4 transition-transform duration-500 group-hover:scale-110">
                        <Folder className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-white font-display mb-1">{title}</h3>
                    <p className="text-white/70 text-sm font-medium">{count} Items Uploaded</p>
                </div>
                <div className="absolute bottom-6 right-6 z-20">
                    <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 shadow-lg">
                        <Maximize className="w-5 h-5" />
                    </div>
                </div>
            </div>
        </motion.div>
    );

    return (
        <section className="py-16 md:py-24 bg-slate-100 relative overflow-hidden">
            {/* Background Decorations */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl -mr-48 -mt-48" />
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl -ml-48 -mb-48" />

            <div className="container mx-auto px-4 relative z-10">
                <div className="text-center max-w-2xl mx-auto mb-16">
                    <span className="text-primary font-bold text-xs uppercase tracking-[0.3em] mb-3 block">Media Hub</span>
                    <h2 className="font-display text-4xl md:text-5xl font-bold mb-6 text-foreground tracking-tight">
                        Our Vibrant Community
                    </h2>
                    <p className="text-muted-foreground/80 leading-relaxed text-lg">
                        Explore the life at Yashoda Bhavan through our curated galleries and celebration memories.
                    </p>
                </div>

                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-20 gap-4">
                        <div className="relative">
                            <div className="w-16 h-16 border-4 border-primary/20 rounded-full animate-spin border-t-primary" />
                            <Loader2 className="w-6 h-6 animate-spin text-primary absolute inset-0 m-auto" />
                        </div>
                        <p className="text-muted-foreground font-medium animate-pulse">Loading Collections...</p>
                    </div>
                ) : (
                    <div className="flex flex-wrap justify-center gap-10 max-w-5xl mx-auto">
                        <div className="w-full md:w-[calc(50%-20px)] max-w-md">
                            <FolderCard
                                title="Hostel Gallery"
                                count={gallery.length}
                                image={gallery[0]?.image}
                                onClick={() => navigate('/gallery')}
                            />
                        </div>
                        {user && (
                            <div className="w-full md:w-[calc(50%-20px)] max-w-md">
                                <FolderCard
                                    title="Celebration Events"
                                    count={events.length}
                                    image={events[0]?.image}
                                    onClick={() => navigate('/events')}
                                />
                            </div>
                        )}
                    </div>
                )}
            </div>
        </section>
    );
}
