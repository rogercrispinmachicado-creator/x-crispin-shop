import React, { useState, useRef, useEffect } from 'react';
import {
  Sparkles,
  MessageSquare,
  X,
  Send,
  Minimize2,
  Maximize2,
  Trash2,
  Bot,
  User,
  CreditCard,
  QrCode,
  ShieldCheck,
  Truck,
  ExternalLink,
  ChevronDown,
  RefreshCw,
} from 'lucide-react';

interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: string;
  source?: string;
}

interface GeminiChatWidgetProps {
  onNavigate?: (route: string, param?: string) => void;
}

const INITIAL_GREETING: ChatMessage = {
  id: 'greeting',
  role: 'model',
  text: '¡Hola! Soy **X-Bot**, tu asistente inteligente impulsado por **Gemini**. 🌿\n\nPuedo ayudarte con cualquier consulta sobre nuestro catálogo de nutrición **Factor X Company Bolivia**, recomendaciones de salud, precios en Bs. y cómo pagar fácilmente mediante **QR Simple** o transferencia bancaria.\n\n¿Qué te gustaría consultar?',
  timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
};

const SUGGESTED_QUESTIONS = [
  { label: '💳 ¿Cómo pagar con QR Simple?', prompt: '¿Cómo funciona el pago con QR Simple en X-CRISPIN y qué bancos aceptan?' },
  { label: '🌿 Beneficios de la Moringa', prompt: '¿Qué beneficios tiene la Moringa liofilizada de Factor X y cómo se debe consumir?' },
  { label: '🧪 Silimarina y salud hepática', prompt: '¿Para qué sirve la Silimarina con Cardo Mariano y cómo ayuda al hígado?' },
  { label: '🚚 Envíos y cobertura en Bolivia', prompt: '¿Hacen envíos a todos los departamentos de Bolivia y cuánto tarda en llegar?' },
  { label: '📦 ¿Cómo rastreo mi pedido?', prompt: '¿Cómo puedo hacer el seguimiento en tiempo real de mi pedido?' },
];

