'use client';

import { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { createPortal } from 'react-dom';

interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
  showDragHandle?: boolean;
}

export default function BottomSheet({ 
  isOpen, 
  onClose, 
  children, 
  title,
  showDragHandle = true 
}: BottomSheetProps) {
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    
    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const sheetContent = (
    <div className="fixed inset-0 z-50 md:hidden" role="dialog" aria-modal="true" aria-labelledby={title ? 'bottom-sheet-title' : undefined}>
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
        aria-hidden="true"
      />
      
      {/* Sheet */}
      <div className="absolute bottom-0 left-0 right-0 safe-bottom animate-slide-up">
        <div className="bg-white rounded-t-3xl border-t-2 border-gold/40 shadow-2xl max-h-[85vh] max-h-[85dvh] flex flex-col">
          {/* Drag handle & header */}
          <div className="flex flex-col items-center gap-2 p-4 border-b border-gold/20 sticky top-0 bg-white/95 backdrop-blur-sm rounded-t-3xl z-10">
            {showDragHandle && (
              <div className="w-10 h-1.5 rounded-full bg-gold/40" aria-hidden="true" />
            )}
            {title && (
              <h2 id="bottom-sheet-title" className="font-serif text-lg font-bold text-leaf-dark">
                {title}
              </h2>
            )}
            <button
              onClick={onClose}
              className="absolute right-4 top-4 touch-target-lg rounded-xl bg-coconut-100 hover:bg-coconut-200 flex items-center justify-center transition-colors"
              aria-label="Close bottom sheet"
            >
              <X className="w-5 h-5 text-slate-600" />
            </button>
          </div>
          
          {/* Content */}
          <div 
            ref={contentRef}
            className="flex-1 overflow-y-auto p-4 pb-nav-safe"
          >
            {children}
          </div>
        </div>
      </div>
    </div>
  );

  // Portal to body for proper stacking context
  if (typeof window !== 'undefined') {
    return createPortal(sheetContent, document.body);
  }

  return null;
}