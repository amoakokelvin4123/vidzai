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
  try {
    const { prompt, style, duration, aspectRatio } = req.body;

    if (!prompt) {
      return res.status(400).json({
        error: "Please provide a video prompt."
      });
    }

    const apiKey = process.env.MAGIC_HOUR_API_KEY;

    if (!apiKey) {
      return res.status(500).json({
        error: "Magic Hour API key is not configured."
      });
    }

    const finalPrompt = style
      ? `${prompt}. Style: ${style}`
      : prompt;

    const response = await fetch(
      "https://api.magichour.ai/v1/text-to-video",
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          prompt: finalPrompt,
          duration: Number(duration) || 5,
          aspectRatio: aspectRatio || "16:9",
          resolution: "480p"
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error("Magic Hour error:", data);

      return res.status(response.status).json({
        error: "Magic Hour video generation failed.",
        details: data
      });
    }

    res.json({
      success: true,
      message: "Video generation started.",
      project: data
    });

  } catch (error) {
    console.error("Server error:", error);

    res.status(500).json({
      error: "Something went wrong while starting the video."
    });
  }
});

const PORT = process.env.PORT || 10000;

app.listen(PORT, () => {
  console.log(`VidzAI backend running on port ${PORT}`);
});
