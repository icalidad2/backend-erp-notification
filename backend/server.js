import express from "express";
import http from "http";
import { WebSocketServer } from "ws";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

// Crear servidor HTTP + WebSocket
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

/* ============================================================
   MANEJO DE CONEXIONES WEBSOCKET (CON CANALES)
   ============================================================ */
wss.on("connection", (ws) => {
  console.log("Cliente conectado");

  ws.on("message", (raw) => {
    try {
      const data = JSON.parse(raw);

      // Registro del canal
      if (data.type === "register") {
        ws.channel = data.channel || "global";
        console.log("Cliente registrado en canal:", ws.channel);
      }

    } catch (e) {
      console.error("Error al parsear WS:", e);
    }
  });

  ws.on("close", () => {
    console.log("Cliente desconectado:", ws.channel || "sin canal");
  });
});

/* ============================================================
   ENDPOINT PING (KEEP-ALIVE DESDE APPS SCRIPT)
   ============================================================ */
app.get("/ping", (req, res) => {
  res.status(200).send("pong");
});

/* ============================================================
   ENDPOINT /notification (LEGACY PARA EMAIL, SIGUE FUNCIONANDO)
   ============================================================ */
const clients = new Map(); // soporte legacy basado en email

app.post("/notification", (req, res) => {
  const { email, title, description } = req.body;

  console.log("POST recibido (legacy)", req.body);

  const client = clients.get(email);

  if (client && client.readyState === 1) {
    client.send(
      JSON.stringify({
        event: "notification",
        title,
        description,
      })
    );
  }

  res.json({ ok: true });
});

/* ============================================================
   ENDPOINT /send -> NOTIFICACIONES POR CANAL
   ============================================================ */
app.post("/send", express.json(), (req, res) => {
  const { event, title, description, channel } = req.body;

  console.log("Enviando notificación al canal:", channel);

  wss.clients.forEach((client) => {
    if (client.readyState === 1 && client.channel === channel) {
      client.send(
        JSON.stringify({
          event,
          title,
          description,
          channel,
        })
      );
    }
  });

  res.json({ ok: true });
});

/* ============================================================
   ENDPOINT DE STATUS (PARA EXTENSION / POPUP)
   ============================================================ */
app.get("/", (req, res) => {
  res.json({
    ok: true,
    status: "online",
    message: "Servidor activo",
    time: new Date().toISOString(),
  });
});

/* ============================================================
   INICIO DEL SERVIDOR
   ============================================================ */
const port = process.env.PORT || 8080;
server.listen(port, () => console.log("Servidor activo en", port));
