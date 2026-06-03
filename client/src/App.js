import { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import LoginScreen from './components/LoginScreen';
import GameCanvas from './components/GameCanvas';

const SERVER_URL = process.env.REACT_APP_SERVER_URL || 'http://localhost:4000';

export default function App() {
  const [session, setSession] = useState(null);
  const [loginError, setLoginError] = useState('');
  const socketRef = useRef(null);
  // Store credentials so we can re-join on reconnect
  const credsRef = useRef(null);

  const handleJoin = (name, avatar, password) => {
    if (socketRef.current) socketRef.current.disconnect();
    setLoginError('');

    const socket = io(SERVER_URL, {
      transports: ['websocket'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: Infinity,
    });
    socketRef.current = socket;
    credsRef.current = { name, avatar, password };

    // fires on EVERY connect / reconnect — always re-join
    socket.on('connect', () => {
      const c = credsRef.current;
      socket.emit('player:join', { name: c.name, avatar: c.avatar, password: c.password });
    });

    // Only the FIRST init transitions us from login → game
    socket.once('init', (initData) => {
      setSession({ name, avatar, password, socket, initData });
    });

    socket.on('join:rejected', ({ reason }) => {
      setLoginError(reason);
      socket.disconnect();
    });

    socket.on('connect_error', () => {
      setLoginError('Cannot reach server. Is it running?');
    });
  };

  // Only disconnect when the tab actually closes — not on session change
  useEffect(() => {
    return () => { socketRef.current?.disconnect(); };
  }, []);

  if (!session) {
    return <LoginScreen onJoin={handleJoin} error={loginError} />;
  }

  return (
    <GameCanvas
      playerName={session.name}
      avatarId={session.avatar}
      password={session.password}
      socket={session.socket}
      initData={session.initData}
    />
  );
}
