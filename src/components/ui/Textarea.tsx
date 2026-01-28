'use client';

import { Input } from 'antd';
import { cn } from '../../lib/utils';
import Label from './Label';

const { TextArea } = Input;

type TextareaProps = {
  value?: string;
  onChange: (_val: string) => void;
  placeholder?: string;
  className?: string;
  wrapperClassName?: string;
  rows?: number;
  label?: string;
};

function Textarea({
  value,
  onChange,
  placeholder,
  className,
  wrapperClassName,
  rows = 4,
  label,
}: TextareaProps) {
  return (
    <div className={cn('space-y-1', wrapperClassName)}>
      {label && <Label>{label}</Label>}
      <TextArea
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        className={cn('font-system rounded-md', className)}
      />
    </div>
  );
}

export default Textarea;
