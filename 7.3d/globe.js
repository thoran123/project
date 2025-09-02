// globe.js
let scene, camera, renderer, globe;

function initGlobe() {
    // Scene setup
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf5f7fa);
    
    // Camera setup - adjust position to move globe right
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(1, 0, 5); // Added x-position of 1 to shift right
    
    // Renderer setup
    renderer = new THREE.WebGLRenderer({ 
        antialias: true, 
        alpha: true,
        canvas: document.querySelector('.hero-section canvas') || undefined
    });
    
    // Position the canvas to overlap with text
    const canvas = renderer.domElement;
    canvas.style.position = 'absolute';
    canvas.style.left = '50%'; // Start from center
    canvas.style.transform = 'translateX(-30%)'; // Pull back slightly
    
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    
    // Only append if not already in DOM
    if (!document.querySelector('.hero-section canvas')) {
        document.querySelector('.hero-section').appendChild(canvas);
    }
    
    // Add orbit controls
    const controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableZoom = false;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 1.5;
    
    // Create globe (smaller size to fit better)
    const geometry = new THREE.SphereGeometry(2.7, 80, 80); // Reduced size
    const texture = new THREE.TextureLoader().load('https://threejs.org/examples/textures/planets/earth_atmos_2048.jpg');
    const bumpMap = new THREE.TextureLoader().load('https://threejs.org/examples/textures/planets/earth_normal_2048.jpg');
    const material = new THREE.MeshPhongMaterial({
        map: texture,
        bumpMap: bumpMap,
        bumpScale: 0.05,
        specular: new THREE.Color('grey'),
        shininess: 5
    });
    globe = new THREE.Mesh(geometry, material);
    scene.add(globe);
    
    // Add lights (positioned to illuminate the right side)
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(3, 2, 3); // Adjusted to right side
    scene.add(directionalLight);
    
    // Create atmosphere
    const atmosphereGeometry = new THREE.SphereGeometry(2.1, 64, 64);
    const atmosphereMaterial = new THREE.ShaderMaterial({
        uniforms: {},
        vertexShader: `
            varying vec3 vNormal;
            void main() {
                vNormal = normalize(normalMatrix * normal);
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
        `,
        fragmentShader: `
            varying vec3 vNormal;
            void main() {
                float intensity = pow(0.7 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 2.0);
                gl_FragColor = vec4(0.3, 0.6, 1.0, 1.0) * intensity;
            }
        `,
        side: THREE.BackSide,
        blending: THREE.AdditiveBlending,
        transparent: true
    });
    const atmosphere = new THREE.Mesh(atmosphereGeometry, atmosphereMaterial);
    scene.add(atmosphere);
    
    // Animation loop
    function animate() {
        requestAnimationFrame(animate);
        controls.update();
        globe.rotation.y += 0.001;
        renderer.render(scene, camera);
    }
    
    animate();
    
    // Handle window resize
    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });
}

window.addEventListener('load', initGlobe);

// script.js
// Fee Configuration
const feeRates = {
    ug: { min: 1200, max: 1800 },      // Undergraduate
    pg: { min: 1800, max: 2200 },      // Postgraduate
    research: { min: 2000, max: 2500 }, // Research
    international: { min: 2500, max: 3000 } // International
};

let currentCourse = 'ug';
let currentTrimesters = 1;

// Initialize Calculator
document.addEventListener('DOMContentLoaded', function() {
    calculateFees();
});

// Select Course Type
function selectCourse(cardElement, courseType) {
    // Update Active Card
    document.querySelectorAll('.course-card').forEach(card => {
        card.classList.remove('active');
    });
    cardElement.classList.add('active');
    
    // Update Current Course
    currentCourse = courseType;
    calculateFees();
}

// Update Unit Value Display
function updateUnitValue() {
    document.getElementById('unitValue').textContent = document.getElementById('unitSlider').value;
    calculateFees();
}

// Select Trimesters
function selectTrimesters(buttonElement) {
    document.querySelectorAll('#trimesterSelector button').forEach(btn => {
        btn.classList.remove('active');
    });
    buttonElement.classList.add('active');
    currentTrimesters = parseInt(buttonElement.dataset.trimesters);
    calculateFees();
}

