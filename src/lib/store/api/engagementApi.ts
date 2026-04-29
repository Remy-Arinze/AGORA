import { apiSlice } from './apiSlice';

export interface Campaign {
  id: string;
  name: string;
  subject: string;
  content: string;
  type: string;
  target: 'ALL_SCHOOLS' | 'ACTIVE_SCHOOLS' | 'INACTIVE_SCHOOLS' | 'SPECIFIC_SCHOOLS';
  targetSchools: string[];
  status: 'DRAFT' | 'SCHEDULED' | 'ACTIVE' | 'PAUSED' | 'COMPLETED' | 'CANCELLED';
  scheduledAt: string | null;
  sentAt: string | null;
  createdBy: string;
  metrics: Record<string, any> | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCampaignRequest {
  name: string;
  subject: string;
  content: string;
  type?: string;
  target?: string;
  targetSchools?: string[];
}

export const engagementApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getCampaigns: builder.query<Campaign[], void>({
      query: () => '/engagement/campaigns',
      providesTags: ['Campaigns'],
    }),
    
    getCampaign: builder.query<Campaign, string>({
      query: (id) => `/engagement/campaigns/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'Campaigns', id }],
    }),

    createCampaign: builder.mutation<Campaign, CreateCampaignRequest>({
      query: (body) => ({
        url: '/engagement/campaigns',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Campaigns'],
    }),

    activateCampaign: builder.mutation<Campaign, string>({
      query: (id) => ({
        url: `/engagement/campaigns/${id}/activate`,
        method: 'PATCH',
      }),
      invalidatesTags: ['Campaigns', { type: 'Campaigns', id: 'LIST' }],
    }),

    deleteCampaign: builder.mutation<void, string>({
      query: (id) => ({
        url: `/engagement/campaigns/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Campaigns'],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetCampaignsQuery,
  useGetCampaignQuery,
  useCreateCampaignMutation,
  useActivateCampaignMutation,
  useDeleteCampaignMutation,
} = engagementApi;
