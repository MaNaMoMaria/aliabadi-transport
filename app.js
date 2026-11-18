let scene, camera, renderer, loadedTruck;
let lightsOn = false;
let spotLightLeft, spotLightRight, glowLeft, glowRight, ambientLight;

function init3D() {
    const container = document.getElementById('webgl-container');
    if (!container) return;

    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 1000);
    camera.position.set(4.5, 2.2, 5.5);
    camera.lookAt(0, 0.5, 0);

    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = true;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    container.appendChild(renderer.domElement);

    // Studio & Environment Lighting
    ambientLight = new THREE.AmbientLight(0xffffff, 1.4);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 2.2);
    dirLight.position.set(8, 15, 10);
    scene.add(dirLight);

    const backLight = new THREE.DirectionalLight(0x3b82f6, 1.2);
    backLight.position.set(-8, 5, -10);
    scene.add(backLight);

    // Ground Plane
    const groundGeo = new THREE.PlaneGeometry(30, 30);
    const groundMat = new THREE.MeshStandardMaterial({ 
        color: 0x0b0f19, 
        roughness: 0.4, 
        metalness: 0.6,
        transparent: true,
        opacity: 0.6
    });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -0.8;
    scene.add(ground);

    // Load truck.glb model
    const loader = new THREE.GLTFLoader();
    loader.load(
        'truck.glb',
        function (gltf) {
            loadedTruck = gltf.scene;

            // Auto-Center and Auto-Scale
            const box = new THREE.Box3().setFromObject(loadedTruck);
            const size = box.getSize(new THREE.Vector3());
            const center = box.getCenter(new THREE.Vector3());
            const maxDim = Math.max(size.x, size.y, size.z);
            const scale = 4.2 / maxDim;

            loadedTruck.scale.set(scale, scale, scale);
            loadedTruck.position.x = -center.x * scale;
            loadedTruck.position.y = -box.min.y * scale - 0.8;
            loadedTruck.position.z = -center.z * scale;

            scene.add(loadedTruck);
            setupTruckHeadlights(size, scale);
        },
        undefined,
        function (error) {
            console.error('Error loading truck.glb:', error);
        }
    );

    // Mouse & Touch Rotation
    let isDragging = false;
    let previousMousePosition = { x: 0, y: 0 };

    container.addEventListener('mousedown', (e) => { isDragging = true; previousMousePosition = { x: e.clientX, y: e.clientY }; });
    container.addEventListener('mousemove', (e) => {
        if (!isDragging || !loadedTruck) return;
        const deltaX = e.clientX - previousMousePosition.x;
        loadedTruck.rotation.y += deltaX * 0.01;
        previousMousePosition = { x: e.clientX, y: e.clientY };
    });
    window.addEventListener('mouseup', () => { isDragging = false; });

    container.addEventListener('touchstart', (e) => { isDragging = true; previousMousePosition = { x: e.touches[0].clientX, y: e.touches[0].clientY }; });
    container.addEventListener('touchmove', (e) => {
        if (!isDragging || !loadedTruck) return;
        const deltaX = e.touches[0].clientX - previousMousePosition.x;
        loadedTruck.rotation.y += deltaX * 0.01;
        previousMousePosition = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    });

    window.addEventListener('resize', onWindowResize);
    animate();
}

function setupTruckHeadlights(size, scale) {
    const frontZ = (size.z * scale) / 2;
    const widthX = (size.x * scale) * 0.32;
    const heightY = -0.25;

    const glowGeo = new THREE.SphereGeometry(0.12, 16, 16);
    const glowMat = new THREE.MeshBasicMaterial({ color: 0xfffbeb, transparent: true, opacity: 0 });

    glowLeft = new THREE.Mesh(glowGeo, glowMat.clone());
    scene.add(glowLeft);

    glowRight = new THREE.Mesh(glowGeo, glowMat.clone());
    scene.add(glowRight);

    spotLightLeft = new THREE.SpotLight(0xffeaa7, 0, 15, Math.PI / 5, 0.5, 1);
    scene.add(spotLightLeft);
    scene.add(spotLightLeft.target);

    spotLightRight = new THREE.SpotLight(0xffeaa7, 0, 15, Math.PI / 5, 0.5, 1);
    scene.add(spotLightRight);
    scene.add(spotLightRight.target);
}

