import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export const useAccessToken = () => {
  const [accessTtoken, setAccessToken] = useState<string>();

  useEffect(() => {
    const getAccessToken = async () => {
      const { data } = await supabase.auth.getSession();
      const session = data.session;
      if (session?.access_token) {
        setAccessToken(session.access_token);
      }
    };
    getAccessToken();
  }, []);

  return accessTtoken;
};
