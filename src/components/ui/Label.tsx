'use client';

import React from 'react';
import { cn } from '@/lib/utils'; // upewnij się, że masz className helper

type Props = {
  children: React.ReactNode;
  className?: string;
};

export default function Label({ children, className }: Props) {
  return (
    <label
      className={cn(
        'block text-xs font-system text-muted-foreground tracking-wide mb-1',
        className,
      )}
    >
      {children}
    </label>
  );
}
