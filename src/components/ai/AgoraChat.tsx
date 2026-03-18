'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  Send,
  Paperclip,
  Trash2,
  Sparkles,
  Bot,
  User,
  Loader2,
  Copy,
  History,
  X,
  MessageSquare,
  FileText,
  FileQuestion,
  BookOpen,
  ClipboardList,
  Layers,
  Zap,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  StopCircle,
  Plus,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { FadeInUp } from '@/components/ui/FadeInUp';
import { cn } from '@/lib/utils';
import {
  useGetChatHistoryQuery,
  useGetChatMessagesQuery,
  useLazyGetChatMessagesQuery,
  useDeleteConversationMutation,
  streamAiChat,
  SSEToolStartEvent,
  SSEToolResultEvent,
} from '@/lib/store/api/aiApi';
import { useGetMyTeacherProfileQuery } from '@/lib/store/api/schoolAdminApi';
import toast from 'react-hot-toast';

import { useTheme } from '@/contexts/ThemeContext';
import { useSelector } from 'react-redux';
import { RootState } from '@/lib/store/store';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  isStreaming?: boolean;
  toolEvents?: ToolEvent[];
}

interface ToolEvent {
  type: 'thinking' | 'tool_start' | 'tool_result';
  toolName?: string;
  toolDisplayName?: string;
  args?: Record<string, any>;
  result?: any;
  message?: string;
}

// ─── Tool Result Renderers ────────────────────────────────────────────────────

const ToolIcon = ({ toolName }: { toolName: string }) => {
  const icons: Record<string, React.ReactNode> = {
    generate_lesson_plan: <FileText className="w-4 h-4" />,
    generate_quiz: <FileQuestion className="w-4 h-4" />,
    generate_flashcards: <Layers className="w-4 h-4" />,
    generate_summary: <BookOpen className="w-4 h-4" />,
    generate_assessment: <ClipboardList className="w-4 h-4" />,
  };
  return <>{icons[toolName] || <Zap className="w-4 h-4" />}</>;
};

const ThreeDotTyping = () => (
  <div className="flex gap-1 items-center px-1">
    {[0, 1, 2].map((i) => (
      <motion.div
        key={i}
        animate={{
          scale: [1, 1.4, 1],
          opacity: [0.4, 1, 0.4]
        }}
        transition={{
          duration: 0.8,
          repeat: Infinity,
          delay: i * 0.15
        }}
        className="w-1.5 h-1.5 rounded-full bg-indigo-500 dark:bg-indigo-400 shadow-[0_0_8px_rgba(99,102,241,0.3)]"
      />
    ))}
  </div>
);

