import { Swiper, SwiperSlide } from 'swiper/react';
import { EffectCoverflow, Pagination, Navigation } from 'swiper/modules';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/effect-coverflow';
import 'swiper/css/pagination';
import 'swiper/css/navigation';

interface RoomImageGalleryProps {
    images: string[];
}

export function RoomImageGallery({ images }: RoomImageGalleryProps) {
    // Use provided images, or a fallback placeholder if none exist
    const displayImages = images.length > 0
        ? images
        : ["https://placehold.co/600x400?text=No+Images+Uploaded"];

    return (
        <div className="relative w-full h-[300px] md:h-[450px]">

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
