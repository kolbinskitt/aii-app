'use client';

import { Input } from 'antd';
import { cn } from '../../lib/utils';

const { TextArea } = Input;

type TextareaProps = {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  className?: string;
  rows?: number;
};

function Textarea({
  value,
  onChange,
  placeholder,
  className,
  rows = 4,
}: TextareaProps) {
  return (
    <TextArea
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      rows={rows}
      className={cn('font-system rounded-md', className)}
    />
  );
}

export default Textarea;
