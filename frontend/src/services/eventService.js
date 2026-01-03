import api from './api';

// NOTE: Backend Event endpoints (already implemented):
// GET    /api/families/:familyId/events
// POST   /api/families/:familyId/events
// GET    /api/families/:familyId/events/:eventId
// PATCH  /api/families/:familyId/events/:eventId
// DELETE /api/families/:familyId/events/:eventId

// Helper to build query params for list API from UI filters
export const fetchEvents = async (familyId, { eventType = 'all', dateFrom = '', dateTo = '' } = {}) => {
  const params = {};

  if (eventType && eventType !== 'all') {
    params.type = eventType; // maps to backend `type` filter
  }
  if (dateFrom) {
    params.startDate = dateFrom;
  }
  if (dateTo) {
    params.endDate = dateTo;
  }

  const response = await api.get(`/families/${familyId}/events`, { params });
  return response.data; // expected to be an array of events
};

// Map UI form data -> backend payload
const buildEventPayload = (formData) => {
  const { name, type, date, time, reminder, description, timeZone } = formData;


  const payload = {
    name,
    type,
    date,
    time,
  };

  // Always send client timezone when available so backend can convert local time to UTC
  if (timeZone) {
    payload.timeZone = timeZone;
  }

  if (description && description.trim()) {
    payload.description = description.trim();
  }
  
  
  if (reminder !== undefined && reminder !== null && reminder !== '') {
    const days = Number(reminder);
    if (!Number.isNaN(days)) {
      payload.reminderDays = days;
    }
  }

  return payload;
};

export const createEvent = async (familyId, formData) => {
  const payload = buildEventPayload(formData);
  const response = await api.post(`/families/${familyId}/events`, payload);
  return response.data;
};

export const updateEvent = async (familyId, eventId, formData) => {
  const payload = buildEventPayload(formData);
  const response = await api.patch(`/families/${familyId}/events/${eventId}`, payload);
  return response.data;
};

export const deleteEvent = async (familyId, eventId) => {
  await api.delete(`/families/${familyId}/events/${eventId}`);
};

// Currently unused in UI: kept here for future detail view or direct fetch-by-id
// Frontend NOTE: This endpoint exists in backend but is NOT wired to any screen yet.
export const getEventById = async (familyId, eventId) => {
  const response = await api.get(`/families/${familyId}/events/${eventId}`);
  return response.data;
};
