// components/ui/Popup.tsx
'use client';

import { Modal } from 'antd';
import { ReactNode } from 'react';
import { cn } from '../../lib/utils';

interface PopupProps {
  isOpen: boolean;
  onClose?: () => void;
  closeOnBackdropClick?: boolean;
  title?: string;
  header?: ReactNode;
  footer?: ReactNode;
  children: ReactNode;
  className?: string;
  primaryActions?: ReactNode;
  secondaryActions?: ReactNode;
}

export default function Popup({
  isOpen,
  onClose,
  closeOnBackdropClick = true,
  title,
  header,
  footer,
  children,
  className,
  primaryActions,
  secondaryActions,
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
        {(header || title) && (
          <div className="border-b border-zinc-200 bg-white sticky top-0 z-10">
            {title && (
              <h2 className="text-2xl font-semibold text-black font-echo">
                {title}
              </h2>
            )}
            {header}
          </div>
        )}
        <div className="py-2 overflow-y-auto grow">{children}</div>
        {(footer || primaryActions || secondaryActions) && (
          <div className="pt-2 border-t border-zinc-200 bg-white sticky bottom-0 z-10">
            {footer}
            {(primaryActions || secondaryActions) && (
              <div className="mt-2 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {secondaryActions}
                </div>
                <div className="flex items-center gap-2">{primaryActions}</div>
              </div>
            )}
          </div>
        )}
      </div>
    </Modal>
  );
}
