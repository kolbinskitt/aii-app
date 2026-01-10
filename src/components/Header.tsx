import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { UserMenu } from './UserMenu';
import useUser from '../hooks/useUser';
import AppVersion from './AppVersion';

export default function Header() {
  const { i18n } = useTranslation();
  const user = useUser();

  return (
    <header className="relative z-10 flex justify-between items-center w-full p-2">
      <Link
        to="/"
        className="h-10 flex items-center"
        style={{ outline: 'none' }}
      >
        <img src="images/logo/aii.svg" alt="aii logo" className="h-full w-20" />
      </Link>
      <div className="flex items-center space-x-4 text-white text-sm">
        <AppVersion />
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
