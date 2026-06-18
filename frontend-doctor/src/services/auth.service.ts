import api from '@/lib/axios'

export const authService = {
  login: (data: Record<string, unknown>) =>
    api.post('/auth/login', data).then((r) => r.data),

  register: (data: Record<string, unknown>) =>
    api.post('/auth/register/doctor', { ...data, role: 'doctor' }).then((r) => r.data),

  logout: () =>
    api.post('/auth/logout').then((r) => r.data),

  getUser: (id: string) => api.get(`/auth/users/${id}`).then((r) => r.data),

  updateUser: (id: string, data: Record<string, unknown>) =>
    api.patch(`/auth/users/${id}`, data).then((r) => r.data),

  uploadPhoto: (id: string, file: File) => {
    const form = new FormData()
    form.append('file', file)
    return api.post(`/auth/users/${id}/photo`, form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }).then((r) => r.data)
  },
}
