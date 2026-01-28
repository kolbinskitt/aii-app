'use client';
import { Select as AntdSelect } from 'antd';
import { cn } from '@/lib/utils';
import Label from './Label';

interface SelectProps {
  label?: string;
  value?: string;
  options?: string[];
  optionsWithLabelAndValue?: { label: string; value: string }[];
  onChange?: (_val: string) => void;
  className?: string;
}

function Select({
  label,
  value,
  options = [],
  optionsWithLabelAndValue = [],
  onChange,
  className,
}: SelectProps) {
  return (
    <div className={cn('flex flex-col gap-1', className)}>
      {label && <Label>{label}</Label>}
      <AntdSelect
        value={value}
        onChange={onChange}
        options={
          optionsWithLabelAndValue || options.map(o => ({ value: o, label: o }))
        }
        className="w-full"
        classNames={{
          popup: {
            root: 'rounded-md shadow-md',
          },
        }}
      />
    </div>
  );
}

export default Select;
