from js import document, fetch
import json

API_URL = 'https://ishan999.pythonanywhere.com/api/'
currentUser = None

def qs(selector):
    return document.querySelector(selector)

def showMessage(containerSelector, message, isError=False):
    container = qs(containerSelector)
    container.textContent = message
    container.style.color = 'red' if isError else 'green'
    def clear_msg(*args):
        container.textContent = ''
    __import__("pyodide").code.run_js(f"setTimeout(() => {{ document.querySelector('{containerSelector}').textContent = '' }}, 3000)")

def showSection(id):
    sections = document.querySelectorAll('.section')
    for sec in sections:
        sec.style.display = 'none'
    document.getElementById(id).style.display = 'block'

    buttons = document.querySelectorAll('nav button')
    for btn in buttons:
        btn.classList.remove('active')
    document.querySelector(f"nav button[onclick=\"showSection('{id}')\"]").classList.add('active')

async def login(*args):
    global currentUser
    username = qs('#username-input').value.strip()
    password = qs('#password-input').value.strip()
    if not username or not password:
        showMessage('#auth-message', 'Please enter username and password', True)
        return
    try:
        res = await fetch(f"{API_URL}/login", {
            "method": "POST",
            "headers": {"Content-Type": "application/json"},
            "credentials": "include",
            "body": json.dumps({"username": username, "password": password})
        })
        data = await res.json()
        if res.ok:
            currentUser = data.to_py().get("user")
            await afterLogin()
            showMessage('#auth-message', 'Login successful!')
        else:
            showMessage('#auth-message', data.to_py().get("error", "Login failed"), True)
    except Exception:
        showMessage('#auth-message', 'Network error', True)

async def register(*args):
    username = qs('#username-input').value.strip()
    password = qs('#password-input').value.strip()
    if not username or not password:
        showMessage('#auth-message', 'Please enter username and password', True)
        return
    try:
        res = await fetch(f"{API_URL}/register", {
            "method": "POST",
            "headers": {"Content-Type": "application/json"},
            "body": json.dumps({"username": username, "password": password})
        })
        data = await res.json()
        if res.ok:
            showMessage('#auth-message', 'Registration successful! You can now login.')
        else:
            showMessage('#auth-message', data.to_py().get("error", "Registration failed"), True)
    except Exception:
        showMessage('#auth-message', 'Network error', True)

async def logout(*args):
    global currentUser
    await fetch(f"{API_URL}/logout", {
        "method": "POST",
        "credentials": "include"
    })
    currentUser = None
    qs('#main-section').style.display = 'none'
    qs('#auth-section').style.display = 'block'
    qs('#username-input').value = ''
    qs('#password-input').value = ''
    showMessage('#auth-message', 'Logged out')
    clearUI()

async def afterLogin():
    qs('#auth-section').style.display = 'none'
    qs('#main-section').style.display = 'block'
    qs('#user-name-display').textContent = currentUser.get("username", "Player")
    updateXP(currentUser.get("xp", 0), currentUser.get("level", 1))
    await loadVault()
    await loadDeck()
    await loadLeaderboard()
    showSection("draw-section")

def updateXP(xp, level):
    percent = min((xp / 100) * 100, 100)
    qs('#xp-fill').style.width = f"{percent}%"

async def drawCard(*args):
    if not currentUser: return
    try:
        res = await fetch(f"{API_URL}/draw", {
            "method": "POST",
            "credentials": "include"
        })
        data = await res.json()
        if res.ok:
            qs('#draw-result').textContent = f"You drew a: {data.to_py()['card']}"
            await loadDeck()
        else:
            qs('#draw-result').textContent = data.to_py().get("error", "Draw failed")
    except:
        qs('#draw-result').textContent = "Network error"

async def loadDeck():
    if not currentUser: return
    try:
        res = await fetch(f"{API_URL}/deck", {
            "method": "GET",
            "credentials": "include"
        })
        data = await res.json()
        deckList = qs('#deck-list')
        deckList.innerHTML = ''
        if res.ok:
            deck = data.to_py().get("deck", {})
            if not deck:
                deckList.textContent = 'No cards in deck.'
                return
            for card, qty in deck.items():
                div = document.createElement('div')
                div.textContent = f"{card} x{qty} "
                sellBtn = document.createElement('button')
                sellBtn.textContent = 'Sell 1'
                sellBtn.onclick = lambda e, c=card: sellCard(c, 1)
                div.appendChild(sellBtn)
                deckList.appendChild(div)
        else:
            deckList.textContent = data.to_py().get("error", "Failed to load deck")
    except:
        qs('#deck-list').textContent = "Network error"

async def sellCard(card, qty):
    if not currentUser: return
    try:
        res = await fetch(f"{API_URL}/sell", {
            "method": "POST",
            "credentials": "include",
            "headers": {"Content-Type": "application/json"},
            "body": json.dumps({"card": card, "qty": qty})
        })
        data = await res.json()
        if res.ok:
            showMessage('#draw-result', data.to_py().get("message", "Sold!"))
            await loadVault()
            await loadDeck()
        else:
            showMessage('#draw-result', data.to_py().get("error", "Sell failed"), True)
    except:
        showMessage('#draw-result', "Network error", True)

async def loadVault():
    if not currentUser: return
    try:
        res = await fetch(f"{API_URL}/vault", {
            "method": "GET",
            "credentials": "include"
        })
        data = await res.json()
        if res.ok:
            qs('#coin-count').textContent = str(data.to_py().get("coins", 0))
        else:
            qs('#coin-count').textContent = "0"
    except:
        qs('#coin-count').textContent = "0"

async def loadLeaderboard():
    qs('#leaderboard-list').innerHTML = "<li>Coming soon...</li>"

async def init():
    try:
        res = await fetch(f"{API_URL}/user", {
            "method": "GET",
            "credentials": "include"
        })
        data = await res.json()
        if res.ok:
            if not data.to_py().get("error"):
                global currentUser
                currentUser = data.to_py()["user"]
                await afterLogin()
                return
    except:
        pass
    qs('#auth-section').style.display = 'block'

def clearUI():
    qs('#draw-result').textContent = ''
    qs('#deck-list').textContent = ''
    qs('#coin-count').textContent = '0'
    qs('#user-name-display').textContent = ''
    qs('#xp-fill').style.width = '0%'
    qs('#leaderboard-list').innerHTML = ''

# Call init after slight delay (to allow DOM to load)
from pyodide.ffi import create_proxy
import asyncio
asyncio.ensure_future(init())

from pyodide.ffi import create_proxy

# Bind buttons after DOM is ready
def bind_buttons():
    login_btn = qs('#login-btn')
    register_btn = qs('#register-btn')
    logout_btn = qs('#logout-btn')
    draw_btn = qs('#draw-btn')

    if login_btn:
        login_btn.addEventListener('click', create_proxy(login))
    if register_btn:
        register_btn.addEventListener('click', create_proxy(register))
    if logout_btn:
        logout_btn.addEventListener('click', create_proxy(logout))
    if draw_btn:
        draw_btn.addEventListener('click', create_proxy(drawCard))

# Run bind_buttons after page load
import asyncio
async def main():
    await asyncio.sleep(1)  # Wait for DOM to be ready
    bind_buttons()
    await init()

asyncio.ensure_future(main())