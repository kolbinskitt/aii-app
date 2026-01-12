import useUserCredits from '@/hooks/useUserCredits';

export default function CreditsPreview() {
  const { credits, loading } = useUserCredits();

  return !loading && credits !== null ? (
    <div className="text-sm">
      Credits: <span className="font-semibold">{credits}</span>
    </div>
  ) : null;
}
