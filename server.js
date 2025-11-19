// server.js
const express = require("express");
const fs = require("fs");
const path = require("path");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_FILE = path.join(__dirname, "quiz_results.json");

// Middleware
app.use(cors()); // allow requests from any origin; tighten in production
app.use(express.json()); // parse JSON body

// Ensure file exists and is a valid JSON array
if (!fs.existsSync(DATA_FILE)) {
  fs.writeFileSync(DATA_FILE, "[]", "utf8");
}

// Health check route for UptimeRobot
app.get('/',(req,res) => {
	res.status(200).send('Server is running');
});

// POST endpoint to receive quiz results
app.post("/submit", (req, res) => {
  try {
    const entry = {
      timestamp: new Date().toISOString(),
      ...req.body
    };

    // Read current array, append, write back atomically
    const raw = fs.readFileSync(DATA_FILE, "utf8");
    const arr = JSON.parse(raw);
    arr.push(entry);
    fs.writeFileSync(DATA_FILE, JSON.stringify(arr, null, 2), "utf8");

    console.log("Received event:", entry);
    res.json({ status: "ok" });
  } catch (err) {
    console.error("Error writing data:", err);
    res.status(500).json({ status: "error", message: err.message });
  }
});

// Simple health check
app.get("/", (req, res) => res.send("Quiz analytics server running"));

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});