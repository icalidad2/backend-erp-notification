let ws;

function connect() {
  ws = new WebSocket("wss://backend-erp-notification.onrender.com");

  ws.onopen = () => {
    console.log("Conectado al servidor Render");

    ws.send(JSON.stringify({
      type: "register",
      email: "icalidad2@mecanoplastica.com.mx"
    }));

    console.log("Usuario registrado: icalidad2@mecanoplastica.com.mx");
  };

  ws.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);

      if (data.event === "notification") {
        // Enviar al popup para mostrar el toast HTML
        chrome.runtime.sendMessage({
          toast: {
            title: data.title,
            description: data.description
          }
        });

        // Notificación nativa opcional
        chrome.notifications.create({
          type: "basic",
          iconUrl: "icon.png",
          title: data.title,
          message: data.description,
          priority: 2
        });
      }
    } catch (err) {
      console.error("Error en mensaje:", err);
    }
  };

  ws.onclose = () => {
    console.log("Desconectado — reconectando en 3s...");
    setTimeout(connect, 3000);
  };
}

connect();
