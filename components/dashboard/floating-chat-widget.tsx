// components/dashboard/floating-chat-widget.tsx - Fixed version
'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Loader2, MessageCircle, X, Minimize2, AlertTriangle } from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  error?: boolean;
}

interface FloatingChatWidgetProps {
  sessionId?: string;
  context?: string;
  apiUrl?: string;
}

const FloatingChatWidget: React.FC<FloatingChatWidgetProps> = ({ 
  sessionId = `session-${Date.now()}`,
  context = 'Ti si AI asistent za CodilioCMS dashboard. Pomažeš korisnicima da koriste sistem. Odgovaraj na srpskom jeziku.',
  apiUrl = 'http://localhost:3001/api'
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'disconnected' | 'checking'>('checking');
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen) {
      setUnreadCount(0);
      setError(null);
    }
  }, [isOpen]);

  // Check API connection status
  useEffect(() => {
    checkConnection();
  }, []);

  const checkConnection = async () => {
    try {
      setConnectionStatus('checking');
      const response = await fetch(`${apiUrl}/ai-agent/status`, {
        method: 'GET',
        signal: AbortSignal.timeout(5000)
      });
      
      if (response.ok) {
        const status = await response.json();
        setConnectionStatus(status.ragReady ? 'connected' : 'disconnected');
      } else {
        setConnectionStatus('disconnected');
      }
    } catch (error) {
      console.error('Connection check failed:', error);
      setConnectionStatus('disconnected');
    }
  };

  // Load chat history when opened
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      loadChatHistory();
    }
  }, [isOpen, sessionId]);

  const loadChatHistory = async () => {
    try {
      const response = await fetch(`${apiUrl}/ai-agent/history/${sessionId}`, {
        signal: AbortSignal.timeout(10000)
      });
      
      if (response.ok) {
        const history = await response.json();
        const formattedMessages = history.map((msg: any) => ({
          id: msg.id.toString(),
          role: msg.role,
          content: msg.content,
          timestamp: new Date(msg.createdAt),
        }));
        setMessages(formattedMessages);
      }
    } catch (error) {
      console.error('Failed to load chat history:', error);
      // Don't show error for history loading failure
    }
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!inputValue.trim() || isLoading) return;

    const messageText = inputValue.trim();
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: messageText,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);
    setError(null);

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

      const response = await fetch(`${apiUrl}/ai-agent/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: messageText,
          sessionId,
          context,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }

      const data = await response.json();
      
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.response || 'Izvinjavam se, nisam mogao da generišem odgovor.',
        timestamp: new Date(data.timestamp || new Date()),
      };

      setMessages(prev => [...prev, aiMessage]);
      
      // If chat is closed/minimized, show unread indicator
      if (!isOpen || isMinimized) {
        setUnreadCount(prev => prev + 1);
      }

      // Update connection status on successful response
      if (connectionStatus !== 'connected') {
        setConnectionStatus('connected');
      }

    } catch (error: any) {
      console.error('Chat error:', error);
      
      let errorMessage = 'Izvinjavam se, dogodila se greška. Molim pokušajte ponovo.';
      
      if (error.name === 'AbortError') {
        errorMessage = 'Zahtev je istekao. Molim pokušajte ponovo.';
      } else if (error.message.includes('Server error: 500')) {
        errorMessage = 'Server greška. Molim kontaktirajte administratora.';
      } else if (error.message.includes('NetworkError') || error.message.includes('fetch')) {
        errorMessage = 'Greška u konekciji. Proverite internetsku vezu.';
        setConnectionStatus('disconnected');
      }

      const errorResponse: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: errorMessage,
        timestamp: new Date(),
        error: true,
      };
      
      setMessages(prev => [...prev, errorResponse]);
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleChat = () => {
    setIsOpen(!isOpen);
    setIsMinimized(false);
  };

  const minimizeChat = () => {
    setIsMinimized(true);
  };

  const closeChat = () => {
    setIsOpen(false);
    setIsMinimized(false);
  };

  const retryConnection = () => {
    checkConnection();
  };

  const ConnectionIndicator = () => {
    const getIndicatorColor = () => {
      switch (connectionStatus) {
        case 'connected': return 'bg-green-500';
        case 'disconnected': return 'bg-red-500';
        case 'checking': return 'bg-yellow-500';
        default: return 'bg-gray-500';
      }
    };

    const getIndicatorText = () => {
      switch (connectionStatus) {
        case 'connected': return 'Povezano';
        case 'disconnected': return 'Nije povezano';
        case 'checking': return 'Proverava...';
        default: return 'Nepoznato';
      }
    };

    return (
      <div className="flex items-center space-x-2 text-xs">
        <div className={`w-2 h-2 rounded-full ${getIndicatorColor()}`} />
        <span className="text-white opacity-75">{getIndicatorText()}</span>
      </div>
    );
  };

  return (
    <>
      {/* Chat Widget Container */}
      <div className="fixed bottom-4 right-4 z-50">
        {/* Chat Window */}
        {isOpen && !isMinimized && (
          <div className="mb-4 bg-white rounded-lg shadow-2xl border w-80 h-96 flex flex-col animate-in slide-in-from-bottom-2 duration-300">
            {/* Header */}
            <div className="flex items-center justify-between p-3 border-b bg-blue-600 text-white rounded-t-lg">
              <div className="flex items-center space-x-2">
                <Bot className="w-5 h-5" />
                <div>
                  <h3 className="font-medium text-sm">AI Asistent</h3>
                  <ConnectionIndicator />
                </div>
              </div>
              <div className="flex items-center space-x-1">
                {connectionStatus === 'disconnected' && (
                  <button
                    onClick={retryConnection}
                    className="p-1 hover:bg-blue-700 rounded text-xs"
                    title="Ponovo pokušaj konekciju"
                  >
                    🔄
                  </button>
                )}
                <button
                  onClick={minimizeChat}
                  className="p-1 hover:bg-blue-700 rounded"
                  title="Umanji"
                >
                  <Minimize2 className="w-4 h-4" />
                </button>
                <button
                  onClick={closeChat}
                  className="p-1 hover:bg-blue-700 rounded"
                  title="Zatvori"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Connection Error Banner */}
            {connectionStatus === 'disconnected' && (
              <div className="bg-red-50 border-l-4 border-red-400 p-2">
                <div className="flex items-center">
                  <AlertTriangle className="w-4 h-4 text-red-400 mr-2" />
                  <p className="text-sm text-red-700">
                    AI asistent nije dostupan. <button onClick={retryConnection} className="underline">Pokušaj ponovo</button>
                  </p>
                </div>
              </div>
            )}

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-3 space-y-3 bg-gray-50">
              {messages.length === 0 && (
                <div className="text-center text-gray-500 text-sm mt-4">
                  <Bot className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                  <p>Zdravo! Kako mogu da vam pomognem danas?</p>
                  <p className="text-xs text-gray-400 mt-2">
                    Pitate me o CodilioCMS dashboard-u, Relof Indeksu, ili bilo čemu drugom.
                  </p>
                </div>
              )}
              
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`flex space-x-2 max-w-[85%] ${
                      message.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''
                    }`}
                  >
                    <div className="flex-shrink-0">
                      {message.role === 'user' ? (
                        <User className="w-6 h-6 p-1 bg-blue-600 text-white rounded-full" />
                      ) : (
                        <Bot className={`w-6 h-6 p-1 ${message.error ? 'bg-red-500' : 'bg-gray-600'} text-white rounded-full`} />
                      )}
                    </div>
                    <div
                      className={`p-2 rounded-lg text-sm ${
                        message.role === 'user'
                          ? 'bg-blue-600 text-white rounded-br-sm'
                          : message.error
                          ? 'bg-red-50 text-red-800 border border-red-200 rounded-bl-sm'
                          : 'bg-white text-gray-800 rounded-bl-sm shadow-sm'
                      }`}
                    >
                      <p className="whitespace-pre-wrap">{message.content}</p>
                      <p className={`text-xs mt-1 ${
                        message.role === 'user' 
                          ? 'text-blue-100' 
                          : message.error 
                          ? 'text-red-400' 
                          : 'text-gray-400'
                      }`}>
                        {message.timestamp.toLocaleTimeString('sr-RS', { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
              
              {isLoading && (
                <div className="flex justify-start">
                  <div className="flex space-x-2">
                    <Bot className="w-6 h-6 p-1 bg-gray-600 text-white rounded-full" />
                    <div className="bg-white p-2 rounded-lg shadow-sm">
                      <div className="flex items-center space-x-2">
                        <Loader2 className="w-4 h-4 animate-spin text-gray-600" />
                        <span className="text-sm text-gray-600">Kucam odgovor...</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <form onSubmit={sendMessage} className="p-3 border-t bg-white rounded-b-lg">
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Ukucajte poruku..."
                  className="flex-1 p-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                  disabled={isLoading || connectionStatus === 'disconnected'}
                  maxLength={500}
                />
                <button
                  type="submit"
                  disabled={isLoading || !inputValue.trim() || connectionStatus === 'disconnected'}
                  className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  title="Pošalji poruku"
                >
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                </button>
              </div>
              {connectionStatus === 'disconnected' && (
                <p className="text-xs text-red-500 mt-1">
                  AI asistent trenutno nije dostupan
                </p>
              )}
            </form>
          </div>
        )}

        {/* Minimized State */}
        {isOpen && isMinimized && (
          <div className="mb-4 bg-blue-600 text-white p-3 rounded-lg shadow-lg cursor-pointer hover:bg-blue-700 transition-colors"
               onClick={() => setIsMinimized(false)}>
            <div className="flex items-center space-x-2">
              <Bot className="w-5 h-5" />
              <span className="text-sm font-medium">AI Asistent</span>
              {unreadCount > 0 && (
                <span className="bg-red-500 text-white text-xs rounded-full px-2 py-0.5 min-w-[20px] text-center">
                  {unreadCount}
                </span>
              )}
              {connectionStatus === 'disconnected' && (
                <AlertTriangle className="w-4 h-4 text-yellow-300" />
              )}
            </div>
          </div>
        )}

        {/* Chat Toggle Button */}
        <button
          onClick={toggleChat}
          className={`relative bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-full shadow-lg transition-all duration-300 ${
            isOpen ? 'scale-90' : 'scale-100 hover:scale-105'
          }`}
          title="AI Asistent"
        >
          <MessageCircle className="w-6 h-6" />
          {!isOpen && unreadCount > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center animate-pulse">
              {unreadCount}
            </span>
          )}
          {!isOpen && connectionStatus === 'disconnected' && (
            <span className="absolute -top-1 -right-1 bg-yellow-500 w-3 h-3 rounded-full border-2 border-white" />
          )}
        </button>
      </div>

      {/* Backdrop for mobile */}
      {isOpen && !isMinimized && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-20 z-40 md:hidden"
          onClick={closeChat}
        />
      )}
    </>
  );
};

export default FloatingChatWidget;