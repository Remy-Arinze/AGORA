import { useGetAnalyticsQuery } from '@/lib/store/api/analyticsApi';
import { safeApiParams } from '@/utils/common/safety-utils';

/**
 * Hook for fetching analytics data
 */
export function useAnalytics(month?: number, year?: number) {
  const params = month && year ? { month, year } : {};
  const safeParams = safeApiParams(params);
  const { data, isLoading, error, refetch } = useGetAnalyticsQuery(safeParams);

  return {
    analytics: data?.data || null,
    isLoading,
    error,
    refetch,
  };
}

