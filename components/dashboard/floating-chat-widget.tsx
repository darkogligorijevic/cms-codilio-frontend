// components/FloatingChatWidget.tsx
'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Loader2, MessageCircle, X, Minimize2 } from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface FloatingChatWidgetProps {
  sessionId?: string;
  context?: string;
  apiUrl?: string;
}

const FloatingChatWidget: React.FC<FloatingChatWidgetProps> = ({ 
  sessionId = 'default-session',
  context = 'You are a helpful AI assistant for a local institution. Be concise and helpful.',
  apiUrl = 'http://localhost:3001/api'
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
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
    }
  }, [isOpen]);

  // Load chat history when opened
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      loadChatHistory();
    }
  }, [isOpen, sessionId]);

  const loadChatHistory = async () => {
    try {
      const response = await fetch(`${apiUrl}/ai-agent/history/${sessionId}`);
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
    }
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!inputValue.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputValue,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      const response = await fetch(`${apiUrl}/ai-agent/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: inputValue,
          sessionId,
          context,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get AI response');
      }

      const data = await response.json();
      
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.response,
        timestamp: new Date(data.timestamp),
      };

      setMessages(prev => [...prev, aiMessage]);
      
      // If chat is closed/minimized, show unread indicator
      if (!isOpen || isMinimized) {
        setUnreadCount(prev => prev + 1);
      }
    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
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
                <h3 className="font-medium text-sm">AI Assistant</h3>
              </div>
              <div className="flex items-center space-x-1">
                <button
                  onClick={minimizeChat}
                  className="p-1 hover:bg-blue-700 rounded"
                >
                  <Minimize2 className="w-4 h-4" />
                </button>
                <button
                  onClick={closeChat}
                  className="p-1 hover:bg-blue-700 rounded"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-3 space-y-3 bg-gray-50">
              {messages.length === 0 && (
                <div className="text-center text-gray-500 text-sm mt-4">
                  <Bot className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                  <p>Hi! How can I help you today?</p>
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
                        <Bot className="w-6 h-6 p-1 bg-gray-600 text-white rounded-full" />
                      )}
                    </div>
                    <div
                      className={`p-2 rounded-lg text-sm ${
                        message.role === 'user'
                          ? 'bg-blue-600 text-white rounded-br-sm'
                          : 'bg-white text-gray-800 rounded-bl-sm shadow-sm'
                      }`}
                    >
                      <p className="whitespace-pre-wrap">{message.content}</p>
                      <p className={`text-xs mt-1 ${
                        message.role === 'user' ? 'text-blue-100' : 'text-gray-400'
                      }`}>
                        {message.timestamp.toLocaleTimeString([], { 
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
                      <Loader2 className="w-4 h-4 animate-spin text-gray-600" />
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
                  placeholder="Type a message..."
                  className="flex-1 p-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={isLoading}
                />
                <button
                  type="submit"
                  disabled={isLoading || !inputValue.trim()}
                  className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Minimized State */}
        {isOpen && isMinimized && (
          <div className="mb-4 bg-blue-600 text-white p-3 rounded-lg shadow-lg cursor-pointer hover:bg-blue-700 transition-colors"
               onClick={() => setIsMinimized(false)}>
            <div className="flex items-center space-x-2">
              <Bot className="w-5 h-5" />
              <span className="text-sm font-medium">AI Assistant</span>
              {unreadCount > 0 && (
                <span className="bg-red-500 text-white text-xs rounded-full px-2 py-0.5 min-w-[20px] text-center">
                  {unreadCount}
                </span>
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
        >
          <MessageCircle className="w-6 h-6" />
          {!isOpen && unreadCount > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center animate-pulse">
              {unreadCount}
            </span>
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