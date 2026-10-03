// ============================================================
// Mondo 3D esplorabile. Camera isometrica che segue il giocatore.
// Muovi con WASD / frecce. Avvicinati a un edificio ed entra
// premendo E (o toccando il pulsante su mobile).
//
// Usa l'oggetto globale THREE (caricato da assets/vendor/three.min.js
// con un normale <script>, nessun import di modulo).
// ============================================================
window.Game = window.Game || {};

window.Game.World3D = function (canvas, character, onEnterLocation) {
  this.canvas = canvas;
  this.character = character;
  this.onEnterLocation = onEnterLocation;
  this.visitedToday = new Set();
  this.nearLocation = null;
  this.keys = {};
  this.clock = new THREE.Clock();
  this.controlsEnabled = true;

  this._initScene();
  this._buildWorld();
  this._bindInput();
  this._animate();
};

window.Game.World3D.prototype._initScene = function () {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x9fd0e8);
  scene.fog = new THREE.Fog(0x9fd0e8, 30, 65);
  this.scene = scene;

  const aspect = window.innerWidth / window.innerHeight;
  const d = 16;
  const camera = new THREE.OrthographicCamera(-d * aspect, d * aspect, d, -d, 0.1, 200);
  camera.position.set(20, 20, 20);
  camera.lookAt(0, 0, 0);
  this.camera = camera;
  this.cameraOffset = new THREE.Vector3(20, 20, 20);

  const renderer = new THREE.WebGLRenderer({ canvas: this.canvas, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.shadowMap.enabled = true;
  this.renderer = renderer;

  const self = this;
  window.addEventListener('resize', () => self._onResize());

  const hemi = new THREE.HemisphereLight(0xffffff, 0x556b2f, 0.9);
  scene.add(hemi);
  const sun = new THREE.DirectionalLight(0xfff2d0, 1.1);
  sun.position.set(15, 25, 10);
  sun.castShadow = true;
  sun.shadow.mapSize.set(1024, 1024);
  sun.shadow.camera.left = -30;
  sun.shadow.camera.right = 30;
  sun.shadow.camera.top = 30;
  sun.shadow.camera.bottom = -30;
  scene.add(sun);
};

window.Game.World3D.prototype._buildWorld = function () {
  const LOCATIONS = window.Game.LOCATIONS;

  // Ground
  const groundGeo = new THREE.PlaneGeometry(80, 80);
  const groundMat = new THREE.MeshStandardMaterial({ color: 0x7fbf6b });
  const ground = new THREE.Mesh(groundGeo, groundMat);
  ground.rotation.x = -Math.PI / 2;
  ground.receiveShadow = true;
  this.scene.add(ground);

  // Roads (simple cross)
  const roadMat = new THREE.MeshStandardMaterial({ color: 0x555b60 });
  const roadH = new THREE.Mesh(new THREE.PlaneGeometry(80, 4), roadMat);
  roadH.rotation.x = -Math.PI / 2;
  roadH.position.y = 0.01;
  this.scene.add(roadH);
  const roadV = new THREE.Mesh(new THREE.PlaneGeometry(4, 80), roadMat);
  roadV.rotation.x = -Math.PI / 2;
  roadV.position.y = 0.01;
  this.scene.add(roadV);

  // Buildings from LOCATIONS data
  this.locationMeshes = {};
  const self = this;
  LOCATIONS.forEach(loc => {
    const geo = new THREE.BoxGeometry(loc.size.w, loc.size.h, loc.size.d);
    const mat = new THREE.MeshStandardMaterial({ color: loc.color });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(loc.position.x, loc.size.h / 2, loc.position.z);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    self.scene.add(mesh);
    self.locationMeshes[loc.id] = mesh;

    // Label sprite above the building
    const label = self._makeLabelSprite(`${loc.icon} ${loc.label}`);
    label.position.set(loc.position.x, loc.size.h + 1.6, loc.position.z);
    self.scene.add(label);
  });

  // Player
  const playerGeo = new THREE.CapsuleGeometry(0.5, 1, 4, 8);
  const playerMat = new THREE.MeshStandardMaterial({ color: this.character.color });
  const player = new THREE.Mesh(playerGeo, playerMat);
  player.position.set(0, 1, 0);
  player.castShadow = true;
  this.scene.add(player);
  this.player = player;

  // Decorative trees scattered around
  for (let i = 0; i < 14; i++) {
    const tree = this._makeTree();
    const angle = Math.random() * Math.PI * 2;
    const radius = 16 + Math.random() * 18;
    tree.position.set(Math.cos(angle) * radius, 0, Math.sin(angle) * radius);
    this.scene.add(tree);
  }
};

window.Game.World3D.prototype._makeTree = function () {
  const group = new THREE.Group();
  const trunk = new THREE.Mesh(
    new THREE.CylinderGeometry(0.15, 0.2, 1, 6),
    new THREE.MeshStandardMaterial({ color: 0x6b4226 })
  );
  trunk.position.y = 0.5;
  trunk.castShadow = true;
  const leaves = new THREE.Mesh(
    new THREE.SphereGeometry(0.9, 8, 8),
    new THREE.MeshStandardMaterial({ color: 0x2f7a3d })
  );
  leaves.position.y = 1.4;
  leaves.castShadow = true;
  group.add(trunk, leaves);
  return group;
};

window.Game.World3D.prototype._makeLabelSprite = function (text) {
  const canvas = document.createElement('canvas');
  canvas.width = 256; canvas.height = 64;
  const ctx = canvas.getContext('2d');
  ctx.font = '600 32px Inter, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillStyle = 'rgba(20,20,20,0.75)';
  ctx.fillRect(0, 0, 256, 64);
  ctx.fillStyle = '#F4EFE6';
  ctx.fillText(text, 128, 42);
  const tex = new THREE.CanvasTexture(canvas);
  const mat = new THREE.SpriteMaterial({ map: tex, depthTest: false });
  const sprite = new THREE.Sprite(mat);
  sprite.scale.set(4, 1, 1);
  return sprite;
};

window.Game.World3D.prototype._bindInput = function () {
  const self = this;
  window.addEventListener('keydown', e => { self.keys[e.key.toLowerCase()] = true; });
  window.addEventListener('keyup', e => { self.keys[e.key.toLowerCase()] = false; });
};

window.Game.World3D.prototype._onResize = function () {
  const aspect = window.innerWidth / window.innerHeight;
  const d = 16;
  this.camera.left = -d * aspect;
  this.camera.right = d * aspect;
  this.camera.top = d;
  this.camera.bottom = -d;
  this.camera.updateProjectionMatrix();
  this.renderer.setSize(window.innerWidth, window.innerHeight);
};

window.Game.World3D.prototype.markVisited = function (locationId) {
  this.visitedToday.add(locationId);
};

window.Game.World3D.prototype.resetDay = function () {
  this.visitedToday.clear();
};

window.Game.World3D.prototype._animate = function () {
  const self = this;
  this._raf = requestAnimationFrame(() => self._animate());
  const dt = Math.min(this.clock.getDelta(), 0.05);
  const speed = 7;
  let dx = 0, dz = 0;
  if (!this.controlsEnabled) { this.keys = {}; }
  if (this.keys['w'] || this.keys['arrowup']) dz -= 1;
  if (this.keys['s'] || this.keys['arrowdown']) dz += 1;
  if (this.keys['a'] || this.keys['arrowleft']) dx -= 1;
  if (this.keys['d'] || this.keys['arrowright']) dx += 1;

  if (dx !== 0 || dz !== 0) {
    const len = Math.hypot(dx, dz);
    dx /= len; dz /= len;
    this.player.position.x += dx * speed * dt;
    this.player.position.z += dz * speed * dt;
    this.player.position.x = Math.max(-35, Math.min(35, this.player.position.x));
    this.player.position.z = Math.max(-35, Math.min(35, this.player.position.z));
    const targetAngle = Math.atan2(dx, dz);
    this.player.rotation.y = targetAngle;
  }

  this.camera.position.set(
    this.player.position.x + this.cameraOffset.x,
    this.cameraOffset.y,
    this.player.position.z + this.cameraOffset.z
  );
  this.camera.lookAt(this.player.position.x, 0, this.player.position.z);

  // Proximity check
  let near = null;
  for (const loc of window.Game.LOCATIONS) {
    const dist = Math.hypot(this.player.position.x - loc.position.x, this.player.position.z - loc.position.z);
    if (dist < loc.trigger) { near = loc; break; }
  }
  if ((near && near.id) !== (this.nearLocation && this.nearLocation.id)) {
    this.nearLocation = near;
    this.onEnterLocation.onProximityChange(near);
  }
  if (near && (this.keys['e'] || this.keys[' '])) {
    this.keys['e'] = false; this.keys[' '] = false;
    this.onEnterLocation.onInteract(near);
  }

  this.renderer.render(this.scene, this.camera);
};

window.Game.World3D.prototype.interactManually = function () {
  if (this.nearLocation) this.onEnterLocation.onInteract(this.nearLocation);
};

window.Game.World3D.prototype.destroy = function () {
  cancelAnimationFrame(this._raf);
};
