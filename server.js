import express from "express";
import fetch from "node-fetch";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

/* ===============================
   PATH SETUP
================================ */
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

/* ===============================
   MIDDLEWARE
================================ */
app.use(cors());
app.use(express.json());

// Serve static frontend
app.use(express.static(path.join(__dirname, "public")));

/* ===============================
   ROOT ROUTE
================================ */
app.get("/", (req, res) => {
  res.redirect("/simulator.html");
});

/* ===============================
   ANTHROPIC MODELS (DIAGNOSTIC)
   IMPORTANT: use this to see
   which models YOUR key supports
================================ */
app.get("/_models", async (req, res) => {
  try {
    const response = await fetch("https://api.anthropic.com/v1/models", {
      headers: {
        "Content-Type": "application/json",
        "anthropic-version": "2023-06-01",
        "x-api-key": process.env.ANTHROPIC_API_KEY
      }
    });

    const data = await response.json();
    res.json(data);

  } catch (err) {
    console.error("Model list error:", err);
    res.status(500).json({
      error: { message: "Failed to list Anthropic models" }
    });
  }
});

/* ===============================
   CHAT ENDPOINT
================================ */
app.post("/chat", async (req, res) => {
  try {
    if (!process.env.ANTHROPIC_API_KEY) {
      return res.status(500).json({
        error: { message: "ANTHROPIC_API_KEY not set on server" }
      });
    }

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "anthropic-version": "2023-06-01",
        "x-api-key": process.env.ANTHROPIC_API_KEY
      },
      body: JSON.stringify(req.body)
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Anthropic API error:", data);
      return res.status(response.status).json({
        error: {
          message:
            data?.error?.message ||
            "Anthropic API returned an error"
        }
      });
    }

    res.json(data);

  } catch (err) {
    console.error("Server error:", err);
    res.status(500).json({
      error: { message: "Server failed to call Anthropic API" }
    });
  }
});

/* ===============================
   START SERVER
================================ */
const PORT = process.env.PORT || 10000;

app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
