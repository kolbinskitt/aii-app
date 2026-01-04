import { PropsWithChildren } from 'react';
import useUser from '../hooks/useUser';

export default function App({ children }: PropsWithChildren) {
  const { user, loading } = useUser();

  if (loading) return <div>Ładowanie...</div>;
  if (!user) return <div>Błąd logowania.</div>;

  return children;
}
