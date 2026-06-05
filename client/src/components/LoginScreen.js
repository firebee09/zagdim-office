import { useState } from 'react';
import { AVATARS } from '../constants/avatars';

export default function LoginScreen({ onJoin, error }) {
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState(AVATARS[0].id);

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed || !password) return;
    onJoin(trimmed, selectedAvatar, password);
  };

  return (
    <div style={styles.overlay}>
      <div style={styles.card}>
        <h1 style={styles.title}>Zagdim Office</h1>
        <p style={styles.subtitle}>Pick your avatar and join the office</p>

        {error && (
          <div style={styles.errorBanner}>⚠️ {error}</div>
        )}

        <form onSubmit={handleSubmit} style={styles.form}>
          {/* Nickname */}
          <label style={styles.label}>Your name</label>
          <div style={styles.namePresets}>
            {['Winfield', 'Fiamma', 'Va', 'Elaine', 'Jojo'].map((n) => (
              <button
                key={n}
                type="button"
                style={{
                  ...styles.namePreset,
                  ...(name === n ? styles.namePresetActive : {}),
                }}
                onClick={() => setName(n)}
              >
                {n}
              </button>
            ))}
          </div>
          <input
            style={styles.input}
            type="text"
            placeholder="…or type a custom name"
            maxLength={24}
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoFocus
          />

          {/* Room password */}
          <label style={styles.label}>Room password</label>
          <input
            style={styles.input}
            type="password"
            placeholder="Ask your team lead"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          {/* Avatar grid */}
          <label style={styles.label}>Choose your avatar</label>
          <div style={styles.avatarGrid}>
            {AVATARS.map((av) => (
              <button
                key={av.id}
                type="button"
                style={{
                  ...styles.avatarBtn,
                  background: av.color,
                  border: selectedAvatar === av.id
                    ? '3px solid #6C63FF'
                    : '3px solid transparent',
                  transform: selectedAvatar === av.id ? 'scale(1.15)' : 'scale(1)',
                }}
                onClick={() => setSelectedAvatar(av.id)}
                title={av.id}
              >
                <span style={styles.avatarEmoji}>{av.emoji}</span>
              </button>
            ))}
          </div>

          <button
            type="submit"
            disabled={!name.trim() || !password}
            style={{
              ...styles.joinBtn,
              opacity: name.trim() && password ? 1 : 0.4,
              cursor: name.trim() && password ? 'pointer' : 'not-allowed',
            }}
          >
            Enter Office →
          </button>
        </form>
      </div>
    </div>
  );
}

const styles = {
  overlay: {
    position: 'fixed', inset: 0,
    background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  card: {
    background: 'rgba(255,255,255,0.05)',
    backdropFilter: 'blur(16px)',
    border: '1px solid rgba(255,255,255,0.12)',
    borderRadius: 24,
    padding: '40px 48px',
    width: 480,
    maxWidth: '90vw',
    boxShadow: '0 24px 64px rgba(0,0,0,0.4)',
  },
  title: {
    color: '#fff',
    fontSize: 32,
    fontWeight: 700,
    textAlign: 'center',
    marginBottom: 6,
    letterSpacing: '-0.5px',
  },
  subtitle: {
    color: 'rgba(255,255,255,0.5)',
    textAlign: 'center',
    marginBottom: 32,
    fontSize: 14,
  },
  form: { display: 'flex', flexDirection: 'column', gap: 8 },
  label: { color: 'rgba(255,255,255,0.7)', fontSize: 13, fontWeight: 600, marginBottom: 2 },
  input: {
    background: 'rgba(255,255,255,0.08)',
    border: '1px solid rgba(255,255,255,0.15)',
    borderRadius: 10,
    padding: '12px 16px',
    color: '#fff',
    fontSize: 16,
    outline: 'none',
    marginBottom: 20,
  },
  namePresets: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 10,
  },
  namePreset: {
    background: 'rgba(255,255,255,0.08)',
    border: '1px solid rgba(255,255,255,0.15)',
    borderRadius: 20,
    padding: '6px 14px',
    color: 'rgba(255,255,255,0.75)',
    fontSize: 13,
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.15s',
  },
  namePresetActive: {
    background: 'linear-gradient(135deg, #6C63FF, #3ECFCF)',
    border: '1px solid rgba(108,99,255,0.5)',
    color: '#fff',
  },
  avatarGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(6, 1fr)',
    gap: 8,
    marginBottom: 28,
    marginTop: 8,
  },
  avatarBtn: {
    width: '100%',
    aspectRatio: '1',
    borderRadius: 12,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'transform 0.15s, border 0.15s',
  },
  avatarEmoji: { fontSize: 24, lineHeight: 1 },
  errorBanner: {
    background: 'rgba(255,80,80,0.15)',
    border: '1px solid rgba(255,80,80,0.3)',
    borderRadius: 10,
    padding: '10px 14px',
    color: '#ff8080',
    fontSize: 13,
    marginBottom: 16,
    textAlign: 'center',
  },
  joinBtn: {
    background: 'linear-gradient(135deg, #6C63FF, #3ECFCF)',
    border: 'none',
    borderRadius: 12,
    padding: '14px',
    color: '#fff',
    fontSize: 16,
    fontWeight: 700,
    letterSpacing: 0.3,
    transition: 'opacity 0.2s',
  },
};
