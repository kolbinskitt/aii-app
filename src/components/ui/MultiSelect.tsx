'use client';

import { Select } from 'antd';
import { cn } from '../../lib/utils';
import Label from './Label';

type MultiSelectProps = {
  value: string[];
  label?: string;
  onChange: (_val: string[]) => void;
  options: { label: string; value: string }[];
  placeholder?: string;
  className?: string;
};

function MultiSelect({
  value,
  onChange,
  options,
  placeholder,
  className,
  label,
}: MultiSelectProps) {
  return (
    <div className="space-y-1">
      {label && <Label>{label}</Label>}
      <Select
        mode="multiple"
        allowClear
        placeholder={placeholder || 'Wybierz...'}
        value={value}
        onChange={onChange}
        options={options}
        className={cn('w-full rounded-md', className)}
      />
    </div>
  );
}

export default MultiSelect;
