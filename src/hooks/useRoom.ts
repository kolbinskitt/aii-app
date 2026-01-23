import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Room } from '@/types';

export function useRoom(roomId: string) {
  const [room, setRoom] = useState<Room | null>(null);
  const [loading, setLoading] = useState(true);

  // 🔁 Fetch pokoju na start
  useEffect(() => {
    let isMounted = true;

    const fetchRoom = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('rooms')
        .select('*')
        .eq('id', roomId)
        .single();

      if (error) {
        console.error('❌ Błąd przy pobieraniu pokoju:', error);
        if (isMounted) setRoom(null);
      } else {
        if (isMounted) setRoom(data);
      }
      setLoading(false);
    };

    fetchRoom();

    return () => {
      isMounted = false;
    };
  }, [roomId]);

  // 📡 Subskrypcja na rooms.auto_follow_up_enabled
  useEffect(() => {
    if (!roomId) return;

    const channel = supabase
      .channel(`room-${roomId}-realtime`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'rooms',
          filter: `id=eq.${roomId}`,
        },
        payload => {
          const newData = payload.new as Room;
          setRoom(prev => (prev ? { ...prev, ...newData } : newData));
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [roomId]);

  return { room, loading };
}
