import { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { api, getToken } from '../api';

export default function Chat() {
  const { t, language } = useLanguage();
  const [message, setMessage] = useState('');
  const [conversation, setConversation] = useState([
    { role: 'assistant', text: 'Nsobo is here. Ask about SRH, mental health, relationships, contraception, HIV, or periods.' }
  ]);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!message.trim()) return;
    const userMessage = { role: 'user', text: message.trim() };
    setConversation((prev) => [...prev, userMessage]);
    setMessage('');
    setLoading(true);

    const token = getToken();
    const response = await api.post('/chat', { message: userMessage.text, language }, { headers: { Authorization: `Bearer ${token}` } });
    const data = await response.json();
    setLoading(false);
    setConversation((prev) => [...prev, { role: 'assistant', text: data.answer || 'Nsobo could not respond.' }]);
  };

  return (
    <div className="px-4 pb-28 pt-4">
      <div className="rounded-[2rem] bg-white p-4 shadow-sm">
        <div className="mb-4">
          <h2 className="text-xl font-semibold">{t('chat')}</h2>
          <p className="text-sm text-slate-500">{t('messagePlaceholder')}</p>
        </div>
        <div className="space-y-3">
          {conversation.map((item, index) => (
            <div key={index} className={`rounded-3xl p-4 ${item.role === 'assistant' ? 'bg-slate-100 text-slate-900' : 'bg-brand text-white'}`}>
              <p className="text-sm">{item.text}</p>
            </div>
          ))}
        </div>
      </div>
      <form onSubmit={handleSubmit} className="fixed bottom-20 left-0 right-0 z-20 mx-4 flex gap-3 rounded-3xl bg-white p-4 shadow-lg">
        <input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="flex-1 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none"
          placeholder={t('messagePlaceholder')}
        />
        <button type="submit" disabled={loading} className="rounded-2xl bg-brand px-4 py-3 text-white">
          {loading ? '...' : t('sendMessage')}
        </button>
      </form>
    </div>
  );
}
