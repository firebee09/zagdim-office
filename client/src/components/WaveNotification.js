import { useEffect, useState } from 'react';

// Each notification: { id, fromName, fromX, fromY }
// Auto-dismisses after 6 seconds

export default function WaveNotification({ notifications, onWalkOver, onDismiss }) {
  return (
    <div style={styles.container}>
      {notifications.map((n) => (
        <WaveToast key={n.id} notification={n} onWalkOver={onWalkOver} onDismiss={onDismiss} />
      ))}
    </div>
  );
}

function WaveToast({ notification, onWalkOver, onDismiss }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Animate in only — stays until user acts
    const t1 = setTimeout(() => setVisible(true), 10);
    return () => clearTimeout(t1);
  }, [notification.id]);

  return (
    <div style={{ ...styles.toast, opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(16px)' }}>
      <span style={styles.wave}>👋</span>
      <div style={styles.body}>
        <p style={styles.text}>
          <strong>{notification.fromName}</strong> waved at you!
        </p>
        <div style={styles.actions}>
          <button style={styles.walkBtn} onClick={() => onWalkOver(notification)}>
            Walk over →
          </button>
          <button style={styles.dismissBtn} onClick={() => onDismiss(notification.id)}>
            Dismiss
          </button>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    position: 'fixed',
    bottom: 24,
    right: 24,
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
    zIndex: 100,
    pointerEvents: 'none',
  },
  toast: {
    pointerEvents: 'all',
    background: 'rgba(20,20,40,0.92)',
    backdropFilter: 'blur(12px)',
    border: '1px solid rgba(108,99,255,0.4)',
    borderRadius: 16,
    padding: '14px 18px',
    display: 'flex',
    alignItems: 'flex-start',
    gap: 12,
    minWidth: 260,
    boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
    transition: 'opacity 0.3s, transform 0.3s',
  },
  wave: { fontSize: 28, lineHeight: 1, marginTop: 2 },
  body: { flex: 1 },
  text: { color: '#fff', fontSize: 14, marginBottom: 10, lineHeight: 1.4 },
  actions: { display: 'flex', gap: 8 },
  walkBtn: {
    background: 'linear-gradient(135deg, #6C63FF, #3ECFCF)',
    border: 'none',
    borderRadius: 8,
    padding: '6px 12px',
    color: '#fff',
    fontSize: 12,
    fontWeight: 700,
    cursor: 'pointer',
  },
  dismissBtn: {
    background: 'rgba(255,255,255,0.08)',
    border: '1px solid rgba(255,255,255,0.15)',
    borderRadius: 8,
    padding: '6px 12px',
    color: 'rgba(255,255,255,0.6)',
    fontSize: 12,
    cursor: 'pointer',
  },
};
