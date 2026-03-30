const BACKEND = "http://localhost:8000";

let currentVideoId = null;

const loadBtn = document.getElementById("load-btn");
const sendBtn = document.getElementById("send-btn");
const loadStatus = document.getElementById("load-status");
const videoUrlEl = document.getElementById("video-url");
const chatSection = document.getElementById("chat-section");
const loadSection = document.getElementById("load-section");
const chatBox = document.getElementById("chat-box");
const questionInput = document.getElementById("question-input");
const toggleBtn = document.getElementById("toggle-btn");
const mainContent = document.getElementById("main-content");
const clearBtn = document.getElementById("clear-btn");
const videoTitleEl = document.getElementById("video-title");

// Minimize / Maximize toggle
let isCollapsed = false;
toggleBtn.addEventListener("click", () => {
  isCollapsed = !isCollapsed;
  mainContent.classList.toggle("collapsed", isCollapsed);
  toggleBtn.innerHTML = isCollapsed ? "&#x25B2;" : "&#x26F6;";
  toggleBtn.title = isCollapsed ? "Expand" : "Collapse";
});

// Clear chat
clearBtn.addEventListener("click", () => {
  chatBox.innerHTML = "";
});

// Auto-detect YouTube URL from active tab
chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
  const url = tabs[0].url;
  if (url && url.includes("youtube.com/watch")) {
    videoUrlEl.textContent = url;
    loadBtn.disabled = false;
  } else {
    videoUrlEl.textContent = "No YouTube video detected.";
    loadBtn.disabled = true;
    setStatus("Open a YouTube video first.", "error");
  }
});

// Fetch video title from YouTube oEmbed
async function fetchVideoTitle(url) {
  try {
    const res = await fetch(
      `https://www.youtube.com/oembed?url=${encodeURIComponent(url)}&format=json`
    );
    const data = await res.json();
    return data.title || "";
  } catch {
    return "";
  }
}

// Load video
loadBtn.addEventListener("click", async () => {
  const url = videoUrlEl.textContent;
  loadBtn.disabled = true;
  setStatus("Loading video... this may take a moment.", "");

  try {
    const [res, title] = await Promise.all([
      fetch(`${BACKEND}/load`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      }),
      fetchVideoTitle(url),
    ]);

    const data = await res.json();
    if (!res.ok) throw new Error(data.detail || "Failed to load video.");

    currentVideoId = data.video_id;
    videoTitleEl.textContent = title || currentVideoId;
    setStatus("", "");
    loadSection.classList.add("hidden");
    chatSection.classList.remove("hidden");
  } catch (err) {
    setStatus(err.message, "error");
    loadBtn.disabled = false;
  }
});

// Send question
sendBtn.addEventListener("click", sendQuestion);
questionInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") sendQuestion();
});

async function sendQuestion() {
  const question = questionInput.value.trim();
  if (!question || !currentVideoId) return;

  appendMessage(question, "user");
  questionInput.value = "";
  sendBtn.disabled = true;

  const typingEl = showTypingIndicator();

  try {
    const res = await fetch(`${BACKEND}/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ video_id: currentVideoId, question }),
    });

    const data = await res.json();
    removeTypingIndicator(typingEl);

    if (!res.ok) throw new Error(data.detail || "Failed to get answer.");
    appendMessage(data.answer, "bot");
  } catch (err) {
    removeTypingIndicator(typingEl);
    appendMessage(`Error: ${err.message}`, "bot");
  } finally {
    sendBtn.disabled = false;
    questionInput.focus();
  }
}

function appendMessage(text, role) {
  if (role === "bot") {
    const wrapper = document.createElement("div");
    wrapper.className = "message-wrapper";

    const msg = document.createElement("div");
    msg.className = "message bot";
    msg.textContent = text;

    const copyBtn = document.createElement("button");
    copyBtn.className = "copy-btn";
    copyBtn.textContent = "Copy";
    copyBtn.addEventListener("click", () => {
      navigator.clipboard.writeText(text).then(() => {
        copyBtn.textContent = "Copied!";
        copyBtn.classList.add("copied");
        setTimeout(() => {
          copyBtn.textContent = "Copy";
          copyBtn.classList.remove("copied");
        }, 2000);
      });
    });

    wrapper.appendChild(msg);
    wrapper.appendChild(copyBtn);
    chatBox.appendChild(wrapper);
  } else {
    const wrapper = document.createElement("div");
    wrapper.className = "message-wrapper user";

    const msg = document.createElement("div");
    msg.className = "message user";
    msg.textContent = text;

    wrapper.appendChild(msg);
    chatBox.appendChild(wrapper);
  }

  chatBox.scrollTop = chatBox.scrollHeight;
}

function showTypingIndicator() {
  const el = document.createElement("div");
  el.className = "typing-indicator";
  el.innerHTML = "<span></span><span></span><span></span>";
  chatBox.appendChild(el);
  chatBox.scrollTop = chatBox.scrollHeight;
  return el;
}

function removeTypingIndicator(el) {
  if (el && el.parentNode) el.parentNode.removeChild(el);
}

function setStatus(text, type) {
  loadStatus.textContent = text;
  loadStatus.className = `status ${type}`;
}