const BrainIndicator = ({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) => {
  const dimensions = {
    sm: 'w-6 h-6',
    md: 'w-10 h-10',
    lg: 'w-16 h-16'
  };

  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className={cn(
        "relative flex items-center justify-center rounded-2xl bg-white dark:bg-white/10 shadow-lg border border-indigo-100 dark:border-white/10 overflow-hidden",
        dimensions[size]
      )}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-blue-600/10 animate-pulse" />
      <motion.img
        src="/assets/logos/agora_main.png"
        alt="Lois Brain"
        className="w-[70%] h-[70%] object-contain relative z-10"
        animate={{
          scale: [1, 1.05, 1],
          filter: ["brightness(1)", "brightness(1.2)", "brightness(1)"]
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
    </motion.div>
  );
};

const ToolCard = ({ event }: { event: ToolEvent }) => {
  const [expanded, setExpanded] = useState(false);

  if (event.type === 'thinking') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-indigo-50/60 dark:bg-indigo-500/[0.08] border border-indigo-100 dark:border-indigo-500/20"
      >
        <div className="flex relative items-center justify-center">
          <div className="absolute inset-0 bg-indigo-500/40 blur-sm rounded-full animate-ping" />
          <div className="w-2 h-2 rounded-full bg-indigo-500 relative z-10" />
        </div>
        <span className="text-sm text-indigo-700 dark:text-indigo-300 font-medium italic">
          {event.message}
        </span>
      </motion.div>
    );
  }

  if (event.type === 'tool_start') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-amber-50/60 dark:bg-amber-500/[0.08] border border-amber-200/60 dark:border-amber-500/20"
      >
        <div className="p-1.5 rounded-lg bg-amber-100 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400">
          <ToolIcon toolName={event.toolName || ''} />
        </div>
        <div className="flex-1">
          <span className="text-sm font-semibold text-amber-800 dark:text-amber-300">
            {event.toolDisplayName}
          </span>
          <p className="text-[11px] text-amber-600/70 dark:text-amber-400/60 font-medium">
            Working on: {event.args?.topic || event.args?.subject || 'Processing...'}
          </p>
        </div>
        <ThreeDotTyping />
      </motion.div>
    );
  }

  if (event.type === 'tool_result' && event.result) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl overflow-hidden border border-emerald-200/60 dark:border-emerald-500/20 bg-gradient-to-br from-emerald-50/80 to-white dark:from-emerald-500/[0.06] dark:to-transparent"
      >
        <button
          onClick={() => setExpanded(!expanded)}
          className="w-full flex items-center gap-3 px-4 py-3 hover:bg-emerald-50/50 dark:hover:bg-emerald-500/[0.04] transition-colors"
        >
          <div className="p-1.5 rounded-lg bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <span className="text-sm font-semibold text-emerald-800 dark:text-emerald-300 flex-1 text-left">
            {event.toolDisplayName} — Complete
          </span>
          {expanded ? (
            <ChevronDown className="w-4 h-4 text-emerald-500" />
          ) : (
            <ChevronRight className="w-4 h-4 text-emerald-500" />
          )}
        </button>

        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="px-4 pb-4 max-h-[320px] overflow-y-auto scrollbar-thin">
                <ToolResultContent toolName={event.toolName || ''} result={event.result} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    );
  }

  return null;
};

