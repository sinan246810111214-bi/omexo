import React, { useState, useEffect, useRef } from 'react';
import { useStore } from '../hooks/useStore';
import { X, Send, User } from 'lucide-react';

const UnknownPersonIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg 
    viewBox="0 0 100 100" 
    className={`${className} select-none`}
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* Clean circular border matching the user's sketch */}
    <circle cx="50" cy="50" r="46" stroke="currentColor" strokeWidth="3" fill="white" />
    {/* Head Silhouette */}
    <circle cx="50" cy="38" r="14" fill="currentColor" />
    {/* Neck Connection */}
    <path d="M45 48 H55 V57 H45 Z" fill="currentColor" />
    {/* Curving shoulders fitting perfectly inside the border bounds */}
    <path d="M22 78 C25 62, 35 56, 50 56 C65 56, 75 62, 78 78 Z" fill="currentColor" />
  </svg>
);

interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
}

export const AIAssistant: React.FC = () => {
  const { products, orders } = useStore();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [hasNewMessageBadge, setHasNewMessageBadge] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Automatically scroll to the latest message
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  // Show a friendly customer service welcome message in Malayalam and English
  useEffect(() => {
    if (messages.length === 0) {
      const initialText = "ഹലോ! ഞാൻ നിങ്ങളുടെ ഒമേക്സോ സപ്പോർട്ട് അസിസ്റ്റന്റാണ്. ഉൽപ്പന്നങ്ങളെക്കുറിച്ചോ, ഓർഡറുകളെക്കുറിച്ചോ, ഡെലിവറിയെക്കുറിച്ചോ ഉള്ള സംശയങ്ങൾ മലയാളത്തിലോ ഇംഗ്ലീഷിലോ ചോദിക്കാം. \n\n(Welcome to Omexo Support! Ask me about our premium gadgets, Cash On Delivery, or express shipping policies in Malayalam or English.)";
      
      setMessages([
        {
          id: 'welcome',
          role: 'model',
          text: initialText,
          timestamp: new Date()
        }
      ]);
    }
  }, []);

  const handleSendMessage = async (textToSend: string) => {
    if (!textToSend.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: 'msg-' + Date.now() + '-user',
      role: 'user',
      text: textToSend.trim(),
      timestamp: new Date()
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputValue('');
    setIsLoading(true);

    try {
      // Build grounding context using live store details
      const productsString = products
        .slice(0, 15) // send up to 15 products to save tokens
        .map(p => `• ${p.title} (Price: ₹${p.salePrice}, Category: ${p.category}, Brand: ${p.brand}, Rating: ${p.rating}/5) - ${p.shortDescription}`)
        .join('\n');

      const storeContext = {
        productsCount: products.length,
        ordersCount: orders.length,
        productsString: productsString
      };

      // Extract raw messages history in the unified format
      const chatHistory = messages
        .filter(m => m.id !== 'welcome') // Skip welcome to save token context
        .map(m => ({
          role: m.role,
          text: m.text
        }));

      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: userMsg.text,
          role: 'customer', // Always run as customer support
          chatHistory: chatHistory,
          storeContext: storeContext
        })
      });

      if (!response.ok) {
        throw new Error('API server failed to respond');
      }

      const data = await response.json();
      
      const assistantMsg: ChatMessage = {
        id: 'msg-' + Date.now() + '-model',
        role: 'model',
        text: data.reply || 'I processed your query, but no response text was returned.',
        timestamp: new Date()
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (error: any) {
      console.error('Failed to query assistant:', error);
      const errorMsg: ChatMessage = {
        id: 'msg-' + Date.now() + '-error',
        role: 'model',
        text: "I am having trouble connecting to the secure AI endpoint. Please check that GEMINI_API_KEY is configured in your Settings secrets panel.",
        timestamp: new Date()
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSendMessage(inputValue);
  };

  // Pre-made quick customer queries
  const customerSuggestions = [
    "Recommend a charger",
    "വാറന്റി വിവരങ്ങൾ?",
    "Is COD payment supported?",
    "ഹെഡ്‌ഫോൺ കാണിക്കാമോ?"
  ];

  const toggleAssistant = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      setHasNewMessageBadge(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 font-sans antialiased" id="omexo-floating-assistant">
      {/* Floating Action Trigger with friendly support person avatar */}
      <button
        onClick={toggleAssistant}
        className="w-14 h-14 rounded-full bg-white shadow-2xl flex items-center justify-center cursor-pointer transition-transform duration-150 hover:scale-105 relative border border-zinc-200 overflow-hidden"
        aria-label="Toggle AI Assistant"
        id="assistant-toggle-button"
      >
        {isOpen ? (
          <X className="w-5 h-5 text-zinc-800" />
        ) : (
          <UnknownPersonIcon className="w-10 h-10 text-zinc-900" />
        )}
        {hasNewMessageBadge && !isOpen && (
          <span className="absolute top-0 right-0 w-3.5 h-3.5 bg-red-500 border-2 border-white rounded-full" />
        )}
      </button>

      {/* Assistant Window Tray */}
      {isOpen && (
        <div 
          className="absolute bottom-16 right-0 w-[350px] sm:w-[380px] h-[500px] bg-white border border-zinc-200 rounded shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-4 fade-in duration-200"
          id="assistant-chat-panel"
        >
          {/* Header */}
          <div className="bg-zinc-50 border-b border-zinc-200 p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full overflow-hidden shrink-0">
                <UnknownPersonIcon className="w-full h-full text-zinc-900" />
              </div>
              <div>
                <h4 className="text-xs font-bold uppercase tracking-widest text-zinc-900">
                  Omexo Support
                </h4>
                <p className="text-[9px] font-bold uppercase tracking-wider text-green-600 mt-0.5">
                  Customer Assistant • Online
                </p>
              </div>
            </div>
            <button 
              onClick={() => setIsOpen(false)}
              className="text-zinc-400 hover:text-black p-1 transition-colors rounded"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Messages Board */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-zinc-50/40" id="assistant-messages-container">
            {messages.map((msg) => (
              <div 
                key={msg.id} 
                className={`flex gap-2.5 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.role !== 'user' && (
                  <div className="w-6 h-6 rounded-full overflow-hidden shrink-0">
                    <UnknownPersonIcon className="w-full h-full text-zinc-900" />
                  </div>
                )}
                <div 
                  className={`max-w-[78%] rounded p-3 text-xs leading-relaxed border ${
                    msg.role === 'user' 
                      ? 'bg-black border-black text-white font-medium' 
                      : 'bg-white border-zinc-200 text-zinc-800 font-semibold'
                  }`}
                >
                  <div className="whitespace-pre-line">
                    {msg.text}
                  </div>
                  <span className={`block text-[8px] mt-1.5 uppercase font-bold tracking-wider text-right ${
                    msg.role === 'user' ? 'text-zinc-400' : 'text-zinc-400'
                  }`}>
                    {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                {msg.role === 'user' && (
                  <div className="w-6 h-6 rounded bg-zinc-200 text-zinc-700 flex items-center justify-center shrink-0 border border-zinc-300">
                    <User className="w-3.5 h-3.5" />
                  </div>
                )}
              </div>
            ))}

            {/* Simulated Animated Thinking State */}
            {isLoading && (
              <div className="flex gap-2.5 justify-start">
                <div className="w-6 h-6 rounded-full overflow-hidden shrink-0">
                  <UnknownPersonIcon className="w-full h-full text-zinc-900" />
                </div>
                <div className="bg-white border border-zinc-200 text-zinc-400 rounded p-3 text-xs flex items-center gap-2">
                  <span className="flex gap-1">
                    <span className="w-1.5 h-1.5 bg-zinc-400 rounded-full animate-bounce duration-300" style={{ animationDelay: '0ms' }} />
                    <span className="w-1.5 h-1.5 bg-zinc-400 rounded-full animate-bounce duration-300" style={{ animationDelay: '150ms' }} />
                    <span className="w-1.5 h-1.5 bg-zinc-400 rounded-full animate-bounce duration-300" style={{ animationDelay: '300ms' }} />
                  </span>
                  <span className="font-bold uppercase tracking-widest text-[9px]">Analyzing ...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Prompt suggestions tray */}
          <div className="border-t border-zinc-100 p-2.5 bg-white flex gap-1.5 overflow-x-auto shrink-0 select-none no-scrollbar">
            {customerSuggestions.map((suggestion) => (
              <button
                key={suggestion}
                type="button"
                onClick={() => handleSendMessage(suggestion)}
                className="px-2.5 py-1 bg-zinc-50 hover:bg-zinc-100 border border-zinc-200 rounded text-[9px] font-bold text-zinc-700 uppercase tracking-wider transition-colors shrink-0 cursor-pointer"
              >
                {suggestion}
              </button>
            ))}
          </div>

          {/* Form Action Controls */}
          <form 
            onSubmit={handleSubmit} 
            className="p-3 border-t border-zinc-200 bg-zinc-50 flex gap-2 items-center"
          >
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Ask Omexo Support..."
              className="flex-1 px-3 py-1.5 border border-zinc-200 rounded bg-white text-xs font-semibold text-zinc-800 placeholder-zinc-400 focus:outline-none focus:border-black"
              id="assistant-chat-input"
            />
            <button
              type="submit"
              disabled={!inputValue.trim() || isLoading}
              className="px-3.5 py-1.5 bg-black hover:bg-zinc-900 disabled:opacity-40 text-white rounded text-[10px] font-bold uppercase tracking-wider flex items-center justify-center cursor-pointer transition-colors"
              id="assistant-submit-button"
            >
              <Send className="w-3 h-3" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
