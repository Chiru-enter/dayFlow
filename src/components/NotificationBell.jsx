import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  markAllNotificationsAsRead,
  markNotificationAsRead,
  subscribeToNotifications,
} from '../services/notificationService';

const formatNotificationTime = (createdAt) => {
  if (!createdAt) return 'Just now';
  const date = typeof createdAt.toDate === 'function' ? createdAt.toDate() : new Date(createdAt);
  if (Number.isNaN(date.getTime())) return 'Just now';
  return date.toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' });
};

function NotificationBell() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [open, setOpen] = useState(false);
  const [error, setError] = useState('');
  const containerRef = useRef(null);

  useEffect(() => {
    if (!user?.uid) {
      setNotifications([]);
      return undefined;
    }

    const unsubscribe = subscribeToNotifications(
      user.uid,
      setNotifications,
      () => setError('Unable to load notifications.'),
    );
    return unsubscribe;
  }, [user?.uid]);

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const unreadCount = notifications.filter((notification) => !notification.read).length;

  const handleRead = async (notification) => {
    if (!notification.read) {
      try {
        await markNotificationAsRead(notification.id, user.uid);
        setNotifications((current) => current.map((item) => (
          item.id === notification.id ? { ...item, read: true } : item
        )));
      } catch {
        setError('Unable to mark notification as read.');
      }
    }
    if (notification.link) {
      setOpen(false);
      navigate(notification.link);
    }
  };

  const handleMarkAllRead = async () => {
    if (!user?.uid || unreadCount === 0) return;
    try {
      await markAllNotificationsAsRead(user.uid);
      setNotifications((current) => current.map((item) => ({ ...item, read: true })));
    } catch {
      setError('Unable to mark notifications as read.');
    }
  };

  return (
    <div className="notification-container" ref={containerRef}>
      <button
        type="button"
        className="icon-button notification-trigger"
        aria-label={unreadCount ? `${unreadCount} unread notifications` : 'Notifications'}
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
      >
        <span aria-hidden="true">🔔</span>
        {unreadCount > 0 && <span className="notification-count">{unreadCount > 99 ? '99+' : unreadCount}</span>}
      </button>

      {open && (
        <section className="notification-panel" aria-label="Notifications">
          <div className="notification-panel-header">
            <strong>Notifications</strong>
            <button type="button" className="notification-mark-all" onClick={handleMarkAllRead} disabled={unreadCount === 0}>
              Mark all as read
            </button>
          </div>
          {error && <p className="notification-error" role="alert">{error}</p>}
          {notifications.length === 0 ? (
            <p className="notification-empty">No notifications</p>
          ) : (
            <div className="notification-list">
              {notifications.map((notification) => (
                <button
                  type="button"
                  className={`notification-item ${notification.read ? 'read' : 'unread'}`}
                  key={notification.id}
                  onClick={() => handleRead(notification)}
                >
                  <strong>{notification.title}</strong>
                  <span>{notification.message}</span>
                  <small>{formatNotificationTime(notification.createdAt)}</small>
                </button>
              ))}
            </div>
          )}
        </section>
      )}
    </div>
  );
}

export default NotificationBell;
