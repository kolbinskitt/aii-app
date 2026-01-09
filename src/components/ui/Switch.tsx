'use client';

import { Switch as AntSwitch } from 'antd';
import { cn } from '../../lib/utils';

type SwitchProps = {
  checked: boolean;
  onChange: (checked: boolean) => void;
  className?: string;
};

function Switch({ checked, onChange, className }: SwitchProps) {
  return (
    <AntSwitch
      checked={checked}
      onChange={onChange}
      className={cn('bg-[#1a1a1a] !rounded-lg', className)}
    />
  );
}

export default Switch;
