document.addEventListener('DOMContentLoaded', function () {
    const roomName = sessionStorage.getItem('roomName');
    const roomPassword = sessionStorage.getItem('roomPassword');
    const apiKey = 'patSeS1lNaFzWwi1M.9ec5749dab488f239bd36bcbd43ab537899bf6c91d62eb98130632dd611cea6a'; // Placeholder for the masked environment variable

    // Include session.js for session management
    const sessionScript = document.createElement('script');
    sessionScript.src = 'session.js';
    document.head.appendChild(sessionScript);

    // Include style.css for custom styles
    const styleLink = document.createElement('link');
    styleLink.rel = 'stylesheet';
    styleLink.href = 'style.css';
    document.head.appendChild(styleLink);

    // Function to clear cookies and redirect to index.html on refresh or close
    window.addEventListener('beforeunload', clearSessionAndRedirect);
    
    if (performance.navigation.type === 1) { // Check for page refresh
        clearSessionAndRedirect();
    }

    if (!roomName || !roomPassword) {
        alert('Room data is missing.');
        window.location.href = 'index.html';
        return;
    }

    // Function to update the page title
    function updateTitle(newTitle) {
        document.title = newTitle;
        const headerTitle = document.querySelector('h2');
        if (headerTitle) {
            headerTitle.textContent = newTitle;
        }
    }

    updateTitle(roomName); // Set the initial title

    // Fetch room details to validate room password
    fetch(`https://api.airtable.com/v0/appFzJMkLp7DiSXxA/tblIrRmKOOQClTJRM?filterByFormula=AND({Room}='${encodeURIComponent(roomName)}')`, {
        headers: {
            'Authorization': `Bearer ${apiKey}`
        }
    })
    .then(response => response.json())
    .then(data => {
        if (data.records.length === 0) {
            alert('No such room exists.');
            window.location.href = 'index.html';
            return;
        }

        const encryptedPassword = data.records[0].fields.Password;
        const decryptedPassword = decrypt(encryptedPassword, roomName);

        if (decryptedPassword !== roomPassword) {
            alert('Invalid room password.');
            window.location.href = 'index.html';
            return;
        }

        // Password validation successful, fetch room files
        fetch(`https://api.airtable.com/v0/appFzJMkLp7DiSXxA/tblIrRmKOOQClTJRM?filterByFormula=AND({Room}='${encodeURIComponent(roomName)}')`, {
            headers: {
                'Authorization': `Bearer ${apiKey}`
            }
        })
        .then(response => response.json())
        .then(data => {
            const filesList = document.getElementById('filesList');
            filesList.innerHTML = '';

            data.records.forEach(record => {
                if (record.fields.FileName) {
                    const encryptedFileName = record.fields.FileName;
                    const decryptedFileName = decrypt(encryptedFileName, roomPassword);
                    const fileItem = document.createElement('li');

                    const filePreview = createFilePreview(decryptedFileName);
                    fileItem.appendChild(filePreview);

                    const fileNameSpan = document.createElement('span');
                    fileNameSpan.textContent = decryptedFileName;
                    fileNameSpan.classList.add('file-name');

                    fileItem.appendChild(fileNameSpan);

                    fileItem.onclick = () => handleFileClick(record, roomPassword);
                    filesList.appendChild(fileItem);
                }
            });
        })
        .catch(error => {
            console.error('Error fetching files:', error);
        });
    })
    .catch(error => {
        console.error('Error fetching room details:', error);
    });

    document.getElementById('searchForm').addEventListener('submit', function (e) {
        e.preventDefault();
        const searchInput = document.getElementById('searchInput').value.toLowerCase();
        const fileItems = document.querySelectorAll('#filesList li');

        fileItems.forEach(item => {
            item.style.display = item.textContent.toLowerCase().includes(searchInput) ? 'block' : 'none';
        });
    });

    function decrypt(ciphertext, key) {
        try {
            const bytes = CryptoJS.AES.decrypt(ciphertext, key);
            return bytes.toString(CryptoJS.enc.Utf8);
        } catch (error) {
            console.error('Decryption error:', error);
            return null;
        }
    }

    function handleFileClick(record, roomPassword) {
        const blurBackground = document.getElementById('blurBackground');
        const passwordPopup = document.getElementById('passwordPopup');
        const submitPasswordBtn = document.getElementById('submitPasswordBtn');
        const filePasswordInput = document.getElementById('filePasswordInput');

        blurBackground.style.display = 'block';
        passwordPopup.style.display = 'block';

        submitPasswordBtn.onclick = () => {
            const filePassword = filePasswordInput.value;
            if (filePassword) {
                const encryptedFilePassword = record.fields.FilePassword;
                const decryptedFilePassword = decrypt(encryptedFilePassword, roomPassword);
                if (filePassword === decryptedFilePassword) {
                    fetch(record.fields.FileUrl)
                        .then(response => response.text())
                        .then(encryptedFileContent => {
                            const decryptedFileContent = decrypt(encryptedFileContent, filePassword);
                            displayDecryptedFile(decryptedFileContent);
                        })
                        .catch(error => {
                            console.error('Error fetching file:', error);
                            alert('Error fetching file. Please try again.');
                        });
                } else {
                    alert('Incorrect file password.');
                }
            }
            blurBackground.style.display = 'none';
            passwordPopup.style.display = 'none';
            filePasswordInput.value = '';
        };
    }

    let fileCloseTimeout;
    let openedFileWindow;

    function displayDecryptedFile(decryptedFileContent) {
        const fileBlob = dataURLToBlob(decryptedFileContent);
        const fileURL = URL.createObjectURL(fileBlob);
        openedFileWindow = window.open(fileURL, '_blank');

        // Automatically close the file after 10 minutes
        fileCloseTimeout = setTimeout(() => {
            if (openedFileWindow && !openedFileWindow.closed) {
                openedFileWindow.close();
                alert('File closed automatically after 10 minutes.');
            }
        }, 10 * 60 * 1000);
    }

    function dataURLToBlob(dataURL) {
        const byteString = atob(dataURL.split(',')[1]);
        const mimeString = dataURL.split(',')[0].split(':')[1].split(';')[0];
        const ab = new ArrayBuffer(byteString.length);
        const ia = new Uint8Array(ab);
        for (let i = 0; i < byteString.length; i++) {
            ia[i] = byteString.charCodeAt(i);
        }
        return new Blob([ab], { type: mimeString });
    }

    function clearSessionAndRedirect() {
        // Close the opened file window if it exists
        if (openedFileWindow && !openedFileWindow.closed) {
            openedFileWindow.close();
        }
        
        // Clear the file close timeout if set
        if (fileCloseTimeout) {
            clearTimeout(fileCloseTimeout);
        }

        // sessionStorage.removeItem('roomName');
        // sessionStorage.removeItem('roomPassword');
        window.location.href = 'index.html';
    }

    function createFilePreview(fileName) {
        const fileExtension = fileName.split('.').pop().toLowerCase();
        const preview = document.createElement('span');
        preview.classList.add('file-preview');

        switch (fileExtension) {
            case 'docx':
                preview.classList.add('docx');
                break;
            case 'mp4':
                preview.classList.add('mp4');
                break;
            default:
                preview.classList.add('default');
        }

        preview.textContent = '.' + fileExtension;

        return preview;
    }
});





