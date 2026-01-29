import { AutoComplete as AutoCompleteAntd } from 'antd';
import type { FC, ComponentProps } from 'react';
import Label from './Label';
import { cn } from '../../lib/utils';

type Props = ComponentProps<typeof AutoCompleteAntd> & {
  wrapperClassName?: string;
  className?: string;
  label?: string;
};

export const AutoComplete: FC<Props> = ({
  label,
  className,
  wrapperClassName,
  ...props
}) => {
  return (
    <div className={cn('space-y-1 w-full', wrapperClassName)}>
      {label && <Label>{label}</Label>}
      <AutoCompleteAntd
        className={cn(
          `w-full rounded-md font-system text-base px-3 py-1.5 bg-white text-zinc-900 
          border border-zinc-300 focus:border-echo focus:ring-1 focus:ring-echo transition-shadow
          `,
          className,
        )}
        {...props}
      />
    </div>
  );
};
