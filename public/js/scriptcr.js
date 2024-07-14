document.addEventListener('DOMContentLoaded', function () {
    const createRoomForm = document.getElementById('createRoomForm');
    const createPopup = document.getElementById('cr-room-popup');
    const apiKey = 'patSeS1lNaFzWwi1M.9ec5749dab488f239bd36bcbd43ab537899bf6c91d62eb98130632dd611cea6a'; // Placeholder for the masked environment variable

    // Include session.js
    const sessionScript = document.createElement('script');
    sessionScript.src = 'session.js';
    document.head.appendChild(sessionScript);

    // Function to clear cookies and redirect to index.html on refresh
    if (performance.navigation.type === 1) {
        clearSessionAndRedirect();
    }

    createRoomForm.addEventListener('submit', async function (e) {
        e.preventDefault();

        const roomName = sanitizeInput(document.getElementById('roomName').value.trim());
        const roomPassword = sanitizeInput(document.getElementById('roomPassword').value.trim());

        if (!roomName || !roomPassword) {
            alert('Please enter both room name and password.');
            return;
        }

        const encryptedPassword = encrypt(roomPassword, roomName);

        createPopup.style.display = 'flex';

        try {
            const response = await fetch('https://api.airtable.com/v0/appFzJMkLp7DiSXxA/tblIrRmKOOQClTJRM', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    "records": [
                        {
                            "fields": {
                                "Room": roomName,
                                "Password": encryptedPassword
                            }
                        }
                    ]
                })
            });

            const data = await response.json();
            createPopup.style.display = 'none';
            if (data.records.length > 0) {
                sessionStorage.setItem('roomName', roomName);
                sessionStorage.setItem('roomPassword', roomPassword);
                createSessionToken(); // Create a new session token
                window.location.href = 'room.html';
            } else {
                alert('Error creating the room. Please try again.');
            }
        } catch (error) {
            console.error('Error creating room:', error);
            createPopup.style.display = 'none';
        }
    });

    document.getElementById('toggleToJoin').addEventListener('click', function (e) {
        e.preventDefault();
        document.getElementById('createRoomForm').style.display = 'none';
        document.getElementById('joinRoomForm').style.display = 'block';
    });

    function encrypt(text, key) {
        return CryptoJS.AES.encrypt(text, key).toString();
    }

    function sanitizeInput(input) {
        const element = document.createElement('div');
        element.innerText = input;
        return element.innerHTML;
    }

    function clearSessionAndRedirect() {
        sessionStorage.removeItem('roomName');
        sessionStorage.removeItem('roomPassword');
        window.location.href = 'index.html';
    }
});

