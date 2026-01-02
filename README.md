# AI Companion with Voice Interaction 🎤🤖

An intelligent AI companion with 3D avatar, voice interaction, and multilingual support (English, Hindi, Marathi).

## Features ✨

- **🎤 Voice Input**: Speech recognition in English, Hindi, and Marathi
- **🔊 Voice Output**: Text-to-speech responses with automatic language detection
- **🌐 Multilingual**: Full support for English, Hindi (हिंदी), and Marathi (मराठी)
- **🤖 3D Avatar**: Interactive 3D character that responds to your voice
- **💬 Chat Interface**: Clean, modern chat UI with real-time feedback
- **🔍 Web Search**: AI can search the internet for information
- **💾 Memory**: Conversation history and context retention

## Tech Stack 🛠️

### Frontend
- React + TypeScript
- Three.js (3D rendering)
- Tailwind CSS
- Web Speech API (Speech Recognition & Synthesis)
- Vite

### Backend
- FastAPI (Python)
- LangChain
- Google Gemini AI
- ChromaDB (Vector storage)
- DuckDuckGo Search

## Setup Instructions 🚀

### Prerequisites
- Node.js (v16+)
- Python (3.9+)
- Google API Key for Gemini

### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Create virtual environment:
```bash
python -m venv venv
```

3. Activate virtual environment:
```bash
# Windows
venv\Scripts\activate

# macOS/Linux
source venv/bin/activate
```

4. Install dependencies:
```bash
pip install -r requirements.txt
```

5. Create `.env` file with your Google API key:
```env
GOOGLE_API_KEY=your_google_api_key_here
```

6. Start the backend server:
```bash
uvicorn main:app --reload
```

The backend will run on `http://localhost:8000`

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

The frontend will run on `http://localhost:5173`

## Usage 📱

1. **Start Both Servers**: Make sure both backend and frontend are running
2. **Open Browser**: Navigate to `http://localhost:5173`
3. **Select Language**: Choose English, Hindi (हिंदी), or Marathi (मराठी) from the top-left buttons
4. **Grant Microphone Permission**: Allow microphone access when prompted
5. **Start Talking**: Click the 🎤 microphone button and speak, or type your message
6. **Listen to Response**: The AI will respond with both text and voice

## Language Support 🌍

### English 🇬🇧
- Speech recognition: `en-US`
- Text-to-speech: English voices

### Hindi 🇮🇳
- Speech recognition: `hi-IN`
- Text-to-speech: Hindi voices
- Example: "नमस्ते, आप कैसे हैं?"

### Marathi 🇮🇳
- Speech recognition: `mr-IN`
- Text-to-speech: Marathi voices
- Example: "नमस्कार, तुम्ही कसे आहात?"

## Features Explained 🎯

### Connection Status
- **Green**: Connected to backend
- **Red**: Disconnected from backend
- **Yellow**: Checking connection

### Visual Feedback
- **Listening**: Red pulsing microphone button
- **Processing**: Animated thinking indicator
- **Speaking**: Blue indicator showing AI is speaking

### Error Handling
- Microphone permission errors
- Network connection errors
- Speech recognition errors
- Backend errors

## Browser Compatibility 🌐

**Recommended Browsers:**
- Google Chrome (Best support)
- Microsoft Edge
- Safari (macOS/iOS)

**Note**: Speech recognition requires a Chromium-based browser or Safari. Firefox has limited support.

## Troubleshooting 🔧

### Microphone Not Working
1. Check browser permissions
2. Ensure you're using HTTPS or localhost
3. Try a different browser (Chrome recommended)

### Backend Connection Failed
1. Verify backend is running on port 8000
2. Check `.env` file has valid Google API key
3. Check terminal for error messages

### Speech Recognition Not Working
1. Ensure microphone permissions are granted
2. Use Chrome or Edge browser
3. Check if your language is selected correctly

### No Voice Output
1. Check system volume
2. Verify browser audio permissions
3. Try different browser

## Project Structure 📁

```
AI/
├── backend/
│   ├── main.py           # FastAPI server
│   ├── agent.py          # LangChain agent with Gemini
│   ├── memory.py         # Memory management
│   ├── requirements.txt  # Python dependencies
│   └── .env             # Environment variables
├── frontend/
│   ├── src/
│   │   ├── App.tsx                      # Main app component
│   │   ├── components/
│   │   │   ├── Avatar.tsx               # 3D avatar component
│   │   │   └── ChatInterface.tsx        # Chat UI component
│   │   └── hooks/
│   │       ├── useSpeechRecognition.ts  # Speech input hook
│   │       └── useTextToSpeech.ts       # Speech output hook
│   ├── package.json
│   └── vite.config.ts
└── README.md
```

## API Endpoints 📡

### GET `/`
Health check endpoint
```json
{
  "message": "AI Companion Backend is running!",
  "status": "healthy"
}
```

### POST `/chat`
Send message to AI
```json
{
  "message": "Hello!",
  "history": [
    {"role": "user", "content": "Hi"},
    {"role": "ai", "content": "Hello! How can I help?"}
  ]
}
```

## Contributing 🤝

Feel free to submit issues and enhancement requests!

## License 📄

MIT License

## Credits 👏

- 3D Avatar: Ready Player Me
- AI Model: Google Gemini
- Speech APIs: Web Speech API
