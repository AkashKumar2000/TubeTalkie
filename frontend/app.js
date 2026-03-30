const BACKEND = "";  // empty = same origin (Railway serves both frontend + backend)

let currentVideoId = null;

const loadBtn = document.getElementById("load-btn");
const sendBtn = document.getElementById("send-btn");
const loadStatus = document.getElementById("load-status");
const urlInput = document.getElementById("url-input");
const chatSection = document.getElementById("chat-section");
const loadSection = document.getElementById("load-section");
const chatBox = document.getElementById("chat-box");
const questionInput = document.getElementById("question-input");
const clearBtn = document.getElementById("clear-btn");
const videoTitleEl = document.getElementById("video-title");

// Clear chat
clearBtn.addEventListener("click", () => {
  chatBox.innerHTML = "";
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
loadBtn.addEventListener("click", loadVideo);
urlInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") loadVideo();
});

async function loadVideo() {
  const url = urlInput.value.trim();
  if (!url) return;

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
    questionInput.focus();
  } catch (err) {
    setStatus(err.message, "error");
    loadBtn.disabled = false;
  }
}

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
  const wrapper = document.createElement("div");
  wrapper.className = `message-wrapper ${role}`;

  const msg = document.createElement("div");
  msg.className = `message ${role}`;
  msg.textContent = text;
  wrapper.appendChild(msg);

  if (role === "bot") {
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
    wrapper.appendChild(copyBtn);
  }

  chatBox.appendChild(wrapper);
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
