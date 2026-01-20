import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    children: React.ReactNode;
    className?: string;
}

import { createPortal } from 'react-dom';

export function Modal({ isOpen, onClose, title, children, className }: ModalProps) {
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener('keydown', handleEscape);
            document.body.style.overflow = 'hidden';
        }

        return () => {
            document.removeEventListener('keydown', handleEscape);
            document.body.style.overflow = 'unset';
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    return createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8 bg-black/60 backdrop-blur-sm animate-fade-in overflow-y-auto">
            <div
                className={cn(
                    "relative w-full max-w-lg my-auto rounded-2xl shadow-2xl animate-zoom-in overflow-hidden",
                    "bg-card/90 backdrop-blur-xl border border-white/20 flex flex-col max-h-[90vh]",
                    className
                )}
            >
                {/* Decorative header gradient */}
                <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-primary via-primary/80 to-primary/60 shrink-0" />

                <div className="flex items-center justify-between p-4 md:p-6 pb-2 shrink-0">
                    <h2 className="text-xl md:text-2xl font-bold font-display bg-clip-text text-transparent bg-gradient-to-r from-primary to-orange-600 truncate mr-4">
                        {title}
                    </h2>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 rounded-full hover:bg-muted/50 shrink-0"
                        onClick={onClose}
                    >
                        <X className="h-4 w-4" />
                    </Button>
                </div>
                <div className="p-4 md:p-6 pt-2 overflow-y-auto custom-scrollbar">
                    {children}
                </div>
            </div>
        </div>,
        document.body
    );
}
