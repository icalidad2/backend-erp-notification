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

const port = process.env.PORT || 8080;
server.listen(port, () => console.log("Servidor activo en", port));
