import { useEffect, useRef, useCallback } from 'react';

export function useSocket(socket, {
  onInit, onPlayerJoined, onPlayerMoved, onPlayerLeft,
  onPlayerStatusChanged, onPlayerWaved,
  onZoneUpdated, onZoneEntered, onZoneLeft,
  onPlayerBubbleChanged,
}) {
  const socketRef = useRef(socket);

  useEffect(() => {
    const s = socketRef.current;
    s.on('init', onInit);
    s.on('player:joined', onPlayerJoined);
    s.on('player:moved', onPlayerMoved);
    s.on('player:left', onPlayerLeft);
    s.on('player:statusChanged', onPlayerStatusChanged);
    s.on('player:waved', onPlayerWaved);
    s.on('zone:updated', onZoneUpdated);
    s.on('zone:entered', onZoneEntered);
    s.on('zone:left', onZoneLeft);
    s.on('player:bubbleChanged', onPlayerBubbleChanged);

    return () => {
      s.off('init', onInit);
      s.off('player:joined', onPlayerJoined);
      s.off('player:moved', onPlayerMoved);
      s.off('player:left', onPlayerLeft);
      s.off('player:statusChanged', onPlayerStatusChanged);
      s.off('player:waved', onPlayerWaved);
      s.off('zone:updated', onZoneUpdated);
      s.off('zone:entered', onZoneEntered);
      s.off('zone:left', onZoneLeft);
      s.off('player:bubbleChanged', onPlayerBubbleChanged);
      // Socket lifecycle is managed by App.js — do not disconnect here
    };
  }, []);

  const move       = useCallback((x, y)       => socketRef.current.emit('player:move', { x, y }), []);
  const setStatus  = useCallback((status)      => socketRef.current.emit('player:status', { status }), []);
  const wave       = useCallback((targetId)    => socketRef.current.emit('player:wave', { targetId }), []);
  const enterZone  = useCallback((zone)        => socketRef.current.emit('player:enter_zone', { zoneId: zone.id, zoneLabel: zone.label, zoneType: zone.type }), []);
  const leaveZone  = useCallback((zone)        => socketRef.current.emit('player:leave_zone', { zoneId: zone.id, zoneLabel: zone.label, zoneType: zone.type }), []);
  const setBubble  = useCallback((bubble)      => socketRef.current.emit('player:bubble', { bubble }), []);

  return { move, setStatus, wave, enterZone, leaveZone, setBubble };
}
