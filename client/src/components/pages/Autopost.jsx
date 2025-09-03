import React, { useState, useRef, useEffect } from "react";
import { Mic, ClipboardCopy } from "lucide-react";
import "../css/autopost.css";
import Nav from "../Nav";
import Leftnav from "../Leftnav";
import { useNavigate } from "react-router-dom";
import axios from "axios";
const backend = import.meta.env.VITE_API_URL;
const backendagent = import.meta.env.VITE_AGENT_API_URL;

// Custom hook for speech recognition
const useSpeechRecognition = () => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const recognitionRef = useRef(null);

  useEffect(() => {
    if (!("webkitSpeechRecognition" in window)) return;

    const recognition = new window.webkitSpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.lang = "en-US";

    recognition.onresult = (event) => {
      let finalTranscript = "";
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        }
      }
      setTranscript(finalTranscript);
    };

    recognitionRef.current = recognition;
  }, []);

  const startListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  };

  const hasRecognitionSupport = !!window.webkitSpeechRecognition;

  return {
    isListening,
    transcript,
    startListening,
    stopListening,
    hasRecognitionSupport,
  };
};

// Voice Button Component
const VoiceButton = ({ isListening, onStart, onStop, disabled }) => {
  const handleClick = () => {
    if (isListening) {
      onStop();
    } else {
      onStart();
    }
  };

  if (disabled) {
    return (
      <div className="voice-disabled">
        <Mic size={16} className="icon-disabled" />
        Voice input not supported in your browser
      </div>
    );
  }

  return (
    <button
      onClick={handleClick}
      className={`voice-button ${isListening ? "listening" : ""}`}
      aria-label={isListening ? "Stop recording" : "Start recording"}
    >
      <div className="icon-wrapper">
        <Mic size={18} />
        {isListening && <span className="mic-ping" />}
      </div>
      <span>{isListening ? "Recording..." : "Voice"}</span>
    </button>
  );
};

// Main AutoPost Component
const AutoPostPage = () => {
  const navigate = useNavigate();
  const [text, setText] = useState("");
  const [tone, setTone] = useState("");
  const [words, setWords] = useState("");
  const [isCopied, setIsCopied] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const textareaRef = useRef(null);
  const {
    isListening,
    transcript,
    startListening,
    stopListening,
    hasRecognitionSupport,
  } = useSpeechRecognition();

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [text]);

  useEffect(() => {
    if (transcript) {
      setText((prev) => `${prev}${prev ? " " : ""}${transcript}`);
    }
  }, [transcript]);

  const handleTextChange = (e) => {
    setText(e.target.value);
  };

  const copyToClipboard = async () => {
    if (text) {
      try {
        await navigator.clipboard.writeText(text);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
      } catch (err) {
        console.error("Failed to copy text: ", err);
      }
    }
  };
  const postit = async () => {
    try {
      setIsLoading(true);
      const airesponse = await axios.post(
        `${backendagent}/generate`,
        {
          topic: text,
          tone: tone,
          word_count: words,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );
      console.log(airesponse);
      const generatedPost = airesponse.data.generated_post;
      const response = await axios.post(
        `${backend}/api/autopost/chat`,
        {
          title: "AI Generated Post",
          text: generatedPost,
          media: [],
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );
      if (response.status === 201) {
        navigate("/home");
      }
    } catch (err) {
      alert("autopost problem please try again");
      console.log(err);
      navigate("/home");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <Nav />
      <div className="home-page">
        <Leftnav />
        <div className="posts-page posts-page-auto">
          <div className="containerr">
            <header className="header">
              <h1 className="title">Post like a Pro</h1>
              <p className="subtitle">
                Type or use your voice to create the perfect post. Your words,
                simplified.
              </p>
            </header>
            {isLoading ? (
              <div className="spin-load_">
                <span className="loader__"></span>
              </div>
            ) : (
              <div className="post-box">
                <div
                  className={`textarea-wrapper ${
                    isListening ? "listening-bg" : ""
                  }`}
                >
                  <textarea
                    ref={textareaRef}
                    value={text}
                    onChange={handleTextChange}
                    placeholder="What's on your mind?"
                    className="textarea"
                  />
                  {isListening && (
                    <div className="listening-indicator">Listening...</div>
                  )}
                </div>

                <div className="tone-words-row">
                  <input
                    type="text"
                    value={tone}
                    onChange={(e) => setTone(e.target.value)}
                    placeholder="Tone..."
                    className="input-box"
                  />
                  <input
                    type="number"
                    value={words}
                    onChange={(e) => setWords(e.target.value)}
                    placeholder="Number of words"
                    className="input-box"
                  />
                </div>

                <div className="action-row">
                  <VoiceButton
                    isListening={isListening}
                    onStart={startListening}
                    onStop={stopListening}
                    disabled={!hasRecognitionSupport}
                  />

                  <button
                    onClick={postit}
                    disabled={!text}
                    className={`copy-button ${!text ? "disabled" : ""}`}
                  >
                    <ClipboardCopy size={16} />
                    {isLoading ? (
                      <span className="loader"></span>
                    ) : (
                      <span>{isCopied ? "Posting!" : "Post"}</span>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AutoPostPage;
