import { api } from '@/lib/api';

export async function generateEmbedding(accessToken: string, text: string) {
  const embeddingRes = await api('generate-embedding', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({ text }),
  });

  if (!embeddingRes.ok) throw new Error('Failed to generate embedding');

  const { embedding } = (await embeddingRes.json()) as {
    embedding: number[];
  };

  if (!Array.isArray(embedding)) throw new Error('Invalid embedding format');

  return embedding;
}
