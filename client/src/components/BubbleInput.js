import { useState, useEffect, useRef } from 'react';

// Shown when user presses T — lets them type a speech bubble message
export default function BubbleInput({ currentBubble, onSubmit, onClose }) {
  const [text, setText] = useState(currentBubble || '');
  const inputRef = useRef(null);

  useEffect(() => {
    inputRef.current?.focus();
    inputRef.current?.select();
  }, []);

  const handleKey = (e) => {
    e.stopPropagation(); // prevent WASD moving avatar while typing
    if (e.key === 'Enter') {
      onSubmit(text.trim());
      onClose();
    }
    if (e.key === 'Escape') {
      onClose();
    }
  };

  const QUICK = [
    '☕ Enjoying my coffee',
    '🍱 Food time',
    '✨ Working on some magic',
    '🎵 Music makes me happy',
    '💭 Thinking…',
    '👋 BRB',
    '☀️ Today is a beautiful day',
    '🕺 I wanna dance',
  ];

  return (
    <div style={styles.overlay}>
      <div style={styles.box}>
        <div style={styles.header}>
          <span style={styles.icon}>💬</span>
          <span style={styles.title}>What's on your mind?</span>
          <button style={styles.close} onClick={onClose}>✕</button>
        </div>

        <textarea
          ref={inputRef}
          style={styles.input}
          value={text}
          maxLength={120}
          rows={3}
          placeholder="Type a message... (Enter to send, Esc to cancel)"
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKey}
        />

        <div style={styles.quickRow}>
          {QUICK.map((q) => (
            <button
              key={q}
              style={styles.quickBtn}
              onClick={() => { onSubmit(q); onClose(); }}
            >
              {q}
            </button>
          ))}
        </div>

        <div style={styles.footer}>
          <button style={styles.clearBtn} onClick={() => { onSubmit(''); onClose(); }}>
            Clear bubble
          </button>
          <button style={styles.sendBtn} onClick={() => { onSubmit(text.trim()); onClose(); }}>
            Send ↵
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
    background: 'rgba(0,0,0,0.4)',
    zIndex: 200,
  },
  box: {
    background: 'rgba(18,18,35,0.97)',
    border: '1px solid rgba(255,255,255,0.12)',
    borderRadius: 20,
    padding: '28px 32px',
    width: 480, maxWidth: '90vw',
    boxShadow: '0 24px 64px rgba(0,0,0,0.5)',
  },
  header: {
    display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16,
  },
  icon: { fontSize: 22 },
  title: { color: '#fff', fontWeight: 700, fontSize: 16, flex: 1 },
  close: {
    background: 'none', border: 'none',
    color: 'rgba(255,255,255,0.4)', fontSize: 18, cursor: 'pointer',
  },
  input: {
    width: '100%',
    background: 'rgba(255,255,255,0.07)',
    border: '1px solid rgba(255,255,255,0.15)',
    borderRadius: 10, padding: '14px 16px',
    color: '#fff', fontSize: 15, outline: 'none',
    marginBottom: 16, resize: 'none', lineHeight: 1.5,
    fontFamily: '"Segoe UI", sans-serif',
  },
  quickRow: {
    display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 20,
  },
  quickBtn: {
    background: 'rgba(255,255,255,0.06)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: 20, padding: '6px 12px',
    color: 'rgba(255,255,255,0.75)', fontSize: 12, cursor: 'pointer',
    transition: 'background 0.15s',
  },
  footer: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  clearBtn: {
    background: 'none', border: '1px solid rgba(255,255,255,0.15)',
    borderRadius: 8, padding: '8px 16px',
    color: 'rgba(255,255,255,0.4)', fontSize: 13, cursor: 'pointer',
  },
  sendBtn: {
    background: 'linear-gradient(135deg, #6C63FF, #3ECFCF)',
    border: 'none', borderRadius: 8, padding: '8px 20px',
    color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer',
  },
};
