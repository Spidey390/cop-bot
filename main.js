const backendUrl = "https://cop-bot.onrender.com"; // Use deployed backend URL

document.addEventListener("DOMContentLoaded", () => {
    fetch("complaint_data.json")
        .then(response => response.json())
        .then(data => {
            complaintData = data;
            setTimeout(showCategories, 500); // Ensure UI loads first
        })
        .catch(error => console.error("Error loading complaint data:", error));
});

function showSummary() {
    let summary = {
        Category: selectedCategory,
        TypeOfCase: selectedCaseType,
        PlaceOfIncident: collectedDetails["Place of Incident"],
        Witness: collectedDetails["Witness/Proof Available?"],
        ComplainantName: collectedDetails["Complainant Name"],
        MobileNumber: collectedDetails["Mobile Number"],
        Timestamp: new Date().toLocaleString()
    };

    // Send complaint data to backend for storage
    fetch(`${backendUrl}/save-complaint`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(summary)
    })
        .then(response => response.json())
        .then(data => {
            appendMessage("bot", "✅ " + data.message);
            showFinalMessage();
        })
        .catch(error => appendMessage("bot", "❌ Error saving complaint."));
}
