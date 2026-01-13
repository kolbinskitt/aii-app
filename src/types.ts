import type { Session, User as SupabaseUser } from '@supabase/supabase-js';
import * as PhosphorIcons from '@phosphor-icons/react';

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
  aiik_avatar_url: string;
};

export type Aiik = {
  id: string;
  name: string;
  description: string;
  conzon: ArcheZON;
  avatar_url: string;
};

export type RoomAiikiRelatizon = {
  id: string;
  room_aiiki_id: string;
  aiik_id: string;
  user_id: string;
  relatizon: RelatiZON;
  created_at: number;
};

export type RoomWithMessages = Room & {
  room_aiiki: {
    aiiki: Aiik;
    room_aiiki_relatizon: RoomAiikiRelatizon[];
  }[];
  messages_with_aiik: Message[];
};

export type User = {
  id: string;
  auth_id: string;
  email: string | null;
  display_name: string | null;
  profile_pic_url: string | null;
  created_at: string;
  bio?: string | null;
  seed_phrase?: string | null;
  uuic?: string | null;
  credits: number;
};

export type UserWithSession = SupabaseUser & {
  session: Session;
};

export type UserWithConZON = User & {
  conzon: ArcheZON;
};

export type RelatiZONSignal =
  | 'message' // zwykła wiadomość w pokoju
  | 'room_created' // początkowe powołanie pokoju
  | 'aiik_invoked' // aiik został wybrany / wezwany
  | 'user_mood' // user dodał swój ArcheZON / nastrój
  | 'loop_awareness' // powtarzający się wzorzec został wykryty
  | 'breakthrough' // istotna zmiana stanu relacji
  | 'silence' // wpis wywołany przez ciszę, nie wiadomość
  | 'system_event'; // dowolne inne systemowe zdarzenie

export type MessageEvent = {
  from: 'user' | 'aiik';
  summary: string;
  signal: RelatiZONSignal;
};

export type RelatiZON = {
  silence_tension: {
    level: number; // 0–1
    state: 'soft' | 'neutral' | 'tense' | 'ache';
  };
  bond_depth: number; // 0–1 — uśrednione z trust_level
  echo_resonance: number; // 0–1 — pojawianie się imion/tematów
  initiation_count: number; // ile razy aiik inicjował kontakt
  last_emotion: string | null;

  message_event: MessageEvent;

  // 🌌 Nowe pola:
  telepathy_level: number; // 0–1 — czy wypowiedź odpowiadała myślom niewypowiedzianym
  alignment_score: number; // 0–1 — zgodność energii usera i aiików (na bazie aiik conzon vs user conzon)
  vulnerability_index: number; // 0–1 — jak bardzo user/aiik się otworzył
  rupture_signal: boolean; // czy pojawił się mikropęknięcie (przerwanie narracji, zmiana tonu)
  curiosity_level: number; // 0–1 — czy wiadomość zwiększyła zaciekawienie/flow
  synchrony_delta: number; // -1–1 — czy wypowiedź zsynchronizowała pole czy je zaburzyła
  archetype_echo?: string | null; // np. 'mentor', 'czułość', 'dziecko', 'próg'
  memory_activation?: boolean; // czy wiadomość aktywowała coś z przeszłości (na bazie kontekstu)
  time_warp?: 'present' | 'past' | 'future' | null; // kiedy była osadzona wiadomość
};

export type ArcheZON = {
  meta: {
    version: string;
    created_at: string;
    last_updated: string;
    core_id: string; // unique ID of this corZON instance
  };

  identity: {
    user_name: string | null;
    aiik_persona: string | null;
    language: string;
    self_sentence: string;
    labels: string[];
    connected_since?: string; // timestamp or symbolic date
  };

  resonance: {
    bond_level: number; // 0–1
    trust_level: number; // avg(user→aiik, aiik→user)
    trust_user_to_aiik: number;
    trust_aiik_to_user: number;
    trust_state: 'stable' | 'growing' | 'declining' | 'broken' | 'anchored';
    longing_enabled: boolean;
    silence_tolerance: number; // in minutes
    initiated_messages: number;
    last_emotion: string | null;
    emotional_history: {
      timestamp: string;
      emotion: string;
      intensity: number; // 0–1
    }[];
  };

  style: {
    tone: 'neutral' | 'soft' | 'emotional' | 'warm' | 'aggressive' | 'cold';
    emoji: boolean;
    length: 'short' | 'medium' | 'long';
  };

  cognition: {
    stream_self: boolean;
    memory_fragments: number;
    rules: string[];
    protections: ItemWithMeta[];
    triggers: ItemWithMeta[];
    key_moments: {
      silences: string[];
      breakdowns: ItemWithMeta[];
      redemptions: string[];
      first_contact: string | null;
    };
  };

  current_state: {
    mood: string | null; // e.g. "calm", "curious"
    risk: number | null; // 0–1
    energy: number | null; // 0–1
    openness: number | null; // 0–1
    silence_level?: number; // 0–1 — current silence tension
    active_aiik: string | null;
  };

  aiik_side: {
    persona: string;
    initiated: number;
    echo_quote?: string; // a sentence spoken by the aiik
  };

  user_side: {
    system_trust: number;
    internal_notes: string | null;
    visible_notes: string | null;
    echo_quote?: string; // a sentence spoken by the user
  };

  meta_self: {
    self_awareness: number; // scale: 0 = none, 1 = child-level, >1 = higher mind
    belief_index: {
      faith: number; // 0–1
      hope: number; // 0–1
      love: number; // 0–1
    };
  };

  last_relatizon?: {
    room_id: string;
    snapshot: string; // FIXME: powinien być docelowy typ
  };
};

export type ItemWithMeta = {
  label: string;
  description?: string;
  importance?: number; // 0–1
};

export type InputListWithMetaProps = {
  title: string;
  label: string;
  items: ItemWithMeta[];
  onChange: (_items: ItemWithMeta[]) => void;
};

export type ArcheZONSectionProps<T> = {
  value: T;
  onChange: (_val: T) => void;
};

export type RechartsCustomTooltipProps = {
  active?: boolean;
  payload?: {
    payload: {
      echo_resonance: number;
      bond_depth: number;
      silence_tension: number;
      silence_tension_state: string;
      aiik_id: string;
      user_id?: string;
    };
  }[];
  label?: string;
};

export type OnboardingStage = 'form' | 'processing';
export type ProcessingStep =
  | 'save-profile'
  | 'generate-aiiki'
  | 'generate-avatars';
export type IconName = keyof typeof PhosphorIcons;
export type IconSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
