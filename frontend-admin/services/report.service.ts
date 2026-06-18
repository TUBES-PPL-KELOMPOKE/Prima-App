import api from '@/lib/axios';

export const reportService = {
  getUsersStats: async () => {
    const response = await api.get('/reports/users');
    return response.data;
  },
  
  // Stubs for later use
  getAppointmentsStats: async () => {
    const response = await api.get('/reports/appointments');
    return response.data;
  },
  
  getConsultationsStats: async () => {
    const response = await api.get('/reports/consultations');
    return response.data;
  },
};
