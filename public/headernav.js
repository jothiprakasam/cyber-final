document.addEventListener('DOMContentLoaded', function () {
    // Select the Home navigation link
    const homeNavLinks = document.querySelectorAll('a[href="#"]');

    homeNavLinks.forEach(link => {
        if (link.textContent.trim() === 'Home') {
            link.addEventListener('click', function (e) {
                e.preventDefault(); // Prevent the default action
                window.location.href = 'index.html'; // Redirect to the index.html page
            });
        }
    });
});
