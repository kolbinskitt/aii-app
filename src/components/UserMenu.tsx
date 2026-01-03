import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

export function UserMenu({ user }: { user: any }) {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
    document.location.reload();
  };

  const handleDeleteAccount = async () => {
    const { error } = await supabase.rpc('delete_user');

    if (error) {
      console.error('Błąd przy usuwaniu konta:', error.message);
      return;
    }

    await supabase.auth.signOut();
    window.location.href = '/login';
  };

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center text-white"
      >
        {user?.email?.[0].toUpperCase()}
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-40 bg-white shadow rounded p-2">
          <button
            onClick={handleLogout}
            className="block w-full text-left hover:bg-gray-100 p-2"
          >
            Wyloguj
          </button>
          <button
            onClick={handleDeleteAccount}
            className="block w-full text-left text-red-500 hover:bg-gray-100 p-2"
          >
            Usuń konto
          </button>
        </div>
      )}
    </div>
  );
}
