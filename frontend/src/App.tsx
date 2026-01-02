import { useState, useEffect } from 'react';
import { ChatInterface } from './components/ChatInterface';
import { useSpeechRecognition } from './hooks/useSpeechRecognition';
import { useTextToSpeech } from './hooks/useTextToSpeech';

type Language = 'en' | 'hi' | 'mr';

const LANGUAGE_CONFIG = {
  en: { code: 'en-US', name: 'English', flag: '🇬🇧' },
  hi: { code: 'hi-IN', name: 'हिंदी', flag: '🇮🇳' },
  mr: { code: 'mr-IN', name: 'मराठी', flag: '🇮🇳' },
};

function App() {
  const [messages, setMessages] = useState<Array<{ role: 'user' | 'ai'; content: string }>>([
    { role: 'ai', content: 'Namaste! नमस्ते! Hello! How can I help you today?' }
  ]);
  const [selectedLanguage, setSelectedLanguage] = useState<Language>('en');
  const [isProcessing, setIsProcessing] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'disconnected' | 'checking'>('checking');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const speechRecognition = useSpeechRecognition();
  const textToSpeech = useTextToSpeech();

  // Check backend connection on mount
  useEffect(() => {
    checkBackendConnection();
  }, []);

  // Handle speech recognition transcript
  useEffect(() => {
    if (speechRecognition.transcript) {
      handleSendMessage(speechRecognition.transcript);
    }
  }, [speechRecognition.transcript]);

  // Handle speech recognition errors
  useEffect(() => {
    if (speechRecognition.error) {
      setErrorMessage(speechRecognition.error);
      setTimeout(() => setErrorMessage(null), 5000);
    }
  }, [speechRecognition.error]);

  const checkBackendConnection = async () => {
    try {
      const response = await fetch('http://localhost:8000/', {
        method: 'GET',
      });
      if (response.ok) {
        setConnectionStatus('connected');
      } else {
        setConnectionStatus('disconnected');
      }
    } catch (error) {
      setConnectionStatus('disconnected');
    }
  };

  const toggleListening = () => {
    if (speechRecognition.isListening) {
      speechRecognition.stopListening();
    } else {
      const langCode = LANGUAGE_CONFIG[selectedLanguage].code;
      speechRecognition.startListening(langCode);
    }
  };

  const handleSendMessage = async (text: string) => {
    if (!text.trim()) return;

    // Stop any ongoing speech
    textToSpeech.stop();

    // Add User Message
    const newMessages = [...messages, { role: 'user', content: text } as const];
    setMessages(newMessages);
    setIsProcessing(true);
    setErrorMessage(null);

    try {
      // Prepare history for backend
      const history = newMessages.map(m => ({ role: m.role, content: m.content }));

      // Call Backend
      const response = await fetch('http://localhost:8000/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, history: history })
      });

      if (!response.ok) {
        throw new Error(`Backend error: ${response.status}`);
      }

      const data = await response.json();
      const aiResponse = data.response;

      // Add AI Message
      setMessages(prev => [...prev, { role: 'ai', content: aiResponse }]);

      // Text to Speech - speak the response
      textToSpeech.speak(aiResponse, selectedLanguage);

      setConnectionStatus('connected');
    } catch (error) {
      console.error("Error talking to backend:", error);
      const errorMsg = "Sorry, I'm having trouble connecting to my brain. Please make sure the backend server is running.";
      setMessages(prev => [...prev, { role: 'ai', content: errorMsg }]);
      setErrorMessage(errorMsg);
      setConnectionStatus('disconnected');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleLanguageChange = (lang: Language) => {
    setSelectedLanguage(lang);
    // Stop any ongoing speech or listening
    textToSpeech.stop();
    if (speechRecognition.isListening) {
      speechRecognition.stopListening();
    }
  };

  return (
    <div className="relative w-full h-screen bg-gradient-to-b from-gray-900 to-black overflow-hidden">

      {/* Connection Status Indicator */}
      <div className="absolute top-4 right-4 z-20 flex items-center gap-2 bg-black/50 backdrop-blur-md px-4 py-2 rounded-full">
        <div className={`w-3 h-3 rounded-full ${connectionStatus === 'connected' ? 'bg-green-500' :
          connectionStatus === 'disconnected' ? 'bg-red-500' :
            'bg-yellow-500 animate-pulse'
          }`} />
        <span className="text-white text-sm">
          {connectionStatus === 'connected' ? 'Connected' :
            connectionStatus === 'disconnected' ? 'Disconnected' :
              'Checking...'}
        </span>
      </div>

      {/* Language Selector */}
      <div className="absolute top-4 left-4 z-20 flex gap-2">
        {(Object.keys(LANGUAGE_CONFIG) as Language[]).map((lang) => (
          <button
            key={lang}
            onClick={() => handleLanguageChange(lang)}
            className={`px-4 py-2 rounded-full backdrop-blur-md transition-all ${selectedLanguage === lang
              ? 'bg-blue-600 text-white'
              : 'bg-black/50 text-gray-300 hover:bg-black/70'
              }`}
            title={LANGUAGE_CONFIG[lang].name}
          >
            {LANGUAGE_CONFIG[lang].flag} {LANGUAGE_CONFIG[lang].name}
          </button>
        ))}
      </div>

      {/* Error Message */}
      {errorMessage && (
        <div className="absolute top-20 left-1/2 transform -translate-x-1/2 z-20 bg-red-500/90 backdrop-blur-md px-6 py-3 rounded-lg text-white max-w-md text-center">
          {errorMessage}
        </div>
      )}

      {/* Speaking Indicator */}
      {textToSpeech.isSpeaking && (
        <div className="absolute top-20 left-1/2 transform -translate-x-1/2 z-20 bg-blue-500/90 backdrop-blur-md px-6 py-3 rounded-lg text-white flex items-center gap-2">
          <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
          AI is speaking...
        </div>
      )}

      {/* Title/Logo Area */}
      <div className="absolute top-1/3 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-0 text-center">
        <h1 className="text-6xl font-bold text-white/10 mb-4">🤖</h1>
        <h2 className="text-4xl font-bold text-white/20">AI Companion</h2>
        <p className="text-white/30 mt-2">Speak in English, Hindi, or Marathi</p>
      </div>

      {/* UI Layer */}
      <div className="absolute inset-x-0 bottom-0 z-10 p-4">
        <ChatInterface
          onSendMessage={handleSendMessage}
          messages={messages}
          isListening={speechRecognition.isListening}
          onToggleListening={toggleListening}
          isProcessing={isProcessing}
          isSpeaking={textToSpeech.isSpeaking}
          speechSupported={speechRecognition.isSupported}
        />
      </div>
    </div>
  );
}

export default App;
