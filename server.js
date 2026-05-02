import express from "express";
import fetch from "node-fetch";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

/* ──────────────────────────────
   SETUP
────────────────────────────── */
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

/* ──────────────────────────────
   MIDDLEWARE
────────────────────────────── */
app.use(cors());
app.use(express.json());

// Serve static files from /public
app.use(express.static(path.join(__dirname, "public")));

/* ──────────────────────────────
   ROOT → simulator.html
────────────────────────────── */
app.get("/", (req, res) => {
  res.redirect("/simulator.html");
});

/* ──────────────────────────────
   CHAT ENDPOINT (ANTHROPIC)
────────────────────────────── */
app.post("/chat", async (req, res) => {
  try {
    if (!process.env.ANTHROPIC_API_KEY) {
      return res.status(500).json({
        error: { message: "ANTHROPIC_API_KEY is not set on the server" }
      });
    }

    const response = await fetch(
      "https://api.anthropic.com/v1/messages",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "anthropic-version": "2023-06-01",
          "x-api-key": process.env.ANTHROPIC_API_KEY
        },
        body: JSON.stringify(req.body)
      }
    );

    const data = await response.json();

    // Forward Anthropic errors to the frontend
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
    console.error("Server failure:", err);
    res.status(500).json({
      error: { message: "Server failed to call Anthropic API" }
    });
  }
});

/* ──────────────────────────────
   START SERVER
────────────────────────────── */
const PORT = process.env.PORT || 10000;

app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
