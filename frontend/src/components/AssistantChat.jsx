import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Bot, RefreshCw } from 'lucide-react';
import api from '../services/api';

export default function AssistantChat() {
  const user = JSON.parse(localStorage.getItem('user'))
  const STORAGE_KEY = `assistant_messages_${user?.idUtilisateur ?? 'guest'}`

  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      return saved ? JSON.parse(saved) : [
        { role: 'assistant', text: `Bonjour ${user?.prenom} ! Je suis votre assistant stock. Comment puis-je vous aider ?` }
      ]
    } catch {
      return [{ role: 'assistant', text: `Bonjour ${user?.prenom} ! Je suis votre assistant stock. Comment puis-je vous aider ?` }]
    }
  });
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Sauvegarde automatique dans localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(messages))
  }, [messages]);

  const resetChat = () => {
    const initial = [{ role: 'assistant', text: `Bonjour ${user?.prenom} ! Je suis votre assistant stock. Comment puis-je vous aider ?` }]
    setMessages(initial)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(initial))
  }

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
      {/* 🧁 Bouton flottant cupcake */}
      <button
        onClick={() => setOpen(!open)}
        className="fixed bottom-6 right-6 btn btn-primary btn-circle shadow-xl z-50 w-14 h-14"
      >
        {open ? <X size={22} /> : <MessageCircle size={22} />}
      </button>

      {open && (
        <div
          className="fixed bottom-24 right-6 bg-base-100 rounded-2xl shadow-2xl z-50 flex flex-col border border-base-300 overflow-hidden"
          style={{ width: 340, height: 460 }}
        >
          {/* 🧁 Header cupcake */}
          <div className="bg-primary text-primary-content p-4 flex items-center gap-3 shrink-0 relative overflow-hidden">
            {/* bulles pastel décoratives */}
            <div className="absolute -top-4 -right-4 w-20 h-20 rounded-full bg-secondary/30 blur-xl pointer-events-none" />
            <div className="absolute -bottom-2 left-1/3 w-16 h-16 rounded-full bg-accent/25 blur-xl pointer-events-none" />

            <div className="w-8 h-8 rounded-2xl bg-white/25 flex items-center justify-center relative z-10">
              <Bot size={18} />
            </div>
            <div className="flex-1 relative z-10">
              <p className="font-bold text-sm leading-tight">Assistant Stock</p>
              <p className="text-xs opacity-70">GestStock SN</p>
            </div>
            <div className="flex items-center gap-2 relative z-10">
              <div className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
                <span className="text-xs opacity-80">En ligne</span>
              </div>
              {/* Bouton actualiser */}
              <button
                onClick={resetChat}
                className="btn btn-ghost btn-xs btn-circle text-primary-content hover:bg-white/20"
                title="Nouvelle conversation"
              >
                <RefreshCw size={14} />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3 bg-base-200/30">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} gap-2`}>
                {msg.role === 'assistant' && (
                  <div className="w-7 h-7 rounded-2xl bg-primary text-primary-content flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                    <Bot size={12} />
                  </div>
                )}
                <div className={`
                  max-w-[75%] px-3 py-2 rounded-2xl text-sm leading-relaxed shadow-sm
                  ${msg.role === 'user'
                    ? 'bg-secondary text-secondary-content rounded-br-sm'
                    : 'bg-base-100 text-base-content border border-base-200 rounded-bl-sm'
                  }
                `}>
                  <span dangerouslySetInnerHTML={{ __html: msg.text
  .replace(/\n/g, '<br/>')
  .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
  .replace(/^(\d+)\.\s/gm, '<br/><strong>$1.</strong> ')
  .replace(/^[-•]\s/gm, '<br/>• ')
}} />
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start gap-2">
                <div className="w-7 h-7 rounded-2xl bg-primary text-primary-content flex items-center justify-center shrink-0 shadow-sm">
                  <Bot size={12} />
                </div>
                <div className="bg-base-100 border border-base-200 px-4 py-3 rounded-2xl rounded-bl-sm shadow-sm">
                  <span className="loading loading-dots loading-xs text-primary" />
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="p-3 border-t border-base-200 bg-base-100 shrink-0">
            <div className="flex gap-2 items-center">
              <input
                className="input input-bordered input-sm flex-1 text-sm bg-base-200 border-0 focus:outline-primary"
                placeholder="Posez une question..."
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && send()}
              />
              <button
                className="btn btn-primary btn-sm btn-square"
                onClick={send}
                disabled={!input.trim()}
              >
                <Send size={14} />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}