import { useState, useEffect, useRef } from 'react';

export default function NowInput({ currentNow, onSubmit, onClose }) {
  const [text, setText] = useState(currentNow || '');
  const inputRef = useRef(null);

  useEffect(() => {
    inputRef.current?.focus();
    inputRef.current?.select();
  }, []);

  const handleKey = (e) => {
    e.stopPropagation();
    if (e.key === 'Enter') { onSubmit(text.trim()); onClose(); }
    if (e.key === 'Escape') onClose();
  };


  return (
    <div style={styles.overlay}>
      <div style={styles.box}>
        <div style={styles.header}>
          <span style={styles.icon}>🧠</span>
          <div>
            <div style={styles.title}>Now Focus 正在搞</div>
            <div style={styles.subtitle}>What are you working on right now?</div>
          </div>
          <button style={styles.close} onClick={onClose}>✕</button>
        </div>

        <input
          ref={inputRef}
          style={styles.input}
          value={text}
          maxLength={120}
          placeholder="e.g. Fixing login bug on mobile, building checkout flow..."
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKey}
        />

        <p style={styles.guide}>
          Be specific — your teammates will see this in real time and in the work log at the end of the day.
        </p>

        <div style={styles.footer}>
          <button style={styles.clearBtn} onClick={() => { onSubmit(''); onClose(); }}>
            Clear
          </button>
          <button style={styles.sendBtn} onClick={() => { onSubmit(text.trim()); onClose(); }}>
            🧠 Log Focus ↵
          </button>
        </div>
      </div>
    </div>
  );
}

const styles = {
  overlay: {
    position: 'fixed', inset: 0,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    background: 'rgba(0,0,0,0.45)', zIndex: 200,
  },
  box: {
    background: 'rgba(18,18,35,0.97)',
    border: '1px solid rgba(139,92,246,0.3)',
    borderRadius: 20, padding: '28px 32px',
    width: 480, maxWidth: '90vw',
    boxShadow: '0 24px 64px rgba(0,0,0,0.5)',
  },
  header: {
    display: 'flex', alignItems: 'center', gap: 12, marginBottom: 18,
  },
  icon: { fontSize: 28 },
  title: { color: '#fff', fontWeight: 700, fontSize: 16 },
  subtitle: { color: 'rgba(255,255,255,0.4)', fontSize: 12, marginTop: 2 },
  close: {
    marginLeft: 'auto', background: 'none', border: 'none',
    color: 'rgba(255,255,255,0.4)', fontSize: 18, cursor: 'pointer',
  },
  input: {
    width: '100%',
    background: 'rgba(139,92,246,0.1)',
    border: '1px solid rgba(139,92,246,0.35)',
    borderRadius: 10, padding: '12px 14px',
    color: '#fff', fontSize: 15, outline: 'none', marginBottom: 16,
  },
  guide: {
    color: 'rgba(255,255,255,0.35)', fontSize: 12,
    lineHeight: 1.5, marginBottom: 20, marginTop: -8,
  },
  footer: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  clearBtn: {
    background: 'none', border: '1px solid rgba(255,255,255,0.15)',
    borderRadius: 8, padding: '8px 16px',
    color: 'rgba(255,255,255,0.4)', fontSize: 13, cursor: 'pointer',
  },
  sendBtn: {
    background: 'linear-gradient(135deg, #7C3AED, #6C63FF)',
    border: 'none', borderRadius: 8, padding: '8px 20px',
    color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer',
  },
};
