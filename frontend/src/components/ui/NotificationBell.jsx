import React, { useState, useEffect, useRef, useCallback } from 'react';
import NotificationDropdown from './NotificationDropdown';
import NotificationDetailModal from './NotificationDetailModal';
import { useSocket } from '../../contexts/SocketContext';
import {
  fetchNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  handleJoinRequest,
  handleMemberRequest,
} from '../../services/notificationService';

const NotificationBell = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const ref = useRef(null);
  
  // Socket context for real-time notifications
  const { notifications: socketNotifications, removeNotification, isConnected } = useSocket();

  // Load notifications
  const loadNotifications = useCallback(async () => {
    try {
      const data = await fetchNotifications();
      setNotifications(data);
    } catch (error) {
      console.error('Failed to load notifications:', error);
    }
  }, []);

  useEffect(() => {
    loadNotifications();
    // Reduce polling frequency since we have real-time updates
    const interval = setInterval(loadNotifications, 120000); // 2 minutes instead of 30 seconds
    return () => clearInterval(interval);
  }, [loadNotifications]);

  // Merge socket notifications with fetched notifications
  const allNotifications = React.useMemo(() => {
    const fetchedIds = new Set(notifications.map(n => n.id));
    const uniqueSocketNotifications = socketNotifications.filter(n => !fetchedIds.has(n.id));
    return [...uniqueSocketNotifications, ...notifications];
  }, [notifications, socketNotifications]);

  useEffect(() => {
    const onDocClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setIsOpen(false);
    };
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, []);

  const unreadCount = allNotifications.filter((n) => !n.read).length;

  const [modalNotification, setModalNotification] = useState(null);
  const [busyId, setBusyId] = useState(null);

  // Mark single notification as read
  const handleMarkAsRead = useCallback(async (id) => {
    try {
      await markNotificationAsRead(id);
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
      // Also remove from socket notifications if it's a real-time one
      removeNotification(id);
    } catch (error) {
      console.error('Failed to mark as read:', error);
    }
  }, [removeNotification]);

  // Mark all notifications as read
  const handleMarkAllAsRead = useCallback(async () => {
    try {
      await markAllNotificationsAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    }
  }, []);

  // Determine if notification needs action (Accept/Reject)
  const needsAction = (notification) => {
    return ['JOIN_REQUEST', 'MEMBER_REQUEST'].includes(notification.type);
  };

  // Handle Accept action
  const handleAccept = useCallback(async () => {
    if (!modalNotification) return;

    setBusyId(modalNotification.id);
    try {
      const familyId = modalNotification.familyId;
      const requestId = modalNotification.data?.requestId || modalNotification.refId;

      if (modalNotification.type === 'JOIN_REQUEST') {
        await handleJoinRequest(familyId, requestId, 'APPROVE');
      } else if (modalNotification.type === 'MEMBER_REQUEST') {
        await handleMemberRequest(familyId, requestId, 'APPROVE');
      }

      // Mark as read and refresh
      await markNotificationAsRead(modalNotification.id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === modalNotification.id ? { ...n, read: true } : n))
      );

      // Refresh notifications to get updated data
      await loadNotifications();
    } catch (error) {
      console.error('Failed to accept:', error);
      alert('Không thể chấp nhận yêu cầu: ' + error.message);
    } finally {
      setBusyId(null);
      setModalNotification(null);
    }
  }, [modalNotification, loadNotifications]);

  // Handle Reject action
  const handleReject = useCallback(async () => {
    if (!modalNotification) return;

    setBusyId(modalNotification.id);
    try {
      const familyId = modalNotification.familyId;
      const requestId = modalNotification.data?.requestId || modalNotification.refId;

      if (modalNotification.type === 'JOIN_REQUEST') {
        await handleJoinRequest(familyId, requestId, 'REJECT');
      } else if (modalNotification.type === 'MEMBER_REQUEST') {
        await handleMemberRequest(familyId, requestId, 'REJECT');
      }

      // Mark as read and refresh
      await markNotificationAsRead(modalNotification.id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === modalNotification.id ? { ...n, read: true } : n))
      );

      // Refresh notifications
      await loadNotifications();
    } catch (error) {
      console.error('Failed to reject:', error);
      alert('Không thể từ chối yêu cầu: ' + error.message);
    } finally {
      setBusyId(null);
      setModalNotification(null);
    }
  }, [modalNotification, loadNotifications]);

  return (
    <div className="relative mr-4" ref={ref}>
      <button
        aria-label="Thông báo"
        onClick={() => setIsOpen((v) => !v)}
        className="relative p-2 rounded-full hover:bg-gradient-to-br hover:from-accent/10 hover:to-secondary/10 transition-all duration-300 focus:outline-none group"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6 text-foreground transition-all duration-300 group-hover:text-accent group-hover:scale-110"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 10-12 0v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
          />
        </svg>
        {unreadCount > 0 && (
          <span
            className="absolute -top-1 -right-1 inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 text-[10px] font-bold leading-none text-white bg-gradient-to-br from-error to-warning rounded-full shadow-lg"
            style={{ boxShadow: '0 0 12px rgba(255, 107, 157, 0.6)' }}
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <NotificationDropdown
          notifications={allNotifications}
          onClose={() => setIsOpen(false)}
          onMarkAsRead={handleMarkAsRead}
          onMarkAllAsRead={handleMarkAllAsRead}
          onOpenDetail={(n) => setModalNotification(n)}
        />
      )}

      {modalNotification && (
        <NotificationDetailModal
          notification={modalNotification}
          busy={busyId === modalNotification.id}
          onClose={() => setModalNotification(null)}
          onAccept={needsAction(modalNotification) ? handleAccept : null}
          onReject={needsAction(modalNotification) ? handleReject : null}
        />
      )}
    </div>
  );
};

export default NotificationBell;
