import { useState, useEffect, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';

export type MultiplayerStatus = 'idle' | 'searching' | 'found' | 'playing' | 'finished';
export type MatchOutcome = 'win' | 'loss' | 'disconnect';

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

  useEffect(() => {
    const newSocket = io('http://localhost:3001', { autoConnect: false });
    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, []);

  const clearMatchState = useCallback((nextStatus: MultiplayerStatus = 'idle') => {
    setStatus(nextStatus);
    setOpponent(null);
    setPassage('');
  }, []);

  const showResultModal = useCallback((outcome: MatchOutcome) => {
    setResultModal({
      outcome,
      title:
        outcome === 'win'
          ? 'You Won'
          : outcome === 'loss'
            ? 'You Lost'
            : 'Opponent Disconnected',
      message:
        outcome === 'win'
          ? 'You finished before your opponent.'
          : outcome === 'loss'
            ? 'Your opponent finished first this round.'
            : 'The other player left the match. You can start a new race anytime.',
    });
  }, []);

  const searchMatch = useCallback(() => {
    if (!socket) return;

    setResultModal(null);
    socket.connect();
    setStatus('searching');
    socket.emit('join_matchmaking');

    socket.off('match_found');
    socket.off('match_start');
    socket.off('player_progress');
    socket.off('opponent_finished');
    socket.off('match_result');
    socket.off('opponent_disconnected');

    socket.on('match_found', (data: { id: string; players: Opponent[]; passage: string }) => {
      setPassage(data.passage);
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
  }, [socket, clearMatchState, showResultModal]);

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

  const dismissResultModal = useCallback(() => {
    setResultModal(null);
  }, []);

  return {
    status,
    opponent,
    passage,
    resultModal,
    searchMatch,
    cancelSearch,
    sendProgress,
    finishMatch,
    dismissResultModal,
    socketId: socket?.id
  };
}
