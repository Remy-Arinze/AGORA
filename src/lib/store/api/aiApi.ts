import { apiSlice } from './apiSlice';
import {
    normalizeSseErrorData,
    streamErrorPayloadFromHttp,
    type AiChatStreamErrorPayload,
} from '@/lib/ai-chat-errors';

export type { AiChatStreamErrorPayload };

export const aiApi = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        generateLessonPlan: builder.mutation<
            any,
            {
                schoolId: string;
                body: {
                    topic: string;
                    subject: string;
                    gradeLevel: string;
                    objectives: string[];
                    duration?: number;
                };
            }
        >({
            query: ({ schoolId, body }) => ({
                url: `/schools/${schoolId}/ai/lesson-plan`,
                method: 'POST',
                body,
            }),
        }),
        generateAssessment: builder.mutation<
            any,
            {
                schoolId: string;
                body: {
                    topic: string;
                    subject: string;
                    gradeLevel: string;
                    questionCount?: number;
                    questionTypes?: ('multiple_choice' | 'short_answer' | 'essay')[];
                    difficulty?: 'easy' | 'medium' | 'hard' | 'mixed';
                    curriculum?: string;
                };
            }
        >({
            query: ({ schoolId, body }) => ({
                url: `/schools/${schoolId}/ai/assessment`,
                method: 'POST',
                body,
            }),
        }),
        generateQuiz: builder.mutation<
            any,
            {
                schoolId: string;
                body: {
                    topic: string;
                    subject: string;
                    gradeLevel: string;
                    questionCount?: number;
                    questionTypes?: ('multiple_choice' | 'true_false' | 'short_answer')[];
                    difficulty?: 'easy' | 'medium' | 'hard';
                };
            }
        >({
            query: ({ schoolId, body }) => ({
                url: `/schools/${schoolId}/ai/quiz`,
                method: 'POST',
                body,
            }),
        }),
        gradeEssay: builder.mutation<
            any,
            {
                schoolId: string;
                body: {
                    essay: string;
                    prompt: string;
                    rubric?: string;
                    maxScore?: number;
                    subject: string;
                    gradeLevel: string;
                };
            }
        >({
            query: ({ schoolId, body }) => ({
                url: `/schools/${schoolId}/ai/grade-essay`,
                method: 'POST',
                body,
            }),
        }),
        // Legacy non-streaming chat (kept for backward compat)
        askAi: builder.mutation<
            { response: string; conversationId: string },
            {
                schoolId: string;
                body: {
                    messages: { role: 'user' | 'assistant' | 'system'; content: string }[];
                    conversationId?: string;
                };
            }
        >({
            query: ({ schoolId, body }) => ({
                url: `/schools/${schoolId}/ai/chat`,
                method: 'POST',
                body,
            }),
            invalidatesTags: ['AiHistory'],
        }),
        getChatHistory: builder.query<any[], { schoolId: string }>({
            query: ({ schoolId }) => `/schools/${schoolId}/ai/history`,
            providesTags: ['AiHistory'],
        }),
        getChatMessages: builder.query<any[], { schoolId: string; conversationId: string }>({
            query: ({ schoolId, conversationId }) => `/schools/${schoolId}/ai/history/${conversationId}`,
            providesTags: (result, error, { conversationId }) => [{ type: 'AiHistory', id: conversationId }],
        }),
        deleteConversation: builder.mutation<{ success: boolean }, { schoolId: string; conversationId: string }>({
            query: ({ schoolId, conversationId }) => ({
                url: `/schools/${schoolId}/ai/history/${conversationId}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['AiHistory'],
        }),
    }),
});

export const {
    useGenerateLessonPlanMutation,
    useGenerateAssessmentMutation,
    useGenerateQuizMutation,
    useGradeEssayMutation,
    useAskAiMutation,
    useGetChatHistoryQuery,
    useGetChatMessagesQuery,
    useLazyGetChatMessagesQuery,
    useDeleteConversationMutation,
} = aiApi;

// ─── SSE Streaming Types ──────────────────────────────────────────────────────

export interface SSEToolStartEvent {
    toolName: string;
    toolDisplayName: string;
    args: Record<string, any>;
}

export interface SSEToolResultEvent {
    toolName: string;
    toolDisplayName: string;
    result: any;
}

export interface SSEDoneEvent {
    conversationId?: string;
    usage?: any;
}

export type SSEEventType = 'token' | 'tool_start' | 'tool_result' | 'done' | 'error' | 'thinking' | 'conversation_id';

export interface SSECallbacks {
    onToken: (token: string) => void;
    onToolStart: (data: SSEToolStartEvent) => void;
    onToolResult: (data: SSEToolResultEvent) => void;
    onThinking: (message: string) => void;
    onConversationId: (id: string) => void;
    onDone: (data: SSEDoneEvent) => void;
    onError: (payload: AiChatStreamErrorPayload) => void;
}

/**
 * SSE Chat Stream client — connects to POST /ai/chat/stream via fetch + ReadableStream
 * This is the primary way the frontend communicates with the AI now
 */
export async function streamAiChat(
    schoolId: string,
    messages: { role: 'user' | 'assistant' | 'system'; content: string }[],
    callbacks: SSECallbacks,
    conversationId?: string,
    abortSignal?: AbortSignal,
    token?: string
): Promise<void> {
    const envUrl = typeof process !== 'undefined' && process.env.NEXT_PUBLIC_API_URL;
    const baseUrl = envUrl || 'http://localhost:4000';

    // Get auth token from Redux store fallback if not provided
    let authToken = token || '';
    if (!authToken) {
        try {
            const persistedState = localStorage.getItem('persist:root');
            if (persistedState) {
                const parsed = JSON.parse(persistedState);
                const authState = JSON.parse(parsed.auth || '{}');
                authToken = authState.token || '';
            }
        } catch {
            // Fallback: token will be empty
        }
    }

    const url = `${baseUrl}/schools/${schoolId}/ai/chat/stream`;

    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
        },
        body: JSON.stringify({ messages, conversationId }),
        signal: abortSignal,
    });

    if (!response.ok) {
        const errorText = await response.text();
        callbacks.onError(streamErrorPayloadFromHttp(response.status, errorText));
        return;
    }

    const reader = response.body?.getReader();
    if (!reader) {
        callbacks.onError({
            code: 'LOIS_PROVIDER',
            title: 'Stream unavailable',
            message: 'Your browser could not open the reply stream. Try refreshing the page.',
        });
        return;
    }

    const decoder = new TextDecoder();
    let buffer = '';
    let sawTerminalEvent = false;
    let conversationIdFromStream = '';

    const parseSseBuffer = (): void => {
        const lines = buffer.split('\n');
        buffer = '';

        let currentEvent = '';
        let currentData = '';

        for (const line of lines) {
            if (line.startsWith('event: ')) {
                currentEvent = line.slice(7).trim();
            } else if (line.startsWith('data: ')) {
                currentData = line.slice(6).trim();
            } else if (line === '' && currentEvent && currentData) {
                try {
                    const parsed = JSON.parse(currentData);

                    switch (currentEvent as SSEEventType) {
                        case 'token':
                            callbacks.onToken(parsed.token);
                            break;
                        case 'tool_start':
                            callbacks.onToolStart(parsed);
                            break;
                        case 'tool_result':
                            callbacks.onToolResult(parsed);
                            break;
                        case 'thinking':
                            callbacks.onThinking(parsed.message);
                            break;
                        case 'conversation_id':
                            if (parsed.conversationId) {
                                conversationIdFromStream = parsed.conversationId;
                            }
                            callbacks.onConversationId(parsed.conversationId);
                            break;
                        case 'done':
                            sawTerminalEvent = true;
                            callbacks.onDone(parsed);
                            break;
                        case 'error':
                            sawTerminalEvent = true;
                            callbacks.onError(normalizeSseErrorData(parsed));
                            break;
                    }
                } catch {
                    // Skip malformed events
                }
                currentEvent = '';
                currentData = '';
            } else if (line !== '' && !line.startsWith('event:') && !line.startsWith('data:')) {
                buffer = line;
            }
        }

        if (currentEvent || currentData) {
            if (currentEvent) buffer += `event: ${currentEvent}\n`;
            if (currentData) buffer += `data: ${currentData}\n`;
        }
    };

    try {
        while (true) {
            const { done, value } = await reader.read();
            if (done) {
                buffer += decoder.decode(new Uint8Array(0), { stream: false });
                parseSseBuffer();
                break;
            }

            buffer += decoder.decode(value, { stream: true });
            parseSseBuffer();
        }

        if (!sawTerminalEvent) {
            callbacks.onDone({ conversationId: conversationIdFromStream || '' });
        }
    } catch (error: unknown) {
        const err = error as { name?: string; message?: string };
        if (err?.name === 'AbortError') {
            return;
        }
        if (!sawTerminalEvent) {
            const msg = err?.message || '';
            const lower = msg.toLowerCase();
            const networkish =
                lower.includes('fetch') ||
                lower.includes('network') ||
                lower.includes('failed to fetch') ||
                lower.includes('load failed');
            callbacks.onError({
                code: networkish ? 'LOIS_NETWORK' : 'LOIS_UNKNOWN',
                title: networkish ? 'Connection' : 'Interrupted',
                message: networkish
                    ? "We could not reach Agora. Check your connection and try again."
                    : 'The reply was interrupted. Try sending your message again.',
            });
        }
    }
}
