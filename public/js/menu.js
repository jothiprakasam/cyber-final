document.addEventListener("DOMContentLoaded", function() {
    const menuBtn = document.getElementById("menuBtn");
    const sideMenu = document.getElementById("sideMenu");
    const mainContent = document.querySelector("main");
    let menuOpen = false;

    // Initially hide the side menu
    sideMenu.style.display = "none";

    menuBtn.addEventListener("click", function() {
        if (menuOpen) {
            // Close the side menu
            sideMenu.style.display = "none";
            mainContent.classList.remove("blurred");
            menuBtn.innerHTML = `
                <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#e8eaed">
                    <path d="M120-240v-80h720v80H120Zm0-200v-80h720v80H120Zm0-200v-80h720v80H120Z"/>
                </svg>
            `;
        } else {
            // Open the side menu
            sideMenu.style.display = "block";
            mainContent.classList.add("blurred");
            menuBtn.innerHTML = `
                <svg xmlns="http://www.w3.org/2000/svg" height="20px" viewBox="0 -960 960 960" width="20px" fill="#e8eaed">
                    <path d="M960-840L840-960 480-600 120-960 0-840l360 360L0-120l120 120 360-360 360 360 120-120-360-360 360-360Z"/>
                </svg>
            `;
        }

        // Toggle menu state
        menuOpen = !menuOpen;
    });
});
