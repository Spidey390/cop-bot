let complaintData = [];
let stage = 0;
let selectedCategory = "";
let selectedCaseType = "";
let collectedDetails = {};

// Load complaint categories when page loads
document.addEventListener("DOMContentLoaded", () => {
    fetch("complaint_data.json")
        .then(response => response.json())
        .then(data => {
            complaintData = data;
            setTimeout(showCategories, 500); // Ensure UI loads first
        })
        .catch(error => console.error("Error loading complaint data:", error));
});

// Show complaint categories
function showCategories() {
    let categories = [...new Set(complaintData.map(item => item.Category))];
    let message = "📌 Please select a complaint category:<br><br>";
    categories.forEach((cat, index) => {
        message += `${index + 1}. ${cat}<br>`;
    });
    appendMessage("bot", message);
}

// Handle user input
function sendMessage() {
    let inputField = document.getElementById("userInput");
    let userMessage = inputField.value.trim();
    if (!userMessage) return;

    appendMessage("user", userMessage);
    inputField.value = "";

    if (stage === 0) {
        selectCategory(userMessage);
    } else if (stage === 1) {
        selectCaseType(userMessage);
    } else if (stage === 2) {
        collectDetails(userMessage);
    }
}

// Select complaint category
function selectCategory(userMessage) {
    let categories = [...new Set(complaintData.map(item => item.Category))];
    let selectedIndex = parseInt(userMessage) - 1;

    if (selectedIndex >= 0 && selectedIndex < categories.length) {
        selectedCategory = categories[selectedIndex];
        stage = 1;
        showCaseTypes(selectedCategory);
    } else {
        appendMessage("bot", "❌ Invalid selection. Please enter a valid number.");
    }
}

// Show case types based on selected category
function showCaseTypes(category) {
    let cases = complaintData.filter(item => item.Category === category);
    let message = `✅ You selected <b>${category}</b>. Now, choose the type of case:<br><br>`;
    cases.forEach((c, index) => {
        message += `${index + 1}. ${c["Type of Case"]}<br>`;
    });
    appendMessage("bot", message);
}

// Select case type
function selectCaseType(userMessage) {
    let caseTypes = complaintData.filter(item => item.Category === selectedCategory);
    let selectedIndex = parseInt(userMessage) - 1;

    if (selectedIndex >= 0 && selectedIndex < caseTypes.length) {
        selectedCaseType = caseTypes[selectedIndex]["Type of Case"];
        stage = 2;
        askDetails();
    } else {
        appendMessage("bot", "❌ Invalid selection. Please enter a valid number.");
    }
}

// Ask for complaint details
function askDetails() {
    appendMessage("bot", "🔹 Please enter: Place of Incident");
}

// Collect user responses for complaint details
function collectDetails(userMessage) {
    let keys = ["Place of Incident", "Witness/Proof Available?", "Complainant Name", "Mobile Number"];
    let key = keys[Object.keys(collectedDetails).length];
    collectedDetails[key] = userMessage;

    if (Object.keys(collectedDetails).length < keys.length) {
        appendMessage("bot", `🔹 Please enter: ${keys[Object.keys(collectedDetails).length]}`);
    } else {
        stage = 3;
        showSummary();
    }
}

// Show complaint summary and save data
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
    fetch("http://localhost:3000/save-complaint", {
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

    appendMessage("bot", `
        ✅ <b>Complaint Summary:</b><br><br>
        <b>Category:</b> ${summary.Category}<br>
        <b>Type of Case:</b> ${summary.TypeOfCase}<br>
        <b>Place of Incident:</b> ${summary.PlaceOfIncident}<br>
        <b>Witness/Proof Available?:</b> ${summary.Witness}<br>
        <b>Complainant Name:</b> ${summary.ComplainantName}<br>
        <b>Mobile Number:</b> ${summary.MobileNumber}<br><br>
    `);
}


// Show final message and refresh button
function showFinalMessage() {
    appendMessage("bot", `
        🎉 <b>Your case was successfully filed.</b><br>
        🚔 A police officer will contact you soon.<br><br>
        <button onclick="refreshChat()" class="refresh-button">🔄 Refresh</button>
    `);

    // Show the final message for 10 seconds
    setTimeout(() => {
        appendMessage("bot", "<i>Refreshing chat...</i>");
        refreshChat(); // Refresh the chat after 10 seconds
    }, 10000); // 10 seconds
}



// Function to refresh the chat
function refreshChat() {
    console.log("Refresh button clicked"); // Debug log
    document.getElementById("chatBox").innerHTML = "";
    stage = 0;
    selectedCategory = "";
    selectedCaseType = "";
    collectedDetails = {};
    showCategories();
}




// Append messages to chat
function appendMessage(sender, message) {
    let chatBox = document.getElementById("chatBox");
    let messageDiv = document.createElement("div");
    messageDiv.classList.add("message");

    let messageSpan = document.createElement("span");
    messageSpan.innerHTML = message;

    if (sender === "user") {
        messageSpan.classList.add("user-message");
        messageDiv.style.justifyContent = "flex-end"; // Align user messages to right
    } else {
        messageSpan.classList.add("bot-message");
        messageDiv.style.justifyContent = "flex-start"; // Align bot messages to left
    }

    messageDiv.appendChild(messageSpan);
    chatBox.appendChild(messageDiv);
    chatBox.scrollTop = chatBox.scrollHeight; // Auto-scroll to latest message
}
// Send message when pressing Enter
document.getElementById("userInput").addEventListener("keypress", function (event) {
    if (event.key === "Enter") {
        event.preventDefault(); // Prevent new line
        sendMessage(); // Call sendMessage function
    }
});
