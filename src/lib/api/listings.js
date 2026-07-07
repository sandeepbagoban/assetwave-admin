import { api } from './client';

export function listListings(params) {
  return api.get('/listings', params);
}

export function getListing(id) {
  return api.get(`/listings/${id}`);
}
