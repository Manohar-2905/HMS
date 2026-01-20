
import { useEffect, useState } from 'react';
import api from '../../api/axios';
import { Loader2, Maximize, Folder, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export function GallerySection() {
    const [gallery, setGallery] = useState<any[]>([]);
    const [events, setEvents] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [activeFolder, setActiveFolder] = useState<'gallery' | 'events' | null>(null);
    const [selectedImage, setSelectedImage] = useState<number | null>(null);

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

    const currentImages = activeFolder === 'gallery' ? gallery : events;

    const nextImage = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (selectedImage !== null && selectedImage < currentImages.length - 1) {
            setSelectedImage(selectedImage + 1);
        }
    };

    const prevImage = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (selectedImage !== null && selectedImage > 0) {
            setSelectedImage(selectedImage - 1);
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
        <section className="py-24 bg-background relative overflow-hidden">
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
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10 max-w-5xl mx-auto">
                        <FolderCard
                            type="gallery"
                            title="Hostel Gallery"
                            count={gallery.length}
                            image={gallery[0]?.image}
                            onClick={() => setActiveFolder('gallery')}
                        />
                        <FolderCard
                            type="events"
                            title="Celebration Events"
                            count={events.length}
                            image={events[0]?.image}
                            onClick={() => setActiveFolder('events')}
                        />
                    </div>
                )}
            </div>

            {/* Folder View Modal */}
            <AnimatePresence>
                {activeFolder && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] bg-background/95 backdrop-blur-xl flex flex-col"
                    >
                        <div className="container mx-auto px-4 py-8 flex-1 flex flex-col h-full">
                            <div className="flex justify-between items-center mb-10">
                                <div>
                                    <h2 className="text-3xl font-bold font-display text-primary flex items-center gap-3">
                                        <Folder className="w-8 h-8" />
                                        {activeFolder === 'gallery' ? 'Hostel Gallery' : 'Celebration Events'}
                                    </h2>
                                    <p className="text-muted-foreground text-sm mt-1">Viewing {currentImages.length} items</p>
                                </div>
                                <button
                                    onClick={() => setActiveFolder(null)}
                                    className="w-12 h-12 rounded-full border border-border flex items-center justify-center hover:bg-muted transition-colors group"
                                >
                                    <X className="w-6 h-6 group-hover:rotate-90 transition-transform duration-300" />
                                </button>
                            </div>

                            <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 pb-10">
                                {currentImages.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center py-32 text-center opacity-40">
                                        <Folder className="w-20 h-20 mb-4" />
                                        <p className="text-xl font-medium">This folder is currently empty.</p>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                        {currentImages.map((item, index) => (
                                            <motion.div
                                                key={item._id}
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: index * 0.05 }}
                                                className="group relative aspect-square rounded-3xl overflow-hidden cursor-zoom-in shadow-lg border-2 border-border/50 hover:border-primary/40 transition-all"
                                                onClick={() => setSelectedImage(index)}
                                            >
                                                <img src={item.image} alt={item.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                                <div className="absolute bottom-6 left-6 right-6 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                                                    <p className="text-white font-bold text-lg mb-1">{item.title}</p>
                                                    <p className="text-white/60 text-xs uppercase tracking-wider">{item.category || (activeFolder === 'events' ? new Date(item.date).toLocaleDateString() : 'Gallery')}</p>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Lightbox / Full Image Preview */}
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
                                src={currentImages[selectedImage].image}
                                alt={currentImages[selectedImage].title}
                                className="max-w-full max-h-[80vh] object-contain rounded-xl shadow-2xl"
                            />
                            <div className="mt-8 text-center bg-white/5 backdrop-blur-md px-8 py-4 rounded-2xl border border-white/10 max-w-xl">
                                <h3 className="text-white text-2xl font-bold mb-2">{currentImages[selectedImage].title}</h3>
                                <p className="text-white/60">{currentImages[selectedImage].description || currentImages[selectedImage].category}</p>
                            </div>
                        </motion.div>

                        <button
                            className="absolute right-4 md:right-8 w-12 h-12 md:w-16 md:h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white hover:bg-white/10 transition-colors disabled:opacity-20"
                            onClick={nextImage}
                            disabled={selectedImage === currentImages.length - 1}
                        >
                            <ChevronRight className="w-8 h-8" />
                        </button>

                        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 bg-white/10 backdrop-blur-md px-6 py-2 rounded-full border border-white/10 text-white/80 text-sm font-bold">
                            {selectedImage + 1} / {currentImages.length}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </section>
    );
}
