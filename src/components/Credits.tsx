'use client';

import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, Table } from '@/components/ui';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { format } from 'date-fns';
import { supabase } from '@/lib/supabase';

const PRECISION = 100000;

export default function Credits() {
  const { data, isLoading } = useQuery({
    queryKey: ['credits-usage'],
    queryFn: async () => {
      const fromDate = new Date();
      fromDate.setDate(fromDate.getDate() - 30);

      const { data, error } = await supabase
        .from('credits_usage')
        .select('*')
        .gte('created_at', fromDate.toISOString())
        .order('created_at', { ascending: false });

      if (error) throw error;

      // 🔵 Grupowanie po dacie (do wykresu)
      const chartMap: Record<string, number> = {};
      data.forEach(entry => {
        const date = format(new Date(entry.created_at), 'yyyy-MM-dd');
        chartMap[date] = (chartMap[date] || 0) + entry.credits_used;
      });

      const chart = Object.entries(chartMap).map(([date, credits]) => ({
        date,
        credits: Math.round(credits * PRECISION) / PRECISION,
      }));

      return {
        chart,
        table: data,
      };
    },
  });

  if (isLoading) return <div className="p-4">Loading...</div>;

  return (
    <div className="space-y-6 w-full">
      <Card>
        <CardContent>
          <h2 className="text-xl font-semibold mb-2">
            Zużycie kredytów — ostatnie 30 dni
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data?.chart}>
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="credits"
                stroke="#8884d8"
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <h2 className="text-xl font-semibold mb-2">Szczegóły zużyć</h2>
          <Table
            columns={[
              {
                title: 'Data',
                dataIndex: 'created_at',
                key: 'created_at',
                render: (value: string) =>
                  format(new Date(value), 'yyyy-MM-dd HH:mm'),
              },
              {
                title: 'Kredyty',
                dataIndex: 'credits_used',
                key: 'credits_used',
              },
              {
                title: 'Cel',
                dataIndex: ['meta', 'purpose'],
                key: 'purpose',
                render: (value: string) => value ?? '—',
              },
            ]}
            dataSource={data?.table}
          />
        </CardContent>
      </Card>
    </div>
  );
}
