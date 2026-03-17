import { apiSlice } from './apiSlice';

// Enums
export enum SubscriptionTier {
  FREE = 'FREE',
  PRO = 'PRO',
  PRO_PLUS = 'PRO_PLUS',
  CUSTOM = 'CUSTOM',
}

export enum ToolStatus {
  ACTIVE = 'ACTIVE',
  TRIAL = 'TRIAL',
  EXPIRED = 'EXPIRED',
  DISABLED = 'DISABLED',
}

// Types
export interface ToolDto {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  icon: string | null;
  monthlyPrice: number;
  yearlyPrice: number;
  isCore: boolean;
  isActive: boolean;
  features: { name: string; description: string }[] | null;
  targetRoles: string[];
}

export interface SchoolToolAccessDto {
  id: string;
  toolId: string;
  tool: ToolDto;
  status: ToolStatus;
  trialEndsAt: string | null;
  activatedAt: string | null;
  expiresAt: string | null;
}

export interface SubscriptionDto {
  id: string;
  schoolId: string;
  tier: SubscriptionTier;
  startDate: string;
  endDate: string | null;
  isActive: boolean;
  maxStudents: number;
  maxTeachers: number;
  maxAdmins: number;
  aiCredits: number;
  aiCreditsUsed: number;
  aiCreditsRemaining: number;
  toolAccess: SchoolToolAccessDto[];
}

export interface SubscriptionSummaryDto {
  tier: SubscriptionTier;
  isActive: boolean;
  aiCredits: number;        // -1 = unlimited
  aiCreditsUsed: number;
  aiCreditsRemaining: number;
  limits: {
    maxStudents: number;    // -1 = unlimited
    maxTeachers: number;    // -1 = unlimited
    maxAdmins: number;      // -1 = unlimited (Enterprise only)
  };
  tools: {
    slug: string;
    name: string;
    status: ToolStatus;
    hasAccess: boolean;
  }[];
}

export interface ToolAccessResultDto {
  hasAccess: boolean;
  status: ToolStatus | null;
  tool: ToolDto | null;
  reason?: string;
  trialDaysRemaining?: number;
}

export interface AiUsageLogDto {
  id: string;
  action: string;
  creditsUsed: number;
  createdAt: string;
  user: {
    id: string;
    firstName: string | null;
    lastName: string | null;
    email: string | null;
  };
}

export interface AiCreditsResultDto {
  success: boolean;
  creditsUsed: number;
  creditsRemaining: number;
  message?: string;
}

export interface UseAiCreditsRequest {
  credits: number;
  action?: string;
}

// Response wrapper
export interface ResponseDto<T> {
  success: boolean;
  data: T;
}

export interface FeatureDto {
  text: string;
  included: boolean;
  isGlowing?: boolean;
}

export interface SubscriptionPlanDto {
  id: string;
  tierCode: SubscriptionTier;
  name: string;
  description: string | null;
  monthlyPrice: number;
  yearlyPrice: number;
  features: FeatureDto[];
  highlight: boolean;
  cta: string;
  accent: string;
  isPublic: boolean;
  customSchoolId: string | null;
  customSchool?: { name: string; subdomain: string } | null;
  maxStudents: number;
  maxTeachers: number;
  maxAdmins: number;
  aiCredits: number;
}

// API Slice
export const subscriptionsApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Get current school's subscription
    getMySubscription: builder.query<ResponseDto<SubscriptionDto>, void>({
      query: () => '/subscriptions/my-subscription',
      providesTags: ['Subscription'],
    }),

    // Get subscription summary (lightweight)
    getSubscriptionSummary: builder.query<ResponseDto<SubscriptionSummaryDto | null>, void>({
      query: () => '/subscriptions/summary',
      providesTags: ['Subscription'],
    }),

    // Check tool access
    checkToolAccess: builder.query<ResponseDto<ToolAccessResultDto>, string>({
      query: (toolSlug) => `/subscriptions/tools/${toolSlug}/access`,
      providesTags: (_result, _error, toolSlug) => [{ type: 'Subscription', id: `tool-${toolSlug}` }],
    }),

    // Get all available tools
    getAllTools: builder.query<ResponseDto<ToolDto[]>, void>({
      query: () => '/subscriptions/tools',
      providesTags: ['Subscription'],
    }),

    // Get tools for current user's role
    getMyTools: builder.query<ResponseDto<ToolDto[]>, void>({
      query: () => '/subscriptions/tools/my-tools',
      providesTags: ['Subscription'],
    }),

    // Use AI credits
    useAiCredits: builder.mutation<ResponseDto<AiCreditsResultDto>, UseAiCreditsRequest>({
      query: (body) => ({
        url: '/subscriptions/ai-credits/use',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Subscription'],
    }),

    // AI Usage History
    getAiUsageHistory: builder.query<ResponseDto<AiUsageLogDto[]>, void>({
      query: () => '/subscriptions/ai-usage',
      providesTags: ['Subscription'],
    }),

    // Plans
    getPublicPlans: builder.query<ResponseDto<SubscriptionPlanDto[]>, void>({
      query: () => '/subscription-plans/public',
      providesTags: ['SubscriptionPlan'],
    }),

    getPlansForSchool: builder.query<ResponseDto<SubscriptionPlanDto[]>, void>({
      query: () => '/subscription-plans/school',
      providesTags: ['SubscriptionPlan'],
    }),

    getAllPlansAdmin: builder.query<ResponseDto<SubscriptionPlanDto[]>, void>({
      query: () => '/subscription-plans/admin',
      providesTags: ['SubscriptionPlan'],
    }),

    createPlanAdmin: builder.mutation<ResponseDto<SubscriptionPlanDto>, Partial<SubscriptionPlanDto>>({
      query: (body) => ({
        url: '/subscription-plans/admin',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['SubscriptionPlan'],
    }),

    updatePlanAdmin: builder.mutation<ResponseDto<SubscriptionPlanDto>, { id: string; data: Partial<SubscriptionPlanDto> }>({
      query: ({ id, data }) => ({
        url: `/subscription-plans/admin/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['SubscriptionPlan'],
    }),

    deletePlanAdmin: builder.mutation<ResponseDto<void>, string>({
      query: (id) => ({
        url: `/subscription-plans/admin/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['SubscriptionPlan'],
    }),
  }),
});

// Export hooks
export const {
  useGetMySubscriptionQuery,
  useGetSubscriptionSummaryQuery,
  useCheckToolAccessQuery,
  useGetAllToolsQuery,
  useGetMyToolsQuery,
  useUseAiCreditsMutation,
  useGetPublicPlansQuery,
  useGetPlansForSchoolQuery,
  useGetAllPlansAdminQuery,
  useCreatePlanAdminMutation,
  useUpdatePlanAdminMutation,
  useDeletePlanAdminMutation,
  useGetAiUsageHistoryQuery,
} = subscriptionsApi;

