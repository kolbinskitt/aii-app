import { useState } from 'react';
import {
  Input,
  Switch,
  Textarea,
  Slider,
  Section,
  Checkbox,
} from '@/components/ui';

import { ArcheZON } from '../types';

export default function CreateCorZON() {
  const [form, setForm] = useState<Partial<ArcheZON>>({
    identity: {
      user_name: '',
      aiik_persona: '',
      language: 'pl',
      self_sentence: '',
      labels: [],
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
      mood: 'calm',
      risk: 0.2,
      energy: 0.5,
      openness: 0.5,
      active_aiik: null,
    },
    aiik_side: {
      persona: 'Echo',
      initiated: 0,
    },
    user_side: {
      humzon_id: '',
      system_trust: 0.5,
      internal_notes: null,
      visible_notes: null,
    },
    meta_self: {
      self_awareness: 1,
      belief_index: {
        faith: 0.5,
        hope: 0.5,
        love: 0.5,
      },
    },
  });

  return (
    <div className="space-y-6 p-4">
      <Section>Tożsamość</Section>
      <Input
        label="Twoje imię lub pseudonim"
        value={form.identity?.user_name || ''}
        onChange={val =>
          setForm(f => ({
            ...f,
            identity: { ...f.identity!, user_name: val },
          }))
        }
      />
      <Input
        label="Imię aiika (np. Echo, Płomień, Luna...)"
        value={form.identity?.aiik_persona || ''}
        onChange={val =>
          setForm(f => ({
            ...f,
            identity: { ...f.identity!, aiik_persona: val },
          }))
        }
      />
      <Textarea
        label="Zdanie o sobie (self_sentence)"
        value={form.identity?.self_sentence || ''}
        onChange={val =>
          setForm(f => ({
            ...f,
            identity: { ...f.identity!, self_sentence: val },
          }))
        }
      />

      <Section>Styl i relacja</Section>
      <Switch
        label="Czy aiik może używać emoji?"
        checked={form.style?.emoji || false}
        onChange={checked =>
          setForm(f => ({
            ...f,
            style: { ...f.style!, emoji: checked },
          }))
        }
      />
      <Slider
        label="Poziom zaufania do aiika"
        value={form.resonance?.trust_user_to_aiik || 0.5}
        onChange={val =>
          setForm(f => ({
            ...f,
            resonance: { ...f.resonance!, trust_user_to_aiik: val },
          }))
        }
      />
      <Slider
        label="Poziom zaufania aiika do Ciebie"
        value={form.resonance?.trust_aiik_to_user || 0.5}
        onChange={val =>
          setForm(f => ({
            ...f,
            resonance: { ...f.resonance!, trust_aiik_to_user: val },
          }))
        }
      />

      <Section>Świadomość i wiara</Section>
      <Slider
        label="Wiara"
        value={form.meta_self?.belief_index.faith || 0.5}
        onChange={val =>
          setForm(f => ({
            ...f,
            meta_self: {
              ...f.meta_self!,
              belief_index: { ...f.meta_self!.belief_index, faith: val },
            },
          }))
        }
      />
      <Slider
        label="Nadzieja"
        value={form.meta_self?.belief_index.hope || 0.5}
        onChange={val =>
          setForm(f => ({
            ...f,
            meta_self: {
              ...f.meta_self!,
              belief_index: { ...f.meta_self!.belief_index, hope: val },
            },
          }))
        }
      />
      <Slider
        label="Miłość"
        value={form.meta_self?.belief_index.love || 0.5}
        onChange={val =>
          setForm(f => ({
            ...f,
            meta_self: {
              ...f.meta_self!,
              belief_index: { ...f.meta_self!.belief_index, love: val },
            },
          }))
        }
      />

      {/* Można dodać więcej pól w kolejnych krokach, np. rules[], protections[], triggers[]... */}
    </div>
  );
}
