import React from 'react';

export default function RoomView({ messages }) {
  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-2">
      {messages.map((msg) => (
        <div key={msg.id} className={msg.sender === 'you' ? 'text-right' : 'text-left'}>
          <span className={msg.sender === 'you' ? 'bg-gray-200' : 'bg-indigo-100'} style={{ padding: '6px 12px', borderRadius: '12px', display: 'inline-block' }}>
            {msg.text}
          </span>
        </div>
      ))}
    </div>
  );
}