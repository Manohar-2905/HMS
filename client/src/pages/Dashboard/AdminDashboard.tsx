import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Trash2, Download, Users, Bed, FileText, ArrowLeft, Maximize, User, Edit3, Printer, Loader2, CheckCircle, UserPlus, Lock, Bell, Check, X } from 'lucide-react';
import { saveAs } from 'file-saver';
import jsPDF from 'jspdf';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { SEO } from '@/components/layout/SEO';
import { Modal } from '@/components/ui/Modal';
import { ChangePasswordForm } from '@/components/auth/ChangePasswordForm';
import toast from 'react-hot-toast';

const AdminDashboard = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState<'users' | 'rooms' | 'notes'>('users');
    const [users, setUsers] = useState<any[]>([]);
    const [rooms, setRooms] = useState<any[]>([]);
    const [notes, setNotes] = useState<any[]>([]);
    const [pendingUsers, setPendingUsers] = useState<any[]>([]);
    const [deleteConfirm, setDeleteConfirm] = useState<{
        isOpen: boolean;
        type: 'room' | 'note' | 'user' | null;
        id: string | null;
    }>({ isOpen: false, type: null, id: null });
    const [successPopup, setSuccessPopup] = useState<{
        isOpen: boolean;
        title: string;
        message: string;
    }>({ isOpen: false, title: '', message: '' });
    const [isLoading, setIsLoading] = useState(false);
    const [expandedNoteId, setExpandedNoteId] = useState<string | null>(null);
    const [selectedUser, setSelectedUser] = useState<any | null>(null);
    const [isUserModalOpen, setIsUserModalOpen] = useState(false);
    const [isEditingUser, setIsEditingUser] = useState(false);
    const [editFormData, setEditFormData] = useState<any>({});
    const [paymentUpdateAmount, setPaymentUpdateAmount] = useState('');

    // Forms
    const [newUser, setNewUser] = useState({
        name: '', email: '', password: '', role: 'user', phone: '', address: '', roomType: '',
        totalAmount: 0, paidAmount: 0,
        dob: '', fatherName: '', fatherOccupation: '', fatherPhone: '',
        motherName: '', motherPhone: '', aadharNo: '',
        visitors: ['', '', '', ''], // 4 slots
        university: '', registrationNo: ''
    });
    const [userPhoto, setUserPhoto] = useState<File | null>(null);

    const [newRoom, setNewRoom] = useState({ roomName: '', roomCost: 0, roomDetails: '', images: '', beds: 1, capacity: 1, size: '100 sq ft' });
    const [roomFile, setRoomFile] = useState<File | null>(null);
    const [editingRoomId, setEditingRoomId] = useState<string | null>(null);
    const [noteTitle, setNoteTitle] = useState('');
    const [noteSection, setNoteSection] = useState('');
    const [noteFile, setNoteFile] = useState<File | null>(null);
    const [isAddAdminModalOpen, setIsAddAdminModalOpen] = useState(false);
    const [isChangePasswordModalOpen, setIsChangePasswordModalOpen] = useState(false);
    const [newAdmin, setNewAdmin] = useState({
        name: '', email: '', password: '', phone: '', address: ''
    });

    useEffect(() => {
        fetchData();
    }, [activeTab]);

    const fetchData = async () => {
        const token = user?.token;
        const config = { headers: { Authorization: `Bearer ${token}` } };

        try {
            if (activeTab === 'users') {
                const { data } = await api.get('/api/auth/users', config);
                setUsers(data);
            } else if (activeTab === 'rooms') {
                const { data } = await api.get('/api/rooms');
                setRooms(data);
            } else if (activeTab === 'notes') {
                const { data } = await api.get('/api/notes', config);
                setNotes(data);
            }

            // Always fetch pending users for the notification badge
            const { data: pendingData } = await api.get('/api/auth/pending-users', config);
            setPendingUsers(pendingData);
        } catch (error: any) {
            console.error('Fetch error', error);
            if (error.response?.status === 401) {
                logout();
                navigate('/');
            }
        }
    };

    const handleCreateUser = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const token = user?.token;
            const config = { headers: { Authorization: `Bearer ${token}` } };
            const formData = new FormData();

            const submissionData = {
                ...newUser,
                password: newUser.password || '123456',
                roomType: newUser.roomType || 'Unassigned',
                totalAmount: newUser.totalAmount || 0,
                paidAmount: newUser.paidAmount || 0
            };

            Object.keys(submissionData).forEach(key => {
                if (key === 'visitors') {
                    // @ts-ignore
                    formData.append('visitors', JSON.stringify(submissionData.visitors));
                } else {
                    // @ts-ignore
                    formData.append(key, submissionData[key]);
                }
            });
            if (userPhoto) {
                formData.append('photo', userPhoto);
            }

            const createPromise = api.post('/api/auth/register', formData, config);

            toast.promise(createPromise, {
                loading: 'Registering user...',
                success: 'User registered successfully!',
                error: (err) => err.response?.data?.message || 'Error creating user'
            });

            await createPromise;
            setNewUser({
                name: '', email: '', password: '', role: 'user', phone: '', address: '', roomType: 'Unassigned',
                totalAmount: 0, paidAmount: 0,
                dob: '', fatherName: '', fatherOccupation: '', fatherPhone: '',
                motherName: '', motherPhone: '', aadharNo: '',
                visitors: ['', '', '', ''],
                university: '', registrationNo: ''
            });
            setUserPhoto(null);
            fetchData();
        } catch (error: any) {
            console.error(error);
            if (error.response?.status === 401) {
                logout();
                navigate('/');
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleCreateAdmin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const token = user?.token;
            const config = { headers: { Authorization: `Bearer ${token}` } };
            const formData = new FormData();

            formData.append('name', newAdmin.name);
            formData.append('email', newAdmin.email);
            formData.append('password', newAdmin.password);
            formData.append('phone', newAdmin.phone);
            formData.append('address', newAdmin.address);
            formData.append('role', 'admin');
            formData.append('roomType', 'N/A');
            formData.append('totalAmount', '0');
            formData.append('paidAmount', '0');

            const createAdminPromise = api.post('/api/auth/register', formData, config);

            toast.promise(createAdminPromise, {
                loading: 'Creating admin...',
                success: 'Admin created successfully!',
                error: (err) => err.response?.data?.message || 'Error creating admin'
            });

            await createAdminPromise;
            setIsAddAdminModalOpen(false);
            setNewAdmin({ name: '', email: '', password: '', phone: '', address: '' });
            fetchData();
        } catch (error: any) {
            console.error(error);
            if (error.response?.status === 401) {
                logout();
                navigate('/');
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handlePrintForm = (userData: any) => {
        const doc = new jsPDF();

        // Header
        doc.setFontSize(22);
        doc.setTextColor(255, 140, 0); // Dark Orange
        doc.text("Yashoda Bhawan", 105, 20, { align: "center" });

        doc.setFontSize(12);
        doc.setTextColor(0, 0, 0);
        doc.text("Lakhey, Hazaribagh : 825301", 105, 28, { align: "center" });
        doc.text("hazaribaghgirlshostel.in", 105, 34, { align: "center" });

        doc.setFontSize(16);
        doc.setFont("helvetica", "bold");
        doc.text("Registration Form", 160, 20, { align: "right" });
        doc.setFontSize(12);
        doc.setFont("helvetica", "normal");
        doc.text(`Date: ${new Date().toLocaleDateString()}`, 190, 20, { align: "right" });

        // Photo Box
        doc.rect(150, 40, 40, 50);
        if (userData.photo) {
            try {
                doc.addImage(userData.photo, 'JPEG', 151, 41, 38, 48);
            } catch (e) { console.log('Error adding image', e); }
        } else {
            doc.text("Photo", 165, 65);
        }

        let y = 60;

        // Personal Information
        doc.setFontSize(14);
        doc.setFont("helvetica", "bold");
        doc.text("PERSONAL INFORMATION", 15, y);
        doc.line(15, y + 2, 85, y + 2);
        y += 15;

        const infoGap = 10;
        const addField = (label: string, value: string) => {
            doc.setFontSize(10);
            doc.setFont("helvetica", "bold");
            doc.text(label, 15, y);
            doc.setFont("helvetica", "normal");
            doc.text(": " + (value || ''), 60, y);
            y += infoGap;
        };

        addField("Full Name", userData.name);
        addField("Address", userData.address);
        addField("Date of Birth", userData.dob ? new Date(userData.dob).toLocaleDateString() : '');
        addField("Email", userData.email);
        addField("Mobile No", userData.phone);
        addField("Aadhar No", userData.aadharNo);

        y += 5;
        doc.setFontSize(14);
        doc.setFont("helvetica", "bold");
        doc.text("PARENT'S DETAILS", 15, y);
        doc.line(15, y + 2, 70, y + 2);
        y += 15;

        addField("Father's Name", userData.fatherName);
        addField("Father's Occupation", userData.fatherOccupation);
        addField("Father's Mobile", userData.fatherPhone);
        addField("Mother's Name", userData.motherName);
        addField("Mother's Mobile", userData.motherPhone);

        y += 5;
        doc.setFontSize(14);
        doc.setFont("helvetica", "bold");
        doc.text("ACADEMIC DETAILS", 15, y);
        doc.line(15, y + 2, 70, y + 2);
        y += 15;

        addField("University / College", userData.university);
        addField("Registration No", userData.registrationNo);

        y += 10;
        doc.setFontSize(12);
        doc.setFont("helvetica", "bold");
        doc.setFillColor(255, 200, 100); // Orange bg
        doc.rect(15, y - 5, 180, 20, 'F');
        doc.text("Declaration", 105, y, { align: "center" });
        doc.setFontSize(8);
        doc.setFont("helvetica", "normal");
        doc.text("I, the undersigned, hereby declare that the information provided by me in this form is true, complete, and accurate.", 15, y + 5);
        doc.text("I agree to abide by all the rules and regulations of Yashoda Bhawan Hostel during my stay.", 15, y + 10);

        y += 40;
        doc.line(20, y, 70, y);
        doc.text("Signature of Local Guardian", 20, y + 5);

        doc.line(130, y, 180, y);
        doc.text("Signature of Girl", 130, y + 5);

        doc.save(`${userData.name}_Registration.pdf`);
    };

    const handleSubmitRoom = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const token = user?.token;
            const config = { headers: { Authorization: `Bearer ${token}` } };
            const formData = new FormData();
            formData.append('roomName', newRoom.roomName);
            formData.append('roomCost', String(newRoom.roomCost));
            formData.append('roomDetails', newRoom.roomDetails);
            formData.append('beds', String(newRoom.beds));
            formData.append('capacity', String(newRoom.capacity));
            formData.append('size', newRoom.size);
            if (roomFile) {
                formData.append('image', roomFile);
            }

            const roomPromise = editingRoomId
                ? api.put(`/api/rooms/${editingRoomId}`, formData, config)
                : api.post('/api/rooms', formData, config);

            toast.promise(roomPromise, {
                loading: editingRoomId ? 'Updating room...' : 'Adding room...',
                success: editingRoomId ? 'Room updated!' : 'Room added!',
                error: 'Error saving room'
            });

            await roomPromise;
            setNewRoom({ roomName: '', roomCost: 0, roomDetails: '', images: '', beds: 1, capacity: 1, size: '100 sq ft' });
            setRoomFile(null);
            setEditingRoomId(null);
            fetchData();
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleApproveUser = async (userId: string) => {
        setIsLoading(true);
        try {
            const token = user?.token;
            const config = { headers: { Authorization: `Bearer ${token}` } };
            const approvePromise = api.post(`/api/auth/approve-user/${userId}`, {}, config);

            toast.promise(approvePromise, {
                loading: 'Verifying student...',
                success: 'Student approved!',
                error: 'Error approving user'
            });

            await approvePromise;
            fetchData();
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleRejectUser = (userId: string) => {
        setDeleteConfirm({ isOpen: true, type: 'user', id: userId });
    };

    const handleEditRoom = (room: any) => {
        setNewRoom({
            roomName: room.roomName,
            roomCost: room.roomCost,
            roomDetails: room.roomDetails,
            images: room.images?.[0] || '',
            beds: room.beds || 1,
            capacity: room.capacity || 1,
            size: room.size || '100 sq ft'
        });
        setEditingRoomId(room._id);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleCreateNote = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!noteFile) return toast.error('Please select a PDF file');
        setIsLoading(true);

        const formData = new FormData();
        formData.append('title', noteTitle);
        formData.append('section', noteSection);
        formData.append('pdf', noteFile);

        try {
            const token = user?.token;
            const config = { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' } };
            const uploadPromise = api.post('/api/notes', formData, config);

            toast.promise(uploadPromise, {
                loading: 'Uploading note...',
                success: 'Note added successfully!',
                error: 'Error creating note'
            });

            await uploadPromise;
            setNoteTitle('');
            setNoteSection('');
            setNoteFile(null);
            fetchData();
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleApproveNote = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        try {
            const token = user?.token;
            const config = { headers: { Authorization: `Bearer ${token}` } };
            await api.put(`/api/notes/${id}/approve`, {}, config);
            setNotes(notes.map(n => n._id === id ? { ...n, isApproved: true } : n));
            toast.success('Note approved!');
        } catch (error) {
            toast.error('Error approving note');
        }
    };

    const deleteRoom = (id: string) => {
        setDeleteConfirm({ isOpen: true, type: 'room', id });
    };

    const handleDeleteNote = (id: string) => {
        setDeleteConfirm({ isOpen: true, type: 'note', id });
    };

    const confirmDelete = async () => {
        setIsLoading(true);
        try {
            const token = user?.token;
            const config = { headers: { Authorization: `Bearer ${token}` } };
            let deleteUrl = '';
            if (deleteConfirm.type === 'room') deleteUrl = `/api/rooms/${deleteConfirm.id}`;
            else if (deleteConfirm.type === 'note') deleteUrl = `/api/notes/${deleteConfirm.id}`;
            else if (deleteConfirm.type === 'user') deleteUrl = `/api/auth/users/${deleteConfirm.id}`;

            const deletePromise = api.delete(deleteUrl, config);

            toast.promise(deletePromise, {
                loading: 'Deleting...',
                success: 'Successfully deleted!',
                error: 'Delete failed'
            });

            await deletePromise;
            fetchData();
        } catch (error) {
            console.error('Delete error', error);
        } finally {
            setIsLoading(false);
            setDeleteConfirm({ isOpen: false, type: null, id: null });
        }
    };

    const handleUpdateUser = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const token = user?.token;
            const config = { headers: { Authorization: `Bearer ${token}` } };

            const payload = { ...editFormData };
            if (paymentUpdateAmount) {
                payload.paymentUpdate = Number(paymentUpdateAmount);
            }

            const updatePromise = api.put(`/api/auth/users/${selectedUser._id}`, payload, config);

            toast.promise(updatePromise, {
                loading: 'Updating user...',
                success: 'User updated successfully!',
                error: (err) => err.response?.data?.message || 'Failed to update user'
            });

            const { data } = await updatePromise;
            setUsers(users.map(u => u._id === data._id ? { ...u, ...data } : u));
            setSelectedUser({ ...selectedUser, ...data });
            setIsEditingUser(false);
            setPaymentUpdateAmount('');
        } catch (error: any) {
            console.error('Update error', error);
            if (error.response?.status === 401) {
                logout();
                navigate('/');
            }
        } finally {
            setIsLoading(false);
        }
    };

    const startEditing = (user: any) => {
        setEditFormData({
            name: user.name,
            email: user.email,
            phone: user.phone,
            address: user.address,
            roomType: user.roomType,
            fatherName: user.fatherName,
            fatherPhone: user.fatherPhone,
            motherName: user.motherName,
            motherPhone: user.motherPhone,
            dob: user.dob ? new Date(user.dob).toISOString().split('T')[0] : '',
            aadharNo: user.aadharNo,
            university: user.university,
            registrationNo: user.registrationNo
        });
        setIsEditingUser(true);
        setPaymentUpdateAmount('');
    };

    const downloadInvoice = async (userId: string) => {
        try {
            const token = user?.token;
            const config = {
                headers: { Authorization: `Bearer ${token}` },
                responseType: 'blob' as 'blob'
            };
            const response = await api.get(`/api/invoice/${userId}`, config);
            saveAs(response.data, 'invoice.pdf');
            toast.success('Invoice downloaded!');
        } catch (error) {
            toast.error('Error downloading invoice');
        }
    };

    const handleDirectDownload = async (url: string, filename: string) => {
        try {
            const response = await api.get(url, { responseType: 'blob' });
            saveAs(response.data, filename);
            toast.success('Download started!');
        } catch (error) {
            console.error('Download error:', error);
            saveAs(url, filename);
        }
    };

    return (
        <>
            <Navbar />
            <main>
                <SEO
                    title="Admin Dashboard | Yashoda Bhavan"
                    description="Manage users, rooms, and content."
                />

                {/* Header */}
                <div className="hero-gradient py-24 pb-12">
                    <div className="container mx-auto px-4 text-center">
                        <h1 className="font-display text-4xl md:text-5xl font-bold text-primary-foreground mb-4">
                            Admin Dashboard
                        </h1>
                        <p className="text-primary-foreground/80 max-w-2xl mx-auto text-lg mb-8">
                            Welcome back, Admin. Manage your hostel operations efficiently.
                        </p>

                        <div className="absolute top-24 right-4 md:right-10 flex gap-3">
                            <div className="relative">
                                <Button
                                    onClick={() => setActiveTab('users')} // Or a dedicated notifications tab if we add one
                                    className="bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-full backdrop-blur-sm transition-all relative"
                                >
                                    <Bell className="w-4 h-4" />
                                    {pendingUsers.length > 0 && (
                                        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold h-4 w-4 rounded-full flex items-center justify-center animate-pulse">
                                            {pendingUsers.length}
                                        </span>
                                    )}
                                </Button>
                            </div>
                            <Button
                                onClick={() => setIsChangePasswordModalOpen(true)}
                                className="bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-full backdrop-blur-sm transition-all"
                            >
                                <Lock className="w-4 h-4 mr-2" />
                                Change Password
                            </Button>
                            <Button
                                onClick={() => setIsAddAdminModalOpen(true)}
                                className="bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-full backdrop-blur-sm transition-all"
                            >
                                <UserPlus className="w-4 h-4 mr-2" />
                                Add Admin
                            </Button>
                        </div>

                        {/* Tabs */}
                        <div className="inline-flex flex-wrap justify-center gap-4 bg-background/10 backdrop-blur-sm p-2 rounded-full border border-white/10">
                            <Button
                                variant={activeTab === 'users' ? 'default' : 'outline'}
                                onClick={() => setActiveTab('users')}
                                className={`rounded-full shadow-lg ${activeTab !== 'users' && 'bg-transparent text-white border-white/20 hover:bg-white/10 hover:text-white'}`}
                            >
                                <Users className="w-4 h-4 mr-2" /> Users
                            </Button>
                            <Button
                                variant={activeTab === 'rooms' ? 'default' : 'outline'}
                                onClick={() => setActiveTab('rooms')}
                                className={`rounded-full shadow-lg ${activeTab !== 'rooms' && 'bg-transparent text-white border-white/20 hover:bg-white/10 hover:text-white'}`}
                            >
                                <Bed className="w-4 h-4 mr-2" /> Rooms
                            </Button>
                            <Button
                                variant={activeTab === 'notes' ? 'default' : 'outline'}
                                onClick={() => setActiveTab('notes')}
                                className={`rounded-full shadow-lg ${activeTab !== 'notes' && 'bg-transparent text-white border-white/20 hover:bg-white/10 hover:text-white'}`}
                            >
                                <FileText className="w-4 h-4 mr-2" /> Notes
                            </Button>
                        </div>
                    </div>
                </div>

                <div className="container mx-auto px-4 py-12">
                    {/* Content Card */}
                    <div className="bg-card/50 backdrop-blur-sm border border-border rounded-2xl shadow-xl p-6 lg:p-8 min-h-[600px]">
                        {activeTab === 'users' && (
                            <div className="animate-fade-in">
                                <div className="flex items-center justify-between mb-8">
                                    <h2 className="text-2xl font-bold font-display text-primary">Registration Form</h2>
                                </div>

                                <form onSubmit={handleCreateUser} className="space-y-8 mb-12 border border-border/50 p-6 lg:p-8 rounded-2xl bg-background/50 shadow-sm">
                                    {/* Header Section */}
                                    <div className="flex flex-col md:flex-row justify-between items-start border-b border-border/50 pb-6 gap-6">
                                        <div>
                                            <h1 className="text-2xl font-bold text-primary">Yashoda Bhawan</h1>
                                            <p className="text-sm text-muted-foreground mt-1">LAKHEY, HAZARIBAGH : 825301</p>
                                        </div>
                                        <div className="flex flex-col items-center">
                                            <div className="h-32 w-24 bg-muted border-2 border-dashed border-border flex items-center justify-center relative overflow-hidden rounded-lg group hover:border-primary transition-colors cursor-pointer">
                                                {userPhoto ? (
                                                    <img src={URL.createObjectURL(userPhoto)} alt="Preview" className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="text-center p-2">
                                                        <User className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
                                                        <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Upload Photo</span>
                                                    </div>
                                                )}
                                                <Input
                                                    type="file"
                                                    accept="image/*"
                                                    className="absolute inset-0 opacity-0 cursor-pointer h-full"
                                                    onChange={(e) => e.target.files && setUserPhoto(e.target.files[0])}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Personal Info */}
                                    <div>
                                        <h3 className="font-bold text-lg mb-4 uppercase tracking-wider text-muted-foreground border-b border-border/50 pb-2">Personal Information</h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="md:col-span-2 space-y-2">
                                                <label className="text-sm font-medium">Full Name <span className="text-red-500">*</span></label>
                                                <Input value={newUser.name} onChange={(e) => setNewUser({ ...newUser, name: e.target.value })} required className="rounded-lg bg-background" />
                                            </div>
                                            <div className="md:col-span-2 space-y-2">
                                                <label className="text-sm font-medium">Address <span className="text-red-500">*</span></label>
                                                <Input value={newUser.address} onChange={(e) => setNewUser({ ...newUser, address: e.target.value })} required className="rounded-lg bg-background" />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium">Date of Birth</label>
                                                <Input type="date" value={newUser.dob} onChange={(e) => setNewUser({ ...newUser, dob: e.target.value })} className="rounded-lg bg-background" />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium">Email <span className="text-red-500">*</span></label>
                                                <Input type="email" value={newUser.email} onChange={(e) => setNewUser({ ...newUser, email: e.target.value })} required className="rounded-lg bg-background" />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium">Mobile No. <span className="text-red-500">*</span></label>
                                                <Input value={newUser.phone} onChange={(e) => setNewUser({ ...newUser, phone: e.target.value })} required className="rounded-lg bg-background" />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium">Aadhar No.</label>
                                                <Input value={newUser.aadharNo} onChange={(e) => setNewUser({ ...newUser, aadharNo: e.target.value })} className="rounded-lg bg-background" />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium">Password <span className="text-red-500">*</span></label>
                                                <Input type="password" value={newUser.password} onChange={(e) => setNewUser({ ...newUser, password: e.target.value })} required className="rounded-lg bg-background" />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Parent Details */}
                                    <div>
                                        <h3 className="font-bold text-lg mb-4 uppercase tracking-wider text-muted-foreground border-b border-border/50 pb-2">Parent's Details</h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium">Father's Name</label>
                                                <Input value={newUser.fatherName} onChange={(e) => setNewUser({ ...newUser, fatherName: e.target.value })} className="rounded-lg bg-background" />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium">Father's Occupation</label>
                                                <Input value={newUser.fatherOccupation} onChange={(e) => setNewUser({ ...newUser, fatherOccupation: e.target.value })} className="rounded-lg bg-background" />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium">Father's Mobile</label>
                                                <Input value={newUser.fatherPhone} onChange={(e) => setNewUser({ ...newUser, fatherPhone: e.target.value })} className="rounded-lg bg-background" />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium">Mother's Name</label>
                                                <Input value={newUser.motherName} onChange={(e) => setNewUser({ ...newUser, motherName: e.target.value })} className="rounded-lg bg-background" />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium">Mother's Mobile</label>
                                                <Input value={newUser.motherPhone} onChange={(e) => setNewUser({ ...newUser, motherPhone: e.target.value })} className="rounded-lg bg-background" />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Academic Details */}
                                    <div>
                                        <h3 className="font-bold text-lg mb-4 uppercase tracking-wider text-muted-foreground border-b border-border/50 pb-2">Academic Details</h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="md:col-span-2 space-y-2">
                                                <label className="text-sm font-medium">University / Institution / College</label>
                                                <Input value={newUser.university} onChange={(e) => setNewUser({ ...newUser, university: e.target.value })} className="rounded-lg bg-background" />
                                            </div>

                                        </div>
                                    </div>

                                    {/* Visitors */}
                                    <div>
                                        <h3 className="font-bold text-lg mb-4 uppercase tracking-wider text-muted-foreground border-b border-border/50 pb-2">Frequent Visitors</h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            {newUser.visitors.map((v, i) => (
                                                <div key={i} className="space-y-2">
                                                    <label className="text-sm font-medium">Visitor {i + 1}</label>
                                                    <Input
                                                        value={v}
                                                        onChange={(e) => {
                                                            const newVisitors = [...newUser.visitors];
                                                            newVisitors[i] = e.target.value;
                                                            setNewUser({ ...newUser, visitors: newVisitors });
                                                        }}
                                                        className="rounded-lg bg-background"
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Room & Payment Section Removed from Form - handled as defaults */}

                                    <Button type="submit" size="lg" className="w-full rounded-full shadow-lg hover:shadow-primary/25" disabled={isLoading}>
                                        {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                                        Register & Save
                                    </Button>
                                </form>

                                {pendingUsers.length > 0 && (
                                    <div className="mb-12">
                                        <h2 className="text-xl font-bold mb-6 font-display flex items-center gap-2">
                                            Pending Approvals
                                            <span className="bg-primary/10 text-primary text-xs px-2 py-0.5 rounded-full">{pendingUsers.length}</span>
                                        </h2>
                                        <div className="space-y-4">
                                            {pendingUsers.map(u => (
                                                <div key={u._id} className="flex flex-col md:flex-row justify-between items-center bg-orange-50/50 border border-orange-200 p-4 rounded-xl shadow-sm gap-4">
                                                    <div className="flex items-center gap-4 w-full md:w-auto cursor-pointer" onClick={() => { setSelectedUser(u); setIsUserModalOpen(true); }}>
                                                        <div className="h-12 w-12 rounded-full overflow-hidden bg-muted flex items-center justify-center shrink-0">
                                                            {u.photo ? <img src={u.photo} alt={u.name} className="w-full h-full object-cover" /> : <User className="w-6 h-6 text-muted-foreground" />}
                                                        </div>
                                                        <div>
                                                            <p className="font-bold text-foreground">{u.name}</p>
                                                            <p className="text-sm text-muted-foreground">{u.email}</p>
                                                            <p className="text-[10px] text-orange-600 font-bold uppercase tracking-wider">Requested Registration</p>
                                                        </div>
                                                    </div>
                                                    <div className="flex gap-2 w-full md:w-auto">
                                                        <Button size="sm" onClick={() => handleApproveUser(u._id)} className="rounded-full bg-green-600 hover:bg-green-700 flex-1 md:flex-none">
                                                            <Check className="w-4 h-4 mr-2" /> Approve
                                                        </Button>
                                                        <Button size="sm" variant="outline" onClick={() => handleRejectUser(u._id)} className="rounded-full flex-1 md:flex-none">
                                                            <X className="w-4 h-4 mr-2" /> Reject
                                                        </Button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                <h2 className="text-xl font-bold mb-6 font-display">Registered Students</h2>
                                <div className="space-y-4">
                                    {users.map(u => (
                                        <div key={u._id} className="flex flex-col md:flex-row justify-between items-center bg-card border border-border/50 p-4 rounded-xl shadow-sm hover:shadow-md transition-shadow gap-4">
                                            <div className="flex items-center gap-4 w-full md:w-auto cursor-pointer" onClick={() => { setSelectedUser(u); setIsUserModalOpen(true); }}>
                                                <div className="h-12 w-12 rounded-full overflow-hidden bg-muted flex items-center justify-center shrink-0">
                                                    {u.photo ? <img src={u.photo} alt={u.name} className="w-full h-full object-cover" /> : <User className="w-6 h-6 text-muted-foreground" />}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-foreground hover:text-primary transition-colors">{u.name}</p>
                                                    <p className="text-sm text-muted-foreground">{u.email}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-4 mt-4 md:mt-0 w-full md:w-auto justify-between md:justify-end">
                                                <div className="text-sm text-right mr-4 hidden md:block">
                                                    <p className={`font-bold ${u.remainingAmount > 0 ? 'text-red-500' : 'text-green-500'}`}>
                                                        {u.remainingAmount > 0 ? `Due: ₹${u.remainingAmount}` : 'Paid'}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground">Room: {u.roomType}</p>
                                                </div>
                                                <div className="flex gap-2">
                                                    <Button size="sm" variant="outline" className="rounded-full" onClick={() => { setSelectedUser(u); setIsUserModalOpen(true); setIsEditingUser(false); }}>
                                                        View
                                                    </Button>
                                                    <Button size="sm" variant="outline" onClick={() => downloadInvoice(u._id)} className="rounded-full">
                                                        <Download className="w-4 h-4" />
                                                    </Button>
                                                    <Button size="sm" variant="destructive" className="rounded-full" onClick={() => setDeleteConfirm({ isOpen: true, type: 'user', id: u._id })}>
                                                        <Trash2 className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {activeTab === 'rooms' && (
                            <div className="animate-fade-in">
                                <Button variant="ghost" className="mb-6 pl-0 hover:bg-transparent text-muted-foreground hover:text-foreground" onClick={() => setActiveTab('users')}>
                                    <ArrowLeft className="w-4 h-4 mr-2" /> Back to Users
                                </Button>
                                <h2 className="text-2xl font-bold font-display text-primary mb-6">{editingRoomId ? 'Edit Room' : 'Add New Room'}</h2>

                                <form onSubmit={handleSubmitRoom} className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12 bg-muted/30 p-8 rounded-2xl border border-border/50">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Room Name</label>
                                        <Input placeholder="e.g. Luxury Suite" value={newRoom.roomName} onChange={(e) => setNewRoom({ ...newRoom, roomName: e.target.value })} className="rounded-lg bg-background" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Cost per Month (₹)</label>
                                        <Input type="number" placeholder="0" value={newRoom.roomCost} onChange={(e) => setNewRoom({ ...newRoom, roomCost: Number(e.target.value) })} className="rounded-lg bg-background" />
                                    </div>
                                    <div className="space-y-2 md:col-span-2">
                                        <label className="text-sm font-medium">Room Details</label>
                                        <Input placeholder="Short description of the room" value={newRoom.roomDetails} onChange={(e) => setNewRoom({ ...newRoom, roomDetails: e.target.value })} className="rounded-lg bg-background" />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Number of Beds</label>
                                        <Input type="number" placeholder="1" value={newRoom.beds} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewRoom({ ...newRoom, beds: Number(e.target.value) })} className="rounded-lg bg-background" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Capacity (Persons)</label>
                                        <Input type="number" placeholder="1" value={newRoom.capacity} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewRoom({ ...newRoom, capacity: Number(e.target.value) })} className="rounded-lg bg-background" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Room Size</label>
                                        <Input placeholder="e.g 150 sq ft" value={newRoom.size} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewRoom({ ...newRoom, size: e.target.value })} className="rounded-lg bg-background" />
                                    </div>

                                    <div className="space-y-2 md:col-span-2">
                                        <label className="text-sm font-medium">Room Image</label>
                                        <div className="flex flex-col sm:flex-row gap-4 items-center">
                                            <Input type="file" accept="image/*" onChange={(e: React.ChangeEvent<HTMLInputElement>) => e.target.files && setRoomFile(e.target.files[0])} className="rounded-lg bg-background file:rounded-full file:border-0 file:bg-primary/10 file:text-primary file:mr-4 hover:file:bg-primary/20" />
                                            <div className="flex gap-2 w-full sm:w-auto">
                                                <Button type="submit" className="rounded-full shadow-lg flex-1 sm:flex-none" disabled={isLoading}>
                                                    {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                                                    {editingRoomId ? 'Update Room' : 'Add Room'}
                                                </Button>
                                                {editingRoomId && (
                                                    <Button variant="ghost" onClick={() => {
                                                        setEditingRoomId(null);
                                                        setNewRoom({ roomName: '', roomCost: 0, roomDetails: '', images: '', beds: 1, capacity: 1, size: '100 sq ft' });
                                                        setRoomFile(null);
                                                    }} className="rounded-full">Cancel</Button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </form>

                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                    {rooms.map((r: any) => (
                                        <div key={r._id} className="group bg-card rounded-2xl overflow-hidden shadow-lg border border-border/50 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                                            <div className="relative h-48 w-full overflow-hidden">
                                                <img
                                                    src={r.images && r.images.length > 0 ? r.images[0] : 'https://placehold.co/600x400'}
                                                    alt={r.roomName}
                                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                                />
                                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                                                <div className="absolute bottom-4 left-4 text-white font-bold text-xl drop-shadow-md">
                                                    ₹{r.roomCost} <span className="text-sm font-normal text-gray-200">/month</span>
                                                </div>
                                            </div>
                                            <div className="p-6">
                                                <h3 className="text-lg font-bold mb-2 font-display">{r.roomName}</h3>
                                                <div className="flex justify-between text-sm text-muted-foreground mb-6">
                                                    <div className="flex items-center gap-1"><Bed className="w-4 h-4 text-primary" /> {r.beds} Bed</div>
                                                    <div className="flex items-center gap-1"><User className="w-4 h-4 text-primary" /> {r.capacity} Person</div>
                                                    <div className="flex items-center gap-1"><Maximize className="w-4 h-4 text-primary" /> {r.size}</div>
                                                </div>
                                                <div className="flex gap-3">
                                                    <Button variant="outline" size="sm" className="flex-1 rounded-full" onClick={() => handleEditRoom(r)}>
                                                        <Edit3 className="w-4 h-4 mr-2" /> Edit
                                                    </Button>
                                                    <Button variant="destructive" size="sm" className="flex-1 rounded-full" onClick={() => deleteRoom(r._id)}>
                                                        <Trash2 className="w-4 h-4 mr-2" /> Delete
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {activeTab === 'notes' && (
                            <div className="animate-fade-in">
                                <Button variant="ghost" className="mb-6 pl-0 hover:bg-transparent text-muted-foreground hover:text-foreground" onClick={() => setActiveTab('users')}>
                                    <ArrowLeft className="w-4 h-4 mr-2" /> Back to Users
                                </Button>
                                <h2 className="text-2xl font-bold font-display text-primary mb-6">Manage Notes</h2>

                                {/* Add Note Form */}
                                <form onSubmit={handleCreateNote} className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8 bg-muted/30 p-6 rounded-2xl border border-border/50">
                                    <Input placeholder="Title" value={noteTitle} onChange={(e) => setNoteTitle(e.target.value)} className="rounded-lg bg-background" />
                                    <Input placeholder="Section" value={noteSection} onChange={(e) => setNoteSection(e.target.value)} className="rounded-lg bg-background" />
                                    <div className="flex gap-2 md:col-span-2">
                                        <Input type="file" accept="application/pdf" onChange={(e) => e.target.files && setNoteFile(e.target.files[0])} className="rounded-lg bg-background file:rounded-full file:border-0 file:bg-primary/10 file:text-primary file:mr-4 hover:file:bg-primary/20" />
                                        <Button type="submit" className="rounded-full shadow-lg" disabled={isLoading}>
                                            {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : 'Add'}
                                        </Button>
                                    </div>
                                </form>

                                <div className="space-y-3">
                                    {notes.map(n => (
                                        <div key={n._id} className="bg-card p-4 rounded-xl border border-border/50 shadow-sm hover:shadow-md transition-shadow group">
                                            <div className="flex justify-between items-center">
                                                <div className="flex flex-col">
                                                    <span className="font-bold text-foreground">{n.title} <span className="text-xs font-normal text-muted-foreground ml-2 px-2 py-0.5 bg-muted rounded-full">{n.section}</span></span>
                                                    <span className="text-xs text-muted-foreground mt-1">
                                                        By: {n.uploadedBy?.name || 'Unknown'} <span className="mx-2">•</span> Status: {n.isApproved ? <span className="text-green-600 font-bold">Approved</span> : <span className="text-yellow-600 font-bold">Pending</span>}
                                                    </span>
                                                </div>
                                                <div className="flex gap-2">
                                                    {!n.isApproved && (
                                                        <Button size="sm" variant="default" onClick={(e) => handleApproveNote(n._id, e)} className="rounded-full">
                                                            Approve
                                                        </Button>
                                                    )}
                                                    {n.pdfUrl && (
                                                        <>
                                                            <Button
                                                                size="sm"
                                                                variant={expandedNoteId === n._id ? 'default' : 'outline'}
                                                                className="rounded-full"
                                                                onClick={() => setExpandedNoteId(expandedNoteId === n._id ? null : n._id)}
                                                            >
                                                                <FileText className="w-4 h-4" />
                                                            </Button>
                                                            <Button size="sm" variant="outline" className="rounded-full" onClick={() => handleDirectDownload(n.pdfUrl, `${n.title}.pdf`)}>
                                                                <Download className="w-4 h-4" />
                                                            </Button>
                                                        </>
                                                    )}
                                                    <Button size="sm" variant="destructive" onClick={() => handleDeleteNote(n._id)} className="rounded-full">
                                                        <Trash2 className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                            </div>
                                            {expandedNoteId === n._id && n.pdfUrl && (
                                                <div className="mt-4 animate-fade-in border-t border-border/50 pt-4">
                                                    <object
                                                        data={n.pdfUrl}
                                                        type="application/pdf"
                                                        className="w-full h-[500px] rounded-lg border border-border bg-white"
                                                    >
                                                        <div className="flex flex-col items-center justify-center h-full text-muted-foreground p-4 text-center">
                                                            <p className="mb-2">Unable to display PDF inline.</p>
                                                            <Button variant="outline" size="sm" onClick={() => window.open(n.pdfUrl, '_blank')} className="rounded-full">
                                                                Open in New Tab
                                                            </Button>
                                                        </div>
                                                    </object>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </main >
            <Footer />

            <Modal
                isOpen={deleteConfirm.isOpen}
                onClose={() => setDeleteConfirm({ isOpen: false, type: null, id: null })}
                title="Confirm Deletion"
            >
                <div className="space-y-4">
                    <p className="text-muted-foreground">
                        Are you sure you want to delete this {deleteConfirm.type}? This action cannot be undone.
                    </p>
                    <div className="flex justify-end gap-3">
                        <Button
                            variant="outline"
                            onClick={() => setDeleteConfirm({ isOpen: false, type: null, id: null })}
                            className="rounded-full"
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={confirmDelete}
                            className="rounded-full"
                        >
                            Delete {deleteConfirm.type === 'room' ? 'Room' : deleteConfirm.type === 'note' ? 'Note' : 'User'}
                        </Button>
                    </div>
                </div>
            </Modal>

            <Modal
                isOpen={successPopup.isOpen}
                onClose={() => setSuccessPopup({ ...successPopup, isOpen: false })}
                title={successPopup.title}
            >
                <div className="flex flex-col items-center justify-center p-4 text-center">
                    <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-4">
                        <CheckCircle className="w-8 h-8" />
                    </div>
                    <p className="text-lg text-muted-foreground mb-6">{successPopup.message}</p>
                    <Button onClick={() => setSuccessPopup({ ...successPopup, isOpen: false })} className="rounded-full w-full shadow-md hover:shadow-lg">
                        Done
                    </Button>
                </div>
            </Modal>

            {/* User Details Modal */}
            <Modal
                isOpen={isUserModalOpen}
                onClose={() => setIsUserModalOpen(false)}
                title={isEditingUser ? "Edit Student Details" : "Student Details"}
            >
                {selectedUser && (
                    <div className="space-y-6">
                        {!isEditingUser ? (
                            <>
                                <div className="flex flex-col items-center border-b border-border/50 pb-6 relative">
                                    <Button variant="ghost" size="sm" className="absolute right-0 top-0 rounded-full" onClick={() => startEditing(selectedUser)}>
                                        <Edit3 className="w-4 h-4 mr-2" /> Edit
                                    </Button>
                                    <div className="h-24 w-24 rounded-full overflow-hidden bg-muted mb-4 border-2 border-primary/20">
                                        {selectedUser.photo ? <img src={selectedUser.photo} alt={selectedUser.name} className="w-full h-full object-cover" /> : <User className="w-12 h-12 text-muted-foreground m-auto mt-6" />}
                                    </div>
                                    <h3 className="text-xl font-bold font-display">{selectedUser.name}</h3>
                                    <p className="text-muted-foreground">{selectedUser.email}</p>
                                    <span className={`mt-2 px-3 py-1 rounded-full text-xs font-bold ${selectedUser.remainingAmount > 0 ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                                        {selectedUser.remainingAmount > 0 ? 'Payment Due' : 'Fully Paid'}
                                    </span>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                    <div className="p-3 bg-muted/30 rounded-lg">
                                        <p className="text-xs text-muted-foreground uppercase mb-1">Contact</p>
                                        <p className="font-medium">{selectedUser.phone}</p>
                                    </div>
                                    <div className="p-3 bg-muted/30 rounded-lg">
                                        <p className="text-xs text-muted-foreground uppercase mb-1">Room Type</p>
                                        <p className="font-medium">{selectedUser.roomType}</p>
                                    </div>
                                    <div className="p-3 bg-muted/30 rounded-lg">
                                        <p className="text-xs text-muted-foreground uppercase mb-1">DOB</p>
                                        <p className="font-medium">{selectedUser.dob ? new Date(selectedUser.dob).toLocaleDateString() : 'N/A'}</p>
                                    </div>
                                    <div className="p-3 bg-muted/30 rounded-lg">
                                        <p className="text-xs text-muted-foreground uppercase mb-1">Aadhar</p>
                                        <p className="font-medium">{selectedUser.aadharNo || 'N/A'}</p>
                                    </div>
                                </div>

                                <div>
                                    <h4 className="font-bold text-sm mb-3 uppercase tracking-wider text-primary">Payment Status</h4>
                                    <div className="grid grid-cols-3 gap-2 text-center">
                                        <div className="p-3 border border-border rounded-lg bg-card">
                                            <p className="text-xs text-muted-foreground mb-1">Total</p>
                                            <p className="font-bold text-lg">₹{selectedUser.totalAmount}</p>
                                        </div>
                                        <div className="p-3 border border-green-200 bg-green-50/50 rounded-lg">
                                            <p className="text-xs text-green-600 mb-1">Paid</p>
                                            <p className="font-bold text-lg text-green-700">₹{selectedUser.paidAmount}</p>
                                        </div>
                                        <div className="p-3 border border-red-200 bg-red-50/50 rounded-lg">
                                            <p className="text-xs text-red-600 mb-1">Remaining</p>
                                            <p className="font-bold text-lg text-red-700">₹{selectedUser.remainingAmount}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="border-t border-border/50 pt-4">
                                    <Button variant="outline" onClick={() => handlePrintForm(selectedUser)} className="w-full rounded-full">
                                        <Printer className="w-4 h-4 mr-2" /> Print Application Form
                                    </Button>
                                </div>

                                <div className="border-t border-border/50 pt-4">
                                    <h4 className="font-bold text-sm mb-3 uppercase tracking-wider text-muted-foreground">Family & Guardians</h4>
                                    <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                                        <div><span className="text-muted-foreground">Father:</span> {selectedUser.fatherName}</div>
                                        <div><span className="text-muted-foreground">Phone:</span> {selectedUser.fatherPhone}</div>
                                        <div><span className="text-muted-foreground">Mother:</span> {selectedUser.motherName}</div>
                                        <div><span className="text-muted-foreground">Phone:</span> {selectedUser.motherPhone}</div>
                                    </div>
                                </div>

                                {selectedUser.university && (
                                    <div className="border-t border-border/50 pt-4">
                                        <h4 className="font-bold text-sm mb-3 uppercase tracking-wider text-muted-foreground">Academic</h4>
                                        <p className="text-sm">{selectedUser.university} <span className="text-muted-foreground">({selectedUser.registrationNo})</span></p>
                                    </div>
                                )}
                            </>
                        ) : (
                            <form onSubmit={handleUpdateUser} className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-xs font-medium">Full Name <span className="text-red-500">*</span></label>
                                        <Input value={editFormData.name} onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })} className="h-9" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-medium">Email <span className="text-red-500">*</span></label>
                                        <Input value={editFormData.email} onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })} className="h-9" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-medium">Phone <span className="text-red-500">*</span></label>
                                        <Input value={editFormData.phone} onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })} className="h-9" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-medium">Address <span className="text-red-500">*</span></label>
                                        <Input value={editFormData.address} onChange={(e) => setEditFormData({ ...editFormData, address: e.target.value })} className="h-9" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-medium">Room Type</label>
                                        <Input value={editFormData.roomType} onChange={(e) => setEditFormData({ ...editFormData, roomType: e.target.value })} className="h-9" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-medium">DOB</label>
                                        <Input type="date" value={editFormData.dob} onChange={(e) => setEditFormData({ ...editFormData, dob: e.target.value })} className="h-9" />
                                    </div>
                                </div>

                                <div className="space-y-2 border-t border-border/50 pt-4">
                                    <h4 className="text-sm font-bold text-primary">Update Payment</h4>
                                    <div className="p-4 bg-muted/30 rounded-lg space-y-3">
                                        <div className="flex justify-between text-sm">
                                            <span>Current Paid:</span>
                                            <span className="font-bold text-green-600">₹{selectedUser.paidAmount}</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span>Current Due:</span>
                                            <span className="font-bold text-red-600">₹{selectedUser.remainingAmount}</span>
                                        </div>
                                        <div className="flex gap-2 items-center">
                                            <Input
                                                type="number"
                                                placeholder="Add Amount (e.g. 5000)"
                                                value={paymentUpdateAmount}
                                                onChange={(e) => setPaymentUpdateAmount(e.target.value)}
                                                className="bg-background"
                                            />
                                        </div>
                                        <p className="text-xs text-muted-foreground">* This amount will be added to the current paid amount.</p>
                                    </div>
                                </div>

                                <div className="flex justify-end gap-3 pt-4">
                                    <Button type="button" variant="ghost" onClick={() => setIsEditingUser(false)} className="rounded-full">Cancel</Button>
                                    <Button type="submit" disabled={isLoading} className="rounded-full shadow-md">
                                        {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                                        Save Changes
                                    </Button>
                                </div>
                            </form>
                        )}

                        {!isEditingUser && (
                            <div className="flex justify-end pt-4 gap-4">
                                <Button onClick={() => setIsUserModalOpen(false)} className="rounded-full px-8">Close</Button>
                            </div>
                        )}
                    </div>
                )}
            </Modal>
            {/* Add Admin Modal */}
            <Modal
                isOpen={isAddAdminModalOpen}
                onClose={() => setIsAddAdminModalOpen(false)}
                title="Register New Admin"
            >
                <form onSubmit={handleCreateAdmin} className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Full Name</label>
                        <Input value={newAdmin.name} onChange={(e) => setNewAdmin({ ...newAdmin, name: e.target.value })} required />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Email</label>
                        <Input type="email" value={newAdmin.email} onChange={(e) => setNewAdmin({ ...newAdmin, email: e.target.value })} required />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Password</label>
                        <Input type="password" value={newAdmin.password} onChange={(e) => setNewAdmin({ ...newAdmin, password: e.target.value })} required />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Phone</label>
                        <Input value={newAdmin.phone} onChange={(e) => setNewAdmin({ ...newAdmin, phone: e.target.value })} required />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Address</label>
                        <Input value={newAdmin.address} onChange={(e) => setNewAdmin({ ...newAdmin, address: e.target.value })} required />
                    </div>
                    <Button type="submit" className="w-full" disabled={isLoading}>
                        {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                        Create Admin
                    </Button>
                </form>
            </Modal>
            {/* Change Password Modal */}
            <Modal
                isOpen={isChangePasswordModalOpen}
                onClose={() => setIsChangePasswordModalOpen(false)}
                title="Change Password"
            >
                <ChangePasswordForm
                    onSuccess={() => {
                        setIsChangePasswordModalOpen(false);
                        toast.success('Password updated successfully!');
                    }}
                    onCancel={() => setIsChangePasswordModalOpen(false)}
                />
            </Modal>
        </>
    );
};

export default AdminDashboard;
