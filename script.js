import * as THREE from 'three';

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    // Initialize Three.js
    console.log('Initializing Three.js...');
    const container = document.getElementById('sphere-container');
    const heroSection = document.querySelector('.hero'); // Get the hero section

    if (!container || !heroSection) {
        console.error('Could not find sphere-container or hero element!');
        return;
    }
    console.log('Found sphere-container and hero elements');

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, heroSection.clientWidth / heroSection.clientHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(heroSection.clientWidth, heroSection.clientHeight);
    renderer.setClearColor(0x000000, 0);
    container.appendChild(renderer.domElement);

    // Add lights
    scene.add(new THREE.AmbientLight(0xffffff, 0.4));
    const light = new THREE.DirectionalLight(0xffffff, 1.2);
    light.position.set(5, 10, 7);
    scene.add(light);

    // Sphere Geometry
    const geometry = new THREE.SphereGeometry(2, 128, 128);
    
    // Enable vertex colors
    const material = new THREE.MeshStandardMaterial({
        vertexColors: true,
        roughness: 100,
        flatShading: false,
        side: THREE.FrontSide,
        depthWrite: true,
        depthTest: true
    });

    const sphere = new THREE.Mesh(geometry, material);
    scene.add(sphere);

    // Scale the sphere
    sphere.scale.set(10, 10, 10);

    // Position the sphere
    sphere.position.set(30, 2, 0);

    // Store original positions
    const originalPositions = [];
    const posAttr = geometry.attributes.position;
    for (let i = 0; i < posAttr.count; i++) {
        const vertex = new THREE.Vector3().fromBufferAttribute(posAttr, i);
        originalPositions.push(vertex.clone());
    }

    // Setup vertex colors
    const colors = new Float32Array(posAttr.count * 3);
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const noise = new Noise(Math.random());
    const frequency = 6.0;
    const amplitude = 0.8;
    const teal = new THREE.Color(0x00ccff);
    const white = new THREE.Color(0xffffff);

    // Position camera
    camera.position.set(0, 0, 15);
    console.log('Camera positioned at z:', camera.position.z);

    // Mouse interaction variables
    let targetRotation = { x: 0, y: 0 };
    let currentRotation = { x: 0, y: 0 }; // Smoothed rotation from mouse
    let baseRotationY = 0; // Base rotation independent of mouse
    const rotationSpeed = 0.05; // Smoothing factor

    // Add mouse move listener to hero section
    heroSection.addEventListener('mousemove', (event) => {
        const rect = heroSection.getBoundingClientRect();
        const mouseX = event.clientX - rect.left;
        const mouseY = event.clientY - rect.top;

        // Normalize coordinates (-0.5 to 0.5)
        const normalizedX = (mouseX / rect.width) - 0.5;
        const normalizedY = (mouseY / rect.height) - 0.5;

        // Set target rotation (adjust sensitivity by multiplying)
        targetRotation.x = normalizedY * Math.PI * 0.2; // Rotate around X-axis based on Y position
        targetRotation.y = normalizedX * Math.PI * 0.2; // Rotate around Y-axis based on X position
    });

    // Add mouse leave listener to reset rotation
    heroSection.addEventListener('mouseleave', () => {
        targetRotation.x = 0;
        targetRotation.y = 0;
    });

    function animate(time) {
        requestAnimationFrame(animate);
        const t = time * 0.0005;

        const temp = new THREE.Vector3();
        const colorAttr = geometry.attributes.color;

        for (let i = 0; i < posAttr.count; i++) {
            temp.copy(originalPositions[i]);
            const normal = temp.clone().normalize();

            const offset = noise.perlin3(
                normal.x * frequency + t,
                normal.y * frequency + t,
                normal.z * frequency + t
            );

            const spike = 1 + amplitude * offset;
            normal.multiplyScalar(spike);
            posAttr.setXYZ(i, normal.x, normal.y, normal.z);

            const blend = (offset + 1) / 2;
            const mixedColor = teal.clone().lerp(white, blend);
            colorAttr.setXYZ(i, mixedColor.r, mixedColor.g, mixedColor.b);
        }

        posAttr.needsUpdate = true;
        colorAttr.needsUpdate = true;
        geometry.computeVertexNormals();

        // Smoothly interpolate mouse-based rotation
        currentRotation.x += (targetRotation.x - currentRotation.x) * rotationSpeed;
        currentRotation.y += (targetRotation.y - currentRotation.y) * rotationSpeed;

        // Increment base rotation
        baseRotationY += 0.002;

        // Apply combined rotation
        sphere.rotation.x = currentRotation.x;
        sphere.rotation.y = currentRotation.y + baseRotationY; // Add base rotation to mouse rotation

        renderer.render(scene, camera);
    }

    // Handle window resize - **important for mouse mapping**
    window.addEventListener('resize', () => {
        renderer.setSize(heroSection.clientWidth, heroSection.clientHeight);
        camera.aspect = heroSection.clientWidth / heroSection.clientHeight;
        camera.updateProjectionMatrix();
    });

    // Start animation
    console.log('Starting animation...');
    animate();
});

// Initialize Roll animation
document.addEventListener('DOMContentLoaded', function() {
    const portfolioTitle = document.querySelector('.portfolio-title');
    if (portfolioTitle && typeof Roll !== 'undefined') {
        try {
            Roll(portfolioTitle, {
                duration: 2000,
                easing: 'ease-in-out',
                direction: 'up',
                distance: '100%',
                loop: true
            });
            console.log('Roll animation initialized');
        } catch (error) {
            console.error('Error initializing Roll animation:', error);
        }
    }
});

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

// Project Slider Pagination (Mobile)
document.addEventListener('DOMContentLoaded', function() {
    const slider = document.querySelector('.project-slider');
    const dotsContainer = document.querySelector('.slider-pagination');
    const dots = dotsContainer ? dotsContainer.querySelectorAll('.dot') : [];
    const slides = slider ? slider.querySelectorAll('.project-bubble') : [];

    if (!slider || !dotsContainer || dots.length === 0 || slides.length === 0) {
        // console.log('Slider or pagination elements not found, skipping pagination setup.');
        return; // Exit if elements aren't found
    }

    function updatePagination() {
        // Use Math.round to handle potential floating point inaccuracies
        const scrollLeft = Math.round(slider.scrollLeft);
        const slideWidth = Math.round(slides[0].offsetWidth);

        // Calculate the index of the current slide
        const currentIndex = Math.round(scrollLeft / slideWidth);

        dots.forEach((dot, index) => {
            if (index === currentIndex) {
                dot.classList.add('active');
            } else {
                dot.classList.remove('active');
            }
        });
    }

    // Use Intersection Observer for potentially better performance (optional)
    // This is generally more performant than relying solely on the scroll event
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // Find the index of the intersecting slide
                const intersectingSlide = entry.target;
                const slideIndex = Array.from(slides).indexOf(intersectingSlide);
                if (slideIndex !== -1) {
                    dots.forEach((dot, dotIndex) => {
                        dot.classList.toggle('active', dotIndex === slideIndex);
                    });
                }
            }
        });
    }, {
        root: slider, // Observe intersections within the slider itself
        threshold: 0.5 // Trigger when 50% of the slide is visible
    });

    // Observe each slide
    slides.forEach(slide => observer.observe(slide));

    // Fallback or additional update on scroll end (optional, for robustness)
    let scrollTimeout;
    slider.addEventListener('scroll', () => {
        clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(updatePagination, 150); // Update after scroll stops
    });

    // Initial update
    updatePagination();
});

