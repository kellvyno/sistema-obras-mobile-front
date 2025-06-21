// src/api/obras.js
import api from './api';

export const getObras = (params) => api.get('/obras', { params });
export const getObraById = (id) => api.get(`/obras/${id}`);
export const createObra = (data) => api.post('/obras', data);
export const updateObra = (id, data) => api.put(`/obras/${id}`, data);
export const deleteObra = (id) => api.delete(`/obras/${id}`);
export const getFiscalizacoesByObra = (obraId) => api.get(`/obras/${obraId}/fiscalizacoes`);
export const sendObraEmail = (obraId, email) => api.post(`/obras/${obraId}/enviar-email`, { email });