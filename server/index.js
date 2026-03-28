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

function cleanupRoom(roomId) {
  const roomData = rooms.get(roomId);
  if (!roomData) return;

  roomData.players.forEach(player => {
    const playerSocket = io.sockets.sockets.get(player.id);
    if (playerSocket) {
      playerSocket.data.roomId = undefined;
    }
  });

  rooms.delete(roomId);
}

const PASSAGES = [
  "const [count, setCount] = useState(0);",
  "function factorial(n) { return n <= 1 ? 1 : n * factorial(n - 1); }",
  "for (let i = 0; i < 10; i++) { console.log(i); }",
  "document.getElementById('app').innerHTML = 'Hello World';"
];

io.on("connection", (socket) => {
  console.log("Player connected:", socket.id);

  socket.on("join_matchmaking", () => {
    if (waitingPlayers.includes(socket)) return;

    waitingPlayers.push(socket);

    if (waitingPlayers.length >= 2) {
      const p1 = waitingPlayers.shift();
      const p2 = waitingPlayers.shift();

      const roomId = `room_${++roomCounter}`;
      p1.join(roomId);
      p2.join(roomId);

      const passage = PASSAGES[Math.floor(Math.random() * PASSAGES.length)];

      const roomData = {
        id: roomId,
        players: [
          { id: p1.id, progress: 0, wpm: 0, finishedAt: null },
          { id: p2.id, progress: 0, wpm: 0, finishedAt: null }
        ],
        passage,
        winnerId: null,
        finished: false
      };

      rooms.set(roomId, roomData);

      io.to(roomId).emit("match_found", roomData);

      setTimeout(() => {
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

  socket.on("disconnect", () => {
    console.log("Player disconnected:", socket.id);

    waitingPlayers = waitingPlayers.filter(p => p.id !== socket.id);

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

httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
