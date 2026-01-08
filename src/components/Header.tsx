import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { UserMenu } from './UserMenu';
import useUser from '../hooks/useUser';

export default function Header() {
  const { i18n } = useTranslation();
  const user = useUser();
  console.log('Wersja: ' + 8);

  return (
    <header className="relative z-10 flex justify-between items-center w-full px-6 md:px-12 py-6">
      {/* Logo z linkiem do homepage */}
      <Link to="/" className="h-10 flex items-center">
        <img src="images/logo/aii.svg" alt="aii logo" className="h-full w-20" />
      </Link>

      {/* Przełącznik języka */}
      <div className="text-white space-x-4 text-sm">
        <button
          onClick={() => i18n.changeLanguage('pl')}
          className={i18n.language === 'pl' ? 'underline' : ''}
        >
          PL
        </button>
        <button
          onClick={() => i18n.changeLanguage('en')}
          className={i18n.language === 'en' ? 'underline' : ''}
        >
          EN
        </button>
        {user && <UserMenu />}
      </div>
    </header>
  );
}
