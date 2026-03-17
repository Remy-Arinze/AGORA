import { apiSlice } from './apiSlice';

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
