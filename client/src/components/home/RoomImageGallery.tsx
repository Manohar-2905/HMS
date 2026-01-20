import { Swiper, SwiperSlide } from 'swiper/react';
import { EffectCoverflow, Pagination, Navigation } from 'swiper/modules';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/effect-coverflow';
import 'swiper/css/pagination';
import 'swiper/css/navigation';
import { X } from 'lucide-react';

interface RoomImageGalleryProps {
    images: string[];
    onClose: () => void;
}

export function RoomImageGallery({ images, onClose }: RoomImageGalleryProps) {
    // Ensure we have at least 4 images for the "4 image" requirement visualization
    // If fewer are provided, we repeat them or use placeholders
    const displayImages = [...images];
    while (displayImages.length < 4) {
        displayImages.push(...images.length > 0 ? images : ["https://placehold.co/600x400?text=No+Image"]);
        if(displayImages.length >= 4) break;
    }
    // Cap at 4 if strictly required, but usually "store 4 image" means allow up to 4. 
    // I'll show all available.

    return (
        <div className="relative w-full h-[500px]">
             <button 
                onClick={onClose}
                className="absolute top-4 right-4 z-50 p-2 bg-black/50 hover:bg-black/70 rounded-full text-white transition-colors"
            >
                <X className="w-6 h-6" />
            </button>

            <Swiper
                effect={'coverflow'}
                grabCursor={true}
                centeredSlides={true}
                slidesPerView={'auto'}
                coverflowEffect={{
                    rotate: 50,
                    stretch: 0,
                    depth: 100,
                    modifier: 1,
                    slideShadows: true,
                }}
                pagination={true}
                navigation={true}
                modules={[EffectCoverflow, Pagination, Navigation]}
                className="w-full h-full py-12"
            >
                {displayImages.map((img, index) => (
                    <SwiperSlide key={index} className="w-[300px] h-[400px] !flex items-center justify-center bg-black rounded-lg overflow-hidden shadow-2xl">
                        <img src={img} alt={`Room View ${index + 1}`} className="w-full h-full object-cover" />
                    </SwiperSlide>
                ))}
            </Swiper>
        </div>
    );
}
