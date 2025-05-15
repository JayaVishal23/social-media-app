import { GoogleGenAI } from "@google/genai";
import express from "express";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import Post from "../db/Postschema.js";

dotenv.config();
const router = express.Router();

const ai = new GoogleGenAI({
  apiKey: process.env.API_KEY,
});

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

async function main(input) {
  const response = await ai.models.generateContent({
    model: "gemini-2.0-flash",
    contents: input,
  });
  var ans = "";
  //   for await (const chunk of response) {
  //     ans += chunk.text + "";
  //   }
  return response.text;
}

var chatHistory = [];
let result;

router.post("/chat", async (req, res) => {
  var input = req.body.inp;

  var output =
    await main(`Write a short and engaging social media post about ${input}. The response must be in this exact JSON format:{"title":"your title here","description":"your description here"} The tone should be professional, simple, and informative. Keep the description clear, concise, and easy to understand. Do not include any extra text or formatting outside of the JSON and dont use new line charecters and dont use any bold and italic.
`);
  chatHistory.push({ input: input, output: output });
  result = extractJsonData(output);

  if (!result) {
    return res
      .status(400)
      .json({ autopost: false, message: "Invalid AI response" });
  }

  try {
    const newPost = new Post({
      user: req.user._id,
      title: result.title,
      text: result.description,
      media: [],
    });

    await newPost.save();
    res.status(201).json({ autopost: true, message: result });
  } catch (err) {
    console.log("Error in autopost.js" + err);
    res
      .status(401)
      .json({ autopost: false, message: "Error in auto uploading" });
  }
});

function extractJsonData(responseString) {
  try {
    const cleaned = responseString.replace(/```json|```/g, "").trim();

    const data = JSON.parse(cleaned);

    return {
      title: data.title || "",
      description: data.description || "",
    };
  } catch (error) {
    console.error("Failed to extract JSON:", error.message);
    return null;
  }
}

export default router;
