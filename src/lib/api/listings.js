import { api } from './client';

export function listListings(params) {
  return api.get('/admin/listings', params);
}

export function getListing(id) {
  return api.get(`/admin/listings/${id}`);
}

export function updateListing(id, body) { return api.patch(`/admin/listings/${id}`, body); }
export function listImports(params) { return api.get('/admin/listings/imports', params); }
