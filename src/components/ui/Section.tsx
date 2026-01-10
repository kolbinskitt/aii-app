'use client';

import { PropsWithChildren } from 'react';
import { cn } from '../../lib/utils';

type SectionProps = {
  className?: string;
};

function Section({ children, className }: PropsWithChildren<SectionProps>) {
  return (
    <div className={cn('my-6', className)}>
      <h2 className="text-xl font-echo text-center text-gray-800 tracking-wide">
        {children}
      </h2>
      <div className="w-12 h-[2px] bg-amber-500 mx-auto mt-2 rounded-full opacity-60" />
    </div>
  );
}

export default Section;
