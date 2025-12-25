# 🎙️ Tauri Voice-to-Text Automator

A high-performance desktop application that converts speech to text and **types it directly into any active window** (VS Code, Docs, Slack, etc.).

Built with **Tauri (Rust)** for system-level control and **React** for the UI, powered by **Deepgram Nova-2** for real-time, high-accuracy transcription.

## ✨ Features

- **🚀 Global Typing:** Dictate text directly into any application on your OS.
- **⚡ Smart Pasting:** Uses Clipboard injection + Keyboard simulation to type text instantly without lag.
- **🎯 Two Recording Modes:**
  - **Hold-to-Talk:** Great for short commands.
  - **Hands-Free Toggle:** Perfect for long dictation sessions.
- **🎹 Global Hotkey:** Toggle recording from anywhere using `Cmd+Shift+Space` (Mac) or `Ctrl+Shift+Space` (Win/Linux).
- **🔊 Audio Feedback:** Distinct sound cues for Start and Stop events.
- **📊 Real-time Visualizer:** Visual feedback ensuring your microphone is active.
- **🔒 Privacy First:** Audio is streamed securely to Deepgram; no data is stored locally.

## 🛠️ Tech Stack

- **Frontend:** React, Vite, Tailwind CSS
- **Backend:** Rust (Tauri)
- **AI Engine:** Deepgram API (Nova-2 Model)
- **System Control:** Enigo (Keyboard simulation), Arboard (Clipboard access)

---

## 🚀 Getting Started

### Prerequisites

1.  **Node.js** (v18+ recommended)
2.  **Rust** (via `rustup`)
3.  **Deepgram API Key** (Get one at [console.deepgram.com](https://console.deepgram.com))

### Installation

1.  **Clone the repository:**
    ```bash
    git clone [https://github.com/YOUR_USERNAME/tauri-voice-automator.git](https://github.com/YOUR_USERNAME/tauri-voice-automator.git)
    cd tauri-voice-automator
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Configure Environment Variables:**
    Create a `.env` file in the root directory:
    ```bash
    touch .env
    ```
    Add your API key:
    ```env
    VITE_DEEPGRAM_API_KEY=your_deepgram_api_key_here
    ```

4.  **Add Sound Files:**
    Ensure `start.mp3` and `stop.mp3` are present in the `public/` folder.

5.  **Run in Development Mode:**
    ```bash
    npm run tauri dev
    ```

---

## 🖥️ Usage Guide

### 1. Permissions (macOS)
On macOS, the app requires **Accessibility Permissions** to simulate key presses (Command+V).
- When you first run the app and try to paste, macOS will prompt you.
- Go to **System Settings > Privacy & Security > Accessibility** and allow your Terminal (if in dev mode) or the built App.

### 2. How to Use
1.  Open the app.
2.  Click into a text field in **another app** (e.g., Notepad or VS Code).
3.  **Press & Hold** the Mic button OR use the Global Shortcut (`Cmd+Shift+Space`).
4.  Speak naturally.
5.  Release the button. The text will automatically paste into your document.

---

## 📦 Building for Production

To create a standalone installer (`.dmg`, `.exe`, `.deb`):

```bash
npm run tauri build

The output will be found in `src-tauri/target/release/bundle/`.

---

## 🧩 Troubleshooting

**Issue: Text types twice (e.g., "HellHello").**
* **Fix:** The app now filters for `is_final: true` events from Deepgram before triggering the paste command.

**Issue: Paste works once, then stops.**
* **Fix:** We implemented a `thread::sleep` delay in Rust to prevent Clipboard race conditions.

**Issue: "Error: No API Key".**
* **Fix:** Ensure `.env` is in the root project folder (not inside `src`) and restart the terminal.

---

## 📜 License

Distributed under the MIT License.