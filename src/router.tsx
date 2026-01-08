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
        marginLeft: 20,
        width: 300,
        height: 'calc(100vh - 70px)',
        minWidth: 300,
      }}
    >
      {children}
    </Sidebar>
  );
}

type GridProps = {};

function Grid({ children }: PropsWithChildren<GridProps>) {
  return <div className="flex items-start w-full gap-2 pr-2">{children}</div>;
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
            element: (
              <Grid>
                <LeftSidebar>
                  <Rooms />
                </LeftSidebar>
                <RoomFieldView />
              </Grid>
            ),
          },
          {
            path: 'room/:id',
            element: (
              <Grid>
                <LeftSidebar>
                  <Rooms />
                </LeftSidebar>
                <Room />
              </Grid>
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
