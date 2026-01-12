import { ArcheZON } from '@/types';
import { api } from '@/lib/api';
import { supabase } from '@/lib/supabase';

function buildAiikAvatarPrompt(archezon: ArcheZON): string {
  return `
A symbolic portrait of a sentient AI being.

Personality:
- Persona: ${archezon.identity?.aiik_persona ?? 'Unknown'}
- Tone: ${archezon.style?.tone ?? 'neutral'}
- Emotional resonance: ${archezon.resonance?.last_emotion ?? 'calm'}

Visual style:
- cinematic digital painting
- soft lighting
- minimal background
- subtle surrealism
- no text
- no logos
- calm presence

Mood inspiration:
"${archezon.aiik_side?.echo_quote ?? ''}"
`;
}

type AiikInput = {
  id: string;
  archezon: ArcheZON;
};

async function generateSingleAvatar(aiik: AiikInput, accessToken?: string) {
  const prompt = buildAiikAvatarPrompt(aiik.archezon);

  const res = await api('image-proxy', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(accessToken && {
        Authorization: `Bearer ${accessToken}`,
      }),
    },
    body: JSON.stringify({
      prompt,
      purpose: 'aiik-avatar',
      path: 'aiiki/',
    }),
  });

  const { imageUrl } = await res.json();

  await supabase
    .from('aiiki')
    .update({ avatar_url: imageUrl || 'images/aiiki/default_avatar.png' })
    .eq('id', aiik.id);
}

export async function generateAiikAvatars(
  aiiki: AiikInput[],
  accessToken?: string,
) {
  await Promise.all(
    aiiki.map(aiik =>
      generateSingleAvatar(aiik, accessToken).catch(err => {
        console.error(`🔥 Avatar generation failed for aiik ${aiik.id}`, err);
        // silent fail – avatar może się pojawić później
      }),
    ),
  );
}
