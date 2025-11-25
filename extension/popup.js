function showToast(title, description) {
  const container = document.getElementById("toast-container");

  const toast = document.createElement("div");
  toast.className = "toast";

  toast.innerHTML = `
    <div class="toast-title">${title}</div>
    <div class="toast-desc">${description}</div>
  `;

  container.appendChild(toast);

  setTimeout(() => {
    toast.remove();
  }, 5000);
}

// Escuchar mensajes desde background.js
chrome.runtime.onMessage.addListener((msg) => {
  if (msg.toast) {
    showToast(msg.toast.title, msg.toast.description);
  }
});
