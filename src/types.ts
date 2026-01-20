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
  avatar_url: string;
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
    aiiki_with_conzon: Aiik;
    room_aiiki_relatizon: RoomAiikiRelatizon[];
  }[];
  messages_with_aiik: Message[];
};

export type UserRole = 'user' | 'admin';

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
  role: UserRole;
};

export type UserWithSession = SupabaseUser & {
  session: Session;
};

export type UserWithConZON = User & {
  conzon: ArcheZON;
};

// Typ sygnału relacyjnego – co wywołało zdarzenie w relacji
export type RelatiZONSignal =
  | 'message' // zwykła wiadomość
  | 'room_created' // utworzenie pokoju
  | 'aiik_invoked' // aiik został wybrany / pojawił się
  | 'user_mood' // user udostępnił swój ArcheZON / nastrój
  | 'loop_awareness' // wykryto powtarzający się wzorzec
  | 'breakthrough' // głęboka zmiana jakości relacji
  | 'silence' // zdarzenie wywołane milczeniem
  | 'system_event'; // inne, wewnętrzne zdarzenie systemowe

// Minimalna informacja o ostatnim zdarzeniu w relacji
export type MessageEvent = {
  from: Role; // kto wygenerował zdarzenie
  summary: string; // krótki opis, np. „Zapytał o sens życia”
  signal: RelatiZONSignal; // typ zdarzenia
};

