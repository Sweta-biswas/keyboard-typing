import { Server } from "socket.io";
import { createServer } from "http";
import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

const app = express();
app.use(cors());

// Fix for __dirname in ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Serve frontend (React build)
app.use(express.static(path.join(__dirname, "../dist")));

const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

let waitingPlayers = [];
let rooms = new Map();
let roomCounter = 0;

const MATCH_MODES = {
  NORMAL: "normal",
  CODING: "coding",
  ANY: "any",
};

function cleanupRoom(roomId) {
  const roomData = rooms.get(roomId);
  if (!roomData) return;

  if (roomData.startTimeout) {
    clearTimeout(roomData.startTimeout);
  }

  roomData.players.forEach(player => {
    const playerSocket = io.sockets.sockets.get(player.id);
    if (playerSocket) {
      playerSocket.leave(roomId);
      playerSocket.data.roomId = undefined;
    }
  });

  rooms.delete(roomId);
}

const PASSAGES = {
  normal: [
    "the quick brown fox jumps over the lazy dog",
    "practice makes progress when you stay calm and keep typing",
    "good typing rhythm comes from accuracy before speed",
    "small steady improvements build strong muscle memory over time",
  ],
  coding: [
    "const [count, setCount] = useState(0);",
    "function factorial(n) { return n <= 1 ? 1 : n * factorial(n - 1); }",
    "for (let i = 0; i < 10; i++) { console.log(i); }",
    "document.getElementById('app').innerHTML = 'Hello World';",
  ],
};

function canPlayersMatch(a, b) {
  return a.preference === b.preference;
}

function resolveMatchMode(a, b) {
  if (a.preference === b.preference && a.preference !== MATCH_MODES.ANY) {
    return a.preference;
  }

  if (a.preference === MATCH_MODES.ANY && b.preference !== MATCH_MODES.ANY) {
    return b.preference;
  }

  if (b.preference === MATCH_MODES.ANY && a.preference !== MATCH_MODES.ANY) {
    return a.preference;
  }

  return Math.random() > 0.5 ? MATCH_MODES.NORMAL : MATCH_MODES.CODING;
}

function tryMatchPlayers() {
  for (let i = 0; i < waitingPlayers.length; i += 1) {
    for (let j = i + 1; j < waitingPlayers.length; j += 1) {
      const first = waitingPlayers[i];
      const second = waitingPlayers[j];

      if (!canPlayersMatch(first, second)) continue;

      waitingPlayers.splice(j, 1);
      waitingPlayers.splice(i, 1);

      return [first, second];
    }
  }

  return null;
}

io.on("connection", (socket) => {
  console.log("Player connected:", socket.id);

  socket.on("join_matchmaking", ({ preference = MATCH_MODES.ANY } = {}) => {
    if (waitingPlayers.some(player => player.socket.id === socket.id)) return;

    waitingPlayers.push({ socket, preference });

    const pair = tryMatchPlayers();
    if (pair) {
      const [first, second] = pair;
      const p1 = first.socket;
      const p2 = second.socket;
      const matchMode = resolveMatchMode(first, second);

      const roomId = `room_${++roomCounter}`;
      p1.join(roomId);
      p2.join(roomId);

      const pool = PASSAGES[matchMode];
      const passage = pool[Math.floor(Math.random() * pool.length)];

      const roomData = {
        id: roomId,
        mode: matchMode,
        players: [
          { id: p1.id, progress: 0, wpm: 0, finishedAt: null },
          { id: p2.id, progress: 0, wpm: 0, finishedAt: null }
        ],
        passage,
        winnerId: null,
        finished: false,
        startTimeout: null
      };

      rooms.set(roomId, roomData);

      io.to(roomId).emit("match_found", roomData);

      roomData.startTimeout = setTimeout(() => {
        if (!rooms.has(roomId)) return;
        io.to(roomId).emit("match_start");
      }, 3000);

      p1.data.roomId = roomId;
      p2.data.roomId = roomId;
    }
  });

  socket.on("progress", (data) => {
    const roomId = socket.data.roomId;
    if (!roomId) return;

    const roomData = rooms.get(roomId);
    if (!roomData) return;

    const player = roomData.players.find(p => p.id === socket.id);
    if (player) {
      player.progress = data.progress;
      player.wpm = data.wpm;
    }

    socket.to(roomId).emit("player_progress", {
      id: socket.id,
      progress: data.progress,
      wpm: data.wpm
    });
  });

  socket.on("match_finished", () => {
    const roomId = socket.data.roomId;
    if (!roomId) return;

    socket.to(roomId).emit("opponent_finished", { id: socket.id });

    const roomData = rooms.get(roomId);
    if (!roomData || roomData.finished) return;

    const player = roomData.players.find(p => p.id === socket.id);
    const opponent = roomData.players.find(p => p.id !== socket.id);
    if (!player || !opponent) return;

    if (!player.finishedAt) {
      player.finishedAt = Date.now();
    }

    if (!roomData.winnerId) {
      roomData.winnerId = socket.id;
      roomData.finished = true;

      io.to(socket.id).emit("match_result", { outcome: "win", reason: "finished_first" });
      io.to(opponent.id).emit("match_result", { outcome: "loss", reason: "opponent_finished_first" });

      setTimeout(() => cleanupRoom(roomId), 1500);
    }
  });

  socket.on("exit_race", () => {
    const roomId = socket.data.roomId;
    if (!roomId) return;

    io.to(roomId).emit("race_exited", { reason: "player_exit", playerId: socket.id });
    cleanupRoom(roomId);
  });

  socket.on("disconnect", () => {
    console.log("Player disconnected:", socket.id);

    waitingPlayers = waitingPlayers.filter(player => player.socket.id !== socket.id);

    const roomId = socket.data.roomId;
    if (roomId) {
      socket.to(roomId).emit("opponent_disconnected", { reason: "opponent_left_match" });
      cleanupRoom(roomId);
    }
  });
});

// SPA fallback
app.use((req, res) => {
  res.sendFile(path.join(__dirname, "../dist/index.html"));
});

const PORT = process.env.PORT || 3001;
const HOST = process.env.HOST || "0.0.0.0";

httpServer.listen(PORT, HOST, () => {
  console.log(`Server running on http://${HOST}:${PORT}`);
});
