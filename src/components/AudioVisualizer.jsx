import { useEffect, useRef } from "react";

const AudioVisualizer = ({ stream }) => {
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const audioContextRef = useRef(null);

  // THEME: Minimal Monochrome (Matches your Dark UI)
 // THEME: PortXNect Teal
const BARS = [
    { color: "#3b82f6" }, // Blue
    { color: "#3b82f6" },
    { color: "#60a5fa" }, // Lighter Blue
    { color: "#60a5fa" },
  ];
  
  // Also set width={40} and height={30} in the return statement to fit the circle

  useEffect(() => {
    if (!stream || !canvasRef.current) return;

    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    if (audioContext.state === 'suspended') audioContext.resume();

    const analyser = audioContext.createAnalyser();
    const source = audioContext.createMediaStreamSource(stream);

    analyser.fftSize = 256; 
    analyser.smoothingTimeConstant = 0.6; // Very smooth movement
    source.connect(analyser);

    audioContextRef.current = audioContext;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const draw = () => {
      if (!canvas) return;
      animationRef.current = requestAnimationFrame(draw);
      analyser.getByteFrequencyData(dataArray);

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const width = canvas.width;
      const height = canvas.height;
      
      // MINIMAL SIZING
      const barWidth = 6;  // Very thin, elegant bars
      const gap = 6;       // Tight spacing
      const totalWidth = (barWidth * 4) + (gap * 3);
      const startX = (width - totalWidth) / 2;

      // Split frequency data
      const segmentSize = Math.floor(bufferLength / 4);

      BARS.forEach((bar, index) => {
        let sum = 0;
        for (let i = index * segmentSize; i < (index + 1) * segmentSize; i++) {
            sum += dataArray[i];
        }
        const average = sum / segmentSize;

        // Subtle movement (Max height 24px)
        let barHeight = Math.max(6, (average / 255) * 30); 
        
        const x = startX + (index * (barWidth + gap));
        const y = (height - barHeight) / 2; 

        ctx.fillStyle = bar.color;
        
        ctx.beginPath();
        ctx.roundRect(x, y, barWidth, barHeight, 50); // Fully rounded pills
        ctx.fill();
      });
    };

    draw();

    return () => {
      cancelAnimationFrame(animationRef.current);
      if (audioContext.state !== "closed") audioContext.close();
    };
  }, [stream]);

  if (!stream) return null;

  return (
    <canvas 
      ref={canvasRef} 
      width={40} // Much smaller width
      height={20} // Much smaller height
      style={{ display: 'block' }} 
    />
  );
};

export default AudioVisualizer;