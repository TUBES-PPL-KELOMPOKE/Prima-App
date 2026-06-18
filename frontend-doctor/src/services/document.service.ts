import api from '@/lib/axios'

export const documentService = {
  getAllDocuments: () =>
    api.get('/document/show').then((r) => r.data),

  getDocumentById: (id: string) =>
    api.get(`/document/show/${id}`).then((r) => r.data),

  updateDocument: (id: string, data: any) =>
    api.put(`/document/update/${id}`, data).then((r) => r.data),
}
