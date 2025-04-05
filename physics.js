class LetterPhysics {
    constructor() {
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.renderer = new THREE.WebGLRenderer({ 
            alpha: true,
            antialias: true
        });
        this.letters = [];
        this.gravity = 0.01;         // Reduced gravity for slower fall
        this.bounce = 1;             // Bounce factor
        this.friction = 0.98;        // Friction for smoother movement
        this.rotationDamping = 0.9;
        this.letterSize = 3;
        this.letterSpacing = 3;
        this.startHeight = 15;
        this.groundY = -2;
        this.secondLineGroundY = -6;
        this.stoppingThreshold = 0.05;
        this.impactThreshold = 4;     // Impact threshold for shake detection
        
        this.init();
    }

    init() {
        // Setup renderer
        const container = document.querySelector('.portfolio-text');
        const rect = container.getBoundingClientRect();
        this.renderer.setSize(rect.width, rect.height);
        this.renderer.setClearColor(0x000000, 0);
        container.appendChild(this.renderer.domElement);

        // Setup camera
        this.camera.position.z = 15;
        this.camera.position.y = 5;
        this.camera.position.x = -9; // Move camera left to shift view right

        // Add lights
        const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
        directionalLight.position.set(5, 5, 5);
        this.scene.add(directionalLight);

        const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
        this.scene.add(ambientLight);

        // Load font
        const loader = new THREE.FontLoader();
        loader.load('https://cdn.jsdelivr.net/npm/three@0.132.2/examples/fonts/helvetiker_bold.typeface.json', (font) => {
            const textOptions = {
                font: font,
                size: this.letterSize,
                height: 0.5,
                curveSegments: 12,
                bevelEnabled: true,
                bevelThickness: 0.05,
                bevelSize: 0.02,
                bevelOffset: 0,
                bevelSegments: 5
            };

            const material = new THREE.MeshPhongMaterial({ 
                color: 0xffffff,
                shininess: 100,
            });

            // Create first word "PORT"
            const word1 = ['P', 'O', 'R', 'T'];
            const word1Center = -((word1.length - 1) * this.letterSpacing) / 2 + 5; // Add offset to move right
            
            word1.forEach((letter, index) => {
                const geometry = new THREE.TextGeometry(letter, textOptions);
                geometry.computeBoundingBox();
                const mesh = new THREE.Mesh(geometry, material);
                
                const x = word1Center + (index * this.letterSpacing);
                mesh.position.set(x, this.startHeight + index * 0.2, 0);
                mesh.targetY = this.groundY;
                mesh.velocity = new THREE.Vector3(0, 0, 0);
                mesh.rotation.x = 0;
                mesh.rotation.z = 0;
                mesh.angularVelocity = new THREE.Vector3(0, 0, 0);
                mesh.originalScale = new THREE.Vector3(1, 1, 1);
                mesh.scale.copy(mesh.originalScale);
                
                this.letters.push(mesh);
                this.scene.add(mesh);
            });

            // Create second word "FOLIO" with delay
            setTimeout(() => {
                const word2 = ['F', 'O', 'L', 'I', 'O'];
                const word2Center = -((word2.length - 1) * this.letterSpacing) / 2 + 5; // Add offset to move right
                
                word2.forEach((letter, index) => {
                    const geometry = new THREE.TextGeometry(letter, textOptions);
                    geometry.computeBoundingBox();
                    const mesh = new THREE.Mesh(geometry, material);
                    
                    const x = word2Center + (index * this.letterSpacing);
                    mesh.position.set(x, this.startHeight + index * 0.2, 0);
                    mesh.targetY = this.secondLineGroundY;
                    mesh.velocity = new THREE.Vector3(0, 0, 0);
                    mesh.rotation.x = 0;
                    mesh.rotation.z = 0;
                    mesh.angularVelocity = new THREE.Vector3(0, 0, 0);
                    mesh.originalScale = new THREE.Vector3(1, 1, 1);
                    mesh.scale.copy(mesh.originalScale);
                    
                    this.letters.push(mesh);
                    this.scene.add(mesh);
                });
            }, 500);
        });

        // Handle window resize
        window.addEventListener('resize', () => {
            const newRect = container.getBoundingClientRect();
            this.camera.aspect = newRect.width / newRect.height;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(newRect.width, newRect.height);
        });

        // Start animation
        this.animate();
    }

    animate() {
        requestAnimationFrame(() => this.animate());

        // Update physics for each letter
        this.letters.forEach(letter => {
            // Store previous position for impact detection
            const previousY = letter.position.y;

            // Apply gravity
            letter.velocity.y -= this.gravity;

            // Update position
            letter.position.add(letter.velocity);

            // Apply friction
            letter.velocity.multiplyScalar(this.friction);

            // Ground collision
            if (letter.position.y < letter.targetY) {
                const impactSpeed = Math.abs(letter.velocity.y);
                letter.position.y = letter.targetY;
                
                // Impact effect (squash and shake)
                if (impactSpeed > this.impactThreshold) {
                    const squashFactor = Math.min(impactSpeed * 0.1, 0.4);
                    letter.scale.y = Math.max(1 - squashFactor, 0.6);
                    letter.scale.x = letter.scale.z = 1 + squashFactor * 0.5;
                    
                    // Apply rotational force to simulate domino effect
                    letter.angularVelocity.x = Math.random() * 0.5 + 0.5; // Random rotation speed
                    letter.rotation.z += letter.angularVelocity.x; // Rotate around Z-axis
                    
                    // Reset scale with spring effect
                    setTimeout(() => {
                        letter.scale.copy(letter.originalScale);
                    }, 100);
                }

                // Bounce with impact speed consideration
                if (impactSpeed > this.stoppingThreshold) {
                    letter.velocity.y = -impactSpeed * this.bounce;
                } else {
                    letter.velocity.y = 0;
                }
                
                // Horizontal movement damping
                letter.velocity.x *= 0.95;

                // Stop completely if moving very slowly
                if (Math.abs(letter.velocity.y) < this.stoppingThreshold && 
                    Math.abs(letter.velocity.x) < this.stoppingThreshold) {
                    letter.velocity.set(0, 0, 0);
                    letter.angularVelocity.set(0, 0, 0);
                    letter.rotation.x = 0;
                    letter.rotation.z = 0;
                    letter.scale.copy(letter.originalScale);
                }
            }

            // Wall collisions
            if (Math.abs(letter.position.x) > 10) { // Increased boundary for wider movement range
                letter.position.x = Math.sign(letter.position.x) * 10;
                letter.velocity.x *= -this.bounce * 0.5;
            }
        });

        this.renderer.render(this.scene, this.camera);
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new LetterPhysics();
}); 