/**
 * Text corpus for both Normal and Coding practice modes,
 * each split across 3 difficulty levels.
 *
 * Difficulty criteria:
 *  Easy   → short words / simple sentences / basic keywords
 *  Medium → mixed vocabulary / moderate code
 *  Hard   → complex expressions / symbols / nested structures
 */

export type Difficulty = 'easy' | 'medium' | 'hard';
export type Mode = 'normal' | 'coding';
export const TIMER_OPTIONS = [30, 60, 90] as const;
export type TimerDuration = (typeof TIMER_OPTIONS)[number];

// ── Normal mode text pools ──────────────────────────────────────────────────

const normalEasy: string[] = [
  'the quick brown fox jumps over the lazy dog',
  'pack my box with five dozen liquor jugs',
  'how vexingly quick daft zebras jump',
  'the five boxing wizards jump quickly',
  'sphinx of black quartz judge my vow',
  'we promptly judged antique ivory buckles',
  'a mad boxer shot a quick gloved jab',
  'fix problem quickly with galvanized jets',
  'the job requires extra pluck and zeal',
  'a wizard quickly jinxed the gnomes',
];

const normalMedium: string[] = [
  'programming is the art of telling another human what one wants the computer to do',
  'any sufficiently advanced technology is indistinguishable from magic',
  'simplicity is the soul of efficiency in software engineering',
  'the best code is the code you never have to write in the first place',
  'debugging is twice as hard as writing the code in the first place',
  'first solve the problem then write the code to handle every edge case',
  'good software like wine takes time patience and attention to detail',
  'premature optimization is the root of all evil in software development',
  'make it work make it right make it fast in that exact order always',
  'code is read much more often than it is written so write clearly',
];

const normalHard: string[] = [
  'agile methodologies emphasize iterative development, cross-functional collaboration, and continuous delivery of high-quality software.',
  'the CAP theorem states that distributed systems can only guarantee two of three properties: consistency, availability, and partition tolerance.',
  'microservices architecture decomposes applications into loosely coupled, independently deployable services communicating via well-defined APIs.',
  'dynamic programming solves complex problems by breaking them into overlapping sub-problems and storing intermediate results for reuse.',
  'cryptographic hash functions are deterministic, one-way transformations producing fixed-size digests; collisions are computationally infeasible.',
  'memoization caches function return values; subsequent calls with identical arguments bypass recomputation, dramatically reducing time complexity.',
  'garbage collection algorithms—mark-and-sweep, reference counting, generational—automatically reclaim memory occupied by unreachable objects.',
  'race conditions arise when concurrent threads access shared state without synchronization, yielding nondeterministic, unpredictable behaviour.',
  'the observer pattern defines one-to-many dependencies so that when one object changes state, all dependents are notified automatically.',
  'kubernetes orchestrates containerised workloads across clusters, handling scheduling, scaling, self-healing, and rolling deployments seamlessly.',
];

// ── Coding mode text pools ──────────────────────────────────────────────────

const codingEasy: string[] = [
  'const name = "KeyroX"; console.log(name);',
  'let x = 10; let y = 20; console.log(x + y);',
  'function greet(name) { return "Hello " + name; }',
  'const arr = [1, 2, 3, 4, 5]; arr.forEach(n => console.log(n));',
  'if (age >= 18) { console.log("adult"); } else { console.log("minor"); }',
  'for (let i = 0; i < 10; i++) { console.log(i); }',
  'const obj = { name: "Alice", age: 30, role: "dev" };',
  'import React from "react"; export default function App() { return null; }',
  'const sum = (a, b) => a + b; console.log(sum(3, 4));',
  'document.getElementById("app").style.display = "flex";',
];

const codingMedium: string[] = [
  'const fetchUser = async (id) => { const res = await fetch(`/api/users/${id}`); return res.json(); };',
  'const [state, setState] = useState({ loading: false, data: null, error: null });',
  'useEffect(() => { fetchData().then(setData).catch(setError); return () => controller.abort(); }, [id]);',
  'const memoized = useMemo(() => items.filter(i => i.active).sort((a, b) => a.name.localeCompare(b.name)), [items]);',
  'export const reducer = (state = initialState, action) => { switch (action.type) { default: return state; } };',
  'const router = createBrowserRouter([{ path: "/", element: <Home /> }, { path: "/about", element: <About /> }]);',
  'type ApiResponse<T> = { data: T; status: number; message: string; timestamp: string; };',
  'interface Repository<T> { findById(id: string): Promise<T>; save(entity: T): Promise<void>; delete(id: string): Promise<void>; }',
  'SELECT u.name, COUNT(o.id) AS orders FROM users u LEFT JOIN orders o ON u.id = o.user_id GROUP BY u.id;',
  'const throttle = (fn, limit) => { let last = 0; return (...args) => { if (Date.now() - last >= limit) { last = Date.now(); fn(...args); } }; };',
];

const codingHard: string[] = [
  'const createStore = <S, A>(reducer: Reducer<S, A>, middleware: Middleware[]): Store<S, A> => { let state: S; const listeners: Listener[] = []; };',
  'type DeepPartial<T> = T extends object ? { [P in keyof T]?: DeepPartial<T[P]> } : T; function mergeDeep<T>(target: T, source: DeepPartial<T>): T { return { ...target, ...source }; }',
  'const compose = (...fns: Function[]) => (x: unknown) => fns.reduceRight((acc, fn) => fn(acc), x); const pipe = (...fns: Function[]) => (x: unknown) => fns.reduce((acc, fn) => fn(acc), x);',
  'class EventEmitter<Events extends Record<string, unknown[]>> { private listeners = new Map<keyof Events, Set<Function>>(); on<K extends keyof Events>(event: K, listener: (...args: Events[K]) => void): this { } }',
  'SELECT p.*, ROW_NUMBER() OVER (PARTITION BY p.category_id ORDER BY p.created_at DESC) AS rn FROM products p WHERE rn <= 5 AND p.active = true;',
  'const useDebounce = <T>(value: T, delay: number): T => { const [debounced, setDebounced] = useState<T>(value); useEffect(() => { const id = setTimeout(() => setDebounced(value), delay); return () => clearTimeout(id); }, [value, delay]); return debounced; };',
  'function* fibonacci(): Generator<number, void, unknown> { let [a, b] = [0, 1]; while (true) { yield a; [a, b] = [b, a + b]; } } const fib = fibonacci(); Array.from({ length: 10 }, () => fib.next().value);',
  'const proxy = new Proxy(target, { get(obj, prop) { return prop in obj ? obj[prop] : new Proxy({}, handler); }, set(obj, prop, value) { obj[prop] = value; notify(prop, value); return true; } });',
  'git rebase --interactive HEAD~5 && git push --force-with-lease origin feature/refactor-auth-module',
  'docker build --build-arg NODE_ENV=production --no-cache -t myapp:latest . && docker run -p 3000:3000 --env-file .env myapp:latest',
];

// ── Public API ──────────────────────────────────────────────────────────────

const corpus: Record<Mode, Record<Difficulty, string[]>> = {
  normal: { easy: normalEasy, medium: normalMedium, hard: normalHard },
  coding: { easy: codingEasy, medium: codingMedium, hard: codingHard },
};

export function getPassage(mode: Mode, difficulty: Difficulty, count = 3): string {
  const pool = corpus[mode][difficulty];
  const shuffled = [...pool].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count).join('  ');
}
