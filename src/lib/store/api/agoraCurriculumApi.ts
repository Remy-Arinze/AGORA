import { apiSlice } from './apiSlice';

export interface NerdcSubject {
  id: string;
  name: string;
  code?: string;
  schoolType?: string;
  category?: string;
  description?: string;
}

export interface AgoraCurriculumSource {
  id: string;
  subjectId: string;
  gradeLevel: string;
  sourceType: 'MANUAL' | 'FILE_UPLOAD';
  fileName?: string;
  fileUrl?: string;
  fileType?: string;
  parsedData?: any;
  parseErrors?: string;
  status: 'PENDING_PARSE' | 'PARSING' | 'PARSED' | 'APPROVED' | 'REJECTED' | 'FAILED';
  manualContent?: any;
  createdBy: string;
  approvedAt?: string;
  createdAt: string;
  updatedAt: string;
  subject?: NerdcSubject;
}

export interface AgoraCurriculumTopic {
  id: string;
  curriculumId: string;
  title: string;
  description?: string;
  weekNumber: number;
  topic?: string;
  subTopics: string[];
  learningOutcomes: string[];
  studentFriendlyOutcomes: string[];
  suggestedActivities: string[];
  resources: string[];
  assessmentType?: string;
  assessmentGuidance?: string;
  duration?: string;
  order: number;
}

export interface AgoraCurriculum {
  id: string;
  subjectId: string;
  gradeLevel: string;
  version: number;
  status: 'DRAFT' | 'PUBLISHED';
  sourceIds: string[];
  consolidationNotes?: string;
  publishedAt?: string;
  publishedBy?: string;
  createdAt: string;
  updatedAt: string;
  subject?: NerdcSubject;
  topics?: AgoraCurriculumTopic[];
}

export interface CreateAgoraCurriculumSourceDto {
  subjectId: string;
  gradeLevel: string;
  sourceType: 'MANUAL' | 'FILE_UPLOAD';
  fileName?: string;
  fileUrl?: string;
  fileType?: string;
  manualContent?: any;
}

export interface ConsolidateCurriculumDto {
  subjectId: string;
  gradeLevel: string;
  sourceIds: string[];
}

export interface PublishCurriculumDto {
  status: 'DRAFT' | 'PUBLISHED';
}

export const agoraCurriculumApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getAgoraNerdcSubjects: builder.query<NerdcSubject[], { schoolType?: string; category?: string } | void>({
      query: (params) => {
        const urlParams = new URLSearchParams();
        if (params?.schoolType) urlParams.append('schoolType', params.schoolType);
        if (params?.category) urlParams.append('category', params.category);
        const queryString = urlParams.toString();
        
        return {
          url: `/agora-curriculum/subjects${queryString ? `?${queryString}` : ''}`,
          method: 'GET',
        };
      },
      transformResponse: (response: any) => response.data,
      providesTags: ['NerdcSubject'],
    }),

    getAgoraCurriculumSources: builder.query<AgoraCurriculumSource[], { subjectId?: string; gradeLevel?: string } | void>({
      query: (params) => {
        const urlParams = new URLSearchParams();
        if (params?.subjectId) urlParams.append('subjectId', params.subjectId);
        if (params?.gradeLevel) urlParams.append('gradeLevel', params.gradeLevel);
        const queryString = urlParams.toString();
        
        return {
          url: `/agora-curriculum/sources${queryString ? `?${queryString}` : ''}`,
          method: 'GET',
        };
      },
      transformResponse: (response: any) => response.data,
      providesTags: ['AgoraCurriculumSource'],
    }),

    createAgoraCurriculumSource: builder.mutation<AgoraCurriculumSource, CreateAgoraCurriculumSourceDto>({
      query: (data) => ({
        url: '/agora-curriculum/sources',
        method: 'POST',
        body: data,
      }),
      transformResponse: (response: any) => response.data,
      invalidatesTags: ['AgoraCurriculumSource'],
    }),

    uploadAgoraCurriculumSource: builder.mutation<AgoraCurriculumSource, FormData>({
      query: (data) => ({
        url: '/agora-curriculum/sources/upload',
        method: 'POST',
        body: data,
      }),
      transformResponse: (response: any) => response.data,
      invalidatesTags: ['AgoraCurriculumSource'],
    }),

    getAgoraCurricula: builder.query<AgoraCurriculum[], { subjectId?: string; gradeLevel?: string; status?: string } | void>({
      query: (params) => {
        const urlParams = new URLSearchParams();
        if (params?.subjectId) urlParams.append('subjectId', params.subjectId);
        if (params?.gradeLevel) urlParams.append('gradeLevel', params.gradeLevel);
        if (params?.status) urlParams.append('status', params.status);
        const queryString = urlParams.toString();
        
        return {
          url: `/agora-curriculum${queryString ? `?${queryString}` : ''}`,
          method: 'GET',
        };
      },
      transformResponse: (response: any) => response.data,
      providesTags: ['AgoraCurriculum'],
    }),

    getAgoraCurriculum: builder.query<AgoraCurriculum, string>({
      query: (id) => ({
        url: `/agora-curriculum/${id}`,
        method: 'GET',
      }),
      transformResponse: (response: any) => response.data,
      providesTags: (result, error, id) => [{ type: 'AgoraCurriculum', id }],
    }),

    consolidateAgoraCurriculum: builder.mutation<AgoraCurriculum, ConsolidateCurriculumDto>({
      query: (data) => ({
        url: '/agora-curriculum/consolidate',
        method: 'POST',
        body: data,
      }),
      transformResponse: (response: any) => response.data,
      invalidatesTags: ['AgoraCurriculum'],
    }),

    publishAgoraCurriculum: builder.mutation<AgoraCurriculum, { id: string; data: PublishCurriculumDto }>({
      query: ({ id, data }) => ({
        url: `/agora-curriculum/${id}/publish`,
        method: 'PATCH',
        body: data,
      }),
      transformResponse: (response: any) => response.data,
      invalidatesTags: (result, error, { id }) => [
        { type: 'AgoraCurriculum', id },
        'AgoraCurriculum', // To refresh lists
      ],
    }),
  }),
});

export const {
  useGetAgoraNerdcSubjectsQuery,
  useGetAgoraCurriculumSourcesQuery,
  useCreateAgoraCurriculumSourceMutation,
  useUploadAgoraCurriculumSourceMutation,
  useGetAgoraCurriculaQuery,
  useGetAgoraCurriculumQuery,
  useConsolidateAgoraCurriculumMutation,
  usePublishAgoraCurriculumMutation,
} = agoraCurriculumApi;
