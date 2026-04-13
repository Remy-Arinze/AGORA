import { createApi, fetchBaseQuery, retry } from '@reduxjs/toolkit/query/react';
import type { BaseQueryFn, FetchArgs, FetchBaseQueryError } from '@reduxjs/toolkit/query';
import { setCredentials, logout } from '../slices/authSlice';
import * as Sentry from '@sentry/nextjs';

const baseQuery = fetchBaseQuery({
  baseUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000',
  prepareHeaders: (headers, { getState }) => {
    const state = getState() as { auth: { token?: string | null; tenantId?: string | null } };
    const token = state?.auth?.token;

    // 1. Set Authorization Header — the JWT contains the schoolId,
    //    which is the sole source of truth for tenant context.
    if (token) {
      headers.set('authorization', `Bearer ${token}`);
    }

    headers.set('Content-Type', 'application/json');
    return headers;
  },
});

const baseQueryWithReauth: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  const state = api.getState() as { auth: { token?: string | null; refreshToken?: string | null; user?: any; tenantId?: string | null } };
  const user = state.auth.user;

  // Update Sentry context
  if (user) {
    Sentry.setUser({ id: user.id, email: user.email });
  }
  if (state.auth.tenantId) {
    Sentry.setTag('schoolId', state.auth.tenantId);
  }

  let result = await baseQuery(args, api, extraOptions);

  // SANITIZE & HUMANIZE ERRORS
  // This prevents technical leaks (like localhost:4000) and provides better UX for throttles
  if (result.error) {
    if (result.error.status === 'FETCH_ERROR') {
      (result.error as any).data = {
        message: "We're having trouble connecting to Agora services. Please check your internet connection or the server status."
      };
    } else if (result.error.status === 429) {
      (result.error as any).data = {
        message: "Too many requests. Please wait a moment before trying again."
      };
    }
  }

  // If we get an error (except 401 which is handled below), report to Sentry
  if (result.error && result.error.status !== 401 && result.error.status !== 404) {
    const error = result.error;
    Sentry.withScope((scope) => {
      scope.setExtra('apiArgs', args);
      scope.setExtra('apiError', error);
      Sentry.captureException(new Error(`API Error ${error.status}: ${JSON.stringify(error.data)}`));
    });
  }

  // If we get a 401, try to refresh the token
  if (result.error && result.error.status === 401) {
    const refreshToken = state.auth.refreshToken;

    if (refreshToken) {
      try {
        const refreshResult = await baseQuery(
          {
            url: '/auth/refresh',
            method: 'POST',
            body: { refreshToken },
          },
          api,
          extraOptions
        );

        if (refreshResult.data) {
          const data = refreshResult.data as { accessToken: string; refreshToken: string };

          // Update the store with new tokens
          api.dispatch(
            setCredentials({
              accessToken: data.accessToken,
              refreshToken: data.refreshToken,
              user: state.auth.user, // Keep existing user data
            })
          );

          // Retry the original query with new token
          result = await baseQuery(args, api, extraOptions);
        } else {
          api.dispatch(logout());
          if (typeof window !== 'undefined') {
            window.location.href = '/auth/login?expired=true';
          }
        }
      } catch (error) {
        api.dispatch(logout());
        if (typeof window !== 'undefined') {
          window.location.href = '/auth/login?expired=true';
        }
      }
    } else {
      api.dispatch(logout());
      if (typeof window !== 'undefined') {
        window.location.href = '/auth/login?expired=true';
      }
    }
  }

  return result;
};

/**
 * Robust Retry Strategy:
 * 1. Exponential Backoff (1s, 2s, 4s...)
 * 2. Fail-Fast for auth/logic errors (401, 403, 404, 400)
 * 3. Max 5 attempts for transient network/server errors
 */
const staggeredBaseQuery = retry(
  async (args: string | FetchArgs, api, extraOptions) => {
    const result = await baseQueryWithReauth(args, api, extraOptions);
    
    // Fail immediately for these status codes — no point in retrying
    if (
      result.error?.status === 401 || 
      result.error?.status === 403 || 
      result.error?.status === 404 ||
      result.error?.status === 400
    ) {
      retry.fail(result.error);
    }
    
    return result;
  },
  {
    maxRetries: 5,
  }
);

export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: staggeredBaseQuery,
  tagTypes: ['Student', 'School', 'User', 'Timetable', 'Event', 'Session', 'ClassLevel', 'ClassArm', 'Subject', 'Room', 'Class', 'ClassResource', 'StudentResource', 'Permission', 'Curriculum', 'Grade', 'Grades', 'Transfer', 'Subscription', 'SubscriptionPlan', 'TeacherSubject', 'Faculty', 'Department', 'SchoolErrors', 'Error', 'ErrorStats', 'TeacherWorkload', 'Assessments', 'Submissions', 'AiHistory', 'Attendance', 'SchemeOfWork', 'AgoraCurriculum', 'AgoraCurriculumSource', 'AgoraSubject'],
  endpoints: (builder) => ({
    changePassword: builder.mutation<
      { success: boolean; message: string },
      { currentPassword: string; newPassword: string }
    >({
      query: (credentials) => ({
        url: '/auth/change-password',
        method: 'POST',
        body: credentials,
      }),
    }),

    // Upload super admin profile image
    uploadProfileImage: builder.mutation<
      { success: boolean; data: { profileImage: string }; message: string },
      { file: File }
    >({
      queryFn: async ({ file }, _api, _extraOptions) => {
        const formData = new FormData();
        formData.append('image', file);

        const state = _api.getState() as { auth: { token?: string | null } };
        const token = state?.auth?.token;

        const envUrl = typeof process !== 'undefined' && process.env.NEXT_PUBLIC_API_URL;
        const baseUrl = envUrl || 'http://localhost:4000';
        const url = `${baseUrl}/auth/profile/upload-image`;

        const headers: HeadersInit = {};
        if (token) {
          headers['authorization'] = `Bearer ${token}`;
        }

        try {
          const response = await fetch(url, {
            method: 'POST',
            headers,
            body: formData,
          });

          const data = await response.json();

          if (!response.ok) {
            return { error: { status: response.status, data } };
          }

          return { data };
        } catch (error: any) {
          return { error: { status: 'FETCH_ERROR', error: error.message } };
        }
      },
      invalidatesTags: ['User'],
    }),
  }),
});

export const { useChangePasswordMutation, useUploadProfileImageMutation } = apiSlice;
