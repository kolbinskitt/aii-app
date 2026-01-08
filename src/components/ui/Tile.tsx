import { PropsWithChildren, CSSProperties } from 'react';

type Props = {
  className?: string;
  hoverable?: boolean;
  styles?: CSSProperties;
};

export default function Tile({
  children,
  className,
  hoverable,
  styles,
}: PropsWithChildren<Props>) {
  return (
    <div
      className={`bg-white p-4 rounded-3xl shadow-lg 
    ${hoverable ? 'hover:scale-[1.01]' : ''} transition
     ${className}`}
      style={styles}
    >
      {children}
    </div>
  );
}
