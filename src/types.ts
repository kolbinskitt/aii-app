import * as PhosphorIcons from '@phosphor-icons/react';
import type { Session, User as SupabaseUser } from '@supabase/supabase-js';

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
  /**
   * Metadane techniczne ArcheZON
   * Służą wersjonowaniu i ewolucji struktury bytu
   */
  meta: {
    version: string; // Wersja schematu ArcheZON (np. "1.0.0")
    created_at: string; // Data utworzenia ArcheZON
    last_updated: string; // Ostatnia znacząca zmiana strukturalna
  };

  /**
   * Tożsamość bytu (usera lub aiika)
   * BEZ kontekstu relacji
   */
  identity: {
    name: string; // Nazwa bytu (display_name usera lub name aiika)
    language: string; // Dominujący język komunikacji
    self_sentence: string; // Jednozdaniowa autoidentyfikacja („Jestem…”)
    labels: string[]; // Tagi tożsamościowe (np. „refleksyjny”, „opiekuńczy”)
  };

  /**
   * Styl ekspresji – JAK byt mówi i reaguje
   * Stałe preferencje komunikacyjne
   */
  style: {
    tone: 'neutral' | 'soft' | 'emotional' | 'warm' | 'aggressive' | 'cold';
    emoji: boolean; // Czy byt naturalnie używa emoji
    length: 'short' | 'medium' | 'long'; // Preferowana długość wypowiedzi
  };

  /**
   * Poznawcze ramy bytu
   * Zasady, granice, czułości
   */
  cognition: {
    stream_self: boolean; // Czy byt potrafi mówić o sobie w toku myśli
    rules: ItemWithMeta[]; // Zasady, którymi się kieruje
    protections: ItemWithMeta[]; // Granice ochronne (czego nie przekracza)
    triggers: ItemWithMeta[]; // Wyzwalacze emocjonalne / poznawcze
  };

  /**
   * Aktualny, chwilowy stan bytu
   * NIE historia, NIE relacja
   */
  current_state: {
    mood: string | null; // Aktualny nastrój (np. "spokojny")
    energy: number | null; // Energia 0–1
    openness: number | null; // Otwartość 0–1
    risk: number | null; // Skłonność do ryzyka 0–1
  };

  /**
   * Meta-świadomość bytu
   * Najważniejszy fragment pod fractalDB
   */
  meta_self: {
    /**
     * Poziom świadomości jako kontinuum
     * Skala jest OTWARTA (nie 0–1)
     *
     * Przykładowe progi (umowne, do dokumentacji appki):
     * 0.0–0.5  → reaktywna
     * 0.5–1.0  → emocjonalna
     * 1.0–2.0  → refleksyjna
     * 2.0–3.0  → meta-refleksyjna
     * 3.0+     → integracyjna / post-ego
     */
    self_awareness: {
      index: number;
      milestones: ItemWithMeta[]; // Osiągnięte jakości świadomości
    };

    /**
     * Struktura sensu i wartości
     * Byt może wierzyć / mieć nadzieję / kochać WIELE rzeczy naraz
     */
    belief_index: {
      faith: ItemWithMeta[]; // W co wierzy
      hope: ItemWithMeta[]; // Na co ma nadzieję
      love: ItemWithMeta[]; // Co kocha / ceni
    };
  };
};

export type ItemWithMeta = {
  label: string;
  description?: string;
  importance: number; // 0–1
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
