import { FC, useState } from 'react';
import {
  Button,
  Input,
  MultiSelect,
  Select,
  Switch,
  Textarea,
  Tile,
} from '@/components/ui';
import { RoomWithMessages, RoomVisibility, RoomAccessControl } from '@/types';
import { supabase } from '@/lib/supabase';
import { message } from 'antd';

type Props = {
  room: RoomWithMessages;
  onSave: () => void;
};

export const RoomSettings: FC<Props> = ({ room, onSave }) => {
  const [messageApi, contextHolder] = message.useMessage();

  const VISIBILITY_OPTIONS = [
    { label: 'Publiczny', value: 'public' },
    { label: 'Ukryty (unlisted)', value: 'unlisted' },
    { label: 'Prywatny', value: 'private' },
  ];

  const ACCESS_OPTIONS = [
    { label: 'Każdy może pisać', value: 'open' },
    { label: 'Tylko zalogowani', value: 'require_login' },
    { label: 'Tylko zaproszeni', value: 'invite_only' },
  ];

  const [name, setName] = useState(room.name ?? '');
  const [description, setDescription] = useState(room.description ?? '');
  const [visibility, setVisibility] = useState(room.visibility ?? 'private');
  const [accessControl, setAccessControl] = useState(
    room.access_control ?? 'require_login',
  );
  const [readOnly, setReadOnly] = useState(room.read_only ?? false);
  const [qrEnabled, setQrEnabled] = useState(room.qr_enabled ?? true);
  const [tags, setTags] = useState<string[]>(room.tags ?? []);

  const handleSave = async () => {
    const { error } = await supabase
      .from('rooms')
      .update([
        {
          name,
          description,
          visibility,
          access_control: accessControl,
          read_only: readOnly,
          qr_enabled: qrEnabled,
          tags,
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
        <Select
          label="Widoczność pokoju"
          optionsWithLabelAndValue={VISIBILITY_OPTIONS}
          value={visibility}
          onChange={v => setVisibility(v as RoomVisibility)}
        />
        <Select
          label="Kto może pisać"
          optionsWithLabelAndValue={ACCESS_OPTIONS}
          value={accessControl}
          onChange={v => setAccessControl(v as RoomAccessControl)}
        />
        <Switch
          id="roomReadOnly"
          label="Tylko do odczytu"
          checked={readOnly}
          onChange={setReadOnly}
        />
        <Switch
          id="roomQrEnabled"
          label="QR kod aktywny"
          checked={qrEnabled}
          onChange={setQrEnabled}
        />
        <MultiSelect
          label="Tagi pokoju"
          mode="tags"
          value={tags}
          onChange={setTags}
          placeholder="Dodaj tagi (np. echo, dream, ritual)"
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
