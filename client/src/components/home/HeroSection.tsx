import { useState, useEffect } from "react";
import api from "@/api/axios";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Star, Users, Shield, Loader2, Settings } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/input";
import toast from "react-hot-toast";

export function HeroSection() {
    const { isAdmin } = useAuth();
    const [userCount, setUserCount] = useState<number | null>(null);
    const [bgVideoUrl, setBgVideoUrl] = useState<string>("/Welcome.mp4");
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [newVideoUrl, setNewVideoUrl] = useState("");
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [isUpdating, setIsUpdating] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch user count
                const countRes = await api.get('/api/auth/user-count');
                setUserCount(countRes.data.count);

                // Fetch settings
                const settingsRes = await api.get('/api/settings');
                if (settingsRes.data.background_video_url) {
                    setBgVideoUrl(settingsRes.data.background_video_url);
                    setNewVideoUrl(settingsRes.data.background_video_url);
                } else {
                    setNewVideoUrl("/Welcome.mp4");
                }
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };
        fetchData();
    }, []);

    const handleUpdateBackground = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsUpdating(true);
        try {
            const formData = new FormData();
            formData.append('key', 'background_video_url');

            if (selectedFile) {
                formData.append('video', selectedFile);
            } else {
                formData.append('value', newVideoUrl);
            }

            const { data } = await api.post('/api/settings', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            setBgVideoUrl(data.setting.value);
            toast.success("Background video updated!");
            setIsEditModalOpen(false);
            setSelectedFile(null);
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Failed to update background");
        } finally {
            setIsUpdating(false);
        }
    };

    const happyResidentsCount = userCount !== null ? 51 + userCount : null;

    return (
        <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-background py-16 md:py-0">
            {/* Background Video */}
            <div className="absolute inset-0 z-0">
                <video
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="w-full h-full object-cover opacity-30 pointer-events-none"
                    key={bgVideoUrl}
                >
                    <source src={bgVideoUrl} type="video/mp4" />
                </video>
                <div className="absolute inset-0 bg-gradient-to-b from-background/20 via-background/40 to-background" />
            </div>

            {/* Background pattern (overlay) */}
            <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] opacity-20 z-[1]" />

            {/* Decorative Elements */}
            <div className="absolute top-20 left-10 w-72 h-72 bg-primary/5 rounded-full blur-3xl animate-float z-[1]" />
            <div className="absolute bottom-20 right-10 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-float delay-300 z-[1]" />

            <div className="container mx-auto px-4 relative z-10">
                <div className="max-w-4xl mx-auto text-center">
                    {/* Badge */}
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 backdrop-blur-sm mb-8 animate-fade-in">
                        <Star className="w-4 h-4 text-primary fill-primary" />
                        <span className="text-sm font-medium text-primary">Premium Hostel Experience</span>
                    </div>

                    {/* Heading */}
                    <h1 className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-foreground mb-6 animate-slide-up">
                        Your Home
                    </h1>

                    {/* Description */}
                    <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 animate-slide-up delay-100">
                        Experience comfortable living with modern amenities, a vibrant community, and the perfect environment for studying and growing together.
                    </p>

                    {/* CTA Buttons */}
                    <div className="flex flex-col sm:flex-row gap-4 justify-center animate-slide-up delay-200">
                        <Button variant="default" size="xl" asChild>
                            <Link to="/rooms">
                                Explore Rooms
                                <ArrowRight className="w-5 h-5 ml-2" />
                            </Link>
                        </Button>
                        <Button variant="outline" size="xl" asChild>
                            <Link to="/contact">Contact Us</Link>
                        </Button>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 mt-16 animate-fade-in delay-300">
                        <div className="text-center p-4 bg-background/50 backdrop-blur-sm rounded-2xl sm:bg-transparent sm:p-0">
                            <div className="flex justify-center mb-2">
                                <Users className="w-6 h-6 text-primary" />
                            </div>
                            <div className="font-display text-3xl font-bold text-foreground">
                                {happyResidentsCount !== null ? `${happyResidentsCount}+` : <Loader2 className="w-6 h-6 animate-spin mx-auto text-primary" />}
                            </div>
                            <div className="text-sm text-muted-foreground">Happy Residents</div>
                        </div>
                        <div className="text-center p-4 bg-background/50 backdrop-blur-sm rounded-2xl sm:bg-transparent sm:p-0">
                            <div className="flex justify-center mb-2">
                                <Star className="w-6 h-6 text-primary fill-primary" />
                            </div>
                            <div className="font-display text-3xl font-bold text-foreground">5.0</div>
                            <div className="text-sm text-muted-foreground">Average Rating</div>
                        </div>
                        <div className="text-center p-4 bg-background/50 backdrop-blur-sm rounded-2xl sm:bg-transparent sm:p-0">
                            <div className="flex justify-center mb-2">
                                <Shield className="w-6 h-6 text-primary" />
                            </div>
                            <div className="font-display text-3xl font-bold text-foreground">24/7</div>
                            <div className="text-sm text-muted-foreground">Security</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Admin Background Control */}
            {isAdmin && (
                <div className="fixed bottom-6 right-6 z-[60]">
                    <Button
                        size="icon"
                        className="w-12 h-12 rounded-full shadow-lg hover:rotate-90 transition-transform duration-500"
                        onClick={() => setIsEditModalOpen(true)}
                    >
                        <Settings className="w-6 h-6" />
                    </Button>
                </div>
            )}

            <Modal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                title="Change Background Video"
            >
                <form onSubmit={handleUpdateBackground} className="space-y-4 py-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-muted-foreground">Upload Video File</label>
                        <Input
                            type="file"
                            accept="video/*"
                            onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                            className="cursor-pointer"
                        />
                        <p className="text-xs text-muted-foreground">Max file size depends on your Cloudinary plan.</p>
                    </div>

                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-background px-2 text-muted-foreground">Or use URL</span>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-muted-foreground">Video URL</label>
                        <Input
                            placeholder="Enter video URL (e.g., https://...mp4 or /Welcome.mp4)"
                            value={newVideoUrl}
                            onChange={(e) => setNewVideoUrl(e.target.value)}
                            disabled={!!selectedFile}
                        />
                        <p className="text-xs text-muted-foreground italic">
                            Tip: For the local welcome video, use: <code className="bg-muted px-1 rounded">/Welcome.mp4</code>
                        </p>
                    </div>
                    <div className="flex justify-end gap-3 pt-4">
                        <Button type="button" variant="outline" onClick={() => setIsEditModalOpen(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isUpdating}>
                            {isUpdating ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                            Update Background
                        </Button>
                    </div>
                </form>
            </Modal>

            {/* Scroll Indicator */}
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce z-10 pointer-events-none">
                <div className="w-6 h-10 rounded-full border-2 border-primary-foreground/30 flex items-start justify-center p-2">
                    <div className="w-1.5 h-3 bg-primary rounded-full" />
                </div>
            </div>
        </section>
    );
}
