import { copyToClipboard } from '@/helpers/copyToClipboard';
import { IconButton, Icon } from './ui';

export function CopyToClipboard({ text }: { text: string }) {
  return (
    <IconButton
      aria-label="Copy to clipboard"
      icon={<Icon name="CopyIcon" size="sm" />}
      onClick={() => copyToClipboard(text)}
    />
  );
}
