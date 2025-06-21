// src/api/fiscalizacoes.js
import api from './api';

export const getFiscalizacoes = (params) => api.get('/fiscalizacoes', { params });
export const getFiscalizacaoById = (id) => api.get(`/fiscalizacoes/${id}`);
export const createFiscalizacao = (data) => api.post('/fiscalizacoes', data);
export const updateFiscalizacao = (id, data) => api.put(`/fiscalizacoes/${id}`, data);
export const deleteFiscalizacao = (id) => api.delete(`/fiscalizacoes/${id}`);