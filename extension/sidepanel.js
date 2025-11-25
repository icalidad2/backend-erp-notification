function formatTime(ts) {
  const d = new Date(ts);
  return d.toLocaleString("es-MX");
}

// 🔥 Eliminar una notificación del historial
function removeNotification(index) {
  chrome.storage.local.get(["history"], (res) => {
    let history = res.history || [];

    // borrar por índice
    history.splice(index, 1);

    // guardar
    chrome.storage.local.set({ history }, () => {
      loadHistory(); // refrescar UI
    });
  });
}

// 🔄 Cargar historial
function loadHistory() {
  chrome.storage.local.get(["history"], (res) => {
    const list = document.getElementById("list");
    const history = res.history || [];

    if (history.length === 0) {
      list.innerHTML = `
                <div class="card">
                    <div class="title">Sin notificaciones</div>
                    <div class="desc">Cuando recibas mensajes aparecerán aquí.</div>
                </div>`;
      return;
    }

    list.innerHTML = "";

    history
      .slice()
      .reverse()
      .forEach((item, i) => {
        const trueIndex = history.length - 1 - i;

        const div = document.createElement("div");
        div.className = "card";

        div.innerHTML = `
                <div class="title">${item.title}</div>
                <div class="desc">${item.description}</div>
                <div class="time">${formatTime(item.time)}</div>

                <div class="card-actions">
                    <button class="delete-btn" title="Eliminar notificación">×</button>
                </div>
            `;

        // asignar evento al botón eliminar
        div.querySelector(".delete-btn").addEventListener("click", () => {
          removeNotification(trueIndex);
        });

        list.appendChild(div);
      });
  });
}

// 🟢 Estado del WebSocket
function checkWS() {
  chrome.runtime.sendMessage({ type: "alive?" }, (res) => {
    const el = document.getElementById("status");

    if (chrome.runtime.lastError || !res || !res.ok) {
      el.className = "state-bad";
      el.innerHTML = `Sistemas fuera de línea`;
    } else {
      el.className = "state-ok";
      el.innerHTML = `Sistemas en línea`;
    }
  });
}

setInterval(() => {
  loadHistory();
  checkWS();
}, 1500);

loadHistory();
checkWS();
