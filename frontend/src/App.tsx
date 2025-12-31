import React, { useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { Environment, OrbitControls } from '@react-three/drei';
import { Avatar } from './components/Avatar';
import { ChatInterface } from './components/ChatInterface';

// Simple types for Speech Recognition
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

function App() {
  const [messages, setMessages] = useState<Array<{ role: 'user' | 'ai'; content: string }>>([
    { role: 'ai', content: 'Namaste! Hello! How can I help you today?' }
  ]);
  const [isListening, setIsListening] = useState(false);
  const [recognition, setRecognition] = useState<any>(null);

  // Initialize Speech Recognition
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      // We can detect language or set it. For now, let's default to auto or mixed if browser supports, usually needs specific code.
      // Setting to 'hi-IN' for Hindi demo, but ideally we toggle.
      // recognition.lang = 'en-US'; 

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        handleSendMessage(transcript);
        setIsListening(false);
      };

      recognition.onerror = (event: any) => {
        console.error("Speech recognition error", event.error);
        setIsListening(false);
      };

      setRecognition(recognition);
    }
  }, []);

  const toggleListening = () => {
    if (recognition) {
      if (isListening) {
        recognition.stop();
        setIsListening(false);
      } else {
        recognition.start();
        setIsListening(true);
      }
    } else {
      alert("Speech recognition not supported in this browser.");
    }
  };

  const handleSendMessage = async (text: string) => {
    // Add User Message
    const newMessages = [...messages, { role: 'user', content: text } as const];
    setMessages(newMessages);

    try {
      // Prepare history for backend
      const history = newMessages.map(m => ({ role: m.role, content: m.content }));

      // Call Backend
      const response = await fetch('http://localhost:8000/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, history: history })
      });

      const data = await response.json();
      const aiResponse = data.response;

      // Add AI Message
      setMessages(prev => [...prev, { role: 'ai', content: aiResponse }]);

      // Text to Speech
      speak(aiResponse);

    } catch (error) {
      console.error("Error talking to backend:", error);
      setMessages(prev => [...prev, { role: 'ai', content: "Sorry, I'm having trouble connecting to my brain." }]);
    }
  };

  const speak = (text: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      // Attempt to select a hindi/marathi voice if text is detected as such, or let browser decide
      // For MVP, we let browser default
      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <div className="relative w-full h-screen bg-gradient-to-b from-gray-900 to-black overflow-hidden">

      {/* 3D Scene Layer */}
      <div className="absolute inset-0 z-0">
        <Canvas camera={{ position: [0, 1.5, 3], fov: 45 }}>
          <ambientLight intensity={0.5} />
          <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={1} />
          <Environment preset="sunset" />
          <Avatar
            url="https://models.readyplayer.me/64b73e5d3c8d3d5b0a3c2a1d.glb"
            animationState="Idle"
          />
          <OrbitControls enableZoom={false} enablePan={false} maxPolarAngle={Math.PI / 2} minPolarAngle={Math.PI / 2.5} />
        </Canvas>
      </div>

      {/* UI Layer */}
      <div className="absolute inset-x-0 bottom-0 z-10 p-4">
        <ChatInterface
          onSendMessage={handleSendMessage}
          messages={messages}
          isListening={isListening}
          onToggleListening={toggleListening}
        />
      </div>
    </div>
  );
}

export default App;
