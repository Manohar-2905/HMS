import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Bed, Users, Maximize } from "lucide-react";

import { useEffect, useState } from "react";
import api from "../../api/axios";

export function RoomsPreview() {
    const [rooms, setRooms] = useState<any[]>([]);

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
                            className="group rounded-2xl overflow-hidden bg-gradient-to-br from-card to-secondary/30 border border-border/50 shadow-lg hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:-translate-y-1 transition-all duration-300"
                            style={{ animationDelay: `${index * 150}ms` }}
                        >
                            {/* Image */}
                            <div className="relative h-56 overflow-hidden">
                                <img
                                    src={room.images?.[0] || "https://placehold.co/600x400"}
                                    alt={room.roomName}
                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 to-transparent" />
                                <div className="absolute bottom-4 left-4 right-4">
                                    <div className="flex items-baseline gap-1">
                                        <span className="font-display text-2xl font-bold text-primary-foreground">₹{room.roomCost}</span>
                                        <span className="text-sm text-primary-foreground/70">/month</span>
                                    </div>
                                </div>
                            </div>

                            {/* Content */}
                            <div className="p-6">
                                <h3 className="font-display text-xl font-semibold text-foreground mb-4">
                                    {room.roomName}
                                </h3>
                                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                    <div className="flex items-center gap-1.5">
                                        <Bed className="w-4 h-4" />
                                        <span>{room.beds} Bed{room.beds > 1 ? 's' : ''}</span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <Users className="w-4 h-4" />
                                        <span>{room.capacity} Person{room.capacity > 1 ? 's' : ''}</span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <Maximize className="w-4 h-4" />
                                        <span>{room.size}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
