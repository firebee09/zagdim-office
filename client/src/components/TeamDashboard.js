import { useState } from 'react';
import { AVATARS } from '../constants/avatars';

const avatarMap = Object.fromEntries(AVATARS.map(a => [a.id, a]));

function formatTime(ts) {
  if (!ts) return '';
  const d = new Date(ts);
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function timeAgo(ts) {
  if (!ts) return '';
  const mins = Math.floor((Date.now() - ts) / 60000);
  if (mins < 1) return 'just joined';
  if (mins < 60) return `${mins}m online`;
  const hrs = Math.floor(mins / 60);
  const rem = mins % 60;
  return `${hrs}h ${rem}m online`;
}

function LogEntry({ entry, index, isSelf, onEdit, onDelete }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(entry.text);

  if (editing) {
    return (
      <div style={logStyles.editRow}>
        <input
          style={logStyles.editInput}
          value={draft}
          maxLength={120}
          autoFocus
          onChange={e => setDraft(e.target.value)}
          onKeyDown={e => {
            if (e.key === 'Enter') { onEdit(index, draft); setEditing(false); }
            if (e.key === 'Escape') setEditing(false);
          }}
        />
        <button style={logStyles.saveBtn} onClick={() => { onEdit(index, draft); setEditing(false); }}>✓</button>
        <button style={logStyles.cancelBtn} onClick={() => setEditing(false)}>✕</button>
      </div>
    );
  }

  return (
    <div style={logStyles.row}>
      <span style={logStyles.time}>{formatTime(entry.time)}</span>
      <span style={logStyles.text}>{entry.text}</span>
      {isSelf && (
        <div style={logStyles.actions}>
          <button style={logStyles.iconBtn} onClick={() => { setDraft(entry.text); setEditing(true); }} title="Edit">✏️</button>
          <button style={logStyles.iconBtn} onClick={() => onDelete(index)} title="Delete">🗑️</button>
        </div>
      )}
    </div>
  );
}

const logStyles = {
  row: { display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6, group: true },
  time: { color: 'rgba(255,255,255,0.25)', fontSize: 10, flexShrink: 0, fontVariantNumeric: 'tabular-nums' },
  text: { color: 'rgba(255,255,255,0.7)', fontSize: 12, flex: 1 },
  actions: { display: 'flex', gap: 2, opacity: 0.5 },
  iconBtn: { background: 'none', border: 'none', cursor: 'pointer', fontSize: 11, padding: '2px 3px' },
  editRow: { display: 'flex', gap: 4, marginBottom: 6, alignItems: 'center' },
  editInput: {
    flex: 1, background: 'rgba(255,255,255,0.08)',
    border: '1px solid rgba(255,255,255,0.2)', borderRadius: 6,
    padding: '3px 8px', color: '#fff', fontSize: 12, outline: 'none',
  },
  saveBtn: { background: '#6C63FF', border: 'none', borderRadius: 5, padding: '3px 8px', color: '#fff', fontSize: 11, cursor: 'pointer' },
  cancelBtn: { background: 'rgba(255,255,255,0.08)', border: 'none', borderRadius: 5, padding: '3px 8px', color: 'rgba(255,255,255,0.5)', fontSize: 11, cursor: 'pointer' },
};

export default function TeamDashboard({ players, selfId, onClose, onEditLog, onDeleteLog }) {
  const list = Object.values(players).sort((a, b) => {
    // Self first, then by join time
    if (a.id === selfId) return -1;
    if (b.id === selfId) return 1;
    return (a.joinedAt || 0) - (b.joinedAt || 0);
  });

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.panel} onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div style={styles.header}>
          <div>
            <div style={styles.title}>🏢 Team Dashboard</div>
            <div style={styles.sub}>{list.length} online right now</div>
          </div>
          <button style={styles.closeBtn} onClick={onClose}>✕</button>
        </div>

        {/* Player list */}
        <div style={styles.list}>
          {list.map(p => {
            const av = avatarMap[p.avatar] || AVATARS[0];
            const isSelf = p.id === selfId;
            return (
              <div key={p.id} style={{
                ...styles.card,
                borderColor: isSelf ? 'rgba(108,99,255,0.4)' : 'rgba(255,255,255,0.07)',
                background: isSelf ? 'rgba(108,99,255,0.08)' : 'rgba(255,255,255,0.03)',
              }}>
                {/* Avatar + name row */}
                <div style={styles.cardTop}>
                  <div style={{ ...styles.avatarCircle, background: av.color }}>
                    <span style={styles.avatarEmoji}>{av.emoji}</span>
                  </div>
                  <div style={styles.nameBlock}>
                    <span style={styles.playerName}>
                      {p.name} {isSelf && <span style={styles.youBadge}>you</span>}
                    </span>
                    <span style={styles.onlineTime}>{timeAgo(p.joinedAt)} · since {formatTime(p.joinedAt)}</span>
                  </div>
                  <div style={styles.onlineDot} />
                </div>

                {/* Now status */}
                <div style={styles.nowRow}>
                  {p.now ? (
                    <span style={styles.nowText}>🧠 {p.now}</span>
                  ) : (
                    <span style={styles.nowEmpty}>No focus set</span>
                  )}
                </div>

                {/* Today's work log */}
                {p.nowLog && p.nowLog.length > 0 && (
                  <div style={styles.logSection}>
                    <div style={styles.logTitle}>
                      Today's log
                      <span style={styles.count}>{p.nowLog.length} items</span>
                    </div>
                    {[...p.nowLog].reverse().map((entry, i) => {
                      // Reverse index back to original for server operations
                      const originalIndex = p.nowLog.length - 1 - i;
                      return (
                        <LogEntry
                          key={i}
                          entry={entry}
                          index={originalIndex}
                          isSelf={isSelf}
                          onEdit={onEditLog}
                          onDelete={onDeleteLog}
                        />
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div style={styles.hint}>Press D to close</div>
      </div>
    </div>
  );
}

const styles = {
  overlay: {
    position: 'fixed', inset: 0,
    background: 'rgba(0,0,0,0.3)',
    zIndex: 150,
    display: 'flex', justifyContent: 'flex-end',
  },
  panel: {
    width: 320,
    height: '100%',
    background: 'rgba(12,12,28,0.97)',
    backdropFilter: 'blur(20px)',
    borderLeft: '1px solid rgba(255,255,255,0.08)',
    display: 'flex', flexDirection: 'column',
    padding: '24px 20px',
    overflowY: 'auto',
  },
  header: {
    display: 'flex', justifyContent: 'space-between',
    alignItems: 'flex-start', marginBottom: 24,
  },
  title: { color: '#fff', fontWeight: 700, fontSize: 18 },
  sub: { color: 'rgba(255,255,255,0.4)', fontSize: 12, marginTop: 4 },
  closeBtn: {
    background: 'none', border: 'none',
    color: 'rgba(255,255,255,0.4)', fontSize: 18, cursor: 'pointer',
  },
  list: { display: 'flex', flexDirection: 'column', gap: 10, flex: 1 },
  card: {
    borderRadius: 14, border: '1px solid',
    padding: '14px 16px',
  },
  cardTop: {
    display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10,
  },
  avatarCircle: {
    width: 38, height: 38, borderRadius: '50%',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    flexShrink: 0,
  },
  avatarEmoji: { fontSize: 20 },
  nameBlock: { flex: 1, minWidth: 0 },
  playerName: {
    color: '#fff', fontWeight: 700, fontSize: 14,
    display: 'flex', alignItems: 'center', gap: 6,
  },
  youBadge: {
    background: 'rgba(108,99,255,0.3)',
    border: '1px solid rgba(108,99,255,0.4)',
    borderRadius: 20, padding: '1px 7px',
    fontSize: 10, color: '#a5b4fc', fontWeight: 600,
  },
  onlineTime: {
    color: 'rgba(255,255,255,0.35)', fontSize: 11, marginTop: 2,
    display: 'block',
  },
  onlineDot: {
    width: 8, height: 8, borderRadius: '50%',
    background: '#4ade80', flexShrink: 0,
    boxShadow: '0 0 6px #4ade80',
  },
  nowRow: { marginTop: 2 },
  nowText: {
    color: '#c4b5fd', fontSize: 13, fontWeight: 600,
    display: 'block',
  },
  nowEmpty: {
    color: 'rgba(255,255,255,0.2)', fontSize: 12, fontStyle: 'italic',
  },
  zoneRow: { marginTop: 6 },
  zoneText: {
    color: 'rgba(255,255,255,0.4)', fontSize: 11,
    background: 'rgba(255,255,255,0.05)',
    borderRadius: 20, padding: '2px 10px',
    display: 'inline-block',
  },
  logSection: {
    marginTop: 10,
    borderTop: '1px solid rgba(255,255,255,0.06)',
    paddingTop: 8,
  },
  logTitle: {
    color: 'rgba(255,255,255,0.3)', fontSize: 10,
    fontWeight: 700, letterSpacing: 1,
    textTransform: 'uppercase', marginBottom: 8,
    display: 'flex', justifyContent: 'space-between',
  },
  count: { color: 'rgba(255,255,255,0.2)', fontWeight: 400 },
  hint: {
    color: 'rgba(255,255,255,0.2)', fontSize: 11,
    textAlign: 'center', marginTop: 16,
  },
};
