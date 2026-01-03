// Member Service - API calls for family members
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

/**
 * Get auth token from localStorage
 */
const getAuthToken = () => {
  return localStorage.getItem('token') || '';
};

/**
 * Get default family ID (for now using a stored value or first family)
 */
const getDefaultFamilyId = () => {
  return localStorage.getItem('currentFamilyId') || '';
};

/**
 * Set current family ID
 */
export const setCurrentFamilyId = (familyId) => {
  localStorage.setItem('currentFamilyId', familyId);
};

/**
 * Get all members in a family
 * @param {string} familyId - Family ID
 * @param {Object} filters - Optional filters (status, generation, gender, search)
 */
export const getMembers = async (familyId, filters = {}) => {
  try {
    const queryParams = new URLSearchParams();
    if (filters.status) queryParams.append('status', filters.status);
    if (filters.generation) queryParams.append('generation', filters.generation);
    if (filters.gender) queryParams.append('gender', filters.gender);
    if (filters.search) queryParams.append('search', filters.search);

    const url = `${API_BASE_URL}/families/${familyId}/members?${queryParams.toString()}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${getAuthToken()}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to fetch members');
    }

    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error('Get members error:', error);
    throw error;
  }
};

/**
 * Get member detail by ID
 * @param {string} familyId - Family ID
 * @param {string} memberId - Member ID
 */
export const getMemberById = async (familyId, memberId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/families/${familyId}/members/${memberId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${getAuthToken()}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to fetch member');
    }

    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error('Get member error:', error);
    throw error;
  }
};

/**
 * Create a new member
 * @param {string} familyId - Family ID
 * @param {Object} memberData - Member data
 */
export const createMember = async (familyId, memberData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/families/${familyId}/members`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${getAuthToken()}`,
      },
      body: JSON.stringify(memberData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to create member');
    }

    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error('Create member error:', error);
    throw error;
  }
};

/**
 * Update a member
 * @param {string} familyId - Family ID
 * @param {string} memberId - Member ID
 * @param {Object} memberData - Updated member data
 */
export const updateMember = async (familyId, memberId, memberData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/families/${familyId}/members/${memberId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${getAuthToken()}`,
      },
      body: JSON.stringify(memberData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to update member');
    }

    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error('Update member error:', error);
    throw error;
  }
};

/**
 * Delete a member (soft delete)
 * @param {string} familyId - Family ID
 * @param {string} memberId - Member ID
 */
export const deleteMember = async (familyId, memberId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/families/${familyId}/members/${memberId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${getAuthToken()}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to delete member');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Delete member error:', error);
    throw error;
  }
};

/**
 * Get deleted members (admin only)
 * @param {string} familyId - Family ID
 */
export const getDeletedMembers = async (familyId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/families/${familyId}/members-deleted`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${getAuthToken()}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to fetch deleted members');
    }

    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error('Get deleted members error:', error);
    throw error;
  }
};

/**
 * Restore a deleted member (admin only)
 * @param {string} familyId - Family ID
 * @param {string} memberId - Member ID
 */
export const restoreMember = async (familyId, memberId) => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/families/${familyId}/members/${memberId}/restore`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getAuthToken()}`,
        },
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to restore member');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Restore member error:', error);
    throw error;
  }
};

/**
 * Permanently delete a member (admin only)
 * @param {string} familyId - Family ID
 * @param {string} memberId - Member ID
 */
export const permanentlyDeleteMember = async (familyId, memberId) => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/families/${familyId}/members/${memberId}/permanent`,
      {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getAuthToken()}`,
        },
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to permanently delete member');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Permanently delete member error:', error);
    throw error;
  }
};

/**
 * Get yearly report/statistics for family
 * @param {string} familyId - Family ID
 * @param {Object} filters - { year, startYear, endYear }
 */
export const getYearlyReport = async (familyId, filters = {}) => {
  try {
    const queryParams = new URLSearchParams();
    if (filters.year) queryParams.append('year', filters.year);
    if (filters.startYear) queryParams.append('startYear', filters.startYear);
    if (filters.endYear) queryParams.append('endYear', filters.endYear);

    const url = `${API_BASE_URL}/families/${familyId}/yearly-report?${queryParams.toString()}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${getAuthToken()}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to fetch yearly report');
    }

    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error('Get yearly report error:', error);
    throw error;
  }
};

// ============ MEMBER ACHIEVEMENTS ============

/**
 * Get all achievements for a member
 * @param {string} familyId - Family ID
 * @param {string} memberId - Member ID
 */
export const getMemberAchievements = async (familyId, memberId) => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/families/${familyId}/members/${memberId}/achievements`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getAuthToken()}`,
        },
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to fetch member achievements');
    }

    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error('Get member achievements error:', error);
    throw error;
  }
};

/**
 * Create a new achievement for member
 * @param {string} familyId - Family ID
 * @param {string} memberId - Member ID
 * @param {Object} achievementData - Achievement data
 */
export const createMemberAchievement = async (familyId, memberId, achievementData) => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/families/${familyId}/members/${memberId}/achievements`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getAuthToken()}`,
        },
        body: JSON.stringify(achievementData),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to create achievement');
    }

    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error('Create member achievement error:', error);
    throw error;
  }
};

