import React, { useState, useEffect, useRef } from 'react';

interface ChatInterfaceProps {
    onSendMessage: (message: string) => void;
    messages: Array<{ role: 'user' | 'ai'; content: string }>;
    isListening: boolean;
    onToggleListening: () => void;
}

export function ChatInterface({ onSendMessage, messages, isListening, onToggleListening }: ChatInterfaceProps) {
    const [input, setInput] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(scrollToBottom, [messages]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim()) return;
        onSendMessage(input);
        setInput('');
    };

    return (
        <div className="flex flex-col h-full pointer-events-auto max-w-md mx-auto w-full bg-white/10 backdrop-blur-md rounded-t-2xl sm:rounded-2xl border border-white/20 shadow-xl overflow-hidden text-white">

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 h-[60vh] sm:h-[500px]">
                {messages.map((msg, idx) => (
                    <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[80%] rounded-2xl px-4 py-2 ${msg.role === 'user'
                                ? 'bg-blue-600 text-white rounded-br-none'
                                : 'bg-gray-800/80 text-gray-100 rounded-bl-none'
                            }`}>
                            {msg.content}
                        </div>
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 bg-black/20">
                <form onSubmit={handleSubmit} className="flex gap-2">
                    <button
                        type="button"
                        onClick={onToggleListening}
                        className={`p-3 rounded-full transition-colors ${isListening ? 'bg-red-500 animate-pulse' : 'bg-gray-700 hover:bg-gray-600'
                            }`}
                        title={isListening ? "Stop Listening" : "Start Listening"}
                    >
                        🎤
                    </button>

                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Type or speak..."
                        className="flex-1 bg-gray-900/50 border border-gray-600 rounded-full px-4 text-white focus:outline-none focus:border-blue-500 placeholder-gray-400"
                    />
                    <button
                        type="submit"
                        className="p-3 bg-blue-600 rounded-full hover:bg-blue-500 transition-colors"
                    >
                        ➤
                    </button>
                </form>
            </div>
        </div>
    );
}
