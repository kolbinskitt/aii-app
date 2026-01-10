import { version } from '@/version';

export default function AppVersion() {
  return <div className="text-sm text-muted-foreground">Wersja {version}</div>;
}
