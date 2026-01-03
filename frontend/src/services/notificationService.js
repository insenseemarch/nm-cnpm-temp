// import { auth } from './firebaseConfig';

// const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

// // Helper to get auth token
// const getAuthToken = async () => {
//   const user = auth.currentUser;
//   if (!user) {
//     throw new Error('User not authenticated');
//   }
//   return await user.getIdToken();
// };

// // Fetch all notifications for the authenticated user
// export const fetchNotifications = async () => {
//   try {
//     const token = await getAuthToken();
//     const response = await fetch(`${API_URL}/api/notifications`, {
//       method: 'GET',
//       headers: {
//         Authorization: `Bearer ${token}`,
//         'Content-Type': 'application/json',
//       },
//     });

//     if (!response.ok) {
//       throw new Error('Failed to fetch notifications');
//     }

//     return await response.json();
//   } catch (error) {
//     console.error('Error fetching notifications:', error);
//     return []; // Return empty array on error
//   }
// };

// // Mark a specific notification as read
// export const markNotificationAsRead = async (notificationId) => {
//   try {
//     const token = await getAuthToken();
//     const response = await fetch(`${API_URL}/api/notifications/${notificationId}/mark-read`, {
//       method: 'POST',
//       headers: {
//         Authorization: `Bearer ${token}`,
//         'Content-Type': 'application/json',
//       },
//     });

//     if (!response.ok) {
//       throw new Error('Failed to mark notification as read');
//     }

//     return await response.json();
//   } catch (error) {
//     console.error('Error marking notification as read:', error);
//     throw error;
//   }
// };

// // Mark all notifications as read
// export const markAllNotificationsAsRead = async () => {
//   try {
//     const token = await getAuthToken();
//     const response = await fetch(`${API_URL}/api/notifications/mark-all-read`, {
//       method: 'POST',
//       headers: {
//         Authorization: `Bearer ${token}`,
//         'Content-Type': 'application/json',
//       },
//     });

//     if (!response.ok) {
//       throw new Error('Failed to mark all notifications as read');
//     }

//     return await response.json();
//   } catch (error) {
//     console.error('Error marking all notifications as read:', error);
//     throw error;
//   }
// };

// // Get unread notification count
// export const getUnreadCount = async () => {
//   try {
//     const token = await getAuthToken();
//     const response = await fetch(`${API_URL}/api/notifications/unread-count`, {
//       method: 'GET',
//       headers: {
//         Authorization: `Bearer ${token}`,
//         'Content-Type': 'application/json',
//       },
//     });

//     if (!response.ok) {
//       throw new Error('Failed to get unread count');
//     }

//     const data = await response.json();
//     return data.count;
//   } catch (error) {
//     console.error('Error getting unread count:', error);
//     return 0;
//   }
// };
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

// Helper to get auth token from localStorage
const getAuthToken = () => {
  const token = localStorage.getItem('token');
  if (!token) {
    throw new Error('User not authenticated');
  }
  return token;
};

// Fetch all notifications for the authenticated user
export const fetchNotifications = async () => {
  try {
    const token = getAuthToken();
    const response = await fetch(`${API_URL}/api/notifications`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch notifications');
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return [];
  }
};

// Mark a specific notification as read
export const markNotificationAsRead = async (notificationId) => {
  try {
    const token = getAuthToken();
    const response = await fetch(`${API_URL}/api/notifications/${notificationId}/mark-read`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to mark notification as read');
    }

    return await response.json();
  } catch (error) {
    console.error('Error marking notification as read:', error);
    throw error;
  }
};

// Mark all notifications as read
export const markAllNotificationsAsRead = async () => {
  try {
    const token = getAuthToken();
    const response = await fetch(`${API_URL}/api/notifications/mark-all-read`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to mark all notifications as read');
    }

    return await response.json();
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    throw error;
  }
};

// Get unread notification count
export const getUnreadCount = async () => {
  try {
    const token = getAuthToken();
    const response = await fetch(`${API_URL}/api/notifications/unread-count`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to get unread count');
    }

    const data = await response.json();
    return data.count;
  } catch (error) {
    console.error('Error getting unread count:', error);
    return 0;
  }
};

// Handle join request (approve/reject)
export const handleJoinRequest = async (familyId, requestId, action) => {
  try {
    const token = getAuthToken();
    const response = await fetch(`${API_URL}/api/families/${familyId}/join-requests/${requestId}`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ action }), // 'APPROVE' or 'REJECT'
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to handle join request');
    }

    return await response.json();
  } catch (error) {
    console.error('Error handling join request:', error);
    throw error;
  }
};

// Handle member request (approve/reject)
export const handleMemberRequest = async (familyId, requestId, action) => {
  try {
    const token = getAuthToken();
    const response = await fetch(
      `${API_URL}/api/families/${familyId}/member-requests/${requestId}`,
      {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action }), // 'APPROVE' or 'REJECT'
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to handle member request');
    }

    return await response.json();
  } catch (error) {
    console.error('Error handling member request:', error);
    throw error;
  }
};

// Trigger scheduled reminders manually (for testing)
export const triggerScheduledReminders = async () => {
  try {
    const token = getAuthToken();
    const response = await fetch(`${API_URL}/api/notifications/trigger-reminders`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to trigger reminders');
    }

    return await response.json();
  } catch (error) {
    console.error('Error triggering reminders:', error);
    throw error;
  }
};
