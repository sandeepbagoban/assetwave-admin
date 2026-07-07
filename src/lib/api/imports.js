import { api } from './client';

export const IMPORT_COLUMNS = [
  'title',
  'category_slug',
  'brand',
  'model',
  'year_manufactured',
  'condition',
  'description',
  'price_amount',
  'currency',
  'origin_country',
  'new_price_estimate',
  'quantity',
  'seller_email',
];

export function previewImport(file) {
  const formData = new FormData();
  formData.append('file', file);
  return api.postForm('/admin/imports/listings/preview', formData);
}

export function commitImport(jobId) {
  return api.post(`/admin/imports/listings/${jobId}/commit`);
}

export function getImportJob(jobId) {
  return api.get(`/admin/imports/${jobId}`);
}
