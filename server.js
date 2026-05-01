const express = require("express");
const cors = require("cors");
const path = require("path");
const https = require("https");

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// Proxy endpoint — keeps API key hidden from browser
app.post("/chat", (req, res) => {
  const body = JSON.stringify(req.body);
  const options = {
    hostname: "api.anthropic.com",
    path: "/v1/messages",
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Content-Length": Buffer.byteLength(body),
      "x-api-key": process.env.ANTHROPIC_API_KEY,
      "anthropic-version": "2023-06-01"
    }
  };

  const request = https.request(options, (response) => {
    let data = "";
    response.on("data", chunk => { data += chunk; });
    response.on("end", () => {
      try {
        res.status(response.statusCode).json(JSON.parse(data));
      } catch(e) {
        res.status(500).json({ error: "Failed to parse response", raw: data });
      }
    });
  });

  request.on("error", (err) => {
    res.status(500).json({ error: err.message });
  });

  request.write(body);
  request.end();
});

// Health check for Render
app.get("/health", (req, res) => res.json({ status: "ok" }));

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`✅ GazeTalk server running on port ${PORT}`);
});
