import React, { useState, useEffect, useRef } from "react";
import "./css/rightnav.css";
import dotenv from "dotenv";

export default function Rightnav({ initialChatHistory = [] }) {
  const backend = import.meta.env.VITE_API_URL;
  const [chatHistory, setChatHistory] = useState(initialChatHistory);
  const [input, setInput] = useState("");
  const chatBodyRef = useRef(null);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!input.trim()) return;

    const userMessage = input.trim();

    const res = await fetch(`${backend}/interview/api/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ inp: userMessage }),
    });

    const data = await res.json();

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
        <button type="submit" className="chat-send">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="size-6 svg-send"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5"
            />
          </svg>
        </button>
      </form>
    </div>
  );
}
