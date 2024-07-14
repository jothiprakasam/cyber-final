document.addEventListener('DOMContentLoaded', function () {
    const roomName = sessionStorage.getItem('roomName');
    const roomPassword = sessionStorage.getItem('roomPassword');
    const apiKey = 'patSeS1lNaFzWwi1M.9ec5749dab488f239bd36bcbd43ab537899bf6c91d62eb98130632dd611cea6a'; // Placeholder for the masked environment variable

    if (!roomName || !roomPassword) {
        alert('Room data is missing.');
        window.location.href = 'index.html';
        return;
    }

    window.onbeforeunload = function () {
        clearSessionAndRedirect();
    };

    const uploadForm = document.getElementById('uploadForm');
    uploadForm.addEventListener('submit', async function (e) {
        e.preventDefault();

        const fileInput = document.getElementById('fileInput');
        const filePassword = document.getElementById('filePassword').value;
        if (fileInput.files.length === 0) {
            alert('Please select a file.');
            return;
        }

        const file = fileInput.files[0];
        const encryptedFileName = encrypt(file.name, roomPassword);
        const encryptedFilePassword = encrypt(filePassword, roomPassword);
        const encryptedFile = await encryptFile(file, filePassword);

        const cloudinaryUrl = 'https://api.cloudinary.com/v1_1/dehhtuqnc/auto/upload';
        const cloudinaryData = new FormData();
        cloudinaryData.append('file', new Blob([encryptedFile], { type: 'text/plain' }), file.name + '.encrypted');
        cloudinaryData.append('upload_preset', 'cybercloud');

        showUploadPopup();

        const xhr = new XMLHttpRequest();
        xhr.open('POST', cloudinaryUrl, true);

        xhr.upload.onprogress = function (event) {
            if (event.lengthComputable) {
                updateProgress(event.loaded, event.total);
            }
        };

        xhr.onload = function () {
            if (xhr.status === 200) {
                const response = JSON.parse(xhr.responseText);
                if (response.secure_url) {
                    const fileUrl = response.secure_url;

                    const airtableData = {
                        "records": [
                            {
                                "fields": {
                                    "Room": roomName,
                                    "FileName": encryptedFileName,
                                    "FilePassword": encryptedFilePassword,
                                    "FileUrl": fileUrl,
                                    "File": [
                                        {
                                            "url": fileUrl,
                                            "filename": file.name + '.encrypted'
                                        }
                                    ]
                                }
                            }
                        ]
                    };

                    fetch('https://api.airtable.com/v0/appFzJMkLp7DiSXxA/tblIrRmKOOQClTJRM', {
                        method: 'POST',
                        headers: {
                            'Authorization': `Bearer ${apiKey}`,
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify(airtableData)
                    })
                        .then(response => response.json())
                        .then(data => {
                            if (data.records.length > 0) {
                                alert('File uploaded successfully!');
                                window.location.href = 'room.html';
                            } else {
                                alert('Error uploading file to Airtable. Please try again.');
                                hideUploadPopup();
                            }
                        })
                        .catch(error => {
                            console.error('Error uploading file to Airtable:', error);
                            hideUploadPopup();
                        });
                } else {
                    alert('Error uploading file to Cloudinary. Please try again.');
                    hideUploadPopup();
                }
            } else {
                alert('Error uploading file to Cloudinary. Please try again.');
                hideUploadPopup();
            }
        };

        xhr.onerror = function () {
            alert('Error uploading file to Cloudinary. Please try again.');
            hideUploadPopup();
        };

        xhr.send(cloudinaryData);
    });

    function encrypt(text, key) {
        return CryptoJS.AES.encrypt(text, key).toString();
    }

    function decrypt(text, key) {
        return CryptoJS.AES.decrypt(text, key).toString(CryptoJS.enc.Utf8);
    }

    function readFileAsDataURL(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    }

    async function encryptFile(file, password) {
        const fileDataUrl = await readFileAsDataURL(file);
        const encrypted = CryptoJS.AES.encrypt(fileDataUrl, password).toString();
        return encrypted;
    }

    function showUploadPopup() {
        const popup = document.getElementById('upload-popup');
        popup.style.display = 'flex';
        document.body.classList.add('blur');
    }

    function hideUploadPopup() {
        const popup = document.getElementById('upload-popup');
        popup.style.display = 'none';
        document.body.classList.remove('blur');
    }

    function updateProgress(loaded, total) {
        const progressText = document.querySelector('#upload-popup .popup-content p');
        progressText.textContent = `Uploaded ${formatFileSize(loaded)} of ${formatFileSize(total)}`;
    }

    function formatFileSize(bytes) {
        const units = ['B', 'KB', 'MB', 'GB', 'TB'];
        let unitIndex = 0;
        let size = bytes;

        while (size >= 1024 && unitIndex < units.length - 1) {
            size /= 1024;
            unitIndex++;
        }

        return `${size.toFixed(2)} ${units[unitIndex]}`;
    }

    function clearSessionAndRedirect() {
        window.location.href = 'index.html';
    }
});




