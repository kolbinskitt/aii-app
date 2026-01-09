'use client';

import { Slider as AntSlider } from 'antd';
import { cn } from '../../lib/utils';

type SliderProps = {
  value: number;
  onChange: (value: number) => void;
  step?: number;
  className?: string;
};

function Slider({ value, onChange, step = 0.01, className }: SliderProps) {
  return (
    <AntSlider
      min={0}
      max={1}
      step={step}
      value={value}
      onChange={onChange}
      className={cn('w-full', className)}
    />
  );
}

export default Slider;
