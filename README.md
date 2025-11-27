# ReplyCraft – AI Email Reply Assistant

ReplyCraft is an end-to-end AI email assistant that:

- Reads an **email thread** (multiple messages, with sender/recipient)
- Generates a **context-aware reply** using an LLM (Gemini)
- Stores the entire conversation and reply in **PostgreSQL**
- Can be used from a **React web app** or directly inside **Gmail via a Chrome extension**

This project was built for the **CIMBA Winter Internship Program 2026 – Problem 8** and extends the requirements with:
- Full database persistence
- A polished web UI
- A Gmail Chrome extension (ReplyCraft)

---

## 🔧 Tech Stack

**Frontend**
- React + Vite
- Material UI

**Backend**
- Java 21
- Spring Boot 4
- Spring Web MVC + WebFlux (WebClient)
- Spring Data JPA

**Database**
- PostgreSQL

**AI**
- Gemini API (or any compatible `generateContent` API endpoint)

**Browser Integration**
- Chrome Extension (content script + DOM integration with Gmail)

---

## 📁 Repository Structure

```text
.
├── email-aiassistant-react   # React web app (frontend)
├── email-aiassistant-sb      # Spring Boot backend (REST API + DB + LLM)
├── email-ext                 # Chrome extension (ReplyCraft for Gmail)
└── .gitignore
