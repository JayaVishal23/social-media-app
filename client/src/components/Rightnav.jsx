import React, { useState, useEffect, useRef } from "react";
import "./css/rightnav.css";

export default function Rightnav({ initialChatHistory = [] }) {
  const [chatHistory, setChatHistory] = useState(initialChatHistory);
  const [input, setInput] = useState("");
  const chatBodyRef = useRef(null);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!input.trim()) return;

    const userMessage = input.trim();

    // Send to server (you can change this logic)
    const res = await fetch("/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ inp: userMessage }),
    });

    const data = await res.json(); // Expecting { output: "response text" }

    setChatHistory((prev) => [
      ...prev,
      { input: userMessage, output: data.output },
    ]);
    setInput("");
  };

  useEffect(() => {
    const chatBody = chatBodyRef.current;
    if (chatBody) {
      chatBody.scrollTop = chatBody.scrollHeight;
    }
  }, [chatHistory]);

  return (
    <div className="chat-container">
      <div className="chat-header">ChatBot</div>
      <div className="chat-body" ref={chatBodyRef}>
        {chatHistory.length > 0 &&
          chatHistory.map((chat, index) => (
            <React.Fragment key={index}>
              <div className="message user-message">{chat.input}</div>
              <div className="message bot-message">{chat.output}</div>
            </React.Fragment>
          ))}
      </div>

      <form className="chat-footer" onSubmit={handleSubmit}>
        <input
          type="text"
          name="inp"
          placeholder="Type a message..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          required
        />
        <button type="submit">🚀</button>
      </form>
    </div>
  );
}
