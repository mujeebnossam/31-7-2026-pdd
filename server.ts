// ⚠️ env.ts MUST be the first import — loads .env before any module reads process.env
import "./server/config/env";

import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

// ─── Database & Models ────────────────────────────────────────────────────────
import { sequelize } from "./server/models/index";

// ─── Routes ──────────────────────────────────────────────────────────────────
import authRoutes from "./server/routes/authRoutes";
import accountRoutes from "./server/routes/accountRoutes";
import transactionRoutes from "./server/routes/transactionRoutes";
import budgetRoutes from "./server/routes/budgetRoutes";
import goalRoutes from "./server/routes/goalRoutes";
import billRoutes from "./server/routes/billRoutes";
import aiRoutes from "./server/routes/aiRoutes";
import ingestionRoutes from "./server/routes/ingestionRoutes";

async function startServer() {
  const app = express();
  const PORT = parseInt(process.env.PORT || "3001", 10);

  // ─── Core Middleware ────────────────────────────────────────────────────────
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // ─── Database Sync ──────────────────────────────────────────────────────────
  // ⚠️  DEV ONLY: sequelize.sync({ alter: true }) auto-modifies tables to match
  //    models. Do NOT use this in production — use proper migrations instead.
  try {
    await sequelize.authenticate();
    console.log("✅ PostgreSQL connected successfully");
    await sequelize.sync({ alter: true });
    console.log("✅ Database tables synced (dev mode)");
  } catch (err: any) {
    console.error("❌ Database connection failed:", err.message);
    console.warn("⚠️  Server will continue without database. Check DB_* env vars in .env");
  }

  // ─── Health Check ───────────────────────────────────────────────────────────
  app.get("/api/health", (_req, res) => {
    res.json({ status: "active", uptime: process.uptime() });
  });

  // ─── API Routes ─────────────────────────────────────────────────────────────
  app.use("/api/auth", authRoutes);
  app.use("/api/accounts", accountRoutes);
  app.use("/api/transactions", transactionRoutes);
  app.use("/api/budgets", budgetRoutes);
  app.use("/api/goals", goalRoutes);
  app.use("/api/bills", billRoutes);
  app.use("/api/ai", aiRoutes);
  app.use("/api/ingestion", ingestionRoutes);

  // ─── AI Advisor (Groq / Gemini fallback) ────────────────────────────────────
  app.post("/api/chat", async (req, res) => {
    try {
      const { prompt, transactions = [], budgets = [] } = req.body;
      const apiKey = process.env.GROQ_API_KEY || process.env.GEMINI_API_KEY || process.env.API_KEY;

      if (!apiKey || apiKey.trim() === "") {
        return res.status(200).json({
          text: "⚠️ **Groq API key is not configured.**\n\nPlease set your **GROQ_API_KEY** in the `.env` file to enable AI financial coaching.",
        });
      }

      const totalExpense = transactions
        .filter((t: any) => t.type === "expense")
        .reduce((sum: number, t: any) => sum + Math.abs(t.amount), 0);

      const totalIncome = transactions
        .filter((t: any) => t.type === "income")
        .reduce((sum: number, t: any) => sum + t.amount, 0);

      const savings = totalIncome - totalExpense;

      const transactionsSummary = transactions
        .slice(0, 15)
        .map((t: any) => `- ${t.date}: ${t.title || t.merchant} [${t.category}] $${t.amount} (${t.type})`)
        .join("\n");

      const budgetsSummary = budgets
        .map((b: any) => `- ${b.category}: Limit $${b.budgeted ?? b.limit}, Spent $${b.spent} (${(((b.spent / (b.budgeted ?? b.limit)) * 100) || 0).toFixed(0)}% used)`)
        .join("\n");

      const fullPrompt = `The user is asking a question about their active expense ledger.
Financial Context:
Net Income: $${totalIncome.toFixed(2)}
Net Expenses: $${totalExpense.toFixed(2)}
Net Balance: $${savings.toFixed(2)}

Category Budgets:
${budgetsSummary || "No budgets set yet."}

Recent Transactions:
${transactionsSummary || "No transactions recorded yet."}

User Question: "${prompt}"

Provide actionable, brief, and highly scannable financial coaching. Write in first person as "Auden, AI Financial Advisor". Use bold for numbers and key terms. Use bullet points.`;

      let aiText = "";

      if (apiKey.startsWith("gsk_")) {
        const groqRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "llama-3.3-70b-versatile",
            messages: [
              {
                role: "system",
                content:
                  "You are Auden, a friendly, ultra-sharp certified senior financial advisor and wealth coach. Keep answers concise, structured in bullet lists, easy for mobile reading.",
              },
              { role: "user", content: fullPrompt },
            ],
            temperature: 0.7,
          }),
        });

        if (!groqRes.ok) {
          const errData = await groqRes.json().catch(() => ({}));
          throw new Error(`Groq API error (${groqRes.status}): ${JSON.stringify(errData)}`);
        }

        const data: any = await groqRes.json();
        aiText = data.choices?.[0]?.message?.content || "No response from Groq.";
      } else {
        const ai = new GoogleGenAI({
          apiKey,
          httpOptions: { headers: { "User-Agent": "spendwise-ai" } },
        });
        const response = await ai.models.generateContent({
          model: "gemini-2.5-flash",
          contents: fullPrompt,
          config: {
            systemInstruction:
              "You are Auden, a friendly certified senior financial advisor. Keep answers concise, structured in bullet lists, easy for mobile reading.",
            temperature: 0.7,
          },
        });
        aiText = response.text || "No response from Gemini.";
      }

      res.json({ text: aiText });
    } catch (error: any) {
      console.error("Advisor engine error:", error.message);
      res.status(500).json({
        error: "Advisor failed to process request",
        details: error.message,
      });
    }
  });

  // ─── Vite Dev Middleware / Static Production Serving ────────────────────────
  if (process.env.NODE_ENV !== "production" && process.env.ENABLE_VITE_MIDDLEWARE === "true") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`🚀 Express server running at http://localhost:${PORT}`);
  });
}

startServer();
