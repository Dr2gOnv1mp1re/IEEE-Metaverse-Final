import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

/**
 * Creates and initializes the 3D Virtual Robotics Laboratory Environment.
 *
 * Developed for Member 1's responsibility:
 * "3D Environment and Virtual Laboratory" (IEEE Educational Metaverse Challenge).
 *
 * Reusable module exporting the core scene graph, camera, renderer, and
 * the designated assembly workspace anchor for other modules to integrate with.
 *
 * @param {HTMLElement} [containerElement] - Optional DOM container for the canvas.
 *                                          Defaults to #canvas-container or document.body.
 * @returns {{
 *   scene: THREE.Scene,
 *   camera: THREE.PerspectiveCamera,
 *   renderer: THREE.WebGLRenderer,
 *   assemblyWorkspace: THREE.Group,
 *   controls: OrbitControls,
 *   getWorkspacePosition: (target?: THREE.Vector3) => THREE.Vector3,
 *   focusAssemblyWorkspace: () => void,
 *   update: () => void,
 *   render: () => void,
 *   dispose: () => void
 * }} Environment context object containing the required application properties.
 */
export function createEnvironment(containerElement = null) {
  // Resolve mounting DOM container
  const container =
    containerElement ||
    document.getElementById('canvas-container') ||
    document.body;

  // ---------------------------------------------------------------------------
  // 1. SCENE SETUP & ATMOSPHERE
  // ---------------------------------------------------------------------------
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x0c0f17); // Deep tech slate ambiance
  scene.fog = new THREE.FogExp2(0x0c0f17, 0.035);

  // ---------------------------------------------------------------------------
  // 2. CAMERA SETUP
  // ---------------------------------------------------------------------------
  const aspect = window.innerWidth / window.innerHeight;
  const camera = new THREE.PerspectiveCamera(50, aspect, 0.1, 100);
  camera.position.set(0, 3.2, 4.8);

  // ---------------------------------------------------------------------------
  // 3. RENDERER (Optimized for low-end hardware without dedicated GPU)
  // ---------------------------------------------------------------------------
  const renderer = new THREE.WebGLRenderer({
    antialias: true,
    powerPreference: 'high-performance'
  });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.1;

  container.appendChild(renderer.domElement);

  // ---------------------------------------------------------------------------
  // 4. CAMERA CONTROLS (Orbit, pan, zoom)
  // ---------------------------------------------------------------------------
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.06;
  controls.enablePan = true;
  controls.panSpeed = 0.8;
  controls.rotateSpeed = 0.8;
  controls.minDistance = 1.2;
  controls.maxDistance = 14.0;
  controls.maxPolarAngle = Math.PI / 2 - 0.05; // Prevent dipping beneath floor
  controls.target.set(0, 1.01, 0); // Focus onto the assembly workspace
  controls.update();

  // ---------------------------------------------------------------------------
  // 5. LIGHTING (Balanced illumination without heavy overhead)
  // ---------------------------------------------------------------------------
  const hemiLight = new THREE.HemisphereLight(0xe2e8f0, 0x1e293b, 0.75);
  scene.add(hemiLight);

  const dirLight = new THREE.DirectionalLight(0xffffff, 0.9);
  dirLight.position.set(4, 7, 3);
  dirLight.castShadow = true;
  dirLight.shadow.mapSize.width = 1024;
  dirLight.shadow.mapSize.height = 1024;
  dirLight.shadow.camera.near = 0.5;
  dirLight.shadow.camera.far = 25;
  dirLight.shadow.camera.left = -6;
  dirLight.shadow.camera.right = 6;
  dirLight.shadow.camera.top = 6;
  dirLight.shadow.camera.bottom = -6;
  dirLight.shadow.bias = -0.0005;
  scene.add(dirLight);

  const workLight = new THREE.SpotLight(0x38bdf8, 1.8, 8, Math.PI / 4, 0.4, 1.2);
  workLight.position.set(0, 3.8, 0);
  workLight.target.position.set(0, 1.01, 0);
  workLight.castShadow = true;
  workLight.shadow.mapSize.width = 512;
  workLight.shadow.mapSize.height = 512;
  scene.add(workLight);
  scene.add(workLight.target);

  const backFillLight = new THREE.PointLight(0x60a5fa, 0.6, 12);
  backFillLight.position.set(-3, 2.5, -3);
  scene.add(backFillLight);

  // ---------------------------------------------------------------------------
  // 6. PROCEDURAL TEXTURES & SHARED MATERIALS
  // ---------------------------------------------------------------------------
  const floorTexture = createFloorTexture();
  const assemblyMatTexture = createAssemblyMatTexture();

  const wallMaterial = new THREE.MeshStandardMaterial({
    color: 0x1c2230,
    roughness: 0.85,
    metalness: 0.1
  });

  const wallTrimMaterial = new THREE.MeshStandardMaterial({
    color: 0x2e384d,
    roughness: 0.5,
    metalness: 0.3
  });

  const metalFrameMaterial = new THREE.MeshStandardMaterial({
    color: 0x475569,
    roughness: 0.35,
    metalness: 0.85
  });

  const darkSurfaceMaterial = new THREE.MeshStandardMaterial({
    color: 0x1e293b,
    roughness: 0.4,
    metalness: 0.2
  });

  const emissiveLedMaterial = new THREE.MeshStandardMaterial({
    color: 0xdff9fb,
    emissive: 0x38bdf8,
    emissiveIntensity: 0.75,
    roughness: 0.2
  });

  // ---------------------------------------------------------------------------
  // 7. LABORATORY FLOOR
  // ---------------------------------------------------------------------------
  const floorSize = 24;
  const floorGeo = new THREE.PlaneGeometry(floorSize, floorSize);
  const floorMat = new THREE.MeshStandardMaterial({
    map: floorTexture,
    roughness: 0.7,
    metalness: 0.15
  });
  const floorMesh = new THREE.Mesh(floorGeo, floorMat);
  floorMesh.rotation.x = -Math.PI / 2;
  floorMesh.receiveShadow = true;
  floorMesh.name = 'labFloor';
  scene.add(floorMesh);

  // Demarcated safety zone ring on floor
  const floorZoneGeo = new THREE.RingGeometry(2.3, 2.38, 48);
  const floorZoneMat = new THREE.MeshBasicMaterial({
    color: 0x0284c7,
    side: THREE.DoubleSide,
    transparent: true,
    opacity: 0.45
  });
  const floorZoneMesh = new THREE.Mesh(floorZoneGeo, floorZoneMat);
  floorZoneMesh.rotation.x = -Math.PI / 2;
  floorZoneMesh.position.set(0, 0.002, 0);
  scene.add(floorZoneMesh);

  // ---------------------------------------------------------------------------
  // 8. LABORATORY WALLS & STRUCTURAL PILLARS
  // ---------------------------------------------------------------------------
  const roomWidth = 18;
  const roomDepth = 14;
  const roomHeight = 5.0;
  const wallsGroup = new THREE.Group();
  wallsGroup.name = 'labWalls';

  // Back Wall
  const backWallGeo = new THREE.PlaneGeometry(roomWidth, roomHeight);
  const backWall = new THREE.Mesh(backWallGeo, wallMaterial);
  backWall.position.set(0, roomHeight / 2, -roomDepth / 2);
  backWall.receiveShadow = true;
  wallsGroup.add(backWall);

  // Left Wall
  const sideWallGeo = new THREE.PlaneGeometry(roomDepth, roomHeight);
  const leftWall = new THREE.Mesh(sideWallGeo, wallMaterial);
  leftWall.position.set(-roomWidth / 2, roomHeight / 2, 0);
  leftWall.rotation.y = Math.PI / 2;
  leftWall.receiveShadow = true;
  wallsGroup.add(leftWall);

  // Right Wall
  const rightWall = new THREE.Mesh(sideWallGeo, wallMaterial);
  rightWall.position.set(roomWidth / 2, roomHeight / 2, 0);
  rightWall.rotation.y = -Math.PI / 2;
  rightWall.receiveShadow = true;
  wallsGroup.add(rightWall);

  // Baseboard
  const baseboardGeo = new THREE.BoxGeometry(roomWidth, 0.15, 0.08);
  const backBaseboard = new THREE.Mesh(baseboardGeo, wallTrimMaterial);
  backBaseboard.position.set(0, 0.075, -roomDepth / 2 + 0.04);
  wallsGroup.add(backBaseboard);

  // Support Pillars
  const pillarGeo = new THREE.BoxGeometry(0.5, roomHeight, 0.5);
  const pillarPositions = [
    [-roomWidth / 2 + 0.25, roomHeight / 2, -roomDepth / 2 + 0.25],
    [roomWidth / 2 - 0.25, roomHeight / 2, -roomDepth / 2 + 0.25],
    [-4, roomHeight / 2, -roomDepth / 2 + 0.25],
    [4, roomHeight / 2, -roomDepth / 2 + 0.25]
  ];
  pillarPositions.forEach(([x, y, z]) => {
    const pillar = new THREE.Mesh(pillarGeo, wallTrimMaterial);
    pillar.position.set(x, y, z);
    pillar.castShadow = true;
    pillar.receiveShadow = true;
    wallsGroup.add(pillar);
  });

  // Architectural LED Stripe
  const stripeGeo = new THREE.BoxGeometry(roomWidth, 0.08, 0.02);
  const stripeMesh = new THREE.Mesh(stripeGeo, emissiveLedMaterial);
  stripeMesh.position.set(0, 2.6, -roomDepth / 2 + 0.02);
  wallsGroup.add(stripeMesh);

  scene.add(wallsGroup);

  // ---------------------------------------------------------------------------
  // 9. OVERHEAD LIGHTING GANTRY
  // ---------------------------------------------------------------------------
  const ceilingGroup = new THREE.Group();
  ceilingGroup.name = 'ceilingGantry';

  const gantryBarGeo = new THREE.BoxGeometry(7.0, 0.1, 0.1);
  const lightBarGeo = new THREE.BoxGeometry(6.4, 0.04, 0.15);

  [-1.5, 1.5].forEach((zOffset) => {
    const gantry = new THREE.Mesh(gantryBarGeo, metalFrameMaterial);
    gantry.position.set(0, 4.2, zOffset);
    ceilingGroup.add(gantry);

    const ledPanel = new THREE.Mesh(lightBarGeo, emissiveLedMaterial);
    ledPanel.position.set(0, 4.14, zOffset);
    ceilingGroup.add(ledPanel);
  });

  scene.add(ceilingGroup);

  // ---------------------------------------------------------------------------
  // 10. WORKBENCH (Laboratory table structure)
  // ---------------------------------------------------------------------------
  const workbenchGroup = new THREE.Group();
  workbenchGroup.name = 'workbench';

  const tableWidth = 2.4;
  const tableDepth = 1.4;
  const tableThickness = 0.08;
  const tableHeight = 0.96; // Top table surface reaches y = 1.00m

  const tableTopGeo = new THREE.BoxGeometry(tableWidth, tableThickness, tableDepth);
  const tableTop = new THREE.Mesh(tableTopGeo, darkSurfaceMaterial);
  tableTop.position.set(0, tableHeight, 0);
  tableTop.castShadow = true;
  tableTop.receiveShadow = true;
  workbenchGroup.add(tableTop);

  const trimThickness = 0.02;
  const tableTrimGeo = new THREE.BoxGeometry(
    tableWidth + trimThickness * 2,
    tableThickness + 0.02,
    tableDepth + trimThickness * 2
  );
  const tableTrimMat = new THREE.MeshStandardMaterial({
    color: 0x334155,
    roughness: 0.3,
    metalness: 0.8
  });
  const tableTrim = new THREE.Mesh(tableTrimGeo, tableTrimMat);
  tableTrim.position.set(0, tableHeight - 0.01, 0);
  tableTrim.castShadow = true;
  workbenchGroup.add(tableTrim);

  const legWidth = 0.08;
  const legHeight = tableHeight - tableThickness / 2;
  const legGeo = new THREE.BoxGeometry(legWidth, legHeight, legWidth);
  const legOffsetX = tableWidth / 2 - 0.12;
  const legOffsetZ = tableDepth / 2 - 0.12;
  const legY = legHeight / 2;

  [
    [-legOffsetX, legY, -legOffsetZ],
    [legOffsetX, legY, -legOffsetZ],
    [-legOffsetX, legY, legOffsetZ],
    [legOffsetX, legY, legOffsetZ]
  ].forEach(([lx, ly, lz]) => {
    const leg = new THREE.Mesh(legGeo, metalFrameMaterial);
    leg.position.set(lx, ly, lz);
    leg.castShadow = true;
    leg.receiveShadow = true;
    workbenchGroup.add(leg);

    const footGeo = new THREE.CylinderGeometry(0.05, 0.06, 0.04, 16);
    const footMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.9 });
    const foot = new THREE.Mesh(footGeo, footMat);
    foot.position.set(lx, 0.02, lz);
    workbenchGroup.add(foot);
  });

  const lowerShelfGeo = new THREE.BoxGeometry(tableWidth - 0.24, 0.04, tableDepth - 0.24);
  const lowerShelf = new THREE.Mesh(lowerShelfGeo, metalFrameMaterial);
  lowerShelf.position.set(0, 0.25, 0);
  lowerShelf.castShadow = true;
  lowerShelf.receiveShadow = true;
  workbenchGroup.add(lowerShelf);

  scene.add(workbenchGroup);

  // ---------------------------------------------------------------------------
  // 11. DESIGNATED ROBOT ASSEMBLY WORKSPACE
  // ---------------------------------------------------------------------------
  // Represents the stable anchor for the robot assembly area.
  // Other developers can place components directly inside this THREE.Group
  // or reference its stable world transform at (0, 1.01, 0).
  const assemblyWorkspace = new THREE.Group();
  assemblyWorkspace.name = 'assemblyWorkspace';

  // Stable world position and rotation:
  // Positioned directly atop the workbench surface with identity rotation
  assemblyWorkspace.position.set(0, 1.01, 0);
  assemblyWorkspace.rotation.set(0, 0, 0);

  const matWidth = 1.6;
  const matDepth = 1.0;
  const matHeight = 0.01;

  // Visual ESD assembly mat centered inside the workspace
  const matGeo = new THREE.BoxGeometry(matWidth, matHeight, matDepth);
  const matMat = new THREE.MeshStandardMaterial({
    map: assemblyMatTexture,
    roughness: 0.55,
    metalness: 0.1
  });
  const matMesh = new THREE.Mesh(matGeo, matMat);
  // Position mat so top surface aligns precisely with workspace origin (y = 0 local)
  matMesh.position.set(0, -matHeight / 2, 0);
  matMesh.receiveShadow = true;
  matMesh.name = 'assemblyWorkspaceMat';
  assemblyWorkspace.add(matMesh);

  // Border frame
  const frameGeo = new THREE.BoxGeometry(matWidth + 0.04, 0.012, matDepth + 0.04);
  const frameMat = new THREE.MeshStandardMaterial({
    color: 0x0284c7,
    emissive: 0x0369a1,
    emissiveIntensity: 0.3,
    roughness: 0.3,
    metalness: 0.7
  });
  const frameMesh = new THREE.Mesh(frameGeo, frameMat);
  frameMesh.position.set(0, -matHeight / 2, 0);
  assemblyWorkspace.add(frameMesh);

  // 4 Corner Alignment Target Brackets
  const bracketGeo = new THREE.CylinderGeometry(0.025, 0.025, 0.012, 16);
  const bracketMat = new THREE.MeshStandardMaterial({
    color: 0x38bdf8,
    emissive: 0x0284c7,
    emissiveIntensity: 0.5
  });
  const bOffsetX = matWidth / 2 - 0.06;
  const bOffsetZ = matDepth / 2 - 0.06;
  [
    [-bOffsetX, bOffsetZ],
    [bOffsetX, bOffsetZ],
    [-bOffsetX, -bOffsetZ],
    [bOffsetX, -bOffsetZ]
  ].forEach(([bx, bz]) => {
    const bracket = new THREE.Mesh(bracketGeo, bracketMat);
    bracket.position.set(bx, 0.006, bz);
    assemblyWorkspace.add(bracket);
  });

  // Attach workspace metadata and position accessor
  assemblyWorkspace.userData = {
    isAssemblyWorkspace: true,
    surfaceY: 1.01,
    width: matWidth,
    depth: matDepth,
    center: new THREE.Vector3(0, 1.01, 0),
    description: 'IEEE Robotics Assembly Target Zone',
    getWorldPosition: (target = new THREE.Vector3()) => assemblyWorkspace.getWorldPosition(target)
  };

  scene.add(assemblyWorkspace);

  // ---------------------------------------------------------------------------
  // 12. LABORATORY EQUIPMENT (Shelves, Monitor Station, Pegboard)
  // ---------------------------------------------------------------------------
  const equipmentGroup = new THREE.Group();
  equipmentGroup.name = 'labEquipment';

  // Diagnostic Monitor Console
  const terminalGroup = new THREE.Group();
  terminalGroup.position.set(0.9, 1.0, -0.4);

  const standGeo = new THREE.CylinderGeometry(0.08, 0.09, 0.02, 16);
  const standMesh = new THREE.Mesh(standGeo, metalFrameMaterial);
  terminalGroup.add(standMesh);

  const poleGeo = new THREE.CylinderGeometry(0.015, 0.015, 0.25, 12);
  const poleMesh = new THREE.Mesh(poleGeo, metalFrameMaterial);
  poleMesh.position.set(0, 0.125, 0);
  terminalGroup.add(poleMesh);

  const monitorGeo = new THREE.BoxGeometry(0.45, 0.28, 0.025);
  const screenTexture = createScreenTexture();
  const screenFaceMat = new THREE.MeshBasicMaterial({ map: screenTexture });
  const monitorBodyMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.4 });
  const monitorMaterials = [
    monitorBodyMat,
    monitorBodyMat,
    monitorBodyMat,
    monitorBodyMat,
    screenFaceMat,
    monitorBodyMat
  ];
  const monitor = new THREE.Mesh(monitorGeo, monitorMaterials);
  monitor.position.set(0, 0.26, 0);
  monitor.rotation.y = -Math.PI / 7;
  terminalGroup.add(monitor);

  const kbGeo = new THREE.BoxGeometry(0.26, 0.012, 0.1);
  const kb = new THREE.Mesh(kbGeo, darkSurfaceMaterial);
  kb.position.set(-0.06, 0.006, 0.16);
  kb.rotation.y = -Math.PI / 7;
  terminalGroup.add(kb);

  equipmentGroup.add(terminalGroup);

  // Storage Shelf Rack with Component Bins
  const rackGroup = new THREE.Group();
  rackGroup.position.set(-3.6, 0, -4.2);

  const uprightGeo = new THREE.BoxGeometry(0.06, 2.8, 0.06);
  [
    [-1.0, 1.4, -0.25],
    [1.0, 1.4, -0.25],
    [-1.0, 1.4, 0.25],
    [1.0, 1.4, 0.25]
  ].forEach(([ux, uy, uz]) => {
    const upright = new THREE.Mesh(uprightGeo, metalFrameMaterial);
    upright.position.set(ux, uy, uz);
    upright.castShadow = true;
    rackGroup.add(upright);
  });

  const shelfLevelGeo = new THREE.BoxGeometry(2.08, 0.04, 0.54);
  const binColors = [0x0284c7, 0xf59e0b, 0x10b981, 0x6366f1];
  [0.2, 0.9, 1.6, 2.3].forEach((sy, levelIdx) => {
    const shelf = new THREE.Mesh(shelfLevelGeo, darkSurfaceMaterial);
    shelf.position.set(0, sy, 0);
    shelf.castShadow = true;
    shelf.receiveShadow = true;
    rackGroup.add(shelf);

    for (let b = -0.7; b <= 0.7; b += 0.48) {
      const binWidth = 0.38;
      const binHeight = 0.22;
      const binDepth = 0.42;
      const binGeo = new THREE.BoxGeometry(binWidth, binHeight, binDepth);
      const binColor = binColors[(levelIdx + Math.round(b * 10)) % binColors.length];
      const binMat = new THREE.MeshStandardMaterial({
        color: binColor,
        roughness: 0.6,
        metalness: 0.1
      });
      const binMesh = new THREE.Mesh(binGeo, binMat);
      binMesh.position.set(b, sy + binHeight / 2 + 0.02, 0);
      binMesh.castShadow = true;
      binMesh.receiveShadow = true;
      rackGroup.add(binMesh);
    }
  });

  equipmentGroup.add(rackGroup);

  // Wall Pegboard & Schematic Display
  const boardGeo = new THREE.BoxGeometry(2.5, 1.4, 0.04);
  const boardMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.8 });
  const boardMesh = new THREE.Mesh(boardGeo, boardMat);
  boardMesh.position.set(2.5, 2.2, -roomDepth / 2 + 0.08);
  equipmentGroup.add(boardMesh);

  const wallDisplayGeo = new THREE.BoxGeometry(1.8, 1.0, 0.03);
  const wallDisplayTexture = createWallDisplayTexture();
  const wallDisplayMat = new THREE.MeshBasicMaterial({ map: wallDisplayTexture });
  const wallDisplayMesh = new THREE.Mesh(wallDisplayGeo, wallDisplayMat);
  wallDisplayMesh.position.set(-1.8, 2.3, -roomDepth / 2 + 0.06);
  equipmentGroup.add(wallDisplayMesh);

  scene.add(equipmentGroup);

  // ---------------------------------------------------------------------------
  // 13. RESPONSIVE RESIZE HANDLING
  // ---------------------------------------------------------------------------
  function onWindowResize() {
    const width = window.innerWidth;
    const height = window.innerHeight;

    camera.aspect = width / height;
    camera.updateProjectionMatrix();

    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  }

  window.addEventListener('resize', onWindowResize);

  // ---------------------------------------------------------------------------
  // 14. PUBLIC API METHODS
  // ---------------------------------------------------------------------------
  /**
   * Helper to retrieve the current world position of the assembly workspace.
   * @param {THREE.Vector3} [target=new THREE.Vector3()]
   * @returns {THREE.Vector3}
   */
  function getWorkspacePosition(target = new THREE.Vector3()) {
    return assemblyWorkspace.getWorldPosition(target);
  }

  /**
   * Helper to focus camera view smoothly onto the assembly workspace.
   */
  function focusAssemblyWorkspace() {
    controls.target.copy(assemblyWorkspace.position);
    camera.position.set(0, 2.6, 3.4);
    controls.update();
  }

  /**
   * Animation update step (updates controls damping).
   */
  function update() {
    controls.update();
  }

  /**
   * Render frame step.
   */
  function render() {
    renderer.render(scene, camera);
  }

  /**
   * Cleanup resources when disposing environment.
   */
  function dispose() {
    window.removeEventListener('resize', onWindowResize);
    controls.dispose();
    renderer.dispose();
    if (renderer.domElement && renderer.domElement.parentNode) {
      renderer.domElement.parentNode.removeChild(renderer.domElement);
    }
  }

  // ---------------------------------------------------------------------------
  // 15. RETURN ENVIRONMENT OBJECT
  // ---------------------------------------------------------------------------
  return {
    // Required core objects for other modules:
    scene,
    camera,
    renderer,
    assemblyWorkspace,

    // Controls & spatial accessors:
    controls,
    getWorkspacePosition,
    focusAssemblyWorkspace,

    // Lifecycle methods:
    update,
    render,
    dispose
  };
}

