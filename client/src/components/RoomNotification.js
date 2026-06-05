import { useEffect, useState } from 'react';

// Shows a brief banner at the top when someone enters/leaves a meeting room
export default function RoomNotification({ notifications, onDismiss }) {
  return (
    <div style={styles.container}>
      {notifications.map((n) => (
        <RoomToast key={n.id} notification={n} onDismiss={onDismiss} />
      ))}
    </div>
  );
}

function RoomToast({ notification, onDismiss }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t1 = setTimeout(() => setVisible(true), 10);
    const t2 = setTimeout(() => onDismiss(notification.id), 3000);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [notification.id, onDismiss]);

  const isEnter = notification.type === 'enter';

  return (
    <div style={{
      ...styles.toast,
      opacity: visible ? 1 : 0,
      transform: visible ? 'translateY(0)' : 'translateY(-16px)',
      borderColor: isEnter ? 'rgba(62,207,207,0.4)' : 'rgba(255,255,255,0.1)',
    }}>
      <span style={styles.icon}>{isEnter ? '🗓️' : '🚪'}</span>
      <span style={styles.text}>
        <strong>{notification.playerName}</strong>
        {isEnter ? ' joined ' : ' left '}
        <strong>{notification.zoneLabel}</strong>
        {isEnter && notification.occupants?.length > 1 && (
          <span style={styles.who}> · {notification.occupants.join(', ')}</span>
        )}
      </span>
    </div>
  );
}

const styles = {
  container: {
    position: 'fixed',
    top: 16,
    left: '50%',
    transform: 'translateX(-50%)',
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
    zIndex: 100,
    pointerEvents: 'none',
    alignItems: 'center',
  },
  toast: {
    background: 'rgba(20,20,40,0.92)',
    backdropFilter: 'blur(12px)',
    border: '1px solid',
    borderRadius: 12,
    padding: '10px 18px',
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    boxShadow: '0 4px 24px rgba(0,0,0,0.4)',
    transition: 'opacity 0.3s, transform 0.3s',
    whiteSpace: 'nowrap',
  },
  icon: { fontSize: 18 },
  text: { color: '#fff', fontSize: 13 },
  who: { color: 'rgba(255,255,255,0.5)', fontSize: 12 },
};
