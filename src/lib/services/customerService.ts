import { fetchApi } from '../api';

export interface Customer {
  id?: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  birthdate?: string | null;
  notes?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export const customerService = {
  getAll: () => fetchApi('/customers'),
  getById: (id: string) => fetchApi(`/customers/${id}`),
  create: (customer: Customer) => fetchApi('/customers', {
    method: 'POST',
    body: JSON.stringify(customer)
  }),
  update: (id: string, customer: Customer) => fetchApi(`/customers/${id}`, {
    method: 'PUT',
    body: JSON.stringify(customer)
  }),
  delete: (id: string) => fetchApi(`/customers/${id}`, {
    method: 'DELETE'
  })
};