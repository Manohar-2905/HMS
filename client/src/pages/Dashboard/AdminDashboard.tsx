import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { saveAs } from 'file-saver';
import api from '../../api/axios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Trash2, Download, Users, Bed, FileText, ArrowLeft, Maximize, User, Edit3, Loader2, CheckCircle, UserPlus, Lock, Bell, Check, X, Calendar, ChevronDown, ChevronUp, Folder, ShieldCheck, UserCircle, ChevronRight } from 'lucide-react';

import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { SEO } from '@/components/layout/SEO';
import { Modal } from '@/components/ui/Modal';
// Removed react-pdf imports - using Google Docs Viewer instead (like CA website)
import { ChangePasswordForm } from '@/components/auth/ChangePasswordForm';
import { AttendanceCalendar } from '@/components/dashboard/AttendanceCalendar';
import toast from 'react-hot-toast';
import { cn } from '@/lib/utils';

const AdminDashboard = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState<'users' | 'rooms' | 'notes' | 'attendance' | 'gallery' | 'events'>('users');
    const [users, setUsers] = useState<any[]>([]);
    const [rooms, setRooms] = useState<any[]>([]);
    const [notes, setNotes] = useState<any[]>([]);
    const [gallery, setGallery] = useState<any[]>([]);
    const [events, setEvents] = useState<any[]>([]);
    const [pendingUsers, setPendingUsers] = useState<any[]>([]);
    const [deleteConfirm, setDeleteConfirm] = useState<{
        isOpen: boolean;
        type: 'room' | 'note' | 'user' | 'gallery' | 'event' | null;
        id: string | null;
    }>({ isOpen: false, type: null, id: null });

    // PDF Preview State
    const [pdfPreview, setPdfPreview] = useState<{
        isOpen: boolean;
        url: string | null;
        title: string | null;
        noteId: string | null;
    }>({ isOpen: false, url: null, title: null, noteId: null });
    const [pdfBlobUrl, setPdfBlobUrl] = useState<string | null>(null);
    const [pdfLoading, setPdfLoading] = useState(false);
    // Removed react-pdf state - using Google Docs Viewer instead
    const [successPopup, setSuccessPopup] = useState<{
        isOpen: boolean;
        title: string;
        message: string;
    }>({ isOpen: false, title: '', message: '' });
    const [isLoading, setIsLoading] = useState(false);
    const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({ 'Admin': true });
    const [selectedUser, setSelectedUser] = useState<any | null>(null);
    const [isUserModalOpen, setIsUserModalOpen] = useState(false);
    const [isEditingUser, setIsEditingUser] = useState(false);
    const [editFormData, setEditFormData] = useState<any>({});
    const [paymentUpdateAmount, setPaymentUpdateAmount] = useState('');
    const [paymentRemarks, setPaymentRemarks] = useState('');
    const [showPaymentHistory, setShowPaymentHistory] = useState(false);
    const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().split('T')[0]);
    const [attendanceRecords, setAttendanceRecords] = useState<any[]>([]);
    const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
    const [bulkData, setBulkData] = useState({
        userId: '',
        userName: '',
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date().toISOString().split('T')[0],
        status: 'Absent',
        remarks: ''
    });
    const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
    const [selectedInvoiceUser, setSelectedInvoiceUser] = useState<string | null>(null);
    const [invoiceDate, setInvoiceDate] = useState(new Date().toISOString().split('T')[0]);

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
    const [roomFiles, setRoomFiles] = useState<File[]>([]);
    const [editingRoomId, setEditingRoomId] = useState<string | null>(null);
    const [noteTitle, setNoteTitle] = useState('');
    const [noteSection, setNoteSection] = useState('');
    const [noteCategory, setNoteCategory] = useState<'Admin' | 'User'>('Admin');
    const [noteFile, setNoteFile] = useState<File | null>(null);

    const [newGalleryItem, setNewGalleryItem] = useState({ title: '', category: '' });
    const [galleryFile, setGalleryFile] = useState<File | null>(null);

    const [newEvent, setNewEvent] = useState({ title: '', category: 'Celebration' });
    const [eventFile, setEventFile] = useState<File | null>(null);

    const [isAddAdminModalOpen, setIsAddAdminModalOpen] = useState(false);
    const [isChangePasswordModalOpen, setIsChangePasswordModalOpen] = useState(false);
    const [newAdmin, setNewAdmin] = useState({
        name: '', email: '', password: '', phone: '', address: ''
    });

    useEffect(() => {
        fetchData();
    }, [activeTab, attendanceDate]);

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
                const { data } = await api.get(`/api/notes`, config);
                setNotes(data.notes);
            } else if (activeTab === 'attendance') {
                const { data: attData } = await api.get(`/api/attendance/date/${attendanceDate}`, config);
                setAttendanceRecords(attData);
                const { data: userData } = await api.get('/api/auth/users', config);
                setUsers(userData);
            } else if (activeTab === 'gallery') {
                const { data } = await api.get('/api/gallery');
                setGallery(data);
            } else if (activeTab === 'events') {
                const { data } = await api.get('/api/events', config);
                setEvents(data);
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
                const value = (submissionData as any)[key];
                if (key === 'visitors') {
                    formData.append('visitors', JSON.stringify(value));
                } else if (value !== undefined && value !== null) {
                    formData.append(key, value.toString());
                }
            });
            if (userPhoto) {
                formData.append('photo', userPhoto);
            }

            const createPromise = api.post('/api/auth/register', formData, config);

            toast.promise(createPromise, {
                loading: 'Registering user...',
                success: 'User registered successfully!',
                error: (err) => {
                    const msg = err.response?.data?.message || err.message || 'Error creating user';
                    return msg;
                }
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

    const handleMarkAttendance = async (userId: string, status: string) => {
        try {
            const token = user?.token;
            const config = { headers: { Authorization: `Bearer ${token}` } };

            const promise = api.post('/api/attendance/mark', {
                attendanceData: [{
                    userId,
                    date: attendanceDate,
                    status
                }]
            }, config);

            toast.promise(promise, {
                loading: 'Updating attendance...',
                success: 'Attendance updated!',
                error: (err) => err.response?.data?.message || 'Error updating attendance'
            });

            await promise;
            fetchData();
        } catch (error: any) {
            console.error(error);
        }
    };

    const handleMarkBulkAttendance = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const token = user?.token;
            const config = { headers: { Authorization: `Bearer ${token}` } };

            const promise = api.post('/api/attendance/bulk', {
                userId: bulkData.userId,
                startDate: bulkData.startDate,
                endDate: bulkData.endDate,
                status: bulkData.status,
                remarks: bulkData.remarks
            }, config);

            toast.promise(promise, {
                loading: 'Applying bulk attendance...',
                success: (res) => res.data.message || 'Bulk attendance updated!',
                error: (err) => err.response?.data?.message || 'Error marking bulk'
            });

            await promise;
            setIsBulkModalOpen(false);
            fetchData();
        } catch (error: any) {
            console.error(error);
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
            if (roomFiles.length > 0) {
                roomFiles.forEach(file => {
                    formData.append('images', file);
                });
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
            setRoomFiles([]);
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

            // Send payment data during approval
            const payload = {
                totalAmount: Number(editFormData.totalAmount) || 0,
                paidAmount: Number(editFormData.paidAmount) || 0
            };

            const approvePromise = api.post(`/api/auth/approve-user/${userId}`, payload, config);

            toast.promise(approvePromise, {
                loading: 'Verifying student...',
                success: 'Student approved!',
                error: 'Error approving user'
            });

            await approvePromise;
            setIsUserModalOpen(false); // Close modal after approval
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
        setRoomFiles([]);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };



    const handleCreateNote = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!noteFile) return toast.error('Please select a PDF file');
        setIsLoading(true);

        const formData = new FormData();
        formData.append('title', noteTitle);
        formData.append('section', noteSection);
        formData.append('category', noteCategory);
        formData.append('pdf', noteFile);

        try {
            const token = user?.token;
            const config = { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' } };
            const uploadPromise = api.post('/api/notes', formData, config);

            toast.promise(uploadPromise, {
                loading: 'Uploading note...',
                success: 'Note added successfully!',
                error: (err: any) => err.response?.data?.message || 'Error creating note'
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

    const handleConfirmDelete = async () => {
        if (!deleteConfirm.id || !deleteConfirm.type) return;

        const token = user?.token;
        const config = { headers: { Authorization: `Bearer ${token}` } };
        setIsLoading(true);

        try {
            let url = '';
            if (deleteConfirm.type === 'room') url = `/api/rooms/${deleteConfirm.id}`;
            else if (deleteConfirm.type === 'note') url = `/api/notes/${deleteConfirm.id}`;
            else if (deleteConfirm.type === 'user') url = `/api/auth/users/${deleteConfirm.id}`;
            else if (deleteConfirm.type === 'gallery') url = `/api/gallery/${deleteConfirm.id}`;
            else if (deleteConfirm.type === 'event') url = `/api/events/${deleteConfirm.id}`;

            await api.delete(url, config);
            toast.success(`${deleteConfirm.type.charAt(0).toUpperCase() + deleteConfirm.type.slice(1)} deleted!`);
            fetchData();
            setDeleteConfirm({ isOpen: false, type: null, id: null });
        } catch (error) {
            toast.error('Delete failed');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmitGallery = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!galleryFile) {
            toast.error('Please select an image');
            return;
        }
        setIsLoading(true);
        try {
            const formData = new FormData();
            formData.append('title', newGalleryItem.title);
            formData.append('category', newGalleryItem.category);
            formData.append('image', galleryFile);

            const token = user?.token;
            const config = { headers: { Authorization: `Bearer ${token}` } };
            await api.post('/api/gallery', formData, config);
            toast.success('Gallery item added!');
            setNewGalleryItem({ title: '', category: '' });
            setGalleryFile(null);
            fetchData();
        } catch (error) {
            toast.error('Add failed');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmitEvent = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!eventFile) {
            toast.error('Please select an image');
            return;
        }
        setIsLoading(true);
        try {
            const formData = new FormData();
            formData.append('title', newEvent.title);
            formData.append('category', newEvent.category);
            formData.append('image', eventFile);

            const token = user?.token;
            const config = { headers: { Authorization: `Bearer ${token}` } };
            await api.post('/api/events', formData, config);
            toast.success('Celebration image added!');
            setNewEvent({ title: '', category: 'Celebration' });
            setEventFile(null);
            fetchData();
        } catch (error) {
            toast.error('Add failed');
        } finally {
            setIsLoading(false);
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
                payload.remarks = paymentRemarks;
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
            setPaymentRemarks('');
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

    const openUserDetails = (user: any) => {
        setSelectedUser(user);
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
            registrationNo: user.registrationNo,
            totalAmount: user.totalAmount || 0,
            paidAmount: user.paidAmount || 0
        });
        setIsUserModalOpen(true);
        setIsEditingUser(false);
        setPaymentUpdateAmount('');
        setPaymentRemarks('');
        setShowPaymentHistory(false);
    };

    const startEditing = () => {
        setIsEditingUser(true);
    };

    const downloadInvoice = async (userId: string, date?: string) => {
        try {
            const token = user?.token;
            const config = {
                headers: { Authorization: `Bearer ${token}` },
                responseType: 'blob' as 'blob',
                params: { date }
            };
            const response = await api.get(`/api/invoice/${userId}`, config);
            saveAs(response.data, 'invoice.pdf');
            toast.success('Invoice downloaded!');
            setIsDatePickerOpen(false);
        } catch (error) {
            toast.error('Error downloading invoice');
        }
    };

    const handleDirectDownload = (url: string, filename: string) => {
        try {
            // Ensure URL has HTTPS protocol (like CA website)
            let pdfUrl = url.replace(/^http:/, 'https:');
            if (!pdfUrl.startsWith('http://') && !pdfUrl.startsWith('https://')) {
                pdfUrl = `https://${pdfUrl}`;
            }

            // Use simple link download approach (like CA website) - works better with Cloudinary
            const link = document.createElement('a');
            link.href = pdfUrl;
            link.download = filename;
            link.target = '_blank';
            link.rel = 'noopener noreferrer';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            toast.success('Download started!');
        } catch (error) {
            console.error('Download error:', error);
            toast.error('Failed to download PDF. Please try opening in a new tab.');
        }
    };

    // Fetch PDF and create blob URL when preview opens (handles auth properly)
    useEffect(() => {
        if (pdfPreview.isOpen && pdfPreview.noteId && !pdfBlobUrl && !pdfLoading) {
            setPdfLoading(true);
            api.get(`/api/notes/proxy/${pdfPreview.noteId}`, {
                responseType: 'blob'
            })
                .then((response) => {
                    const blob = new Blob([response.data], { type: 'application/pdf' });
                    const blobUrl = URL.createObjectURL(blob);
                    setPdfBlobUrl(blobUrl);
                    setPdfLoading(false);
                })
                .catch((error) => {
                    console.error('Failed to load PDF:', error);
                    setPdfLoading(false);
                    toast.error('Failed to load PDF preview');
                });
        }

        // Cleanup blob URL when modal closes
        return () => {
            if (!pdfPreview.isOpen && pdfBlobUrl) {
                URL.revokeObjectURL(pdfBlobUrl);
                setPdfBlobUrl(null);
            }
        };
    }, [pdfPreview.isOpen, pdfPreview.noteId]);

    return (
        <>
            <Navbar />
            <main>
                <SEO
                    title="Admin Dashboard | Yashoda Bhavan"
                    description="Manage users, rooms, and content."
                />

                {/* Header */}
                <div className="dark-gradient pt-32 pb-16 relative overflow-hidden">
                    {/* Decorative Background Elements */}
                    <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.05),transparent)] pointer-events-none" />

                    <div className="container mx-auto px-4 relative z-10">
                        <div className="flex flex-col gap-10">
                            {/* Top Row: Title and Utility Buttons */}
                            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
                                <div className="text-left max-w-2xl">
                                    <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 drop-shadow-sm">
                                        Admin Dashboard
                                    </h1>
                                    <p className="text-white/70 text-lg md:text-xl">
                                        Welcome back, Admin. Manage your hostel operations efficiently.
                                    </p>
                                </div>

                                <div className="flex flex-wrap items-center gap-3">
                                    <Button
                                        onClick={() => setActiveTab('users')}
                                        className="bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-full backdrop-blur-sm transition-all h-12 w-12 p-0 shrink-0"
                                    >
                                        <Bell className="w-5 h-5" />
                                        {pendingUsers.length > 0 && (
                                            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold h-5 w-5 rounded-full flex items-center justify-center animate-pulse border-2 border-[#1a1c2c]">
                                                {pendingUsers.length}
                                            </span>
                                        )}
                                    </Button>
                                    <Button
                                        onClick={() => setIsChangePasswordModalOpen(true)}
                                        className="bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-full backdrop-blur-sm transition-all h-12 px-6 font-medium whitespace-nowrap"
                                    >
                                        <Lock className="w-4 h-4 mr-2" />
                                        Change Password
                                    </Button>
                                    <Button
                                        onClick={() => setIsAddAdminModalOpen(true)}
                                        className="bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-full backdrop-blur-sm transition-all h-12 px-6 font-medium whitespace-nowrap"
                                    >
                                        <UserPlus className="w-4 h-4 mr-2" />
                                        Add Admin
                                    </Button>
                                </div>
                            </div>

                            {/* Bottom Row: Navigation Tabs container start */}
                            <div className="relative group">
                                <div className="flex overflow-x-auto pb-4 lg:pb-0 lg:justify-center no-scrollbar">
                                    <div className="inline-flex items-center gap-3 bg-white/5 backdrop-blur-md p-2 rounded-2xl lg:rounded-full border border-white/10 shrink-0">


                                        <Button
                                            variant={activeTab === 'users' ? 'default' : 'outline'}
                                            onClick={() => setActiveTab('users')}
                                            className={cn(
                                                "rounded-xl lg:rounded-full shadow-lg h-11 px-6 transition-all duration-300 whitespace-nowrap",
                                                activeTab === 'users' ? "bg-white text-primary hover:bg-white/90" : "bg-transparent text-white border-white/10 hover:bg-white/10"
                                            )}
                                        >
                                            <Users className="w-4 h-4 mr-2" /> Users
                                        </Button>
                                        <Button
                                            variant={activeTab === 'rooms' ? 'default' : 'outline'}
                                            onClick={() => setActiveTab('rooms')}
                                            className={cn(
                                                "rounded-xl lg:rounded-full shadow-lg h-11 px-6 transition-all duration-300 whitespace-nowrap",
                                                activeTab === 'rooms' ? "bg-white text-primary hover:bg-white/90" : "bg-transparent text-white border-white/10 hover:bg-white/10"
                                            )}
                                        >
                                            <Bed className="w-4 h-4 mr-2" /> Rooms
                                        </Button>
                                        <Button
                                            variant={activeTab === 'notes' ? 'default' : 'outline'}
                                            onClick={() => setActiveTab('notes')}
                                            className={cn(
                                                "rounded-xl lg:rounded-full shadow-lg h-11 px-6 transition-all duration-300 whitespace-nowrap",
                                                activeTab === 'notes' ? "bg-white text-primary hover:bg-white/90" : "bg-transparent text-white border-white/10 hover:bg-white/10"
                                            )}
                                        >
                                            <FileText className="w-4 h-4 mr-2" /> Notes
                                        </Button>
                                        <Button
                                            variant={activeTab === 'attendance' ? 'default' : 'outline'}
                                            onClick={() => setActiveTab('attendance')}
                                            className={cn(
                                                "rounded-xl lg:rounded-full shadow-lg h-11 px-6 transition-all duration-300 whitespace-nowrap",
                                                activeTab === 'attendance' ? "bg-white text-primary hover:bg-white/90" : "bg-transparent text-white border-white/10 hover:bg-white/10"
                                            )}
                                        >
                                            <Calendar className="w-4 h-4 mr-2" /> Attendance
                                        </Button>
                                        <Button
                                            variant={activeTab === 'gallery' ? 'default' : 'outline'}
                                            onClick={() => setActiveTab('gallery')}
                                            className={cn(
                                                "rounded-xl lg:rounded-full shadow-lg h-11 px-6 transition-all duration-300 whitespace-nowrap",
                                                activeTab === 'gallery' ? "bg-white text-primary hover:bg-white/90" : "bg-transparent text-white border-white/10 hover:bg-white/10"
                                            )}
                                        >
                                            <Maximize className="w-4 h-4 mr-2" /> Gallery
                                        </Button>
                                        <Button
                                            variant={activeTab === 'events' ? 'default' : 'outline'}
                                            onClick={() => setActiveTab('events')}
                                            className={cn(
                                                "rounded-xl lg:rounded-full shadow-lg h-11 px-6 transition-all duration-300 whitespace-nowrap",
                                                activeTab === 'events' ? "bg-white text-primary hover:bg-white/90" : "bg-transparent text-white border-white/10 hover:bg-white/10"
                                            )}
                                        >
                                            <Bell className="w-4 h-4 mr-2" /> Events
                                        </Button>
                                    </div>
                                </div>
                                {/* Mobile Scroll Hint */}
                                <div className="absolute right-0 top-0 bottom-4 w-12 bg-gradient-to-l from-[#1a1c2c]/50 to-transparent pointer-events-none lg:hidden" />
                            </div>
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
                                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => e.target.files && setUserPhoto(e.target.files[0])}
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
                                                <Input value={newUser.name} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewUser({ ...newUser, name: e.target.value })} required className="rounded-lg bg-background" />
                                            </div>
                                            <div className="md:col-span-2 space-y-2">
                                                <label className="text-sm font-medium">Address <span className="text-red-500">*</span></label>
                                                <Input value={newUser.address} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewUser({ ...newUser, address: e.target.value })} required className="rounded-lg bg-background" />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium">Date of Birth</label>
                                                <Input type="date" value={newUser.dob} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewUser({ ...newUser, dob: e.target.value })} className="rounded-lg bg-background" />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium">Email <span className="text-red-500">*</span></label>
                                                <Input type="email" value={newUser.email} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewUser({ ...newUser, email: e.target.value })} required className="rounded-lg bg-background" pattern="[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$" title="Please enter a valid email address" />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium">Mobile No. <span className="text-red-500">*</span></label>
                                                <Input type="tel" value={newUser.phone} onChange={(e: React.ChangeEvent<HTMLInputElement>) => { const val = e.target.value.replace(/\D/g, '').slice(0, 10); setNewUser({ ...newUser, phone: val }); }} required className="rounded-lg bg-background" minLength={10} maxLength={10} pattern="[0-9]{10}" title="Phone number must be exactly 10 digits" />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium">Aadhar No.</label>
                                                <Input value={newUser.aadharNo} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewUser({ ...newUser, aadharNo: e.target.value })} className="rounded-lg bg-background" />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium">Password <span className="text-red-500">*</span></label>
                                                <Input type="password" value={newUser.password} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewUser({ ...newUser, password: e.target.value })} required className="rounded-lg bg-background" />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Parent Details */}
                                    <div>
                                        <h3 className="font-bold text-lg mb-4 uppercase tracking-wider text-muted-foreground border-b border-border/50 pb-2">Parent's Details</h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium">Father's Name</label>
                                                <Input value={newUser.fatherName} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewUser({ ...newUser, fatherName: e.target.value })} className="rounded-lg bg-background" />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium">Father's Occupation</label>
                                                <Input value={newUser.fatherOccupation} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewUser({ ...newUser, fatherOccupation: e.target.value })} className="rounded-lg bg-background" />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium">Father's Mobile</label>
                                                <Input type="tel" value={newUser.fatherPhone} onChange={(e: React.ChangeEvent<HTMLInputElement>) => { const val = e.target.value.replace(/\D/g, '').slice(0, 10); setNewUser({ ...newUser, fatherPhone: val }); }} className="rounded-lg bg-background" minLength={10} maxLength={10} pattern="[0-9]{10}" title="Phone number must be exactly 10 digits" />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium">Mother's Name</label>
                                                <Input value={newUser.motherName} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewUser({ ...newUser, motherName: e.target.value })} className="rounded-lg bg-background" />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium">Mother's Mobile</label>
                                                <Input type="tel" value={newUser.motherPhone} onChange={(e: React.ChangeEvent<HTMLInputElement>) => { const val = e.target.value.replace(/\D/g, '').slice(0, 10); setNewUser({ ...newUser, motherPhone: val }); }} className="rounded-lg bg-background" minLength={10} maxLength={10} pattern="[0-9]{10}" title="Phone number must be exactly 10 digits" />
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
                                                    <div className="flex items-center gap-4 w-full md:w-auto cursor-pointer" onClick={() => openUserDetails(u)}>
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
                                            <div className="flex items-center gap-4 w-full md:w-auto cursor-pointer" onClick={() => openUserDetails(u)}>
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
                                                    <Button size="sm" variant="outline" onClick={() => { setSelectedInvoiceUser(u._id); setIsDatePickerOpen(true); }} className="rounded-full">
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
                                        <label className="text-sm font-medium">Room Images (Upload up to 4)</label>
                                        <div className="flex flex-col gap-4">
                                            <Input
                                                type="file"
                                                accept="image/*"
                                                multiple
                                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => e.target.files && setRoomFiles(Array.from(e.target.files))}
                                                className="rounded-lg bg-background file:rounded-full file:border-0 file:bg-primary/10 file:text-primary file:mr-4 hover:file:bg-primary/20"
                                            />
                                            {roomFiles.length > 0 && (
                                                <div className="flex gap-2 flex-wrap">
                                                    {roomFiles.map((file, idx) => (
                                                        <div key={idx} className="h-16 w-16 rounded-lg overflow-hidden border border-border relative group">
                                                            <img src={URL.createObjectURL(file)} alt="Preview" className="w-full h-full object-cover" />
                                                            <button
                                                                type="button"
                                                                onClick={() => setRoomFiles(roomFiles.filter((_, i) => i !== idx))}
                                                                className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity"
                                                            >
                                                                <Trash2 className="w-4 h-4" />
                                                            </button>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                            <div className="flex gap-2 w-full sm:w-auto">
                                                <Button type="submit" className="rounded-full shadow-lg flex-1 sm:flex-none" disabled={isLoading}>
                                                    {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                                                    {editingRoomId ? 'Update Room' : 'Add Room'}
                                                </Button>
                                                {editingRoomId && (
                                                    <Button variant="ghost" onClick={() => {
                                                        setEditingRoomId(null);
                                                        setNewRoom({ roomName: '', roomCost: 0, roomDetails: '', images: '', beds: 1, capacity: 1, size: '100 sq ft' });
                                                        setRoomFiles([]);
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
                            <div className="animate-fade-in flex flex-col h-auto min-h-[600px]">
                                <Button variant="ghost" className="mb-4 pl-0 w-fit hover:bg-transparent text-muted-foreground hover:text-foreground" onClick={() => setActiveTab('users')}>
                                    <ArrowLeft className="w-4 h-4 mr-2" /> Back to Users
                                </Button>

                                {/* Hierarchy Toolbar */}
                                <div className="bg-muted/30 p-6 rounded-2xl mb-8 border border-border/50">
                                    <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                                        <FileText className="w-6 h-6 text-primary" />
                                        Upload New Note
                                    </h3>
                                    <form onSubmit={handleCreateNote} className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
                                        <div className="md:col-span-3 space-y-2">
                                            <label className="text-xs font-bold uppercase text-muted-foreground ml-1">Title</label>
                                            <Input
                                                placeholder="e.g. Unit 1 Physics"
                                                value={noteTitle}
                                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNoteTitle(e.target.value)}
                                                className="bg-background rounded-xl h-11"
                                                required
                                            />
                                        </div>
                                        <div className="md:col-span-3 space-y-2">
                                            <label className="text-xs font-bold uppercase text-muted-foreground ml-1">Section (Group Name)</label>
                                            <Input
                                                placeholder="e.g. SEMESTER 1"
                                                value={noteSection}
                                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNoteSection(e.target.value)}
                                                className="bg-background rounded-xl h-11"
                                                required
                                            />
                                        </div>
                                        <div className="md:col-span-2 space-y-2">
                                            <label className="text-xs font-bold uppercase text-muted-foreground ml-1">Target Section</label>
                                            <select
                                                value={noteCategory}
                                                onChange={(e) => setNoteCategory(e.target.value as any)}
                                                className="w-full h-11 bg-background border border-input rounded-xl px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                                            >
                                                <option value="Admin">Admin Section</option>
                                                <option value="User">User Section</option>
                                            </select>
                                        </div>
                                        <div className="md:col-span-2 space-y-2">
                                            <label className="text-xs font-bold uppercase text-muted-foreground ml-1">PDF file</label>
                                            <div className="relative">
                                                <Input
                                                    type="file"
                                                    accept="application/pdf"
                                                    id="file-upload"
                                                    className="hidden"
                                                    onChange={(e) => e.target.files && setNoteFile(e.target.files[0])}
                                                />
                                                <Button type="button" variant="outline" className="w-full h-11 rounded-xl gap-2 truncate text-xs" onClick={() => document.getElementById('file-upload')?.click()}>
                                                    {noteFile ? noteFile.name : <><Download className="w-4 h-4" /> Pick PDF</>}
                                                </Button>
                                            </div>
                                        </div>
                                        <div className="md:col-span-2">
                                            <Button type="submit" className="w-full h-11 rounded-xl font-bold shadow-lg" disabled={isLoading || !noteFile}>
                                                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Add Note'}
                                            </Button>
                                        </div>
                                    </form>
                                </div>

                                {/* Hierarchical Notes Display */}
                                <div className="space-y-8">
                                    {['Admin', 'User'].map((cat) => {
                                        const catNotes = notes.filter(n => n.category === cat);
                                        const sections = Array.from(new Set(catNotes.map(n => n.section)));

                                        return (
                                            <div key={cat} className="space-y-4">
                                                <div
                                                    className="flex items-center justify-between bg-primary/5 p-4 rounded-2xl cursor-pointer hover:bg-primary/10 transition-colors border border-primary/10"
                                                    onClick={() => {
                                                        const isOpening = !expandedSections[cat];
                                                        setExpandedSections(prev => {
                                                            const next = {}; // Clear everything for strict exclusivity
                                                            next[cat] = isOpening;
                                                            return next;
                                                        });
                                                    }}
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <div className="p-2 bg-primary/20 rounded-xl">
                                                            {cat === 'Admin' ? <ShieldCheck className="w-6 h-6 text-primary" /> : <UserCircle className="w-6 h-6 text-primary" />}
                                                        </div>
                                                        <h2 className="text-xl font-black uppercase tracking-tight">{cat} Section</h2>
                                                        <span className="bg-primary text-white text-[10px] px-2 py-0.5 rounded-full font-bold">{catNotes.length}</span>
                                                    </div>
                                                    {expandedSections[cat] ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
                                                </div>

                                                {expandedSections[cat] && (
                                                    <div className="space-y-4 pl-4 md:pl-8 border-l-2 border-primary/10 ml-6 md:ml-8 animate-in slide-in-from-top-2 duration-300">
                                                        {sections.length === 0 && <p className="text-muted-foreground italic text-sm py-4">No sections created yet in this category.</p>}
                                                        {sections.map(secName => {
                                                            const secNotes = catNotes.filter(n => n.section === secName);
                                                            const secId = `${cat}-${secName}`;
                                                            return (
                                                                <div key={secId} className="space-y-3">
                                                                    <div
                                                                        className="flex items-center justify-between p-3 bg-card border border-border/50 rounded-xl cursor-pointer hover:shadow-sm"
                                                                        onClick={() => {
                                                                            const isOpening = !expandedSections[secId];
                                                                            setExpandedSections(prev => {
                                                                                const next = { ...prev };
                                                                                Object.keys(next).forEach(key => {
                                                                                    if (key.includes('-') && key !== secId) next[key] = false;
                                                                                });
                                                                                next[secId] = isOpening;
                                                                                return next;
                                                                            });
                                                                        }}
                                                                    >
                                                                        <div className="flex items-center gap-3">
                                                                            <Folder className="w-5 h-5 text-amber-500 fill-amber-500/10" />
                                                                            <span className="font-bold text-sm tracking-wide uppercase">{secName}</span>
                                                                            <span className="text-[10px] text-muted-foreground bg-muted px-2 py-0.5 rounded-full font-bold">{secNotes.length} files</span>
                                                                        </div>
                                                                        {expandedSections[secId] ? <ChevronDown className="w-4 h-4 text-muted-foreground" /> : <ChevronRight className="w-4 h-4 text-muted-foreground" />}
                                                                    </div>

                                                                    {expandedSections[secId] && (
                                                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 animate-in fade-in slide-in-from-left-2 duration-200">
                                                                            {secNotes.map(n => (
                                                                                <div key={n._id} className="group flex items-center justify-between p-4 bg-background border border-border/60 rounded-2xl hover:border-primary/40 hover:shadow-lg transition-all relative overflow-hidden">
                                                                                    <div className="flex items-center gap-3">
                                                                                        <div className="p-2 bg-muted rounded-xl text-muted-foreground group-hover:text-primary transition-colors">
                                                                                            <FileText className="w-5 h-5" />
                                                                                        </div>
                                                                                        <div className="min-w-0">
                                                                                            <p className="font-bold text-xs truncate max-w-[150px]" title={n.title}>{n.title}</p>
                                                                                            <p className="text-[10px] text-muted-foreground">{new Date(n.createdAt).toLocaleDateString()}</p>
                                                                                        </div>
                                                                                    </div>
                                                                                    <div className="flex items-center gap-1">
                                                                                        {!n.isApproved && (
                                                                                            <Button size="icon" variant="ghost" className="h-8 w-8 rounded-full text-green-600" onClick={(e: React.MouseEvent) => handleApproveNote(n._id, e)}>
                                                                                                <Check className="w-4 h-4" />
                                                                                            </Button>
                                                                                        )}
                                                                                        <Button size="icon" variant="ghost" className="h-8 w-8 rounded-full" onClick={() => setPdfPreview({ isOpen: true, url: n.pdfUrl, title: n.title, noteId: n._id })}>
                                                                                            <Maximize className="w-3.5 h-3.5" />
                                                                                        </Button>
                                                                                        <Button size="icon" variant="ghost" className="h-8 w-8 rounded-full text-primary" onClick={() => handleDirectDownload(n.pdfUrl, `${n.title}.pdf`)}>
                                                                                            <Download className="w-3.5 h-3.5" />
                                                                                        </Button>
                                                                                        <Button size="icon" variant="ghost" className="h-8 w-8 rounded-full text-destructive" onClick={() => handleDeleteNote(n._id)}>
                                                                                            <Trash2 className="w-3.5 h-3.5" />
                                                                                        </Button>
                                                                                    </div>
                                                                                </div>
                                                                            ))}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                        {activeTab === 'attendance' && (
                            <div className="animate-fade-in">
                                <Button variant="ghost" className="mb-6 pl-0 hover:bg-transparent text-muted-foreground hover:text-foreground" onClick={() => setActiveTab('users')}>
                                    <ArrowLeft className="w-4 h-4 mr-2" /> Back to Users
                                </Button>
                                <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
                                    <h2 className="text-2xl font-bold font-display text-primary">Student Attendance</h2>
                                    <div className="flex items-center gap-3 bg-muted/50 p-2 rounded-full border border-border/50">
                                        <Calendar className="w-4 h-4 ml-2 text-muted-foreground" />
                                        <Input
                                            type="date"
                                            value={attendanceDate}
                                            onChange={(e) => setAttendanceDate(e.target.value)}
                                            className="bg-transparent border-0 focus-visible:ring-0 w-auto h-8 p-0"
                                        />
                                    </div>
                                </div>

                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm text-left border-collapse">
                                        <thead>
                                            <tr className="border-b border-border/50 bg-muted/30">
                                                <th className="px-4 py-3 font-semibold uppercase tracking-wider text-[10px] text-muted-foreground">Student</th>
                                                <th className="px-4 py-3 font-semibold uppercase tracking-wider text-[10px] text-muted-foreground">Contact</th>
                                                <th className="px-4 py-3 font-semibold uppercase tracking-wider text-[10px] text-muted-foreground text-center">Status</th>
                                                <th className="px-4 py-3 font-semibold uppercase tracking-wider text-[10px] text-muted-foreground">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-border/30">
                                            {attendanceRecords.map((record) => {
                                                const student = record.user;
                                                return (
                                                    <tr key={student._id} className="hover:bg-muted/10 transition-colors">
                                                        <td className="px-4 py-4">
                                                            <div
                                                                className="flex items-center gap-3 cursor-pointer group"
                                                                onClick={() => openUserDetails(student)}
                                                            >
                                                                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden group-hover:ring-2 ring-primary transition-all">
                                                                    {student.photo ? (
                                                                        <img src={student.photo} alt={student.name} className="w-full h-full object-cover" />
                                                                    ) : (
                                                                        <User className="w-4 h-4 text-primary" />
                                                                    )}
                                                                </div>
                                                                <span className="font-medium text-foreground group-hover:text-primary transition-colors">{student.name}</span>
                                                            </div>
                                                        </td>
                                                        <td className="px-4 py-4 text-muted-foreground">{student.phone}</td>
                                                        <td className="px-4 py-4 text-center">
                                                            <span className={`inline-flex px-3 py-1 rounded-full text-[10px] font-bold uppercase transition-all ${record.status === 'Present' ? 'bg-emerald-100 text-emerald-600 border border-emerald-200' :
                                                                record.status === 'Absent' ? 'bg-rose-100 text-rose-600 border border-rose-200' :
                                                                    'bg-amber-100 text-amber-600 border border-amber-200'
                                                                }`}>
                                                                {record.status}
                                                            </span>
                                                        </td>
                                                        <td className="px-4 py-4">
                                                            <div className="flex gap-2">
                                                                <Button
                                                                    variant={record.status === 'Present' ? "default" : "outline"}
                                                                    size="sm"
                                                                    className={cn("h-8 px-3 rounded-full text-[10px] font-bold", record.status === 'Present' && "bg-emerald-600 hover:bg-emerald-700")}
                                                                    onClick={() => handleMarkAttendance(student._id, 'Present')}
                                                                >
                                                                    {record.status === 'Present' && <Check className="w-3 h-3 mr-1" />}
                                                                    Present
                                                                </Button>
                                                                <Button
                                                                    variant={record.status === 'Absent' ? "destructive" : "outline"}
                                                                    size="sm"
                                                                    className="h-8 px-3 rounded-full text-[10px] font-bold"
                                                                    onClick={() => handleMarkAttendance(student._id, 'Absent')}
                                                                >
                                                                    {record.status === 'Absent' && <X className="w-3 h-3 mr-1" />}
                                                                    Absent
                                                                </Button>
                                                                <Button
                                                                    variant="outline"
                                                                    size="sm"
                                                                    className="h-8 px-3 rounded-full text-[10px] font-bold border-primary/30 text-primary hover:bg-primary/5"
                                                                    onClick={() => {
                                                                        setBulkData({
                                                                            ...bulkData,
                                                                            userId: student._id,
                                                                            userName: student.name,
                                                                            startDate: attendanceDate
                                                                        });
                                                                        setIsBulkModalOpen(true);
                                                                    }}
                                                                >
                                                                    <Calendar className="w-3 h-3 mr-1" />
                                                                    Date Range
                                                                </Button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}

                        {activeTab === 'gallery' && (
                            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <div className="flex justify-between items-center mb-8">
                                    <h2 className="text-2xl font-bold font-display text-primary">Gallery Management</h2>
                                </div>
                                <form onSubmit={handleSubmitGallery} className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12 bg-muted/30 p-8 rounded-2xl border border-border/50 shadow-sm">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-foreground/80 font-display">Image Title</label>
                                        <Input required value={newGalleryItem.title} onChange={(e) => setNewGalleryItem({ ...newGalleryItem, title: e.target.value })} placeholder="Common Area" className="rounded-xl border-border/50 bg-background" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-foreground/80 font-display">Category</label>
                                        <Input value={newGalleryItem.category} onChange={(e) => setNewGalleryItem({ ...newGalleryItem, category: e.target.value })} placeholder="Living Room" className="rounded-xl border-border/50 bg-background" />
                                    </div>
                                    <div className="space-y-2 md:col-span-2">
                                        <label className="text-sm font-medium text-foreground/80 font-display">Upload Photo</label>
                                        <Input required type="file" accept="image/*" onChange={(e) => e.target.files && setGalleryFile(e.target.files[0])} className="rounded-xl border-border/50 bg-background file:rounded-full file:border-0 file:bg-primary/10 file:text-primary file:mr-4" />
                                    </div>
                                    <Button type="submit" disabled={isLoading} className="md:col-span-2 h-12 rounded-xl text-lg font-bold shadow-lg hover:shadow-primary/25 transition-all">
                                        {isLoading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <Maximize className="w-5 h-5 mr-2" />}
                                        Upload Photo to Gallery
                                    </Button>
                                </form>

                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                    {gallery.map((item) => (
                                        <div key={item._id} className="group relative bg-card rounded-2xl overflow-hidden border border-border/50 shadow-md hover:shadow-xl transition-all aspect-square">
                                            <img src={item.image} alt={item.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                                            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-4">
                                                <p className="text-white font-bold truncate text-sm">{item.title}</p>
                                                <p className="text-white/60 text-[10px] uppercase tracking-wider">{item.category}</p>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => setDeleteConfirm({ isOpen: true, type: 'gallery', id: item._id })}
                                                className="absolute top-4 right-4 bg-red-600/90 hover:bg-red-600 p-2 rounded-full text-white opacity-0 group-hover:opacity-100 transition-all shadow-lg"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ))}
                                    {gallery.length === 0 && (
                                        <div className="col-span-full py-20 text-center border-2 border-dashed border-border/50 rounded-3xl">
                                            <Maximize className="w-12 h-12 text-muted-foreground m-auto mb-4 opacity-20" />
                                            <p className="text-muted-foreground">No gallery images uploaded yet.</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {activeTab === 'events' && (
                            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <div className="flex justify-between items-center mb-8">
                                    <h2 className="text-2xl font-bold font-display text-primary">Events Management</h2>
                                </div>
                                <form onSubmit={handleSubmitEvent} className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12 bg-muted/30 p-8 rounded-2xl border border-border/50 shadow-sm">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-foreground/80 font-display">Celebration Title</label>
                                        <Input required value={newEvent.title} onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })} placeholder="New Year Party 2024" className="rounded-xl border-border/50 bg-background" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-foreground/80 font-display">Upload Image</label>
                                        <Input required type="file" accept="image/*" onChange={(e) => e.target.files && setEventFile(e.target.files[0])} className="rounded-xl border-border/50 bg-background file:rounded-full file:border-0 file:bg-primary/10 file:text-primary file:mr-4" />
                                    </div>
                                    <Button type="submit" disabled={isLoading} className="md:col-span-2 h-12 rounded-xl text-lg font-bold shadow-lg hover:shadow-primary/25 transition-all">
                                        {isLoading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <Maximize className="w-5 h-5 mr-2" />}
                                        Upload Celebration Image
                                    </Button>
                                </form>

                                <div className="space-y-6">
                                    {events.map((event) => (
                                        <div key={event._id} className="flex flex-col md:flex-row gap-6 bg-card p-6 rounded-2xl border border-border/50 shadow-sm hover:shadow-md transition-all group">
                                            {event.image && (
                                                <div className="w-full md:w-60 h-40 rounded-xl overflow-hidden shadow-inner flex-shrink-0">
                                                    <img src={event.image} alt={event.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                                                </div>
                                            )}
                                            <div className="flex-1 flex flex-col justify-between py-1">
                                                <div>
                                                    <div className="flex justify-between items-start mb-2">
                                                        <h3 className="text-xl font-bold text-foreground font-display">{event.title}</h3>
                                                        {event.date && (
                                                            <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-bold ring-1 ring-primary/20">
                                                                {new Date(event.date).toLocaleDateString()}
                                                            </span>
                                                        )}
                                                    </div>
                                                    {event.description && <p className="text-muted-foreground text-sm line-clamp-3 leading-relaxed">{event.description}</p>}
                                                </div>
                                                <div className="mt-6 flex justify-end">
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => setDeleteConfirm({ isOpen: true, type: 'event', id: event._id })}
                                                        className="text-red-500 hover:text-red-600 hover:bg-red-50 rounded-full h-10 px-4 bg-muted/20"
                                                    >
                                                        <Trash2 className="w-4 h-4 mr-2" /> Delete Event
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                    {events.length === 0 && (
                                        <div className="py-20 text-center border-2 border-dashed border-border/50 rounded-3xl">
                                            <Bell className="w-12 h-12 text-muted-foreground m-auto mb-4 opacity-20" />
                                            <p className="text-muted-foreground">No events created yet.</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
                <Footer />

                <Modal
                    isOpen={deleteConfirm.isOpen}
                    onClose={() => setDeleteConfirm({ isOpen: false, type: null, id: null })}
                    title="Confirm Deletion"
                >
                    <div className="space-y-4">
                        <p className="text-muted-foreground">
                            Are you sure you want to delete this {deleteConfirm.type}?
                            This action cannot be undone.
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
                                onClick={handleConfirmDelete}
                                className="rounded-full"
                            >
                                Delete {deleteConfirm.type === 'room' ? 'Room' : deleteConfirm.type === 'note' ? 'Note' : deleteConfirm.type === 'user' ? 'User' : deleteConfirm.type === 'gallery' ? 'Gallery Item' : 'Event'}
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

                {/* PDF Preview Modal */}
                <Modal
                    isOpen={pdfPreview.isOpen}
                    onClose={() => {
                        setPdfPreview({ isOpen: false, url: null, title: null, noteId: null });
                        // Clean up blob URL
                        if (pdfBlobUrl) {
                            URL.revokeObjectURL(pdfBlobUrl);
                            setPdfBlobUrl(null);
                        }
                    }}
                    title={pdfPreview.title || "PDF Preview"}
                    className="max-w-5xl h-[90vh]"
                >
                    <div className="flex flex-col h-full">
                        {pdfPreview.url && (() => {
                            // Ensure URL has HTTPS protocol
                            let pdfUrl = pdfPreview.url.replace(/^http:/, 'https:');
                            if (!pdfUrl.startsWith('http://') && !pdfUrl.startsWith('https://')) {
                                pdfUrl = `https://${pdfUrl}`;
                            }

                            // Use Google Docs Viewer for "Open in New Tab" (like CA website)
                            const googleViewerUrl = `https://docs.google.com/viewer?url=${encodeURIComponent(pdfUrl)}&embedded=true`;


                            return (
                                <div className="flex flex-col h-full">
                                    {/* Action Buttons */}
                                    <div className="flex gap-2 p-4 border-b border-border/50">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={async () => {
                                                // Use proxy API for download with auth
                                                if (pdfPreview.noteId) {
                                                    try {
                                                        const response = await api.get(`/api/notes/proxy/${pdfPreview.noteId}`, {
                                                            responseType: 'blob'
                                                        });
                                                        const blob = new Blob([response.data], { type: 'application/pdf' });
                                                        const blobUrl = URL.createObjectURL(blob);
                                                        const link = document.createElement('a');
                                                        link.href = blobUrl;
                                                        link.download = `${pdfPreview.title || 'document'}.pdf`;
                                                        document.body.appendChild(link);
                                                        link.click();
                                                        document.body.removeChild(link);
                                                        URL.revokeObjectURL(blobUrl);
                                                        toast.success('Download started!');
                                                    } catch (error) {
                                                        console.error('Download error:', error);
                                                        toast.error('Failed to download PDF');
                                                    }
                                                } else {
                                                    handleDirectDownload(pdfUrl, `${pdfPreview.title || 'document'}.pdf`);
                                                }
                                            }}
                                        >
                                            <Download className="w-4 h-4 mr-2" /> Download PDF
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => window.open(googleViewerUrl, '_blank')}
                                        >
                                            Open in New Tab
                                        </Button>
                                    </div>

                                    {/* PDF Preview using blob URL or Google Docs Viewer */}
                                    <div className="flex-1 border rounded-lg overflow-hidden bg-gray-100 relative" style={{ minHeight: '600px' }}>
                                        {pdfLoading ? (
                                            <div className="flex items-center justify-center h-full">
                                                <div className="text-center">
                                                    <Loader2 className="w-10 h-10 animate-spin text-primary mx-auto mb-2" />
                                                    <p className="text-muted-foreground">Loading PDF...</p>
                                                </div>
                                            </div>
                                        ) : pdfBlobUrl ? (
                                            <iframe
                                                src={pdfBlobUrl}
                                                title={pdfPreview.title || "PDF Preview"}
                                                width="100%"
                                                height="100%"
                                                style={{ border: 'none' }}
                                                className="w-full h-full"
                                            />
                                        ) : (
                                            <iframe
                                                src={googleViewerUrl}
                                                title={pdfPreview.title || "PDF Preview"}
                                                width="100%"
                                                height="100%"
                                                style={{ border: 'none' }}
                                                className="w-full h-full"
                                            />
                                        )}
                                    </div>
                                </div>
                            );
                        })()}
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
                                        <Button variant="ghost" size="sm" className="absolute right-0 top-0 rounded-full" onClick={() => startEditing()}>
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
                                        <h4 className="font-bold text-sm mb-4 uppercase tracking-wider text-muted-foreground">Attendance History</h4>
                                        <AttendanceCalendar userId={selectedUser._id} token={user?.token || ''} className="border-none shadow-none bg-muted/20" />
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

                                    {selectedUser.isPendingApproval && (
                                        <div className="border-t border-border/50 pt-6 mt-6 bg-orange-50/50 -mx-6 px-6 pb-6 rounded-b-2xl">
                                            <h4 className="font-bold text-sm mb-4 uppercase tracking-wider text-orange-700 flex items-center gap-2">
                                                <CheckCircle className="w-4 h-4" /> Final Approval
                                            </h4>
                                            <div className="grid grid-cols-2 gap-4 mb-4">
                                                <div className="space-y-2">
                                                    <label className="text-xs font-medium text-muted-foreground">Total Fee Assigned</label>
                                                    <Input
                                                        type="number"
                                                        placeholder="Enter total amount"
                                                        value={editFormData.totalAmount}
                                                        onChange={(e) => setEditFormData({ ...editFormData, totalAmount: e.target.value })}
                                                        className="bg-white"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-xs font-medium text-muted-foreground">Initial Payment</label>
                                                    <Input
                                                        type="number"
                                                        placeholder="Enter paid amount"
                                                        value={editFormData.paidAmount}
                                                        onChange={(e) => setEditFormData({ ...editFormData, paidAmount: e.target.value })}
                                                        className="bg-white"
                                                    />
                                                </div>
                                            </div>
                                            <Button
                                                onClick={() => handleApproveUser(selectedUser._id)}
                                                className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-6 rounded-xl shadow-lg transition-all"
                                                disabled={isLoading}
                                            >
                                                {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Check className="w-5 h-5 mr-2" />}
                                                Confirm & Approve Student
                                            </Button>
                                            <p className="text-[10px] text-center text-muted-foreground mt-3 italic">
                                                Setting these values will verify the student and generate their initial balance.
                                            </p>
                                        </div>
                                    )}

                                    {selectedUser.paymentHistory && selectedUser.paymentHistory.length > 0 && (
                                        <div className="border-t border-border/50 pt-6 mt-6">
                                            <button
                                                onClick={() => setShowPaymentHistory(!showPaymentHistory)}
                                                className="w-full flex justify-between items-center group hover:bg-muted/50 p-2 rounded-lg transition-colors"
                                            >
                                                <h4 className="font-bold text-sm uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                                                    <FileText className="w-4 h-4" />
                                                    Payment History
                                                    <span className="bg-muted px-2 py-0.5 rounded-full text-[10px] ml-1">{selectedUser.paymentHistory.length}</span>
                                                </h4>
                                                {showPaymentHistory ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
                                            </button>

                                            {showPaymentHistory && (
                                                <div className="space-y-3 max-h-[250px] overflow-y-auto pr-2 mt-4 custom-scrollbar animate-in fade-in slide-in-from-top-2 duration-300">
                                                    {[...selectedUser.paymentHistory].reverse().map((payment: any, idx: number) => (
                                                        <div key={idx} className="flex justify-between items-center bg-muted/30 p-3 rounded-lg border border-border/30">
                                                            <div>
                                                                <p className="font-bold text-sm text-foreground">₹{payment.amount}</p>
                                                                <p className="text-[10px] text-muted-foreground">{new Date(payment.date).toLocaleDateString()} {new Date(payment.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                                            </div>
                                                            <div className="text-right">
                                                                <p className="text-[11px] font-medium text-primary bg-primary/5 px-2 py-0.5 rounded-full">{payment.remarks || 'Payment recorded'}</p>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
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
                                            <Input type="email" value={editFormData.email} onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })} className="h-9" pattern="[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$" title="Please enter a valid email address" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-medium">Phone <span className="text-red-500">*</span></label>
                                            <Input type="tel" value={editFormData.phone} onChange={(e) => { const val = e.target.value.replace(/\D/g, '').slice(0, 10); setEditFormData({ ...editFormData, phone: val }); }} className="h-9" minLength={10} maxLength={10} pattern="[0-9]{10}" title="Phone number must be exactly 10 digits" />
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
                                        <div className="space-y-2">
                                            <label className="text-xs font-medium">Total Amount</label>
                                            <Input type="number" value={editFormData.totalAmount} onChange={(e) => setEditFormData({ ...editFormData, totalAmount: e.target.value })} className="h-9" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-medium">Paid Amount (Direct Set)</label>
                                            <Input type="number" value={editFormData.paidAmount} onChange={(e) => setEditFormData({ ...editFormData, paidAmount: e.target.value })} className="h-9" />
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
                                            <div className="flex flex-col gap-2">
                                                <Input
                                                    type="number"
                                                    placeholder="Add Amount (e.g. 5000)"
                                                    value={paymentUpdateAmount}
                                                    onChange={(e) => setPaymentUpdateAmount(e.target.value)}
                                                    className="bg-background"
                                                />
                                                <Input
                                                    placeholder="Remarks (e.g. Jan Rent, UPI, Cash)"
                                                    value={paymentRemarks}
                                                    onChange={(e) => setPaymentRemarks(e.target.value)}
                                                    className="bg-background text-sm"
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
                            <Input type="email" value={newAdmin.email} onChange={(e) => setNewAdmin({ ...newAdmin, email: e.target.value })} required pattern="[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$" title="Please enter a valid email address" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Password</label>
                            <Input type="password" value={newAdmin.password} onChange={(e) => setNewAdmin({ ...newAdmin, password: e.target.value })} required />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Phone</label>
                            <Input type="tel" value={newAdmin.phone} onChange={(e) => { const val = e.target.value.replace(/\D/g, '').slice(0, 10); setNewAdmin({ ...newAdmin, phone: val }); }} required minLength={10} maxLength={10} pattern="[0-9]{10}" title="Phone number must be exactly 10 digits" />
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

                {/* Bulk Attendance Modal */}
                <Modal
                    isOpen={isBulkModalOpen}
                    onClose={() => setIsBulkModalOpen(false)}
                    title={`Bulk Attendance: ${bulkData.userName}`}
                >
                    <form onSubmit={handleMarkBulkAttendance} className="space-y-6">
                        <div className="bg-primary/5 p-4 rounded-xl border border-primary/10">
                            <p className="text-xs text-muted-foreground uppercase tracking-wider font-bold mb-1">Student</p>
                            <p className="font-display font-bold text-lg">{bulkData.userName}</p>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Start Date</label>
                                <Input
                                    type="date"
                                    value={bulkData.startDate}
                                    onChange={(e) => setBulkData({ ...bulkData, startDate: e.target.value })}
                                    required
                                    className="rounded-xl"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">End Date</label>
                                <Input
                                    type="date"
                                    value={bulkData.endDate}
                                    onChange={(e) => setBulkData({ ...bulkData, endDate: e.target.value })}
                                    required
                                    className="rounded-xl"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Status</label>
                            <div className="flex gap-3">
                                {['Absent', 'Leave'].map((s) => (
                                    <button
                                        key={s}
                                        type="button"
                                        onClick={() => setBulkData({ ...bulkData, status: s })}
                                        className={cn(
                                            "flex-1 py-3 px-4 rounded-xl text-sm font-bold transition-all border-2",
                                            bulkData.status === s
                                                ? "bg-primary border-primary text-white shadow-lg"
                                                : "bg-background border-border text-muted-foreground hover:border-primary/50"
                                        )}
                                    >
                                        {s}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-foreground/80 font-display">Remarks / Reason</label>
                            <Input
                                placeholder="Home Visit, Sick Leave, etc."
                                value={bulkData.remarks}
                                onChange={(e) => setBulkData({ ...bulkData, remarks: e.target.value })}
                                className="rounded-xl bg-background"
                            />
                        </div>

                        <div className="flex gap-3 pt-4">
                            <Button type="button" variant="outline" onClick={() => setIsBulkModalOpen(false)} className="flex-1 rounded-xl h-12 font-bold">
                                Cancel
                            </Button>
                            <Button type="submit" disabled={isLoading} className="flex-1 rounded-xl h-12 font-bold shadow-lg">
                                {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Check className="w-4 h-4 mr-2" />}
                                Apply Range
                            </Button>
                        </div>
                    </form>
                </Modal>

                {/* Invoice Date Picker Modal */}
                <Modal
                    isOpen={isDatePickerOpen}
                    onClose={() => setIsDatePickerOpen(false)}
                    title="Select Invoice Date"
                >
                    <div className="space-y-6 py-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-muted-foreground">This date will appear on the PDF header</label>
                            <Input
                                type="date"
                                value={invoiceDate}
                                onChange={(e) => setInvoiceDate(e.target.value)}
                                className="rounded-xl h-12 text-lg font-medium"
                            />
                        </div>
                        <div className="flex gap-3">
                            <Button variant="outline" onClick={() => setIsDatePickerOpen(false)} className="flex-1 rounded-xl h-12">
                                Cancel
                            </Button>
                            <Button
                                onClick={() => selectedInvoiceUser && downloadInvoice(selectedInvoiceUser, invoiceDate)}
                                className="flex-1 rounded-xl h-12 font-bold shadow-lg"
                                disabled={isLoading}
                            >
                                <Download className="w-4 h-4 mr-2" />
                                Download PDF
                            </Button>
                        </div>
                    </div>
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
            </main>
        </>
    );
};

export default AdminDashboard;
