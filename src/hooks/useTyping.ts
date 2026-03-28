import { useState, useEffect, useCallback, useRef } from 'react';
import { getPassage, Mode, Difficulty, TimerDuration } from '../data/snippets';

export type CharState = 'pending' | 'correct' | 'incorrect' | 'current';

export interface ChartDataPoint {
  time: number;
  wpm: number;
  raw: number;
  accuracy: number;
}

export interface TypingStats {
  wpm: number;
  accuracy: number;
  correct: number;
  incorrect: number;
  totalTyped: number;
  history: ChartDataPoint[];
}

export interface UseTypingReturn {
  passage: string;
  charStates: CharState[];
  currentIndex: number;
  stats: TypingStats;
  timeLeft: number;
  isStarted: boolean;
  isFinished: boolean;
  activeKeys: Set<string>;
  pressedKey: string;
  resetTest: () => void;
  /** Inject a character programmatically (mouse click on virtual keyboard) */
  injectChar: (char: string) => void;
  setExternalPassage: (passage: string) => void;
  forceStart: () => void;
}

export function useTyping(
  mode: Mode,
  difficulty: Difficulty,
  duration: TimerDuration | null,
  onKeyPress?: () => void,   // callback to trigger sound
  isDisabled?: boolean
): UseTypingReturn {

  // ── State ────────────────────────────────────────────────────────────────
  const [passage, setPassage] = useState<string>(() => getPassage(mode, difficulty));
  const [charStates, setCharStates] = useState<CharState[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [stats, setStats] = useState<TypingStats>({
    wpm: 0, accuracy: 100, correct: 0, incorrect: 0, totalTyped: 0, history: [],
  });
  const totalDuration = duration ?? 0;
  const [timeLeft, setTimeLeft] = useState(totalDuration);
  const [isStarted, setIsStarted] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [activeKeys, setActiveKeys] = useState<Set<string>>(new Set());
  const [pressedKey, setPressedKey] = useState('');

  // Stable refs
  const timeLeftRef = useRef(totalDuration);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const correctRef = useRef(0);
  const incorrectRef = useRef(0);
  const totalTypedRef = useRef(0);
  const isFinishedRef = useRef(false);
  const isStartedRef = useRef(false);
  const currentIndexRef = useRef(0);
  const passageRef = useRef(passage);

  // ── Sync passage ref ─────────────────────────────────────────────────────
  useEffect(() => { passageRef.current = passage; }, [passage]);

  // ── Initialise char states ───────────────────────────────────────────────
  useEffect(() => {
    const states: CharState[] = passage.split('').map((_, i) =>
      i === 0 ? 'current' : 'pending'
    );
    setCharStates(states);
    setCurrentIndex(0);
    currentIndexRef.current = 0;
    correctRef.current = 0;
    incorrectRef.current = 0;
    totalTypedRef.current = 0;
    historyRef.current = [];
    setStats({ wpm: 0, accuracy: 100, correct: 0, incorrect: 0, totalTyped: 0, history: [] });
  }, [passage]);

  const setExternalPassage = useCallback((newPassage: string) => {
    if (newPassage) setPassage(newPassage);
  }, []);

  const historyRef = useRef<ChartDataPoint[]>([]);

  const computeWpm = useCallback(() => {
    const elapsed = (totalDuration - timeLeftRef.current) / 60;
    if (elapsed <= 0) return 0;
    return Math.round((correctRef.current / 5) / elapsed);
  }, [totalDuration]);

  const computeRaw = useCallback(() => {
    const elapsed = (totalDuration - timeLeftRef.current) / 60;
    if (elapsed <= 0) return 0;
    return Math.round((totalTypedRef.current / 5) / elapsed);
  }, [totalDuration]);

  // ── Timer ────────────────────────────────────────────────────────────────
  const startTimer = useCallback(() => {
    if (intervalRef.current) return;
    intervalRef.current = setInterval(() => {
      timeLeftRef.current -= 1;

      // Save history point every second
      const timeElapsedSec = totalDuration - timeLeftRef.current;
      if (timeElapsedSec > 0) {
        historyRef.current.push({
          time: timeElapsedSec,
          wpm: computeWpm(),
          raw: computeRaw(),
          accuracy: totalTypedRef.current > 0 ? Math.round((correctRef.current / totalTypedRef.current) * 100) : 100
        });
      }

      if (timeLeftRef.current <= 0) {
        timeLeftRef.current = 0;
        clearInterval(intervalRef.current!);
        intervalRef.current = null;
        setTimeLeft(0);
        setIsFinished(true);
        isFinishedRef.current = true;
      } else {
        setTimeLeft(timeLeftRef.current);
      }

      // Force update stats so line chart gets the updated history right away when finished
      setStats(prev => ({ ...prev, history: [...historyRef.current] }));
    }, 1000);
  }, [totalDuration, computeWpm, computeRaw]);

  // Force start from external (e.g. multiplayer match start)
  const forceStart = useCallback(() => {
    if (isFinishedRef.current || !totalDuration) return;
    if (!isStartedRef.current) {
      isStartedRef.current = true;
      setIsStarted(true);
      startTimer();
    }
  }, [startTimer]);

  // ── Core: process one character input ────────────────────────────────────
  const processChar = useCallback((char: string) => {
    if (isFinishedRef.current || isDisabled || !totalDuration) return;

    // Start timer on first key if not started yet and not multiplayer
    if (!isStartedRef.current) {
      isStartedRef.current = true;
      setIsStarted(true);
      startTimer();
    }

    // Trigger sound
    onKeyPress?.();

    // Fire animation
    setPressedKey(char);
    setTimeout(() => setPressedKey(''), 150);

    const idx = currentIndexRef.current;
    const expected = passageRef.current[idx];
    const isCorrect = char === expected;

    totalTypedRef.current += 1;
    if (isCorrect) correctRef.current += 1;
    else incorrectRef.current += 1;

    setCharStates(prev => {
      const next = [...prev];
      next[idx] = isCorrect ? 'correct' : 'incorrect';
      if (idx + 1 < next.length) next[idx + 1] = 'current';
      return next;
    });

    const newIdx = idx + 1;
    currentIndexRef.current = newIdx;
    setCurrentIndex(newIdx);

    // Update live stats
    const wpm = computeWpm();
    const accuracy = totalTypedRef.current > 0
      ? Math.round((correctRef.current / totalTypedRef.current) * 100)
      : 100;

    // Always keep latest history from the ref so it's not discarded
    setStats({
      wpm,
      accuracy,
      correct: correctRef.current,
      incorrect: incorrectRef.current,
      totalTyped: totalTypedRef.current,
      history: [...historyRef.current]
    });

    // Check passage completion
    if (newIdx >= passageRef.current.length) {
      setIsFinished(true);
      isFinishedRef.current = true;
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }
  }, [startTimer, computeWpm, onKeyPress, isDisabled, totalDuration]);

  // ── Backspace handler ────────────────────────────────────────────────────
  const processBackspace = useCallback(() => {
    if (isFinishedRef.current || isDisabled || !totalDuration) return;
    const idx = currentIndexRef.current;
    if (idx === 0) return;

    onKeyPress?.();
    setPressedKey('Backspace');
    setTimeout(() => setPressedKey(''), 150);

    const newIdx = idx - 1;
    currentIndexRef.current = newIdx;
    setCurrentIndex(newIdx);
    setCharStates(prev => {
      const next = [...prev];
      next[idx] = 'pending';
      next[newIdx] = 'current';
      return next;
    });
  }, [onKeyPress, isDisabled, totalDuration]);

  // ── Physical keyboard listener ───────────────────────────────────────────
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isFinishedRef.current || isDisabled) return;
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      if (e.key.startsWith('F') && e.key.length > 1) return;
      if (['Escape', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Tab'].includes(e.key)) {
        e.preventDefault();
        return;
      }

      // Track held keys for virtual keyboard UI
      setActiveKeys(prev => new Set([...prev, e.key]));

      if (e.key === 'Backspace') {
        e.preventDefault();
        processBackspace();
        return;
      }
      if (e.key.length !== 1) return;

      processChar(e.key);
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      setActiveKeys(prev => {
        const next = new Set(prev);
        next.delete(e.key);
        return next;
      });
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [processChar, processBackspace]);

  // ── Mouse / virtual keyboard injection ──────────────────────────────────
  const injectChar = useCallback((char: string) => {
    if (char === 'Backspace') {
      processBackspace();
      return;
    }
    if (char.length === 1) {
      processChar(char);
    }
  }, [processChar, processBackspace]);

  // ── Reset ────────────────────────────────────────────────────────────────
  const resetTest = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    const dur = duration ?? 0;
    timeLeftRef.current = dur;
    correctRef.current = 0;
    incorrectRef.current = 0;
    totalTypedRef.current = 0;
    currentIndexRef.current = 0;
    isFinishedRef.current = false;
    isStartedRef.current = false;
    historyRef.current = [];
    setTimeLeft(dur);
    setIsStarted(false);
    setIsFinished(false);
    setActiveKeys(new Set());
    setPressedKey('');
    setStats({ wpm: 0, accuracy: 100, correct: 0, incorrect: 0, totalTyped: 0, history: [] });
    setPassage(getPassage(mode, difficulty));
  }, [mode, difficulty, duration]);

  // Reset when mode/difficulty changes from outside
  useEffect(() => {
    resetTest();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, difficulty, duration]);

  return {
    passage,
    charStates,
    currentIndex,
    stats,
    timeLeft,
    isStarted,
    isFinished,
    activeKeys,
    pressedKey,
    resetTest,
    injectChar,
    setExternalPassage,
    forceStart,
  };
}
