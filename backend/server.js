require("dotenv").config();
const express = require("express");

const dbRoutes = require("./server_db");

const app = express();

app.use(express.json());

/* Mount DB routes */
app.use("/api", dbRoutes);


/*
--------------------------------
OTHER ROUTES (selenium etc.)
--------------------------------
*/

app.get("/scrape/test", async (req, res) => {

  // selenium logic later
  res.json({ message: "selenium endpoint placeholder" });

});


/*
--------------------------------
START SERVER
--------------------------------
*/

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
