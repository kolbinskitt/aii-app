import { PropsWithChildren } from 'react';
import { createHashRouter, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Rooms from './pages/Rooms';
import Room from './pages/Room';
import Login from './pages/Login';
import AuthGuard from './components/AuthGuard';
import RoomFieldView from './pages/RoomFieldView';
import ErrorPage from './pages/ErrorPage';
import { Sidebar } from './components/ui';

type LeftSidebarProps = {};

function LeftSidebar({ children }: PropsWithChildren<LeftSidebarProps>) {
  return (
    <Sidebar
      className="bg-gradient-to-t from-white/40 via-white/60 to-white/80"
      styles={{
        marginLeft: 60,
        width: 300,
        height: 'calc(100vh - 110px)',
        minWidth: 300,
      }}
    >
      {children}
    </Sidebar>
  );
}

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
            element: (
              <div className="flex items-start w-full gap-4 pr-10">
                <LeftSidebar>
                  <Rooms />
                </LeftSidebar>
                <Room />
              </div>
            ),
          },
          {
            index: true,
            element: (
              <LeftSidebar>
                <Rooms />
              </LeftSidebar>
            ),
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
