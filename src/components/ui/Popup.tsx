// components/ui/Popup.tsx
'use client';

import { Modal } from 'antd';
import { ReactNode } from 'react';
import { cn } from '../../lib/utils';

interface PopupProps {
  isOpen: boolean;
  onClose?: () => void;
  closeOnBackdropClick?: boolean;
  header?: ReactNode;
  footer?: ReactNode;
  children: ReactNode;
  className?: string;
}

export default function Popup({
  isOpen,
  onClose,
  closeOnBackdropClick = true,
  header,
  footer,
  children,
  className,
}: PopupProps) {
  return (
    <Modal
      open={isOpen}
      onCancel={onClose}
      onOk={() => {}}
      footer={null}
      closable={!!onClose}
      maskClosable={closeOnBackdropClick}
      centered
      className={cn('rounded-md p-0 max-w-2xl w-full', className)}
      styles={{
        body: {
          padding: 0,
        },
      }}
    >
      <div className="flex flex-col max-h-[80vh]">
        {header && (
          <div className="border-b border-zinc-200 bg-white sticky top-0 z-10">
            {header}
          </div>
        )}
        <div className="py-2 overflow-y-auto grow">{children}</div>
        {footer && (
          <div className="pt-2 border-t border-zinc-200 bg-white sticky bottom-0 z-10">
            {footer}
          </div>
        )}
      </div>
    </Modal>
  );
}