function animate() {
    requestAnimationFrame(animate);
    if (loadedTruck) {
        loadedTruck.rotation.y += 0.002;
        
        if (spotLightLeft && glowLeft) {
            const angle = loadedTruck.rotation.y;
            const radius = 2.0;
            const offsetX = 0.65;

            const lx = Math.sin(angle) * radius - Math.cos(angle) * offsetX;
            const lz = Math.cos(angle) * radius + Math.sin(angle) * offsetX;
            glowLeft.position.set(lx, -0.25, lz);
            spotLightLeft.position.set(lx, -0.25, lz);
            spotLightLeft.target.position.set(lx + Math.sin(angle) * 5, -0.8, lz + Math.cos(angle) * 5);

            const rx = Math.sin(angle) * radius + Math.cos(angle) * offsetX;
            const rz = Math.cos(angle) * radius - Math.sin(angle) * offsetX;
            glowRight.position.set(rx, -0.25, rz);
            spotLightRight.position.set(rx, -0.25, rz);
            spotLightRight.target.position.set(rx + Math.sin(angle) * 5, -0.8, rz + Math.cos(angle) * 5);
        }
    }
    renderer.render(scene, camera);
}

function onWindowResize() {
    const container = document.getElementById('webgl-container');
    if (!container) return;
    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(container.clientWidth, container.clientHeight);
}

// Toggle Headlights
document.getElementById('toggle-lights-btn')?.addEventListener('click', () => {
    lightsOn = !lightsOn;

    if (ambientLight) ambientLight.intensity = lightsOn ? 0.55 : 1.4;
    if (spotLightLeft && spotLightRight) {
        spotLightLeft.intensity = lightsOn ? 6 : 0;
        spotLightRight.intensity = lightsOn ? 6 : 0;
    }
    if (glowLeft && glowRight) {
        glowLeft.material.opacity = lightsOn ? 0.95 : 0;
        glowRight.material.opacity = lightsOn ? 0.95 : 0;
    }

    if (loadedTruck) {
        loadedTruck.traverse((child) => {
            if (child.isMesh && (child.name.toLowerCase().includes('light') || child.name.toLowerCase().includes('lamp'))) {
                if (child.material) {
                    child.material.emissive = lightsOn ? new THREE.Color(0xffeaa7) : new THREE.Color(0x000000);
                    child.material.emissiveIntensity = lightsOn ? 3 : 0;
                }
            }
        });
    }

    const btnSpan = document.querySelector('#toggle-lights-btn span');
    if (btnSpan) {
        btnSpan.textContent = lightsOn 
            ? (currentLang === 'fa' ? 'خاموش کردن چراغ‌ها' : 'Turn Off Lights') 
            : (currentLang === 'fa' ? 'روشن کردن چراغ‌ها' : 'Turn On Lights');
    }
});

