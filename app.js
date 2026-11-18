// --- 1. Three.js 3D Truck Demo ---
let scene, camera, renderer, truckGroup, headlights = [];
let lightsOn = false;

function init3D() {
    const container = document.getElementById('webgl-container');
    if (!container) return;

    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 1000);
    camera.position.set(6, 3, 6);
    camera.lookAt(0, 0, 0);

    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    container.appendChild(renderer.domElement);

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 1.2);
    dirLight.position.set(10, 20, 15);
    scene.add(dirLight);

    // Build Stylized Semi-Truck Model
    truckGroup = new THREE.Group();

    // Cabin
    const cabinGeo = new THREE.BoxGeometry(2, 1.5, 2.5);
    const cabinMat = new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.3, metalness: 0.8 });
    const cabin = new THREE.Mesh(cabinGeo, cabinMat);
    cabin.position.set(0, 1.2, 0);
    truckGroup.add(cabin);

    // Hood / Front
    const hoodGeo = new THREE.BoxGeometry(2, 1.1, 1.8);
    const hoodMat = new THREE.MeshStandardMaterial({ color: 0xb45309, roughness: 0.3, metalness: 0.8 });
    const hood = new THREE.Mesh(hoodGeo, hoodMat);
    hood.position.set(0, 0.95, 1.7);
    truckGroup.add(hood);

    // Windshield & Glass
    const glassGeo = new THREE.BoxGeometry(1.9, 0.9, 0.1);
    const glassMat = new THREE.MeshStandardMaterial({ color: 0x111827, roughness: 0.1, transparent: true, opacity: 0.7 });
    const glass = new THREE.Mesh(glassGeo, glassMat);
    glass.position.set(0, 1.6, 1.25);
    glass.rotation.x = -0.2;
    truckGroup.add(glass);

    // Wheels
    const wheelGeo = new THREE.CylinderGeometry(0.4, 0.4, 0.3, 32);
    wheelGeo.rotateZ(Math.PI / 2);
    const wheelMat = new THREE.MeshStandardMaterial({ color: 0x1f2937, roughness: 0.9 });

    const wheelPositions = [
        [-1.1, 0.4, 1.8], [1.1, 0.4, 1.8],
        [-1.1, 0.4, -1.2], [1.1, 0.4, -1.2],
        [-1.1, 0.4, -2.4], [1.1, 0.4, -2.4]
    ];

    wheelPositions.forEach(pos => {
        const wheel = new THREE.Mesh(wheelGeo, wheelMat);
        wheel.position.set(...pos);
        truckGroup.add(wheel);
    });

    // Headlights (Spotlights or Glowing Meshes)
    const lightGeo = new THREE.SphereGeometry(0.15, 16, 16);
    const lightMatOff = new THREE.MeshStandardMaterial({ color: 0x6b7280 });
    const lightMatOn = new THREE.MeshBasicMaterial({ color: 0xfef08a });

    const hl1 = new THREE.Mesh(lightGeo, lightMatOff);
    hl1.position.set(-0.8, 0.8, 2.6);
    truckGroup.add(hl1);
    headlights.push(hl1);

    const hl2 = new THREE.Mesh(lightGeo, lightMatOff);
    hl2.position.set(0.8, 0.8, 2.6);
    truckGroup.add(hl2);
    headlights.push(hl2);

    scene.add(truckGroup);

    // Mouse Drag Rotation
    let isDragging = false;
    let previousMousePosition = { x: 0, y: 0 };

    container.addEventListener('mousedown', (e) => { isDragging = true; });
    container.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        const deltaX = e.clientX - previousMousePosition.x;
        truckGroup.rotation.y += deltaX * 0.01;
        previousMousePosition = { x: e.clientX, y: e.clientY };
    });
    window.addEventListener('mouseup', () => { isDragging = false; });
    container.addEventListener('touchstart', (e) => { isDragging = true; previousMousePosition = { x: e.touches[0].clientX, y: e.touches[0].clientY }; });
    container.addEventListener('touchmove', (e) => {
        if (!isDragging) return;
        const deltaX = e.touches[0].clientX - previousMousePosition.x;
        truckGroup.rotation.y += deltaX * 0.01;
        previousMousePosition = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    });

    window.addEventListener('resize', onWindowResize);
    animate();
}

function animate() {
    requestAnimationFrame(animate);
    // Slow idle rotation if not dragging
    truckGroup.rotation.y += 0.003;
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
    headlights.forEach(hl => {
        hl.material = lightsOn ? new THREE.MeshBasicMaterial({ color: 0xfef08a }) : new THREE.MeshStandardMaterial({ color: 0x6b7280 });
    });
    const btnSpan = document.querySelector('#toggle-lights-btn span');
    if (btnSpan) {
        btnSpan.setAttribute('data-i18n', lightsOn ? 'btn_lights_off' : 'btn_lights');
        btnSpan.textContent = lightsOn ? (currentLang === 'fa' ? 'خاموش کردن چراغ‌ها' : 'Turn Off Lights') : (currentLang === 'fa' ? 'روشن کردن چراغ‌ها' : 'Turn On Lights');
    }
});


// --- 2. Multi-language & Theme Switcher ---
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
        btn_lights_off: "خاموش کردن چراغ‌ها",
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
        btn_lights_off: "Turn Off Lights",
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
langToggleBtn.addEventListener('click', () => {
    currentLang = currentLang === 'fa' ? 'en' : 'fa';
    langToggleBtn.textContent = currentLang === 'fa' ? 'EN' : 'FA';
    
    document.documentElement.setAttribute('lang', currentLang);
    document.documentElement.setAttribute('dir', currentLang === 'fa' ? 'rtl' : 'ltr');

    // Update all text elements with data-i18n
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (translations[currentLang][key]) {
            el.textContent = translations[currentLang][key];
        }
    });
});

// Theme Switcher
const themeToggleBtn = document.getElementById('theme-toggle');
const htmlEl = document.documentElement;

themeToggleBtn.addEventListener('click', () => {
    const currentTheme = htmlEl.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    htmlEl.setAttribute('data-theme', newTheme);
    themeToggleBtn.innerHTML = newTheme === 'dark' ? '<i class="fa-solid fa-moon"></i>' : '<i class="fa-solid fa-sun"></i>';
});

// Run 3D Init on Load
window.addEventListener('DOMContentLoaded', () => {
    init3D();
});