import { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

const Contact = () => {
    const [formData, setFormData] = useState({
        name: '', email: '', phone: '', message: ''
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.post('http://localhost:5000/api/contact', formData);
            toast.success('Message sent successfully!');
            setFormData({ name: '', email: '', phone: '', message: '' });
        } catch (error) {
            toast.error('Failed to send message.');
        }
    };

    return (
        <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow-md">
            <h2 className="text-3xl font-bold mb-8 text-center">Contact Us</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-gray-700 mb-2">Name</label>
                        <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full border rounded-lg px-4 py-2" required />
                    </div>
                    <div>
                        <label className="block text-gray-700 mb-2">Email</label>
                        <input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="w-full border rounded-lg px-4 py-2" required />
                    </div>
                </div>
                <div>
                    <label className="block text-gray-700 mb-2">Phone</label>
                    <input type="text" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} className="w-full border rounded-lg px-4 py-2" required />
                </div>
                <div>
                    <label className="block text-gray-700 mb-2">Message</label>
                    <textarea value={formData.message} onChange={(e) => setFormData({ ...formData, message: e.target.value })} className="w-full border rounded-lg px-4 py-2 h-32" required></textarea>
                </div>
                <button type="submit" className="w-full bg-primary text-white py-2 rounded-lg font-semibold hover:bg-yellow-600 transition">Send Message</button>
            </form>
        </div>
    );
};

export default Contact;
