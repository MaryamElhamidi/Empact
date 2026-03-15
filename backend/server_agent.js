const express = require("express");

const agent = require("./helpers/agent");
const users = require("./helpers/db/users");
const donations = require("./helpers/db/donations");

const router = express.Router();


router.get("/test", async (req, res) => {
  res.json({ message: "Model endpoint placeholder" });
});

router.get("/donations", async (req, res) => {
    const user_id = req.body.user_id;
    //get user donations from AI model
    res.json({ message: "Model donations endpoint placeholder", user: [] });
});


router.get("/donation_url", async (req, res) => {
    const amount = req.body.amount;
    const currency = req.body.currency;
    const user_id = req.body.user_id;
    const donation_id = req.body.donation_id;
    const donation_date = req.body.donation_date;
    const donation_status = req.body.donation_status;
    const donation_amount = req.body.donation_amount;  
    const donation_url = await agent.agent_donate(amount, currency, user_id, donation_id, donation_date, donation_status, donation_amount);
  res.json({ message: "Model donate endpoint placeholder", user: donation_url });
});

/** POST /model/donate - run agent donate flow; optional Accept: text/event-stream for progress. */
router.post("/donate", async (req, res) => {
  const { email, url, amount, organization_name, currency, country } = req.body || {};
  if (!email || !url) {
    return res.status(400).json({ error: "email and url are required" });
  }
  const donationAmount = typeof amount === "number" ? amount : parseFloat(amount) || 15;

  const recordDonation = async () => {
    try {
      const user = await users.getUserByEmail(email);
      if (!user) return;
      await donations.createDonation({
        user_id: user.user_id,
        campaign_url: url,
        amount: donationAmount,
        currency: currency || "USD",
        country: country || null,
        organization_name: organization_name || null
      });
    } catch (err) {
      console.error("Failed to record donation after donate flow:", err);
    }
  };

  const wantsStream = req.get("accept") && req.get("accept").includes("text/event-stream");
  if (wantsStream) {
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.setHeader("X-Accel-Buffering", "no");
    res.flushHeaders();
    const onProgress = (msg) => {
      res.write("data: " + JSON.stringify({ msg }) + "\n\n");
      if (res.flush) res.flush();
    };
    try {
      await agent.donate(email, url, donationAmount, onProgress);
      await recordDonation();
      res.write("data: " + JSON.stringify({ done: true }) + "\n\n");
    } catch (err) {
      res.write("data: " + JSON.stringify({ error: String(err && err.message) }) + "\n\n");
    }
    res.end();
    return;
  }

  res.json({ started: true });
  agent.donate(email, url, donationAmount)
    .then(() => recordDonation())
    .catch((err) => console.error("donate flow error:", err));
});

module.exports = router;
