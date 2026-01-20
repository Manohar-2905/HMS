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
import { FileText, Upload, Lock, User, Wallet, CheckCircle, Pencil, Loader2, Calendar } from 'lucide-react';
import { AttendanceCalendar } from '@/components/dashboard/AttendanceCalendar';
import toast from 'react-hot-toast';
import { EventsSection } from '../../components/dashboard/EventsSection';

// Interfaces
interface Note {
    _id: string;
    title: string;
    section: string;
    pdfUrl: string;
    uploadedBy?: {
        name: string;
        email?: string;
    };
    isApproved?: boolean;
}

const UserDashboard = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [notes, setNotes] = useState<Note[]>([]);
    const [title, setTitle] = useState('');
    const [section, setSection] = useState('');
    const [file, setFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);
    const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
    const [photoUploading, setPhotoUploading] = useState(false);
    const [attendance, setAttendance] = useState<any[]>([]);

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
            // Filter notes for current user if backend returns all (though backend should filter, let's verify)
            // Backend Note Controller: "getNotes = await Note.find({}).populate..." -> Returns ALL notes.
            // Requirement: "View uploaded notes" - user likely wants to see THEIR notes or CLASS notes?
            // "Notes visible only after login". "User cannot delete notes".
            // If it's class notes, then seeing all is fine. If it's personal notes, should be filtered.
            // Prompt: "Upload notes... View uploaded notes". Usually implies sharing or personal storage.
            // Let's assume shared notes based on context of "Hostel" (e.g. syllabus, notices).
            // But if it's "User upload notes", maybe personal?
            // Let's filter by uploadedBy for "My Notes" section and maybe "All Notes" section.
            // Backend implementation returns all. I'll just show all for now.
            setNotes(data);
        } catch (error: any) {
            console.error(error);
            if (error.response?.status === 401) {
                logout();
                navigate('/');
            }
        }
    };

    const handleUpload = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!file) return alert('Please select a PDF file');

        const formData = new FormData();
        formData.append('title', title);
        formData.append('section', section);
        formData.append('pdf', file);

        setUploading(true);
        const uploadPromise = api.post('/api/notes', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });

        toast.promise(uploadPromise, {
            loading: 'Uploading note...',
            success: 'Note uploaded! It will be visible after admin approval.',
            error: (err) => err.response?.data?.message || 'Failed to upload note',
        });

        try {
            await uploadPromise;
            setTitle('');
            setSection('');
            setFile(null);
            fetchNotes();
        } catch (error: any) {
            console.error(error);
            if (error.response?.status === 401) {
                logout();
                navigate('/');
            }
        } finally {
            setUploading(false);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setFile(e.target.files[0]);
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
                <div className="hero-gradient text-white pt-24 pb-16 mb-12">
                    <div className="container mx-auto px-4">
                        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                            <div>
                                <h1 className="text-4xl md:text-5xl font-bold font-display mb-2">
                                    Hello, {user?.name}
                                </h1>
                                <p className="text-white/80 text-lg">
                                    Welcome back to your Yashoda Bhawan portal.
                                </p>
                            </div>
                            <Button
                                onClick={() => setIsChangePasswordOpen(true)}
                                className="bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-full backdrop-blur-md transition-all px-8"
                            >
                                <Lock className="w-4 h-4 mr-2" />
                                Change Password
                            </Button>
                        </div>
                    </div>
                </div>

                <div className="container mx-auto px-4 pb-20">
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

                    {/* Notes Section */}
                    <div className="bg-muted/30 rounded-3xl p-8 md:p-12 border border-border/50 shadow-inner">
                        <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center mb-10 gap-8">
                            <div>
                                <h2 className="text-3xl font-bold flex items-center gap-3 font-display">
                                    <FileText className="w-8 h-8 text-primary" />
                                    Study Resources
                                </h2>
                                <p className="text-muted-foreground mt-1">Access lecture notes and shared repository</p>
                            </div>

                            {/* Upload Form */}
                            <form onSubmit={handleUpload} className="grid grid-cols-1 md:grid-cols-4 gap-3 w-full xl:w-auto items-end">
                                <div className="space-y-2">
                                    <label className="text-[10px] uppercase font-bold text-muted-foreground ml-1">Title</label>
                                    <Input
                                        placeholder="e.g. Physics I"
                                        value={title}
                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTitle(e.target.value)}
                                        required
                                        className="rounded-xl bg-background border-border"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] uppercase font-bold text-muted-foreground ml-1">Section</label>
                                    <Input
                                        placeholder="e.g. A"
                                        value={section}
                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSection(e.target.value)}
                                        required
                                        className="rounded-xl bg-background border-border"
                                    />
                                </div>
                                <div className="space-y-2 md:col-span-1">
                                    <label className="text-[10px] uppercase font-bold text-muted-foreground ml-1">PDF File</label>
                                    <Input
                                        type="file"
                                        accept="application/pdf"
                                        onChange={handleFileChange}
                                        required
                                        className="rounded-xl bg-background border-border text-xs cursor-pointer file:bg-primary/10 file:text-primary file:border-0 file:rounded-md file:mr-2"
                                    />
                                </div>
                                <Button type="submit" disabled={uploading} className="rounded-xl h-10 w-full md:w-auto shadow-lg shadow-primary/20">
                                    {uploading ? 'Processing...' : (
                                        <>
                                            <Upload className="w-4 h-4 mr-2" />
                                            Upload Note
                                        </>
                                    )}
                                </Button>
                            </form>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 font-sans">
                            {notes.map((note: any) => (
                                <div key={note._id} className="group bg-card p-6 rounded-2xl border border-border/50 hover:border-primary/50 hover:shadow-2xl transition-all duration-300 relative overflow-hidden">
                                    <div className="absolute top-0 right-0 p-3">
                                        {note.isApproved && <CheckCircle className="w-4 h-4 text-green-500" />}
                                    </div>
                                    <div className="flex items-start gap-4">
                                        <div className="w-12 h-12 rounded-xl bg-primary/5 group-hover:bg-primary/10 flex items-center justify-center text-primary transition-colors">
                                            <FileText className="w-6 h-6" />
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="font-bold text-lg leading-tight mb-1 group-hover:text-primary transition-colors">{note.title}</h3>
                                            <div className="flex items-center gap-2">
                                                <span className="text-[10px] bg-muted text-muted-foreground px-2 py-0.5 rounded font-bold uppercase tracking-wider">{note.section}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mt-8 flex justify-between items-center border-t border-border/50 pt-4">
                                        <div className="flex flex-col">
                                            <span className="text-[10px] text-muted-foreground uppercase font-bold">Uploaded By</span>
                                            <span className="text-sm font-medium">{note.uploadedBy?.name || 'Academic Dept'}</span>
                                        </div>
                                        <a href={note.pdfUrl} target="_blank" rel="noopener noreferrer">
                                            <Button variant="outline" size="sm" className="rounded-full px-4 hover:bg-primary hover:text-white hover:border-primary transition-all">
                                                View PDF
                                            </Button>
                                        </a>
                                    </div>
                                </div>
                            ))}
                            {notes.length === 0 && (
                                <div className="col-span-full py-20 text-center bg-background/50 rounded-2xl border-2 border-dashed border-border/50">
                                    <FileText className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
                                    <p className="text-muted-foreground italic font-medium">No shared resources found for your department.</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Events Section */}
                    <div className="mb-12">
                        <EventsSection />
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
        </div>
    );
};

export default UserDashboard;
