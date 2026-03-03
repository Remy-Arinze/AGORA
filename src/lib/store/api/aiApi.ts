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
    }),
});

export const {
    useGenerateLessonPlanMutation,
    useGenerateAssessmentMutation,
    useGenerateQuizMutation,
    useGradeEssayMutation,
} = aiApi;
