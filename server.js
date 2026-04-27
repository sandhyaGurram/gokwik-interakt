const express = require("express");
const axios = require("axios");
require("dotenv").config();

const app = express();

// Parse JSON
app.use(express.json());

// Test route
app.get("/", (req, res) => {
  res.send("Webhook server running successfully");
});

// Webhook route
app.post("/webhooks/checkout", async (req, res) => {
  try {
    console.log("==================================");
    console.log("New GoKwik webhook received");
    console.log("==================================");

    console.log("Full webhook payload:");
    console.log(JSON.stringify(req.body, null, 2));

    const data = req.body;

    // Extract phone
    const phone =
      data.phone ||
      data.customer_phone ||
      data.customer?.phone ||
      data.checkout?.phone ||
      data.checkout?.customer_phone;

    // Extract name
    const fullCustomerName = `${data.customer?.firstname || ""} ${data.customer?.lastname || ""}`.trim();

    const fullAddressName = `${data.address?.firstname || ""} ${data.address?.lastname || ""}`.trim();

    const name =
      data.name ||
      data.customer_name ||
      data.customer?.name ||
      fullCustomerName ||
      fullAddressName ||
      data.checkout?.name ||
      data.checkout?.customer_name ||
      "";

    // Extract email
    const email =
      data.email ||
      data.customer_email ||
      data.customer?.email ||
      data.checkout?.email ||
      data.checkout?.customer_email ||
      "";

    // Validate phone
    if (!phone) {
      console.log("Phone number missing in webhook payload");

      return res.status(400).json({
        success: false,
        error: "Phone number missing"
      });
    }

    // Format phone for Interakt
    let formattedPhone = phone.toString().replace(/\D/g, "");

    if (formattedPhone.length === 10) {
      formattedPhone = "91" + formattedPhone;
    }

    console.log("Extracted Data:");
    console.log({
      phone: formattedPhone,
      name,
      email
    });

    // Send to Interakt
    const interaktResponse = await axios.post(
      "https://api.interakt.ai/v1/public/track/users/",
      {
        phoneNumber: formattedPhone,
        name,
        email
      },
      {
        headers: {
          Authorization: `Basic ${process.env.INTERAKT_API_KEY}`,
          "Content-Type": "application/json"
        }
      }
    );

    console.log("Interakt Success Response:");
    console.log(interaktResponse.data);

    res.status(200).json({
      success: true,
      message: "Data sent to Interakt successfully"
    });

  } catch (error) {
    console.log("Webhook Error:");

    if (error.response) {
      console.log(error.response.data);
    } else {
      console.log(error.message);
    }

    res.status(500).json({
      success: false,
      error: "Webhook processing failed"
    });
  }
});

// Render port
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});











// const express = require("express");
// const axios = require("axios");
// require("dotenv").config();

// const app = express();

// // Parse JSON
// app.use(express.json());

// // Test route
// app.get("/", (req, res) => {
//   res.send("Webhook server running successfully");
// });

// // Webhook route
// app.post("/webhooks/checkout", async (req, res) => {
//   try {
//     console.log("Full webhook payload:");
//     console.log(JSON.stringify(req.body, null, 2));

//     const data = req.body;

//     // Handle multiple possible GoKwik payload formats
//     const phone =
//       data.phone ||
//       data.customer_phone ||
//       data.customer?.phone ||
//       data.checkout?.phone ||
//       data.checkout?.customer_phone;

//     const name =
//   data.name ||
//   data.customer_name ||
//   data.customer?.name ||
//   `${data.customer?.firstname || ""} ${data.customer?.lastname || ""}`.trim() ||
//   `${data.address?.firstname || ""} ${data.address?.lastname || ""}`.trim() ||
//   data.checkout?.name ||
//   data.checkout?.customer_name;

//     const email =
//       data.email ||
//       data.customer_email ||
//       data.customer?.email ||
//       data.checkout?.email ||
//       data.checkout?.customer_email;

//     // Validate phone
//     if (!phone) {
//       console.log("Phone number missing in webhook payload");
//       return res.status(400).json({
//         error: "Phone number missing"
//       });
//     }

//     // Format phone for Interakt (India format)
//     let formattedPhone = phone.toString().replace(/\D/g, "");

//     if (formattedPhone.length === 10) {
//       formattedPhone = "91" + formattedPhone;
//     }

//     console.log("Extracted Data:");
//     console.log({
//       phone: formattedPhone,
//       name,
//       email
//     });

//     // Send data to Interakt
//     const interaktResponse = await axios.post(
//       "https://api.interakt.ai/v1/public/track/users/",
//       {
//         phoneNumber: formattedPhone,
//         name: name || "",
//         email: email || ""
//       },
//       {
//         headers: {
//           Authorization: `Basic ${process.env.INTERAKT_API_KEY}`,
//           "Content-Type": "application/json"
//         }
//       }
//     );

//     console.log("Interakt Success Response:");
//     console.log(interaktResponse.data);

//     res.status(200).json({
//       success: true,
//       message: "Data sent to Interakt successfully"
//     });

//   } catch (error) {
//     console.log("Webhook Error:");

//     if (error.response) {
//       console.log(error.response.data);
//     } else {
//       console.log(error.message);
//     }

//     res.status(500).json({
//       success: false,
//       error: "Webhook processing failed"
//     });
//   }
// });

// // Render port
// const PORT = process.env.PORT || 3000;

// app.listen(PORT, () => {
//   console.log(`Server running on port ${PORT}`);
// });