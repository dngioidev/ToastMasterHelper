import { api } from '../../lib/api';
import type { DashboardStats } from './dashboard.types';

export const dashboardApi = {
  getStats: (): Promise<DashboardStats> =>
    api.get('/dashboard').then((r) => r.data),
};