/**
 * Update member achievement
 * @param {string} familyId - Family ID
 * @param {string} memberId - Member ID
 * @param {string} achievementId - Achievement ID
 * @param {Object} achievementData - Updated data
 */
export const updateMemberAchievement = async (
  familyId,
  memberId,
  achievementId,
  achievementData
) => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/families/${familyId}/members/${memberId}/achievements/${achievementId}`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getAuthToken()}`,
        },
        body: JSON.stringify(achievementData),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to update achievement');
    }

    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error('Update member achievement error:', error);
    throw error;
  }
};

/**
 * Delete member achievement
 * @param {string} familyId - Family ID
 * @param {string} memberId - Member ID
 * @param {string} achievementId - Achievement ID
 */
export const deleteMemberAchievement = async (familyId, memberId, achievementId) => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/families/${familyId}/members/${memberId}/achievements/${achievementId}`,
      {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getAuthToken()}`,
        },
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to delete achievement');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Delete member achievement error:', error);
    throw error;
  }
};

/**
 * Transform backend member data to frontend format
 * @param {Object} member - Backend member data
 */
export const transformMemberData = (member) => {
  if (!member) return null;

  const birthYear = member.birthDate ? new Date(member.birthDate).getFullYear() : null;
  const deathYear = member.deathDate ? new Date(member.deathDate).getFullYear() : null;

  // Helper function to format date as dd/MM/yyyy
  const formatDateDDMMYYYY = (date) => {
    if (!date) return null;
    const d = new Date(date);
    if (isNaN(d.getTime())) return null;
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  };

  return {
    id: member.id,
    name: member.name,
    gender: member.gender?.toLowerCase() || 'other',
    birthYear,
    deathYear,
    birthDate: formatDateDDMMYYYY(member.birthDate),
    birthDateRaw: member.birthDate || null, // Giữ nguyên để so sánh với siblings
    deathDate: formatDateDDMMYYYY(member.deathDate),
    generation: member.generation,
    avatar: member.avatar,
    hometown: member.hometown,
    address: member.currentAddress,
    occupation: member.occupation || member.customOccupation,
    maritalStatus: member.maritalStatus?.toLowerCase() || 'single',
    marriageDate: formatDateDDMMYYYY(member.marriageDate),
    biography: member.bio,
    father: member.father?.name || null,
    fatherId: member.fatherId,
    mother: member.mother?.name || null,
    motherId: member.motherId,
    birthOrder: member.myOrder || member.childOrder,
    siblings:
      member.siblings?.map((s) => ({
        id: s.id,
        name: s.name,
        gender: s.gender?.toLowerCase(),
        birthDate: s.birthDate,
      })) || [],
    spouse: member.spouse
      ? {
          id: member.spouse.id,
          name: member.spouse.name,
          gender: member.gender?.toLowerCase() === 'female' ? 'male' : 'female',
          birthYear: member.spouse.birthDate
            ? new Date(member.spouse.birthDate).getFullYear()
            : null,
          deathYear: member.spouse.deathDate
            ? new Date(member.spouse.deathDate).getFullYear()
            : null,
          avatar: member.spouse.avatar,
        }
      : null,
    spouseId: member.spouseId,
    children:
      [...(member.fatherChildren || []), ...(member.motherChildren || [])]
        .filter((child, index, self) => self.findIndex((c) => c.id === child.id) === index)
        .map((child) => ({
          id: child.id,
          name: child.name,
          gender: child.gender?.toLowerCase(),
          birthYear: child.birthDate ? new Date(child.birthDate).getFullYear() : null,
          deathYear: child.deathDate ? new Date(child.deathDate).getFullYear() : null,
          avatar: child.avatar,
          generation: member.generation + 1,
        })) || [],
    linkedUserId: member.linkedUserId,
    // Thông tin mai táng
    deathCause: member.deathCause || null,
    burialLocation: member.burialLocation || null,
  };
};

/**
 * Transform member for list display (basic info)
 * @param {Object} member - Backend member data
 */
export const transformMemberForList = (member) => {
  if (!member) return null;

  const birthYear = member.birthDate ? new Date(member.birthDate).getFullYear() : null;
  const deathYear = member.deathDate ? new Date(member.deathDate).getFullYear() : null;

  return {
    id: member.id,
    name: member.name,
    gender: member.gender?.toLowerCase() || 'other',
    birthYear,
    deathYear,
    generation: member.generation,
    avatar: member.avatar,
    maritalStatus: member.maritalStatus?.toLowerCase() || 'single',
    hometown: member.hometown,
    spouseId: member.spouseId || null,
    fatherId: member.fatherId || null,
    motherId: member.motherId || null,
  };
};

/**
 * Leave family (current user)
 * @param {string} familyId
 */
export const leaveFamily = async (familyId) => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/families/${familyId}/leave`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getAuthToken()}`,
        },
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to leave family');
    }

    return await response.json();
  } catch (error) {
    console.error('Leave family error:', error);
    throw error;
  }
};


export default {
  getMembers,
  getMemberById,
  createMember,
  updateMember,
  deleteMember,
  getDeletedMembers,
  restoreMember,
  permanentlyDeleteMember,
  getYearlyReport,
  getMemberAchievements,
  createMemberAchievement,
  updateMemberAchievement,
  deleteMemberAchievement,
  transformMemberData,
  transformMemberForList,
  setCurrentFamilyId,
  leaveFamily
};

