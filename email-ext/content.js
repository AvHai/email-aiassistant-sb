console.log("ReplyCraft Gmail Extension - Content Script Loaded");

let replyCraftPanel = null;
let selectedTone = "formal";


function createAIButton() {
  const button = document.createElement("div");
  button.className = "T-I J-J5-Ji aoO v7 T-I-atl L3 ai-reply-button";
  button.style.marginRight = "8px";
  button.innerText = "AI Reply";
  button.setAttribute("role", "button");
  button.setAttribute("data-tooltip", "Generate AI Reply with ReplyCraft");
  return button;
}


function getEmailSubject() {
  const subjectEl = document.querySelector("h2.hP");
  if (subjectEl && subjectEl.innerText) {
    return subjectEl.innerText.trim();
  }
  return "";
}


function getLatestMessageAsDto() {
  const bodyCandidates = document.querySelectorAll(".a3s.aiL");

  let bodyText = "";
  if (bodyCandidates.length > 0) {
    const last = bodyCandidates[bodyCandidates.length - 1];
    bodyText = last.innerText ? last.innerText.trim() : "";
  }

  const senderEl = document.querySelector(".gD");
  const sender =
    (senderEl && senderEl.getAttribute("email")) ||
    (senderEl && senderEl.innerText ? senderEl.innerText.trim() : "");

  const recipientEl = document.querySelector(".g2");
  const recipient =
    (recipientEl && recipientEl.getAttribute("email")) ||
    (recipientEl && recipientEl.innerText ? recipientEl.innerText.trim() : "");

  return {
    sender,
    recipient,
    body: bodyText,
  };
}


function getEmailContentFallback() {
  const selectors = [
    ".a3s.aiL",
    ".h7",
    ".gmail_quote",
    '[role="presentation"]',
  ];

  for (const selector of selectors) {
    const el = document.querySelector(selector);
    if (el && el.innerText) {
      return el.innerText.trim();
    }
  }
  return "";
}


function findComposeToolbar() {
  const selectors = [".btC", ".aDh", "[role='toolbar']", ".gU.Up"];
  for (const selector of selectors) {
    const toolbar = document.querySelector(selector);
    if (toolbar) {
      return toolbar;
    }
  }
  return null;
}


function createReplyCraftPanel() {
  if (replyCraftPanel) return replyCraftPanel;

  const panel = document.createElement("div");
  panel.className = "replycraft-panel";

  panel.innerHTML = `
    <div class="replycraft-header">
      <span class="replycraft-title">ReplyCraft</span>
      <button class="replycraft-close-btn" type="button">&times;</button>
    </div>
    <div class="replycraft-body">
      <div class="replycraft-tones">
        <span class="replycraft-label">Tone:</span>
        <button class="replycraft-tone-btn replycraft-tone-active" data-tone="formal">Formal</button>
        <button class="replycraft-tone-btn" data-tone="friendly">Friendly</button>
        <button class="replycraft-tone-btn" data-tone="concise">Concise</button>
      </div>
      <textarea class="replycraft-textarea" placeholder="Click 'Generate reply' to draft an email..."></textarea>
    </div>
    <div class="replycraft-footer">
      <button class="replycraft-generate-btn" type="button">Generate reply</button>
      <button class="replycraft-insert-btn" type="button">Insert into reply</button>
    </div>
  `;

  document.body.appendChild(panel);
  replyCraftPanel = panel;

  
  const closeBtn = panel.querySelector(".replycraft-close-btn");
  const toneButtons = panel.querySelectorAll(".replycraft-tone-btn");
  const generateBtn = panel.querySelector(".replycraft-generate-btn");
  const insertBtn = panel.querySelector(".replycraft-insert-btn");

  closeBtn.addEventListener("click", () => {
    panel.style.display = "none";
  });

  toneButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      toneButtons.forEach((b) => b.classList.remove("replycraft-tone-active"));
      btn.classList.add("replycraft-tone-active");
      selectedTone = btn.getAttribute("data-tone") || "formal";
    });
  });

  generateBtn.addEventListener("click", () => handleGenerateClick());
  insertBtn.addEventListener("click", () => handleInsertClick());

  return panel;
}

function showReplyCraftPanel() {
  const panel = createReplyCraftPanel();
  panel.style.display = "flex";
}


async function handleGenerateClick() {
  if (!replyCraftPanel) return;

  const textarea = replyCraftPanel.querySelector(".replycraft-textarea");
  const generateBtn = replyCraftPanel.querySelector(".replycraft-generate-btn");

  try {
    generateBtn.disabled = true;
    generateBtn.innerText = "Generating...";
    textarea.placeholder = "Thinking...";

    const subject = getEmailSubject();
    const latestMessage = getLatestMessageAsDto();

    const hasBody = latestMessage.body && latestMessage.body.length > 0;
    const emailContentFallback = hasBody ? null : getEmailContentFallback();

    const payload = hasBody
      ? {
          subject: subject || null,
          tone: selectedTone,
          messages: [latestMessage],
        }
      : {
          subject: subject || null,
          tone: selectedTone,
          emailContent: emailContentFallback || "",
        };

    console.log("ReplyCraft payload:", payload);

    const response = await fetch("http://localhost:8080/api/email/generate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error("API request failed with status " + response.status);
    }

    const generatedReply = await response.text();
    textarea.value = generatedReply;
    textarea.focus();
  } catch (err) {
    console.error("ReplyCraft generate error:", err);
    alert("Failed to generate reply");
  } finally {
    generateBtn.disabled = false;
    generateBtn.innerText = "Generate reply";
    textarea.placeholder = "Click 'Generate reply' to draft an email...";
  }
}


function handleInsertClick() {
  if (!replyCraftPanel) return;

  const textarea = replyCraftPanel.querySelector(".replycraft-textarea");
  const text = textarea.value || "";

  if (!text.trim()) {
    alert("No reply to insert. Generate one first or type your own.");
    return;
  }

  const composeBox = document.querySelector(
    '[role="textbox"][g_editable="true"]'
  );

  if (!composeBox) {
    console.error("Compose box not found");
    alert("Could not find the compose box to insert the reply.");
    return;
  }

  composeBox.focus();
  document.execCommand("insertText", false, text);
}


function injectButton() {
  const existingButton = document.querySelector(".ai-reply-button");
  if (existingButton) {
    return; 
  }

  const toolbar = findComposeToolbar();
  if (!toolbar) {
    console.log("Compose/Reply toolbar not found yet.");
    return;
  }

  console.log("Toolbar found, injecting AI Reply button");
  const button = createAIButton();

  
  button.addEventListener("click", () => {
    showReplyCraftPanel();
  });

  toolbar.insertBefore(button, toolbar.firstChild);
}


const observer = new MutationObserver((mutations) => {
  for (const mutation of mutations) {
    const addedNodes = Array.from(mutation.addedNodes);
    const hasComposeElements = addedNodes.some((node) => {
      if (node.nodeType !== Node.ELEMENT_NODE) return false;
      return (
        node.matches(".aDh, .btC, [role='dialog']") ||
        node.querySelector?.(".aDh, .btC, [role='dialog']")
      );
    });

    if (hasComposeElements) {
      console.log("Compose / Reply window detected");
      setTimeout(injectButton, 500);
    }
  }
});

observer.observe(document.body, {
  childList: true,
  subtree: true,
});

setTimeout(injectButton, 2000);
