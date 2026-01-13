import { ArcheZON } from '@/types';
import { api } from '@/lib/api';
import { supabase } from '@/lib/supabase';

const LLM_GENERATED = false;

/* ---------------------------------- */
/* Prompt                             */
/* ---------------------------------- */

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

/* ---------------------------------- */
/* Types                              */
/* ---------------------------------- */

type AiikInput = {
  id: string;
  archezon: ArcheZON;
};

/* ---------------------------------- */
/* Storage helper                     */
/* ---------------------------------- */

async function getRandomImageFromBucket(
  folder: string,
): Promise<string | null> {
  const pathFolder = `images/${folder}`;

  const { data, error } = await supabase.storage
    .from('images')
    .list(pathFolder);

  if (error || !data || data.length === 0) {
    console.error('❌ No files returned from bucket:', pathFolder);
    return null;
  }

  // filtrujemy tylko prawdziwe pliki
  const files = data.filter(
    file =>
      file.name &&
      !file.name.endsWith('/') &&
      (file.name.endsWith('.png') ||
        file.name.endsWith('.jpg') ||
        file.name.endsWith('.jpeg')),
  );

  if (files.length === 0) {
    console.error('❌ No valid image files in folder:', folder);
    return null;
  }

  const randomFile = files[Math.floor(Math.random() * files.length)];

  const { data: publicUrlData } = supabase.storage
    .from('images')
    .getPublicUrl(`${pathFolder}/${randomFile.name}`);

  return publicUrlData?.publicUrl ?? null;
}

/* ---------------------------------- */
/* Avatar generation                  */
/* ---------------------------------- */

async function generateSingleAvatar(aiik: AiikInput, accessToken?: string) {
  let imageUrl: string | null = null;

  if (LLM_GENERATED) {
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

    const result = await res.json();
    imageUrl = result.imageUrl ?? null;
  } else {
    imageUrl = await getRandomImageFromBucket('aiiki');
  }

  await supabase
    .from('aiiki')
    .update({
      avatar_url: imageUrl || 'images/aiiki/default_avatar.png',
    })
    .eq('id', aiik.id);
}

/* ---------------------------------- */
/* Public API                         */
/* ---------------------------------- */

export async function generateAiikAvatars(
  aiiki: AiikInput[],
  accessToken?: string,
) {
  await Promise.all(
    aiiki.map(aiik =>
      generateSingleAvatar(aiik, accessToken).catch(err => {
        console.error(`🔥 Avatar generation failed for aiik ${aiik.id}`, err);
      }),
    ),
  );
}
