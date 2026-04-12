import { useEffect, useRef, useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { api } from '../api';

const starterPrompts = [
  'Explain contraception options for a 19-year-old in simple language.',
  'How can I manage stress and overthinking during exams?',
  'What does my menstrual cycle fertile window mean?',
  'Help me present Nsobanuza as a confidential youth health platform in Rwanda.'
];

const projectPitchPrompt = `Act as a confident product presenter. Help me present Nsobanuza as a confidential youth-focused digital health ecosystem for Rwanda. Explain it as a combination of Instagram and YouTube for trusted health education, with a scrolling home feed of approved posts and muted health videos, a multilingual chatbot that supports Kinyarwanda, English, French, and Swahili, a verified professional marketplace with KYC, pricing, and ratings, an adaptive menstrual and wellness tracker that learns cycle patterns, a health library, free mode supported by ads and partner campaigns, and strong privacy through usernames, minimal data collection, and encrypted consultations. Keep the tone clear, persuasive, modern, and investor-friendly.`;

export default function Chat() {
  const { t, language } = useLanguage();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [chatInfo, setChatInfo] = useState({ provider: null, model: null, configured: false, reason: null });
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const setAssistantMessage = (text) => {
    setMessages((current) => {
      const next = [...current];
      for (let index = next.length - 1; index >= 0; index -= 1) {
        if (next[index].role === 'assistant') {
          next[index] = { ...next[index], text };
          return next;
        }
      }

      return [...next, { role: 'assistant', text }];
    });
  };

  const sendPrompt = async (promptText) => {
    if (!promptText.trim() || isLoading) {
      return;
    }

    const nextHistory = [...messages, { role: 'user', text: promptText }];
    setMessages([...nextHistory, { role: 'assistant', text: '' }]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await api.stream('/chat/stream', {
        message: promptText,
        language,
        history: messages
      });

      if (!response.ok || !response.body) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || 'Failed to get AI response');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      let streamedText = '';

      while (true) {
        const { value, done } = await reader.read();
        buffer += decoder.decode(value || new Uint8Array(), { stream: !done });

        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (!line.trim()) {
            continue;
          }

          const event = JSON.parse(line);
          if (event.type === 'meta') {
            setChatInfo({
              provider: event.provider || null,
              model: event.model || null,
              configured: Boolean(event.configured),
              reason: event.reason || null
            });
          }

          if (event.type === 'delta') {
            streamedText += event.text || '';
            setAssistantMessage(streamedText);
          }

          if (event.type === 'error') {
            throw new Error(event.message || t('chatError'));
          }
        }

        if (done) {
          break;
        }
      }

      if (buffer.trim()) {
        const event = JSON.parse(buffer);
        if (event.type === 'meta') {
          setChatInfo({
            provider: event.provider || null,
            model: event.model || null,
            configured: Boolean(event.configured),
            reason: event.reason || null
          });
        }

        if (event.type === 'delta') {
          streamedText += event.text || '';
          setAssistantMessage(streamedText);
        }

        if (event.type === 'error') {
          throw new Error(event.message || t('chatError'));
        }
      }

      if (!streamedText.trim()) {
        setAssistantMessage(t('chatError'));
      }
    } catch (err) {
      console.error('Chat error:', err);
      setAssistantMessage(t('chatError'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    await sendPrompt(input);
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(15,118,110,0.14),_transparent_26%),linear-gradient(180deg,_#f8f7f3_0%,_#eef5f3_58%,_#ffffff_100%)] px-4 pb-28 pt-4">
      <div className="mx-auto grid max-w-6xl gap-6 xl:grid-cols-[0.72fr_1.28fr]">
        <aside className="space-y-6">
          <section className="rounded-[2rem] bg-[linear-gradient(135deg,_#0f766e_0%,_#115e59_45%,_#132238_100%)] p-6 text-white shadow-[0_24px_70px_rgba(15,118,110,0.22)]">
            <p className="text-[11px] uppercase tracking-[0.24em] text-emerald-100">AI presentation and support</p>
            <h2 className="mt-4 text-3xl font-semibold leading-tight">Ask sensitive health questions without judgment.</h2>
            <p className="mt-4 text-sm leading-8 text-emerald-50/90">
              Use the chatbot for SRH, mental health, relationships, menstrual tracking guidance, or project presentation help.
            </p>
            <div className="mt-6 rounded-[1.6rem] border border-white/12 bg-white/10 p-4 text-sm leading-7 text-white/90 backdrop-blur">
              <p className="font-semibold">Project presentation prompt</p>
              <p className="mt-3 text-white/85">{projectPitchPrompt}</p>
              <button
                type="button"
                onClick={() => setInput(projectPitchPrompt)}
                className="mt-4 rounded-full bg-white px-4 py-2 text-xs font-semibold text-slate-950"
              >
                Use this prompt
              </button>
            </div>
          </section>

          <section className="rounded-[2rem] border border-white/70 bg-white/92 p-6 shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
            <h3 className="text-lg font-semibold text-slate-950">Starter prompts</h3>
            <div className="mt-4 space-y-3">
              {starterPrompts.map((prompt) => (
                <button
                  key={prompt}
                  type="button"
                  onClick={() => sendPrompt(prompt)}
                  className="w-full rounded-[1.5rem] border border-slate-200 bg-slate-50 px-4 py-4 text-left text-sm leading-7 text-slate-700 transition hover:border-[var(--nsobanuza-primary)] hover:bg-white"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </section>

          <section className="rounded-[2rem] border border-white/70 bg-white/92 p-6 shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
            <h3 className="text-lg font-semibold text-slate-950">Chat status</h3>
            <p className="mt-3 text-sm leading-7 text-slate-600">
              {chatInfo.provider === 'ollama'
                ? `${t('chatStatusOllamaLive')}${chatInfo.model ? ` ${chatInfo.model}.` : '.'}`
                : chatInfo.provider === 'gemini'
                ? `${t('chatStatusGeminiLive')}${chatInfo.model ? ` ${chatInfo.model}.` : '.'}`
                : chatInfo.provider === 'openai'
                ? `${t('chatStatusOpenAiLive')}${chatInfo.model ? ` ${chatInfo.model}.` : '.'}`
                : chatInfo.provider === 'huggingface'
                  ? `${t('chatStatusHuggingFaceLive')}${chatInfo.model ? ` ${chatInfo.model}.` : '.'}`
                : chatInfo.provider === 'fallback'
                  ? chatInfo.reason === 'chatbot_disabled'
                    ? t('chatStatusDisabled')
                    : chatInfo.reason === 'ollama_not_configured'
                      ? t('chatStatusOllamaSetup')
                    : chatInfo.reason === 'insufficient_quota'
                      ? t('chatStatusQuotaFallback')
                    : chatInfo.reason === 'invalid_api_key'
                      ? t('chatStatusKeyFallback')
                    : chatInfo.reason === 'connection_error'
                          ? t('chatStatusConnectionFallback')
                          : t('chatStatusBuiltIn')
                  : t('chatStatusSetupLive')}
            </p>
          </section>
        </aside>

        <section className="overflow-hidden rounded-[2.2rem] border border-white/70 bg-white/95 shadow-[0_24px_70px_rgba(15,23,42,0.08)]">
          <div className="border-b border-slate-100 px-6 py-5">
            <p className="text-[11px] uppercase tracking-[0.24em] text-[var(--nsobanuza-primary)]">{t('chat')}</p>
            <h3 className="mt-2 text-2xl font-semibold text-slate-950">Nsobo health assistant</h3>
            <p className="mt-2 text-sm leading-7 text-slate-600">{t('chatLanguageSupport')}</p>
          </div>

          <div ref={scrollRef} className="h-[calc(100vh-310px)] space-y-4 overflow-y-auto px-6 py-6">
            {messages.length === 0 ? (
              <div className="rounded-[1.8rem] bg-slate-50 p-6 text-sm leading-7 text-slate-600">
                {t('chatWelcome') || 'Hello. Ask Nsobo anything about youth health, periods, relationships, or how to present your project.'}
              </div>
            ) : null}

            {messages.map((message, index) => (
              <div key={`${message.role}-${index}`} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[85%] rounded-[1.7rem] px-5 py-4 text-sm leading-7 shadow-sm ${
                    message.role === 'user'
                      ? 'rounded-br-md bg-[var(--nsobanuza-primary)] text-white'
                      : 'rounded-bl-md border border-slate-200 bg-slate-50 text-slate-700'
                  }`}
                >
                  {message.text}
                </div>
              </div>
            ))}

            {isLoading ? (
              <div className="inline-flex rounded-full bg-slate-100 px-4 py-2 text-xs text-slate-500">
                {t('chatTyping')}
              </div>
            ) : null}
          </div>

          <form onSubmit={handleSubmit} className="border-t border-slate-100 px-6 py-5">
            <div className="flex flex-col gap-3 sm:flex-row">
              <textarea
                value={input}
                onChange={(event) => setInput(event.target.value)}
                rows="2"
                placeholder={t('messagePlaceholder') || 'Type your question here...'}
                className="min-h-[88px] flex-1 rounded-[1.7rem] border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-[var(--nsobanuza-primary)] focus:bg-white"
              />
              <button
                type="submit"
                disabled={isLoading}
                className="rounded-[1.7rem] bg-[var(--nsobanuza-primary)] px-6 py-4 text-sm font-semibold text-white transition hover:bg-[var(--nsobanuza-primary-deep)] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {t('sendMessage') || 'Send'}
              </button>
            </div>
          </form>
        </section>
      </div>
    </div>
  );
}
