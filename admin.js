const backendUrl = "https://cop-bot.onrender.com"; // Use deployed backend URL

document.addEventListener("DOMContentLoaded", () => {
    loadComplaints();
});

function loadComplaints() {
    fetch(`${backendUrl}/get-complaints`)
        .then(response => response.json())
        .then(data => {
            let tableBody = document.querySelector("#complaintTable tbody");
            tableBody.innerHTML = ""; // Clear existing rows

            data.forEach((complaint, index) => {
                let row = document.createElement("tr");
                row.innerHTML = `
                    <td>${complaint.Category}</td>
                    <td>${complaint.TypeOfCase}</td>
                    <td>${complaint.PlaceOfIncident}</td>
                    <td>${complaint.Witness}</td>
                    <td>${complaint.ComplainantName}</td>
                    <td>${complaint.MobileNumber}</td>
                    <td>${complaint.Timestamp}</td>
                    <td><button class="delete-btn" onclick="deleteComplaint(${index})">🗑 Delete</button></td>
                `;
                tableBody.appendChild(row);
            });
        })
        .catch(error => console.error("Error loading complaints:", error));
}

function deleteComplaint(index) {
    if (!confirm("Are you sure you want to delete this complaint?")) return;

    fetch(`${backendUrl}/delete-complaint/${index}`, { method: "DELETE" })
        .then(response => response.json())
        .then(data => {
            alert(data.message);
            loadComplaints(); // Reload the table after deleting
        })
        .catch(error => console.error("Error deleting complaint:", error));
}
