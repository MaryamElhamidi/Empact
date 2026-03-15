require("dotenv").config();
const express = require("express");
const cors = require("cors");

const dbRoutes = require("./server_db");
const modelRoutes = require("./server_agent");

const app = express();

app.use(cors({ origin: true }));
app.use(express.json());

/* Mount DB routes */
app.use("/api", dbRoutes);
app.use("/model", modelRoutes);

/*
--------------------------------
START SERVER
--------------------------------
*/

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
