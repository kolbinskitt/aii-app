import { useTranslation } from 'react-i18next';
import Popup from './Popup';
import Button from './Button';

interface ConfirmProps {
  title: string;
  description?: string;
  onConfirm: () => void;
  onCancel?: () => void;
  confirmText?: string;
  cancelText?: string;
  // Przekazujemy wszystkie propsy Popup (poza dziećmi)
  onClose?: () => void;
  closeOnBackdropClick?: boolean;
  danger?: boolean;
}

export default function Confirm({
  title,
  description,
  onConfirm,
  onCancel,
  confirmText = 'OK',
  cancelText = 'Anuluj',
  onClose,
  closeOnBackdropClick = true,
  danger,
}: ConfirmProps) {
  const { t } = useTranslation();
  const confirmText_ = confirmText || t('ok');
  const cancelText_ = cancelText || t('cancel');

  const handleClose = () => {
    onClose?.();
    onCancel?.();
  };

  return (
    <Popup
      isOpen
      onClose={handleClose}
      closeOnBackdropClick={closeOnBackdropClick}
      title={title}
      primaryActions={
        <Button
          className="px-4 py-2 rounded bg-black text-white hover:bg-gray-800"
          onClick={() => {
            onConfirm();
            onClose?.();
          }}
          kind={danger ? 'danger' : 'submit'}
        >
          {confirmText_}
        </Button>
      }
      secondaryActions={
        <Button
          className="px-4 py-2 rounded border border-gray-300 text-gray-700 hover:bg-gray-100"
          onClick={handleClose}
        >
          {cancelText_}
        </Button>
      }
    >
      {description}
    </Popup>
  );
}
