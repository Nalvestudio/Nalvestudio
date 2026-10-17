'use client';
import { useEffect, useRef, useState, type FormEvent } from 'react';

const WHATSAPP_URL = 'https://wa.me/5492215730729';
const TEASER_KEY = 'nalv_bot_v1_t';

const MESSAGE_ROLE = { ME: 'me', BOT: 'bot' } as const;
type MessageRole = (typeof MESSAGE_ROLE)[keyof typeof MESSAGE_ROLE];

interface BotLink {
  label: string;
  href: string;
}

interface BotMessage {
  id: number;
  role: MessageRole;
  text: string;
  links?: BotLink[];
}

const GREETING = '¡Buenas! Soy **TONY**. Te respondo corto y con datos reales de la tienda: precios, medidas, envíos, pagos y pedidos. ¿Qué querés saber?';

/** Renders the legacy "**bold**" markup without injecting HTML. */
function BotText({ text }: { text: string }) {
  return (
    <>
      {text.split(/(\*\*.+?\*\*)/g).map((part, i) =>
        part.startsWith('**') && part.endsWith('**') ? <b key={i}>{part.slice(2, -2)}</b> : <span key={i}>{part}</span>,
      )}
    </>
  );
}

/** Floating store assistant "TONY" (port of the legacy js/bot.js widget UI). */
export function ChatBot() {
  const [open, setOpen] = useState(false);
  const [teaser, setTeaser] = useState(false);
  const [messages, setMessages] = useState<BotMessage[]>([]);
  const [input, setInput] = useState('');
  const msgsRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const seq = useRef(0);

  useEffect(() => {
    let showTimer: ReturnType<typeof setTimeout> | undefined;
    let hideTimer: ReturnType<typeof setTimeout> | undefined;
    try {
      if (!sessionStorage.getItem(TEASER_KEY)) {
        sessionStorage.setItem(TEASER_KEY, '1');
        showTimer = setTimeout(() => {
          setTeaser(true);
          hideTimer = setTimeout(() => setTeaser(false), 6000);
        }, 5000);
      }
    } catch {
      /* no storage available */
    }
    return () => {
      clearTimeout(showTimer);
      clearTimeout(hideTimer);
    };
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('keydown', onKey);
    const t = setTimeout(() => inputRef.current?.focus({ preventScroll: true }), 50);
    return () => {
      document.removeEventListener('keydown', onKey);
      clearTimeout(t);
    };
  }, [open]);

  useEffect(() => {
    if (msgsRef.current) msgsRef.current.scrollTop = msgsRef.current.scrollHeight;
  }, [messages]);

  const push = (role: MessageRole, text: string, links?: BotLink[]) =>
    setMessages((prev) => [...prev, { id: ++seq.current, role, text, links }]);

  const toggle = () => {
    if (open) {
      setOpen(false);
      setMessages([]);
      return;
    }
    setOpen(true);
    setTeaser(false);
    push(MESSAGE_ROLE.BOT, GREETING);
  };

  const ask = (e: FormEvent) => {
    e.preventDefault();
    const text = input.trim();
    if (!text) return;
    push(MESSAGE_ROLE.ME, text);
    setInput('');
    // TODO(backend): send { message, page } to the legacy /api/bot endpoint and render its text, links and chips.
    push(MESSAGE_ROLE.BOT, 'Próximamente voy a poder responderte desde acá. Mientras tanto, escribinos por WhatsApp.', [
      { label: 'WhatsApp', href: WHATSAPP_URL },
    ]);
  };

  return (
    <div className={'cbot' + (open ? ' open' : '')}>
      <div className="cbot-teaser" id="cbot-teaser" hidden={!teaser}>
        ¿Dudas? Preguntale a <b>TONY</b> 👋
      </div>
      <button type="button" className="cbot-fab" id="cbot-fab" aria-label="Abrir ayuda" onClick={toggle}>
        <span className="cbot-ico" aria-hidden="true">
          💬
        </span>
        <span className="cbot-fab-name">¿Dudas?</span>
      </button>
      <section className="cbot-panel" id="cbot-panel" role="dialog" aria-label="Asistente de la tienda" hidden={!open}>
        <header className="cbot-head">
          <div className="cbot-avatar" aria-hidden="true">
            🗯️
          </div>
          <div>
            <strong id="cbot-name">TONY</strong>
            <small>bot de nalv.estudio · respuestas cortas, datos reales</small>
          </div>
          <button type="button" className="cbot-x" id="cbot-x" aria-label="Cerrar" onClick={toggle}>
            ✕
          </button>
        </header>
        <div className="cbot-msgs" id="cbot-msgs" aria-live="polite" ref={msgsRef}>
          {messages.map((m) => (
            <div key={m.id} className={'cbot-msg ' + m.role}>
              {m.role === MESSAGE_ROLE.BOT ? <BotText text={m.text} /> : m.text}
              {m.links?.length ? (
                <div className="cbot-links">
                  {m.links.map((l) => (
                    <a key={l.href} href={l.href} target="_blank" rel="noopener">
                      {l.label}
                    </a>
                  ))}
                </div>
              ) : null}
            </div>
          ))}
        </div>
        <div className="cbot-chips" id="cbot-chips" />
        <form className="cbot-form" id="cbot-form" autoComplete="off" onSubmit={ask}>
          <input
            id="cbot-in"
            ref={inputRef}
            type="text"
            maxLength={300}
            placeholder="Preguntame sobre precios, envíos, medidas…"
            aria-label="Tu pregunta"
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
          <button type="submit" aria-label="Enviar">
            ➤
          </button>
        </form>
        <div className="cbot-foot">
          Solo respondo sobre nalv.estudio. Para lo demás,{' '}
          <a href={WHATSAPP_URL} target="_blank" rel="noopener">
            WhatsApp
          </a>
          .
        </div>
      </section>
    </div>
  );
}
