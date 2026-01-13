import { PropsWithChildren, ComponentProps } from 'react';
import { Card as AntCard } from 'antd';

export function Card(props: ComponentProps<typeof AntCard>) {
  return <AntCard {...props} className="rounded-md shadow-md" />;
}

export function CardContent({
  children,
  className = '',
}: PropsWithChildren<{ className?: string }>) {
  return <div className={`${className}`}>{children}</div>;
}
