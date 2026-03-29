import { useState, useEffect, useCallback, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { Mode } from '../data/snippets';

export type MultiplayerStatus = 'idle' | 'searching' | 'found' | 'playing' | 'finished';
export type MatchOutcome = 'win' | 'loss' | 'disconnect' | 'opponent_exit';
export type MatchPreference = Mode | 'any';

export interface Opponent {
  id: string;
  progress: number;
  wpm: number;
}

export interface MatchModalState {
  outcome: MatchOutcome;
  title: string;
  message: string;
}

export function useMultiplayer() {
  const [status, setStatus] = useState<MultiplayerStatus>('idle');
  const [socket, setSocket] = useState<Socket | null>(null);
  const [opponent, setOpponent] = useState<Opponent | null>(null);
  const [passage, setPassage] = useState<string>('');
  const [resultModal, setResultModal] = useState<MatchModalState | null>(null);
  const [matchPreference, setMatchPreference] = useState<MatchPreference>('any');
  const [matchMode, setMatchMode] = useState<Mode | null>(null);
  const [exitVersion, setExitVersion] = useState(0);
  const isLocalExitPendingRef = useRef(false);

  useEffect(() => {
    const socketUrl =
      import.meta.env.VITE_SOCKET_URL?.trim() ||
      (import.meta.env.DEV
        ? `${window.location.protocol}//${window.location.hostname}:3001`
        : window.location.origin);

    const newSocket = io(socketUrl, { autoConnect: false });
    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, []);

  const clearMatchState = useCallback((nextStatus: MultiplayerStatus = 'idle') => {
    setStatus(nextStatus);
    setOpponent(null);
    setPassage('');
    setMatchMode(null);
  }, []);

  const showResultModal = useCallback((outcome: MatchOutcome) => {
    setResultModal({
      outcome,
      title:
        outcome === 'win'
          ? 'You Won'
          : outcome === 'loss'
            ? 'You Lost'
            : outcome === 'opponent_exit'
              ? 'Opponent Exited Race'
              : 'Opponent Disconnected',
      message:
        outcome === 'win'
          ? 'You finished before your opponent.'
          : outcome === 'loss'
            ? 'Your opponent finished first this round.'
            : outcome === 'opponent_exit'
              ? 'Your opponent exited the race. The match has been ended and the timer was reset.'
              : 'The other player left the match. You can start a new race anytime.',
    });
  }, []);

  const searchMatch = useCallback(() => {
    if (!socket) return;

    isLocalExitPendingRef.current = false;
    setResultModal(null);
    socket.connect();
    setStatus('searching');
    socket.emit('join_matchmaking', { preference: matchPreference });

    socket.off('match_found');
    socket.off('match_start');
    socket.off('player_progress');
    socket.off('opponent_finished');
    socket.off('match_result');
    socket.off('opponent_disconnected');
    socket.off('race_exited');

    socket.on('match_found', (data: { id: string; players: Opponent[]; passage: string; mode: Mode }) => {
      setPassage(data.passage);
      setMatchMode(data.mode);
      const other = data.players.find(p => p.id !== socket.id);
      if (other) setOpponent(other);
      setStatus('found');
    });

    socket.on('match_start', () => {
      setStatus('playing');
    });

    socket.on('player_progress', (data: { id: string; progress: number; wpm: number }) => {
      setOpponent(prev => prev ? { ...prev, progress: data.progress, wpm: data.wpm } : prev);
    });

    socket.on('opponent_finished', () => {
      setOpponent(prev => prev ? { ...prev, progress: 1 } : prev);
      setStatus('finished');
      showResultModal('loss');
    });

    socket.on('match_result', (data: { outcome: 'win' | 'loss'; reason: string }) => {
      setStatus('finished');
      showResultModal(data.outcome);
    });

    socket.on('opponent_disconnected', () => {
      clearMatchState();
      showResultModal('disconnect');
      socket.disconnect();
    });

    socket.on('race_exited', (data: { reason: string; playerId: string }) => {
      clearMatchState();
      setExitVersion(prev => prev + 1);
      const isLocalExit = isLocalExitPendingRef.current || data.playerId === socket.id;
      isLocalExitPendingRef.current = false;

      if (!isLocalExit) {
        showResultModal('opponent_exit');
      } else {
        setResultModal(null);
      }
    });
  }, [socket, clearMatchState, showResultModal, matchPreference]);

  const sendProgress = useCallback((progress: number, wpm: number, accuracy: number, currentIndex: number) => {
    if (socket && status === 'playing') {
      socket.emit('progress', { progress, wpm, accuracy, currentIndex });
    }
  }, [socket, status]);

  const cancelSearch = useCallback(() => {
    if (!socket) return;
    socket.disconnect();
    clearMatchState();
  }, [socket, clearMatchState]);

  const finishMatch = useCallback(() => {
    if (!socket) return;
    socket.emit('match_finished');
    setStatus('finished');
    showResultModal('win');
  }, [socket, showResultModal]);

  const exitRace = useCallback(() => {
    if (!socket) return;
    isLocalExitPendingRef.current = true;
    socket.emit('exit_race');
    clearMatchState();
    setResultModal(null);
    setExitVersion(prev => prev + 1);
  }, [socket, clearMatchState]);

  const dismissResultModal = useCallback(() => {
    setResultModal(null);
  }, []);

  return {
    status,
    opponent,
    passage,
    resultModal,
    matchPreference,
    matchMode,
    setMatchPreference,
    searchMatch,
    cancelSearch,
    sendProgress,
    finishMatch,
    exitRace,
    dismissResultModal,
    socketId: socket?.id,
    exitVersion
  };
}
