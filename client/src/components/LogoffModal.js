import { useState } from 'react';

function formatTime(ts) {
  if (!ts) return '';
  return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function formatDate() {
  return new Date().toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' });
}

export default function LogoffModal({ playerName, nowLog, onConfirm, onCancel }) {
  const [copied, setCopied] = useState(false);

  const hasLog = nowLog && nowLog.length > 0;

  const buildLogText = () => {
    const date = formatDate();
    const lines = [`Work log for ${playerName} — ${date}`, ''];
    if (hasLog) {
      nowLog.forEach(e => {
        lines.push(`${formatTime(e.time)}  ${e.text}`);
      });
    } else {
      lines.push('No focus items logged today.');
    }
    return lines.join('\n');
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(buildLogText());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleEmail = () => {
    const subject = encodeURIComponent(`Work log — ${formatDate()}`);
    const body = encodeURIComponent(buildLogText());
    window.open(`mailto:?subject=${subject}&body=${body}`);
  };

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>

        {/* Header */}
        <div style={styles.header}>
          <span style={styles.icon}>🚪</span>
          <div>
            <div style={styles.title}>Leaving the office?</div>
            <div style={styles.date}>{formatDate()}</div>
          </div>
        </div>

        {/* Work log summary */}
        <div style={styles.logBox}>
          <div style={styles.logHeader}>
            🧠 Today's work log
            <span style={styles.count}>{hasLog ? `${nowLog.length} items` : 'nothing logged'}</span>
          </div>

          {hasLog ? (
            <div style={styles.logList}>
              {[...nowLog].reverse().map((e, i) => (
                <div key={i} style={styles.logRow}>
                  <span style={styles.logTime}>{formatTime(e.time)}</span>
                  <span style={styles.logText}>{e.text}</span>
                </div>
              ))}
            </div>
          ) : (
            <div style={styles.emptyLog}>
              You didn't set any focus items today. That's okay!
            </div>
          )}
        </div>

        {/* Email / copy actions */}
        <div style={styles.shareRow}>
          <button style={styles.copyBtn} onClick={handleCopy}>
            {copied ? '✓ Copied!' : '📋 Copy log'}
          </button>
          <button style={styles.emailBtn} onClick={handleEmail}>
            📧 Open in email
          </button>
        </div>

        {/* Confirm / cancel */}
        <div style={styles.footer}>
          <button style={styles.stayBtn} onClick={onCancel}>
            Stay in office
          </button>
          <button style={styles.leaveBtn} onClick={onConfirm}>
            🚪 Leave office
          </button>
        </div>
      </div>
    </div>
  );
}

const styles = {
  overlay: {
    position: 'fixed', inset: 0,
    background: 'rgba(0,0,0,0.6)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    zIndex: 300,
  },
  modal: {
    background: 'rgba(14,14,30,0.98)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: 24, padding: '32px 36px',
    width: 460, maxWidth: '90vw',
    boxShadow: '0 32px 80px rgba(0,0,0,0.6)',
  },
  header: {
    display: 'flex', alignItems: 'center', gap: 14, marginBottom: 24,
  },
  icon: { fontSize: 36 },
  title: { color: '#fff', fontWeight: 700, fontSize: 20 },
  date: { color: 'rgba(255,255,255,0.4)', fontSize: 13, marginTop: 3 },
  logBox: {
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: 14, padding: '16px 18px',
    marginBottom: 16, maxHeight: 260, overflowY: 'auto',
  },
  logHeader: {
    color: 'rgba(255,255,255,0.5)', fontSize: 12, fontWeight: 700,
    textTransform: 'uppercase', letterSpacing: 0.8,
    display: 'flex', justifyContent: 'space-between', marginBottom: 12,
  },
  count: { color: 'rgba(255,255,255,0.25)', fontWeight: 400 },
  logList: { display: 'flex', flexDirection: 'column', gap: 8 },
  logRow: { display: 'flex', gap: 12, alignItems: 'baseline' },
  logTime: {
    color: 'rgba(255,255,255,0.3)', fontSize: 11,
    flexShrink: 0, fontVariantNumeric: 'tabular-nums',
  },
  logText: { color: '#fff', fontSize: 14 },
  emptyLog: { color: 'rgba(255,255,255,0.3)', fontSize: 13, fontStyle: 'italic' },
  shareRow: {
    display: 'flex', gap: 10, marginBottom: 20,
  },
  copyBtn: {
    flex: 1, background: 'rgba(255,255,255,0.07)',
    border: '1px solid rgba(255,255,255,0.12)',
    borderRadius: 10, padding: '10px',
    color: 'rgba(255,255,255,0.7)', fontSize: 13, cursor: 'pointer',
  },
  emailBtn: {
    flex: 1, background: 'rgba(255,255,255,0.07)',
    border: '1px solid rgba(255,255,255,0.12)',
    borderRadius: 10, padding: '10px',
    color: 'rgba(255,255,255,0.7)', fontSize: 13, cursor: 'pointer',
  },
  footer: { display: 'flex', gap: 12 },
  stayBtn: {
    flex: 1, background: 'none',
    border: '1px solid rgba(255,255,255,0.12)',
    borderRadius: 12, padding: '12px',
    color: 'rgba(255,255,255,0.5)', fontSize: 14, cursor: 'pointer',
  },
  leaveBtn: {
    flex: 1,
    background: 'linear-gradient(135deg, #ef4444, #dc2626)',
    border: 'none', borderRadius: 12, padding: '12px',
    color: '#fff', fontSize: 14, fontWeight: 700, cursor: 'pointer',
  },
};