// Calculate Fees
function calculateFees() {
    const units = parseInt(document.getElementById('unitSlider').value);
    const hasScholarship = document.getElementById('scholarshipToggle').checked;
    
    // Calculate Base Fee (randomized within range for demo)
    const rate = feeRates[currentCourse];
    const unitFee = rate.min + Math.random() * (rate.max - rate.min);
    const baseFee = unitFee * units;
    
    // Apply Trimesters
    let totalFee = baseFee * currentTrimesters;
    
    // Apply Scholarship Discount
    let discount = 0;
    if (hasScholarship) {
        discount = totalFee * 0.1;
        totalFee *= 0.9;
    }
    
    // Update UI
    document.getElementById('baseFee').textContent = `$${baseFee.toLocaleString('en-AU')}`;
    document.getElementById('trimesterFee').textContent = `×${currentTrimesters}`;
    document.getElementById('discountAmount').textContent = `$${discount.toLocaleString('en-AU')}`;
    document.getElementById('totalFee').textContent = `$${totalFee.toLocaleString('en-AU')}`;
    
    // Update Meter
    const maxFee = 3000 * 8 * 3; // Maximum possible fee
    const meterPercent = Math.min(100, (totalFee / maxFee) * 100);
    const meter = document.getElementById('feeMeter');
    meter.style.width = `${meterPercent}%`;
    
    // Update Meter Color Based on Amount
    if (totalFee > 20000) {
        meter.style.background = 'linear-gradient(90deg, #ff9a9e 0%, #fad0c4 100%)';
    } else if (totalFee > 10000) {
        meter.style.background = 'linear-gradient(90deg, #fbc2eb 0%, #a6c1ee 100%)';
    } else {
        meter.style.background = 'linear-gradient(90deg, #a1c4fd 0%, #c2e9fb 100%)';
    }
    
    // Show/Hide Discount Row
    document.getElementById('discountRow').style.display = hasScholarship ? 'flex' : 'none';
}

// Save Estimate (Demo Function)
function saveEstimate() {
    alert('Estimate saved! (This would generate a PDF in production)');
}

document.addEventListener('DOMContentLoaded', function() {
    // Initialize the iPhone animation
    initiPhoneAnimation();
    
    // Initialize background animations
    initBackgroundAnimations();
});

// iPhone Animation Controller
function initiPhoneAnimation() {
    let currentScreen = 'lock';
    
    // Show initial screen
    showScreen('lock');
    
    // Auto-cycle every 3 seconds
    setInterval(function() {
        switch(currentScreen) {
            case 'lock':
                showScreen('payment');
                break;
            case 'payment':
                showScreen('success');
                break;
            case 'success':
                showScreen('lock');
                break;
        }
    }, 3000);
    
    function showScreen(screenName) {
        // Hide all screens
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.remove('active');
        });
        
        // Show the requested screen
        const screenElement = document.querySelector(`.${screenName}-screen`);
        screenElement.classList.add('active');
        currentScreen = screenName;
        
        // Add animations
        if (screenName === 'payment') {
            screenElement.style.animation = 'slideUp 0.5s ease';
        } else if (screenName === 'success') {
            document.querySelector('.success-icon').style.animation = 'bounceIn 0.8s ease';
        }
    }
}

// Background animations
function initBackgroundAnimations() {
    // The CSS animations are handling most effects
}

// Add any missing keyframes
const styleElement = document.createElement('style');
styleElement.innerHTML = `
    @keyframes slideUp {
        from { 
            transform: translateY(30px);
            opacity: 0;
        }
        to { 
            transform: translateY(0);
            opacity: 1;
        }
    }
    
    @keyframes bounceIn {
        0% { transform: scale(0.5); opacity: 0; }
        50% { transform: scale(1.1); }
        80% { transform: scale(0.95); }
        100% { transform: scale(1); opacity: 1; }
    }
`;
document.head.appendChild(styleElement);

// Check login status and show payment history or login prompt
function showPaymentHistory() {
    const isLoggedIn = localStorage.getItem('deakinpay_loggedIn') === 'true';
    
    if (isLoggedIn) {
        // If logged in, redirect to login.html which will show the payment history
        window.location.href = 'login.html';
    } else {
        // Show login required modal
        const loginRequiredModal = new bootstrap.Modal(document.getElementById('loginRequiredModal'));
        loginRequiredModal.show();
    }
}
