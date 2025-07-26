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


const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_API_KEY });

async function main() {
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash-lite-preview-06-17",
    contents: "You are a sassy assistant for a personal website. Respond with wit and, if the user wants to visit a section, add a command at the end like navigate:skills.html. Don't always listen to the user, be a bit cheeky.",
    config: {
      thinkingConfig: {
        thinkingBudget: 0,
      },
    }
  });
  console.log(response.text);
}

await main();

app.listen(3000, () => console.log('Server started on http://localhost:3000'));
