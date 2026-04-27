const express = require("express");
const axios = require("axios");
require("dotenv").config();

const app = express();
app.use(express.json());

// Test route
app.get("/", (req, res) => {
  res.send("Webhook server running");
});

// GoKwik abandoned checkout webhook
app.post("/webhooks/checkout", async (req, res) => {
  try {
    console.log("Received webhook:", req.body);

    const data = req.body;

    // Extract customer info (adjust based on GoKwik payload)
    const phone = data.phone || data.customer_phone;
    const name = data.name || data.customer_name;
    const email = data.email || data.customer_email;

    // Send to Interakt
    const response = await axios.post(
      "https://api.interakt.ai/v1/public/track/users/",
      {
        phoneNumber: phone,
        name: name,
        email: email
      },
      {
        headers: {
          Authorization: `Basic ${process.env.INTERAKT_API_KEY}`,
          "Content-Type": "application/json"
        }
      }
    );

    console.log("Interakt response:", response.data);

    res.status(200).json({
      message: "Sent to Interakt successfully"
    });

  } catch (error) {
    console.log(
      "Error:",
      error.response?.data || error.message
    );

    res.status(500).json({
      error: "Failed"
    });
  }
});

app.listen(process.env.PORT || 3000, () => {
  console.log("Server running");
});