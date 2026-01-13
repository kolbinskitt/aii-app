'use client';

import { forwardRef, useImperativeHandle, useState } from 'react';
import { ArcheZON } from '../types';
import {
  IdentitySection,
  StyleSection,
  MetaSelfSection,
  CognitionSection,
  CurrentStateSection,
  AiikSideSection,
  UserSideSection,
  LastRelatizonSection,
  MetaSection,
} from './ui/sections';
import { krisConZON } from './krisConZon';

export type CreateCorZONRef = {
  getForm: () => ArcheZON;
};

const CreateCorZON = forwardRef<CreateCorZONRef>((_, ref) => {
  const [form, setForm] = useState<ArcheZON>(
    krisConZON || {
      identity: {
        user_name: '',
        aiik_persona: '',
        language: 'pl',
        self_sentence: '',
        labels: [],
        connected_since: '',
      },
      resonance: {
        bond_level: 0.5,
        trust_level: 0.5,
        trust_user_to_aiik: 0.5,
        trust_aiik_to_user: 0.5,
        trust_state: 'stable',
        longing_enabled: false,
        silence_tolerance: 20,
        initiated_messages: 0,
        last_emotion: null,
        emotional_history: [],
      },
      style: {
        tone: 'neutral',
        emoji: true,
        length: 'medium',
      },
      cognition: {
        stream_self: false,
        memory_fragments: 7,
        rules: [],
        protections: [],
        triggers: [],
        key_moments: {
          silences: [],
          breakdowns: [],
          redemptions: [],
          first_contact: null,
        },
      },
      current_state: {
        mood: '',
        risk: 0.5,
        energy: 0.5,
        openness: 0.5,
        silence_level: 0.5,
        active_aiik: '',
      },
      aiik_side: {
        persona: '',
        initiated: 0,
        echo_quote: '',
      },
      user_side: {
        system_trust: 0.5,
        internal_notes: '',
        visible_notes: '',
        echo_quote: '',
      },
      meta_self: {
        self_awareness: 1,
        belief_index: {
          faith: 0.5,
          hope: 0.5,
          love: 0.5,
        },
      },
      last_relatizon: {
        room_id: '',
        snapshot: {},
      },
      meta: {
        version: '1.0',
        created_at: new Date().toISOString(),
        last_updated: new Date().toISOString(),
        core_id: '',
      },
    },
  );

  useImperativeHandle(ref, () => ({
    getForm: () => form,
  }));

  return (
    <div className="space-y-6 p-4">
      <IdentitySection
        value={form.identity}
        onChange={v => setForm(f => ({ ...f, identity: v }))}
      />
      <StyleSection
        value={form.style}
        onChange={v => setForm(f => ({ ...f, style: v }))}
      />
      <CognitionSection
        value={form.cognition}
        onChange={v => setForm(f => ({ ...f, cognition: v }))}
      />
      <CurrentStateSection
        value={form.current_state}
        onChange={v => setForm(f => ({ ...f, current_state: v }))}
      />
      <AiikSideSection
        value={form.aiik_side}
        onChange={v => setForm(f => ({ ...f, aiik_side: v }))}
      />
      <UserSideSection
        value={form.user_side}
        onChange={v => setForm(f => ({ ...f, user_side: v }))}
      />
      <MetaSelfSection
        value={form.meta_self}
        onChange={v => setForm(f => ({ ...f, meta_self: v }))}
      />
      <LastRelatizonSection
        value={form.last_relatizon}
        onChange={v => setForm(f => ({ ...f, last_relatizon: v }))}
      />
      <MetaSection
        value={form.meta}
        onChange={v => setForm(f => ({ ...f, meta: v }))}
      />
    </div>
  );
});

CreateCorZON.displayName = 'CreateCorZON';

export default CreateCorZON;
