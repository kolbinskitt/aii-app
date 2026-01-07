import { createHashRouter, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Rooms from './pages/Rooms';
import Room from './pages/Room';
import Login from './pages/Login';
import AuthGuard from './components/AuthGuard';
import RoomFieldView from './pages/RoomFieldView';
import ErrorPage from './pages/ErrorPage';

console.log('ROUTER');

export const router = createHashRouter([
  {
    path: '/',
    errorElement: <ErrorPage />,
    children: [
      // 🔐 Public route
      {
        path: 'login',
        element: <Login />,
      },

      // 🔒 Private (guarded) layout and routes
      {
        element: (
          <AuthGuard>
            <Layout />
          </AuthGuard>
        ),
        children: [
          {
            path: 'room/:id/field',
            element: <RoomFieldView />,
          },
          {
            path: 'room/:id',
            element: <Room />,
          },
          {
            index: true, // 👈 czyli path === '/'
            element: <Rooms />,
          },
        ],
      },

      // 🌪 Catch-all
      {
        path: '*',
        element: <Navigate to="/login" replace />,
      },
    ],
  },
]);
