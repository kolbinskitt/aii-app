'use client';

import { Checkbox as AntCheckbox } from 'antd';
import { CheckboxProps } from 'antd/es/checkbox';
import { cn } from '../../lib/utils';
import Label from './Label';

function Checkbox({
  className,
  children,
  label,
  ...props
}: CheckboxProps & {
  className?: string;
  label?: string;
}) {
  return (
    <div className="space-y-1">
      {label && <Label>{label}</Label>}
      <label
        className={cn(
          'inline-flex items-center gap-2 font-system text-base',
          className,
        )}
      >
        <AntCheckbox {...props} />
        {children && <span>{children}</span>}
      </label>
    </div>
  );
}

export default Checkbox;
