require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const ROOM_PASSWORD = process.env.ROOM_PASSWORD;
if (!ROOM_PASSWORD) {
  console.error('ERROR: ROOM_PASSWORD is not set in .env — refusing to start.');
  process.exit(1);
}

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    methods: ['GET', 'POST'],
  },
});

// players[socketId] = { id, name, avatar, x, y, status, zoneId }
const players = {};

// zoneOccupants[zoneId] = Set of socketIds
const zoneOccupants = {};

// Map config sent to new joiners
const MAP_CONFIG = {
  width: 1280,
  height: 720,
  spawnX: 560,
  spawnY: 390,
};

function clamp(val, min, max) {
  return Math.min(Math.max(val, min), max);
}

function getOccupantNames(zoneId) {
  const ids = zoneOccupants[zoneId];
  if (!ids) return [];
  return [...ids].map(id => players[id]?.name).filter(Boolean);
}

io.on('connection', (socket) => {
  console.log(`[connect] ${socket.id}`);

  // ── JOIN ─────────────────────────────────────────────────────────────────
  socket.on('player:join', ({ name, avatar, password }) => {
    if (!name || !avatar) return;

    if (password !== ROOM_PASSWORD) {
      socket.emit('join:rejected', { reason: 'Wrong password.' });
      socket.disconnect(true);
      console.log(`[rejected] ${socket.id} — bad password`);
      return;
    }

    if (Object.keys(players).length >= 10) {
      socket.emit('join:rejected', { reason: 'Office is full.' });
      socket.disconnect(true);
      return;
    }

    players[socket.id] = {
      id: socket.id,
      name: name.slice(0, 24),
      avatar,
      x: MAP_CONFIG.spawnX + Math.random() * 80,
      y: MAP_CONFIG.spawnY + Math.random() * 80,
      status: '',
      bubble: '',
      now: '',
    };

    // Send this player the full current state
    socket.emit('init', {
      mapConfig: MAP_CONFIG,
      self: socket.id,
      players: Object.values(players),
    });

    // Tell everyone else about the new player
    socket.broadcast.emit('player:joined', players[socket.id]);
    console.log(`[join] ${name} (${avatar}) ${socket.id}`);
  });

  // ── RESYNC (in case init fired before GameCanvas mounted) ────────────────
  socket.on('player:request_state', () => {
    if (!players[socket.id]) return;
    socket.emit('init', {
      mapConfig: MAP_CONFIG,
      self: socket.id,
      players: Object.values(players),
    });
  });

  // ── MOVE ─────────────────────────────────────────────────────────────────
  socket.on('player:move', ({ x, y }) => {
    const player = players[socket.id];
    if (!player) return;

    // Clamp to map bounds (avatar is ~32px wide/tall)
    const AVATAR_HALF = 16;
    player.x = clamp(x, AVATAR_HALF, MAP_CONFIG.width - AVATAR_HALF);
    player.y = clamp(y, AVATAR_HALF, MAP_CONFIG.height - AVATAR_HALF);

    io.emit('player:moved', { id: socket.id, x: player.x, y: player.y });
  });

  // ── STATUS ───────────────────────────────────────────────────────────────
  socket.on('player:status', ({ status }) => {
    const player = players[socket.id];
    if (!player) return;
    player.status = (status || '').slice(0, 32);
    io.emit('player:statusChanged', { id: socket.id, status: player.status });
  });

  // ── ZONE ENTER / LEAVE ───────────────────────────────────────────────────
  socket.on('player:enter_zone', ({ zoneId, zoneLabel, zoneType }) => {
    const player = players[socket.id];
    if (!player) return;

    // Leave previous zone first
    if (player.zoneId && player.zoneId !== zoneId) {
      const prev = zoneOccupants[player.zoneId];
      if (prev) prev.delete(socket.id);
      io.emit('zone:updated', {
        zoneId: player.zoneId,
        occupants: getOccupantNames(player.zoneId),
      });
    }

    player.zoneId = zoneId;
    if (!zoneOccupants[zoneId]) zoneOccupants[zoneId] = new Set();
    zoneOccupants[zoneId].add(socket.id);

    const occupants = getOccupantNames(zoneId);
    io.emit('zone:updated', { zoneId, occupants });

    // Only broadcast entry notification for meeting rooms
    if (zoneType === 'meeting') {
      socket.broadcast.emit('zone:entered', {
        playerName: player.name,
        zoneLabel,
        occupants,
      });
      console.log(`[zone] ${player.name} → ${zoneLabel}`);
    }
  });

  socket.on('player:leave_zone', ({ zoneId, zoneType, zoneLabel }) => {
    const player = players[socket.id];
    if (!player) return;

    player.zoneId = null;
    const occ = zoneOccupants[zoneId];
    if (occ) occ.delete(socket.id);

    const occupants = getOccupantNames(zoneId);
    io.emit('zone:updated', { zoneId, occupants });

    if (zoneType === 'meeting') {
      socket.broadcast.emit('zone:left', {
        playerName: player.name,
        zoneLabel,
        occupants,
      });
    }
  });

  // ── NOW (what I'm working on) ─────────────────────────────────────────────
  socket.on('player:now', ({ now }) => {
    const player = players[socket.id];
    if (!player) return;
    player.now = (now || '').slice(0, 120);
    io.emit('player:nowChanged', { id: socket.id, now: player.now });
  });

  // ── SPEECH BUBBLE ────────────────────────────────────────────────────────
  socket.on('player:bubble', ({ bubble }) => {
    const player = players[socket.id];
    if (!player) return;
    player.bubble = (bubble || '').slice(0, 120);
    io.emit('player:bubbleChanged', { id: socket.id, bubble: player.bubble });
  });

  // ── WAVE ─────────────────────────────────────────────────────────────────
  socket.on('player:wave', ({ targetId }) => {
    const sender = players[socket.id];
    const target = players[targetId];
    if (!sender || !target) return;

    // Notify the target only
    io.to(targetId).emit('player:waved', {
      fromId: socket.id,
      fromName: sender.name,
      fromX: sender.x,
      fromY: sender.y,
    });
    console.log(`[wave] ${sender.name} → ${target.name}`);
  });

  // ── DISCONNECT ───────────────────────────────────────────────────────────
  socket.on('disconnect', (reason) => {
    console.log(`[disconnect] ${socket.id} — reason: ${reason}`);
    const player = players[socket.id];
    if (player) {
      // Clean up zone occupancy
      if (player.zoneId && zoneOccupants[player.zoneId]) {
        zoneOccupants[player.zoneId].delete(socket.id);
        io.emit('zone:updated', {
          zoneId: player.zoneId,
          occupants: getOccupantNames(player.zoneId),
        });
      }
      console.log(`[disconnect] ${player.name} (${socket.id})`);
      delete players[socket.id];
      io.emit('player:left', { id: socket.id });
    }
  });
});

// Health check
app.get('/health', (_, res) => res.json({ status: 'ok', players: Object.keys(players).length }));

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => console.log(`Zagdim server listening on :${PORT}`));
