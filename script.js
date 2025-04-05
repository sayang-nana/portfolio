document.addEventListener('DOMContentLoaded', () => {
    // Navigation buttons functionality
    const navButtons = document.querySelectorAll('.nav-btn');
    navButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Remove active class from all buttons
            navButtons.forEach(btn => btn.classList.remove('active'));
            // Add active class to clicked button
            button.classList.add('active');
        });
    });

    // Search button functionality
    const searchBtn = document.querySelector('.search-btn');
    searchBtn.addEventListener('click', () => {
        const searchInput = document.querySelector('.search-input');
        console.log('Searching for:', searchInput.value);
        // Add your search functionality here
    });

    // Hashtag functionality
    const hashtags = document.querySelectorAll('.hashtag');
    hashtags.forEach(hashtag => {
        hashtag.addEventListener('click', () => {
            console.log('Filtering by:', hashtag.textContent);
            // Add your filtering functionality here
        });
    });
}); 