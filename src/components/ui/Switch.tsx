'use client';

import { Switch as AntSwitch } from 'antd';
import { cn } from '../../lib/utils';
import Label from './Label';

type SwitchProps = {
  checked: boolean;
  onChange: (_checked: boolean) => void;
  className?: string;
  label?: string;
};

function Switch({ checked, onChange, className, label }: SwitchProps) {
  return (
    <div className="space-y-1">
      {label && <Label>{label}</Label>}
      <AntSwitch
        checked={checked}
        onChange={onChange}
        className={cn('bg-[#1a1a1a] !rounded-lg', className)}
      />
    </div>
  );
}

export default Switch;
