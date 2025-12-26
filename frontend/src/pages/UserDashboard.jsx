import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import AuthContext from '../context/AuthContext';
import { toast } from 'react-toastify';

const UserDashboard = () => {
    const { user } = useContext(AuthContext);
    const [notes, setNotes] = useState([]);
    const [title, setTitle] = useState('');
    const [section, setSection] = useState('');
    const [file, setFile] = useState(null);

    useEffect(() => {
        fetchNotes();
    }, []);

    const fetchNotes = async () => {
        try {
            const token = localStorage.getItem('token');
            const { data } = await axios.get('http://localhost:5000/api/notes', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setNotes(data);
        } catch (error) {
            console.error(error);
        }
    };

    const handleUpload = async (e) => {
        e.preventDefault();
        if (!file) return;

        const formData = new FormData();
        formData.append('title', title);
        formData.append('section', section);
        formData.append('pdfFile', file);

        try {
            const token = localStorage.getItem('token');
            await axios.post('http://localhost:5000/api/notes', formData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data'
                }
            });
            toast.success('Note uploaded successfully');
            setTitle('');
            setSection('');
            setFile(null);
            fetchNotes();
        } catch (error) {
            toast.error('Upload failed');
        }
    };

    return (
        <div className="space-y-8">
            <h1 className="text-3xl font-bold">Welcome, {user?.name}</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Profile Details */}
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h2 className="text-xl font-bold mb-4">My Profile</h2>
                    <div className="space-y-2">
                        <p><strong>Email:</strong> {user?.email}</p>
                        <p><strong>Phone:</strong> {user?.phone}</p>
                        <p><strong>Address:</strong> {user?.address}</p>
                        <p><strong>Room Type:</strong> {user?.roomType}</p>
                    </div>
                </div>

                {/* Payment Details */}
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h2 className="text-xl font-bold mb-4">Payment Status</h2>
                    <div className="space-y-2">
                        <p><strong>Total Amount:</strong> ${user?.totalAmount}</p>
                        <p><strong>Paid Amount:</strong> ${user?.paidAmount}</p>
                        <p className="text-red-500 font-bold"><strong>Remaining:</strong> ${user?.remainingAmount}</p>
                    </div>
                </div>
            </div>

            {/* Notes Section */}
            <div className="bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-2xl font-bold mb-6">My Notes</h2>

                {/* Upload Form */}
                <form onSubmit={handleUpload} className="mb-8 p-4 bg-gray-50 rounded border">
                    <h3 className="font-semibold mb-4">Upload New Note (PDF)</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <input type="text" placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} className="border p-2 rounded" required />
                        <input type="text" placeholder="Section" value={section} onChange={(e) => setSection(e.target.value)} className="border p-2 rounded" required />
                        <input type="file" accept="application/pdf" onChange={(e) => setFile(e.target.files[0])} className="border p-2 rounded" required />
                    </div>
                    <button type="submit" className="bg-primary text-white px-4 py-2 rounded">Upload</button>
                </form>

                {/* List */}
                <div className="space-y-4">
                    {notes.map((note) => (
                        <div key={note._id} className="flex justify-between items-center p-4 border rounded hover:bg-gray-50">
                            <div>
                                <h4 className="font-bold">{note.title}</h4>
                                <p className="text-sm text-gray-500">{note.section}</p>
                            </div>
                            <a href={note.pdfUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">View PDF</a>
                        </div>
                    ))}
                    {notes.length === 0 && <p className="text-gray-500">No notes uploaded yet.</p>}
                </div>
            </div>
        </div>
    );
};

export default UserDashboard;
