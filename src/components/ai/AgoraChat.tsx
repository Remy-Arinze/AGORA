'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  Paperclip,
  Trash2,
  Sparkles,
  Bot,
  User,
  Loader2,
  Download,
  Copy,
  History,
  X,
  MessageSquare,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { FadeInUp } from '@/components/ui/FadeInUp';
import { cn } from '@/lib/utils';
import {
  useAskAiMutation,
  useGetChatHistoryQuery,
  useGetChatMessagesQuery, // Added this import
  useLazyGetChatMessagesQuery,
  useDeleteConversationMutation,
} from '@/lib/store/api/aiApi';
import { useGetMyTeacherProfileQuery } from '@/lib/store/api/schoolAdminApi';
import toast from 'react-hot-toast';

import { useTheme } from '@/contexts/ThemeContext';
import { useSelector } from 'react-redux';
import { RootState } from '@/lib/store/store';

interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
}

interface AgoraChatProps {
  schoolId: string;
}

export const AgoraChat: React.FC<AgoraChatProps> = ({ schoolId }) => {
  const { theme } = useTheme();
  const user = useSelector((state: RootState) => state.auth.user);
  const { data: profileResponse } = useGetMyTeacherProfileQuery();
  const firstName = profileResponse?.data?.firstName || user?.firstName || 'Teacher';

  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: `Hello ${firstName}! I'm Agora AI, your dedicated educational assistant. How can I help you with your lessons, curriculum, or assessments today?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  const { data: historyData } = useGetChatHistoryQuery({ schoolId });
  const [getMessages] = useLazyGetChatMessagesQuery();
  const [deleteConversation] = useDeleteConversationMutation();
  const [askAi, { isLoading }] = useAskAiMutation();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: Message = {
      role: 'user',
      content: inputValue,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');

    try {
      const chatHistory = messages
        .slice(1) // skip the welcome message for API
        .map(({ role, content }) => ({ role, content }));
      chatHistory.push({ role: 'user', content: inputValue });

      const response = await askAi({
        schoolId,
        body: {
          messages: chatHistory,
          conversationId: currentConversationId || undefined
        }
      }).unwrap();

      if (!currentConversationId && response.conversationId) {
        setCurrentConversationId(response.conversationId);
      }

      const assistantMessage: Message = {
        role: 'assistant',
        content: response.response,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error: any) {
      toast.error(error?.data?.message || 'Failed to get response from AI');
    }
  };

  const handleSelectConversation = async (id: string, title: string) => {
    try {
      setCurrentConversationId(id);
      setIsHistoryOpen(false);

      const res = await getMessages({ schoolId, conversationId: id }).unwrap();

      setMessages([
        {
          role: 'assistant',
          content: `Welcome back! Loading your conversation: "${title}"`,
          timestamp: new Date().toLocaleTimeString()
        },
        ...res.map((m: any) => ({
          role: m.role as 'user' | 'assistant',
          content: m.content,
          timestamp: new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }))
      ]);

      toast.success('Conversation loaded');
    } catch (error) {
      toast.error('Failed to load conversation');
    }
  };

  const handleDeleteConversation = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    try {
      await deleteConversation({ schoolId, conversationId: id }).unwrap();
      if (currentConversationId === id) {
        handleNewChat();
      }
      toast.success('Deleted');
    } catch (error) {
      toast.error('Failed to delete');
    }
  };

  const handleNewChat = () => {
    setCurrentConversationId(null);
    setMessages([{
      role: 'assistant',
      content: `Hello ${firstName}! How can I help you today?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }]);
    setIsHistoryOpen(false);
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  };

  const handleClearChat = () => {
    setMessages([{
      role: 'assistant',
      content: `Chat session refreshed. How can I continue assisting you, ${firstName}?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }]);
    toast.success('Chat cleared');
  };

  return (
    <div className="flex flex-col h-full w-full max-w-7xl mx-auto bg-transparent overflow-hidden relative" style={{ fontFamily: 'var(--font-sans)' }}>
      {/* Background Glows */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%] bg-indigo-500/10 dark:bg-indigo-600/20 rounded-full blur-[160px] pointer-events-none z-0 transition-opacity duration-1000" />

      {/* Top Bar */}
      <div className="px-4 md:px-8 py-4 md:py-6 flex items-center justify-between z-10 shrink-0">
        <div className="flex items-center gap-3">
          <Sparkles className="w-5 h-5 text-indigo-500 dark:text-blue-400" />
          <span className="text-[10px] font-semibold uppercase tracking-[0.25em] text-light-text-secondary dark:text-white/40" style={{ fontFamily: 'var(--font-heading)' }}>Agora Neural Cloud</span>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleNewChat}
            className="text-light-text-muted dark:text-white/20 hover:text-agora-blue dark:hover:text-white hover:bg-light-hover dark:hover:bg-white/5 rounded-full px-4 border border-transparent hover:border-light-border dark:hover:border-white/10 transition-all font-semibold uppercase tracking-wider text-[9px]"
          >
            New Chat
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsHistoryOpen(true)}
            className="text-light-text-muted dark:text-white/20 hover:text-agora-blue dark:hover:text-white hover:bg-light-hover dark:hover:bg-white/5 rounded-full px-2 md:px-4 border border-transparent hover:border-light-border dark:hover:border-white/10 transition-all"
          >
            <History className="w-4 h-4 md:mr-2" />
            <span className="text-[9px] font-semibold uppercase tracking-wider hidden md:inline">Chat History</span>
          </Button>
        </div>
      </div>

      {/* Chat Messages / Welcome Area */}
      <div className={cn(
        "flex-1 relative flex flex-col z-10 min-h-0",
        messages.length === 1 ? "justify-center" : "overflow-y-auto"
      )}>
        {messages.length === 1 ? (
          <div className="flex flex-col items-center justify-center text-center px-4 md:px-8 py-6 md:py-10 animate-in fade-in zoom-in-[0.98] duration-1000">
            <FadeInUp duration={0.8} delay={0.1} className="flex flex-col items-center">
              <div className="mb-6 relative">
                <div className="absolute inset-0 bg-indigo-500/20 blur-2xl rounded-full animate-pulse" />
                <Sparkles className="w-12 h-12 text-indigo-500 dark:text-blue-400 relative z-10" />
              </div>
              <p className="text-[9px] items-center uppercase font-semibold tracking-[0.3em] text-light-text-muted dark:text-white/30 mb-2">Authenticated: {firstName}</p>
              <h2 className="text-xl md:text-3xl font-semibold text-light-text-primary dark:text-white tracking-tighter mb-6 md:mb-10 leading-tight px-4" style={{ fontFamily: 'var(--font-heading)' }}>
                How can I help, <span className="text-agora-blue">{firstName}?</span>
              </h2>

              <div className="hidden md:grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl w-full px-4">
                {[
                  {
                    title: "Lesson Planning",
                    desc: "Curriculum-aligned structures for your specific subjects",
                    icon: "📚",
                    color: "bg-blue-500/10 dark:bg-blue-500/20",
                    prompt: "Help me create a detailed lesson plan for "
                  },
                  {
                    title: "Assessment Prep",
                    desc: "Draft multi-format questions for student evaluations",
                    icon: "📝",
                    color: "bg-purple-500/10 dark:bg-purple-500/20",
                    prompt: "Help me generate quiz questions on "
                  },
                  {
                    title: "Curriculum Insight",
                    desc: "Deep analysis of NERDC standards and learning paths",
                    icon: "🎯",
                    color: "bg-emerald-500/10 dark:bg-emerald-500/20",
                    prompt: "Tell me more about curriculum standards for "
                  }
                ].map((card, i) => (
                  <button
                    key={i}
                    onClick={() => setInputValue(card.prompt)}
                    className="group relative flex flex-col items-start p-4 md:p-6 rounded-2xl md:rounded-[2rem] bg-light-card/40 dark:bg-white/[0.03] border border-light-border dark:border-white/10 hover:border-agora-blue/50 transition-all text-left overflow-hidden min-h-[100px] md:min-h-[160px] hover:translate-y-[-4px] shadow-sm hover:shadow-xl hover:shadow-indigo-500/5"
                  >
                    <div className={cn("absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-10 dark:group-hover:opacity-100 transition-opacity duration-500", card.color)} />
                    <span className="text-xl md:text-2xl mb-2 md:mb-4 z-10">{card.icon}</span>
                    <h3 className="text-sm md:text-base font-semibold text-light-text-primary dark:text-white mb-1 md:mb-2 leading-tight z-10" style={{ fontFamily: 'var(--font-heading)' }}>{card.title}</h3>
                    <p className="text-[10px] md:text-[11px] text-light-text-secondary dark:text-white/40 font-medium z-10 leading-relaxed line-clamp-2 md:line-clamp-none">{card.desc}</p>
                  </button>
                ))}
              </div>
            </FadeInUp>
          </div>
        ) : (
          <div className="px-4 md:px-8 space-y-6 md:space-y-10 py-4 md:py-8">
            {messages.map((msg, idx) => (
              idx === 0 ? null : (
                <FadeInUp key={idx} duration={0.4} delay={0}>
                  <div className={cn(
                    "flex gap-6 group",
                    msg.role === 'user' ? "flex-row-reverse" : "flex-row"
                  )}>
                    <div className={cn(
                      "w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg transition-transform group-hover:scale-110",
                      msg.role === 'assistant'
                        ? "bg-gradient-to-br from-indigo-600 to-blue-700 text-white"
                        : "bg-light-card dark:bg-white/10 border border-light-border dark:border-white/10 text-light-text-primary dark:text-white"
                    )}>
                      {msg.role === 'assistant' ? <Bot size={20} /> : <User size={20} />}
                    </div>

                    <div className={cn(
                      "flex flex-col max-w-[85%] md:max-w-[75%] gap-2",
                      msg.role === 'user' ? "items-end text-right" : "items-start text-left"
                    )}>
                      <div className={cn(
                        "p-3 md:p-5 rounded-2xl md:rounded-[2rem] text-sm md:text-[15px] leading-relaxed relative border",
                        msg.role === 'user'
                          ? "bg-agora-blue text-white rounded-tr-none border-blue-400/20 shadow-lg shadow-blue-500/10"
                          : "bg-light-card/40 dark:bg-white/[0.04] text-light-text-primary dark:text-white/90 border-light-border dark:border-white/10 rounded-tl-none backdrop-blur-md"
                      )}>
                        <div className="whitespace-pre-wrap font-medium">
                          {msg.content}
                        </div>
                      </div>

                      <div className="flex items-center gap-3 px-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <span className="text-[10px] text-light-text-muted dark:text-white/30 uppercase font-semibold tracking-widest">
                          {msg.timestamp}
                        </span>
                        {msg.role === 'assistant' && (
                          <button
                            onClick={() => handleCopy(msg.content)}
                            className="text-light-text-muted dark:text-white/30 hover:text-agora-blue dark:hover:text-white transition-colors p-1"
                          >
                            <Copy size={12} />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </FadeInUp>
              )
            ))}

            {isLoading && (
              <div className="flex gap-6 flex-row animate-in fade-in duration-500">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-600 to-blue-700 text-white flex items-center justify-center flex-shrink-0 animate-pulse">
                  <Bot size={20} />
                </div>
                <div className="bg-light-card/40 dark:bg-white/5 px-6 py-5 rounded-[2rem] rounded-tl-none border border-light-border dark:border-white/10 flex gap-2 items-center backdrop-blur-sm">
                  <div className="w-2 h-2 rounded-full bg-agora-blue animate-bounce [animation-duration:800ms]" style={{ animationDelay: '0ms' }} />
                  <div className="w-2 h-2 rounded-full bg-agora-blue animate-bounce [animation-duration:800ms]" style={{ animationDelay: '200ms' }} />
                  <div className="w-2 h-2 rounded-full bg-agora-blue animate-bounce [animation-duration:800ms]" style={{ animationDelay: '400ms' }} />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} className="h-4" />
          </div>
        )}
      </div>

      {/* Redesigned Input Area */}
      <div className="p-2 md:p-12 z-20 shrink-0 pb-6 md:pb-12">
        <div className="max-w-4xl mx-auto relative px-2 md:px-4">
          <div className="relative group flex flex-col bg-light-input dark:bg-[#141416]/95 backdrop-blur-3xl p-1.5 md:p-2 rounded-[1.8rem] md:rounded-[2.8rem] border border-light-border dark:border-white/10 shadow-[0_10px_30px_-12px_rgba(0,0,0,0.1)] dark:shadow-[0_40px_80px_-20px_rgba(0,0,0,0.6)] transition-all duration-300 ">
            <div className="flex items-center">
              <button className="p-4 rounded-full text-light-text-muted dark:text-white/20 hover:text-agora-blue dark:hover:text-white transition-all shrink-0 hover:bg-light-hover dark:hover:bg-white/5">
                <Paperclip size={15} />
              </button>

              <input
                placeholder={`Hi ${firstName}, what can I do for you today?`}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                className="flex-1 h-13 bg-transparent text-light-text-primary dark:text-white placeholder:text-light-text-muted dark:placeholder:text-white/15 focus:outline-none px-2 text-[15px] font-medium"
              />

              <div className="flex items-center ml-5 gap-2 pr-3">
                <Button
                  onClick={handleSendMessage}
                  disabled={!inputValue.trim() || isLoading}
                  className="w-10 h-10 md:w-14 md:h-14 p-0 rounded-full bg-agora-blue dark:bg-indigo-600 hover:bg-agora-blue/90 dark:hover:bg-indigo-500 text-white shadow-lg shadow-blue-500/10 active:scale-90 transition-all shrink-0 border-none"
                >
                  {isLoading ? <Loader2 className="w-5 h-5 md:w-6 md:h-6 animate-spin" /> : <Send className="w-4 h-4 md:w-6 md:h-6" />}
                </Button>
              </div>
            </div>
          </div>
          <div className="mt-5 flex justify-center items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="w-1 h-1 rounded-full bg-indigo-500/40" />
              <p className="text-[9px] text-light-text-muted dark:text-white/20 font-semibold uppercase tracking-[0.25em]">Agora Engine v4.2</p>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-1 h-1 rounded-full bg-indigo-500/40" />
              <p className="text-[9px] text-light-text-muted dark:text-white/20 font-semibold uppercase tracking-[0.25em]">Context Locked</p>
            </div>
          </div>
        </div>
      </div>


      {/* History Drawer Overlay */}
      <AnimatePresence>
        {isHistoryOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsHistoryOpen(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm z-[100]"
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="absolute right-0 top-0 bottom-0 w-80 bg-light-card dark:bg-[#0a0a0b] border-l border-light-border dark:border-white/10 z-[101] shadow-2xl flex flex-col"
            >
              <div className="p-6 border-b border-light-border dark:border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <History className="w-5 h-5 text-agora-blue" />
                  <h3 className="font-semibold text-light-text-primary dark:text-white">History</h3>
                </div>
                <button
                  onClick={() => setIsHistoryOpen(false)}
                  className="p-2 hover:bg-light-hover dark:hover:bg-white/5 rounded-full transition-colors"
                >
                  <X className="w-5 h-5 text-light-text-muted dark:text-white/40" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-2">
                {!historyData || historyData.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-40 text-center space-y-2">
                    <MessageSquare className="w-8 h-8 text-light-text-muted/20 dark:text-white/5" />
                    <p className="text-xs text-light-text-muted dark:text-white/20">No history yet</p>
                  </div>
                ) : (
                  historyData.map((chat: any) => (
                    <div
                      key={chat.id}
                      onClick={() => handleSelectConversation(chat.id, chat.title)}
                      className={cn(
                        "group relative p-4 rounded-2xl border transition-all cursor-pointer",
                        currentConversationId === chat.id
                          ? "bg-agora-blue/5 border-agora-blue/30"
                          : "bg-light-hover/30 dark:bg-white/[0.02] border-transparent hover:border-light-border dark:hover:border-white/10"
                      )}
                    >
                      <div className="flex flex-col gap-1 pr-8">
                        <span className="text-[13px] font-semibold text-light-text-primary dark:text-white/90 truncate leading-tight">
                          {chat.title}
                        </span>
                        <span className="text-[10px] text-light-text-muted dark:text-white/30">
                          {new Date(chat.updatedAt).toLocaleDateString()}
                        </span>
                      </div>
                      <button
                        onClick={(e) => handleDeleteConversation(e, chat.id)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 p-2 opacity-0 group-hover:opacity-100 hover:text-red-500 transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))
                )}
              </div>

              <div className="p-4 border-t border-light-border dark:border-white/10">
                <Button
                  onClick={handleNewChat}
                  className="w-full bg-agora-blue hover:bg-agora-blue/90 text-white rounded-xl py-6"
                >
                  New Conversation
                </Button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};
