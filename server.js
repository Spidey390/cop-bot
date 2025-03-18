const express = require("express");
const fs = require("fs");
const cors = require("cors");

const app = express();
app.use(express.json());

// Enable CORS for Netlify frontend and local development
app.use(
    cors({
        origin: ["https://cop-bot.netlify.app", "http://localhost:5500"], // Allow Netlify & local testing
        methods: ["GET", "POST", "DELETE"],
        allowedHeaders: ["Content-Type"],
    })
);

const FILE_PATH = "complaints.json";

// Load complaints
app.get("/get-complaints", (req, res) => {
    fs.readFile(FILE_PATH, "utf8", (err, data) => {
        if (err) {
            console.error("Error reading file:", err);
            return res.status(500).json({ message: "Error reading file" });
        }
        res.json(JSON.parse(data || "[]"));
    });
});

// Save a new complaint
app.post("/save-complaint", (req, res) => {
    try {
        let newComplaint = req.body;
        let complaints = JSON.parse(fs.readFileSync(FILE_PATH, "utf8") || "[]");

        complaints.push(newComplaint);
        fs.writeFileSync(FILE_PATH, JSON.stringify(complaints, null, 4));

        res.json({ message: "Complaint saved successfully!" });
    } catch (error) {
        console.error("Error saving complaint:", error);
        res.status(500).json({ message: "Error saving complaint" });
    }
});

// Delete a specific complaint by index
app.delete("/delete-complaint/:index", (req, res) => {
    try {
        let index = parseInt(req.params.index);
        let complaints = JSON.parse(fs.readFileSync(FILE_PATH, "utf8") || "[]");

        if (index < 0 || index >= complaints.length) {
            return res.status(400).json({ message: "Invalid complaint index" });
        }

        complaints.splice(index, 1);
        fs.writeFileSync(FILE_PATH, JSON.stringify(complaints, null, 4));

        res.json({ message: "Complaint deleted successfully!" });
    } catch (error) {
        console.error("Error deleting complaint:", error);
        res.status(500).json({ message: "Error deleting complaint" });
    }
});

// Root route to check if server is running
app.get("/", (req, res) => {
    res.send("Police Assistance Chatbot Backend is running!");
});

// Start server with dynamic port for Render
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));