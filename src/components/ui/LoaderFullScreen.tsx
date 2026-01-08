import { PropsWithChildren } from 'react';

type Props = {};

export default function LoaderFullScreen({}: PropsWithChildren<Props>) {
  return (
    <div className="absolute inset-0 flex items-center justify-center">
      <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-white border-opacity-80"></div>
    </div>
  );
}
