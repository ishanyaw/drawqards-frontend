const apiUrl = "https://ishan999.pythonanywhere.com/api";

async function registerUser(username, password) {
    try {
        const response = await fetch(`${apiUrl}/register`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ username, password })
        });

        const data = await response.json();
        if (response.ok) {
            alert("✅ Registered: " + data.message);
        } else {
            alert("❌ Error: " + data.error);
        }
    } catch (error) {
        alert("❌ Network error: " + error.message);
    }
}

async function loginUser(username, password) {
    try {
        const response = await fetch(`${apiUrl}/login`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ username, password })
        });

        const data = await response.json();
        if (response.ok) {
            alert("✅ Logged in: " + data.message);
        } else {
            alert("❌ Error: " + data.error);
        }
    } catch (error) {
        alert("❌ Network error: " + error.message);
    }
}

async function fetchLeaderboard() {
    try {
        const response = await fetch(`${apiUrl}/leaderboard`);
        const data = await response.json();
        if (response.ok) {
            console.log("🏆 Leaderboard:", data);
        } else {
            alert("❌ Failed to load leaderboard.");
        }
    } catch (error) {
        alert("❌ Network error: " + error.message);
    }
}