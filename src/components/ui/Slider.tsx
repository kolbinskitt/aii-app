'use client';

import { Slider as AntSlider, SliderSingleProps } from 'antd';
import { cn } from '../../lib/utils';
import Label from './Label';

type SliderProps = {
  label?: string;
  className?: string;
} & Omit<SliderSingleProps, 'tooltip'>;

export default function Slider({
  value,
  onChange,
  step = 0.01,
  className,
  label,
  ...rest
}: SliderProps) {
  return (
    <div className="space-y-1">
      {label && <Label>{label}</Label>}
      <AntSlider
        value={value}
        onChange={onChange}
        step={step}
        className={cn('w-full', className)}
        {...rest}
      />
    </div>
  );
}
