export default function StatusBar({ playerName, onOpenBubble, onOpenNow, onOpenDashboard, onLeave }) {
  return (
    <div style={styles.bar}>
      <span style={styles.name}>{playerName}</span>

      <button style={styles.nowBtn} onClick={onOpenNow} title="Press N">
        🧠 Now Focus 正在搞
      </button>

      <button style={styles.bubbleBtn} onClick={onOpenBubble} title="Press T">
        💬 Say something
      </button>

      <button style={styles.dashBtn} onClick={onOpenDashboard} title="Press D">
        📋 Work Logs 工作誌
      </button>

      <span style={styles.hint}>WASD move &nbsp;·&nbsp; D = logs &nbsp;·&nbsp; N = focus &nbsp;·&nbsp; T = chat &nbsp;·&nbsp; Click = wave</span>

      <button style={styles.leaveBtn} onClick={onLeave} title="Leave office">
        🚪 Leave
      </button>
    </div>
  );
}

const styles = {
  bar: {
    position: 'fixed', bottom: 0, left: 0, right: 0,
    background: 'rgba(10,10,25,0.92)',
    backdropFilter: 'blur(12px)',
    borderTop: '1px solid rgba(255,255,255,0.08)',
    display: 'flex', alignItems: 'center', gap: 12,
    padding: '14px 24px',
    zIndex: 50, height: 64,
  },
  name: {
    color: '#fff', fontWeight: 700, fontSize: 15,
    whiteSpace: 'nowrap',
  },
  nowBtn: {
    background: 'rgba(124,58,237,0.2)',
    border: '1px solid rgba(124,58,237,0.4)',
    borderRadius: 10, padding: '9px 18px',
    color: 'rgba(255,255,255,0.9)', fontSize: 14,
    cursor: 'pointer', whiteSpace: 'nowrap', fontWeight: 600,
  },
  bubbleBtn: {
    background: 'rgba(108,99,255,0.15)',
    border: '1px solid rgba(108,99,255,0.3)',
    borderRadius: 10, padding: '9px 18px',
    color: 'rgba(255,255,255,0.8)', fontSize: 14,
    cursor: 'pointer', whiteSpace: 'nowrap',
  },
  dashBtn: {
    background: 'rgba(255,255,255,0.07)',
    border: '1px solid rgba(255,255,255,0.12)',
    borderRadius: 10, padding: '9px 18px',
    color: 'rgba(255,255,255,0.8)', fontSize: 14,
    cursor: 'pointer', whiteSpace: 'nowrap',
  },
  hint: {
    marginLeft: 'auto', color: 'rgba(255,255,255,0.3)',
    fontSize: 12, whiteSpace: 'nowrap',
  },
  leaveBtn: {
    background: 'rgba(239,68,68,0.15)',
    border: '1px solid rgba(239,68,68,0.3)',
    borderRadius: 10, padding: '9px 18px',
    color: 'rgba(255,150,150,0.9)', fontSize: 14,
    cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0,
  },
};
