document.addEventListener('DOMContentLoaded', function () {
    const joinRoomForm = document.getElementById('joinRoomForm');
    const joinPopup = document.getElementById('join-room-popup');
    const apiKey = 'patSeS1lNaFzWwi1M.9ec5749dab488f239bd36bcbd43ab537899bf6c91d62eb98130632dd611cea6a'; // Function to retrieve the API key securely

    // Include session.js
    const sessionScript = document.createElement('script');
    sessionScript.src = 'session.js';
    document.head.appendChild(sessionScript);

    // Function to clear cookies and redirect to index.html on refresh
    if (performance.navigation.type === 1) {
        clearSessionAndRedirect();
    }

    joinRoomForm.addEventListener('submit', async function (e) {
        e.preventDefault();

        const roomName = sanitizeInput(document.getElementById('joinRoomName').value.trim());
        const roomPassword = sanitizeInput(document.getElementById('joinRoomPassword').value.trim());

        if (!roomName || !roomPassword) {
            alert('Please enter both room name and password.');
            return;
        }

        joinPopup.style.display = 'flex';

        try {
            const response = await fetch(`https://api.airtable.com/v0/appFzJMkLp7DiSXxA/tblIrRmKOOQClTJRM?filterByFormula=AND({Room}='${encodeURIComponent(roomName)}')`, {
                headers: {
                    'Authorization': `Bearer ${apiKey}`
                }
            });

            const data = await response.json();
            joinPopup.style.display = 'none';
            if (data.records.length > 0) {
                const encryptedPassword = data.records[0].fields.Password;
                const decryptedPassword = decrypt(encryptedPassword, roomName);

                if (decryptedPassword === roomPassword) {
                    sessionStorage.setItem('roomName', roomName);
                    sessionStorage.setItem('roomPassword', roomPassword);
                    createSessionToken(); // Create a new session token
                    window.location.href = 'room.html';
                } else {
                    alert('Invalid room name or password.');
                }
            } else {
                alert('Invalid room name or password.');
            }
        } catch (error) {
            console.error('Error joining room:', error);
            joinPopup.style.display = 'none';
        }
    });

    document.getElementById('toggleToCreate').addEventListener('click', function (e) {
        e.preventDefault();
        document.getElementById('joinRoomForm').style.display = 'none';
        document.getElementById('createRoomForm').style.display = 'block';
    });

    function decrypt(ciphertext, key) {
        const bytes = CryptoJS.AES.decrypt(ciphertext, key);
        return bytes.toString(CryptoJS.enc.Utf8);
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