// Localization & Theme
const translations = {
    fa: {
        meta_title: "گروه ترابری و لجستیک علی‌آبادی | کنگان",
        brand_name: "علی‌آبادی | کنگان",
        nav_services: "لجستیک پرسنلی",
        nav_showroom: "نمایشگاه کامیون",
        nav_3d: "مدل سه‌بعدی",
        nav_contact: "تماس با ما",
        hero_badge: "منطقه ویژه انرژی پارس (کنگان / عسلویه)",
        hero_title: "پیشران لجستیک نفت و گاز و بازار ماشین‌آلات سنگین",
        hero_desc: "تأمین مطمئن ناوگان ترابری پرسنل شرکت‌های صنعتی و مرجع تخصصی خرید و فروش کشنده‌های کارکرده در جنوب کشور.",
        btn_contract: "استعلام قرارداد سازمانی",
        btn_trucks: "مشاهده کشنده‌ها",
        btn_lights: "روشن کردن چراغ‌ها",
        canvas_hint: "برای چرخش مدل، با موس بکشید",
        serv_title: "بخش اول: لجستیک و ترابری شرکتی (پیمانکاری)",
        serv_subtitle: "ارائه خدمات تخصصی حمل‌ونقل پرسنل و کارمندان با قراردادهای رسمی با پالایشگاه‌ها و پتروشیمی‌ها",
        c1_title: "ناوگان مینی‌بوس و اتوبوس",
        c1_desc: "مجهز به کولر و امکانات مناسب برای جابجایی ایمن پرسنل در شیفت‌های کاری منطقه عسلویه و کنگان.",
        c2_title: "خودروهای ون و سواری سازمانی",
        c2_desc: "تأمین خودروهای تشریفاتی و پرسنلی با رانندگان مجرب، متعهد و آشنا به پروتکل‌های ایمنی صنعت نفت.",
        c3_title: "قراردادهای بلندمدت شرکتی",
        c3_desc: "انعقاد تفاهم‌نامه‌های رسمی با کارخانجات، شرکت‌های پیمانکاری و مجتمع‌های پتروشیمی جنوب.",
        show_title: "بخش دوم: نمایشگاه ماشین‌آلات سنگین و کشنده‌ها",
        show_subtitle: "خرید و فروش تخصصی انواع کشنده، کامیون و تریلر دست‌دوم با کارشناسی فنی در استان بوشهر",
        btn_inquiry: "استعلام قیمت و خرید",
        contact_title: "ارتباط با دفتر مرکزی (نمایندگی علی‌آبادی)",
        addr: "بوشهر، کنگان، ورودی شهر، بلوار امام خمینی، جنب دروازه قرآن، پلاک ۵۱",
        hours: "شنبه تا پنج‌شنبه: ۸:۰۰ الی ۱۷:۰۰",
        footer_text: "تمامی حقوق مادی و معنوی این وب‌سایت متعلق به گروه ترابری و لجستیک علی‌آبادی (کنگان) می‌باشد."
    },
    en: {
        meta_title: "Aliabadi Transport & Logistics | Kangan",
        brand_name: "Aliabadi | Kangan",
        nav_services: "Personnel Logistics",
        nav_showroom: "Truck Showroom",
        nav_3d: "3D Model",
        nav_contact: "Contact Us",
        hero_badge: "Pars Special Energy Zone (Kangan / Assaluyeh)",
        hero_title: "Oil & Gas Logistics Pioneer & Heavy Machinery Hub",
        hero_desc: "Reliable personnel transport fleet for industrial firms & specialized heavy truck trading in southern Iran.",
        btn_contract: "Inquire Corporate Contract",
        btn_trucks: "View Trucks",
        btn_lights: "Turn On Lights",
        canvas_hint: "Drag to rotate the 3D model",
        serv_title: "Part 1: Corporate Personnel Transport & Contracting",
        serv_subtitle: "Providing specialized staff transportation services with official contracts for refineries & petrochemicals",
        c1_title: "Bus & Minibus Fleet",
        c1_desc: "Equipped with AC and high comfort for safe personnel transfers across Assaluyeh & Kangan shifts.",
        c2_title: "Vans & Corporate Sedans",
        c2_desc: "Providing VIP & personnel cars with experienced drivers familiar with oil industry safety protocols.",
        c3_title: "Long-Term Corporate Contracts",
        c3_desc: "Official agreements with manufacturing plants, contractors, and southern petrochemical complexes.",
        show_title: "Part 2: Heavy Machinery & Truck Showroom",
        show_subtitle: "Specialized buying and selling of used tractors, trucks, and trailers with technical inspection in Bushehr",
        btn_inquiry: "Price Inquiry & Buy",
        contact_title: "Head Office Contact (Aliabadi Agency)",
        addr: "Bushehr, Kangan, City Entrance, Imam Khomeini Blvd, Next to Quran Gate, No. 51",
        hours: "Sat - Thu: 8:00 AM - 5:00 PM",
        footer_text: "All rights reserved © Aliabadi Transport & Logistics Group (Kangan)."
    }
};

let currentLang = 'fa';

const langToggleBtn = document.getElementById('lang-toggle');
langToggleBtn?.addEventListener('click', () => {
    currentLang = currentLang === 'fa' ? 'en' : 'fa';
    langToggleBtn.textContent = currentLang === 'fa' ? 'EN' : 'FA';
    
    document.documentElement.setAttribute('lang', currentLang);
    document.documentElement.setAttribute('dir', currentLang === 'fa' ? 'rtl' : 'ltr');

    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (translations[currentLang][key]) {
            el.textContent = translations[currentLang][key];
        }
    });
});

const themeToggleBtn = document.getElementById('theme-toggle');
const htmlEl = document.documentElement;

themeToggleBtn?.addEventListener('click', () => {
    const currentTheme = htmlEl.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    htmlEl.setAttribute('data-theme', newTheme);
    themeToggleBtn.innerHTML = newTheme === 'dark' ? '<i class="fa-solid fa-moon"></i>' : '<i class="fa-solid fa-sun"></i>';
});

window.addEventListener('DOMContentLoaded', () => {
    init3D();
});