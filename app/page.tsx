'use client';

import { useState } from 'react';

type Mode = 'chat' | 'image' | 'video';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  type: Mode;
  mediaUrl?: string;
}

export default function Home() {
  const [input, setInput] = useState('');
  const [mode, setMode] = useState<Mode>('chat');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      type: mode,
    };

    setMessages((prev) => [...prev, userMsg]);
    const currentInput = input;
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: currentInput, mode }),
      });

      const data = await res.json();

      const assistantMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.text || data.error || 'No response returned.',
        mediaUrl: data.mediaUrl,
        type: mode,
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: `Network error: ${err.message}`,
          type: mode,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-slate-900 text-slate-100">
      <header className="border-b border-slate-800 p-4 text-center">
        <h1 className="text-xl font-bold text-blue-400">AI Studio</h1>
      </header>

      <div className="flex justify-center gap-2 p-4 bg-slate-950">
        {(['chat', 'image', 'video'] as Mode[]).map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => setMode(m)}
            className={`px-4 py-2 rounded-xl text-sm font-semibold capitalize ${
              mode === m ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400'
            }`}
          >
            {m === 'chat' && '💬 Chat'}
            {m === 'image' && '🎨 Image'}
            {m === 'video' && '🎬 Video'}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 max-w-3xl w-full mx-auto">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex flex-col ${
              msg.role === 'user' ? 'items-end' : 'items-start'
            }`}
          >
            <div
              className={`max-w-md rounded-2xl px-4 py-3 text-sm ${
                msg.role === 'user'
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-800 text-slate-200 border border-slate-700'
              }`}
            >
              {msg.content && <p>{msg.content}</p>}
              {msg.mediaUrl && msg.type === 'image' && (
                <img src={msg.mediaUrl} alt="AI Result" className="mt-3 rounded-lg w-full" />
              )}
              {msg.mediaUrl && msg.type === 'video' && (
                <video src={msg.mediaUrl} controls autoPlay loop className="mt-3 rounded-lg w-full" />
              )}
            </div>
          </div>
        ))}
        {loading && <div className="text-slate-400 text-sm">Thinking...</div>}
      </div>

      <div className="p-4 border-t border-slate-800 bg-slate-950">
        <form onSubmit={handleSubmit} className="max-w-3xl mx-auto flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={`Type a prompt for ${mode}...`}
            className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-100"
          />
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 text-white px-6 py-3 rounded-xl"
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
}
