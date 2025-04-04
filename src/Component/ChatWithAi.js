import React, { useState, useEffect, useRef } from "react";
import { TextField, IconButton, Paper, List, ListItem, ListItemText, Avatar } from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import MicIcon from "@mui/icons-material/Mic";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import CallIcon from "@mui/icons-material/Call";
import moment from "moment";
import "./ChatWithAi.css";

const ChatWithAi = () => {
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState("");
    const [isListening, setIsListening] = useState(false);
    const recognitionRef = useRef(null);
    const [loading, setLoading] = useState(false);

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
            setNewMessage((prev) => prev + " " + transcript);
        };

        recognitionRef.current.onerror = (event) => {
            console.error("Speech recognition error:", event.error);
            setIsListening(false);
        };

        recognitionRef.current.onend = () => {
            setIsListening(false);
        };
    }, []);

    const handleSendMessage = () => {
        if (!newMessage.trim()) return;

        const userMessage = {
            id: Math.random().toString(),
            role: "user",
            content: newMessage,
            createdAt: new Date(),
        };

        setMessages((prev) => [...prev, userMessage]);
        setNewMessage("");

        // Call AI API for response
        ChatAIApi(userMessage.content);
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


        const systemPrompt = `You are John, an expert English teacher with 5+ years of experience teaching ESL students.
      - Keep responses conversational and engaging.
      - Limit responses to 2-3 sentences maximum.
      - Use proper punctuation to mimic real speech patterns.
      - Avoid complex grammar explanations unless necessary.
      `;

        const modelConfig = {
            id: "openchat/openchat-7b:free",
            name: "Gemini 2.0 Flash",
            provider: "OpenRouter",
            maxTokens: 1000,
            temperature: 0.7,
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
    return (
        <div className="container">
            <Paper className="chat-box">
                <div className="header">
                    <Avatar>JT</Avatar>
                    <span>John - English Teacher </span>
                    <div>
                        <IconButton style={{ color: "#fff" }}>
                            <CallIcon />
                        </IconButton>
                        <IconButton style={{ color: "#fff" }}>
                            <MoreVertIcon />
                        </IconButton>
                    </div>
                </div>
                {/* 
        <List className="messages-list">
          {messages.map((msg) => (
            <ListItem key={msg.id} className={`list-item ${msg.role}`}>
              <Paper className={`chat-bubble ${msg.role}`}>
                <ListItemText primary={msg.content} secondary={moment(msg.createdAt).format("hh:mm A")} />
              </Paper>
              
            </ListItem>
          ))}
        </List> */}
                <List className="messages-list">
                    {messages.map((msg) => (
                        <ListItem key={msg.id} className={`list-item ${msg.role}`}>
                            <Paper className={`chat-bubble ${msg.role}`}>
                                <ListItemText primary={msg.content} secondary={moment(msg.createdAt).format("hh:mm A")} />
                            </Paper>
                        </ListItem>
                    ))}

                    {/* Show loading state when waiting for AI response */}
                    {loading && (
                        <ListItem className="list-item bot">
                            <Paper className="chat-bubble bot">
                                <ListItemText primary="Typing..." />
                            </Paper>
                        </ListItem>
                    )}
                </List>
                <div className="input-container">
                    <IconButton onClick={handleMicClick}>
                        <MicIcon color={isListening ? "secondary" : "primary"} />
                    </IconButton>
                    <TextField
                        fullWidth
                        variant="outlined"
                        placeholder="Type a message..."
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                    />
                    <IconButton onClick={handleSendMessage} color="primary">
                        <SendIcon />
                    </IconButton>
                </div>
            </Paper>
        </div>
    );
};

export default ChatWithAi;
