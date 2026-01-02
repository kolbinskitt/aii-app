import React, { useState } from 'react';
import RoomView from './RoomView.jsx';

export default function App() {
  const [messages, setMessages] = useState([
    { id: 1, sender: 'aii', text: 'Cześć. Jestem aii. Możemy pomilczeć razem?' }
  ]);
  const [input, setInput] = useState('');

  const sendMessage = () => {
    if (!input.trim()) return;
    const userMsg = { id: Date.now(), sender: 'you', text: input.trim() };
    const aiikReply = { id: Date.now() + 1, sender: 'aii', text: '...' };
    setMessages([...messages, userMsg, aiikReply]);
    setInput('');
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <div className="p-4 font-bold text-xl">pokój: cichość</div>
      <RoomView messages={messages} />
      <div className="p-4 flex gap-2">
        <input
          className="flex-1 border px-2 py-1"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
        />
        <button className="px-4 py-1 border" onClick={sendMessage}>
          ➤
        </button>
      </div>
    </div>
  );
}