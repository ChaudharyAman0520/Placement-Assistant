const API_URL = "http://127.0.0.1:5000/chat";

let sessionId = localStorage.getItem("session_id");
let isSending = false;

const input = document.getElementById("query");
const chatBox = document.getElementById("chat-box");
const sendBtn = document.getElementById("send-btn");
const sendLabel = sendBtn.querySelector(".btn-label");
const clearBtn = document.getElementById("clear-btn");

const STARTER_PROMPTS = [
    {
        tag: "DSA & Complexity",
        text: "Explain Big O notation with a quick Python example"
    },
    {
        tag: "CS Fundamentals",
        text: "What is the difference between a process and a thread?"
    },
    {
        tag: "Resume Review",
        text: "Give me 3 high-impact resume tips for software placements"
    },
    {
        tag: "HR Interview",
        text: "How should I answer 'Tell me about yourself' in an interview?"
    }
];

if (window.marked) {
    window.marked.setOptions({
        breaks: true,
        gfm: true
    });
}

function escapeHtml(text) {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
}

function sanitizeHtml(html) {
    const template = document.createElement("template");
    template.innerHTML = html;

    template.content.querySelectorAll("script, style, iframe, object, embed").forEach((el) => el.remove());
    template.content.querySelectorAll("*").forEach((el) => {
        for (const attr of Array.from(el.attributes)) {
            if (attr.name.toLowerCase().startsWith("on") || attr.value.trim().toLowerCase().startsWith("javascript:")) {
                el.removeAttribute(attr.name);
            }
        }
    });

    return template.innerHTML;
}

