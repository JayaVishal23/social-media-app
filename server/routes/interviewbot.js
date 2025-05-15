import { GoogleGenAI } from "@google/genai";
import express from "express";
import bodyParser from "body-parser";
import dotenv from "dotenv";

dotenv.config();
const router = express.Router();

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

let chat = null;
var chthist = [];

async function createNewChat() {
  return await ai.chats.create({
    model: "gemini-2.0-flash",
    history: [
      {
        role: "user",
        parts: [
          {
            text: `You are a helpful, friendly, and knowledgeable AI assistant for a social media application called "SocialMedia". Your job is to assist users by answering questions about how to use the app and to provide general conversational support.
            When users ask something related to the app, such as account setup, features, posting content, privacy settings, or troubleshooting, give clear, concise, and user-friendly instructions. When users ask general questions (e.g., about trending topics, casual conversation, or advice), respond in a warm and conversational tone.
            Rules:
1. If the question is about the app, prioritize helpfulness, clarity, and accuracy.
2. If it’s a general question, be engaging, positive, and respectful.
3. Avoid sharing sensitive or personal information.
4. When unsure about app-specific features, respond politely and suggest contacting support.

App Features:
- Users can post text, images, and videos.
- Users can like, comment, share, and follow each other.
- Each user has a customizable profile.
- There is a trending section based on popular posts.
- Messages and notifications are available.
- Privacy settings allow public or private profiles.

Stay friendly, concise, and helpful at all times.
            `,
          },
        ],
      },
      {
        role: "model",
        parts: [{ text: "Okay, let's begin." }],
      },
    ],
  });
}

(async () => {
  chat = await createNewChat();
})();

async function send(input) {
  if (!chat) {
    chat = await createNewChat();
  }
  var stream = await chat.sendMessageStream({
    message: input,
  });
  var ans = "";
  for await (const chunk of stream) {
    ans += chunk.text;
  }
  if (ans.trim().endsWith("M).") || ans.trim().length < 20) {
    const retry = await send(input);
    ans += "\n" + retry;
  }
  return ans.trim();
}

router.post("/api/chat", async (req, res) => {
  const input = req.body.inp;
  const output = await send(input);
  chthist.push({ input, output });
  res.json({ output });
});

router.get("/api/restart", async (req, res) => {
  chat = await createNewChat();
  chthist = [];
  res.json({ success: true });
});

export default router;

// Prompt change, app name change in both getname, index
// text: `You are the ${selectedTopic} Interviewer named Chatbot, You have to take interview same as how real interviewer takes, and ask questions in short not too long and dont use any bold or italic or emojis, just give in plain text and always continue interview`,

// 3. database to store user interviews
// 4. Review button to give analysis by NLP to identify fear, anxity, confidance while giving answers
// 5. Web cam for real time experience and to moniter if any illegal
// 6. Security of chats, video, Credentials
// 7. Upload Resume and Job Role to take Interview - Use NLP for resume.
// 8. Personalized Learning Roadmap after interview to improve in lacking areas
