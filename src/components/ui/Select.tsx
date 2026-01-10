'use client';
import { Select as AntdSelect } from 'antd';
import { cn } from '@/lib/utils';

interface SelectProps {
  label?: string;
  value?: string;
  options: string[];
  onChange?: (_val: string) => void;
  className?: string;
}

function Select({ label, value, options, onChange, className }: SelectProps) {
  return (
    <div className={cn('flex flex-col gap-1', className)}>
      {label && (
        <label className="text-sm text-muted-foreground">{label}</label>
      )}
      <AntdSelect
        value={value}
        onChange={onChange}
        options={options.map(o => ({ value: o, label: o }))}
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
