import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Modal } from '@/components/ui/Modal';
import { ChangePasswordForm } from '@/components/auth/ChangePasswordForm';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { SEO } from '@/components/layout/SEO';
import { FileText, Lock, User, Wallet, Pencil, Loader2, Calendar, ShieldCheck, UserCircle, ChevronDown, ChevronRight, Folder, Download, Maximize, Bell } from 'lucide-react';
import { AttendanceCalendar } from '@/components/dashboard/AttendanceCalendar';
import toast from 'react-hot-toast';


// Interfaces
interface Note {
    _id: string;
    title: string;
    section: string;
    category: string;
    pdfUrl: string;
    uploadedBy?: {
        _id: string;
        name: string;
        email?: string;
    };
    isApproved?: boolean;
    createdAt: string;
}

const UserDashboard = () => {
    const { user, logout, refreshUser } = useAuth();
    const navigate = useNavigate();

    // Refresh user data on mount to get latest payment/profile logic
    useEffect(() => {
        refreshUser();
    }, []);
    const [notes, setNotes] = useState<Note[]>([]);
    const [noteTitle, setNoteTitle] = useState('');
    const [noteSection, setNoteSection] = useState('');
    const [noteCategory] = useState<'Admin' | 'User'>('User');
    const [noteFile, setNoteFile] = useState<File | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
    const [photoUploading, setPhotoUploading] = useState(false);
    const [attendance, setAttendance] = useState<any[]>([]);
    const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({ 'Admin': true });

    // PDF Preview States
    const [pdfPreview, setPdfPreview] = useState<{ isOpen: boolean; url: string | null; title: string | null; noteId: string | null }>({
        isOpen: false,
        url: null,
        title: null,
        noteId: null
    });
    const [pdfLoading, setPdfLoading] = useState(false);
    const [pdfBlobUrl, setPdfBlobUrl] = useState<string | null>(null);

    useEffect(() => {
        if (pdfPreview.isOpen && pdfPreview.noteId) {
            const fetchPdfBlob = async () => {
                setPdfLoading(true);
                try {
                    const response = await api.get(`/api/notes/proxy/${pdfPreview.noteId}`, {
                        responseType: 'blob'
                    });
                    const blob = new Blob([response.data], { type: 'application/pdf' });
                    const blobUrl = URL.createObjectURL(blob);
                    setPdfBlobUrl(blobUrl);
                } catch (error) {
                    console.error('Error fetching PDF blob:', error);
                } finally {
                    setPdfLoading(false);
                }
            };
            fetchPdfBlob();
        }
    }, [pdfPreview.isOpen, pdfPreview.noteId]);

    useEffect(() => {
        fetchNotes();
        fetchAttendance();
    }, []);

    const fetchAttendance = async () => {
        try {
            const { data } = await api.get('/api/attendance/my');
            setAttendance(data);
        } catch (error) {
            console.error('Error fetching attendance', error);
        }
    };

    const fetchNotes = async () => {
        try {
            const { data } = await api.get('/api/notes');
            setNotes(data.notes);
        } catch (error: any) {
            console.error(error);
            if (error.response?.status === 401) {
                logout();
                navigate('/');
            }
        }
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
                success: 'Note added successfully! It will be visible once approved.',
                error: (err: any) => err.response?.data?.message || 'Error creating note'
            });

            await uploadPromise;
            setNoteTitle('');
            setNoteSection('');
            setNoteFile(null);
            fetchNotes();
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    // New helper for proxy download
    const handleProxyDownload = async (id: string, title: string) => {
        const toastId = toast.loading('Downloading...');
        try {
            const response = await api.get(`/api/notes/proxy/${id}`, {
                responseType: 'blob'
            });
            const blob = new Blob([response.data], { type: 'application/pdf' });
            const blobUrl = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = blobUrl;
            link.download = `${title}.pdf`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(blobUrl);
            toast.success('Download complete!', { id: toastId });
        } catch (error) {
            console.error('Download error:', error);
            toast.error('Failed to download PDF', { id: toastId });
        }
    };

    const handleDirectDownload = (url: string, filename: string) => {
        try {
            let pdfUrl = url.replace(/^http:/, 'https:');
            if (!pdfUrl.startsWith('http://') && !pdfUrl.startsWith('https://')) {
                pdfUrl = `https://${pdfUrl}`;
            }

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

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setNoteFile(e.target.files[0]);
        }
    };

    const handleProfilePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const photoFile = e.target.files[0];
            const formData = new FormData();
            formData.append('photo', photoFile);

            setPhotoUploading(true);
            const updatePromise = api.put(`/api/auth/users/${user?._id}`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            toast.promise(updatePromise, {
                loading: 'Updating profile picture...',
                success: 'Profile picture updated!',
                error: 'Failed to update profile picture',
            });

            try {
                const { data } = await updatePromise;

                // Update local user info
                const updatedUser = { ...user, ...data };
                localStorage.setItem('userInfo', JSON.stringify(updatedUser));
                // Refresh small delay to show success toast
                setTimeout(() => window.location.reload(), 1000);
            } catch (error: any) {
                console.error(error);
            } finally {
                setPhotoUploading(false);
            }
        }
    };

    // Cloudinary upload logic would go here: 
    // 1. Select file -> 2. Upload to Cloudinary API -> 3. Get URL -> 4. Set newNote.pdfUrl
    // For this implementation, I will provide a text input for URL to keep it simple as I don't have Cloudinary credentials.
    // However, user asked for "Cloudinary PDF upload".
    // I should probably mock the File Input -> "Uploading..." -> Return dummy URL if I can't actually upload.
    // Or just ask user for env vars?
    // "Cloudinary upload logic" was requested.
    // I'll add a file input and a mock handler that simulates upload if no env vars.



    return (
        <div className="min-h-screen flex flex-col bg-background">
            <SEO
                title={`${user?.name}'s Dashboard | Yashoda Bhawan`}
                description="View your profile, payment status, and access study resources."
            />
            <Navbar />

            <main className="flex-1">
                {/* Hero Header */}
                <div className="dark-gradient pt-32 pb-16 relative overflow-hidden">
                    {/* Decorative Background Elements */}
                    <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.05),transparent)] pointer-events-none" />

                    <div className="container mx-auto px-4 relative z-10">
                        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                            <div className="text-left">
                                <h1 className="text-4xl md:text-5xl font-bold font-display text-white mb-2">
                                    Hello, {user?.name}
                                </h1>
                                <p className="text-white/70 text-lg">
                                    Welcome back to your Yashoda Bhawan portal.
                                </p>
                            </div>
                            <Button
                                onClick={() => setIsChangePasswordOpen(true)}
                                className="bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-full backdrop-blur-sm transition-all h-12 px-8 font-medium"
                            >
                                <Lock className="w-4 h-4 mr-2" />
                                Change Password
                            </Button>
                        </div>
                    </div>
                </div>

                <div className="container mx-auto px-4 pb-20 mt-12">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
                        {/* Profile Card */}
                        <div className="lg:col-span-2 bg-card border border-border/50 rounded-2xl p-8 shadow-xl transition-all hover:shadow-2xl">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-2xl font-bold flex items-center gap-4 text-primary">
                                    <div className="relative group">
                                        <div className="w-28 h-28 rounded-3xl bg-primary/10 flex items-center justify-center text-primary shadow-inner overflow-hidden border-4 border-primary/20 transition-all group-hover:border-primary/40">
                                            {user?.photo ? (
                                                <img src={user.photo} alt={user.name} className="w-full h-full object-cover" />
                                            ) : (
                                                <User className="w-14 h-14" />
                                            )}
                                            {photoUploading && (
                                                <div className="absolute inset-0 bg-black/40 flex items-center justify-center backdrop-blur-[2px]">
                                                    <Loader2 className="w-8 h-8 text-white animate-spin" />
                                                </div>
                                            )}
                                        </div>
                                        <label htmlFor="photo-upload" className="absolute -bottom-1 -right-1 w-10 h-10 bg-primary text-white rounded-2xl flex items-center justify-center shadow-lg border-2 border-background hover:scale-110 transition-transform cursor-pointer overflow-hidden">
                                            <Pencil className="w-5 h-5" />
                                            <input
                                                id="photo-upload"
                                                type="file"
                                                className="hidden"
                                                accept="image/*"
                                                onChange={handleProfilePhotoChange}
                                                disabled={photoUploading}
                                            />
                                        </label>
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-xs uppercase tracking-[0.2em] font-black text-muted-foreground/60 mb-1">Authenticated</span>
                                        Profile Details
                                    </div>
                                </h2>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-4">
                                    <div>
                                        <label className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Email Address</label>
                                        <p className="text-lg font-medium">{user?.email}</p>
                                    </div>
                                    <div>
                                        <label className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Phone Number</label>
                                        <p className="text-lg font-medium">{user?.phone || 'Not Provided'}</p>
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <div>
                                        <label className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Address</label>
                                        <p className="text-lg font-medium">{user?.address || 'Not Provided'}</p>
                                    </div>
                                    <div>
                                        <label className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Room Assignment</label>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-bold border border-primary/20">
                                                {user?.roomType || 'Awaiting Allocation'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Payment Card */}
                        <div className="bg-card border border-border/50 rounded-2xl p-8 shadow-xl transition-all hover:shadow-2xl">
                            <h2 className="text-2xl font-bold mb-6 flex items-center gap-3 text-primary">
                                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shadow-inner">
                                    <Wallet className="w-6 h-6" />
                                </div>
                                Payment Status
                            </h2>
                            <div className="space-y-6">
                                <div className="flex justify-between items-end">
                                    <span className="text-muted-foreground font-medium">Total Fees</span>
                                    <span className="text-2xl font-bold font-display">${user?.totalAmount}</span>
                                </div>
                                <div className="flex justify-between items-end">
                                    <span className="text-muted-foreground font-medium">Amount Paid</span>
                                    <span className="text-2xl font-bold font-display text-green-500">${user?.paidAmount}</span>
                                </div>
                                <div className="pt-4 border-t border-border">
                                    <div className="flex justify-between items-end">
                                        <span className="text-primary font-bold">Outstanding</span>
                                        <div className="text-right">
                                            <span className="text-3xl font-bold font-display text-primary">${user?.remainingAmount}</span>
                                            <p className="text-[10px] uppercase tracking-tighter text-muted-foreground mt-1">Due for current session</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Study Resources Section */}
                    <div className="bg-muted/30 rounded-3xl p-8 md:p-12 border border-border/50 shadow-inner">
                        <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center mb-10 gap-8">
                            <div>
                                <h2 className="text-3xl font-bold flex items-center gap-3 font-display">
                                    <FileText className="w-8 h-8 text-primary" />
                                    Study Resources
                                </h2>
                                <p className="text-muted-foreground mt-1">Access lecture notes and shared repository</p>
                            </div>

                            {/* Enhanced Upload Form */}
                            <form onSubmit={handleCreateNote} className="grid grid-cols-1 md:grid-cols-5 gap-3 w-full xl:w-2/3 items-end bg-background/40 p-4 rounded-2xl border border-border/50">
                                <div className="md:col-span-2 space-y-2">
                                    <label className="text-[10px] uppercase font-bold text-muted-foreground ml-1">Title</label>
                                    <Input
                                        placeholder="e.g. Physics I"
                                        value={noteTitle}
                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNoteTitle(e.target.value)}
                                        required
                                        className="rounded-xl bg-background border-border h-10"
                                    />
                                </div>
                                <div className="md:col-span-1 space-y-2">
                                    <label className="text-[10px] uppercase font-bold text-muted-foreground ml-1">Section</label>
                                    <Input
                                        placeholder="e.g. SEM 1"
                                        value={noteSection}
                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNoteSection(e.target.value)}
                                        required
                                        className="rounded-xl bg-background border-border h-10"
                                    />
                                </div>
                                <div className="md:col-span-1 space-y-2">
                                    <label className="text-[10px] uppercase font-bold text-muted-foreground ml-1">File</label>
                                    <div className="relative">
                                        <input
                                            type="file"
                                            accept="application/pdf"
                                            id="note-file-user"
                                            className="hidden"
                                            onChange={handleFileChange}
                                        />
                                        <Button
                                            type="button"
                                            variant="outline"
                                            className="w-full h-10 rounded-xl px-2 text-[10px] truncate"
                                            onClick={() => document.getElementById('note-file-user')?.click()}
                                        >
                                            {noteFile ? noteFile.name : 'Pick PDF'}
                                        </Button>
                                    </div>
                                </div>
                                <div className="md:col-span-1">
                                    <Button type="submit" disabled={isLoading || !noteFile} className="rounded-xl h-10 w-full shadow-lg shadow-primary/20 font-bold text-xs">
                                        {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Add'}
                                    </Button>
                                </div>
                            </form>
                        </div>

                        <div className="space-y-6">
                            {['Admin', 'User'].map((cat) => {
                                const catNotes = notes.filter(n => n.category === cat);
                                if (catNotes.length === 0 && cat === 'Admin') return null;

                                const sections = Array.from(new Set(catNotes.map(n => n.section)));

                                return (
                                    <div key={cat} className="space-y-4">
                                        <div
                                            className="flex items-center justify-between bg-primary/5 p-4 rounded-2xl cursor-pointer hover:bg-primary/10 transition-colors border border-primary/10"
                                            onClick={() => {
                                                const isOpening = !expandedSections[cat];
                                                setExpandedSections(prev => {
                                                    const next = { ...prev };
                                                    ['Admin', 'User'].forEach(c => { if (c !== cat) next[c] = false; });
                                                    next[cat] = isOpening;
                                                    return next;
                                                });
                                            }}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 bg-primary/20 rounded-xl">
                                                    {cat === 'Admin' ? <ShieldCheck className="w-6 h-6 text-primary" /> : <UserCircle className="w-6 h-6 text-primary" />}
                                                </div>
                                                <h3 className="text-xl font-black uppercase tracking-tight">{cat} Section</h3>
                                                <span className="bg-primary text-white text-[10px] px-2 py-0.5 rounded-full font-bold">{catNotes.length}</span>
                                            </div>
                                            {expandedSections[cat] ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
                                        </div>

                                        {expandedSections[cat] && (
                                            <div className="space-y-4 pl-4 md:pl-8 border-l-2 border-primary/10 ml-6 md:ml-8 animate-in slide-in-from-top-2 duration-300">
                                                {sections.length === 0 && <p className="text-muted-foreground italic text-sm py-4">No sections available.</p>}
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
                                                                        // Close all other sections (-), keep category level keys
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
                                                                                    <p className="font-bold text-xs truncate max-w-[120px]" title={n.title}>{n.title}</p>
                                                                                    <p className="text-[10px] text-muted-foreground"> {n.isApproved ? 'Approved' : 'Pending'}</p>
                                                                                </div>
                                                                            </div>
                                                                            <div className="flex items-center gap-1">
                                                                                <Button size="icon" variant="ghost" className="h-8 w-8 rounded-full" onClick={() => setPdfPreview({ isOpen: true, url: n.pdfUrl, title: n.title, noteId: n._id })}>
                                                                                    <Maximize className="w-3.5 h-3.5" />
                                                                                </Button>
                                                                                <Button size="icon" variant="ghost" className="h-8 w-8 rounded-full text-primary" onClick={() => handleProxyDownload(n._id, n.title)}>
                                                                                    <Download className="w-3.5 h-3.5" />
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
                            {notes.length === 0 && (
                                <div className="py-20 text-center border-2 border-dashed border-border/50 rounded-3xl bg-muted/5">
                                    <Bell className="w-12 h-12 text-muted-foreground m-auto mb-4 opacity-20" />
                                    <p className="text-muted-foreground">No shared resources found.</p>
                                </div>
                            )}
                        </div>
                    </div>



                    {/* Attendance Section */}
                    <div className="mt-12 bg-white border border-border shadow-md rounded-3xl p-8 transition-all hover:shadow-lg">
                        <div className="flex items-center gap-4 mb-8">
                            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                                <Calendar className="w-6 h-6" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold font-display">My Attendance</h2>
                                <p className="text-muted-foreground text-sm">Monthly overview of your presence</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                            <div className="p-4 bg-green-50 rounded-2xl border border-green-100">
                                <p className="text-[10px] uppercase font-bold text-green-600 mb-1">Present</p>
                                <p className="text-3xl font-bold text-green-700">{attendance.filter(a => a.status === 'Present').length}</p>
                            </div>
                            <div className="p-4 bg-red-50 rounded-2xl border border-red-100">
                                <p className="text-[10px] uppercase font-bold text-red-600 mb-1">Absent</p>
                                <p className="text-3xl font-bold text-red-700">{attendance.filter(a => a.status === 'Absent').length}</p>
                            </div>
                            <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100">
                                <p className="text-[10px] uppercase font-bold text-amber-600 mb-1">Leave</p>
                                <p className="text-3xl font-bold text-amber-700">{attendance.filter(a => a.status === 'Leave').length}</p>
                            </div>
                            <div className="p-4 bg-muted/30 rounded-2xl border border-border/50">
                                <p className="text-[10px] uppercase font-bold text-muted-foreground mb-1">Total Records</p>
                                <p className="text-3xl font-bold">{attendance.length}</p>
                            </div>
                        </div>

                        <div className="mt-8">
                            {user && <AttendanceCalendar userId={user._id} token={user.token} className="border-none shadow-none bg-muted/20" />}
                        </div>

                    </div>
                </div>
            </main>

            <Footer />

            <Modal
                isOpen={isChangePasswordOpen}
                onClose={() => setIsChangePasswordOpen(false)}
                title="Account Security"
            >
                <ChangePasswordForm
                    onSuccess={() => {
                        setIsChangePasswordOpen(false);
                    }}
                    onCancel={() => setIsChangePasswordOpen(false)}
                />
            </Modal>

            {/* PDF Preview Modal */}
            <Modal
                isOpen={pdfPreview.isOpen}
                onClose={() => {
                    setPdfPreview({ isOpen: false, url: null, title: null, noteId: null });
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
                        let pdfUrl = pdfPreview.url.replace(/^http:/, 'https:');
                        if (!pdfUrl.startsWith('http://') && !pdfUrl.startsWith('https://')) {
                            pdfUrl = `https://${pdfUrl}`;
                        }
                        const googleViewerUrl = `https://docs.google.com/viewer?url=${encodeURIComponent(pdfUrl)}&embedded=true`;

                        return (
                            <div className="flex flex-col h-full">
                                <div className="flex gap-2 p-4 border-b border-border/50">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={async () => {
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
        </div>
    );
};

export default UserDashboard;
