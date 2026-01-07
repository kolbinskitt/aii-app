import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import useUser from '../hooks/useUser';

export function UserMenu() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const { user } = useUser();

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
    window.location.href = '/';
  };

  return (
    <div className="relative">
      {user && (
        <div>
          <button
            onClick={() => setOpen(!open)}
            className="w-20 h-20 rounded-full bg-gray-300 flex items-center justify-center text-white p-0"
          >
            <img
              src={user.profile_pic_url || '/bland'}
              style={{ width: 20, height: 20, borderRadius: '50%' }}
            />
          </button>
          Witaj {user.display_name}
        </div>
      )}
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
