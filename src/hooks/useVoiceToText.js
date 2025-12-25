import { useState, useRef, useCallback, useEffect } from "react";
import { createClient } from "@deepgram/sdk";
import { invoke } from "@tauri-apps/api/core"; 
import { listen } from "@tauri-apps/api/event";

const DEEPGRAM_KEY = import.meta.env.VITE_DEEPGRAM_API_KEY;

export const useVoiceToText = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [realtimeText, setRealtimeText] = useState(""); 
  const [connectionStatus, setConnectionStatus] = useState("Ready");
  const [audioStream, setAudioStream] = useState(null); 
  
  const mediaRecorderRef = useRef(null);
  const deepgramConnectionRef = useRef(null);
  const committedTextRef = useRef(""); 
  const currentInterimRef = useRef(""); 
  const isButtonPressedRef = useRef(false);
  const isRecordingRef = useRef(false);

  // Sync ref with state
  useEffect(() => {
    isRecordingRef.current = isRecording;
  }, [isRecording]);

  // 🔊 SOUND HELPER
  const playSound = (type) => {
    // Looks for files in the public folder
    const file = type === "start" ? "/start.mp3" : "/stop.mp3";
    const audio = new Audio(file);
    audio.volume = 0.5; 
    audio.play().catch(e => console.error("Error playing sound:", e));
  };

  const stopRecording = useCallback(async () => {
    playSound("stop"); // 🔊 Beep

    isButtonPressedRef.current = false;

    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
    }

    if (deepgramConnectionRef.current) {
      deepgramConnectionRef.current.finish();
      deepgramConnectionRef.current = null;
    }

    setIsRecording(false);
    setAudioStream(null); 
    setConnectionStatus("Ready");
    
    // Clear screen buffers
    setRealtimeText("");
    committedTextRef.current = "";
    currentInterimRef.current = "";

    return "";
  }, []);

  const startRecording = useCallback(async () => {
    playSound("start"); // 🔊 Beep

    isButtonPressedRef.current = true;
    setRealtimeText("");
    committedTextRef.current = "";
    currentInterimRef.current = "";

    try {
      if (!DEEPGRAM_KEY) {
        setConnectionStatus("Error: No API Key");
        return;
      }

      setConnectionStatus("Connecting...");
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setAudioStream(stream); 
      
      if (!isButtonPressedRef.current) {
         setConnectionStatus("Aborted");
         stream.getTracks().forEach(track => track.stop());
         return;
      }

      const deepgram = createClient(DEEPGRAM_KEY);
      const connection = deepgram.listen.live({
        model: "nova-2",
        language: "en-US",
        smart_format: true,
        interim_results: true, 
      });

      connection.on("open", () => {
        if (!isButtonPressedRef.current) {
            connection.finish();
            stream.getTracks().forEach(track => track.stop());
            setConnectionStatus("Ready");
            return;
        }

        setIsRecording(true);
        setConnectionStatus("Listening"); 

        const mediaRecorder = new MediaRecorder(stream);
        mediaRecorderRef.current = mediaRecorder;
        mediaRecorder.start(250); 

        mediaRecorder.ondataavailable = (event) => {
          if (event.data.size > 0 && connection.getReadyState() === 1) {
            connection.send(event.data);
          }
        };
      });

      connection.on("Results", (data) => {
        const result = data.channel.alternatives[0];
        if (result && result.transcript) {
            
            if (data.is_final) {
                console.log("Final result, pasting:", result.transcript);
                
                // 1. Paste to OS
                invoke("paste_text", { text: result.transcript + " " })
                    .catch(e => console.error("Paste error:", e));
                
                // 2. Clear buffers so it doesn't duplicate on screen
                committedTextRef.current = ""; 
                currentInterimRef.current = ""; 

            } else {
                currentInterimRef.current = result.transcript;
            }
            
            setRealtimeText((committedTextRef.current + " " + currentInterimRef.current).trim());
        }
      });

      connection.on("error", (err) => {
          console.error("Deepgram Error:", err);
          setConnectionStatus("API Error");
      });

      deepgramConnectionRef.current = connection;

    } catch (error) {
      console.error("Error starting:", error);
      setConnectionStatus("Mic Error");
      setIsRecording(false);
      isButtonPressedRef.current = false;
    }
  }, [stopRecording]);

  useEffect(() => {
    let unlisten;
    const setupListener = async () => {
      unlisten = await listen("toggle-recording", (event) => { 
        console.log("Shortcut triggered via Rust!");
        if (isRecordingRef.current) stopRecording();
        else startRecording();
      });
    };
    setupListener();
    return () => { if (unlisten) unlisten(); };
  }, [startRecording, stopRecording]);

  return {
    isRecording,
    connectionStatus, 
    realtimeText,
    audioStream, 
    startRecording,
    stopRecording
  };
};