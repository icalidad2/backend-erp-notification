import express from "express";
import http from "http";
import { WebSocketServer } from "ws";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const wss = new WebSocketServer({ server });

const clients = new Map();

// ======================================
//  WEBSOCKET CONNECTIONS
// ======================================
wss.on("connection", ws => {
  ws.on("message", msg => {
    try {
      const data = JSON.parse(msg);

      if (data.type === "register") {
        clients.set(data.email, ws);
        console.log("Usuario conectado:", data.email);
      }
    } catch (e) {
      console.error("Error parsing:", e);
    }
  });

  ws.on("close", () => {
    for (const [email, socket] of clients.entries()) {
      if (socket === ws) clients.delete(email);
    }
  });
});

// ======================================
//  ENDPOINT KEEP-ALIVE (PINGS)
// ======================================
app.get("/ping", (req, res) => {
  res.status(200).send("pong");
});

// ======================================
//  NOTIFICACIÓN DESDE APPSHEET
// ======================================
app.post("/notification", (req, res) => {
  const { email, title, description } = req.body;

  console.log("POST recibido", req.body);

  const client = clients.get(email);

  if (client && client.readyState === 1) {
    client.send(
      JSON.stringify({
        event: "notification",
        title,
        description
      })
    );
  }

  res.json({ ok: true });
});

// ======================================
//  STATUS ENDPOINT (para popup.html)
// ======================================
app.get("/", (req, res) => {
  res.json({
    ok: true,
    status: "online",
    message: "Servidor activo",
    time: new Date().toISOString()
  });
});

// ======================================
//  SERVER LISTEN
// ======================================
const port = process.env.PORT || 8080;
server.listen(port, () => console.log("Servidor activo en", port));


// ruta/send para respuesta de recordario

app.post("/send", express.json(), (req, res) => {
  const { event, title, description, channel } = req.body;

  wss.clients.forEach(client => {
    if (client.readyState === 1 && client.channel === channel) {
      client.send(JSON.stringify({ event, title, description, channel }));
    }
  });

  res.json({ ok: true });
});


// manejo de mensajes entrantes de WebSocket

ws.on("message", (raw) => {
  const data = JSON.parse(raw);

  // Registro del canal
  if (data.type === "register") {
    ws.channel = data.channel || "global";
    console.log("Cliente registrado en canal:", ws.channel);
  }
});
