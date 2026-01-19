import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, User, Phone, Mail, Lock, MapPin, Calendar, BookOpen, GraduationCap, Camera } from 'lucide-react';
import api from '../../api/axios';
import toast from 'react-hot-toast';

interface RegisterFormProps {
    onSuccess: () => void;
    onLoginClick: () => void;
}

export function RegisterForm({ onSuccess, onLoginClick }: RegisterFormProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        phone: '',
        address: '',
        dob: '',
        fatherName: '',
        fatherOccupation: '',
        fatherPhone: '',
        motherName: '',
        motherPhone: '',
        aadharNo: '',
        university: '',
        registrationNo: ''
    });
    const [photo, setPhoto] = useState<File | null>(null);
    const [photoPreview, setPhotoPreview] = useState<string | null>(null);

    const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setPhoto(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setPhotoPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const data = new FormData();
            Object.keys(formData).forEach(key => {
                // @ts-ignore
                data.append(key, formData[key]);
            });
            if (photo) {
                data.append('photo', photo);
            }

            const registrationPromise = api.post('/api/auth/register-request', data);

            toast.promise(registrationPromise, {
                loading: 'Submitting registration request...',
                success: (res: any) => res.data.message || 'Request submitted successfully!',
                error: (err: any) => err.response?.data?.message || 'Registration failed',
            });

            await registrationPromise;
            onSuccess();
        } catch (error: any) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6 max-h-[70vh] overflow-y-auto px-1">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Photo Upload */}
                <div className="md:col-span-2 flex flex-col items-center justify-center mb-4">
                    <div className="relative group">
                        <div className="w-24 h-24 rounded-full overflow-hidden bg-muted border-2 border-primary/20 flex items-center justify-center">
                            {photoPreview ? (
                                <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
                            ) : (
                                <User className="w-10 h-10 text-muted-foreground" />
                            )}
                        </div>
                        <label className="absolute bottom-0 right-0 p-1.5 bg-primary text-white rounded-full cursor-pointer shadow-lg hover:bg-primary/90 transition-colors">
                            <Camera className="w-4 h-4" />
                            <input type="file" className="hidden" accept="image/*" onChange={handlePhotoChange} />
                        </label>
                    </div>
                    <p className="text-[10px] text-muted-foreground mt-2 uppercase tracking-wider font-semibold">Upload Photo</p>
                </div>

                {/* Personal Info */}
                <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Full Name *</label>
                    <div className="relative">
                        <User className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            required
                            placeholder="Student Name"
                            className="pl-9"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Email Address *</label>
                    <div className="relative">
                        <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            required
                            type="email"
                            placeholder="Email"
                            className="pl-9"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Password *</label>
                    <div className="relative">
                        <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            required
                            type="password"
                            placeholder="Choose Password"
                            className="pl-9"
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Phone Number *</label>
                    <div className="relative">
                        <Phone className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            required
                            placeholder="Contact Number"
                            className="pl-9"
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        />
                    </div>
                </div>

                <div className="space-y-2 md:col-span-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Address *</label>
                    <div className="relative">
                        <MapPin className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            required
                            placeholder="Permanent Address"
                            className="pl-9"
                            value={formData.address}
                            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Date of Birth</label>
                    <div className="relative">
                        <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            type="date"
                            className="pl-9"
                            value={formData.dob}
                            onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Aadhar No.</label>
                    <Input
                        placeholder="12-digit Aadhar"
                        value={formData.aadharNo}
                        onChange={(e) => setFormData({ ...formData, aadharNo: e.target.value })}
                    />
                </div>

                {/* Academic */}
                <div className="md:col-span-2 border-t border-border pt-4 mt-2">
                    <h4 className="text-[10px] font-black uppercase tracking-[2px] text-primary mb-4">Academic Details</h4>
                </div>

                <div className="space-y-2 md:col-span-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">University/College</label>
                    <div className="relative">
                        <GraduationCap className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Institution Name"
                            className="pl-9"
                            value={formData.university}
                            onChange={(e) => setFormData({ ...formData, university: e.target.value })}
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Registration No.</label>
                    <div className="relative">
                        <BookOpen className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Uni/College Reg No."
                            className="pl-9"
                            value={formData.registrationNo}
                            onChange={(e) => setFormData({ ...formData, registrationNo: e.target.value })}
                        />
                    </div>
                </div>

                {/* Family */}
                <div className="md:col-span-2 border-t border-border pt-4 mt-2">
                    <h4 className="text-[10px] font-black uppercase tracking-[2px] text-primary mb-4">Family Details</h4>
                </div>

                <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Father's Name</label>
                    <Input
                        placeholder="Father's Full Name"
                        value={formData.fatherName}
                        onChange={(e) => setFormData({ ...formData, fatherName: e.target.value })}
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Father's Phone</label>
                    <Input
                        placeholder="Father's Contact"
                        value={formData.fatherPhone}
                        onChange={(e) => setFormData({ ...formData, fatherPhone: e.target.value })}
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Mother's Name</label>
                    <Input
                        placeholder="Mother's Full Name"
                        value={formData.motherName}
                        onChange={(e) => setFormData({ ...formData, motherName: e.target.value })}
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Mother's Phone</label>
                    <Input
                        placeholder="Mother's Contact"
                        value={formData.motherPhone}
                        onChange={(e) => setFormData({ ...formData, motherPhone: e.target.value })}
                    />
                </div>
            </div>

            <Button type="submit" disabled={isLoading} className="w-full rounded-full shadow-lg h-12 text-lg font-display">
                {isLoading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : null}
                Submit Registration Request
            </Button>

            <div className="text-center mt-6">
                <p className="text-sm text-muted-foreground">
                    Already have an account?{' '}
                    <button
                        type="button"
                        onClick={onLoginClick}
                        className="text-primary font-bold hover:underline"
                    >
                        Sign In
                    </button>
                </p>
            </div>
        </form>
    );
}
