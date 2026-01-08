import { PropsWithChildren } from 'react';
import Header from './Header';

type Props = {
  logged?: boolean;
};

export default function Main({ children, logged }: PropsWithChildren<Props>) {
  return (
    <div className="relative min-h-screen w-full bg-gray-500">
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url('images/landing-desktop${
            logged ? '-logged' : ''
          }.png')`,
        }}
      />
      <div
        className="md:hidden absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: "url('images/landing-mobile.jpg')",
        }}
      />
      <div className="absolute inset-0 bg-black opacity-50" />
      <Header />
      {children}
    </div>
  );
}
