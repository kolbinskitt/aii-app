import { Link } from 'react-router-dom';
import useUserCredits from '@/hooks/useUserCredits';

export default function CreditsPreview() {
  const { credits, loading } = useUserCredits();

  return !loading && credits !== null ? (
    <Link to="/credits">
      Credits: <span className="font-semibold">{credits}</span>
    </Link>
  ) : null;
}
