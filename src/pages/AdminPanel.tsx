import { useEffect, useState } from 'react';
import { Button, Textarea, Popup, Tabs, Section, Card } from '@/components/ui';
import { message, Table } from 'antd';
import { ColumnsType } from 'antd/es/table';
import { FractalNode } from '@/types';
import useUser from '@/hooks/useUser';
import { supabase } from '@/lib/supabase';
import { api } from '@/lib/api';
import { useAccessToken } from '@/hooks/useAccessToken';

export default function AdminPanel() {
  const { user } = useUser();
  const [data, setData] = useState<FractalNode[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [jsonInput, setJsonInput] = useState('');
  const [activeTab, setActiveTab] = useState<'tags' | 'traits'>('tags');
  const accessToken = useAccessToken();

  const fetchData = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('fractal_node')
      .select('*')
      .in('type', ['tag', 'trait'])
      .order('content');
    setData(data || []);
    setLoading(false);
  };

  const openEditModal = () => {
    const editable = data
      .filter(d => d.type === (activeTab === 'tags' ? 'tag' : 'trait'))
      .map(
        ({
          id: _id,
          user_id: _user_id,
          aiik_id: _aiik_id,
          room_id: _room_id,
          embedding: _embedding,
          created_at: _created_at,
          ...rest
        }) => rest,
      );

    setJsonInput(JSON.stringify(editable, null, 2));
    setIsModalVisible(true);
  };

  const saveJson = async () => {
    try {
      setSaving(true);
      const parsed: FractalNode[] = JSON.parse(jsonInput);

      await supabase
        .from('fractal_node')
        .delete()
        .in('type', [activeTab === 'tags' ? 'tag' : 'trait']);

      await Promise.all(
        parsed.map(async item => {
          const embeddingRes = await api('generate-embedding', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${accessToken}`,
            },
            body: JSON.stringify({ text: item.content }),
          });

          if (!embeddingRes.ok)
            throw new Error(`Embedding failed for: ${item.content}`);

          const { embedding } = await embeddingRes.json();

          const { error } = await supabase.from('fractal_node').insert({
            ...item,
            embedding,
          });

          if (error) throw new Error(`Insert error for: ${item.content}`);
        }),
      );

      message.success('Zaktualizowano dane.');
      setIsModalVisible(false);
      setJsonInput('');
      fetchData();
    } catch (err) {
      message.error(`Błąd: ${err}`);
    } finally {
      setSaving(false);
    }
  };

  const columns: ColumnsType<FractalNode> = [
    { title: 'Type', dataIndex: 'type' },
    { title: 'Content', dataIndex: 'content' },
    { title: 'Interpretation', dataIndex: 'interpretation' },
    { title: 'Reason', dataIndex: 'reason' },
    { title: 'Weight', dataIndex: 'weight' },
  ];

  useEffect(() => {
    if (user?.role === 'admin') fetchData();
  }, [user?.auth_id]);

  if (user?.role !== 'admin') return null;

  return (
    <>
      <Card>
        <Section>Admin Panel</Section>
        <Button kind="primary" onClick={openEditModal}>
          Edycja
        </Button>
        <Tabs
          key={activeTab}
          onChange={key => setActiveTab(key as 'tags' | 'traits')}
          tabs={[
            {
              key: 'tags',
              label: 'Tags',
              children: (
                <Table
                  dataSource={data.filter(d => d.type === 'tag')}
                  columns={columns}
                  rowKey="id"
                  loading={loading}
                />
              ),
            },
            {
              key: 'traits',
              label: 'Traits',
              children: (
                <Table
                  dataSource={data.filter(d => d.type === 'trait')}
                  columns={columns}
                  rowKey="id"
                  loading={loading}
                />
              ),
            },
          ]}
        />
      </Card>
      <Popup
        title="Wklej JSON tagów/traitsów"
        isOpen={isModalVisible}
        primaryActions={
          <Button
            kind="submit"
            onClick={saveJson}
            disabled={saving}
            loading={saving}
          >
            Zapisz
          </Button>
        }
        secondaryActions={
          <Button disabled={saving} onClick={() => setIsModalVisible(false)}>
            Anuluj
          </Button>
        }
      >
        <Textarea
          value={jsonInput}
          onChange={setJsonInput}
          rows={18}
          placeholder="Wklej tutaj JSON..."
        />
      </Popup>
    </>
  );
}
