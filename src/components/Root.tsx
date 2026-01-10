import { PropsWithChildren } from 'react';
import '@/lib/i18n';

export default function Root({ children }: PropsWithChildren) {
  return <>{children}</>;
}
