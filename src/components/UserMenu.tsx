import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import useUser from '../hooks/useUser';
import { useTranslation } from 'react-i18next';

export function UserMenu() {
  const [open, setOpen] = useState(false);
  const { t } = useTranslation();
  const menuRef = useRef<HTMLDivElement>(null);
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
    navigate('/');
    document.location.reload();
  };

  // Zamknij menu, jeśli kliknięto poza nim
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Pobierz inicjały z imienia i nazwiska
  const getInitials = () => {
    const you = t('you');
    if (!user) return you;

    const { display_name } = user;

    if (!display_name) return you;

    return display_name
      .split(' ')
      .filter(Boolean)
      .map((p: string) => p[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };

  return (
    <div className="relative" ref={menuRef}>
      {user && (
        <button
          onClick={() => setOpen(!open)}
          className="w-10 h-10 rounded-full bg-sky-100 flex items-center justify-center text-sky-500 font-semibold text-sm overflow-hidden p-0.5 bg-white"
        >
          {user.profile_pic_url ? (
            <img
              src={user.profile_pic_url}
              alt="Avatar"
              className="w-full h-full object-cover rounded-full"
            />
          ) : (
            <span>{getInitials()}</span>
          )}
        </button>
      )}

      {open && (
        <div className="absolute right-0 mt-2 w-40 bg-white shadow-xl rounded-lg z-50 overflow-hidden">
          <button
            onClick={handleLogout}
            className="block w-full text-left text-black hover:bg-gray-100 px-4 py-2"
          >
            {t('user.logout')}
          </button>
          <button
            onClick={handleDeleteAccount}
            className="block w-full text-left text-red-500 hover:bg-gray-100 px-4 py-2"
          >
            {t('user.delete_account')}
          </button>
        </div>
      )}
    </div>
  );
}
