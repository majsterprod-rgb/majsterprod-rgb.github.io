// === KONFIGURACJA BACKENDU ===
const API_URL = "https://majsterprod-rgb-github-io-7ywz.vercel.app/api/chat";

// === ELEMENTY WIDGETU ===
const chatLauncher = document.getElementById("chatLauncher");
const chatWidget = document.getElementById("chatWidget");
const chatClose = document.getElementById("chatClose");
const chatLog = document.getElementById("chatLog");
const chatInput = document.getElementById("chatInput");
const chatSend = document.getElementById("chatSend");

// === OTWIERANIE / ZAMYKANIE ===
chatLauncher.addEventListener("click", () => {
  chatWidget.classList.remove("hidden");
  chatWidget.setAttribute("aria-hidden", "false");
});

chatClose.addEventListener("click", () => {
  chatWidget.classList.add("hidden");
  chatWidget.setAttribute("aria-hidden", "true");
});

// === WYSYŁANIE WIADOMOŚCI ===
chatSend.addEventListener("click", sendMessage);
chatInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") sendMessage();
});

function addMessage(role, text) {
  const div = document.createElement("div");
  div.className = `msg ${role}`;
  div.textContent = text;
  chatLog.appendChild(div);
  chatLog.scrollTop = chatLog.scrollHeight;
}

async function sendMessage() {
  const message = chatInput.value.trim();
  if (!message) return;

  addMessage("user", message);
  chatInput.value = "";

  addMessage("bot", "⏳ Myślę…");

  try {
    const res = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message }),
    });

    const data = await res.json();

    // usuń placeholder
    chatLog.removeChild(chatLog.lastChild);

    addMessage("bot", data.reply || "Brak odpowiedzi.");

  } catch (error) {
    console.error(error);
    addMessage("bot", "❌ Błąd połączenia z AI.");
  }
}
