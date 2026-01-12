'use client';

import * as PhosphorIcons from '@phosphor-icons/react';
import type { IconProps as PhosphorIconProps } from '@phosphor-icons/react';
import { cn } from '@/lib/utils';
import { IconName, IconSize } from '@/types';
import type { ElementType } from 'react';

const sizeMap: Record<IconSize, number> = {
  xs: 12,
  sm: 16,
  md: 20,
  lg: 24,
  xl: 32,
};

interface IconProps {
  name: IconName;
  size?: IconSize;
  weight?: PhosphorIconProps['weight'];
  className?: string;
  color?: string;
}

export default function Icon({
  name,
  size = 'md',
  weight = 'regular',
  className,
  color = 'currentColor',
}: IconProps) {
  const PhosphorIcon = PhosphorIcons[name] as ElementType;

  if (!PhosphorIcon) {
    if (process.env.NODE_ENV === 'development') {
      console.warn(`Icon "${name}" does not exist in Phosphor Icons`);
    }
    return null;
  }

  return (
    <PhosphorIcon
      size={sizeMap[size]}
      weight={weight}
      color={color}
      className={cn('inline-block align-middle', className)}
    />
  );
}
