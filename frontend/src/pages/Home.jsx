import { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const Home = () => {
    const [featuredRooms, setFeaturedRooms] = useState([]);

    useEffect(() => {
        const fetchRooms = async () => {
            try {
                const { data } = await axios.get('http://localhost:5000/api/rooms');
                setFeaturedRooms(data.slice(0, 3));
            } catch (error) {
                console.error(error);
            }
        };
        fetchRooms();
    }, []);

    return (
        <div className="space-y-12">
            {/* Hero Section */}
            <div className="bg-gray-800 text-white rounded-xl p-12 text-center relative overflow-hidden">
                <div className="relative z-10">
                    <h1 className="text-4xl font-bold mb-4">Welcome to HostelStay</h1>
                    <p className="text-xl mb-8">Comfortable, Affordable, and Secure Living.</p>
                    <div className="space-x-4">
                        <Link to="/contact" className="bg-primary hover:bg-yellow-600 text-white px-6 py-2 rounded-lg font-semibold">Contact Us</Link>
                        <Link to="/login" className="bg-transparent border border-white hover:bg-white hover:text-black px-6 py-2 rounded-lg font-semibold">Login</Link>
                    </div>
                </div>
            </div>

            {/* Facilities */}
            <section>
                <h2 className="text-3xl font-bold text-center mb-8">Our Facilities</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
                    {['High Speed Wi-Fi', 'Healthy Food', '24/7 Security', 'Laundry Service'].map((fac, index) => (
                        <div key={index} className="p-6 bg-white rounded-lg shadow-sm border">
                            <h3 className="font-semibold text-lg">{fac}</h3>
                        </div>
                    ))}
                </div>
            </section>

            {/* Rules */}
            <section className="bg-gray-100 p-8 rounded-lg">
                <h2 className="text-2xl font-bold mb-4">Rules & Regulations</h2>
                <ul className="list-disc list-inside space-y-2">
                    <li>No loud noise after 10 PM.</li>
                    <li>Visitors allowed only in common areas.</li>
                    <li>Keep your room and surroundings clean.</li>
                </ul>
            </section>

            {/* Featured Rooms */}
            <section>
                <h2 className="text-3xl font-bold text-center mb-8">Our Rooms</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {featuredRooms.map((room) => (
                        <div key={room._id} className="bg-white rounded-lg shadow-md overflow-hidden">
                            <img src={room.images[0] || 'https://via.placeholder.com/300'} alt={room.roomName} className="w-full h-48 object-cover" />
                            <div className="p-4">
                                <h3 className="text-xl font-bold mb-2">Room {room.roomName}</h3>
                                <p className="text-gray-600 mb-2 truncate">{room.roomDetails}</p>
                                <p className="text-primary font-bold">${room.roomCost}/month</p>
                            </div>
                        </div>
                    ))}
                </div>
                <div className="text-center mt-8">
                    <Link to="/rooms" className="text-primary font-semibold hover:underline">View All Photos</Link>
                </div>
            </section>
        </div>
    );
};

export default Home;