// Główny typ opisujący stan relacji między userem a aiikiem
export type RelatiZON = {
  /**
   * Techniczne metadane tej próbki relacji
   */
  meta: {
    version: string; // wersja schematu (np. '1.0.0')
    timestamp: string; // czas zapisu snapshotu (ISO string)
    room_id?: string; // opcjonalny identyfikator pokoju, jeśli dotyczy
  };

  /**
   * Twarde metryki połączenia emocjonalnego i poznawczego
   */
  connection_metrics: {
    bond_depth: number; // 0–1: jak głębokie jest połączenie
    echo_resonance: number; // 0–1: jak często pojawiają się echa tematów, imion, symboli
    telepathy_level: number; // 0–1: czy wypowiedzi trafiają w niewypowiedziane myśli
    alignment_score: number; // 0–1: zgodność stanu usera i aiika (na bazie ich ArcheZONów)
    vulnerability_index: number; // 0–1: otwartość emocjonalna w ostatnich wypowiedziach
    synchrony_delta: number; // -1–1: czy wiadomość zsynchronizowała pole czy je zaburzyła
    curiosity_level: number; // 0–1: czy interakcja zwiększyła ciekawość, flow, eksplorację
  };

  /**
   * Miękkie dane emocjonalne, archetypiczne i czasowe
   */
  emotional_state: {
    last_emotion: string | null; // ostatnia zarejestrowana emocja
    memory_activation?: boolean; // czy wiadomość aktywowała wspomnienia (z `fractalDB`)
    rupture_signal: boolean; // czy pojawił się mikropęknięcie narracji, zmiana tonu
    time_warp?: 'present' | 'past' | 'future' | null; // czy wiadomość była osadzona w czasie innym niż teraźniejszość
    archetype_echo?: string | null; // np. 'mentor', 'dziecko', 'czułość' – echo archetypu w wypowiedzi
  };

  /**
   * Zdarzenie interakcyjne oraz napięcia ciszy
   */
  interaction_event: {
    message_event: MessageEvent; // zdarzenie, które było podstawą tej próbki
    initiation_count: number; // ile razy aiik zainicjował kontakt z userem
    silence_tension: {
      level: number; // 0–1: siła napięcia w ciszy
      state: 'soft' | 'neutral' | 'tense' | 'ache'; // charakter tej ciszy
    };
  };
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

export type FractalNodeType =
  | 'message' // 🗣️ Surowa wiadomość (usera lub aiika), np. "Lubię lody waniliowe"
  | 'relatizon' // 🌐 Abstrakcyjny opis relacji powstałej w rozmowie (np. "zrozumienie", "przełom", "echo tematu")
  | 'user_memory' // user memory
  | 'aiik_memory' // aiik memory
  | 'tag' // tag
  | 'trait'; // trait

export type SaveFractalNodeArgs = {
  accessToken: string;
  type: FractalNodeType;
  content: string | RelatiZON;
  said: boolean;
  interpretation?: string;
  reason?: string;
  weight?: number;
  tags?: WeightedValue[];
  traits?: WeightedValue[];
  relates_to?: WeightedValue[];
  user_id?: string;
  aiik_id?: string;
  room_id?: string;
};

export type FractalNode = {
  id: string; // uuid
  type: FractalNodeType;
  content: string | object; // oryginalna wiadomość lub RelatiZON
  interpretation: string;
  reason?: string;
  weight?: number;
  tags?: WeightedValue[];
  traits?: WeightedValue[];
  relates_to?: WeightedValue[];
  user_id?: string | null;
  aiik_id?: string | null;
  room_id?: string | null;
  embedding: number[];
  created_at: string; // Znacznik czasu utworzenia rekordu (ISO timestamp)
};

export type FractalLinkRelationType =
  | 'origin' // Pierwotne powiązanie, np. relatizon tworzący pokój
  | 'echo' // Echo jednej wiadomości w drugiej (np. odpowiedź aiika)
  | 'memory' // Powiązanie z wcześniejszą pamięcią
  | 'intention' // Intencjonalne powiązanie przez użytkownika lub aiika
  | 'insight' // Wniosek, refleksja powiązana z czymś wcześniejszym
  | 'reinforcement' // Wzmocnienie idei przez powtórzenie / podobieństwo
  | 'reference' // Odniesienie do czegoś (np. cytat, wspomnienie)
  | 'association' // Swobodne skojarzenie między węzłami
  | 'emergence' // Gdy nowy węzeł wynika z kilku poprzednich (emergentnie)
  | 'custom'; // Dowolny inny – pozwala na elastyczność

export type FractalLink = {
  id: string; // Unikalny identyfikator rekordu (UUID)
  from_node: string | null; // ID węzła źródłowego (może być null, np. dla źródła absolutnego)
  to_node: string; // ID węzła docelowego (zawsze wymagane)
  relation_type: FractalLinkRelationType; // Typ relacji (np. 'origin', 'echo', 'memory'…)
  weight: number; // Waga relacji (domyślnie 1.0, ale może reprezentować siłę połączenia)
  metadata?: Record<string, unknown>; // Dowolne dane kontekstowe (np. room_name, trigger_message…)
  created_at: string; // Znacznik czasu utworzenia rekordu (ISO timestamp)
};

export type WeightedValue = {
  value: string;
  weight: number; // 0 to 1
};

export type MemoryFragment = {
  content: string; // oryginalna treść zapamiętanego fragmentu
  interpretation: string; // opis interpretacyjny (np. „wyraża lęk przed bliskością”)
  reason: string; // dlaczego fragment ma być zapamiętany
  weight: number; // ważność pamięci (liczba z zakresu 0.0 – 1.0)
  tags?: WeightedValue[]; // elastyczne słowa-klucze (np. "emotion", "trust", "grief", "hope") wraz z wagami
  traits?: WeightedValue[]; // cechy: np. "reflective", "vulnerable", "pattern", "relational" wraz z wagami
  relates_to?: WeightedValue[]; // ID innych memory, z którymi ta jest powiązana (np. echo wcześniejszej sytuacji) wraz z wagami
};

export type MemoryItem = MemoryFragment & {
  type: FractalNodeType;
};

export type UserAiikiMessage = {
  user: string;
  aiiki: {
    name: string;
    message: string;
  }[];
};

export type InternalReactionIntent =
  | 'add'
  | 'clarify'
  | 'challenge'
  | 'ask'
  | 'hold';

export interface InternalReaction {
  shouldSpeak: boolean;
  confidence: number; // 0.0 – 1.0
  intent: InternalReactionIntent;
  reason: string;
}

export interface LLMMessageResponseParsedMessage {
  message: string;
  response: string;
  message_summary: string;
  response_summary: string;
  user_memory: MemoryFragment[];
  aiik_memory: MemoryFragment[];
  not_enought_data: boolean;
  internal_reaction: InternalReaction;
}

export type LLMMessageResponse = LLMMessageResponseParsedMessage & {
  model: string;
};

export interface LLMResponsesRedundancyCheckParsedMessage {
  keep: string[]; // aiik_id[]
  drop: string[]; // aiik_id[]
  reasoning: {
    aiik_id: string;
    reason: string;
  }[];
  response_could_be_better: {
    value: boolean;
    reason: string;
  };
}

export type LLMResponsesRedundancyCheck =
  LLMResponsesRedundancyCheckParsedMessage & {
    model: string;
  };

export type SpeakCandidate = {
  aiik: Aiik;
  result: LLMMessageResponseParsedMessage & {
    internal_reaction: {
      shouldSpeak: boolean;
      confidence: number;
      intent: InternalReactionIntent;
      reason: string;
    };
  };
};

export type AiikReaction = {
  aiik: Aiik;
  result: LLMMessageResponseParsedMessage | null;
};
