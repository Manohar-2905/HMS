import React, { useRef } from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { Download } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface StudentIdCardProps {
    user: any;
}

export const StudentIdCard: React.FC<StudentIdCardProps> = ({ user }) => {
    const cardRef = useRef<HTMLDivElement>(null);

    const handleDownload = async () => {
        if (!cardRef.current) return;

        try {
            // Create canvas from the card element
            const canvas = await html2canvas(cardRef.current, {
                scale: 3, // Higher scale for better quality
                useCORS: true, // Allow loading cross-origin images (Cloudinary)
                logging: false,
                backgroundColor: null,
                allowTaint: true
            });

            const imgData = canvas.toDataURL('image/png');

            // Generate PDF
            // ID Card size: 85.6mm x 54mm. We'll add some margin.
            const pdf = new jsPDF({
                orientation: 'landscape',
                unit: 'mm',
                format: [85.6, 54] // Exact ID card size
            });

            pdf.addImage(imgData, 'PNG', 0, 0, 85.6, 54);
            pdf.save(`${user.name.replace(/\s+/g, '_')}_ID_Card.pdf`);

        } catch (error) {
            console.error('Error generating ID card:', error);
            alert('Failed to generate ID card');
        }
    };

    // Derived Data
    const joiningDate = user.createdAt ? new Date(user.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) : 'N/A';
    const dob = user.dob ? new Date(user.dob).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : 'N/A';

    return (
        <div className="flex flex-col items-center gap-4">
            {/* ID Card Display Wrapper */}
            <div className="relative shadow-xl rounded-xl overflow-hidden transition-transform hover:scale-105 duration-300">

                {/* 
                   THE ID CARD ITSELF 
                   Dimensions: w-[480px] h-[300px]
                   Ratio: 1.6 (Standard ID Card)
                */}
                <div
                    ref={cardRef}
                    className="w-[480px] h-[300px] bg-white relative flex flex-col font-sans overflow-hidden"
                    style={{
                        borderRadius: '24px',
                        border: '2px solid #991b1b' // Dark Red/Maroon Border (matches reference)
                    }}
                >
                    {/* Header Background (Gradient) */}
                    {/* Takes up ~60% of height */}
                    <div className="absolute top-0 left-0 w-full h-[60%] bg-gradient-to-r from-[#00008B] via-[#C71585] to-[#FF1493] z-0">
                        {/* Golden Decoration Circles (Right Side) */}
                        <div className="absolute top-[-15px] right-[-15px] w-48 h-48 border-[1px] border-[#FFD700]/40 rounded-full" />
                        <div className="absolute top-[5px] right-[5px] w-36 h-36 border-[1px] border-[#FFD700]/30 rounded-full" />
                    </div>

                    {/* Logo (Top Right) */}
                    {/* Positioned inside the decorative circles */}
                    <div className="absolute top-9 right-1 z-10 w-[140px] h-[140px] bg-black rounded-full p-1 border-2 border-[#FFD700] shadow-md flex items-center justify-center">
                        <img src="/logo.png" alt="Logo" className="w-full h-full object-contain rounded-full" />
                    </div>

                    {/* Header Text Block (Right of Photo) */}
                    {/* Photo is on left (~150px wide space). Logo starts around 330px. Space is tight. */}
                    {/* Header Text Block (Right of Photo) */}
                    {/* Photo is on left (~150px wide space). Logo starts around 330px. Space is tight. */}
                    <div className="absolute top-3 left-[140px] z-10 text-white text-center w-[200px]">
                        <h1 className="text-[25px] font-bold uppercase drop-shadow-sm leading-tight tracking-tight whitespace-nowrap pr-16 -mt-1">YASHODA BHAWAN</h1>
                        <h2 className="text-[20px] font-bold mt-1 leading-none pl-12">8809260213</h2>
                        <div className="mt-2 flex flex-col items-center pl-14">
                            <p className="text-[12px] font-bold uppercase tracking-wider leading-tight">BINAY KUMAR</p>
                            <p className="text-[10px] font-medium uppercase tracking-wider opacity-90 leading-tight">AT - LAKHEY MAZAR</p>
                        </div>
                    </div>

                    {/* Student Name (Bottom Left of Gradient Section, Right of Photo) */}
                    {/* Aligned closer to photo to avoid Logo overlap. Reduced size. */}
                    <div className="absolute top-[142px] left-[170px] z-10 w-[150px]">
                        <h2 className="text-[18px] font-black text-white uppercase tracking-wide drop-shadow-md leading-none whitespace-nowrap">
                            {user.name}
                        </h2>
                    </div>

                    {/* User Photo (Left Side) */}
                    {/* Large Circle, overlapping the boundary */}
                    <div className="absolute top-[45px] left-[20px] z-20">
                        <div className="w-[145px] h-[145px] rounded-full bg-white p-1 shadow-xl">
                            <img
                                src={user.photo || "https://placehold.co/400"}
                                alt={user.name}
                                className="w-full h-full object-cover rounded-full border border-gray-200"
                                crossOrigin="anonymous"
                            />
                        </div>
                    </div>

                    {/* Footer Content (Bottom White Area) */}
                    <div className="absolute bottom-0 left-0 w-full h-[40%] bg-white px-5 pb-5 pt-8 flex justify-between items-end box-border">

                        {/* Footer Columns Container */}
                        <div className="w-full flex justify-between items-end">

                            {/* Col 1 */}
                            <div className="flex flex-col justify-end w-[30%]">
                                <div className="mb-3">
                                    <p className="text-[10px] font-bold text-[#8B0000] uppercase leading-none mb-1">GENDER:</p>
                                    <p className="text-[12px] font-bold text-black leading-none">Female</p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold text-[#8B0000] uppercase leading-none mb-1">DATE OF BIRTH:</p>
                                    <p className="text-[12px] font-bold text-black leading-none">{dob}</p>
                                </div>
                            </div>

                            {/* Divider 1 */}
                            <div className="w-[2px] h-[50px] bg-[#8B0000] mx-2"></div>

                            {/* Col 2 */}
                            <div className="flex flex-col justify-end w-[35%]">
                                <div className="mb-3">
                                    <p className="text-[10px] font-bold text-[#8B0000] uppercase leading-none mb-1">ADDRESS:</p>
                                    <p className="text-[12px] font-bold text-black leading-tight line-clamp-2">{user.address}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold text-[#8B0000] uppercase leading-none mb-1">FATHER'S CONTACT:</p>
                                    <p className="text-[12px] font-bold text-black leading-none">{user.fatherPhone || 'N/A'}</p>
                                </div>
                            </div>

                            {/* Divider 2 */}
                            <div className="w-[2px] h-[50px] bg-[#8B0000] mx-2"></div>

                            {/* Col 3 */}
                            <div className="flex flex-col justify-end w-[30%] text-right">
                                <div className="mb-3 text-left pl-2">
                                    <p className="text-[10px] font-bold text-[#8B0000] uppercase leading-none mb-1">JOINING DATE:</p>
                                    <p className="text-[12px] font-bold text-black leading-none">{joiningDate}</p>
                                </div>
                                <div className="text-left pl-2">
                                    <p className="text-[10px] font-bold text-[#8B0000] uppercase leading-none mb-1">BLOOD GROUP:</p>
                                    <p className="text-[12px] font-bold text-black leading-none">--</p>
                                </div>
                            </div>

                        </div>
                    </div>
                </div>
            </div>

            <Button onClick={handleDownload} variant="outline" className="w-full gap-2 hover:bg-primary hover:text-white transition-colors">
                <Download className="w-4 h-4" /> Download ID Card
            </Button>
        </div>
    );
};
