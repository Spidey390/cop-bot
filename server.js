const express = require("express");
const fs = require("fs");
const cors = require("cors");

const app = express();
app.use(express.json());
app.use(cors());

const FILE_PATH = "complaints.json";

// Load complaints
app.get("/get-complaints", (req, res) => {
    fs.readFile(FILE_PATH, "utf8", (err, data) => {
        if (err) return res.status(500).send("Error reading file");
        res.send(JSON.parse(data || "[]"));
    });
});

// Save a new complaint
app.post("/save-complaint", (req, res) => {
    let newComplaint = req.body;
    let complaints = JSON.parse(fs.readFileSync(FILE_PATH, "utf8") || "[]");
    complaints.push(newComplaint);
    fs.writeFileSync(FILE_PATH, JSON.stringify(complaints, null, 4));
    res.send({ message: "Complaint saved successfully!" });
});

// Delete a specific complaint by index
app.delete("/delete-complaint/:index", (req, res) => {
    let index = parseInt(req.params.index);
    let complaints = JSON.parse(fs.readFileSync(FILE_PATH, "utf8") || "[]");

    if (index < 0 || index >= complaints.length) {
        return res.status(400).send({ message: "Invalid complaint index" });
    }

    complaints.splice(index, 1); // Remove the complaint
    fs.writeFileSync(FILE_PATH, JSON.stringify(complaints, null, 4));
    res.send({ message: "Complaint deleted successfully!" });
});

// Start server
const PORT = 3000;
app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
