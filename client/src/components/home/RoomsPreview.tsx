import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Bed, Users, Maximize, Eye } from "lucide-react";

import { useEffect, useState } from "react";
import api from "../../api/axios";
import { Modal } from "@/components/ui/Modal";
import { RoomImageGallery } from "./RoomImageGallery";

export function RoomsPreview() {
    const [rooms, setRooms] = useState<any[]>([]);
    const [selectedRoom, setSelectedRoom] = useState<any | null>(null);

    useEffect(() => {
        const fetchRooms = async () => {
            try {
                const { data } = await api.get("/api/rooms");
                // Limit to 3 for preview
                setRooms(data.slice(0, 3));
            } catch (error) {
                console.error("Error fetching rooms", error);
            }
        };
        fetchRooms();
    }, []);

    // Fallback if no rooms
    if (rooms.length === 0) {
        // Optional: Show Mock or "No rooms available"
    }
    return (
        <section className="py-24">
            <div className="container mx-auto px-4">
                {/* Section Header */}
                <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-12">
                    <div>
                        <span className="text-primary font-medium text-sm uppercase tracking-wider">Accommodations</span>
                        <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mt-2">
                            Our Rooms
                        </h2>
                        <p className="text-muted-foreground mt-2 max-w-xl">
                            Choose from a variety of comfortable room options designed to suit your needs and budget.
                        </p>
                    </div>
                    <Button className="w-fit rounded-full shadow-lg hover:shadow-primary/25" asChild>
                        <Link to="/rooms">
                            View All Rooms
                            <ArrowRight className="w-4 h-4 ml-2" />
                        </Link>
                    </Button>
                </div>

                {/* Rooms Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {rooms.map((room, index) => (
                        <div
                            key={room._id}
                            className="group rounded-2xl overflow-hidden bg-gradient-to-br from-card to-secondary/30 border border-border/50 shadow-lg hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:-translate-y-1 transition-all duration-300 cursor-pointer"
                            style={{ animationDelay: `${index * 150}ms` }}
                            onClick={() => setSelectedRoom(room)}
                        >
                            {/* Image */}
                            <div className="relative h-64 overflow-hidden shrink-0">
                                <img
                                    src={room.images?.[0] || `https://placehold.co/600x400?text=${room.roomName}`}
                                    alt={room.roomName}
                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-60" />
                                <div className="absolute bottom-4 left-4 right-4">
                                    <div className="flex items-baseline gap-1">
                                        <span className="font-display text-2xl font-bold text-white">₹{room.roomCost}</span>
                                        <span className="text-sm text-gray-200">/month</span>
                                    </div>
                                </div>
                                <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <div className="bg-white/20 backdrop-blur-md p-2 rounded-full">
                                        <Eye className="w-5 h-5 text-white" />
                                    </div>
                                </div>
                            </div>

                            {/* Content */}
                            <div className="p-6 flex flex-col flex-1">
                                <h3 className="font-display text-2xl font-semibold text-foreground mb-3">
                                    {room.roomName}
                                </h3>

                                <div className="flex items-center gap-4 text-sm text-muted-foreground mb-6">
                                    <div className="flex items-center gap-1.5" title="Beds">
                                        <Bed className="w-4 h-4 text-primary" />
                                        <span>{room.beds} Bed{room.beds > 1 ? 's' : ''}</span>
                                    </div>
                                    <div className="flex items-center gap-1.5" title="Capacity">
                                        <Users className="w-4 h-4 text-primary" />
                                        <span>{room.capacity} Person{room.capacity > 1 ? 's' : ''}</span>
                                    </div>
                                    <div className="flex items-center gap-1.5" title="Size">
                                        <Maximize className="w-4 h-4 text-primary" />
                                        <span>{room.size}</span>
                                    </div>
                                </div>

                                <div className="space-y-4 flex-1">
                                    <p className="text-muted-foreground text-sm line-clamp-3">
                                        {room.roomDetails}
                                    </p>
                                </div>

                                <div className="mt-8 pt-6 border-t border-border/50">
                                    <Button className="w-full rounded-full shadow-lg" size="lg" asChild onClick={(e) => e.stopPropagation()}>
                                        <Link to="/contact">
                                            Contact Now
                                        </Link>
                                    </Button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <Modal
                isOpen={!!selectedRoom}
                onClose={() => setSelectedRoom(null)}
                title={selectedRoom?.roomName || "Room Details"}
                className="max-w-5xl"
            >
                {selectedRoom && (
                    <div className="space-y-4">
                        <RoomImageGallery
                            images={selectedRoom.images || []}
                        />
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-muted/50 rounded-xl text-center">
                            <div>
                                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Cost</p>
                                <p className="text-lg font-bold text-primary">₹{selectedRoom.roomCost}<span className="text-sm font-normal text-muted-foreground">/month</span></p>
                            </div>
                            <div className="flex flex-col items-center">
                                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Beds</p>
                                <p className="font-medium flex items-center gap-2"><Bed className="w-4 h-4" /> {selectedRoom.beds}</p>
                            </div>
                            <div className="flex flex-col items-center">
                                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Capacity</p>
                                <p className="font-medium flex items-center gap-2"><Users className="w-4 h-4" /> {selectedRoom.capacity}</p>
                            </div>
                            <div className="flex flex-col items-center">
                                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Size</p>
                                <p className="font-medium flex items-center gap-2"><Maximize className="w-4 h-4" /> {selectedRoom.size}</p>
                            </div>
                        </div>
                        <div className="p-4 bg-muted/30 rounded-xl">
                            <p className="text-sm text-foreground/80 leading-relaxed text-center">{selectedRoom.roomDetails}</p>
                        </div>
                    </div>
                )}
            </Modal>
        </section>
    );
}
