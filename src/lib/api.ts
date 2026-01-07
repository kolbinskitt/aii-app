import { supabase } from './supabase';

type Fetch = typeof fetch;

export const api: Fetch = async (input, init) => {
  const apiUrl = `${import.meta.env.VITE_BACKEND_API_URL}${input}`;
  const res = await fetch(apiUrl, init);

  if (res.status === 401) {
    await supabase.auth.signOut();

    // opcjonalnie: custom event zamiast hard redirectu...
    window.dispatchEvent(new Event('auth:expired'));

    throw new Error('Session expired');
  }

  return res;
};
