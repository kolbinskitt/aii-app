'use client';

import { forwardRef, useImperativeHandle, useState } from 'react';
import { ArcheZON } from '../types';
import {
  IdentitySection,
  StyleSection,
  MetaSelfSection,
  CognitionSection,
  CurrentStateSection,
  // MetaSection,
} from './ui/sections';
import { Input } from './ui';
import { krisConZON } from './krisConZon';

export type CreateCorZONRef = {
  getForm: () => ArcheZON;
};

type CreateCorZONProps = {
  displayName: string;
  onDisplayNameChange: (_displayName: string) => void;
  conzon?: ArcheZON;
};

const CreateCorZON = forwardRef<CreateCorZONRef, CreateCorZONProps>(
  ({ displayName, onDisplayNameChange, conzon }, ref) => {
    const [form, setForm] = useState<ArcheZON>(
      conzon ||
        krisConZON || {
          meta: {
            version: '1.0.0',
            created_at: new Date().toISOString(),
            last_updated: new Date().toISOString(),
          },
          identity: {
            name: '',
            language: 'pl',
            self_sentence: '',
            labels: [],
          },
          style: {
            tone: 'neutral',
            emoji: true,
            length: 'medium',
          },
          cognition: {
            stream_self: false,
            rules: [],
            protections: [],
            triggers: [],
          },
          current_state: {
            mood: null,
            energy: null,
            openness: null,
            risk: null,
          },
          meta_self: {
            self_awareness: {
              index: 1,
              milestones: [],
            },
            belief_index: {
              faith: [],
              hope: [],
              love: [],
            },
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
        >
          <Input
            label="Display Name"
            value={displayName}
            onChange={onDisplayNameChange}
          />
        </IdentitySection>
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
        <MetaSelfSection
          value={form.meta_self}
          onChange={v => setForm(f => ({ ...f, meta_self: v }))}
        />
        {/* <MetaSection
        value={form.meta}
        onChange={v => setForm(f => ({ ...f, meta: v }))}
      /> */}
      </div>
    );
  },
);

CreateCorZON.displayName = 'CreateCorZON';

export default CreateCorZON;
