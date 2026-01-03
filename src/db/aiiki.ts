import { supabase } from '../lib/supabase';

export async function getUserAiiki() {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return [];

  const { data, error } = await supabase
    .from('aiiki')
    .select('id, name, description, rezon')
    .eq('user_id', user.id) // ✅ tylko aiiki danego usera
    .order('name', { ascending: true });

  if (error) {
    console.error('Error loading aiiki:', error);
    return [];
  }

  return data;
}