// =============================================================================
// PROCEDURAL CANVAS TEXTURE GENERATORS (Zero external network dependencies)
// =============================================================================

function createFloorTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = '#141824';
  ctx.fillRect(0, 0, 512, 512);

  const tileSize = 128;
  ctx.strokeStyle = '#222c3d';
  ctx.lineWidth = 3;

  for (let x = 0; x <= 512; x += tileSize) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, 512);
    ctx.stroke();
  }

  for (let y = 0; y <= 512; y += tileSize) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(512, y);
    ctx.stroke();
  }

  ctx.strokeStyle = '#1a2233';
  ctx.lineWidth = 1;
  for (let x = 0; x < 512; x += tileSize) {
    for (let y = 0; y < 512; y += tileSize) {
      ctx.strokeRect(x + 6, y + 6, tileSize - 12, tileSize - 12);
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(6, 6);
  return texture;
}

function createAssemblyMatTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 640;
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = '#0f3a4a';
  ctx.fillRect(0, 0, 1024, 640);

  ctx.strokeStyle = '#38bdf8';
  ctx.lineWidth = 8;
  ctx.strokeRect(16, 16, 1024 - 32, 640 - 32);

  ctx.strokeStyle = '#0284c7';
  ctx.lineWidth = 2;
  ctx.strokeRect(32, 32, 1024 - 64, 640 - 64);

  ctx.strokeStyle = 'rgba(56, 189, 248, 0.18)';
  ctx.lineWidth = 1;
  const gridSize = 40;

  for (let x = 40; x < 1024 - 40; x += gridSize) {
    ctx.beginPath();
    ctx.moveTo(x, 40);
    ctx.lineTo(x, 640 - 40);
    ctx.stroke();
  }

  for (let y = 40; y < 640 - 40; y += gridSize) {
    ctx.beginPath();
    ctx.moveTo(40, y);
    ctx.lineTo(1024 - 40, y);
    ctx.stroke();
  }

  ctx.strokeStyle = 'rgba(56, 189, 248, 0.6)';
  ctx.lineWidth = 2;
  const cx = 1024 / 2;
  const cy = 640 / 2;

  ctx.beginPath();
  ctx.moveTo(cx, 40);
  ctx.lineTo(cx, 640 - 40);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(40, cy);
  ctx.lineTo(1024 - 40, cy);
  ctx.stroke();

  ctx.strokeStyle = '#38bdf8';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(cx, cy, 32, 0, Math.PI * 2);
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(cx, cy, 8, 0, Math.PI * 2);
  ctx.fillStyle = '#38bdf8';
  ctx.fill();

  ctx.font = 'bold 20px monospace';
  ctx.fillStyle = '#38bdf8';
  ctx.fillText('IEEE ROBOTICS // VIRTUAL ASSEMBLY WORKSPACE', 52, 70);

  ctx.font = '14px monospace';
  ctx.fillStyle = '#7dd3fc';
  ctx.fillText('SURFACE: ESD-PROTECTED // ORIGIN: (0.00, 1.01, 0.00)', 52, 94);
  ctx.fillText('DIMENSIONS: 1.60m x 1.00m', 1024 - 300, 70);

  const drawCorner = (x, y, dx, dy) => {
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(x + dx * 28, y);
    ctx.lineTo(x, y);
    ctx.lineTo(x, y + dy * 28);
    ctx.stroke();
  };

  drawCorner(52, 114, 1, 1);
  drawCorner(1024 - 52, 114, -1, 1);
  drawCorner(52, 640 - 52, 1, -1);
  drawCorner(1024 - 52, 640 - 52, -1, -1);

  const texture = new THREE.CanvasTexture(canvas);
  return texture;
}

function createScreenTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 320;
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = '#090d16';
  ctx.fillRect(0, 0, 512, 320);

  ctx.fillStyle = '#1e293b';
  ctx.fillRect(0, 0, 512, 36);

  ctx.font = 'bold 16px sans-serif';
  ctx.fillStyle = '#38bdf8';
  ctx.fillText('AI ADAPTIVE LEARNING SYSTEM', 16, 24);

  ctx.strokeStyle = '#22c55e';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(20, 140);
  for (let x = 20; x < 490; x += 20) {
    const y = 140 + Math.sin(x * 0.05) * 35 + (Math.random() - 0.5) * 10;
    ctx.lineTo(x, y);
  }
  ctx.stroke();

  ctx.font = '14px monospace';
  ctx.fillStyle = '#94a3b8';
  ctx.fillText('STATUS: SMART CLASSROOM ONLINE', 20, 200);
  ctx.fillText('MODULE: M1 - AI-DRIVEN PERSONALIZATION', 20, 224);
  ctx.fillText('WORKSPACE: IMMERSIVE SPACE READY', 20, 248);
  ctx.fillStyle = '#38bdf8';
  ctx.fillText('AWAITING STUDENT INTERACTION...', 20, 280);

  const texture = new THREE.CanvasTexture(canvas);
  return texture;
}

function createWallDisplayTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = '#0f172a';
  ctx.fillRect(0, 0, 512, 256);

  ctx.strokeStyle = '#0284c7';
  ctx.lineWidth = 3;
  ctx.strokeRect(8, 8, 512 - 16, 256 - 16);

  ctx.font = 'bold 18px monospace';
  ctx.fillStyle = '#38bdf8';
  ctx.fillText('IEEE ROBOTICS SIMULATION SCHEMATIC', 24, 40);

  ctx.strokeStyle = '#38bdf8';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(100, 180, 24, 0, Math.PI * 2);
  ctx.moveTo(100, 156);
  ctx.lineTo(160, 90);
  ctx.lineTo(240, 110);
  ctx.lineTo(310, 80);
  ctx.stroke();

  [
    [160, 90],
    [240, 110],
    [310, 80]
  ].forEach(([jx, jy]) => {
    ctx.beginPath();
    ctx.arc(jx, jy, 6, 0, Math.PI * 2);
    ctx.fillStyle = '#22c55e';
    ctx.fill();
  });

  ctx.font = '12px monospace';
  ctx.fillStyle = '#94a3b8';
  ctx.fillText('JOINT_0: 0.00 DEG', 340, 120);
  ctx.fillText('JOINT_1: 0.00 DEG', 340, 145);
  ctx.fillText('JOINT_2: 0.00 DEG', 340, 170);
  ctx.fillText('SIMULATION READY', 340, 195);

  const texture = new THREE.CanvasTexture(canvas);
  return texture;
}
