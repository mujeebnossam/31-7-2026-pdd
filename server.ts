import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

// Load local environment variables
dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Middleware to support incoming JSON payloads
  app.use(express.json());

  // Instantiate standard server-side Gemini client securely
  const apiKey = process.env.GEMINI_API_KEY;
  const ai = new GoogleGenAI({
    apiKey: apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      }
    }
  });

  // Health check
  app.get("/api/health", (req, res) => {
    res.json({ status: "active", uptime: process.uptime() });
  });

  // Secure Server-side API endpoint for AI Financial Conversations
  app.post("/api/chat", async (req, res) => {
    try {
      const { prompt, transactions = [], budgets = [] } = req.body;

      if (!apiKey) {
        return res.status(200).json({
          text: "⚠️ **Gemini API key is not configured yet.**\n\nPlease add a valid key named **GEMINI_API_KEY** in the **Settings > Secrets** panel in AI Studio so I can analyze your financial ledgers."
        });
      }

      // Structure transaction context summary to supply context to the model
      const totalExpense = transactions
        .filter((t: any) => t.type === 'expense')
        .reduce((sum: number, t: any) => sum + t.amount, 0);

      const totalIncome = transactions
        .filter((t: any) => t.type === 'income')
        .reduce((sum: number, t: any) => sum + t.amount, 0);

      const savings = totalIncome - totalExpense;

      const transactionsSummary = transactions
        .slice(0, 15)
        .map((t: any) => `- ${t.date}: ${t.title} [${t.category}] spent $${t.amount} (${t.type})`)
        .join("\n");

      const budgetsSummary = budgets
        .map((b: any) => `- ${b.category}: Limit $${b.limit}, Spent $${b.spent} (${((b.spent/b.limit)*100).toFixed(0)}% used)`)
        .join("\n");

      // Formulate query for Auden
      const fullPrompt = `The user "Mujeeb" is asking me a question regarding their active expense ledger.
Here is Mujeeb's active financial context:
Current Net Income: $${totalIncome.toFixed(2)}
Current Net Expenses: $${totalExpense.toFixed(2)}
Calculated Net Balance: $${savings.toFixed(2)}

Mujeeb's Active Category Budgets:
${budgetsSummary || "No budgets set yet."}

Mujeeb's Recent Transaction Items:
${transactionsSummary || "No transactions recorded yet."}

User Question/Prompt: "${prompt}"

Provide actionable, brief, and highly scannable financial coaching recommendations. Be polite, encouraging, and write in first person as "Auden, the AI Financial Advisor". Use bolding to emphasize numbers and key terms. Make sure to provide a highly structured answer with bullet points.`;

      // Call Gemini 3.5 Flash Model
      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: fullPrompt,
        config: {
          systemInstruction: "You are Auden, a friendly, ultra-sharp certified senior financial advisor and wealth coach. You optimize budgets and teach users high-impact, actionable micro-saving habits. Keep your answers concise, structured in bullet lists, and easy for mobile screen reading. Speak directly to 'Mujeeb'.",
          temperature: 0.7,
        },
      });

      res.json({ text: response.text });
    } catch (error: any) {
      console.error("Gemini Advisor engine error:", error);
      res.status(500).json({ 
        error: "Advisor failed to process logic", 
        details: error.message || error 
      });
    }
  });

  // Vite static assets serving & integration layer
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    // Mount Vite's dev server middleware
    app.use(vite.middlewares);
  } else {
    // Production serving from compiled build file tree
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Express custom server running at http://localhost:${PORT}`);
  });
}

startServer();
