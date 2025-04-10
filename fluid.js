import GUI from "https://cdn.jsdelivr.net/npm/lil-gui@0.18.2/+esm"
import {
    Renderer,
    Camera,
    RenderTarget,
    Geometry,
    Program,
    Texture,
    Mesh,
    Color,
    Vec2,
    Box,
    Post
} from "https://cdn.jsdelivr.net/npm/ogl/dist/ogl.mjs";

const canvasEl = document.querySelector("#fluid-canvas");
const imgInput = document.querySelector("#image-selector-input");

const params = {
    cursorSize: 2,
    cursorPower: 24,
    distortionPower: .4,
    loadMyImage: () => {
        imgInput.click();
    }
};

// Default settings
const defaults = {
    simRes: 128,
    dyeRes: 512,
    iterations: 6,
    densityDissipation: .98,
    velocityDissipation: .95,
    pressureDissipation: .1,
    curlStrength: 50,
    radius: .6
};

// Initialize the fluid effect
function initFluid() {
    const renderer = new Renderer({
        dpr: 2
    });
    const gl = renderer.gl;
    document.body.appendChild(gl.canvas);
    
    // Set up camera
    const camera = new Camera(gl, {
        fov: 50
    });
    camera.position.set(0, 0, 5);
    
    // Set up post-processing
    const post = new Post(gl);
    
    // Create fluid simulation textures
    const simRes = defaults.simRes;
    const dyeRes = defaults.dyeRes;
    
    // Create the fluid simulation
    const fluid = createFluidSimulation(gl, {
        simRes,
        dyeRes,
        densityDissipation: defaults.densityDissipation,
        velocityDissipation: defaults.velocityDissipation,
        pressureDissipation: defaults.pressureDissipation,
        curlStrength: defaults.curlStrength,
        radius: defaults.radius
    });
    
    // Handle mouse/touch interaction
    let mouse = new Vec2();
    let prevMouse = new Vec2();
    
    function onMouseMove(e) {
        prevMouse.set(mouse);
        mouse.set(
            e.clientX / window.innerWidth,
            1 - e.clientY / window.innerHeight
        );
        
        if (prevMouse.x && prevMouse.y) {
            const delta = new Vec2(
                mouse.x - prevMouse.x,
                mouse.y - prevMouse.y
            );
            
            // Add force to the fluid simulation
            fluid.splat(mouse.x, mouse.y, delta.x * 10, delta.y * 10);
        }
    }
    
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('touchmove', (e) => {
        e.preventDefault();
        onMouseMove(e.touches[0]);
    });
    
    // Animation loop
    function animate() {
        requestAnimationFrame(animate);
        
        // Update fluid simulation
        fluid.update();
        
        // Render the effect
        post.render({
            scene: fluid.mesh,
            camera
        });
    }
    
    animate();
    
    // Handle resize
    window.addEventListener('resize', () => {
        renderer.setSize(window.innerWidth, window.innerHeight);
        camera.perspective({
            aspect: window.innerWidth / window.innerHeight
        });
        post.resize();
    });
}

// Initialize when the page loads
window.addEventListener('load', initFluid);
