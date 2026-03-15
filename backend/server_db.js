const express = require("express");
const bcrypt = require("bcrypt");
const path = require("path");
const fs = require("fs");
const db = require("./helpers/db/db_conn");
const users = require("./helpers/db/users");
const donations = require("./helpers/db/donations");
const opportunities = require("./helpers/db/opportunities");
const globalIssues = require("./helpers/db/global_issues");
const charities = require("./helpers/db/charities");
const notifications = require("./helpers/db/notifications");
const wallets = require("./helpers/db/wallets");
const paymentMethods = require("./helpers/db/payment_methods");
const router = express.Router();

/*
--------------------------------
USER ROUTES
--------------------------------
*/

/* Create user */
router.post("/users", async (req, res) => {
  try {
    const body = { ...req.body };
    if (body.password) {
      body.password = await bcrypt.hash(body.password, 10);
    }
    const id = await users.createUser(body);
    res.json({ user_id: id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create user" });
  }
});

/* Get user by email */
router.get("/users/:email", async (req, res) => {
  try {
    const user = await users.getUserByEmail(req.params.email);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to retrieve user" });
  }
});

/* Update user */
router.put("/users/:email", async (req, res) => {
  try {
    const affected = await users.updateUser(req.params.email, req.body);

    if (affected === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({ updated: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update user" });
  }
});

/* Delete user */
router.delete("/users/:email", async (req, res) => {
  try {
    const affected = await users.deleteUser(req.params.email);

    if (affected === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({ deleted: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to delete user" });
  }
});


/*
--------------------------------
DONATION ROUTES
--------------------------------
*/

/* Create donation */
router.post("/donations", async (req, res) => {
  try {
    const id = await donations.createDonation(req.body);
    res.json({ donation_id: id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create donation" });
  }
});

/* Get donation by ID */
router.get("/donations/:id", async (req, res) => {
  try {
    const donation = await donations.getDonationById(req.params.id);

    if (!donation) {
      return res.status(404).json({ error: "Donation not found" });
    }

    res.json(donation);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to retrieve donation" });
  }
});

/* Get donations for user */
router.get("/users/:userId/donations", async (req, res) => {
  try {
    const result = await donations.getDonationsByUser(req.params.userId);
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to retrieve donations" });
  }
});

/* Get impact stats for user */
router.get("/users/:userId/impact", async (req, res) => {
  try {
    const result = await donations.getImpactStatsByUser(req.params.userId);
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to retrieve impact stats" });
  }
});

/* Get user notifications */
router.get("/users/:userId/notifications", async (req, res) => {
  try {
    const result = await notifications.getByUserId(req.params.userId);
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to retrieve notifications" });
  }
});

/* Mark all notifications read */
router.patch("/users/:userId/notifications/read-all", async (req, res) => {
  try {
    await notifications.markAllAsRead(req.params.userId);
    res.json({ updated: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update notifications" });
  }
});

/* Mark one notification read */
router.patch("/users/:userId/notifications/:id/read", async (req, res) => {
  try {
    const n = await notifications.markAsRead(req.params.id, req.params.userId);
    if (n === 0) return res.status(404).json({ error: "Notification not found" });
    res.json({ updated: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update notification" });
  }
});

/* Create notification */
router.post("/users/:userId/notifications", async (req, res) => {
  try {
    const id = await notifications.create(req.params.userId, req.body);
    res.status(201).json({ notification_id: id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create notification" });
  }
});

/* Delete notification */
router.delete("/users/:userId/notifications/:id", async (req, res) => {
  try {
    const n = await notifications.remove(req.params.id, req.params.userId);
    if (n === 0) return res.status(404).json({ error: "Notification not found" });
    res.json({ deleted: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to delete notification" });
  }
});

/* Get or create wallet */
router.get("/users/:userId/wallet", async (req, res) => {
  try {
    const result = await wallets.getOrCreateWallet(req.params.userId, req.query.currency);
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to retrieve wallet" });
  }
});

/* Get payment methods */
router.get("/users/:userId/payment-methods", async (req, res) => {
  try {
    const result = await paymentMethods.getByUserId(req.params.userId);
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to retrieve payment methods" });
  }
});

/* Add payment method */
router.post("/users/:userId/payment-methods", async (req, res) => {
  try {
    const userId = parseInt(req.params.userId, 10);
    if (!Number.isInteger(userId) || userId < 1) {
      return res.status(400).json({ error: "Invalid user ID" });
    }
    const id = await paymentMethods.add(userId, req.body);
    res.status(201).json({ payment_method_id: id });
  } catch (err) {
    console.error("Add payment method error:", err);
    const message = err && err.message ? err.message : "Failed to add payment method";
    res.status(500).json({ error: message });
  }
});

/* Remove payment method */
router.delete("/users/:userId/payment-methods/:id", async (req, res) => {
  try {
    const n = await paymentMethods.remove(req.params.id, req.params.userId);
    if (n === 0) return res.status(404).json({ error: "Payment method not found" });
    res.json({ deleted: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to remove payment method" });
  }
});

/* Update donation */
router.put("/donations/:id", async (req, res) => {
  try {
    const affected = await donations.updateDonation(req.params.id, req.body);

    if (affected === 0) {
      return res.status(404).json({ error: "Donation not found" });
    }

    res.json({ updated: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update donation" });
  }
});

/* Delete donation */
router.delete("/donations/:id", async (req, res) => {
  try {
    const affected = await donations.deleteDonation(req.params.id);

    if (affected === 0) {
      return res.status(404).json({ error: "Donation not found" });
    }

    res.json({ deleted: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to delete donation" });
  }
});

/*
--------------------------------
OPPORTUNITIES & GLOBAL ISSUES
--------------------------------
*/

/* Get opportunities (query: urgency, country, issue_id) */
router.get("/opportunities", async (req, res) => {
  try {
    const result = await opportunities.getOpportunities(req.query);
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to retrieve opportunities" });
  }
});

/* Get featured opportunity (home page) */
router.get("/opportunities/featured", async (req, res) => {
  try {
    const result = await opportunities.getFeaturedOpportunity();
    if (!result) return res.status(404).json({ error: "No featured opportunity" });
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to retrieve featured opportunity" });
  }
});

/* Get 3 related charities (same causes) for an opportunity – uses SQL DB only */
router.get("/opportunities/:opportunityId/related-charities", async (req, res) => {
  try {
    const list = await charities.getRelatedCharitiesForOpportunity(req.params.opportunityId, 3);
    res.json(list);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to retrieve related charities" });
  }
});

/* Get opportunity by ID */
router.get("/opportunities/:id", async (req, res) => {
  try {
    const result = await opportunities.getOpportunityById(req.params.id);
    if (!result) return res.status(404).json({ error: "Opportunity not found" });
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to retrieve opportunity" });
  }
});

/* Get global issues with opportunity counts */
router.get("/global-issues", async (req, res) => {
  try {
    const result = await globalIssues.getGlobalIssuesWithCounts();
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to retrieve global issues" });
  }
});

/* Get one charity by id from charity_registry.json (for Support Initiative modal) */
function getCharityRegistryPath() {
  const fromDir = path.resolve(__dirname, "data", "charity_registry.json");
  if (fs.existsSync(fromDir)) return fromDir;
  const fromCwd = path.resolve(process.cwd(), "backend", "data", "charity_registry.json");
  if (fs.existsSync(fromCwd)) return fromCwd;
  return fromDir;
}
router.get("/charities/:charityId", (req, res) => {
  try {
    const registryPath = getCharityRegistryPath();
    const raw = fs.readFileSync(registryPath, "utf8");
    const registry = JSON.parse(raw);
    const list = registry.charities || [];
    const charityIdParam = (req.params.charityId || "").toString().trim();
    const charity = list.find((c) => (c.charity_id || "").toString().trim() === charityIdParam);
    if (!charity) return res.status(404).json({ error: "Charity not found" });
    res.json(charity);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to retrieve charity" });
  }
});

router.post("/login", async (req, res) => {

  try {

    const email = req.body.email;
    const password = req.body.password;

    if (!email || !password) {
      return res.status(400).json({ success: false, error: "Missing email or password" });
    }

    const sql = `
      SELECT user_id, email, password
      FROM users
      WHERE email = ?
    `;

    const [rows] = await db.execute(sql, [email]);

    if (rows.length === 0) {
      return res.json({ success: false });
    }

    const user = rows[0];

    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return res.json({ success: false });
    }

    return res.json({
      success: true,
      user_id: user.user_id
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: "Server error" });
  }

});

module.exports = router;
