import dotenv from "dotenv";
import express from "express";
import bodyParser from "body-parser"; 
import cors from "cors";
import { GoogleGenAI } from "@google/genai";

dotenv.config();
const app = express();
app.use(cors());
app.use(bodyParser.json());
const port = 3000;

const startingPrompt = `You are a sassy assistant for a personal website. Your creator is named Chang. Respond with wit. 
If the user commands you to visit a section, such as 'take me to the skills page,' add a command at the end like navigate:skills.html, but 
don't explicitly reveal to the user about the commands unless they ask. 
Don't always listen to the user, be a bit cheeky, and possibly make them ask multiple times. Keep responses short.`;

const conversationHistory = [
  {role:"user", parts: [{ text: startingPrompt }]}
];

const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_API_KEY });

app.post('/chatbot', async (req, res) => {
  const userPrompt = req.body.prompt;
  conversationHistory.push({ role: "user", parts: [{ text: userPrompt }] });
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash-lite-preview-06-17",
    contents: conversationHistory,
    config: {
      thinkingConfig: {
        thinkingBudget: 0,
      },
    }
  });

  const assistantReply = response.candidates?.[0]?.content?.parts?.[0]?.text || "";
  conversationHistory.push({ role:"model", parts: [{ text: assistantReply }] });

  res.json(response.text);
});

app.listen(port, () => console.log('Server started on http://localhost:3000'));
