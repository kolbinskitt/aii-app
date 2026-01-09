'use client';

import { Checkbox as AntCheckbox } from 'antd';
import { CheckboxProps } from 'antd/es/checkbox';
import { cn } from '../../lib/utils';

function Checkbox({
  className,
  children,
  ...props
}: CheckboxProps & { className?: string }) {
  return (
    <label
      className={cn(
        'inline-flex items-center gap-2 font-system text-base',
        className,
      )}
    >
      <AntCheckbox {...props} />
      {children && <span>{children}</span>}
    </label>
  );
}

export default Checkbox;
