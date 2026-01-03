export type Role = 'user' | 'aiik';

export type Room = {
  id: string;
  name: string;
  slug: string;
  created_at: number;
};

export type Message = {
  id: string;
  room_id: string;
  text: string;
  role: Role;
  created_at: number;
  aiik_id: string;
  aiik_name: string;
};

export type Aiik = {
  id: string;
  name: string;
  description: string;
  rezon: string;
};

export type RoomWithMessages = Room & {
  room_aiiki: {
    aiiki: Aiik;
  }[];
  messages_with_aiik: Message[];
};
