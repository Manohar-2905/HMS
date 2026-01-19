

const galleryImages = [
    {
        src: "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        alt: "Common Area",
        category: "Community"
    },
    {
        src: "https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        alt: "Study Room",
        category: "Study"
    },
    {
        src: "https://images.unsplash.com/photo-1582719508461-905c673771fd?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        alt: "Dining Hall",
        category: "Dining"
    },
    {
        src: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        alt: "Modern Bedroom",
        category: "Living"
    },
    {
        src: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        alt: "Library",
        category: "Education"
    },
    {
        src: "https://images.unsplash.com/photo-1522771753062-5885bb3bd6e1?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        alt: "Garden",
        category: "Recreation"
    }
];

export function GallerySection() {
    return (
        <section className="py-24 bg-background">
            <div className="container mx-auto px-4">
                {/* Header */}
                <div className="text-center max-w-2xl mx-auto mb-16">
                    <span className="text-primary font-medium text-sm uppercase tracking-wider">Gallery</span>
                    <h2 className="font-display text-3xl md:text-4xl font-bold mt-2 mb-4 text-foreground">
                        Life at Yashoda bhavan
                    </h2>
                    <p className="text-muted-foreground">
                        Take a closer look at our facilities, rooms, and vibration community atmosphere.
                    </p>
                </div>

                {/* Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {galleryImages.map((image, index) => (
                        <div
                            key={index}
                            className="group relative h-64 md:h-80 rounded-2xl overflow-hidden cursor-pointer shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                        >
                            <div className="absolute inset-0 bg-primary/10 group-hover:bg-transparent transition-colors z-10" />
                            <img
                                src={image.src}
                                alt={image.alt}
                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                            />
                            {/* Overlay */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20 flex flex-col justify-end p-6">
                                <span className="text-primary font-medium text-sm mb-1 translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                                    {image.category}
                                </span>
                                <h3 className="text-white font-display text-xl font-bold translate-y-4 group-hover:translate-y-0 transition-transform duration-300 delay-75">
                                    {image.alt}
                                </h3>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
