import {
  PropsWithChildren,
  KeyboardEventHandler,
  MouseEventHandler,
} from 'react';
import { RoomWithMessages, Role } from '@/types';
import { Button, Tile, Input } from '@/components/ui';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { CopyToClipboard } from '@/components/CopyToClipboard';

function TopTile({ room }: { room: RoomWithMessages | null }) {
  const { t } = useTranslation();
  return !room ? null : (
    <Tile className="space-y-1 p-2 sticky top-0 z-10">
      <h2
        className="text-2xl font-echo text-gray-800 leading-snug font-semibold truncate"
        style={{
          maxWidth: 'calc(100vw - 500px)',
        }}
      >
        {room.name || '🌀'}
      </h2>
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
      {room.messages_with_aiik.length === 0 && (
        <div className="text-sm text-muted-foreground">
          {t('chat.no_stories')}
        </div>
      )}
    </Tile>
  );
}

export function Message({
  children,
  role,
  aiikAvatar,
  aiikName,
}: PropsWithChildren<{ role: Role; aiikAvatar: string; aiikName: string }>) {
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
        alignItems: 'flex-start',
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
      {room.messages_with_aiik.length > 0 &&
        room.messages_with_aiik.map(msg => (
          <Message
            key={msg.id}
            role={msg.role}
            aiikAvatar={msg.avatar_url}
            aiikName={msg.aiik_name}
          >
            {msg.text} <CopyToClipboard text={msg.text} />
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
    <Tile
      className="fixed z-100"
      styles={{
        bottom: 14,
        right: 8,
        left: 328,
      }}
    >
      <div className="flex gap-2">
        <Input
          type="text"
          value={value}
          onChange={onChange}
          // className="flex-1 px-4 py-2 border border-neutral-300 rounded-md bg-white
          // focus:outline-none focus:ring-2 focus:ring-orange-400 shadow-sm font-system"
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
