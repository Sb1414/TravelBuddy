// custom-background.js

document.addEventListener("DOMContentLoaded", function() {
    const navLinks = document.querySelectorAll('.navbar-nav .nav-link[data-shape]');
    const shapes = document.querySelectorAll('.background-shape');

    navLinks.forEach(link => {
        link.addEventListener('click', function(event) {
            event.preventDefault(); // Предотвратить стандартное действие ссылки

            const targetShape = this.getAttribute('data-shape');

            shapes.forEach(shape => {
                if (shape.classList.contains(targetShape)) {
                    shape.classList.add('active');
                    shape.classList.remove('inactive');
                } else {
                    shape.classList.remove('active');
                    shape.classList.add('inactive');
                }
            });

            // Плавный скролл к соответствующему разделу (если есть)
            const targetSection = document.querySelector(this.getAttribute('href'));
            if (targetSection) {
                window.scrollTo({
                    top: targetSection.offsetTop,
                    behavior: 'smooth'
                });
            }
        });
    });
});
