'use client';

import { Input } from 'antd';
import { cn } from '../../lib/utils';
import Label from './Label';

const { TextArea } = Input;

type TextareaProps = {
  value?: string;
  onChange: (val: string) => void;
  placeholder?: string;
  className?: string;
  rows?: number;
  label?: string;
};

function Textarea({
  value,
  onChange,
  placeholder,
  className,
  rows = 4,
  label,
}: TextareaProps) {
  return (
    <div className="space-y-1">
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
