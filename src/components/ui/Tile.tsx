import { PropsWithChildren } from 'react';

type Props = {
  className?: string;
  hoverable?: boolean;
};

export default function Tile({
  children,
  className,
  hoverable,
}: PropsWithChildren<Props>) {
  return (
    <div
      className={`bg-white p-4 rounded-3xl shadow-lg 
    ${hoverable ? 'hover:scale-[1.01]' : ''} transition
     ${className}`}
    >
      {children}
    </div>
  );
}
