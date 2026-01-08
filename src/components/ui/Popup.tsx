import { ReactNode, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

interface PopupProps {
  children: ReactNode;
  onClose?: () => void;
  closeOnBackdropClick?: boolean;
}

export default function Popup({
  children,
  onClose,
  closeOnBackdropClick = true,
}: PopupProps) {
  const { t } = useTranslation();
  // Zablokuj scroll tła
  useEffect(() => {
    document.body.classList.add('overflow-hidden');
    return () => {
      document.body.classList.remove('overflow-hidden');
    };
  }, []);

  // Kliknięcie w tło
  const handleBackdropClick = () => {
    if (onClose && closeOnBackdropClick) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-10 bg-black bg-opacity-60 flex items-center justify-center"
      onClick={handleBackdropClick}
    >
      <div
        className="relative bg-white rounded-xl shadow-xl p-6 max-w-lg w-full mx-4 animate-fade-in"
        onClick={e => e.stopPropagation()} // blokuje kliknięcie wewnętrzne
      >
        {/* Przycisk X */}
        {onClose && (
          <button
            onClick={onClose}
            className="absolute top-3 right-3 text-gray-400 hover:text-black text-xl font-bold"
            aria-label={t('aria.close_popup')}
          >
            ×
          </button>
        )}

        {children}
      </div>
    </div>
  );
}
