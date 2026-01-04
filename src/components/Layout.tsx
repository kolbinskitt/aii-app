import { Outlet } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { UserMenu } from './UserMenu';
import App from './App';

export default function Layout() {
  const user = useUser();

  return (
    <App>
      <header className="p-4 flex justify-between">
        {user && <UserMenu />}
      </header>
      <main className="p-4">
        <Outlet />
      </main>
    </App>
  );
}
