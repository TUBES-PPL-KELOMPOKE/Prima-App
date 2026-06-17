import api from '@/lib/axios'

export const medicalRecordService = {
  listByPasien: (pasienId: string, params?: Record<string, unknown>) =>
    api.get(`/medical/pasien/${pasienId}`, { params }).then((r) => r.data),

  getById: (id: string) =>
    api.get(`/medical/${id}`).then((r) => r.data),
}

export const prescriptionService = {
  listByPasien: (pasienId: string) =>
    api.get('/prescription/show/all').then((r) => ({
      ...r.data,
      data: (r.data?.data ?? []).filter((item: any) => item.patient_id === pasienId),
    })),

  getById: (id: string) =>
    api.get(`/prescription/show/${id}`).then((r) => r.data),

  downloadUrl: (id: string) => `/prescription/download/${id}`,
}

export const documentService = {
  create: (data: Record<string, unknown>) => api.post('/document/create', data).then((r) => r.data),
  list: () => api.get('/document/show').then((r) => r.data),
  getById: (id: string) => api.get(`/document/show/${id}`).then((r) => r.data),
}

export const immunizationService = {
  list: () => api.get('/immunization/show').then((r) => r.data),
  listByPasien: (pasienId: string) =>
    api.get('/immunization/show').then((r) => ({
      ...r.data,
      data: (r.data?.data ?? []).filter((item: any) => item.pasien_id === pasienId),
    })),
  getById: (id: string) => api.get(`/immunization/show/${id}`).then((r) => r.data),
}

export const programService = {
  list: (params?: Record<string, unknown>) =>
    api.get('/programs', { params }).then((r) => r.data),

  getById: (id: string) =>
    api.get(`/programs/${id}`).then((r) => r.data),

  register: (id: string, pasienId: string) =>
    api.post(`/programs/${id}/register`, { pasien_id: pasienId }).then((r) => r.data),

  cancel: (id: string, pasienId: string) =>
    api.delete(`/programs/${id}/register/${pasienId}`).then((r) => r.data),
}



export const calculatorService = {
  bmi: (data: { tinggi_cm: number; berat_kg: number }) =>
    api.post('/calculator/bmi', data).then((r) => r.data),

  bmr: (data: Record<string, unknown>) =>
    api.post('/calculator/bmr', data).then((r) => r.data),

  diabetesRisk: (data: Record<string, unknown>) =>
    api.post('/calculator/risk/diabetes', data).then((r) => r.data),

  hipertensiRisk: (data: Record<string, unknown>) =>
    api.post('/calculator/risk/hipertensi', data).then((r) => r.data),
}

export const aiHealthService = {
  symptoms: async (data: Record<string, unknown>) => {
    const r = await fetch('/api/ai/health/symptoms', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return r.json();
  },

  analyze: async (data: Record<string, unknown>) => {
    const r = await fetch('/api/ai/health/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return r.json();
  },

  recommendDoctor: async (data: Record<string, unknown>) => {
    const r = await fetch('/api/ai/health/recommend-doctor', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return r.json();
  },
}
