'use client';

import { ButtonHTMLAttributes, ReactNode } from 'react';
import Button from './Button';

interface IconButtonProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'> {
  icon: ReactNode;
  'aria-label': string;
}

export default function IconButton({ icon, ...props }: IconButtonProps) {
  return <Button {...props} icon={icon} kind="ghost" size="small" />;
}
