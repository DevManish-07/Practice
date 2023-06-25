declare class SpeechRecognition {
    constructor();

    continuous: boolean;
    interimResults: boolean;
    lang: string;
    maxAlternatives: number;
    onaudiostart: ((this: SpeechRecognitionEvent) => any) | null;
    onsoundstart: ((this: SpeechRecognitionEvent) => any) | null;

    start(): void;
    stop(): void;
    abort(): void;
}

declare global {
    interface Window {
        SpeechRecognition: typeof SpeechRecognition;
        webkitSpeechRecognition: typeof SpeechRecognition; // For Safari compatibility
    }
}
