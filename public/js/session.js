// Function to create a session token
function createSessionToken() {
    const token = Math.random().toString(36).substring(2);
    const expirationTime = Date.now() + 10* 60 * 1000; // 1 minute from now
    localStorage.setItem('sessionToken', token);
    localStorage.setItem('sessionExpiration', expirationTime);
    return token;
}

// Function to check if the session token is valid
function isSessionTokenValid() {
    const token = localStorage.getItem('sessionToken');
    const expirationTime = localStorage.getItem('sessionExpiration');
    if (!token || !expirationTime) return false;
    return Date.now() < parseInt(expirationTime, 10);
}

// Function to handle session expiration
function handleSessionExpiration() {
    alert('Your session has expired. Please join the room again.');
    clearCookiesAndRedirect();
}

// Function to clear cookies and redirect
function clearCookiesAndRedirect() {
    document.cookie.split(";").forEach(function (c) {
        document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
    });
    window.location.href = '/'; // Redirect to home or login page
}

// Function to start session timer
function startSessionTimer() {
    const sessionExpiration = localStorage.getItem('sessionExpiration');
    const timeRemaining = sessionExpiration - Date.now();
    if (timeRemaining > 0) {
        setTimeout(handleSessionExpiration, timeRemaining);
        updateTimerDisplay(timeRemaining);
    } else {
        handleSessionExpiration();
    }
}

// Function to update the session timer display
function updateTimerDisplay(timeRemaining) {
    const timerElement = document.getElementById('sessionTimer');
    const minutes = Math.floor(timeRemaining / 60000);
    const seconds = Math.floor((timeRemaining % 60000) / 1000);
    timerElement.textContent = `${minutes}m ${seconds}s`;

    if (timeRemaining > 0) {
        setTimeout(() => {
            updateTimerDisplay(timeRemaining - 1000);
        }, 1000);
    }
}

// Event listeners for form toggling, if applicable
function initializeFormToggle() {
    const toggleToCreate = document.getElementById('toggleToCreate');
    const toggleToJoin = document.getElementById('toggleToJoin');

    if (toggleToCreate && toggleToJoin) {
        toggleToCreate.addEventListener('click', function (e) {
            e.preventDefault();
            document.getElementById('joinRoomForm').style.display = 'none';
            document.getElementById('createRoomForm').style.display = 'block';
        });

        toggleToJoin.addEventListener('click', function (e) {
            e.preventDefault();
            document.getElementById('joinRoomForm').style.display = 'block';
            document.getElementById('createRoomForm').style.display = 'none';
        });
    }
}

// Start the session timer when the page loads
document.addEventListener('DOMContentLoaded', function () {
    if (isSessionTokenValid()) {
        startSessionTimer();
    } else {
        createSessionToken();
        startSessionTimer();
    }
    initializeFormToggle();
});

