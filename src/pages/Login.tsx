import { supabase } from '../lib/supabase';

export default function Login() {
  const loginWithGoogle = async () => {
    await supabase.auth.signInWithOAuth({ provider: 'google' });
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
