'use client'
import { useState } from 'react'

export default function Home() {
  const [mode, setMode] = useState<'chat' | 'image'>('chat')
  const [input, setInput] = useState('')
  const [result, setResult] = useState('')

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

  const handleSubmit = async () => {
    const endpoint = mode === 'chat' ? '/chat' : '/generate-image'
    const res = await fetch(`${API_URL}${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt: input })
    })
    const data = await res.json()
    setResult(mode === 'chat' ? data.response : data.image_url)
  }

  return (
    <main className="min-h-screen p-6 max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">AI Studio</h1>
      
      <div className="flex gap-2 mb-4">
        <button onClick={() => setMode('chat')} className={`px-4 py-2 rounded ${mode==='chat'?'bg-blue-600':'bg-gray-700'}`}>Chat</button>
        <button onClick={() => setMode('image')} className={`px-4 py-2 rounded ${mode==='image'?'bg-blue-600':'bg-gray-700'}`}>Image Gen</button>
      </div>

      <input 
        value={input} 
        onChange={e => setInput(e.target.value)}
        placeholder={mode==='chat'?'Ask me anything...':'Describe an image...'}
        className="w-full p-3 rounded bg-gray-800 mb-4"
      />
      <button onClick={handleSubmit} className="bg-green-600 px-6 py-2 rounded">Send</button>

      <div className="mt-6">
        {mode==='chat' ? <p>{result}</p> : result && <img src={result} className="rounded"/>}
      </div>
    </main>
  )
}
