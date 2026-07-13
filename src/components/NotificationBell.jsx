import { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { listNotifications, getUnreadCount, markNotificationRead, markAllNotificationsRead } from '../lib/api/notifications';

const POLL_INTERVAL_MS = 45000;

function timeAgo(iso) {
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState(null);
  const containerRef = useRef(null);

  const refreshCount = useCallback(() => {
    getUnreadCount().then(setUnreadCount).catch(() => {});
  }, []);

  useEffect(() => {
    refreshCount();
    const interval = setInterval(refreshCount, POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [refreshCount]);

  useEffect(() => {
    function handleClickOutside(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  async function handleToggle() {
    const next = !open;
    setOpen(next);
    if (next && notifications === null) {
      try {
        setNotifications(await listNotifications());
      } catch {
        setNotifications([]);
      }
    }
  }

  async function handleMarkAllRead() {
    try {
      await markAllNotificationsRead();
      setNotifications((list) => (list || []).map((x) => ({ ...x, read: true })));
      setUnreadCount(0);
    } catch { /* best-effort */ }
  }

  async function handleClickNotification(n) {
    setOpen(false);
    if (n.read) return;
    try {
      await markNotificationRead(n.id);
      setNotifications((list) => (list || []).map((x) => (x.id === n.id ? { ...x, read: true } : x)));
      setUnreadCount((c) => Math.max(0, c - 1));
    } catch { /* best-effort */ }
  }

  return (
    <div ref={containerRef} style={{ position: 'relative' }}>
      <button
        onClick={handleToggle}
        aria-label="Notifications"
        style={{
          position: 'relative', width: 36, height: 36, borderRadius: 6,
          background: 'transparent', border: '1px solid var(--sidebar-text)', color: 'var(--sidebar-text)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
        }}
      >
        🔔
        {unreadCount > 0 && (
          <span style={{
            position: 'absolute', top: -4, right: -4, minWidth: 16, height: 16, borderRadius: 100,
            background: 'var(--danger)', color: '#fff', fontSize: 10, fontWeight: 700,
            display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 3px',
          }}>{unreadCount > 9 ? '9+' : unreadCount}</span>
        )}
      </button>

      {open && (
        <div style={{
          position: 'absolute', top: 44, left: 0, width: 320, maxHeight: 420, overflowY: 'auto',
          background: 'var(--panel)', border: '1px solid var(--border)', borderRadius: 8, zIndex: 1100,
          boxShadow: '0 12px 32px rgba(0,0,0,0.18)',
        }}>
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '10px 14px', borderBottom: '1px solid var(--border)',
          }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>Notifications</span>
            {unreadCount > 0 && (
              <button onClick={handleMarkAllRead} style={{ background: 'none', border: 'none', color: 'var(--primary)', fontSize: 12, fontWeight: 500, cursor: 'pointer' }}>
                Mark all read
              </button>
            )}
          </div>

          {notifications === null ? (
            <div style={{ padding: 18, textAlign: 'center', fontSize: 12.5, color: 'var(--text-muted)' }}>Loading…</div>
          ) : notifications.length === 0 ? (
            <div style={{ padding: 18, textAlign: 'center', fontSize: 12.5, color: 'var(--text-muted)' }}>No notifications yet.</div>
          ) : (
            notifications.map((n) => (
              <Link
                key={n.id}
                to={n.link || '#'}
                onClick={() => handleClickNotification(n)}
                style={{
                  display: 'block', padding: '10px 14px', borderBottom: '1px solid var(--border)',
                  background: n.read ? 'transparent' : 'var(--bg)', color: 'inherit',
                }}
              >
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', marginBottom: 3 }}>{n.title}</div>
                {n.message && <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4, lineHeight: 1.4 }}>{n.message}</div>}
                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{timeAgo(n.created_at)}</div>
              </Link>
            ))
          )}
        </div>
      )}
    </div>
  );
}
