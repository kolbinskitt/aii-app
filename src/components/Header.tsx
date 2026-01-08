import { useTranslation } from 'react-i18next';

export default function Header() {
  const { i18n } = useTranslation();
  console.log('Wersja: ' + 1);
  return (
    <header className="relative z-10 flex justify-between items-center w-full px-6 md:px-12 py-6">
      <div className="text-white text-3xl font-bold tracking-widest">aii</div>

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
      </div>
    </header>
  );
}
