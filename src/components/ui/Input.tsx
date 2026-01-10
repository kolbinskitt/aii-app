'use client';

import { Input as AntdInput } from 'antd';
import type { InputProps as AntdInputProps } from 'antd';
import { cn } from '../../lib/utils';
import Label from './Label';

type BaseProps = Omit<AntdInputProps, 'onChange' | 'value'>;

export type InputProps = BaseProps & {
  label?: string;
  className?: string;
  value?: string;
  onChange?: (val: string) => void;
};

const Input = ({ className, label, value, onChange, ...props }: InputProps) => {
  return (
    <div className="space-y-1">
      {label && <Label>{label}</Label>}
      <AntdInput
        {...props}
        value={value}
        className={cn(
          'rounded-md font-system text-base px-3 py-1.5 bg-white text-zinc-900 border border-zinc-300 focus:border-echo focus:ring-1 focus:ring-echo transition-shadow',
          className,
        )}
        onChange={e => onChange?.(e.target.value)}
      />
    </div>
  );
};

export default Input;
