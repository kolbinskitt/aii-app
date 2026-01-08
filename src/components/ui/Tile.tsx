import { CSSProperties, HTMLAttributes, ReactNode } from 'react';

type Props = {
  children?: ReactNode;
  hoverable?: boolean;
  styles?: CSSProperties;
} & HTMLAttributes<HTMLDivElement>;

export default function Tile({
  children,
  className,
  hoverable,
  styles,
  ...rest
}: Props) {
  return (
    <div
      className={`
        bg-white p-2 rounded-md shadow-lg 
        ${hoverable ? 'hover:scale-[1.01]' : ''} transition
        ${className ?? ''}
      `}
      style={styles}
      {...rest}
    >
      {children}
    </div>
  );
}
