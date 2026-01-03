// Family Service - API calls for family management
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

/**
 * Get auth token from localStorage
 */
const getAuthToken = () => {
  return localStorage.getItem('token') || '';
};

/**
 * Get all families for the current user
 */
export const getFamilies = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/families`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${getAuthToken()}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to fetch families');
    }

    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error('Get families error:', error);
    throw error;
  }
};

/**
 * Get current family ID from localStorage
 */
export const getCurrentFamilyId = () => {
  return localStorage.getItem('currentFamilyId') || '';
};

/**
 * Set current family ID in localStorage
 */
export const setCurrentFamilyId = (familyId) => {
  localStorage.setItem('currentFamilyId', familyId);
};

/**
 * Initialize family ID - fetch user's families and set the first one as current
 * This should be called when the user accesses pages that need a family context
 */
export const initializeFamilyId = async () => {
  // If already set, return it
  const existingFamilyId = getCurrentFamilyId();
  if (existingFamilyId) {
    return existingFamilyId;
  }

  try {
    const families = await getFamilies();
    if (families && families.length > 0) {
      const firstFamilyId = families[0].id;
      setCurrentFamilyId(firstFamilyId);
      return firstFamilyId;
    }
  } catch (error) {
    console.error('Failed to initialize family ID:', error);
  }
  
  return null;
};

export const createFamily = async (data) => {
  try {
    const response = await fetch(`${API_BASE_URL}/families`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.error || 'Failed to create family');
    }

    const res = await response.json();
    return res.data;
  } catch (error) {
    console.error('Create family error:', error);
    throw error;
  }
};

/**
 * Get family by ID
 */
export const getFamilyById = async (familyId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/families/${familyId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${getAuthToken()}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to fetch family');
    }

    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error('Get family by ID error:', error);
    throw error;
  }
};

export const joinFamilyByCode = async (code, message) => {
  try {
    // familyId is the 4-digit code
    const response = await fetch(`${API_BASE_URL}/families/${code}/join`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify({ message: message || null }),
    });

    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.error || 'Failed to join family');
    }

    const res = await response.json();
    return res.data;
  } catch (error) {
    console.error('Join family error:', error);
    throw error;
  }
};

export const deleteFamily = async (familyId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/families/${familyId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${getAuthToken()}`,
      },
    });

    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.error || 'Failed to delete family');
    }

    const res = await response.json();
    return res.data;
  } catch (error) {
    console.error('Delete family error:', error);
    throw error;
  }
};

export default {
  getFamilies,
  getCurrentFamilyId,
  setCurrentFamilyId,
  initializeFamilyId,
};
