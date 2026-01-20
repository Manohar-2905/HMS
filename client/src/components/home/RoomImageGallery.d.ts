import 'swiper/css';
import 'swiper/css/effect-coverflow';
import 'swiper/css/pagination';
import 'swiper/css/navigation';
interface RoomImageGalleryProps {
    images: string[];
    onClose: () => void;
}
export declare function RoomImageGallery({ images, onClose }: RoomImageGalleryProps): import("react/jsx-runtime").JSX.Element;
export {};
