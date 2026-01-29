import { PropsWithChildren } from 'react';
import { createHashRouter, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Rooms from './pages/Rooms';
import Room from './pages/Room';
import Login from './pages/Login';
import AdminPanel from './pages/AdminPanel';
import AuthGuard from './components/AuthGuard';
import RoomFieldView from './pages/RoomFieldView';
import ErrorPage from './pages/ErrorPage';
import { Sidebar } from './components/ui';
import Credits from './components/Credits';
import Aiiki from './components/Aiiki';

function LeftSidebar({ children }: PropsWithChildren) {
  return (
    <Sidebar
      className="bg-gray-300"
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

function Grid({ children }: PropsWithChildren) {
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
            path: 'room/:id/settings',
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
            path: 'credits',
            element: (
              <Grid>
                <LeftSidebar>
                  <Rooms />
                </LeftSidebar>
                <Credits />
              </Grid>
            ),
          },
          {
            path: 'aiiki',
            element: (
              <Grid>
                <LeftSidebar>
                  <Rooms />
                </LeftSidebar>
                <Aiiki />
              </Grid>
            ),
          },
          {
            path: 'admin-panel',
            element: (
              <Grid>
                <LeftSidebar>
                  <Rooms />
                </LeftSidebar>
                <AdminPanel />
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
