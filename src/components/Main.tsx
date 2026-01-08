import { PropsWithChildren } from 'react';
import Header from './Header';

type Props = {
  logged?: boolean;
};

export default function Main({ children, logged }: PropsWithChildren<Props>) {
  return (
    <div className="relative min-h-screen w-full bg-black">
      {/* Background desktop */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url('images/landing-desktop${
            logged ? '-logged' : ''
          }.png')`,
        }}
      />
      {/* Background mobile override */}
      <div
        className="md:hidden absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: "url('images/landing-mobile.jpg')",
        }}
      />
      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black opacity-50" />
      {/* Header */}
      <Header />
      {/* Main layout */}
      {children}
    </div>
  );
}
