import { useQuery } from '@tanstack/react-query';
import { dashboardApi } from './dashboard.api';

export function useDashboard() {
  return useQuery({
    queryKey: ['dashboard'],
    queryFn: () => dashboardApi.getStats(),
  });
}
