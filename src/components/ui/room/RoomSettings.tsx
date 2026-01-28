import { FC, useState } from 'react';
import { Button, Input, Textarea, Tile } from '@/components/ui';
import { RoomWithMessages } from '@/types';
import { supabase } from '@/lib/supabase';
import { message } from 'antd';

type Props = {
  room: RoomWithMessages;
  onSave: () => void;
};

export const RoomSettings: FC<Props> = ({ room, onSave }) => {
  const [messageApi, contextHolder] = message.useMessage();

  const [name, setName] = useState(room.name ?? '');
  const [description, setDescription] = useState(room.description ?? '');
  //   const [visibility, setVisibility] = useState(room.visibility ?? 'private');
  //   const [accessControl, setAccessControl] = useState(
  //     room.access_control ?? 'require_login',
  //   );
  //   const [readOnly, setReadOnly] = useState(room.read_only ?? false);
  //   const [qrEnabled, setQrEnabled] = useState(room.qr_enabled ?? true);
  //   const [tags, setTags] = useState<string[]>(room.tags ?? []);

  const handleSave = async () => {
    const { error } = await supabase
      .from('rooms')
      .update([
        {
          name,
          description,
        },
      ])
      .eq('id', room.id);
    onSave();

    if (error) {
      messageApi.open({
        type: 'error',
        content: 'Błąd podczas zapisu',
      });
    } else {
      messageApi.open({
        type: 'success',
        content: 'Zapisano ustawienia pokoju',
      });
    }
  };

  return (
    <Tile>
      {contextHolder}
      <div className="space-y-4">
        <Input label="Nazwa pokoju" value={name} onChange={setName} />
        <Textarea
          label="Opis pokoju"
          value={description}
          onChange={setDescription}
        />
        <div className="flex justify-between">
          <div />
          <Button onClick={handleSave} className="mt-0" kind="submit">
            Zapisz
          </Button>
        </div>
      </div>
    </Tile>
  );
};
