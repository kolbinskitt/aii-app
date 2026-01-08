import React from 'react';
import ReactDOM from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RouterProvider } from 'react-router-dom';
import { UserProvider } from './context/UserContext';
import { router } from './router';
import Root from './components/Root';
import './index.css';

if (window.location.hash === '') {
  window.location.replace(window.location.href + '#/');
}

const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <UserProvider>
        <Root>
          <RouterProvider router={router} />
        </Root>
      </UserProvider>
    </QueryClientProvider>
  </React.StrictMode>,
);
