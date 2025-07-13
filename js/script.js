const API_URL = 'https://ishan999.pythonanywhere.com/api/';

async function login() {
  const username = document.getElementById('username-input').value.trim();
  const password = document.getElementById('password-input').value.trim();
  if (!username || !password) {
    alert('Enter username and password');
    return;
  }
  try {
    const res = await fetch(`${API_URL}/login`, {
      method: 'POST',
      credentials: 'include',   // Needed for cookie sessions if backend uses them
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password }),
    });
    if (!res.ok) {
      const err = await res.json();
      alert('Login failed: ' + (err.error || res.statusText));
      return;
    }
    const data = await res.json();
    alert('Login successful! Welcome ' + data.user.username);
    // Then do your post-login UI stuff here
  } catch (e) {
    alert('Network error: ' + e.message);
  }
}
