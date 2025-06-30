'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Loader2, MessageCircle, X, Minimize2, AlertTriangle, RefreshCw, Settings } from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system' | 'error';
  content: string;
  timestamp: Date;
  error?: boolean;
}

interface FloatingChatWidgetProps {
  context?: string;
  apiUrl?: string;
}

const FloatingChatWidget: React.FC<FloatingChatWidgetProps> = ({ 
  context = 'Ти си AI асистент за dashboard. Помажеш корисницима да користе систем. Одговарај на српском језику.',
  apiUrl = 'http://31.97.47.83:5001'
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'disconnected' | 'checking'>('checking');
  const [error, setError] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [currentModel, setCurrentModel] = useState<string>('llama3.2');
  const [availableModels, setAvailableModels] = useState<string[]>([]);
  const [showModelSelect, setShowModelSelect] = useState(false);
  const [messageCount, setMessageCount] = useState(0);
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
      if (!sessionId) {
        initializeChat();
      }
    }
  }, [isOpen]);

  const initializeChat = async () => {
    addSystemMessage('🚀 Покретање AI асистента...');
    
    // Create new session
    await createNewSession();
    
    // Check server health
    await checkServerHealth();
    
    // Load available models
    await loadModels();
    
    addSystemMessage('✅ AI асистент је спреман за коришћење!');
  };

  const createNewSession = async () => {
    try {
      const response = await fetch(`${apiUrl}/api/session/new`, {
        method: 'POST',
        signal: AbortSignal.timeout(10000)
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setSessionId(data.session_id);
          return true;
        }
      }
    } catch (error) {
      console.error('Error creating session:', error);
    }
    
    // Fallback: generate local session ID
    const fallbackId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    setSessionId(fallbackId);
    return false;
  };

  const checkServerHealth = async () => {
    try {
      setConnectionStatus('checking');
      const response = await fetch(`${apiUrl}/api/health`, {
        method: 'GET',
        signal: AbortSignal.timeout(5000)
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.ollama_available) {
          setConnectionStatus('connected');
        } else {
          setConnectionStatus('disconnected');
        }
      } else {
        setConnectionStatus('disconnected');
      }
    } catch (error) {
      console.error('Health check failed:', error);
      setConnectionStatus('disconnected');
    }
  };

  const loadModels = async () => {
    try {
      const response = await fetch(`${apiUrl}/api/models`, {
        signal: AbortSignal.timeout(10000)
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.models.length > 0) {
          setAvailableModels(data.models);
          
          if (data.default && data.models.includes(data.default)) {
            setCurrentModel(data.default);
          } else {
            setCurrentModel(data.models[0]);
          }
        }
      }
    } catch (error) {
      console.error('Error loading models:', error);
      addSystemMessage('❌ Грешка учитавања модела');
    }
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!inputValue.trim() || isLoading) return;

    if (connectionStatus === 'disconnected') {
      addErrorMessage('❌ Сервер није доступан!');
      return;
    }

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
    setMessageCount(prev => prev + 1);

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000);

      const response = await fetch(`${apiUrl}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: messageText,
          model: currentModel,
          session_id: sessionId,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success) {
        // Update session ID if changed
        if (data.session_id) {
          setSessionId(data.session_id);
        }
        
        const aiMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: data.response || 'Извињавам се, нисам могао да генеришем одговор.',
          timestamp: new Date(),
        };

        setMessages(prev => [...prev, aiMessage]);
        setMessageCount(prev => prev + 1);
        
        // If chat is closed/minimized, show unread indicator
        if (!isOpen || isMinimized) {
          setUnreadCount(prev => prev + 1);
        }

        // Update connection status on successful response
        if (connectionStatus !== 'connected') {
          setConnectionStatus('connected');
        }
      } else {
        throw new Error(data.error || 'Unknown server error');
      }

    } catch (error: any) {
      console.error('Chat error:', error);
      
      let errorMessage = 'Извињавам се, догодила се грешка. Молим покушајте поново.';
      
      if (error.name === 'AbortError') {
        errorMessage = 'Захтев је истекао. Молим покушајте поново.';
      } else if (error.message.includes('Server error: 500')) {
        errorMessage = 'Сервер грешка. Молим контактирајте администратора.';
      } else if (error.message.includes('NetworkError') || error.message.includes('fetch')) {
        errorMessage = 'Грешка у конекцији. Проверите интернетску везу.';
        setConnectionStatus('disconnected');
      }

      addErrorMessage(errorMessage);
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const addSystemMessage = (text: string) => {
    const systemMessage: Message = {
      id: `system-${Date.now()}`,
      role: 'system',
      content: text,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, systemMessage]);
  };

  const addErrorMessage = (text: string) => {
    const errorMessage: Message = {
      id: `error-${Date.now()}`,
      role: 'error',
      content: text,
      timestamp: new Date(),
      error: true,
    };
    setMessages(prev => [...prev, errorMessage]);
  };

  const clearChat = async () => {
    try {
      if (sessionId) {
        await fetch(`${apiUrl}/api/session/${sessionId}/clear`, {
          method: 'DELETE'
        });
      }
    } catch (error) {
      console.error('Clear session error:', error);
    }
    
    // Clear chat area and create new session
    setMessages([]);
    setMessageCount(0);
    await createNewSession();
    addSystemMessage('🗑️ Чет је обрисан! Нова сесија је креирана.');
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
    checkServerHealth();
    loadModels();
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
        case 'connected': return 'Повезано';
        case 'disconnected': return 'Није повезано';
        case 'checking': return 'Проверава...';
        default: return 'Непознато';
      }
    };

    return (
      <div className="flex items-center space-x-2 text-xs">
        <div className={`w-2 h-2 rounded-full ${getIndicatorColor()}`} />
        <span className="text-white opacity-75">{getIndicatorText()}</span>
        <span className="text-white opacity-50">({currentModel})</span>
      </div>
    );
  };

  const ModelSelector = () => {
    if (!showModelSelect) return null;

    return (
      <div className="absolute top-full left-0 mt-1 bg-white border rounded-lg shadow-lg z-50 min-w-[200px]">
        <div className="p-2 border-b">
          <h4 className="font-medium text-sm text-gray-700">Изабери модел</h4>
        </div>
        <div className="max-h-48 overflow-y-auto">
          {availableModels.map((model) => (
            <button
              key={model}
              onClick={() => {
                setCurrentModel(model);
                setShowModelSelect(false);
                addSystemMessage(`🔄 Модел промењен на: ${model}`);
              }}
              className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-100 ${
                model === currentModel ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-700'
              }`}
            >
              {model}
              {model === currentModel && <span className="ml-2">✓</span>}
            </button>
          ))}
        </div>
      </div>
    );
  };

  // Auto health check every 30 seconds
  useEffect(() => {
    const interval = setInterval(checkServerHealth, 30000);
    return () => clearInterval(interval);
  }, []);

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
                  <h3 className="font-medium text-sm">AI Асистент</h3>
                  <ConnectionIndicator />
                </div>
              </div>
              <div className="flex items-center space-x-1">
                {connectionStatus === 'disconnected' && (
                  <button
                    onClick={retryConnection}
                    className="p-1 hover:bg-blue-700 rounded text-xs"
                    title="Поново покушај конекцију"
                  >
                    <RefreshCw className="w-3 h-3" />
                  </button>
                )}
                {availableModels.length > 0 && (
                  <div className="relative">
                    <button
                      onClick={() => setShowModelSelect(!showModelSelect)}
                      className="p-1 hover:bg-blue-700 rounded text-xs"
                      title="Промени модел"
                    >
                      <Settings className="w-3 h-3" />
                    </button>
                    <ModelSelector />
                  </div>
                )}
                <button
                  onClick={clearChat}
                  className="p-1 hover:bg-blue-700 rounded text-xs"
                  title="Очисти чет"
                >
                  🗑️
                </button>
                <button
                  onClick={minimizeChat}
                  className="p-1 hover:bg-blue-700 rounded"
                  title="Умањи"
                >
                  <Minimize2 className="w-4 h-4" />
                </button>
                <button
                  onClick={closeChat}
                  className="p-1 hover:bg-blue-700 rounded"
                  title="Затвори"
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
                    AI асистент није доступан. <button onClick={retryConnection} className="underline">Покушај поново</button>
                  </p>
                </div>
              </div>
            )}

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-3 space-y-3 bg-gray-50">
              {messages.length === 0 && (
                <div className="text-center text-gray-500 text-sm mt-4">
                  <Bot className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                  <p>Здраво! Како могу да вам помогнем данас?</p>
                  <p className="text-xs text-gray-400 mt-2">
                    Питајте ме о било чему што вас занима.
                  </p>
                </div>
              )}
              
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${
                    message.role === 'user' ? 'justify-end' : 
                    message.role === 'system' || message.role === 'error' ? 'justify-center' : 'justify-start'
                  }`}
                >
                  <div
                    className={`flex space-x-2 max-w-[85%] ${
                      message.role === 'user' ? 'flex-row-reverse space-x-reverse' : 
                      message.role === 'system' || message.role === 'error' ? 'max-w-[95%]' : ''
                    }`}
                  >
                    {message.role !== 'system' && message.role !== 'error' && (
                      <div className="flex-shrink-0">
                        {message.role === 'user' ? (
                          <User className="w-6 h-6 p-1 bg-blue-600 text-white rounded-full" />
                        ) : (
                          <Bot className="w-6 h-6 p-1 bg-gray-600 text-white rounded-full" />
                        )}
                      </div>
                    )}
                    <div
                      className={`p-2 rounded-lg text-sm ${
                        message.role === 'user'
                          ? 'bg-blue-600 text-white rounded-br-sm'
                          : message.role === 'system'
                          ? 'bg-yellow-50 text-yellow-800 border border-yellow-200 rounded-lg text-center'
                          : message.role === 'error'
                          ? 'bg-red-50 text-red-800 border border-red-200 rounded-lg text-center'
                          : 'bg-white text-gray-800 rounded-bl-sm shadow-sm'
                      }`}
                    >
                      <p className="whitespace-pre-wrap">{message.content}</p>
                      <p className={`text-xs mt-1 ${
                        message.role === 'user' 
                          ? 'text-blue-100' 
                          : message.role === 'system'
                          ? 'text-yellow-600'
                          : message.role === 'error' 
                          ? 'text-red-600' 
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
                        <span className="text-sm text-gray-600">Куцам одговор...</span>
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
                  placeholder="Укуцајте поруку..."
                  className="flex-1 p-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                  disabled={isLoading || connectionStatus === 'disconnected'}
                  maxLength={500}
                />
                <button
                  type="submit"
                  disabled={isLoading || !inputValue.trim() || connectionStatus === 'disconnected'}
                  className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  title="Пошаљи поруку"
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
                  AI асистент тренутно није доступан
                </p>
              )}
              {messageCount > 0 && (
                <p className="text-xs text-gray-400 mt-1">
                  Поруке у сесији: {messageCount}
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
              <span className="text-sm font-medium">AI Асистент</span>
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
          title="AI Асистент"
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