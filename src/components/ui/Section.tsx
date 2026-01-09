'use client';

import { cn } from '../../lib/utils';

type SectionProps = {
  title: string;
  className?: string;
};

function Section({ title, className }: SectionProps) {
  return (
    <div className={cn('my-6', className)}>
      <h2 className="text-xl font-echo text-center text-[#f3f3f3] tracking-wide">
        {title}
      </h2>
      <div className="w-12 h-[2px] bg-amber-500 mx-auto mt-2 rounded-full opacity-60" />
    </div>
  );
}

export default Section;
