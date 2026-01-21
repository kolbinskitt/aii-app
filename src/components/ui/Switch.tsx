'use client';

import { Switch as AntSwitch } from 'antd';
import { SwitchProps as SwitchPropsAntd } from 'antd/es/switch';
import Label from './Label';

type SwitchProps = SwitchPropsAntd & {
  label?: string;
};

function Switch({ label, id, ...props }: SwitchProps) {
  return (
    <div className="flex items-center gap-2">
      <AntSwitch {...props} id={id} />
      <Label htmlFor={id} className="mb-0">
        {label}
      </Label>
    </div>
  );
}

export default Switch;
