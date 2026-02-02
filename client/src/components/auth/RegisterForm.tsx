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
        bloodGroup: '',
        aadharNo: '',
        university: '',
        registrationNo: '',
        visitors: ['', '', '']
    });
    const [photo, setPhoto] = useState<File | null>(null);
    const [photoPreview, setPhotoPreview] = useState<string | null>(null);

    const [isOtpSent, setIsOtpSent] = useState(false);
    const [otp, setOtp] = useState('');

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
            if (!isOtpSent) {
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
                    loading: 'Sending verification code...',
                    success: (res: any) => res.data.message || 'Verification code sent!',
                    error: (err: any) => err.response?.data?.message || 'Failed to send OTP',
                });

                await registrationPromise;
                setIsOtpSent(true);
            } else {
                const verificationPromise = api.post('/api/auth/verify-registration-otp', {
                    email: formData.email,
                    otp
                });

                toast.promise(verificationPromise, {
                    loading: 'Verifying code...',
                    success: (res: any) => res.data.message || 'Verified successfully!',
                    error: (err: any) => err.response?.data?.message || 'Invalid or expired code',
                });

                await verificationPromise;
                onSuccess();
            }
        } catch (error: any) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleResendOtp = async () => {
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

            const resendPromise = api.post('/api/auth/register-request', data);
            toast.promise(resendPromise, {
                loading: 'Resending verification code...',
                success: 'Code resent successfully!',
                error: (err: any) => err.response?.data?.message || 'Failed to resend code',
            });
            await resendPromise;
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    if (isOtpSent) {
        return (
            <div className="space-y-6 animate-fade-in">
                <div className="text-center space-y-2">
                    <h3 className="text-xl font-bold font-display text-primary">Verify Email</h3>
                    <p className="text-sm text-muted-foreground">
                        We've sent a 4-digit verification code to <span className="font-bold text-foreground">{formData.email}</span>.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex justify-between">
                            Verification Code
                            <button
                                type="button"
                                onClick={() => setIsOtpSent(false)}
                                className="text-primary lowercase font-normal hover:underline"
                            >
                                Change Email
                            </button>
                        </label>
                        <Input
                            required
                            placeholder="0000"
                            className="text-center text-3xl tracking-[15px] h-16 font-mono font-bold"
                            value={otp}
                            onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 4))}
                            maxLength={4}
                        />
                    </div>

                    <Button type="submit" disabled={isLoading || otp.length < 4} className="w-full rounded-full shadow-lg h-12 text-lg font-display">
                        {isLoading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : null}
                        Verify & Complete
                    </Button>

                    <div className="text-center">
                        <button
                            type="button"
                            onClick={handleResendOtp}
                            disabled={isLoading}
                            className="text-sm text-primary font-bold hover:underline disabled:opacity-50"
                        >
                            Resend Code
                        </button>
                    </div>
                </form>
            </div>
        );
    }

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
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, name: e.target.value.replace(/[^a-zA-Z\s]/g, '') })}
                            pattern="[a-zA-Z\s]+"
                            title="Name should only contain alphabets and spaces"
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
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, email: e.target.value })}
                            pattern="[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$"
                            title="Please enter a valid email address"
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
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, password: e.target.value })}
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
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => { const val = e.target.value.replace(/\D/g, '').slice(0, 10); setFormData({ ...formData, phone: val }); }}
                            type="tel"
                            minLength={10}
                            maxLength={10}
                            pattern="[0-9]{10}"
                            title="Phone number must be exactly 10 digits"
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
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, address: e.target.value })}
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Date of Birth *</label>
                    <div className="relative">
                        <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            required
                            type="date"
                            className="pl-9"
                            value={formData.dob}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, dob: e.target.value })}
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Aadhar No. *</label>
                    <Input
                        required
                        placeholder="12-digit Aadhar"
                        value={formData.aadharNo}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, aadharNo: e.target.value.replace(/\D/g, '').slice(0, 12) })}
                        minLength={12}
                        maxLength={12}
                        pattern="[0-9]{12}"
                        title="Aadhar number must be 12 digits"
                    />
                </div>

                {/* Academic */}
                <div className="md:col-span-2 border-t border-border pt-4 mt-2">
                    <h4 className="text-[10px] font-black uppercase tracking-[2px] text-primary mb-4">Academic Details</h4>
                </div>

                <div className="space-y-2 md:col-span-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">University/College *</label>
                    <div className="relative">
                        <GraduationCap className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            required
                            placeholder="Institution Name"
                            className="pl-9"
                            value={formData.university}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, university: e.target.value })}
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
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, registrationNo: e.target.value })}
                        />
                    </div>
                </div>

                {/* Family */}
                <div className="md:col-span-2 border-t border-border pt-4 mt-2">
                    <h4 className="text-[10px] font-black uppercase tracking-[2px] text-primary mb-4">Family Details</h4>
                </div>

                <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Father's Name *</label>
                    <Input
                        required
                        placeholder="Father's Full Name"
                        value={formData.fatherName}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, fatherName: e.target.value.replace(/[^a-zA-Z\s]/g, '') })}
                        pattern="[a-zA-Z\s]+"
                        title="Name should only contain alphabets and spaces"
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Father's Phone *</label>
                    <Input
                        required
                        placeholder="Father's Contact"
                        value={formData.fatherPhone}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => { const val = e.target.value.replace(/\D/g, '').slice(0, 10); setFormData({ ...formData, fatherPhone: val }); }}
                        type="tel"
                        minLength={10}
                        maxLength={10}
                        pattern="[0-9]{10}"
                        title="Phone number must be exactly 10 digits"
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Mother's Name</label>
                    <Input
                        placeholder="Mother's Full Name"
                        value={formData.motherName}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, motherName: e.target.value.replace(/[^a-zA-Z\s]/g, '') })}
                        pattern="[a-zA-Z\s]+"
                        title="Name should only contain alphabets and spaces"
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Blood Group</label>
                    <Input
                        placeholder="O+, A+, etc."
                        value={formData.bloodGroup}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, bloodGroup: e.target.value })}
                    />
                </div>

                <div className="md:col-span-2 border-t border-border pt-4 mt-2">
                    <h4 className="text-[10px] font-black uppercase tracking-[2px] text-primary mb-4">Visitor Details</h4>
                </div>

                {[0, 1, 2].map((i) => (
                    <div key={i} className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Visitor {i + 1} *</label>
                        <Input
                            required
                            placeholder={`Visitor ${i + 1} Name`}
                            value={formData.visitors[i]}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                const newVisitors = [...formData.visitors];
                                newVisitors[i] = e.target.value.replace(/[^a-zA-Z\s]/g, '');
                                setFormData({ ...formData, visitors: newVisitors });
                            }}
                            pattern="[a-zA-Z\s]+"
                            title="Name should only contain alphabets and spaces"
                        />
                    </div>
                ))}

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
