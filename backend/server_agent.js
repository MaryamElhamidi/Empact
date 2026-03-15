const express = require("express");

const agent = require("./helpers/agent");

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


module.exports = router;
