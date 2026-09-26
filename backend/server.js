const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    status: "online",
    message: "VidzAI backend is running 🚀"
  });
});

app.post("/api/generate", async (req, res) => {
  const { prompt, style, duration, aspectRatio } = req.body;

  if (!prompt) {
    return res.status(400).json({
      error: "Please provide a video prompt."
    });
  }

  res.json({
    success: true,
    message: "Video request received.",
    request: {
      prompt,
      style,
      duration,
      aspectRatio
    }
  });
});

const PORT = process.env.PORT || 10000;

app.listen(PORT, () => {
  console.log(`VidzAI backend running on port ${PORT}`);
});
