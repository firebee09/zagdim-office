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

  const QUICK = [
    'Writing code',
    'In a design review',
    'Reviewing PRs',
    'Planning sprint',
    'Fixing a bug',
    'Writing docs',
    'Client call',
    'Deep research',
    'Brainstorming',
    'Wrapping up for the day',
  ];

  return (
    <div style={styles.overlay}>
      <div style={styles.box}>
        <div style={styles.header}>
          <span style={styles.icon}>🧠</span>
          <div>
            <div style={styles.title}>What are you working on?</div>
            <div style={styles.subtitle}>Visible to your whole team</div>
          </div>
          <button style={styles.close} onClick={onClose}>✕</button>
        </div>

        <input
          ref={inputRef}
          style={styles.input}
          value={text}
          maxLength={120}
          placeholder="e.g. Building the social media feature..."
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKey}
        />

        <div style={styles.quickRow}>
          {QUICK.map((q) => (
            <button key={q} style={styles.quickBtn}
              onClick={() => { onSubmit(q); onClose(); }}>
              {q}
            </button>
          ))}
        </div>

        <div style={styles.footer}>
          <button style={styles.clearBtn} onClick={() => { onSubmit(''); onClose(); }}>
            Clear
          </button>
          <button style={styles.sendBtn} onClick={() => { onSubmit(text.trim()); onClose(); }}>
            Set 🧠 Now ↵
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
  quickRow: {
    display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 20,
  },
  quickBtn: {
    background: 'rgba(139,92,246,0.1)',
    border: '1px solid rgba(139,92,246,0.2)',
    borderRadius: 20, padding: '5px 12px',
    color: 'rgba(255,255,255,0.7)', fontSize: 12, cursor: 'pointer',
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
