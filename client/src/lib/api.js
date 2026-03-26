const BASE = '/api';

async function request(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
    body: options.body ? JSON.stringify(options.body) : undefined,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || 'Request failed');
  }
  return res.json();
}

// Triggers
export const getTriggers = (params = {}) => {
  const qs = new URLSearchParams(Object.entries(params).filter(([, v]) => v)).toString();
  return request(`/triggers${qs ? `?${qs}` : ''}`);
};
export const getTrigger = (id) => request(`/triggers/${id}`);
export const createTrigger = (data) => request('/triggers', { method: 'POST', body: data });
export const updateTrigger = (id, data) => request(`/triggers/${id}`, { method: 'PATCH', body: data });
export const deleteTrigger = (id) => request(`/triggers/${id}`, { method: 'DELETE' });

// Contacts
export const getContacts = (triggerId) => request(`/contacts?trigger_id=${triggerId}`);
export const createContact = (data) => request('/contacts', { method: 'POST', body: data });
export const updateContact = (id, data) => request(`/contacts/${id}`, { method: 'PATCH', body: data });
export const deleteContact = (id) => request(`/contacts/${id}`, { method: 'DELETE' });

// Outreach
export const getOutreach = (contactId) => request(`/outreach?contact_id=${contactId}`);
export const logOutreach = (data) => request('/outreach', { method: 'POST', body: data });
export const updateOutreachStatus = (id, response_status) =>
  request(`/outreach/${id}`, { method: 'PATCH', body: { response_status } });
