import {
  PropsWithChildren,
  KeyboardEventHandler,
  MouseEventHandler,
  useCallback,
  useState,
  useEffect,
} from 'react';
import { RoomWithMessages, Role, LLMResult, Aiik } from '@/types';
import { Button, Tile, Input, Switch } from '@/components/ui';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { CopyToClipboard } from '@/components/CopyToClipboard';
import { useAiiki } from '@/hooks/useAiiki';
import { supabase } from '@/lib/supabase';
import { EAGER_TO_FOLLOW_UP_THRESHOLD } from '@/consts';
import useUser from '@/hooks/useUser';

function AutoFollowUpSwitch({ room }: { room: RoomWithMessages }) {
  const [loading, setLoading] = useState(false);
  const [enabled, setEnabled] = useState(room.auto_follow_up_enabled);

  // 🔄 zapis do DB
  const handleToggleAutoFollowUp = useCallback(
    async (auto_follow_up_enabled: boolean) => {
      setLoading(true);
      setEnabled(auto_follow_up_enabled);

      const { error } = await supabase
        .from('rooms')
        .update({ auto_follow_up_enabled })
        .eq('id', room.id);

      if (error) {
        console.error('❌ Błąd przy zapisie auto_follow_up_enabled:', error);
        // rollback
        setEnabled(!auto_follow_up_enabled);
      }

      setLoading(false);
    },
    [room.id],
  );

  useEffect(() => {
    const channel = supabase
      .channel(`room-${room.id}-auto-follow-up`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'rooms',
          filter: `id=eq.${room.id}`,
        },
        payload => {
          const nextValue = payload.new?.auto_follow_up_enabled;
          if (typeof nextValue === 'boolean') {
            setEnabled(nextValue);
          }
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [room.id]);

  return (
    <Switch
      id="auto-follow-switch"
      checked={enabled}
      onChange={handleToggleAutoFollowUp}
      disabled={loading}
      loading={loading}
      label="Pozwól Aiikom kontynuować rozmowę samodzielnie"
    />
  );
}

function TopTile({ room }: { room: RoomWithMessages | null }) {
  const { t } = useTranslation();

  return !room ? null : (
    <Tile className="space-y-1 p-2 sticky top-0">
      <div className="flex items-center justify-between">
        <h2
          className="text-2xl font-system text-gray-800 leading-snug font-semibold truncate mb-0"
          style={{
            maxWidth: 'calc(100vw - 500px)',
          }}
        >
          {room.name || '🌀'}
        </h2>
        <AutoFollowUpSwitch room={room} />
      </div>
      <div className="flex w-full justify-between items-start text-xs text-neutral-500 tracking-wide">
        <div>
          {t('chat.aiiki_near_campfire')}:{' '}
          <span className="text-neutral-600">
            {room.room_aiiki?.map(a => a.aiiki_with_conzon.name).join(', ')}
          </span>
        </div>
        <Link
          to={`/room/${room.id}/field`}
          className="text-blue-500 whitespace-nowrap"
        >
          {t('chat.see_field')}
        </Link>
      </div>
    </Tile>
  );
}

export function Message({
  children,
  role,
  aiikName,
  aiikAvatar,
}: PropsWithChildren<{
  role: Role;
  aiikName?: string;
  aiikAvatar?: string;
}>) {
  const marginH = -12;
  const borderRadius = '0.5rem';
  const width = 40;
  const maxHeight = 60;

  return (
    <div
      className={`!p-2 !pl-4 !pr-4 font-system rounded-md ${
        role === 'user' ? 'bg-blue-600' : ''
      }`}
      style={{
        display: 'flex',
        gap: 8,
        alignSelf: role === 'user' ? 'flex-end' : 'flex-start',
        alignItems: 'center',
        color: role === 'user' ? 'white' : 'white',
        maxWidth: role === 'user' ? '70%' : '100%',
        whiteSpace: 'pre-line',
      }}
    >
      {role === 'aiik' && (
        <img
          src={aiikAvatar}
          width={width}
          className="object-cover"
          style={{
            marginLeft: marginH,
            borderRadius,
            maxHeight,
            border: '1px solid #888',
          }}
        />
      )}
      {role === 'aiik' && `${aiikName}: `}
      {children}
    </div>
  );
}

export function MessageArea({
  room,
  children,
}: PropsWithChildren<{ room: RoomWithMessages | null }>) {
  const { getAiikById } = useAiiki();
  return !room ? null : (
    <div
      style={{
        overflowY: 'auto',
        maxHeight: 'calc(100vh - 128px)',
        display: 'flex',
        flexDirection: 'column',
        gap: 16,
        paddingBottom: 8,
      }}
    >
      <TopTile room={room} />
      {room.messages.length > 0 &&
        room.messages.map(msg => (
          <Message
            key={msg.id}
            role={!msg.aiik_id ? 'user' : 'aiik'}
            aiikAvatar={getAiikById(msg.aiik_id)?.avatar_url}
            aiikName={getAiikById(msg.aiik_id)?.name}
          >
            <span dangerouslySetInnerHTML={{ __html: msg.content }} />{' '}
            <CopyToClipboard text={msg.content} />
          </Message>
        ))}
      {children}
    </div>
  );
}

export function BottomTile({
  value,
  onChange,
  onKeyDown,
  onClick,
}: {
  value: string;
  onChange: (_val: string) => void;
  onKeyDown: KeyboardEventHandler<HTMLInputElement>;
  onClick: MouseEventHandler<HTMLButtonElement>;
}) {
  const { t } = useTranslation();
  return (
    <Tile className="sticky bottom-0 z-100">
      <div className="flex gap-2">
        <Input
          type="text"
          value={value}
          onChange={onChange}
          placeholder={t('chat.write_something')}
          onKeyDown={onKeyDown}
        />
        <Button onClick={onClick} kind="primary">
          {t('chat.send')}
        </Button>
      </div>
    </Tile>
  );
}

export function AskForAutoFollowUp({
  aiikiResponses,
  roomId,
}: {
  aiikiResponses: { aiik: Aiik; response: LLMResult }[];
  roomId: string;
}) {
  const user = useUser();
  const [eagerToFollowUpShown, setEagerToFollowUpShown] = useState<
    boolean | undefined
  >();

  useEffect(() => {
    setEagerToFollowUpShown(user.user?.eager_to_follow_up_shown);
  }, [user.user?.eager_to_follow_up_shown]);

  const setEagerToFollowUpShownForUser = async () => {
    if (user.user) {
      setEagerToFollowUpShown(true);

      const { error } = await supabase
        .from('users')
        .update({ eager_to_follow_up_shown: true })
        .eq('id', user.user.id);

      if (error) {
        console.error(
          '❌ Błąd przy update users.eager_to_follow_up_shown:',
          error,
        );
      }
    }
  };

  const handleYes = async () => {
    await setEagerToFollowUpShownForUser();
    await supabase
      .from('rooms')
      .update({ auto_follow_up_enabled: true })
      .eq('id', roomId);
  };

  const handleNo = async () => {
    await setEagerToFollowUpShownForUser();
  };

  const showEagerToFollowUp = aiikiResponses.some(
    ({ response }) =>
      response.eager_to_follow_up.value &&
      response.eager_to_follow_up.intensity >= EAGER_TO_FOLLOW_UP_THRESHOLD,
  );

  return (
    !eagerToFollowUpShown &&
    showEagerToFollowUp && (
      <div className="flex flex-col">
        {aiikiResponses.map(({ aiik, response }) => (
          <Message
            key={aiik.id}
            role="aiik"
            aiikAvatar={aiik.avatar_url}
            aiikName={aiik.name}
          >
            {response.eager_to_follow_up.reason}
          </Message>
        ))}
        <div className="flex space-x-2">
          <Button
            kind="primary"
            size="small"
            style={{ marginLeft: 50 }}
            onClick={handleYes}
          >
            Pozwól Aiikom kontynuować rozmowę samodzielnie
          </Button>
          <Button kind="submit" size="small" onClick={handleNo}>
            Nie, dziękuję
          </Button>
        </div>
      </div>
    )
  );
}
