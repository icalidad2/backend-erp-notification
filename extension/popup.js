document.addEventListener("DOMContentLoaded", () => {

  const serverStatus = document.getElementById("serverStatus");
  const serverDot = document.getElementById("serverDot");
  const updatedAt = document.getElementById("updatedAt");
  const extStatus = document.getElementById("ext-status");

  // Verificar servidor
  fetch("https://backend-erp-notification.onrender.com/")
    .then(res => {
      if (!res.ok) throw new Error("Server down");

      serverStatus.innerHTML = `SERVER ONLINE <span class="dot green"></span>`;
      serverStatus.classList.remove("error");
      serverStatus.classList.add("ok");
      serverDot.classList.remove("red");
      serverDot.classList.add("green");
    })
    .catch(() => {
      serverStatus.innerHTML = `SERVER OFFLINE <span class="dot red"></span>`;
      serverStatus.classList.remove("ok");
      serverStatus.classList.add("error");
      serverDot.classList.remove("green");
      serverDot.classList.add("red");
    })
    .finally(() => {
      updatedAt.innerText = new Date().toLocaleTimeString("es-MX");
    });

  // Verificar extensión
  chrome.runtime.sendMessage({ type: "alive?" }, response => {
    if (chrome.runtime.lastError) {
      extStatus.innerHTML = `EXTENSIÓN INACTIVA <span class="dot red"></span>`;
      extStatus.classList.add("error");
      return;
    }

    if (response?.ok) {
      extStatus.innerHTML = `EXTENSIÓN ACTIVA <span class="dot green"></span>`;
      extStatus.classList.add("ok");
    }
  });

});