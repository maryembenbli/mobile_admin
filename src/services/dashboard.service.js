import api from './api';

/**
 * ⚠️ Change '/dashboard/summary' selon ton backend:
 * - /dashboard
 * - /stats/summary
 * - /admin/dashboard
 */
export const getDashboardSummary = async () => {
  const res = await api.get('/dashboard/summary');
  return res.data;
};
