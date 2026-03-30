import { apiClient } from '../../shared/api/api-client';

export interface DashboardStats {
  totalConfirmations: number;
  deliveryRate: string;
  managedReplies: number;
  confirmationsChange: string;
  deliveryRateChange: string;
  repliesChange: string;
}

export const dashboardService = {
  getStats: async (): Promise<DashboardStats> => {
    const response = await apiClient.get('/dashboard/stats');
    return response.data;
  },
};
