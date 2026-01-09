'use client';

import { Select } from 'antd';
import { cn } from '../../lib/utils';

type MultiSelectProps = {
  value: string[];
  onChange: (value: string[]) => void;
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
}: MultiSelectProps) {
  return (
    <Select
      mode="multiple"
      allowClear
      placeholder={placeholder || 'Wybierz...'}
      value={value}
      onChange={onChange}
      options={options}
      className={cn('w-full rounded-md', className)}
    />
  );
}

export default MultiSelect;
