const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 10000;
const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;

app.get("/", (req, res) => {
  res.json({
    status: "online",
    message: "VidzAI backend is running 🚀"
  });
});

// Video generation request
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

// Paystack payment initialization
app.post("/api/payment/initialize", async (req, res) => {
  try {
    const { email, plan } = req.body;

    if (!email) {
      return res.status(400).json({
        error: "Email is required."
      });
    }

    const plans = {
      pro: {
        name: "VidzAI Pro",
        amount: 19000
      },
      creator: {
        name: "VidzAI Creator",
        amount: 49000
      }
    };

    const selectedPlan = plans[plan];

    if (!selectedPlan) {
      return res.status(400).json({
        error: "Invalid plan."
      });
    }

    if (!PAYSTACK_SECRET_KEY) {
      return res.status(500).json({
        error: "Paystack is not configured."
      });
    }

    const response = await fetch(
      "https://api.paystack.co/transaction/initialize",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          email,
          amount: selectedPlan.amount,
          currency: "GHS",
          metadata: {
            plan: plan,
            product: selectedPlan.name
          },
          callback_url: "https://vidzai.onrender.com/"
        })
      }
    );

    const data = await response.json();

    if (!response.ok || !data.status) {
      return res.status(400).json({
        error: data.message || "Payment initialization failed."
      });
    }

    res.json({
      success: true,
      authorization_url: data.data.authorization_url,
      reference: data.data.reference
    });

  } catch (error) {
    console.error("Payment error:", error);

    res.status(500).json({
      error: "Unable to initialize payment."
    });
  }
});

app.listen(PORT, () => {
  console.log(`VidzAI backend running on port ${PORT}`);
});
