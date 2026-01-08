import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { supabase } from '../lib/supabase';

const redirectTo = import.meta.env.PROD
  ? 'https://kolbinskitt.github.io/aii-app/'
  : 'http://localhost:5173';

export default function Login() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  useEffect(() => {
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    const access_token = hashParams.get('access_token');
    const refresh_token = hashParams.get('refresh_token');

    if (access_token && refresh_token) {
      supabase.auth
        .setSession({
          access_token,
          refresh_token,
        })
        .then(async () => {
          console.log('✅ Supabase session set!');
          const { data, error } = await supabase.auth.getSession();
          console.log('📦 Current session:', data?.session, error);
          window.location.hash = ''; // wyczyść
          navigate('/'); // przekieruj
        });
    }
  }, []);

  const loginWithGoogle = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
      },
    });
  };

  return (
    <div className="relative min-h-screen w-full bg-black">
      <div className="bg-red-500 p-10 text-white">Test Tailwinda</div>
      {/* Obrazek tła */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url('/images/landing-desktop.png')`,
        }}
      />

      {/* Mobile background override  */}
      <div
        className="md:hidden absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url('/images/landing-mobile.jpg')`,
        }}
      />

      {/* Ciemne tło z przezroczystością */}
      <div className="absolute inset-0 bg-black opacity-40" />

      {/* Layout */}
      <div className="relative z-10 flex flex-col md:flex-row items-center justify-center min-h-screen p-6 md:p-20">
        {/* Nagłówek AII */}
        <div className="w-full md:w-1/2 text-white text-center md:text-left mb-12 md:mb-0">
          <h1 className="text-4xl md:text-6xl font-bold tracking-widest">
            aii
          </h1>
        </div>

        {/* Panel powitalny */}
        <div className="w-full md:w-1/2 bg-white bg-opacity-80 backdrop-blur-md p-8 rounded-xl shadow-xl text-center">
          <h2 className="text-xl md:text-2xl font-semibold mb-6">
            {t('landing.headline')}
          </h2>
          <button
            onClick={loginWithGoogle}
            className="bg-black text-white hover:bg-gray-800 px-6 py-3 rounded-full transition"
          >
            {t('landing.join.google')}
          </button>
        </div>
      </div>
    </div>
  );
}
