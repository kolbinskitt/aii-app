'use client';

import { Input as AntdInput } from 'antd';
import type { InputProps as AntdInputProps } from 'antd';
import { cn } from '../../lib/utils';

export type InputProps = AntdInputProps & {
  className?: string;
};

const Input = ({ className, ...props }: InputProps) => {
  return (
    <AntdInput
      {...props}
      className={cn(
        'rounded-md font-system text-base px-3 py-1.5 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white border border-zinc-300 dark:border-zinc-700 focus:border-echo focus:ring-1 focus:ring-echo transition-shadow',
        className,
      )}
    />
  );
};

export default Input;
