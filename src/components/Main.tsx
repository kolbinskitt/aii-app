import { PropsWithChildren } from 'react';
import Header from './Header';
import { useLocation } from 'react-router-dom';

type Props = {
  logged?: boolean;
};

export default function Main({ children, logged }: PropsWithChildren<Props>) {
  const location = useLocation();
  return (
    <div className="relative min-h-screen w-full bg-[#1e1b18]">
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={
          location.pathname === '/'
            ? {
                backgroundImage: `url('images/landing-desktop${
                  logged ? '-logged' : ''
                }.png')`,
              }
            : {}
        }
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