const ToolResultContent = ({ toolName, result }: { toolName: string; result: any }) => {
  if (toolName === 'generate_lesson_plan') {
    return (
      <div className="space-y-3 text-sm">
        {result.title && (
          <h4 className="font-bold text-emerald-900 dark:text-emerald-300 text-base">{result.title}</h4>
        )}
        {result.objectives && (
          <div>
            <p className="text-[10px] uppercase tracking-widest font-black text-emerald-600/70 dark:text-emerald-400/60 mb-1">Objectives</p>
            <ul className="space-y-1">
              {result.objectives.map((obj: string, i: number) => (
                <li key={i} className="flex gap-2 text-emerald-800/80 dark:text-emerald-300/80">
                  <span className="text-emerald-500">•</span> {obj}
                </li>
              ))}
            </ul>
          </div>
        )}
        {result.introduction && (
          <div>
            <p className="text-[10px] uppercase tracking-widest font-black text-emerald-600/70 dark:text-emerald-400/60 mb-1">Introduction</p>
            <p className="text-emerald-800/80 dark:text-emerald-300/80 italic leading-relaxed">"{result.introduction}"</p>
          </div>
        )}
        {result.mainContent && (
          <div>
            <p className="text-[10px] uppercase tracking-widest font-black text-emerald-600/70 dark:text-emerald-400/60 mb-1">Activities</p>
            <div className="space-y-2">
              {result.mainContent.map((item: any, i: number) => (
                <div key={i} className="p-2 rounded-xl bg-white/60 dark:bg-black/20 border border-emerald-100 dark:border-emerald-500/10">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-emerald-900 dark:text-emerald-300 text-xs">{item.activity}</span>
                    <span className="text-[10px] text-emerald-500 font-bold">{item.duration}</span>
                  </div>
                  <p className="text-xs text-emerald-700/70 dark:text-emerald-400/60">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  if (toolName === 'generate_quiz' || toolName === 'generate_assessment') {
    const questions = Array.isArray(result) ? result : result?.questions || [];
    return (
      <div className="space-y-3">
        {questions.slice(0, 5).map((q: any, i: number) => (
          <div key={i} className="p-3 rounded-xl bg-white/60 dark:bg-black/20 border border-emerald-100 dark:border-emerald-500/10 text-sm">
            <p className="font-semibold text-emerald-900 dark:text-emerald-300 mb-2 text-xs">{i + 1}. {q.question}</p>
            {q.options && (
              <div className="grid gap-1 pl-2 mb-2">
                {q.options.map((opt: string, j: number) => (
                  <div key={j} className="text-xs text-emerald-700/70 dark:text-emerald-400/60 flex items-center gap-1.5">
                    <div className="w-1 h-1 rounded-full bg-emerald-400/40" /> {opt}
                  </div>
                ))}
              </div>
            )}
            <div className="text-[10px] font-black uppercase text-green-600 dark:text-green-400 tracking-tighter">
              ANS: {q.correctAnswer}
            </div>
          </div>
        ))}
        {questions.length > 5 && (
          <p className="text-xs text-emerald-500 font-semibold text-center">+{questions.length - 5} more questions</p>
        )}
      </div>
    );
  }

  if (toolName === 'generate_flashcards') {
    const cards = Array.isArray(result) ? result : result?.flashcards || [];
    return (
      <div className="space-y-2">
        {cards.slice(0, 5).map((card: any, i: number) => (
          <div key={i} className="p-3 rounded-xl bg-white/60 dark:bg-black/20 border border-emerald-100 dark:border-emerald-500/10 text-sm">
            <p className="font-semibold text-emerald-900 dark:text-emerald-300 text-xs mb-1">Q: {card.front}</p>
            <p className="text-xs text-emerald-700/70 dark:text-emerald-400/60">A: {card.back}</p>
            {card.hint && <p className="text-[10px] italic text-emerald-500 mt-1">💡 {card.hint}</p>}
          </div>
        ))}
        {cards.length > 5 && (
          <p className="text-xs text-emerald-500 font-semibold text-center">+{cards.length - 5} more cards</p>
        )}
      </div>
    );
  }

  // Fallback: render as formatted JSON
  if (typeof result === 'string') {
    return <p className="text-sm text-emerald-800/80 dark:text-emerald-300/80 whitespace-pre-wrap">{result}</p>;
  }

  return (
    <pre className="text-xs text-emerald-700/80 dark:text-emerald-400/70 whitespace-pre-wrap bg-white/40 dark:bg-black/20 p-3 rounded-xl overflow-x-auto">
      {JSON.stringify(result, null, 2)}
    </pre>
  );
};

// ─── Main Chat Component ──────────────────────────────────────────────────────

interface AgoraChatProps {
  schoolId: string;
  initialConversationId?: string;
  variant?: 'default' | 'minimal';
}

export const AgoraChat: React.FC<AgoraChatProps> = ({
  schoolId,
  initialConversationId,
  variant = 'default'
}) => {
  const { theme } = useTheme();
  const user = useSelector((state: RootState) => state.auth.user);
  const token = useSelector((state: RootState) => state.auth.token);
  const { data: profileResponse } = useGetMyTeacherProfileQuery();
  const firstName = profileResponse?.data?.firstName || user?.firstName || 'Teacher';

  const [messages, setMessages] = useState<Message[]>([]);
  const [isHistoryLoading, setIsHistoryLoading] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);

  const { data: historyData } = useGetChatHistoryQuery({ schoolId });
  const [getMessages] = useLazyGetChatMessagesQuery();
  const [deleteConversation] = useDeleteConversationMutation();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (!initialConversationId) {
      setMessages([
        {
          role: 'assistant',
          content: `Hello ${firstName}! I'm Lois, your dedicated Agora School Space AI Assistant. How can I help you with your lessons, curriculum, or assessments today?`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } else if (initialConversationId !== currentConversationId) {
      handleSelectConversation(initialConversationId, 'Existing Chat');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialConversationId, schoolId, firstName]);

  // Sync URL with current conversation ID
  useEffect(() => {
    const url = new URL(window.location.href);
    if (currentConversationId) {
      url.searchParams.set('id', currentConversationId);
    } else {
      url.searchParams.delete('id');
    }
    window.history.replaceState(null, '', url.pathname + url.search);
  }, [currentConversationId]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // ─── SSE Streaming Send ─────────────────────────────────────────────────

  const handleSendMessage = useCallback(async () => {
    if (!inputValue.trim() || isStreaming) return;

    const userMessage: Message = {
      role: 'user',
      content: inputValue,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const currentInput = inputValue;
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsStreaming(true);

    // Create placeholder for streaming assistant message  
    const streamingMessage: Message = {
      role: 'assistant',
      content: '',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isStreaming: true,
      toolEvents: [],
    };
    setMessages(prev => [...prev, streamingMessage]);

    // Prepare the chat history for the API
    const chatHistory = messages
      .slice(1) // skip welcome message
      .map(({ role, content }) => ({ role, content }));
    chatHistory.push({ role: 'user', content: currentInput });

    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    try {
      await streamAiChat(
        schoolId,
        chatHistory,
        {
          onToken: (tokenString) => {
            setMessages(prev => {
              const updated = [...prev];
              const last = updated[updated.length - 1];
              if (last && last.role === 'assistant') {
                updated[updated.length - 1] = {
                  ...last,
                  content: last.content + tokenString,
                };
              }
              return updated;
            });
          },
          onThinking: (message) => {
            setMessages(prev => {
              const updated = [...prev];
              const last = updated[updated.length - 1];
              if (last && last.role === 'assistant') {
                updated[updated.length - 1] = {
                  ...last,
                  toolEvents: [...(last.toolEvents || []), { type: 'thinking', message }],
                };
              }
              return updated;
            });
          },
          onToolStart: (data) => {
            setMessages(prev => {
              const updated = [...prev];
              const last = updated[updated.length - 1];
              if (last && last.role === 'assistant') {
                updated[updated.length - 1] = {
                  ...last,
                  toolEvents: [
                    ...(last.toolEvents || []),
                    {
                      type: 'tool_start',
                      toolName: data.toolName,
                      toolDisplayName: data.toolDisplayName,
                      args: data.args,
                    },
                  ],
                };
              }
              return updated;
            });
          },
          onToolResult: (data) => {
            setMessages(prev => {
              const updated = [...prev];
              const last = updated[updated.length - 1];
              if (last && last.role === 'assistant') {
                // Replace tool_start with tool_result, remove thinking
                const filteredEvents = (last.toolEvents || []).filter(
                  e => e.type !== 'thinking' && !(e.type === 'tool_start' && e.toolName === data.toolName)
                );
                updated[updated.length - 1] = {
                  ...last,
                  toolEvents: [
                    ...filteredEvents,
                    {
                      type: 'tool_result',
                      toolName: data.toolName,
                      toolDisplayName: data.toolDisplayName,
                      result: data.result,
                    },
                  ],
                };
              }
              return updated;
            });
          },
          onDone: (data) => {
            if (!currentConversationId && data.conversationId) {
              setCurrentConversationId(data.conversationId);
            }
            setMessages(prev => {
              const updated = [...prev];
              const last = updated[updated.length - 1];
              if (last && last.role === 'assistant') {
                updated[updated.length - 1] = { ...last, isStreaming: false };
              }
              return updated;
            });
            setIsStreaming(false);
          },
          onError: (message) => {
            toast.error(message || 'Failed to get response from AI');
            setMessages(prev => {
              const updated = [...prev];
              const last = updated[updated.length - 1];
              if (last && last.role === 'assistant' && !last.content) {
                // Remove empty streaming message
                return updated.slice(0, -1);
              }
              if (last && last.role === 'assistant') {
                return [...updated.slice(0, -1), { ...last, isStreaming: false }];
              }
              return updated;
            });
            setIsStreaming(false);
          },
        },
        currentConversationId || undefined,
        abortController.signal,
        token || undefined
      );
    } catch (error: any) {
      if (error.name !== 'AbortError') {
        toast.error('Connection to AI failed');
        setIsStreaming(false);
      }
    }
  }, [inputValue, isStreaming, messages, schoolId, currentConversationId, token]);

  const handleStopStreaming = () => {
    abortControllerRef.current?.abort();
    setIsStreaming(false);
    setMessages(prev => {
      const updated = [...prev];
      const last = updated[updated.length - 1];
      if (last && last.role === 'assistant') {
        updated[updated.length - 1] = { ...last, isStreaming: false };
      }
      return updated;
    });
  };

  // ─── History Management ─────────────────────────────────────────────────

  const handleSelectConversation = async (id: string, title: string) => {
    try {
      setIsHistoryLoading(true);
      setCurrentConversationId(id);
      setIsHistoryOpen(false);

      const res = await getMessages({ schoolId, conversationId: id }).unwrap();

      setMessages([
        {
          role: 'assistant',
          content: `Welcome back! Loading your conversation...`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        },
        ...res.map((m: any) => ({
          role: m.role as 'user' | 'assistant',
          content: m.content,
          timestamp: new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }))
      ]);
    } catch (error: any) {
      toast.error(error?.data?.message || 'Failed to load chat history');
    } finally {
      setIsHistoryLoading(false);
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
      content: `Hello ${firstName}! I'm Lois. How can I help you today?`,
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

  // ─── Render ─────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col h-full w-full max-w-7xl mx-auto bg-transparent overflow-hidden relative" style={{ fontFamily: 'var(--font-sans)' }}>
      {/* Background Glows */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%] bg-indigo-500/10 dark:bg-indigo-600/20 rounded-full blur-[160px] pointer-events-none z-0 transition-opacity duration-1000" />

      {/* Top Bar */}
      <div className="px-4 md:px-8 py-4 md:py-6 flex items-center justify-between z-10 shrink-0">
        <div className="flex items-center gap-3">
          <Sparkles className="w-5 h-5 text-indigo-500 dark:text-blue-400" />
          {variant !== 'minimal' && (
            <>
              <span className="text-[10px] font-semibold uppercase tracking-[0.25em] text-light-text-secondary dark:text-white/40" style={{ fontFamily: 'var(--font-heading)' }}>Agora Neural Cloud</span>
              <div className="hidden md:flex items-center gap-1.5 ml-3 px-2.5 py-1 rounded-full bg-emerald-50/60 dark:bg-emerald-500/[0.08] border border-emerald-200/40 dark:border-emerald-500/20">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[9px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">Agentic</span>
              </div>
            </>
          )}
          {variant === 'minimal' && (
            <span className="text-[12px] font-bold uppercase tracking-widest text-indigo-500/80" style={{ fontFamily: 'var(--font-heading)' }}>Lois</span>
          )}
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

      {/* Chat Messages Area */}
      <div className="flex-1 relative flex flex-col z-10 min-h-0 overflow-y-auto scrollbar-thin scrollbar-thumb-light-border dark:scrollbar-thumb-white/10 scroll-smooth">
        {isHistoryLoading ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8 space-y-4">
            <div className="w-10 h-10 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
            <p className="text-sm italic text-light-text-muted dark:text-white/40">Loading your history with Lois...</p>
          </div>
        ) : messages.length <= 1 ? (
          <div className="flex flex-col items-center justify-center text-center px-4 py-8 md:py-16 space-y-8 md:space-y-12 animate-in fade-in zoom-in-[0.98] duration-1000">
            <FadeInUp duration={0.8} delay={0.1} className="flex flex-col items-center">
              <div className="mb-6 relative">
                <div className="absolute inset-0 bg-indigo-500/20 blur-2xl rounded-full animate-pulse" />
                <Sparkles className="w-12 h-12 text-indigo-500 dark:text-blue-400 relative z-10" />
              </div>
              <p className="text-[9px] items-center uppercase font-semibold tracking-[0.3em] text-light-text-muted dark:text-white/30 mb-2">Authenticated: {firstName}</p>
              <h2 className={cn(
                "font-semibold text-light-text-primary dark:text-white tracking-tighter mb-4 leading-tight px-4",
                variant === 'minimal' ? "text-xl md:text-2xl" : "text-xl md:text-3xl"
              )} style={{ fontFamily: 'var(--font-heading)' }}>
                How can I help, <span className="text-agora-blue">{firstName}?</span>
              </h2>
              <p className={cn(
                "text-light-text-muted dark:text-white/30 max-w-md mx-auto px-4",
                variant === 'minimal' ? "text-[10px] mb-4 md:mb-6" : "text-xs mb-6 md:mb-10"
              )}>
                I can generate lesson plans, quizzes, flashcards, assessments and more — just ask naturally.
              </p>

              <div className={cn(
                "grid grid-cols-1 gap-4 max-w-5xl w-full px-4",
                variant === 'minimal' ? "md:grid-cols-1" : "md:grid-cols-3"
              )}>
                {[
                  {
                    title: "Lesson Planning",
                    desc: "Curriculum-aligned structures for your specific subjects",
                    icon: "📚",
                    color: "bg-blue-500/10 dark:bg-blue-500/20",
                    prompt: "Create a lesson plan for Photosynthesis for SS 1 Biology"
                  },
                  {
                    title: "Quick Quiz",
                    desc: "Generate quizzes on any topic instantly",
                    icon: "📝",
                    color: "bg-purple-500/10 dark:bg-purple-500/20",
                    prompt: "Generate a 5-question quiz on Algebraic Expressions for JSS 2 Math"
                  },
                  {
                    title: "Study Materials",
                    desc: "Create flashcards and summaries for revision",
                    icon: "🎯",
                    color: "bg-emerald-500/10 dark:bg-emerald-500/20",
                    prompt: "Create flashcards on Cell Biology for SS 1"
                  }
                ].map((card, i) => (
                  <button
                    key={i}
                    onClick={() => setInputValue(card.prompt)}
                    className={cn(
                      "group relative flex flex-col items-start bg-light-card/40 dark:bg-white/[0.03] border border-light-border dark:border-white/10 hover:border-agora-blue/50 transition-all text-left overflow-hidden hover:translate-y-[-4px] shadow-sm hover:shadow-xl hover:shadow-indigo-500/5",
                      variant === 'minimal'
                        ? "p-3 rounded-xl min-h-[60px]"
                        : "p-4 md:p-6 rounded-2xl md:rounded-[2rem] min-h-[100px] md:min-h-[160px]"
                    )}
                  >
                    <div className={cn("absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-10 dark:group-hover:opacity-100 transition-opacity duration-500", card.color)} />
                    <span className={cn(
                      "z-10",
                      variant === 'minimal' ? "text-base mb-1" : "text-xl md:text-2xl mb-2 md:mb-4"
                    )}>{card.icon}</span>
                    <h3 className={cn(
                      "font-semibold text-light-text-primary dark:text-white leading-tight z-10",
                      variant === 'minimal' ? "text-[11px] mb-0.5" : "text-sm md:text-base mb-1 md:mb-2"
                    )} style={{ fontFamily: 'var(--font-heading)' }}>{card.title}</h3>
                    <p className={cn(
                      "text-light-text-secondary dark:text-white/40 font-medium z-10 leading-relaxed",
                      variant === 'minimal' ? "text-[9px] line-clamp-1" : "text-[10px] md:text-[11px] line-clamp-2 md:line-clamp-none"
                    )}>{card.desc}</p>
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
                      "flex-shrink-0 transition-transform group-hover:scale-110",
                      msg.role === 'assistant' ? "relative" : "w-10 h-10 rounded-2xl flex items-center justify-center shadow-lg bg-light-card dark:bg-white/10 border border-light-border dark:border-white/10 text-light-text-primary dark:text-white"
                    )}>
                      {msg.role === 'assistant' ? <BrainIndicator /> : <User size={20} />}
                    </div>

                    <div className={cn(
                      "flex flex-col max-w-[85%] md:max-w-[75%] gap-2",
                      msg.role === 'user' ? "items-end text-right" : "items-start text-left"
                    )}>
                      {/* Tool Events (rendered above the text for assistant) */}
                      {msg.role === 'assistant' && msg.toolEvents && msg.toolEvents.length > 0 && (
                        <div className="w-full space-y-2 mb-2">
                          {msg.toolEvents.map((event, eventIdx) => (
                            <ToolCard key={eventIdx} event={event} />
                          ))}
                        </div>
                      )}

                      {/* Message Content */}
                      {(msg.content || msg.isStreaming) && (
                        <div className={cn(
                          "p-4 md:p-6 text-sm md:text-[15px] leading-relaxed relative",
                          msg.role === 'user'
                            ? variant === 'minimal'
                              ? "bg-transparent border-none p-0 md:p-0 text-indigo-600 dark:text-indigo-400 font-bold"
                              : "bg-agora-blue text-white rounded-2xl md:rounded-[2.5rem] rounded-tr-none border border-blue-400/20 shadow-lg shadow-blue-500/10"
                            : variant === 'minimal'
                              ? "bg-transparent border-none p-0 md:p-0"
                              : "bg-light-card/40 dark:bg-white/[0.04] text-light-text-primary dark:text-white/90 border border-light-border dark:border-white/10 rounded-2xl md:rounded-[2.5rem] rounded-tl-none backdrop-blur-md"
                        )}>
                          <div className={cn(
                            "whitespace-pre-wrap font-medium",
                            msg.role === 'assistant' && variant === 'minimal' && "text-light-text-primary dark:text-white/80"
                          )}>
                            {msg.content || (msg.isStreaming && <ThreeDotTyping />)}
                            {msg.isStreaming && msg.content && (
                              <motion.span
                                animate={{ opacity: [1, 0, 1] }}
                                transition={{ duration: 0.8, repeat: Infinity }}
                                className="inline-block w-2.5 h-5 ml-1 bg-indigo-500 align-middle rounded-sm shadow-[0_0_8px_rgba(99,102,241,0.5)]"
                              />
                            )}
                          </div>
                        </div>
                      )}

                      <div className="flex items-center gap-3 px-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <span className="text-[10px] text-light-text-muted dark:text-white/30 uppercase font-semibold tracking-widest">
                          {msg.timestamp}
                        </span>
                        {msg.role === 'assistant' && !msg.isStreaming && msg.content && (
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

            <div ref={messagesEndRef} className="h-4" />
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="p-2 md:p-12 z-20 shrink-0 pb-6 md:pb-12">
        <div className="max-w-4xl mx-auto relative px-2 md:px-4">
          <div className="relative group transition-all duration-300">
            <div className="flex items-center gap-3">
              {/* Themed Input Bubble (Paperclip + Input) */}
              <div className={cn(
                "flex-1 flex items-center gap-1 transition-all duration-300",
                "bg-light-input dark:bg-white/[0.04] border border-light-border dark:border-white/10 rounded-2xl md:rounded-[2rem]"
              )}>
                <button className="p-4 rounded-full text-light-text-muted dark:text-white/20 hover:text-agora-blue dark:hover:text-white transition-all shrink-0">
                  <Paperclip size={15} />
                </button>

                <input
                  placeholder={`Hi ${firstName}, what can I do for you today?`}
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  disabled={isStreaming}
                  className="flex-1 h-13 py-2 bg-transparent !bg-transparent text-light-text-primary dark:text-white placeholder:text-light-text-muted dark:placeholder:text-white/15 focus:outline-none px-2 text-[15px] font-medium disabled:opacity-50"
                  style={{ backgroundColor: 'transparent' }}
                />
              </div>

              {/* Independent Send Button */}
              <div className="flex-shrink-0">
                <Button
                  onClick={handleSendMessage}
                  disabled={!inputValue.trim() || isStreaming}
                  className={cn(
                    "rounded-full bg-agora-blue dark:bg-indigo-600 hover:bg-agora-blue/90 dark:hover:bg-indigo-500 text-white shadow-lg shadow-blue-500/10 active:scale-95 transition-all shrink-0 border-none disabled:opacity-40",
                    variant === 'minimal' ? "w-8 h-8 md:w-9 md:h-9 p-0" : "w-10 h-10 md:w-11 md:h-11 p-0"
                  )}
                >
                  {isStreaming ? (
                    <StopCircle className={cn("animate-pulse", variant === 'minimal' ? "w-3 h-3" : "w-4 h-4 md:w-5 md:h-5")} />
                  ) : (
                    <Send className={variant === 'minimal' ? "w-3 h-3" : "w-4 h-4 md:w-5 md:h-5"} />
                  )}
                </Button>
              </div>
            </div>
          </div>
          {variant !== 'minimal' && (
            <div className="mt-5 flex justify-center items-center gap-6">
              <div className="flex items-center gap-2">
                <div className="w-1 h-1 rounded-full bg-indigo-500/40" />
                <p className="text-[9px] text-light-text-muted dark:text-white/20 font-semibold uppercase tracking-[0.25em]">Agora Engine v5.0</p>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-1 h-1 rounded-full bg-emerald-500/40" />
                <p className="text-[9px] text-light-text-muted dark:text-white/20 font-semibold uppercase tracking-[0.25em]">SSE Streaming</p>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-1 h-1 rounded-full bg-amber-500/40" />
                <p className="text-[9px] text-light-text-muted dark:text-white/20 font-semibold uppercase tracking-[0.25em]">Agentic Tools</p>
              </div>
            </div>
          )}
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
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 220 }}
              className="fixed right-0 top-0 bottom-0 w-80 md:w-96 bg-light-card/95 dark:bg-[#0D0D0F]/95 backdrop-blur-2xl border-l border-light-border/50 dark:border-white/[0.08] z-[101] shadow-[ -20px_0_50px_rgba(0,0,0,0.3)] flex flex-col"
            >
              {/* Drawer Header */}
              <div className="p-6 md:p-8 border-b border-light-border/50 dark:border-white/[0.08] flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-indigo-500/10 dark:bg-indigo-500/20 text-indigo-500">
                    <History className="w-5 h-5" />
                  </div>
                  <div className="flex flex-col">
                    <h3 className="text-base font-bold text-light-text-primary dark:text-white leading-none mb-1" style={{ fontFamily: 'var(--font-heading)' }}>Chat History</h3>
                    <p className="text-[10px] text-light-text-muted dark:text-white/30 uppercase tracking-widest font-bold">Lois Assistant</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsHistoryOpen(false)}
                  className="p-2.5 hover:bg-light-hover dark:hover:bg-white/5 rounded-full transition-all text-light-text-muted dark:text-white/40 hover:text-light-text-primary dark:hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Drawer Content */}
              <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-3 custom-scrollbar">
                {!historyData || historyData.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
                    <div className="w-16 h-16 rounded-full bg-light-hover dark:bg-white/[0.03] flex items-center justify-center">
                      <MessageSquare className="w-6 h-6 text-light-text-muted/20 dark:text-white/10" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-semibold text-light-text-primary dark:text-white/60">No history found</p>
                      <p className="text-[11px] text-light-text-muted dark:text-white/20 px-10">Your conversations with Lois will appear here.</p>
                    </div>
                  </div>
                ) : (
                  historyData.map((chat: any) => (
                    <motion.div
                      key={chat.id}
                      onClick={() => handleSelectConversation(chat.id, chat.title)}
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      className={cn(
                        "group relative p-4 rounded-[1.25rem] border transition-all cursor-pointer overflow-hidden backdrop-blur-sm",
                        currentConversationId === chat.id
                          ? "bg-indigo-500/10 border-indigo-500/30 text-indigo-500"
                          : "bg-light-hover/40 dark:bg-white/[0.02] border-transparent hover:border-light-border dark:hover:border-white/10 hover:bg-light-hover/60 dark:hover:bg-white/[0.05]"
                      )}
                    >
                      {/* Selection Indicator */}
                      {currentConversationId === chat.id && (
                        <motion.div
                          layoutId="activeHistory"
                          className="absolute left-0 top-0 bottom-0 w-1 bg-indigo-500"
                        />
                      )}

                      <div className="flex flex-col gap-1.5 pr-8">
                        <span className={cn(
                          "text-[13px] font-bold truncate leading-tight transition-colors",
                          currentConversationId === chat.id ? "text-indigo-600 dark:text-indigo-400" : "text-light-text-primary dark:text-white/80"
                        )}>
                          {chat.title || "Untitled Conversation"}
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="text-[9px] font-bold uppercase tracking-wider text-light-text-muted dark:text-white/20">
                            {new Date(chat.updatedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={(e) => handleDeleteConversation(e, chat.id)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 p-2 opacity-0 group-hover:opacity-100 text-light-text-muted dark:text-white/20 hover:text-red-500 dark:hover:text-red-400 transition-all rounded-lg hover:bg-red-500/5"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </motion.div>
                  ))
                )}
              </div>

              {/* Drawer Footer */}
              <div className="p-6 md:p-8 border-t border-light-border/50 dark:border-white/[0.08] bg-light-card/40 dark:bg-white/[0.01]">
                <Button
                  onClick={handleNewChat}
                  className="w-full bg-agora-blue hover:bg-agora-blue/90 text-white rounded-xl py-3.5 h-auto font-semibold text-xs shadow-lg shadow-blue-500/10 group active:scale-95 transition-all"
                >
                  <Plus className="w-4 h-4 mr-2 group-hover:rotate-90 transition-transform" />
                  Start New Session
                </Button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};
