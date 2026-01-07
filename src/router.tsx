import { createBrowserRouter } from 'react-router-dom';
import Layout from './components/Layout';
import Rooms from './pages/Rooms';
import Room from './pages/Room';
import Login from './pages/Login';
import AuthGuard from './components/AuthGuard';
import RoomFieldView from './pages/RoomFieldView';
import ErrorPage from './pages/ErrorPage';

export const router = createBrowserRouter(
  [
    {
      path: '/login',
      element: <Login />,
    },
    {
      element: (
        <AuthGuard>
          <Layout />
        </AuthGuard>
      ),
      errorElement: <ErrorPage />,
      children: [
        { path: '/room/:id/field', element: <RoomFieldView /> },
        { path: '/room/:id', element: <Room /> },
        { path: '/', element: <Rooms /> },
      ],
    },
  ],
  {
    basename: import.meta.env.BASE_URL,
  },
);
