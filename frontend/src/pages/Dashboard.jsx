import { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { FaTrash, FaFileInvoice, FaPrint } from 'react-icons/fa';

const Dashboard = () => {
    const [activeTab, setActiveTab] = useState('users');
    const [users, setUsers] = useState([]);
    const [rooms, setRooms] = useState([]);
    const [notes, setNotes] = useState([]);
    const [newUser, setNewUser] = useState({ name: '', email: '', password: 'password123', phone: '', address: '', roomType: '', totalAmount: 0, paidAmount: 0, remainingAmount: 0 });
    const [newRoom, setNewRoom] = useState({ roomName: '', roomCost: 0, roomDetails: '', images: [] });

    const token = localStorage.getItem('token');
    const config = { headers: { Authorization: `Bearer ${token}` } };

    useEffect(() => {
        if (activeTab === 'users') fetchUsers();
        if (activeTab === 'rooms') fetchRooms();
        if (activeTab === 'notes') fetchNotes();
    }, [activeTab]);

    const fetchUsers = async () => {
        try { const { data } = await axios.get('http://localhost:5000/api/users', config); setUsers(data); } catch (e) { console.error(e); }
    };
    const fetchRooms = async () => {
        try { const { data } = await axios.get('http://localhost:5000/api/rooms'); setRooms(data); } catch (e) { console.error(e); }
    };
    const fetchNotes = async () => {
        try { const { data } = await axios.get('http://localhost:5000/api/notes', config); setNotes(data); } catch (e) { console.error(e); }
    };

    const registerUser = async (e) => {
        e.preventDefault();
        try {
            await axios.post('http://localhost:5000/api/users', newUser, config);
            toast.success('User created');
            fetchUsers();
            setNewUser({ name: '', email: '', password: 'password123', phone: '', address: '', roomType: '', totalAmount: 0, paidAmount: 0, remainingAmount: 0 });
        } catch (e) { toast.error(e.response?.data?.message || 'Error'); }
    };

    const deleteUser = async (id) => {
        if (!window.confirm('Are you sure?')) return;
        try { await axios.delete(`http://localhost:5000/api/users/${id}`, config); toast.success('User deleted'); fetchUsers(); } catch (e) { toast.error('Error'); }
    };

    const deleteRoom = async (id) => {
        if (!window.confirm('Are you sure?')) return;
        try { await axios.delete(`http://localhost:5000/api/rooms/${id}`, config); toast.success('Room deleted'); fetchRooms(); } catch (e) { toast.error('Error'); }
    };

    const deleteNote = async (id) => {
        if (!window.confirm('Are you sure?')) return;
        try { await axios.delete(`http://localhost:5000/api/notes/${id}`, config); toast.success('Note deleted'); fetchNotes(); } catch (e) { toast.error('Error'); }
    };

    const [roomImages, setRoomImages] = useState(null);

    const createRoom = async (e) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append('roomName', newRoom.roomName);
        formData.append('roomCost', newRoom.roomCost);
        formData.append('roomDetails', newRoom.roomDetails);
        if (roomImages) {
            for (let i = 0; i < roomImages.length; i++) {
                formData.append('image', roomImages[i]);
            }
        }

        try { await axios.post('http://localhost:5000/api/rooms', formData, config); toast.success('Room added'); fetchRooms(); setNewRoom({ roomName: '', roomCost: 0, roomDetails: '', images: [] }); setRoomImages(null); } catch (e) { toast.error('Error'); }
    };

    const downloadInvoice = async (user) => {
        try {
            const response = await axios.get(`http://localhost:5000/api/invoices/${user._id}`, { ...config, responseType: 'blob' });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `invoice-${user.name}.pdf`);
            document.body.appendChild(link);
            link.click();
        } catch (e) { toast.error('Error downloading invoice'); }
    };

    return (
        <div>
            <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>

            <div className="flex space-x-4 mb-8 border-b">
                {['users', 'rooms', 'notes'].map(tab => (
                    <button key={tab} onClick={() => setActiveTab(tab)} className={`pb-2 px-4 capitalize ${activeTab === tab ? 'border-b-2 border-primary font-bold' : 'text-gray-500'}`}>
                        {tab}
                    </button>
                ))}
            </div>

            {activeTab === 'users' && (
                <div>
                    <div className="bg-white p-6 rounded shadow mb-8">
                        <h2 className="text-xl font-bold mb-4">Register New User</h2>
                        <form onSubmit={registerUser} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            <input placeholder="Name" className="border p-2 rounded" value={newUser.name} onChange={e => setNewUser({ ...newUser, name: e.target.value })} required />
                            <input placeholder="Email" className="border p-2 rounded" value={newUser.email} onChange={e => setNewUser({ ...newUser, email: e.target.value })} required />
                            <input placeholder="Phone" className="border p-2 rounded" value={newUser.phone} onChange={e => setNewUser({ ...newUser, phone: e.target.value })} required />
                            <input placeholder="Address" className="border p-2 rounded" value={newUser.address} onChange={e => setNewUser({ ...newUser, address: e.target.value })} />
                            <input placeholder="Room Type" className="border p-2 rounded" value={newUser.roomType} onChange={e => setNewUser({ ...newUser, roomType: e.target.value })} />
                            <input type="number" placeholder="Total Amount" className="border p-2 rounded" value={newUser.totalAmount} onChange={e => setNewUser({ ...newUser, totalAmount: e.target.value })} />
                            <input type="number" placeholder="Paid Amount" className="border p-2 rounded" value={newUser.paidAmount} onChange={e => setNewUser({ ...newUser, paidAmount: e.target.value })} />
                            <input type="number" placeholder="Remaining" className="border p-2 rounded" value={newUser.remainingAmount} onChange={e => setNewUser({ ...newUser, remainingAmount: e.target.value })} />
                            <button type="submit" className="bg-primary text-white p-2 rounded">Register User</button>
                        </form>
                    </div>

                    <div className="bg-white p-6 rounded shadow overflow-x-auto">
                        <table className="min-w-full text-left">
                            <thead>
                                <tr className="border-b"><th className="p-3">Name</th><th className="p-3">Email</th><th className="p-3">Room</th><th className="p-3">Payment (P/R)</th><th className="p-3">Actions</th></tr>
                            </thead>
                            <tbody>
                                {users.map(u => (
                                    <tr key={u._id} className="border-b hover:bg-gray-50">
                                        <td className="p-3">{u.name}</td>
                                        <td className="p-3">{u.email}</td>
                                        <td className="p-3">{u.roomType}</td>
                                        <td className="p-3">{u.paidAmount} / {u.remainingAmount}</td>
                                        <td className="p-3 flex space-x-2">
                                            <button onClick={() => downloadInvoice(u)} className="text-blue-500 hover:text-blue-700" title="Invoice"><FaFileInvoice /></button>
                                            <button onClick={() => deleteUser(u._id)} className="text-red-500 hover:text-red-700" title="Delete"><FaTrash /></button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {activeTab === 'rooms' && (
                <div>
                    <div className="bg-white p-6 rounded shadow mb-8">
                        <h2 className="text-xl font-bold mb-4">Add Room</h2>
                        <form onSubmit={createRoom} className="grid gap-4">
                            <input placeholder="Room Identify (e.g. 101)" className="border p-2 rounded" value={newRoom.roomName} onChange={e => setNewRoom({ ...newRoom, roomName: e.target.value })} required />
                            <input placeholder="Cost" type="number" className="border p-2 rounded" value={newRoom.roomCost} onChange={e => setNewRoom({ ...newRoom, roomCost: e.target.value })} required />
                            <textarea placeholder="Details" className="border p-2 rounded" value={newRoom.roomDetails} onChange={e => setNewRoom({ ...newRoom, roomDetails: e.target.value })} />
                            <input type="file" multiple className="border p-2 rounded" onChange={e => setRoomImages(e.target.files)} />
                            <button type="submit" className="bg-primary text-white p-2 rounded">Add Room</button>
                        </form>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {rooms.map(room => (
                            <div key={room._id} className="bg-white p-4 rounded shadow">
                                <h3 className="font-bold">{room.roomName}</h3>
                                <p>${room.roomCost}</p>
                                <button onClick={() => deleteRoom(room._id)} className="text-red-500 mt-2"><FaTrash /></button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {activeTab === 'notes' && (
                <div className="bg-white p-6 rounded shadow">
                    <table className="min-w-full text-left">
                        <thead>
                            <tr className="border-b"><th className="p-3">Title</th><th className="p-3">Uploaded By</th><th className="p-3">Link</th><th className="p-3">Action</th></tr>
                        </thead>
                        <tbody>
                            {notes.map(note => (
                                <tr key={note._id} className="border-b hover:bg-gray-50">
                                    <td className="p-3">{note.title}</td>
                                    <td className="p-3">{note.uploadedBy?.name || 'Unknown'}</td>
                                    <td className="p-3"><a href={note.pdfUrl} target="_blank" className="text-blue-500 underline">View PDF</a></td>
                                    <td className="p-3">
                                        <button onClick={() => deleteNote(note._id)} className="text-red-500 hover:text-red-700"><FaTrash /></button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default Dashboard;
