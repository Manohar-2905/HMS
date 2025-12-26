import { useEffect, useState } from 'react';
import axios from 'axios';

const Rooms = () => {
    const [rooms, setRooms] = useState([]);

    useEffect(() => {
        const fetchRooms = async () => {
            try {
                const { data } = await axios.get('http://localhost:5000/api/rooms');
                setRooms(data);
            } catch (error) {
                console.error(error);
            }
        };
        fetchRooms();
    }, []);

    return (
        <div>
            <h1 className="text-3xl font-bold text-center mb-10">Our Rooms</h1>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {rooms.map((room) => (
                    <div key={room._id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition">
                        <img src={room.images[0] || 'https://via.placeholder.com/300'} alt={room.roomName} className="w-full h-56 object-cover" />
                        <div className="p-6">
                            <h3 className="text-2xl font-bold mb-2">Room {room.roomName}</h3>
                            <p className="text-gray-600 mb-4">{room.roomDetails}</p>
                            <div className="flex justify-between items-center">
                                <span className="text-2xl font-bold text-primary">${room.roomCost}/mo</span>
                                {/* <button className="bg-primary text-white px-4 py-2 rounded">Book Now</button> */}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Rooms;
