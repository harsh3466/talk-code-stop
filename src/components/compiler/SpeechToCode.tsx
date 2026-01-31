import { useState, useCallback, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Mic, MicOff, Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";
import type { SpeechRecognition } from "@/types/speech.d";

interface SpeechToCodeProps {
  language: string;
  onCodeGenerated: (code: string) => void;
  isGenerating: boolean;
  setIsGenerating: (value: boolean) => void;
}

export function SpeechToCode({
  language,
  onCodeGenerated,
  isGenerating,
  setIsGenerating,
}: SpeechToCodeProps) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  const isSpeechSupported = typeof window !== "undefined" && 
    ("webkitSpeechRecognition" in window || "SpeechRecognition" in window);

  useEffect(() => {
    // Initialize speech recognition
    if (isSpeechSupported) {
      const SpeechRecognitionClass = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognitionClass) {
        recognitionRef.current = new SpeechRecognitionClass();
        recognitionRef.current.continuous = true;
        recognitionRef.current.interimResults = true;
        recognitionRef.current.lang = "en-US";

        recognitionRef.current.onresult = (event) => {
          let finalTranscript = "";
          for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcriptText = event.results[i][0].transcript;
            if (event.results[i].isFinal) {
              finalTranscript += transcriptText;
            }
          }
          if (finalTranscript) {
            setTranscript((prev) => (prev + " " + finalTranscript).trim());
          }
        };

        recognitionRef.current.onerror = (event) => {
          console.error("Speech recognition error:", event.error);
          setIsListening(false);
          toast.error("Speech recognition error. Please try again.");
        };

        recognitionRef.current.onend = () => {
          setIsListening(false);
        };
      }
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [isSpeechSupported]);

  const toggleListening = useCallback(() => {
    if (!recognitionRef.current) {
      toast.error("Speech recognition is not supported in this browser.");
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      setTranscript("");
      recognitionRef.current.start();
      setIsListening(true);
      toast.info("Listening... Describe what code you want to create.");
    }
  }, [isListening]);

  const generateCode = useCallback(async () => {
    if (!transcript.trim()) {
      toast.error("Please speak a command first.");
      return;
    }

    setIsGenerating(true);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-code`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({
            prompt: transcript.trim(),
            language,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        if (response.status === 429) {
          toast.error("Rate limit exceeded. Please try again later.");
          return;
        }
        if (response.status === 402) {
          toast.error("Usage limit reached. Please add credits.");
          return;
        }
        throw new Error(errorData.error || "Failed to generate code");
      }

      const data = await response.json();
      onCodeGenerated(data.code);
      setTranscript("");
      toast.success("Code generated successfully!");
    } catch (error) {
      console.error("Error generating code:", error);
      toast.error("Failed to generate code. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  }, [transcript, language, onCodeGenerated, setIsGenerating]);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-3">
        <Button
          onClick={toggleListening}
          variant={isListening ? "destructive" : "secondary"}
          size="lg"
          className={`gap-2 ${isListening ? "recording-pulse" : ""}`}
          disabled={!isSpeechSupported}
        >
          {isListening ? (
            <>
              <MicOff className="h-5 w-5" />
              Stop Recording
            </>
          ) : (
            <>
              <Mic className="h-5 w-5" />
              Speak to Code
            </>
          )}
        </Button>

        <Button
          onClick={generateCode}
          disabled={!transcript.trim() || isGenerating}
          className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
          size="lg"
        >
          {isGenerating ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Sparkles className="h-5 w-5" />
              Generate Code
            </>
          )}
        </Button>
      </div>

      {transcript && (
        <div className="glass rounded-lg p-4 slide-in-bottom">
          <p className="text-sm text-muted-foreground mb-1">Your speech:</p>
          <p className="text-foreground">{transcript}</p>
        </div>
      )}

      {!isSpeechSupported && (
        <p className="text-sm text-destructive">
          Speech recognition is not supported in this browser. Please use Chrome or Edge.
        </p>
      )}
    </div>
  );
}
