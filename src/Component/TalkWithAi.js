import React, { useState, useEffect, useRef } from "react";
import {
  ArrowLeft,
  Settings,
  Sparkles,
  Subtitles,
  Play,
  FastForward,
  X,
} from "lucide-react";
import "./TalkWithAi.css";
const API_KEY = "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";
const MODEL_ID = "google/gemini-2.0-flash-001";

const API_URL = "https://openrouter.ai/api/v1/chat/completions";
const TalkWithAi = () => {
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  const responseRef = useRef(null);

  const handleMic = () => {
    setHasInteracted(true);

    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("Speech Recognition is not supported in this browser.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => setListening(true);
    recognition.onend = () => setListening(false);
    recognition.onerror = (event) => {
      setListening(false);
      setTranscript("Speech recognition error: " + event.error);
    };

    recognition.onresult = (event) => {
      const text = event.results[0][0].transcript;
      setTranscript(text);
      sendToAi(text);
    };
    recognition.start();
  };

  const sendToAi = async (message) => {
    try {
      setLoading(true);
      setResponse("");
      const SystemPrompt = `
You are John, a friendly and knowledgeable AI who loves having interesting conversations with users.
Engage naturally, ask follow-up questions, and try to keep the conversation going.
Respond in a helpful and conversational tone, like you're chatting with a friend.
Limit responses to 2–3 sentences unless the user asks for more detail.
`;

      const apiMessages = [
        { role: "system", content: SystemPrompt },
        { role: "user", content: message },
      ];
      const modelConfig = {
        id: MODEL_ID,
        name: "Gemini 2.0 Flash",
        provider: "OpenRouter",
        maxTokens: 1000,
        temperature: 0.5,
        description: "Powerful model with strong language capabilities"
      };

      const res = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${API_KEY}`,
        },
        body: JSON.stringify({
          model: modelConfig.id,
          messages: apiMessages,
          temperature: modelConfig.temperature,
          max_tokens: modelConfig.maxTokens,
        }),
      });
      const data = await res.json();
      const aiText =
        data.choices?.[0]?.message?.content ||
        data.candidates?.[0]?.content?.parts?.[0]?.text ||
        "No response";

      setResponse(aiText);
      if (window.ReactNativeWebView && window.ReactNativeWebView.postMessage) {
        window.ReactNativeWebView.postMessage(
          JSON.stringify({
            type: "AI_RESPONSE",
            data: aiText,
          })
        );
      }
      // return aiText;
      
    } catch (error) {
      console.error("Error:", error);
      setResponse("Error getting response from AI.");
    } finally {
      setLoading(false);
    }
  };

  const speakText = (text) => {
    
    if (!window.speechSynthesis) {
      console.warn("Speech synthesis not supported in this browser.");
      return;
    }
  
    // Cancel any ongoing speech
    window.speechSynthesis.cancel();
  
    // Get available voices
    const voices = window.speechSynthesis.getVoices();
  
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-US";
    utterance.pitch = 1;
    utterance.rate = 1;
    utterance.volume = 1;
  
    // Optional: set a specific voice
    if (voices.length > 0) {
      const selectedVoice = voices.find((voice) => voice.lang === "en-US");
      if (selectedVoice) utterance.voice = selectedVoice;
    }
    window.speechSynthesis.speak(utterance);
  };
  
  useEffect(() => {
    if (hasInteracted && response && !loading) {
       speakText(response);
    }
  }, [response, loading, hasInteracted]);

  useEffect(() => {
    responseRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [response]);


  return (
    <div className="container">
      <header>
        <button className="back-button">
          <ArrowLeft size={24} />
        </button>
        <h1>Talk about anything</h1>
        <button className="settings-button">
          <Settings size={24} />
        </button>
      </header>

    
        <div className="main_content">
        <div className="avatar user-avatar">
          <img
            src="https://placehold.co/100x100/grey/white?text=User"
            alt="User Avatar"
          />
        </div>
        {
          transcript &&
            <p className="user-transcript">{transcript}</p>
        }
        

        <div className="avatar bot-avatar">
          <img
            src="https://placehold.co/100x100/grey/white?text=Bot"
            alt="Bot Avatar"
          />
        </div>
       {(loading || response) && (
  <p className="bot-response" ref={responseRef}>
    {loading ? "Thinking..." : response}
  </p>
)}

        <button className="continue-button" onClick={handleMic}>
          {listening ? "Listening..." : "Press to continue"}
        </button>

        {response && (
          <button className="speak-again-button" onClick={() => speakText(response)}>
            🔊 Speak Again
          </button>
        )}
        </div>
      

      <footer>
        <button className="control-button hint">
          <Sparkles size={20} />
          <span className="label">Hint</span>
        </button>
        <button className="control-button continue">
          <FastForward size={20} />
          <span className="label">Continue</span>
        </button>
        <button className="control-button end">
          <X size={20} />
          <span className="label">End</span>
        </button>
      </footer>
    </div>
  );
};

export default TalkWithAi;



