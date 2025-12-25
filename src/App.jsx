import { useEffect, useState } from "react";
import { useVoiceToText } from "./hooks/useVoiceToText";
import AudioVisualizer from "./components/AudioVisualizer";
import "./App.css";

function App() {
  const { isRecording, connectionStatus, realtimeText, audioStream, startRecording, stopRecording } = useVoiceToText();
  const [isToggleMode, setIsToggleMode] = useState(false);

  // Global Mouse Up (For Push-to-Talk)
  useEffect(() => {
    const handleGlobalMouseUp = () => {
       if (isToggleMode) return; 
       if (isRecording) {
         stopRecording(); // 👇 Just call stop. The hook handles the copy & paste!
       }
    };
    window.addEventListener("mouseup", handleGlobalMouseUp);
    return () => window.removeEventListener("mouseup", handleGlobalMouseUp);
  }, [isRecording, isToggleMode, stopRecording]); 

  // Button Handlers
  const handleMouseDown = () => {
    if (isToggleMode) return; 
    startRecording();
  };

  const handleClick = () => {
    if (!isToggleMode) return; 
    
    if (isRecording) {
      stopRecording(); 
    } else {
      startRecording();
    }
  };

  const getStatus = () => {
    if (isRecording) return { text: isToggleMode ? "LISTENING (TAP TO STOP)" : "LISTENING...", class: "blue" };
    if (connectionStatus === "Connecting...") return { text: "CONNECTING...", class: "blue" };
    return { text: isToggleMode ? "CLICK TO RECORD" : "HOLD TO RECORD", class: "" };
  };

  const status = getStatus();

  return (
    <div className="app-container">
      <div className={`main-interface ${isRecording ? "active-border" : ""}`}>
        
        {/* MAIN MIC BUTTON */}
        <button 
          className={`action-btn ${isRecording ? "recording" : ""}`}
          onMouseDown={handleMouseDown}
          onClick={handleClick}
        >
          {isRecording ? (
             <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="6" width="12" height="12" rx="2" /></svg>
          ) : (
             <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg>
          )}
        </button>

        {/* TEXT AREA */}
        <div className="content-area">
           <div className={`status-line ${status.class}`}>
              {status.text}
           </div>
           <div className={`transcript-text ${!realtimeText ? "placeholder" : ""}`}>
             {realtimeText || "Start speaking..."}
           </div>
        </div>

        {/* RIGHT SECTION */}
        <div className="right-section">
           {isRecording && audioStream ? (
               <div style={{ width: '40px', height: '24px' }}>
                  <AudioVisualizer stream={audioStream} />
               </div>
           ) : (
               <button 
                 className={`mode-toggle-btn ${isToggleMode ? "active" : ""}`}
                 onClick={() => setIsToggleMode(!isToggleMode)}
                 title={isToggleMode ? "Switch to Push-to-Talk" : "Switch to Hands-Free"}
               >
                 {isToggleMode ? (
                   <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                 ) : (
                   <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 11V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v0"/><path d="M14 10V4a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v2"/><path d="M10 10.5V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v8"/><path d="M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15"/></svg>
                 )}
               </button>
           )}
        </div>

      </div>
    </div>
  );
}

export default App;