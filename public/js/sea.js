document.addEventListener('DOMContentLoaded', function() {
    const menuBtn = document.getElementById('menuBtn');
    const sideMenu = document.getElementById('sideMenu');
    const navbar = document.querySelector('.navbar');

    // Function to check device type and toggle visibility
    function checkDeviceType() {
        if (window.innerWidth <= 1024) { // Mobile and tablet
            menuBtn.style.display = 'block';
            navbar.style.display = 'none';
        } else { // Laptop and desktop
            menuBtn.style.display = 'none';
            navbar.style.display = 'block';
        }
    }

    // Initial check
    checkDeviceType();

    // Add event listener for window resize
    window.addEventListener('resize', checkDeviceType);

    // Toggle side menu visibility on menu button click
    menuBtn.addEventListener('click', function() {
        document.body.classList.toggle('menu-open');
    });

    // Close side menu when a link is clicked (optional)
    const sideMenuLinks = sideMenu.querySelectorAll('a');
    sideMenuLinks.forEach(link => {
        link.addEventListener('click', function() {
            document.body.classList.remove('menu-open');
        });
    });
});
