import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { supabase } from '../lib/supabase';
import Header from '../components/Header';

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
          await supabase.auth.getSession();
          window.location.hash = '';
          navigate('/');
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
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: "url('images/landing-desktop.png')",
        }}
      />
      <div
        className="md:hidden absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: "url('images/landing-mobile.jpg')",
        }}
      />
      <Header />
      <div className="relative z-10 flex flex-col md:items-end items-center justify-center min-h-[80vh] p-6 md:p-20">
        <div className="w-full max-w-xl bg-white bg-opacity-80 backdrop-blur-md p-8 rounded-xl shadow-xl text-center">
          <h2 className="text-2xl md:text-3xl font-semibold mb-4 font-echo">
            {t('landing.headline')}
          </h2>
          <p className="text-md md:text-lg text-gray-700 mb-6 font-system">
            {t('landing.description')}
          </p>
          <button
            onClick={loginWithGoogle}
            className="bg-black text-white hover:bg-gray-800 px-6 py-3 rounded-full transition flex items-center justify-center space-x-3 mx-auto font-sans"
          >
            <img
              src={`images/logo/google.png`}
              alt="Google"
              className="w-5 h-5"
            />
            <span>{t('landing.join.google')}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
