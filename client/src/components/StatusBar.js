export default function StatusBar({ playerName, onOpenBubble, onOpenNow, onOpenDashboard, onLeave, onCelebrate }) {
  return (
    <div style={styles.bar}>
      <span style={styles.name}>{playerName}</span>

      <button style={styles.nowBtn} onClick={onOpenNow} title="Press N">
        🧠 Now Focus 正在搞
      </button>

      <button style={styles.bubbleBtn} onClick={onOpenBubble} title="Press T">
        💬 Say something
      </button>

      <button style={styles.celebrateBtn} onClick={onCelebrate} title="Celebrate!">
        🎉 Celebrate!
      </button>

      <button style={styles.dashBtn} onClick={onOpenDashboard} title="Press D" className="zagdim-logs-btn">
        📋 Open Logs
      </button>

      <span style={styles.hint} className="zagdim-hint">
        WASD move &nbsp;·&nbsp; D = logs &nbsp;·&nbsp; N = focus &nbsp;·&nbsp; T = chat &nbsp;·&nbsp; Click = wave
      </span>

      <button style={styles.leaveBtn} onClick={onLeave} title="Log off">
        🚪 Log-off 下線啦
      </button>

      <style>{`
        @media (max-width: 1100px) {
          .zagdim-hint { display: none !important; }
        }
        @keyframes zagdimPulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(245,158,11,0.22); }
          50%      { box-shadow: 0 0 0 6px rgba(245,158,11,0); }
        }
        .zagdim-logs-btn {
          animation: zagdimPulse 3.2s ease-out infinite;
        }
        .zagdim-logs-btn:hover {
          animation: none;
        }
      `}</style>
    </div>
  );
}

const styles = {
  bar: {
    position: 'fixed', bottom: 0, left: 0, right: 0,
    background: 'rgba(10,10,25,0.92)',
    backdropFilter: 'blur(12px)',
    borderTop: '1px solid rgba(255,255,255,0.08)',
    display: 'flex', alignItems: 'center', gap: 10,
    padding: '12px 18px',
    zIndex: 50, minHeight: 64,
    flexWrap: 'wrap',
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
    background: 'linear-gradient(135deg, rgba(245,158,11,0.22), rgba(217,119,6,0.18))',
    border: '1px solid rgba(245,158,11,0.45)',
    borderRadius: 10, padding: '9px 18px',
    color: '#fcd34d', fontSize: 14, fontWeight: 700,
    cursor: 'pointer', whiteSpace: 'nowrap',
  },
  hint: {
    marginLeft: 'auto', color: 'rgba(255,255,255,0.3)',
    fontSize: 12, whiteSpace: 'nowrap',
    overflow: 'hidden', textOverflow: 'ellipsis', minWidth: 0,
  },
  celebrateBtn: {
    background: 'linear-gradient(135deg, rgba(255,180,0,0.25), rgba(255,100,0,0.2))',
    border: '1px solid rgba(255,180,0,0.4)',
    borderRadius: 10, padding: '9px 18px',
    color: '#FFD700', fontSize: 14, fontWeight: 700,
    cursor: 'pointer', whiteSpace: 'nowrap',
  },
  leaveBtn: {
    background: 'rgba(239,68,68,0.15)',
    border: '1px solid rgba(239,68,68,0.3)',
    borderRadius: 10, padding: '9px 18px',
    color: 'rgba(255,150,150,0.9)', fontSize: 14,
    cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0,
    marginLeft: 'auto',
  },
};
