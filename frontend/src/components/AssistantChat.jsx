import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Bot } from 'lucide-react';
import api from '../services/api';

export default function AssistantChat() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'assistant', text: 'Bonjour ! Je suis votre assistant stock. Comment puis-je vous aider ?' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const send = async () => {
    if (!input.trim()) return;
    const userMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setLoading(true);

    try {
      const { data } = await api.post('/assistant', { message: userMsg });
      setMessages(prev => [...prev, { role: 'assistant', text: data.reponse }]);
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', text: 'Erreur de connexion.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Bouton flottant */}
      <button
        onClick={() => setOpen(!open)}
        className="fixed bottom-6 right-6 btn btn-primary btn-circle shadow-lg z-50"
      >
        {open ? <X size={20} /> : <MessageCircle size={20} />}
      </button>

      {/* Fenêtre de chat */}
      {open && (
        <div className="fixed bottom-20 right-6 w-80 bg-base-100 rounded-2xl shadow-2xl z-50 flex flex-col border border-base-300" style={{ height: '420px' }}>
          {/* Header */}
          <div className="bg-primary text-primary-content rounded-t-2xl p-3 flex items-center gap-2">
            <Bot size={18} />
            <span className="font-semibold text-sm">Assistant Stock</span>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-2">
            {messages.map((msg, i) => (
              <div key={i} className={`chat ${msg.role === 'user' ? 'chat-end' : 'chat-start'}`}>
                <div className={`chat-bubble text-sm ${msg.role === 'user' ? 'chat-bubble-primary' : 'chat-bubble-accent'}`}>
                  {msg.text}
                </div>
              </div>
            ))}
            {loading && (
              <div className="chat chat-start">
                <div className="chat-bubble chat-bubble-accent text-sm">
                  <span className="loading loading-dots loading-xs"></span>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="p-3 border-t border-base-300 flex gap-2">
            <input
              className="input input-bordered input-sm flex-1 text-sm"
              placeholder="Posez une question..."
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && send()}
            />
            <button className="btn btn-primary btn-sm btn-square" onClick={send}>
              <Send size={14} />
            </button>
          </div>
        </div>
      )}
    </>
  );
}