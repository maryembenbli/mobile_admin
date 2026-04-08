import api from './api';

/**
 * ⚠️ Change '/dashboard/summary' selon ton backend:
 * - /dashboard
 * - /stats/summary
 * - /admin/dashboard
 */
export const getDashboardSummary = async (monthOffset = 0) => {
  const res = await api.get('/dashboard/summary', { params: { monthOffset } });
  return res.data;
};
