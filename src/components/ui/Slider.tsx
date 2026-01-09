'use client';

import { Slider as AntSlider } from 'antd';
import { cn } from '../../lib/utils';
import Label from './Label';

type SliderProps = {
  value: number;
  onChange: (value: number) => void;
  step?: number;
  className?: string;
  label?: string;
};

function Slider({
  value,
  onChange,
  step = 0.01,
  className,
  label,
}: SliderProps) {
  return (
    <div className="space-y-1">
      {label && <Label>{label}</Label>}
      <AntSlider
        min={0}
        max={1}
        step={step}
        value={value}
        onChange={onChange}
        className={cn('w-full', className)}
      />
    </div>
  );
}

export default Slider;
