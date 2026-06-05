import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/Addons.js';




const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true }); // dodano antialias dla gładkości
const textureLoader = new THREE.TextureLoader();
textureLoader.load('jpg.jpg', (texture) => {
scene.background = texture;
});

renderer.setSize(window.innerWidth, window.innerHeight);

document.body.appendChild(renderer.domElement);

function createTextTexture(text) {
const canvas = document.createElement('canvas');
canvas.width = 256;
canvas.height = 256;
const ctx = canvas.getContext('2d');

// Tło ścianki
ctx.fillStyle = '#F2F2F2';
ctx.fillRect(0, 0, 256, 256);

// --- USTAWIENIE CZCIONKI ROBOTO ---
// Możesz użyć 'bold', 'normal' lub wartości liczbowych np. '900 40px Roboto'
ctx.font = 'normal 40px Roboto';
ctx.fillStyle = 'black';
ctx.textAlign = 'center';
ctx.textBaseline = 'middle';
ctx.fillText(text, 128, 128);

return new THREE.CanvasTexture(canvas);
}

const materials = [
new THREE.MeshStandardMaterial({ map: createTextTexture('Warsaw') }),
new THREE.MeshStandardMaterial({ map: createTextTexture('Berlin') }),
new THREE.MeshStandardMaterial({ map: createTextTexture('Paris') }),
new THREE.MeshStandardMaterial({ map: createTextTexture('Madrid') }),
new THREE.MeshStandardMaterial({ map: createTextTexture('Rome') }),
new THREE.MeshStandardMaterial({ map: createTextTexture('Moscow') }),
];

const geometry = new RoundedBoxGeometry(2, 2, 2, 6, 0.1);
const cube = new THREE.Mesh(geometry, materials);
scene.add(cube);


const light = new THREE.DirectionalLight(0xffffff, 1.5);
light.position.set(5, 10, 7); // Lekko z boku i z góry, by ładnie oświetlać bryłę
scene.add(light);

const ambientLight = new THREE.AmbientLight(0xffffff, 0.4); // Zwiększono, by kostka nie była zbyt ciemna z tyłu
scene.add(ambientLight);

camera.position.z = 5;


//Funkcja drag
let isDragging = false;
let previousMousePosition = { x: 0, y: 0 };

// Nasłuchiwanie na wciśnięcie przycisku myszy
window.addEventListener('mousedown', (e) => {
isDragging = true;
});

// Nasłuchiwanie na ruch myszy
window.addEventListener('mousemove', (e) => {
const deltaMove = {
x: e.offsetX - previousMousePosition.x,
y: e.offsetY - previousMousePosition.y
};

if (isDragging) {
// Czułość obrotu (możesz ją zmienić)
const deltaRotationQuaternion = new THREE.Quaternion()
.setFromEuler(new THREE.Euler(
toRadians(deltaMove.y * 0.5),
toRadians(deltaMove.x * 0.5),
0,
'XYZ'
));

cube.quaternion.multiplyQuaternions(deltaRotationQuaternion, cube.quaternion);
}

previousMousePosition = {
x: e.offsetX,
y: e.offsetY
};
});

// MB Listener
window.addEventListener('mouseup', () => {
isDragging = false;
});

// Changing degrees to radian
function toRadians(angle) {
return angle * (Math.PI / 180);
}

function animate() {
requestAnimationFrame(animate);

if (isAnimatingToFace && targetQuaternion) {
// Płynny obrót sferyczny w stronę wybranego Quaternionu (0.05 to prędkość dopasowania)
cube.quaternion.slerp(targetQuaternion, 0.08);

// Jeśli kostka jest już niemal idealnie na miejscu, wyłączamy tryb dopasowania
if (cube.quaternion.angleTo(targetQuaternion) < 0.001) {
cube.quaternion.copy(targetQuaternion);
isAnimatingToFace = false;
}
} else if (!isDragging) {
// Constant rotation
cube.rotation.x += 0.0005;
cube.rotation.y += 0.0010;
}

renderer.render(scene, camera);
}


// --- MB spin logic ---

// desired spin definitoon (Quaternions) for each wall
const targetRotations = {
przod: new THREE.Quaternion().setFromEuler(new THREE.Euler(0, 0, 0)),
tyl: new THREE.Quaternion().setFromEuler(new THREE.Euler(0, Math.PI, 0)),
gora: new THREE.Quaternion().setFromEuler(new THREE.Euler(Math.PI / 2, 0, 0)),
dol: new THREE.Quaternion().setFromEuler(new THREE.Euler(-Math.PI / 2, 0, 0)),
lewo: new THREE.Quaternion().setFromEuler(new THREE.Euler(0, Math.PI / 2, 0)),
prawo: new THREE.Quaternion().setFromEuler(new THREE.Euler(0, -Math.PI / 2, 0))
};

let targetQuaternion = null; // Keeps actual spin target
let isAnimatingToFace = false; // Const spin block flag when adjusted by face

// Getting links from the navbar
const navLinks = document.querySelectorAll('.modern-nav a');

navLinks.forEach(link => {
link.addEventListener('click', (e) => {
const face = e.target.getAttribute('data-face');
if (targetRotations[face]) {
targetQuaternion = targetRotations[face];
isAnimatingToFace = true;
}
});
});
//Stopping face adjust when mouse is used
window.addEventListener('mousedown', () => {
isAnimatingToFace = false;
});

// Zamiast po prostu pisać na końcu pliku: animate();
// Używamy natywnego API przeglądarki do sprawdzenia stanu czcionek:

document.fonts.ready.then(() => {
console.log("Czcionka Roboto załadowana pomyślnie. Uruchamiam scenę 3D...");
// Dopiero teraz tworzymy materiały (z pewnością, że Roboto zadziała na Canvasie)
cube.material.forEach((mat, index) => {
// Opcjonalnie odświeżamy tekstury, jeśli zdefiniowałeś je wcześniej globalnie
mat.map.needsUpdate = true;
});

animate();
}); 
