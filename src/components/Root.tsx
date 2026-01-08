import { PropsWithChildren } from 'react';
import '../lib/i18n';

type Props = {};

export default function Root({ children }: PropsWithChildren<Props>) {
  return <>{children}</>;
}
