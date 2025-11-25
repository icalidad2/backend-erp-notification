let ws = null;
let reconnectTimeout = null;

function connect() {
  console.log("Conectando WebSocket...");

  ws = new WebSocket("wss://backend-erp-notification.onrender.com");

  ws.onopen = () => {
    console.log("WS conectado.");

    ws.send(JSON.stringify({
      type: "register",
      email: "icalidad2@mecanoplastica.com.mx"
    }));
  };

  ws.onmessage = (event) => {
    const data = JSON.parse(event.data);

    if (data.event === "ping") return;

    if (data.event === "notification") {
      chrome.notifications.create({
        type: "basic",
        iconUrl: "icon.png",
        title: data.title,
        message: data.description,
        priority: 2
      });

      chrome.storage.local.get(["history"], (res) => {
        const history = res.history || [];
        history.push({
          title: data.title,
          description: data.description,
          time: Date.now()
        });
        chrome.storage.local.set({ history });
      });
    }
  };

  ws.onclose = () => {
    console.log("WS desconectado. Reintentando en 3s...");
    reconnectTimeout = setTimeout(connect, 3000);
  };

  ws.onerror = (err) => {
    console.log("WS ERROR:", err);
    ws.close();
  };
}

// 🔥 Mantener vivo el background con alarms
chrome.alarms.create("wsKeepAlive", { periodInMinutes: 1 });

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === "wsKeepAlive") {
    if (!ws || ws.readyState === WebSocket.CLOSED) {
      console.log("Reconectando WS desde alarm...");
      connect();
    }
  }
});

// iniciar
connect();

// ⭐ NECESARIO PARA QUE EL POPUP NO ROMPA EL SERVICE WORKER
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.type === "alive?") {
    sendResponse({ ok: true });
  }
});