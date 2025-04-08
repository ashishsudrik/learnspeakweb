import React, { useState, useEffect, useRef } from 'react';
import { Send, Mic, Phone, MoreVertical, Bot, CheckCircle2, AlertCircle } from 'lucide-react';
import "./ChatWithAi.css";
const ChatWithAi=()=> {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const recognitionRef = useRef(null);

  useEffect(() => {
    if (!("SpeechRecognition" in window || "webkitSpeechRecognition" in window)) {
      console.error("Speech recognition is not supported in this browser.");
      return;
    }

    recognitionRef.current = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
    recognitionRef.current.continuous = false;
    recognitionRef.current.interimResults = false;
    recognitionRef.current.lang = "en-US";

    recognitionRef.current.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setNewMessage(prev => prev + " " + transcript);
    };

    recognitionRef.current.onerror = (event) => {
      console.error("Speech recognition error:", event.error);
      setIsListening(false);
    };

    recognitionRef.current.onend = () => {
      setIsListening(false);
    };
  }, []);

 
  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;

    const messageId = Math.random().toString();
    const userMessage = {
      id: messageId,
      role: 'user',
      content: newMessage,
      createdAt: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setNewMessage('');
    setLoading(true);

    await checkGrammarMisteks(userMessage.content, messageId); // Pass the messageId
    await ChatAIApi(userMessage.content);
      
  };

  const handleMicClick = () => {
    if (!recognitionRef.current) return;

    if (isListening) {
      recognitionRef.current.stop();
    } else {
      recognitionRef.current.start();
    }
    setIsListening(!isListening);
  };

    const ChatAIApi = async (userMessage) => {
        setLoading(true);

        const API_URL = "https://openrouter.ai/api/v1/chat/completions";
        const API_KEY = "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";

        if (!API_KEY) {
            console.error("API key missing for grammar check");
            return;
        }
        const systemPrompt = `You are John, an expert English teacher with 5+ years of experience teaching ESL students.
      - Keep responses conversational and engaging.
      - Limit responses to 2-3 sentences maximum.
      - Use proper punctuation to mimic real speech patterns.
      - Avoid complex grammar explanations unless necessary.
      `;

        const modelConfig = {
            id: "qwen/qwen-2.5-7b-instruct:free",
            name: "Gemini 2.0 Flash",
            provider: "OpenRouter",
            maxTokens: 50,
            temperature: 0.5,
            description: "Powerful model with strong language capabilities"
        };
        const apiMessages = [
            { role: "system", content: systemPrompt },
            ...messages.map((msg) => ({ role: msg.role, content: msg.content })),
            { role: "user", content: userMessage },
        ];

        try {
            const response = await fetch(API_URL, {
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

            const data = await response.json();
            console.log("API Response:", data);
            const botReply = data.choices[0]?.message?.content;
            if (botReply) {
                setMessages((prev) => [
                    ...prev,
                    { id: Math.random().toString(), role: "bot", content: botReply, createdAt: new Date() },
                ]);
            } else {
                console.error("No response from API");
            }
        } catch (error) {
            console.error("Error fetching AI response:", error);
        }
        setLoading(false);
    };



    const checkGrammarMisteks = async (text, messageId) => {
        const grammarSystemPrompt = `
            You are an expert English teacher. Your task is to find grammar and spelling mistakes in the user's sentence and suggest a corrected version.
            - Only return the corrected version of the sentence.
            - If the sentence is already correct, reply with: "The sentence is grammatically correct."
        `;

        const apiMessages = [
            { role: "system", content: grammarSystemPrompt },
            { role: "user", content: text },
        ];

        const API_URL = "https://openrouter.ai/api/v1/chat/completions";
        const API_KEY = "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";

        try {
            const response = await fetch(API_URL, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${API_KEY}`,
                },
                body: JSON.stringify({
                    model: "qwen/qwen-2.5-7b-instruct:free",
                    messages: apiMessages,
                    temperature: 0.5,
                    max_tokens: 1000,
                }),
            });

            const data = await response.json();
            const grammarFeedback = data.choices[0]?.message?.content;

            if (grammarFeedback) {
                setMessages((prevMessages) =>
                    prevMessages.map((msg) =>
                        msg.id === messageId
                            ? { ...msg, grammarCorrection: grammarFeedback }
                            : msg
                    )
                );
            }
        } catch (error) {
            console.error("Grammar check failed:", error);
        }
    };



  const formatTime = (date) => {
    return new Intl.DateTimeFormat('en-US', {
      hour: 'numeric',
      minute: 'numeric',
      hour12: true
    }).format(date);
  };

  const highlightChanges = (original, corrected) => {
    if (corrected === "The sentence is grammatically correct.") {
      return (
        <div className="grammar-correct flex items-center text-green-600">
          <CheckCircle2 className="w-4 h-4 mr-2" />
          {corrected}
        </div>
      );
    }
  
    const originalWords = original.split(" ");
    const correctedWords = corrected.split(" ");
  
    return (
      <div className="grammar-correction flex items-start text-red-600 space-x-2">
        <AlertCircle className="w-4 h-4 mr-2 mt-1" />
        <div className="flex flex-wrap">
          {correctedWords.map((word, index) => {
            const isChanged = !originalWords.includes(word);
            return (
              <span
                key={index}
                style={{
                  color: isChanged ? "red" : "black",
                  fontWeight: isChanged ? "bold" : "normal",
                }}
              >
                {word + " "}
              </span>
            );
          })}
        </div>
      </div>
    );
  };

    useEffect(() => {
        scrollToBottom();
      }, [messages]);
    
      const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      };
    
  return (
    <div className="app-container">
      <div className="chat-container">
        <header className="chat-header">
          <div className="header-content">
            <div className="header-left">
              <div className="avatar">
                <Bot className="avatar-icon" />
              </div>
              <div className="header-info">
                <h1>John - English Teacher </h1>
                <p>Professional English Assistant</p>
              </div>
            </div>
            <div className="header-actions">
              <button className="header-button">
                <Phone className="header-icon" />
              </button>
              <button className="header-button">
                <MoreVertical className="header-icon" />
              </button>
            </div>
          </div>
        </header>

        <div className="messages-container">
          <div className="messages-wrapper">
            {messages.map((msg) => (
              <div key={msg.id} className={`message-group ${msg.role}`}>
                <div className="message">
                  <p className="message-content">{msg.content}</p>
                  <span className="message-time">{formatTime(msg.createdAt)}</span>
                </div>
                {msg.grammarCorrection && (
                  <div className="grammar-feedback">
                    {highlightChanges(msg.content, msg.grammarCorrection)}
                  </div>
                )}
              </div>
            ))}
            {loading && (
              <div className="message-group bot">
                <div className="message">
                  <div className="typing-indicator">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        <footer className="chat-footer">
          <button
            onClick={handleMicClick}
            className={`mic-button ${isListening ? 'active' : ''}`}
          >
            <Mic className="footer-icon" />
          </button>
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder="Type your message..."
            className="message-input"
          />
          <button
            onClick={handleSendMessage}
            disabled={!newMessage.trim()}
            className="send-button"
          >
            <Send className="footer-icon" />
          </button>
        </footer>
      </div>
    </div>
  );
}

export default ChatWithAi;