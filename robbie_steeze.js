import express from "express";
import dotenv from "dotenv";
import crypto from "crypto";

dotenv.config();

const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

async function verifyRobbieBizzleTurnstile(token, ip) {
  if (!token) {
    return {
      ok: false,
      reason: "Missing Turnstile token"
    };
  }

  const formData = new URLSearchParams();

  formData.append("secret", process.env.TURNSTILE_SECRET_KEY);
  formData.append("response", token);

  if (ip) {
    formData.append("remoteip", ip);
  }

  formData.append("idempotency_key", crypto.randomUUID());

  const response = await fetch(
    "https://challenges.cloudflare.com/turnstile/v0/siteverify",
    {
      method: "POST",
      body: formData
    }
  );

  const result = await response.json();

  if (!result.success) {
    return {
      ok: false,
      reason: "Turnstile failed",
      details: result["error-codes"] || []
    };
  }

  if (result.action && result.action !== "robbie-bizzle") {
    return {
      ok: false,
      reason: "Unexpected Turnstile action"
    };
  }

  return {
    ok: true,
    result
  };
}

app.post("/api/haloarchives/submit", async (req, res) => {
  try {
    const token = req.body["cf-turnstile-response"];

    const verification = await verifyRobbieBizzleTurnstile(
      token,
      req.ip
    );

    if (!verification.ok) {
      return res.status(403).json({
        success: false,
        message: "Robbie Bizzle denied access.",
        error: verification.reason
      });
    }

    const { gamertag } = req.body;

    return res.json({
      success: true,
      message: "Robbie Bizzle approved access.",
      gamertag
    });
  } catch (error) {
    console.error("[Robbie Bizzle] Verification error:", error);

    return res.status(500).json({
      success: false,
      message: "Turnstile verification failed internally."
    });
  }
});

app.listen(3000, () => {
  console.log("HaloArchives running on http://localhost:3000");
});