export const GeminiChatWidget: React.FC<GeminiChatWidgetProps> = ({ onNavigate }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    try {
      const saved = sessionStorage.getItem('xcrispin_gemini_chat');
      return saved ? JSON.parse(saved) : [INITIAL_GREETING];
    } catch {
      return [INITIAL_GREETING];
    }
  });
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [hasUnread, setHasUnread] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Sync to session
  useEffect(() => {
    try {
      sessionStorage.setItem('xcrispin_gemini_chat', JSON.stringify(messages));
    } catch (e) {
      console.warn('Could not save chat messages to session:', e);
    }
  }, [messages]);

  // Scroll to bottom on new messages
  useEffect(() => {
    if (isOpen && !isMinimized) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, isMinimized, isLoading]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen && !isMinimized) {
      setTimeout(() => inputRef.current?.focus(), 200);
      setHasUnread(false);
    }
  }, [isOpen, isMinimized]);

  const handleSendMessage = async (userPrompt?: string) => {
    const textToSend = (userPrompt || inputMessage).trim();
    if (!textToSend || isLoading) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      role: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const newHistory = [...messages, userMsg];
    setMessages(newHistory);
    setInputMessage('');
    setIsLoading(true);

    try {
      // Build history for backend
      const historyPayload = newHistory
        .filter((m) => m.id !== 'greeting')
        .map((m) => ({
          role: m.role,
          text: m.text,
        }));

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: textToSend,
          history: historyPayload.slice(-6),
        }),
      });

      if (!res.ok) {
        throw new Error(`HTTP error ${res.status}`);
      }

      const data = await res.json();
      const replyText = data.reply || 'Disculpa, no pude procesar la respuesta en este momento.';

      const modelMsg: ChatMessage = {
        id: `model-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        role: 'model',
        text: replyText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        source: data.source,
      };

      setMessages((prev) => [...prev, modelMsg]);
      if (!isOpen) {
        setHasUnread(true);
      }
    } catch (err) {
      console.error('Chat error:', err);
      const fallbackMsg: ChatMessage = {
        id: `err-${Date.now()}`,
        role: 'model',
        text: 'Nuestros métodos de pago oficiales en Bolivia son **QR Simple** (acreditación instantánea) y transferencia a **BCP** o **BNB**. Para asesoramiento inmediato de salud o pedidos, también puedes escribirnos directamente a nuestro **WhatsApp oficial: +591 72902338**.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, fallbackMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleClearHistory = () => {
    setMessages([INITIAL_GREETING]);
    try {
      sessionStorage.removeItem('xcrispin_gemini_chat');
    } catch {}
  };

  // Helper to format basic markdown-style text safely without bulky dependencies
  const renderFormattedText = (raw: string) => {
    const lines = raw.split('\n');
    return lines.map((line, idx) => {
      // Bold syntax **text**
      const parts = line.split(/(\*\*.*?\*\*)/g);
      const formattedLine = parts.map((part, pIdx) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return <strong key={pIdx} className="font-bold text-slate-900">{part.slice(2, -2)}</strong>;
        }
        return part;
      });

      if (line.trim().startsWith('•') || line.trim().startsWith('-')) {
        return (
          <div key={idx} className="flex items-start gap-1.5 my-1 pl-1">
            <span className="text-cyan-600 font-bold select-none">•</span>
            <span>{formattedLine}</span>
          </div>
        );
      }

      return (
        <p key={idx} className={line.trim() === '' ? 'h-2' : 'my-1'}>
          {formattedLine}
        </p>
      );
    });
  };

  return (
    <div className="fixed bottom-5 right-5 z-40 font-sans print:hidden select-none">
      {/* Floating Launcher Button */}
      {!isOpen && (
        <div className="relative group">
          <button
            onClick={() => setIsOpen(true)}
            id="gemini-chat-open-btn"
            className="flex items-center gap-2.5 px-4 py-3 bg-gradient-to-r from-slate-950 via-slate-900 to-cyan-950 text-white rounded-full shadow-2xl hover:shadow-cyan-500/20 hover:scale-105 active:scale-95 transition-all duration-200 border border-cyan-500/30 cursor-pointer"
            aria-label="Abrir asistente inteligente X-CRISPIN con Gemini"
          >
            <div className="relative flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-cyan-400 animate-pulse" />
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 border-slate-950"></span>
            </div>
            <div className="text-left hidden sm:block">
              <span className="text-xs font-bold block tracking-wide">Asistente Gemini AI</span>
              <span className="text-[10px] text-cyan-300 block -mt-0.5">Dudas sobre productos y pagos</span>
            </div>
            {hasUnread && (
              <span className="w-3 h-3 bg-rose-500 rounded-full animate-ping"></span>
            )}
          </button>
        </div>
      )}

      {/* Expanded Chat Box */}
      {isOpen && (
        <div
          className={`bg-white rounded-3xl shadow-2xl border border-slate-200 flex flex-col transition-all duration-200 overflow-hidden ${
            isMinimized
              ? 'w-80 sm:w-96 h-16'
              : 'w-[92vw] sm:w-[420px] h-[580px] max-h-[85vh]'
          }`}
          id="gemini-chat-window"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-cyan-950 text-white p-3.5 sm:p-4 flex items-center justify-between border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div className="relative w-9 h-9 rounded-2xl bg-cyan-600/30 border border-cyan-400/40 flex items-center justify-center text-cyan-300">
                <Bot className="w-5 h-5 text-cyan-400" />
                <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 border-slate-900"></span>
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="text-sm font-bold text-white tracking-tight">X-Bot Asistente</h3>
                  <span className="text-[9px] px-1.5 py-0.2 bg-cyan-500/20 text-cyan-300 font-mono rounded-full border border-cyan-500/30">
                    Gemini 3.8
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full"></span>
                  Experto en nutrición Factor X y pagos QR
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1 text-slate-400">
              <button
                onClick={() => setIsMinimized((prev) => !prev)}
                className="p-1.5 hover:text-white hover:bg-slate-800/60 rounded-xl transition-colors"
                title={isMinimized ? 'Expandir' : 'Minimizar'}
                aria-label="Minimizar chat"
              >
                {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
              </button>
              <button
                onClick={handleClearHistory}
                className="p-1.5 hover:text-white hover:bg-slate-800/60 rounded-xl transition-colors"
                title="Limpiar conversación"
                aria-label="Limpiar chat"
              >
                <Trash2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 hover:text-white hover:bg-slate-800/60 rounded-xl transition-colors"
                title="Cerrar"
                aria-label="Cerrar chat"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Chat Content Body (visible when not minimized) */}
          {!isMinimized && (
            <>
              {/* Message List */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50/60">
                {messages.map((msg) => {
                  const isUser = msg.role === 'user';
                  return (
                    <div
                      key={msg.id}
                      className={`flex gap-2.5 ${isUser ? 'justify-end' : 'justify-start'}`}
                    >
                      {!isUser && (
                        <div className="w-7 h-7 rounded-xl bg-cyan-600/20 text-cyan-700 flex items-center justify-center flex-shrink-0 mt-1 border border-cyan-600/30">
                          <Bot className="w-4 h-4" />
                        </div>
                      )}

                      <div
                        className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed shadow-xs ${
                          isUser
                            ? 'bg-slate-900 text-white rounded-br-xs'
                            : 'bg-white text-slate-800 border border-slate-200/90 rounded-bl-xs'
                        }`}
                      >
                        <div className="select-text break-words">
                          {renderFormattedText(msg.text)}
                        </div>

                        <div
                          className={`mt-1.5 text-[9px] flex items-center justify-between gap-2 ${
                            isUser ? 'text-slate-400' : 'text-slate-400'
                          }`}
                        >
                          <span>{msg.timestamp}</span>
                          {!isUser && (
                            <span className="font-mono text-[9px] text-cyan-600">
                              Factor X Assistant
                            </span>
                          )}
                        </div>
                      </div>

                      {isUser && (
                        <div className="w-7 h-7 rounded-xl bg-slate-900 text-white flex items-center justify-center flex-shrink-0 mt-1">
                          <User className="w-4 h-4" />
                        </div>
                      )}
                    </div>
                  );
                })}

                {isLoading && (
                  <div className="flex gap-2.5 justify-start">
                    <div className="w-7 h-7 rounded-xl bg-cyan-600/20 text-cyan-700 flex items-center justify-center flex-shrink-0 mt-1 border border-cyan-600/30">
                      <Bot className="w-4 h-4" />
                    </div>
                    <div className="bg-white border border-slate-200 rounded-2xl rounded-bl-xs px-4 py-3 shadow-xs flex items-center gap-1.5 text-xs text-slate-500">
                      <span className="w-2 h-2 rounded-full bg-cyan-600 animate-bounce"></span>
                      <span className="w-2 h-2 rounded-full bg-cyan-600 animate-bounce [animation-delay:0.2s]"></span>
                      <span className="w-2 h-2 rounded-full bg-cyan-600 animate-bounce [animation-delay:0.4s]"></span>
                      <span className="text-[11px] text-slate-400 ml-1">Consultando Gemini...</span>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Quick Suggestion Chips */}
              <div className="px-3.5 py-2 bg-white border-t border-slate-100 overflow-x-auto flex gap-1.5 scrollbar-none">
                {SUGGESTED_QUESTIONS.map((q, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSendMessage(q.prompt)}
                    disabled={isLoading}
                    className="text-[11px] font-medium px-2.5 py-1 bg-slate-100 hover:bg-cyan-50 hover:text-cyan-800 hover:border-cyan-300 text-slate-700 rounded-full border border-slate-200/80 whitespace-nowrap transition-colors flex-shrink-0 cursor-pointer disabled:opacity-50"
                  >
                    {q.label}
                  </button>
                ))}
              </div>

              {/* Input Area */}
              <div className="p-3 bg-white border-t border-slate-200">
                <div className="flex items-center gap-2">
                  <input
                    ref={inputRef}
                    type="text"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Pregúntale a Gemini sobre productos o pagos..."
                    disabled={isLoading}
                    className="flex-1 px-3.5 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:border-cyan-500 outline-hidden transition-colors disabled:opacity-50"
                  />
                  <button
                    onClick={() => handleSendMessage()}
                    disabled={!inputMessage.trim() || isLoading}
                    className="p-2.5 bg-slate-900 hover:bg-cyan-600 disabled:bg-slate-300 text-white rounded-xl transition-all shadow-sm flex items-center justify-center flex-shrink-0 cursor-pointer disabled:cursor-not-allowed"
                    title="Enviar mensaje"
                    aria-label="Enviar"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>

                {/* Footer Help Bar */}
                <div className="mt-2 pt-1.5 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-500">
                  <span className="flex items-center gap-1 text-slate-400">
                    <ShieldCheck className="w-3 h-3 text-emerald-500" />
                    Respuestas oficiales X-CRISPIN
                  </span>
                  <a
                    href="https://wa.me/59172902338?text=Hola%20X-CRISPIN%2C%20tengo%20una%20consulta%20adicional."
                    target="_blank"
                    rel="noreferrer"
                    className="text-emerald-600 hover:text-emerald-700 font-bold hover:underline flex items-center gap-0.5"
                  >
                    <span>Asesor Humano WhatsApp</span>
                    <ExternalLink className="w-2.5 h-2.5" />
                  </a>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};
