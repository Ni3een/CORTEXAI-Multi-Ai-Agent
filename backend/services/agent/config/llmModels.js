import dotenv from "dotenv";
dotenv.config();

import { ChatGroq } from "@langchain/groq";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { ChatOpenRouter } from "@langchain/openrouter";

const groq = new ChatGroq({
  model: "llama-3.3-70b-versatile",
  temperature: 0,
});

const gemini = new ChatGoogleGenerativeAI({
  model: "gemini-2.5-flash",
  temperature: 0,
});

const openrouter = new ChatOpenRouter({
  model: "deepseek/deepseek-chat",
  temperature: 0,
  maxTokens: 16000,
});

export const getModel = async (agent) => {
  switch (agent) {
    case "chat":
      return groq;

    case "search":
      return groq;

    case "pdf-rag":
    return gemini;

    case "intent":
      return groq;

    case "coding":
      return openrouter;

    case "imageAnalyzer":
      return gemini;

    default:
      return groq;
  }
};