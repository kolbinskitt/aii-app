import { Link } from 'react-router-dom';
import useUserCredits from '@/hooks/useUserCredits';
import { Button } from './ui';

export default function CreditsPreview() {
  const { credits, loading } = useUserCredits();

  return !loading && credits !== null ? (
    <Link to="/credits">
      <Button kind="ghost">
        Credits: <span className="font-semibold">{credits}</span>
      </Button>
    </Link>
  ) : null;
}
