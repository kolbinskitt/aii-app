import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, Section } from '@/components/ui';
import { Avatar } from 'antd';
import { Link } from 'react-router-dom';
import { supabase } from '@/lib/supabase';

export default function Aiiki() {
  const { data, isLoading } = useQuery({
    queryKey: ['aiiki'],
    queryFn: async () => {
      const { data, error } = await supabase.from('aiiki').select('*');
      if (error) throw error;
      return data;
    },
  });

  if (isLoading) return <div className="p-4">Loading aiiki...</div>;

  return (
    <div className="space-y-4">
      <Card>
        <CardContent>
          <Section className="my-0">Twoje Aiiki</Section>
        </CardContent>
      </Card>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {data?.map(aiik => (
          <Link to={`/aiiki/${aiik.id}`}>
            <Card key={aiik.id}>
              <CardContent className="flex flex-col items-center text-center space-y-2">
                <Avatar src={aiik.avatar_url} size={64} />
                <div className="text-lg font-semibold">{aiik.name}</div>
                <div className="text-sm text-muted">{aiik.description}</div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
