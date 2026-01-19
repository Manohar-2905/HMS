import React from 'react';
interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    children: React.ReactNode;
    className?: string;
}
export declare function Modal({ isOpen, onClose, title, children, className }: ModalProps): React.ReactPortal | null;
export {};
