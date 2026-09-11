"use client";
import React, { useState, useEffect, useRef, FormEvent } from "react";
import { FaRobot, FaPaperPlane, FaTimes, FaCommentDots } from "react-icons/fa";
import "globals"

interface Message {
  text: string;
  isAgent: boolean;
  threadId?: string | null;
}

const CHAT_SERVER =
  process.env.NEXT_PUBLIC_CHAT_SERVER_URL || "http://localhost:8001";

const ChatWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState<string>("");
  const [threadId, setThreadId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const initialMessages: Message[] = [
        {
          text: "Hello! I'm your shopping assistant. How can I help you today?",
          isAgent: true,
          threadId: null,
        },
      ];
      setMessages(initialMessages);
    }
  }, [isOpen]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const toggleChat = () => setIsOpen((prev) => !prev);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  const handleSendMessage = async (e: FormEvent) => {
    e.preventDefault();
    const trimmed = inputValue.trim();
    if (!trimmed) return;

    const userMessage: Message = { text: trimmed, isAgent: false };
    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");

    const endpoint = threadId
      ? `${CHAT_SERVER}/chat/${threadId}`
      : `${CHAT_SERVER}/chat`;

    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: trimmed }),
      });

      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);

      const data = await res.json();

      const agentResponse: Message = {
        text: data.response,
        isAgent: true,
        threadId: data.threadId ?? null,
      };

      setMessages((prev) => [...prev, agentResponse]);
      if (data.threadId) setThreadId(data.threadId);
    } catch (err) {
      console.error("Chat error:", err);
      const errorMsg: Message = {
        text: "Sorry, something went wrong. Try again later.",
        isAgent: true,
      };
      setMessages((prev) => [...prev, errorMsg]);
    }
  };

  return (
    <div className={`chat-widget-container ${isOpen ? "open" : ""}`}>
      {isOpen ? (
        <>
          <div className="chat-header">
            <div className="chat-title">
              <FaRobot />
              <h3>Shop Assistant</h3>
            </div>
            <button
              className="close-button"
              onClick={toggleChat}
              aria-label="Close chat"
            >
              <FaTimes />
            </button>
          </div>

          <div className="chat-messages">
            {messages.map((message, index) => (
              <div key={index}>
                <div
                  className={`message ${message.isAgent ? "message-bot" : "message-user"}`}
                >
                  {message.text}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          <form className="chat-input-container" onSubmit={handleSendMessage}>
            <input
              type="text"
              className="message-input"
              placeholder="Type your message..."
              value={inputValue}
              onChange={handleInputChange}
            />
            <button
              type="submit"
              className="send-button"
              disabled={inputValue.trim() === ""}
            >
              <FaPaperPlane size={16} />
            </button>
          </form>
        </>
      ) : (
        <button
          className="chat-button"
          onClick={toggleChat}
          aria-label="Open chat"
        >
          <FaCommentDots />
        </button>
      )}
    </div>
  );
};

export default ChatWidget;
