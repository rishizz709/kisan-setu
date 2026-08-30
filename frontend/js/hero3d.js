// hero3d.js — the hero landing page's animated 3D wheat field.
//
// The old version gave each stalk a single thin cylinder "stem" topped with
// one small cone, which reads as a bare stick with a spike on top rather
// than a wheat plant. This version builds each stalk from three parts —
// a tapered stem, two curved leaf blades near the base, and a proper grain
// "ear" made of a cluster of plump kernels spiraling around a thin rachis,
// plus a couple of wispy awns — so the field actually reads as wheat.

function initHero3d() {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const canvas = document.getElementById('hero-canvas');
  if (!window.THREE || !canvas) return;

  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x1a1510, 0.028);
  const camera = new THREE.PerspectiveCamera(50, canvas.clientWidth / canvas.clientHeight, 0.1, 100);
  camera.position.set(0, 2.6, 9);
  camera.lookAt(0, 1.2, 0);
  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  function resize() {
    const w = canvas.clientWidth, h = canvas.clientHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
  window.addEventListener('resize', resize);
  resize();

  scene.add(new THREE.HemisphereLight(0xe2b23e, 0x1a1510, 0.9));
  const dir = new THREE.DirectionalLight(0xffe3a8, 1.1);
  dir.position.set(4, 6, 3);
  scene.add(dir);

  const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(60, 60),
    new THREE.MeshStandardMaterial({ color: 0x241d13, roughness: 1 })
  );
  ground.rotation.x = -Math.PI / 2;
  ground.position.y = -0.2;
  scene.add(ground);

  /* ---------- shared geometry & materials (reused across every stalk) ---------- */
  const stemGeo = new THREE.CylinderGeometry(0.010, 0.022, 1.05, 5);
  const stemMat = new THREE.MeshStandardMaterial({ color: 0x8a7a3f, roughness: 0.9 });

  const leafGeo = new THREE.PlaneGeometry(0.07, 0.55, 1, 3);
  // give the leaf blade a gentle outward curve by bowing its vertices
  {
    const pos = leafGeo.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const y = pos.getY(i); // -0.275..0.275
      const t = (y + 0.275) / 0.55; // 0 at base, 1 at tip
      pos.setZ(i, Math.sin(t * Math.PI * 0.6) * 0.16);
      pos.setX(i, pos.getX(i) * (1 - t * 0.55)); // taper toward tip
    }
    leafGeo.computeVertexNormals();
  }
  const leafMat = new THREE.MeshStandardMaterial({ color: 0x7ea15a, roughness: 0.8, side: THREE.DoubleSide });

  const rachisGeo = new THREE.ConeGeometry(0.014, 0.42, 5);
  const rachisMat = new THREE.MeshStandardMaterial({ color: 0x8a7a3f, roughness: 0.9 });

  const kernelGeo = new THREE.SphereGeometry(0.045, 6, 4);
  kernelGeo.scale(1, 1.7, 1); // plump elongated grain shape

  const awnGeo = new THREE.CylinderGeometry(0.003, 0.003, 0.4, 3);
  const awnMat = new THREE.MeshStandardMaterial({ color: 0xd9c48a, roughness: 0.9 });

  const colA = new THREE.Color(0xe2b23e), colB = new THREE.Color(0xb98f2c), colC = new THREE.Color(0xcf9f33);
  const kernelMaterials = [colA, colB, colC].map(
    (c) => new THREE.MeshStandardMaterial({ color: c, roughness: 0.55, metalness: 0.06 })
  );

  const KERNEL_ROWS = 8;
  const GOLDEN_ANGLE = 2.399963; // radians, ~137.5deg — natural spiral packing

  function buildEar(pivot) {
    const kernelMat = kernelMaterials[Math.floor(Math.random() * kernelMaterials.length)];
    const rachis = new THREE.Mesh(rachisGeo, rachisMat);
    rachis.position.y = 1.28;
    pivot.add(rachis);

    for (let k = 0; k < KERNEL_ROWS; k++) {
      const t = k / (KERNEL_ROWS - 1); // 0 base -> 1 tip
      const angle = k * GOLDEN_ANGLE;
      const radius = 0.05 * (1 - t * 0.5); // taper inward near the tip
      const kernel = new THREE.Mesh(kernelGeo, kernelMat);
      kernel.position.set(
        Math.cos(angle) * radius,
        1.10 + t * 0.42,
        Math.sin(angle) * radius
      );
      kernel.rotation.y = angle;
      kernel.rotation.x = 0.35;
      pivot.add(kernel);
    }

    // a couple of wispy awns for silhouette detail
    for (let a = 0; a < 2; a++) {
      const awn = new THREE.Mesh(awnGeo, awnMat);
      awn.position.set((a === 0 ? -1 : 1) * 0.03, 1.55, 0);
      awn.rotation.z = (a === 0 ? 1 : -1) * 0.18;
      pivot.add(awn);
    }
  }

  const stalks = [];
  const STALK_COUNT = 90;
  for (let i = 0; i < STALK_COUNT; i++) {
    const pivot = new THREE.Group();

    const stem = new THREE.Mesh(stemGeo, stemMat);
    stem.position.y = 0.5;
    pivot.add(stem);

    for (let l = 0; l < 2; l++) {
      const leaf = new THREE.Mesh(leafGeo, leafMat);
      leaf.position.y = 0.28 + Math.random() * 0.12;
      leaf.rotation.y = (l === 0 ? 1 : -1) * (0.9 + Math.random() * 0.3);
      leaf.rotation.x = 0.5;
      pivot.add(leaf);
    }

    buildEar(pivot);

    pivot.position.x = (Math.random() - 0.5) * 18;
    pivot.position.z = (Math.random() - 0.15) * 10 - 2;
    const scale = 0.7 + Math.random() * 0.8;
    pivot.scale.setScalar(scale);
    pivot.userData = { phase: Math.random() * Math.PI * 2, speed: 0.8 + Math.random() * 0.6, amp: 0.08 + Math.random() * 0.1 };
    pivot.rotation.y = Math.random() * Math.PI;
    scene.add(pivot);
    stalks.push(pivot);
  }

  const dustCount = 120;
  const positions = new Float32Array(dustCount * 3);
  for (let d = 0; d < dustCount; d++) {
    positions[d * 3] = (Math.random() - 0.5) * 16;
    positions[d * 3 + 1] = Math.random() * 4 + 0.3;
    positions[d * 3 + 2] = (Math.random() - 0.2) * 10 - 2;
  }
  const dustGeo = new THREE.BufferGeometry();
  dustGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  const dust = new THREE.Points(dustGeo, new THREE.PointsMaterial({ color: 0xf3ead6, size: 0.03, transparent: true, opacity: 0.5 }));
  scene.add(dust);

  let mouseX = 0;
  window.addEventListener('mousemove', (e) => { mouseX = (e.clientX / window.innerWidth - 0.5); });

  const clock = new THREE.Clock();
  function animate() {
    requestAnimationFrame(animate);
    const t = clock.getElapsedTime();
    if (!reduceMotion) {
      stalks.forEach((p) => {
        const sway = Math.sin(t * p.userData.speed + p.userData.phase) * p.userData.amp;
        p.rotation.z = sway;
        p.rotation.x = sway * 0.4;
      });
      dust.rotation.y = t * 0.02;
      camera.position.x += (mouseX * 1.2 - camera.position.x) * 0.02;
      camera.lookAt(0, 1.2, 0);
    }
    renderer.render(scene, camera);
  }
  animate();

  // default request date = today + 3 days
  const d = new Date();
  d.setDate(d.getDate() + 3);
  const rd = document.getElementById('reqDate');
  if (rd) rd.value = d.toISOString().slice(0, 10);
}
