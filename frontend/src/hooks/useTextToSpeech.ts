import { useState, useEffect, useRef } from 'react';

interface UseTextToSpeechReturn {
    speak: (text: string, language?: string) => void;
    stop: () => void;
    isSpeaking: boolean;
    isSupported: boolean;
    voices: SpeechSynthesisVoice[];
}

export function useTextToSpeech(): UseTextToSpeechReturn {
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [isSupported, setIsSupported] = useState(false);
    const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
    const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

    useEffect(() => {
        if ('speechSynthesis' in window) {
            setIsSupported(true);

            // Load voices
            const loadVoices = () => {
                const availableVoices = window.speechSynthesis.getVoices();
                setVoices(availableVoices);
            };

            loadVoices();

            // Chrome loads voices asynchronously
            if (window.speechSynthesis.onvoiceschanged !== undefined) {
                window.speechSynthesis.onvoiceschanged = loadVoices;
            }
        } else {
            setIsSupported(false);
        }

        return () => {
            if (window.speechSynthesis) {
                window.speechSynthesis.cancel();
            }
        };
    }, []);

    const selectVoice = (language: string): SpeechSynthesisVoice | null => {
        if (voices.length === 0) return null;

        // Language code mapping
        const langMap: { [key: string]: string[] } = {
            'en': ['en-US', 'en-GB', 'en'],
            'hi': ['hi-IN', 'hi'],
            'mr': ['mr-IN', 'mr'], // Marathi
        };

        const langCodes = langMap[language] || ['en-US'];

        // Try to find a voice matching the language
        for (const code of langCodes) {
            const voice = voices.find(v => v.lang.startsWith(code));
            if (voice) return voice;
        }

        // Fallback to default voice
        return voices[0];
    };

    const detectLanguage = (text: string): string => {
        // Simple language detection based on character sets
        const hindiPattern = /[\u0900-\u097F]/;

        if (hindiPattern.test(text)) {
            // More sophisticated check for Marathi vs Hindi
            // Marathi has some unique characters and patterns
            const marathiUniqueChars = /[\u0950\u0972]/;
            if (marathiUniqueChars.test(text)) {
                return 'mr';
            }
            return 'hi';
        }

        return 'en';
    };

    const speak = (text: string, language?: string) => {
        if (!isSupported) {
            console.warn('Text-to-speech is not supported in this browser');
            return;
        }

        // Stop any ongoing speech
        window.speechSynthesis.cancel();

        const utterance = new SpeechSynthesisUtterance(text);

        // Detect or use provided language
        const detectedLang = language || detectLanguage(text);
        const selectedVoice = selectVoice(detectedLang);

        if (selectedVoice) {
            utterance.voice = selectedVoice;
            utterance.lang = selectedVoice.lang;
        } else {
            // Fallback to language code
            utterance.lang = detectedLang === 'hi' ? 'hi-IN' : detectedLang === 'mr' ? 'mr-IN' : 'en-US';
        }

        utterance.rate = 0.9; // Slightly slower for better clarity
        utterance.pitch = 1.0;
        utterance.volume = 1.0;

        utterance.onstart = () => {
            setIsSpeaking(true);
        };

        utterance.onend = () => {
            setIsSpeaking(false);
        };

        utterance.onerror = (event) => {
            console.error('Speech synthesis error:', event);
            setIsSpeaking(false);
        };

        utteranceRef.current = utterance;
        window.speechSynthesis.speak(utterance);
    };

    const stop = () => {
        if (window.speechSynthesis) {
            window.speechSynthesis.cancel();
            setIsSpeaking(false);
        }
    };

    return {
        speak,
        stop,
        isSpeaking,
        isSupported,
        voices,
    };
}
