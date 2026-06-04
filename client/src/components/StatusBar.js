import { useState } from 'react';

export default function StatusBar({ playerName, currentStatus, onStatusChange, onOpenBubble, currentBubble, onOpenNow, currentNow, onOpenDashboard, onLeave }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(currentStatus || '');

  const QUICK_STATUSES = ['🎸', '🍕', '☕', '💻', '📞', '🎯', '🔥', '💤', '🧠', '✏️'];

  const submit = () => {
    onStatusChange(draft);
    setEditing(false);
  };

  return (
    <div style={styles.bar}>
      <span style={styles.name}>{playerName}</span>

      {editing ? (
        <div style={styles.editRow}>
          <input
            style={styles.input}
            value={draft}
            maxLength={32}
            placeholder="Set a status emoji..."
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') submit(); if (e.key === 'Escape') setEditing(false); }}
            autoFocus
          />
          <div style={styles.quickRow}>
            {QUICK_STATUSES.map((s) => (
              <button key={s} style={styles.quickBtn} onClick={() => { setDraft(s); onStatusChange(s); setEditing(false); }}>
                {s}
              </button>
            ))}
          </div>
          <div style={styles.btnRow}>
            <button style={styles.saveBtn} onClick={submit}>Save</button>
            <button style={styles.cancelBtn} onClick={() => setEditing(false)}>Cancel</button>
          </div>
        </div>
      ) : (
        <button style={styles.statusBtn} onClick={() => { setDraft(currentStatus || ''); setEditing(true); }}>
          {currentStatus ? `${currentStatus}` : '+ status'}
        </button>
      )}

      <button style={styles.nowBtn} onClick={onOpenNow} title="Press N">
        🧠 {currentNow ? `${currentNow.slice(0, 24)}${currentNow.length > 24 ? '…' : ''}` : 'Now'}
      </button>

      <button style={styles.bubbleBtn} onClick={onOpenBubble} title="Press T">
        💬 {currentBubble ? `"${currentBubble.slice(0, 24)}${currentBubble.length > 24 ? '…' : ''}"` : 'Say something'}
      </button>

      <button style={styles.dashBtn} onClick={onOpenDashboard} title="Press D">
        🏢 Team
      </button>
      <span style={styles.hint}>WASD move &nbsp;·&nbsp; D = team &nbsp;·&nbsp; N = 🧠 &nbsp;·&nbsp; T = 💬 &nbsp;·&nbsp; Click = wave</span>

      <button style={styles.leaveBtn} onClick={onLeave} title="Leave office">
        🚪 Leave
      </button>
    </div>
  );
}

const styles = {
  bar: {
    position: 'fixed', bottom: 0, left: 0, right: 0,
    background: 'rgba(10,10,25,0.88)',
    backdropFilter: 'blur(12px)',
    borderTop: '1px solid rgba(255,255,255,0.08)',
    display: 'flex', alignItems: 'center', gap: 12,
    padding: '10px 20px',
    zIndex: 50,
  },
  name: { color: '#fff', fontWeight: 700, fontSize: 14, whiteSpace: 'nowrap' },
  statusBtn: {
    background: 'rgba(255,255,255,0.08)',
    border: '1px solid rgba(255,255,255,0.15)',
    borderRadius: 8, padding: '5px 12px',
    color: 'rgba(255,255,255,0.7)', fontSize: 13, cursor: 'pointer',
  },
  editRow: { display: 'flex', flexDirection: 'column', gap: 6 },
  input: {
    background: 'rgba(255,255,255,0.1)',
    border: '1px solid rgba(255,255,255,0.2)',
    borderRadius: 8, padding: '6px 10px',
    color: '#fff', fontSize: 13, outline: 'none', width: 200,
  },
  quickRow: { display: 'flex', gap: 4 },
  quickBtn: {
    background: 'rgba(255,255,255,0.08)',
    border: 'none', borderRadius: 6,
    padding: '4px 6px', fontSize: 16, cursor: 'pointer',
  },
  btnRow: { display: 'flex', gap: 6 },
  saveBtn: {
    background: '#6C63FF', border: 'none', borderRadius: 7,
    padding: '5px 12px', color: '#fff', fontSize: 12, fontWeight: 700, cursor: 'pointer',
  },
  cancelBtn: {
    background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)',
    borderRadius: 7, padding: '5px 10px', color: 'rgba(255,255,255,0.5)', fontSize: 12, cursor: 'pointer',
  },
  dashBtn: {
    background: 'rgba(255,255,255,0.07)',
    border: '1px solid rgba(255,255,255,0.12)',
    borderRadius: 8, padding: '5px 14px',
    color: 'rgba(255,255,255,0.8)', fontSize: 13, cursor: 'pointer',
    whiteSpace: 'nowrap',
  },
  nowBtn: {
    background: 'rgba(124,58,237,0.2)',
    border: '1px solid rgba(124,58,237,0.4)',
    borderRadius: 8, padding: '5px 14px',
    color: 'rgba(255,255,255,0.9)', fontSize: 13, cursor: 'pointer',
    whiteSpace: 'nowrap', fontWeight: 600,
  },
  bubbleBtn: {
    background: 'rgba(108,99,255,0.15)',
    border: '1px solid rgba(108,99,255,0.3)',
    borderRadius: 8, padding: '5px 14px',
    color: 'rgba(255,255,255,0.8)', fontSize: 13, cursor: 'pointer',
    whiteSpace: 'nowrap',
  },
  hint: {
    marginLeft: 'auto', color: 'rgba(255,255,255,0.3)',
    fontSize: 12, whiteSpace: 'nowrap',
  },
  leaveBtn: {
    background: 'rgba(239,68,68,0.15)',
    border: '1px solid rgba(239,68,68,0.3)',
    borderRadius: 8, padding: '5px 14px',
    color: 'rgba(255,150,150,0.9)', fontSize: 13,
    cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0,
  },
};
