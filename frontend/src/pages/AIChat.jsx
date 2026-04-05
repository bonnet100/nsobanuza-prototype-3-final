import { useMemo, useState } from 'react';
import { answerChat, getChatExamples, getChatHistory, saveChatHistory } from '../api';
import { useLanguage } from '../contexts/LanguageContext';

export default function AIChat() {
  const { language, t } = useLanguage();
  const [history, setHistory] = useState(() => getChatHistory());
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const examples = useMemo(() => getChatExamples(language), [language]);

  const appendHistory = (nextHistory) => {
    setHistory(nextHistory);
    saveChatHistory(nextHistory);
  };

  const sendMessage = async (rawMessage) => {
    const cleanMessage = rawMessage.trim();
    if (!cleanMessage) return;

    const userItem = {
      id: `user-${Date.now()}`,
      role: 'user',
      text: cleanMessage
    };

    const pendingHistory = [...history, userItem];
    appendHistory(pendingHistory);
    setMessage('');
    setLoading(true);

    const response = await answerChat(cleanMessage, language);
    const assistantItem = {
      id: `assistant-${Date.now()}`,
      role: 'assistant',
      text: response.answer
    };

    appendHistory([...pendingHistory, assistantItem]);
    setLoading(false);
  };

  return (
    <div className="space-y-4">
      <section className="panel p-5">
        <h2 className="text-2xl font-semibold text-slate-900">{t('aiTitle')}</h2>
        <p className="mt-2 text-sm text-slate-500">{t('aiIntro')}</p>
        <div className="mt-4 rounded-[1.25rem] bg-amber-50 p-4 text-sm leading-7 text-amber-900">
          {t('aiDisclaimer')}
        </div>
      </section>

      <section className="panel p-5">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h3 className="text-lg font-semibold text-slate-900">{t('exampleQuestions')}</h3>
          <span className="rounded-full bg-brand-soft px-3 py-1 text-xs font-semibold text-brand-deep">
            Nsobo
          </span>
        </div>
        <div className="grid gap-3 lg:grid-cols-2">
          {examples.map((example) => (
            <button
              key={example.question}
              type="button"
              onClick={() => sendMessage(example.question)}
              className="rounded-[1.25rem] border border-slate-200 bg-slate-50 p-4 text-left transition hover:border-brand"
            >
              <p className="font-semibold text-slate-900">{example.question}</p>
              <p className="mt-2 text-sm leading-6 text-slate-600">{example.answer}</p>
            </button>
          ))}
        </div>
      </section>

      <section className="panel p-5">
        <div className="space-y-3">
          {history.map((item) => (
            <div
              key={item.id}
              className={`max-w-[90%] rounded-[1.5rem] px-4 py-3 text-sm leading-7 ${
                item.role === 'assistant'
                  ? 'bg-slate-100 text-slate-800'
                  : 'ml-auto bg-brand text-white'
              }`}
            >
              {typeof item.text === 'string' ? item.text : item.text[language] || item.text.en}
            </div>
          ))}
          {loading && (
            <div className="max-w-[90%] rounded-[1.5rem] bg-slate-100 px-4 py-3 text-sm text-slate-500">
              {t('typing')}
            </div>
          )}
        </div>

        <form
          onSubmit={(event) => {
            event.preventDefault();
            sendMessage(message);
          }}
          className="mt-5 flex flex-col gap-3 sm:flex-row"
        >
          <input
            type="text"
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            placeholder={t('chatPlaceholder')}
            className="flex-1 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-brand"
          />
          <button
            type="submit"
            disabled={loading}
            className="rounded-2xl bg-brand px-5 py-3 text-sm font-semibold text-white transition hover:bg-brand-deep disabled:cursor-not-allowed"
          >
            {t('send')}
          </button>
        </form>
      </section>
    </div>
  );
}