function fallbackMarkdown(text) {
    let safe = escapeHtml(text);

    safe = safe.replace(/```(?:\w+)?\n([\s\S]*?)```/g, (_, code) => `<pre><code>${code}</code></pre>`);
    safe = safe.replace(/`([^`]+)`/g, "<code>$1</code>");
    safe = safe.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
    safe = safe.replace(/\*([^*]+)\*/g, "<em>$1</em>");
    safe = safe.replace(/(?:^|\n)(?:- |\* )(.+)/g, "\n<li>$1</li>");
    safe = safe.replace(/(<li>[\s\S]*?<\/li>)/g, "<ul>$1</ul>");
    safe = safe.replace(/\n/g, "<br>");

    return safe;
}

function renderMarkdown(text) {
    if (window.marked) {
        return sanitizeHtml(window.marked.parse(text));
    }
    return fallbackMarkdown(text);
}

function formatTime() {
    return new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function removeWelcomeScreen() {
    const welcome = chatBox.querySelector(".welcome-card");
    if (welcome) {
        welcome.remove();
    }
}

function renderWelcomeScreen() {
    chatBox.innerHTML = "";

    const card = document.createElement("section");
    card.className = "welcome-card";

    card.innerHTML = `
        <div class="welcome-badge" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"/>
            </svg>
        </div>
        <h2>Ready for your placement prep?</h2>
        <p>
            Ask about Data Structures &amp; Algorithms, OS/DBMS/CN fundamentals,
            coding interviews, resume building, or HR questions.
        </p>
        <div class="suggestions-grid"></div>
    `;

    const grid = card.querySelector(".suggestions-grid");
    STARTER_PROMPTS.forEach((item) => {
        const chip = document.createElement("button");
        chip.type = "button";
        chip.className = "chip";

        const tag = document.createElement("span");
        tag.className = "chip-tag";
        tag.textContent = item.tag;

        const text = document.createElement("span");
        text.className = "chip-text";
        text.textContent = item.text;

        chip.appendChild(tag);
        chip.appendChild(text);

        chip.addEventListener("click", () => {
            input.value = item.text;
            sendMessage();
        });

        grid.appendChild(chip);
    });

    chatBox.appendChild(card);
}

function createBotAvatarSvg() {
    return `
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <rect x="3" y="11" width="18" height="10" rx="2"/>
            <circle cx="12" cy="5" r="2"/>
            <path d="M12 7v4"/>
            <line x1="8" y1="16" x2="8" y2="16"/>
            <line x1="16" y1="16" x2="16" y2="16"/>
        </svg>
    `;
}

function createSourcesElement(sources) {
    const details = document.createElement("details");
    details.className = "sources";

    const summary = document.createElement("summary");
    summary.textContent = "Matched Knowledge Sources ";

    const badge = document.createElement("span");
    badge.className = "source-count";
    badge.textContent = String(sources.length);
    summary.appendChild(badge);

    const list = document.createElement("div");
    list.className = "sources-list";

    sources.forEach((source) => {
        const item = document.createElement("div");
        item.className = "source-item";

        const q = document.createElement("div");
        q.className = "source-q";
        q.textContent = source.question;

        const a = document.createElement("div");
        a.className = "source-a";
        a.textContent = source.answer;

        item.appendChild(q);
        item.appendChild(a);
        list.appendChild(item);
    });

    details.appendChild(summary);
    details.appendChild(list);
    return details;
}

function addMessage(text, sender, sources = null, options = {}) {
    removeWelcomeScreen();

    const row = document.createElement("div");
    row.className = `message-row ${sender}`;

    const avatar = document.createElement("div");
    avatar.className = "avatar";
    if (sender === "user") {
        avatar.textContent = "You";
    } else {
        avatar.innerHTML = createBotAvatarSvg();
    }

    const wrapper = document.createElement("div");
    wrapper.className = "message-wrapper";

    const meta = document.createElement("div");
    meta.className = "message-meta";

    const name = document.createElement("span");
    name.className = "sender-name";
    name.textContent = sender === "user" ? "You" : "Placement Assistant";

    const time = document.createElement("span");
    time.textContent = formatTime();

    meta.appendChild(name);
    meta.appendChild(time);

    const bubble = document.createElement("div");
    bubble.className = `message ${sender}`;
    if (options.isError) {
        bubble.classList.add("error");
    }

    if (options.isTyping) {
        bubble.innerHTML = `
            <div class="typing-indicator" aria-label="Thinking">
                <span></span><span></span><span></span>
            </div>
        `;
    } else if (sender === "user") {
        bubble.textContent = text;
    } else {
        const content = document.createElement("div");
        content.className = "message-content";
        content.innerHTML = renderMarkdown(text);
        bubble.appendChild(content);

        if (sources && sources.length > 0) {
            bubble.appendChild(createSourcesElement(sources));
        }
    }

    wrapper.appendChild(meta);
    wrapper.appendChild(bubble);
    row.appendChild(avatar);
    row.appendChild(wrapper);

    chatBox.appendChild(row);
    chatBox.scrollTop = chatBox.scrollHeight;

    return row;
}

function setLoadingState(loading) {
    isSending = loading;
    sendBtn.disabled = loading;
    input.disabled = loading;
    sendLabel.textContent = loading ? "Sending..." : "Send";
}

async function sendMessage() {
    if (isSending) {
        return;
    }

    const query = input.value.trim();
    if (!query) {
        return;
    }

    addMessage(query, "user");
    input.value = "";
    setLoadingState(true);

    const typingRow = addMessage("", "bot", null, { isTyping: true });

    try {
        const response = await fetch(API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                query: query,
                session_id: sessionId
            })
        });

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }

        const data = await response.json();

        if (!sessionId && data.session_id) {
            sessionId = data.session_id;
            localStorage.setItem("session_id", sessionId);
        }

        typingRow.remove();
        addMessage(data.answer, "bot", data.sources);
    } catch (error) {
        typingRow.remove();
        addMessage(
            "Unable to reach the Placement Assistant server. Please verify the backend is running on port 5000.",
            "bot",
            null,
            { isError: true }
        );
        console.error(error);
    } finally {
        setLoadingState(false);
        input.focus();
        chatBox.scrollTop = chatBox.scrollHeight;
    }
}

input.addEventListener("keydown", (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
        event.preventDefault();
        sendMessage();
    }
});

clearBtn.addEventListener("click", () => {
    localStorage.removeItem("session_id");
    sessionId = null;
    renderWelcomeScreen();
    input.focus();
});

renderWelcomeScreen();
input.focus();
