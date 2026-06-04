import { useEffect, useRef, useCallback, useState } from 'react';
import { AVATARS, AVATAR_SIZE, AVATAR_RADIUS } from '../constants/avatars';
import { ZONES, ZONE_IMAGES, DESK_POSITIONS, ZONE_W, ZONE_H, DESK_W, DESK_H, getZoneAt } from '../constants/zones';
import { audio } from '../utils/audio';
import { useSocket } from '../hooks/useSocket';
import WaveNotification from './WaveNotification';
import RoomNotification from './RoomNotification';
import BubbleInput from './BubbleInput';
import NowInput from './NowInput';
import TeamDashboard from './TeamDashboard';
import StatusBar from './StatusBar';

const SPEED = 3;          // pixels per frame
const LERP = 0.18;        // remote player smoothing factor
const WAVE_RADIUS = 120;  // px — show wave button inside this distance

export default function GameCanvas({ playerName, avatarId, socket, initData }) {
  const canvasRef = useRef(null);
  const mapImgRef = useRef(null);
  const mapLoadedRef = useRef(false);
  const zoneImagesRef = useRef({});   // id → HTMLImageElement
  const deskImagesRef = useRef({});   // id → HTMLImageElement

  // Game state stored in refs (mutated per frame, no re-render needed)
  const selfRef = useRef(null);          // { id, x, y, avatar, name, status }
  const playersRef = useRef({});         // id → { ...player, renderX, renderY }
  const keysRef = useRef({});            // which keys are held
  const mapConfigRef = useRef({ width: 1280, height: 720 });
  const hoveredIdRef = useRef(null);     // id of player mouse is over

  // React state only for things that need UI re-renders
  const [status, setStatus] = useState('');
  const [bubble, setBubbleText] = useState('');
  const [showBubbleInput, setShowBubbleInput] = useState(false);
  const [nowText, setNowText] = useState('');
  const [showNowInput, setShowNowInput] = useState(false);
  const [showDashboard, setShowDashboard] = useState(false);
  const [playersState, setPlayersState] = useState({});
  const [waveNotifs, setWaveNotifs] = useState([]);
  const [roomNotifs, setRoomNotifs] = useState([]);
  const [walkTarget, setWalkTarget] = useState(null);
  const currentZoneRef = useRef(null);           // zone the local player is currently in
  const zoneOccupantsRef = useRef({});           // zoneId → [name, name, ...]

  // ── Seed refs synchronously from initData (before any effects run) ────────
  if (initData && !selfRef.current) {
    mapConfigRef.current = initData.mapConfig;
    initData.players.forEach((p) => {
      playersRef.current[p.id] = { ...p, renderX: p.x, renderY: p.y };
      if (p.id === initData.self) selfRef.current = { ...p };
    });
  }

  // Helper to sync playersRef → playersState for dashboard
  const syncPlayers = useCallback(() => {
    setPlayersState({ ...playersRef.current });
  }, []);

  // ── Socket callbacks ──────────────────────────────────────────────────────
  const onInit = useCallback(({ mapConfig, self: selfId, players }) => {
    mapConfigRef.current = mapConfig;
    playersRef.current = {};
    players.forEach((p) => {
      playersRef.current[p.id] = { ...p, renderX: p.x, renderY: p.y };
      if (p.id === selfId) selfRef.current = { ...p };
    });
    syncPlayers();
  }, [syncPlayers]);

  const onPlayerJoined = useCallback((p) => {
    playersRef.current[p.id] = { ...p, renderX: p.x, renderY: p.y };
    audio.playJoin();
    syncPlayers();
  }, [syncPlayers]);

  const onPlayerMoved = useCallback(({ id, x, y }) => {
    const p = playersRef.current[id];
    if (p) { p.x = x; p.y = y; }
  }, []);

  const onPlayerLeft = useCallback(({ id }) => {
    if (playersRef.current[id]) audio.playLeave();
    delete playersRef.current[id];
    syncPlayers();
  }, [syncPlayers]);

  const onPlayerStatusChanged = useCallback(({ id, status: s }) => {
    const p = playersRef.current[id];
    if (p) p.status = s;
  }, []);

  const onPlayerWaved = useCallback(({ fromId, fromName, fromX, fromY }) => {
    audio.playDing();
    setWaveNotifs((prev) => [
      ...prev,
      { id: `${fromId}-${Date.now()}`, fromId, fromName, fromX, fromY },
    ]);
  }, []);

  const onPlayerBubbleChanged = useCallback(({ id, bubble: b }) => {
    const p = playersRef.current[id];
    if (p) p.bubble = b;
  }, []);

  const onPlayerNowChanged = useCallback(({ id, now, nowLog }) => {
    const p = playersRef.current[id];
    if (p) { p.now = now; if (nowLog) p.nowLog = nowLog; }
    syncPlayers();
  }, [syncPlayers]);

  const onZoneUpdated = useCallback(({ zoneId, occupants }) => {
    zoneOccupantsRef.current[zoneId] = occupants;
  }, []);

  const onZoneEntered = useCallback(({ playerName, zoneLabel, occupants }) => {
    setRoomNotifs((prev) => [
      ...prev,
      { id: `enter-${Date.now()}`, type: 'enter', playerName, zoneLabel, occupants },
    ]);
  }, []);

  const onZoneLeft = useCallback(({ playerName, zoneLabel }) => {
    setRoomNotifs((prev) => [
      ...prev,
      { id: `leave-${Date.now()}`, type: 'leave', playerName, zoneLabel },
    ]);
  }, []);

  const { move, setStatus: emitStatus, wave, enterZone, leaveZone, setBubble: emitBubble, setNow: emitNow } = useSocket(socket, {
    onInit, onPlayerJoined, onPlayerMoved, onPlayerLeft, onPlayerStatusChanged, onPlayerWaved,
    onZoneUpdated, onZoneEntered, onZoneLeft, onPlayerBubbleChanged, onPlayerNowChanged,
  });

  // Request fresh state on mount AND every 3 seconds as a safety net
  // This guarantees players always appear even if a player:joined event was missed
  useEffect(() => {
    socket.emit('player:request_state');
    const interval = setInterval(() => {
      socket.emit('player:request_state');
    }, 3000);
    return () => clearInterval(interval);
  }, [socket]);

  // ── Load map assets ───────────────────────────────────────────────────────
  useEffect(() => {
    // Optional custom background
    const mapImg = new Image();
    mapImg.src = '/office-map.png';
    mapImg.onload = () => { mapImgRef.current = mapImg; mapLoadedRef.current = true; };
    mapImg.onerror = () => { mapLoadedRef.current = false; };

    // Zone images (Phone Booth, Meeting Room, Pantry, Outdoor)
    ZONE_IMAGES.forEach(({ id, src }) => {
      const img = new Image();
      img.src = src;
      img.onload = () => { zoneImagesRef.current[id] = img; };
    });

    // Desk sprites (desk1–desk5)
    DESK_POSITIONS.forEach(({ id, src }) => {
      const img = new Image();
      img.src = src;
      img.onload = () => { deskImagesRef.current[id] = img; };
    });
  }, []);

  // ── Keyboard input ────────────────────────────────────────────────────────
  useEffect(() => {
    const onDown = (e) => {
      // T key opens the bubble input (only when not already typing somewhere)
      if (e.key === 't' || e.key === 'T') {
        if (e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA') {
          e.preventDefault();
          setShowBubbleInput(true);
          return;
        }
      }
      if (e.key === 'n' || e.key === 'N') {
        if (e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA') {
          e.preventDefault();
          setShowNowInput(true);
          return;
        }
      }
      if (e.key === 'd' || e.key === 'D') {
        if (e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA') {
          e.preventDefault();
          setShowDashboard(prev => !prev);
          syncPlayers();
          return;
        }
      }
      keysRef.current[e.key] = true;
      if (['ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.key)) e.preventDefault();
    };
    const onUp = (e) => { keysRef.current[e.key] = false; };
    window.addEventListener('keydown', onDown);
    window.addEventListener('keyup', onUp);
    return () => { window.removeEventListener('keydown', onDown); window.removeEventListener('keyup', onUp); };
  }, []);

  // ── Mouse: hover & click ──────────────────────────────────────────────────
  const getPlayerAtPoint = useCallback((canvasX, canvasY) => {
    const self = selfRef.current;
    for (const p of Object.values(playersRef.current)) {
      if (self && p.id === self.id) continue;
      const dx = p.renderX - canvasX;
      const dy = p.renderY - canvasY;
      if (Math.sqrt(dx * dx + dy * dy) <= AVATAR_RADIUS + 4) return p;
    }
    return null;
  }, []);

  const handleMouseMove = useCallback((e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const cx = (e.clientX - rect.left) * scaleX;
    const cy = (e.clientY - rect.top) * scaleY;
    const p = getPlayerAtPoint(cx, cy);
    hoveredIdRef.current = p ? p.id : null;
    canvas.style.cursor = p ? 'pointer' : 'crosshair';
  }, [getPlayerAtPoint]);

  const handleClick = useCallback((e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const cx = (e.clientX - rect.left) * scaleX;
    const cy = (e.clientY - rect.top) * scaleY;
    const p = getPlayerAtPoint(cx, cy);
    if (p) {
      wave(p.id);          // clicked another player → wave
    } else {
      setWalkTarget({ x: cx, y: cy }); // clicked empty space → walk there
    }
  }, [getPlayerAtPoint, wave]);

  // ── Wave notification handlers ────────────────────────────────────────────
  const handleWalkOver = useCallback((notif) => {
    const self = selfRef.current;
    const STOP_DISTANCE = 72; // px — stand next to, not on top of

    let tx = notif.fromX;
    let ty = notif.fromY;

    if (self) {
      // Direction from waver toward me — stop just before reaching them
      const dx = self.x - notif.fromX;
      const dy = self.y - notif.fromY;
      const dist = Math.sqrt(dx * dx + dy * dy) || 1;
      tx = notif.fromX + (dx / dist) * STOP_DISTANCE;
      ty = notif.fromY + (dy / dist) * STOP_DISTANCE;
    }

    setWalkTarget({ x: tx, y: ty });
    setWaveNotifs((prev) => prev.filter((n) => n.id !== notif.id));
  }, []);

  const handleDismissNotif = useCallback((id) => {
    setWaveNotifs((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const handleStatusChange = useCallback((s) => {
    setStatus(s);
    emitStatus(s);
    if (selfRef.current) selfRef.current.status = s;
    const self = selfRef.current;
    if (self && playersRef.current[self.id]) playersRef.current[self.id].status = s;
  }, [emitStatus]);

  // ── Main game loop ────────────────────────────────────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let rafId;
    let lastEmitTime = 0;
    const EMIT_INTERVAL = 50; // ms between position broadcasts

    // Pre-build emoji image cache for crisp canvas rendering
    const emojiCache = {};
    AVATARS.forEach(({ id, emoji, color }) => {
      const off = document.createElement('canvas');
      off.width = AVATAR_SIZE + 8;
      off.height = AVATAR_SIZE + 8;
      const oc = off.getContext('2d');
      // Circle background
      oc.beginPath();
      oc.arc((AVATAR_SIZE + 8) / 2, (AVATAR_SIZE + 8) / 2, AVATAR_SIZE / 2, 0, Math.PI * 2);
      oc.fillStyle = color;
      oc.fill();
      // Emoji
      oc.font = `${AVATAR_SIZE * 0.6}px serif`;
      oc.textAlign = 'center';
      oc.textBaseline = 'middle';
      oc.fillText(emoji, (AVATAR_SIZE + 8) / 2, (AVATAR_SIZE + 8) / 2 + 1);
      emojiCache[id] = off;
    });

    function drawPlayer(p, isSelf) {
      const x = Math.round(p.renderX);
      const y = Math.round(p.renderY);
      const half = (AVATAR_SIZE + 8) / 2;
      const img = emojiCache[p.avatar] || emojiCache[AVATARS[0].id];

      // Glow ring for self
      if (isSelf) {
        ctx.save();
        ctx.shadowBlur = 18;
        ctx.shadowColor = '#6C63FF';
        ctx.beginPath();
        ctx.arc(x, y, AVATAR_RADIUS + 4, 0, Math.PI * 2);
        ctx.strokeStyle = '#6C63FF';
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.restore();
      }

      // Hover ring
      if (hoveredIdRef.current === p.id) {
        ctx.beginPath();
        ctx.arc(x, y, AVATAR_RADIUS + 6, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(255,255,255,0.5)';
        ctx.lineWidth = 2;
        ctx.stroke();
      }

      // Avatar sprite
      ctx.drawImage(img, x - half, y - half, AVATAR_SIZE + 8, AVATAR_SIZE + 8);

      // Wave icon if hovered + within wave radius
      if (hoveredIdRef.current === p.id) {
        const self = selfRef.current;
        if (self) {
          const dx = x - self.x; const dy = y - self.y;
          if (Math.sqrt(dx * dx + dy * dy) <= WAVE_RADIUS) {
            ctx.font = '18px serif';
            ctx.textAlign = 'center';
            ctx.fillText('👋', x + AVATAR_RADIUS, y - AVATAR_RADIUS);
          }
        }
      }

      // ── 🧠 Now label (persistent work focus) ──
      if (p.now) {
        const nowLabel = `🧠 ${p.now}`;
        ctx.font = 'bold 12px "Segoe UI", sans-serif';
        ctx.textAlign = 'center';
        const nW = Math.min(ctx.measureText(nowLabel).width + 20, 240);
        const nH = 22;
        const nX = x - nW / 2;
        const nY = y - AVATAR_RADIUS - 34;

        // Amber/purple pill background
        ctx.fillStyle = 'rgba(124,58,237,0.85)';
        ctx.beginPath();
        ctx.roundRect(nX, nY, nW, nH, 11);
        ctx.fill();

        ctx.fillStyle = '#fff';
        // Truncate if too long
        const maxChars = 28;
        const display = nowLabel.length > maxChars ? nowLabel.slice(0, maxChars) + '…' : nowLabel;
        ctx.fillText(display, x, nY + 15);
      }

      // ── Speech bubble ──
      if (p.bubble) {
        const bText = p.bubble;
        ctx.font = 'bold 14px "Segoe UI", sans-serif';
        ctx.textAlign = 'center';

        // Word-wrap to max 220px
        const maxW = 220;
        const words = bText.split(' ');
        const lines = [];
        let line = '';
        words.forEach((word) => {
          const test = line ? `${line} ${word}` : word;
          if (ctx.measureText(test).width > maxW) {
            if (line) lines.push(line);
            line = word;
          } else {
            line = test;
          }
        });
        if (line) lines.push(line);

        const lineH = 19;
        const padX = 10; const padY = 8;
        const bW = Math.min(maxW, Math.max(...lines.map(l => ctx.measureText(l).width))) + padX * 2;
        const bH = lines.length * lineH + padY * 2;
        const bX = x - bW / 2;
        const bY = y - AVATAR_RADIUS - 14 - bH - 22; // above name tag

        // Bubble background
        ctx.fillStyle = 'rgba(255,255,255,0.95)';
        ctx.beginPath();
        ctx.roundRect(bX, bY, bW, bH, 10);
        ctx.fill();

        // Tail (triangle pointing down)
        ctx.beginPath();
        ctx.moveTo(x - 7, bY + bH);
        ctx.lineTo(x + 7, bY + bH);
        ctx.lineTo(x, bY + bH + 8);
        ctx.fillStyle = 'rgba(255,255,255,0.95)';
        ctx.fill();

        // Text
        ctx.fillStyle = '#1a1a2e';
        lines.forEach((l, i) => {
          ctx.fillText(l, x, bY + padY + (i + 0.8) * lineH);
        });
      }

      // Name tag + status — below the avatar
      const label = p.status ? `${p.name}  ${p.status}` : p.name;
      ctx.font = 'bold 12px "Segoe UI", sans-serif';
      ctx.textAlign = 'center';
      const textWidth = ctx.measureText(label).width;
      const tpadX = 8; const tH = 20;
      const tagX = x - textWidth / 2 - tpadX;
      const tagW = textWidth + tpadX * 2;
      const tagY = y + AVATAR_RADIUS + 6;

      ctx.fillStyle = isSelf ? 'rgba(108,99,255,0.85)' : 'rgba(10,10,30,0.78)';
      ctx.beginPath();
      ctx.roundRect(tagX, tagY, tagW, tH, 6);
      ctx.fill();

      ctx.fillStyle = '#fff';
      ctx.fillText(label, x, tagY + 14);
    }

    function drawZones() {
      ZONES.forEach((z) => {
        const isMeeting = z.type === 'meeting';
        const occupants = zoneOccupantsRef.current[z.id] || [];
        const hasOccupants = occupants.length > 0;
        const cx = z.x + z.w / 2;
        const cy = z.y + z.h / 2;

        // Zone border (skip for image zones — they have their own visual)
        if (isMeeting || z.id === 'work_area') {
          ctx.strokeStyle = isMeeting
            ? (hasOccupants ? 'rgba(108,99,255,0.6)' : 'rgba(108,99,255,0.25)')
            : 'rgba(255,255,255,0.07)';
          ctx.lineWidth = isMeeting ? 2 : 1;
          ctx.beginPath();
          ctx.roundRect(z.x, z.y, z.w, z.h, 12);
          ctx.stroke();

          if (isMeeting && hasOccupants) {
            ctx.fillStyle = 'rgba(108,99,255,0.08)';
            ctx.fill();
          }
        }

        // ── Big centered label for the 4 corner zone images ──────────────────
        if (z.id !== 'work_area') {
          // Emoji on its own line, large
          const parts = z.label.split(' ');
          const emoji = parts[0];
          const name  = parts.slice(1).join(' ');

          // Semi-transparent pill at the bottom of the zone image
          const pillY = z.y + z.h - 44;
          ctx.fillStyle = 'rgba(0,0,0,0.52)';
          ctx.beginPath();
          ctx.roundRect(z.x + 12, pillY, z.w - 24, 38, 10);
          ctx.fill();

          // Emoji
          ctx.font = '20px serif';
          ctx.textAlign = 'center';
          ctx.fillText(emoji, cx - 36, pillY + 25);

          // Zone name — bold, white
          ctx.font = 'bold 15px "Segoe UI", sans-serif';
          ctx.fillStyle = '#fff';
          ctx.fillText(name, cx + 10, pillY + 25);
        }

        // ── Occupant list for meeting room ────────────────────────────────────
        if (isMeeting && hasOccupants) {
          ctx.font = 'bold 12px "Segoe UI", sans-serif';
          ctx.textAlign = 'center';
          ctx.fillStyle = 'rgba(200,190,255,0.9)';
          ctx.fillText(occupants.join(' · '), cx, z.y + z.h - 50);
        }
      });
    }

    function drawOffice(w, h) {
      // ── Floor ──────────────────────────────────────────────────────────────
      ctx.fillStyle = '#1a1a2e';
      ctx.fillRect(0, 0, w, h);

      // Subtle tile grid
      ctx.strokeStyle = 'rgba(255,255,255,0.03)';
      ctx.lineWidth = 1;
      for (let gx = 0; gx < w; gx += 48) { ctx.beginPath(); ctx.moveTo(gx,0); ctx.lineTo(gx,h); ctx.stroke(); }
      for (let gy = 0; gy < h; gy += 48) { ctx.beginPath(); ctx.moveTo(0,gy); ctx.lineTo(w,gy); ctx.stroke(); }

      // ── Zone images (corners) ───────────────────────────────────────────────
      ZONE_IMAGES.forEach(({ id, x, y }) => {
        const img = zoneImagesRef.current[id];
        if (img) {
          ctx.drawImage(img, x, y, ZONE_W, ZONE_H);
        } else {
          // placeholder box while image loads
          ctx.fillStyle = 'rgba(255,255,255,0.05)';
          ctx.fillRect(x, y, ZONE_W, ZONE_H);
        }
      });

      // ── Desk sprites (centre work area) ────────────────────────────────────
      DESK_POSITIONS.forEach(({ id, x, y, label }) => {
        const img = deskImagesRef.current[id];
        if (img) {
          ctx.drawImage(img, x, y, DESK_W, DESK_H);
        } else {
          ctx.fillStyle = '#6B4C2A';
          ctx.fillRect(x, y, DESK_W, DESK_H);
        }
        // Desk label below sprite
        ctx.font = '11px "Segoe UI", sans-serif';
        ctx.textAlign = 'center';
        ctx.fillStyle = 'rgba(255,255,255,0.3)';
        ctx.fillText(label, x + DESK_W / 2, y + DESK_H + 12);
      });
    }

    function tick(now) {
      const self = selfRef.current;
      const { width, height } = mapConfigRef.current;

      // Resize canvas to map dimensions
      if (canvas.width !== width) canvas.width = width;
      if (canvas.height !== height) canvas.height = height;

      // ── Movement ──
      if (self) {
        const keys = keysRef.current;
        let dx = 0; let dy = 0;

        // Walk-over auto-move toward wave target
        if (walkTarget) {
          const ddx = walkTarget.x - self.x;
          const ddy = walkTarget.y - self.y;
          const dist = Math.sqrt(ddx * ddx + ddy * ddy);
          if (dist > 4) {
            dx = (ddx / dist) * SPEED;
            dy = (ddy / dist) * SPEED;
          } else {
            setWalkTarget(null);
          }
        } else {
          if (keys['w'] || keys['ArrowUp'])    dy -= SPEED;
          if (keys['s'] || keys['ArrowDown'])  dy += SPEED;
          if (keys['a'] || keys['ArrowLeft'])  dx -= SPEED;
          if (keys['d'] || keys['ArrowRight']) dx += SPEED;
          // Normalize diagonal
          if (dx !== 0 && dy !== 0) { dx *= 0.707; dy *= 0.707; }
        }

        if (dx !== 0 || dy !== 0) {
          self.x = Math.max(AVATAR_RADIUS, Math.min(width - AVATAR_RADIUS, self.x + dx));
          self.y = Math.max(AVATAR_RADIUS, Math.min(height - AVATAR_RADIUS, self.y + dy));
          audio.playFootstep();

          // Update in players map too
          const sp = playersRef.current[self.id];
          if (sp) { sp.x = self.x; sp.y = self.y; sp.renderX = self.x; sp.renderY = self.y; }

          // Throttled emit
          if (now - lastEmitTime > EMIT_INTERVAL) {
            move(self.x, self.y);
            lastEmitTime = now;
          }
        }

        // ── Zone detection ──
        const newZone = getZoneAt(self.x, self.y);
        const prevZone = currentZoneRef.current;
        if (newZone?.id !== prevZone?.id) {
          if (prevZone) leaveZone(prevZone);
          if (newZone) enterZone(newZone);
          currentZoneRef.current = newZone || null;
          // Update self status label
          const sp = playersRef.current[self.id];
          if (sp) sp.status = newZone ? newZone.label : (self.status || '');
        }
      }

      // ── Interpolate remote players ──
      Object.values(playersRef.current).forEach((p) => {
        if (self && p.id === self.id) return;
        p.renderX += (p.x - p.renderX) * LERP;
        p.renderY += (p.y - p.renderY) * LERP;
      });

      // ── Draw ──
      ctx.clearRect(0, 0, width, height);

      if (mapLoadedRef.current && mapImgRef.current) {
        ctx.drawImage(mapImgRef.current, 0, 0, width, height);
      }
      drawOffice(width, height);

      drawZones();

      // Draw all remote players first, self on top
      const selfId = self?.id;
      Object.values(playersRef.current).forEach((p) => {
        if (p.id !== selfId) drawPlayer(p, false);
      });
      if (self && playersRef.current[selfId]) {
        drawPlayer(playersRef.current[selfId] || self, true);
      }

      // ── Debug overlay ──
      const playerCount = Object.keys(playersRef.current).length;
      const isConnected = socket.connected;
      ctx.fillStyle = 'rgba(0,0,0,0.7)';
      ctx.fillRect(width - 220, 8, 212, 52);
      ctx.font = '12px monospace';
      ctx.textAlign = 'left';
      ctx.fillStyle = isConnected ? '#4fffb0' : '#ff6b6b';
      ctx.fillText(`🔌 Socket: ${isConnected ? 'connected' : 'DISCONNECTED'}`, width - 212, 28);
      ctx.fillStyle = playerCount > 1 ? '#4fffb0' : '#ff6b6b';
      ctx.fillText(`👥 Players in room: ${playerCount}`, width - 212, 50);

      rafId = requestAnimationFrame(tick);
    }

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [move, walkTarget, enterZone, leaveZone]);

  return (
    <>
      <div style={styles.wrapper}>
        <canvas
          ref={canvasRef}
          style={styles.canvas}
          onMouseMove={handleMouseMove}
          onClick={handleClick}
        />
      </div>

      <StatusBar
        playerName={playerName}
        currentStatus={status}
        onStatusChange={handleStatusChange}
        currentBubble={bubble}
        onOpenBubble={() => setShowBubbleInput(true)}
        currentNow={nowText}
        onOpenNow={() => setShowNowInput(true)}
        onOpenDashboard={() => { setShowDashboard(p => !p); syncPlayers(); }}
      />

      <WaveNotification
        notifications={waveNotifs}
        onWalkOver={handleWalkOver}
        onDismiss={handleDismissNotif}
      />

      <RoomNotification
        notifications={roomNotifs}
        onDismiss={(id) => setRoomNotifs((prev) => prev.filter((n) => n.id !== id))}
      />

      {showDashboard && (
        <TeamDashboard
          players={playersState}
          selfId={selfRef.current?.id}
          onClose={() => setShowDashboard(false)}
        />
      )}

      {showNowInput && (
        <NowInput
          currentNow={nowText}
          onSubmit={(text) => {
            setNowText(text);
            emitNow(text);
            const self = selfRef.current;
            if (self && playersRef.current[self.id]) {
              playersRef.current[self.id].now = text;
            }
          }}
          onClose={() => setShowNowInput(false)}
        />
      )}

      {showBubbleInput && (
        <BubbleInput
          currentBubble={bubble}
          onSubmit={(text) => {
            setBubbleText(text);
            emitBubble(text);
            // Update own player in ref
            const self = selfRef.current;
            if (self && playersRef.current[self.id]) {
              playersRef.current[self.id].bubble = text;
            }
          }}
          onClose={() => setShowBubbleInput(false)}
        />
      )}
    </>
  );
}

const styles = {
  wrapper: {
    position: 'fixed', inset: 0,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    background: '#0d0d1a',
    paddingBottom: 52, // room for status bar
  },
  canvas: {
    maxWidth: '100%',
    maxHeight: '100%',
    imageRendering: 'pixelated',
    borderRadius: 8,
    boxShadow: '0 0 80px rgba(108,99,255,0.15)',
  },
};
