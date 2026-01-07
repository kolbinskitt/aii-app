import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

const redirectTo = import.meta.env.PROD
  ? 'https://kolbinskitt.github.io/aii-app/'
  : 'http://localhost:5173';

export default function Login() {
  const navigate = useNavigate();

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
    <div className="p-10 text-center">
      <h1 className="text-2xl mb-6">Zaloguj się do aplikacji</h1>
      <button
        onClick={loginWithGoogle}
        className="bg-black text-white px-6 py-2 rounded"
      >
        Zaloguj przez Google
      </button>
    </div>
  );
}
