const express = require("express");
const bcrypt = require("bcrypt");
const db = require("./helpers/db/db_conn");
const users = require("./helpers/db/users");
const donations = require("./helpers/db/donations");
const router = express.Router();

/*
--------------------------------
USER ROUTES
--------------------------------
*/

/* Create user */
router.post("/users", async (req, res) => {
  try {
    const id = await users.createUser(req.body);
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

router.post("/login", async (req, res) => {

  try {

    const { email, password } = req.body;

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
