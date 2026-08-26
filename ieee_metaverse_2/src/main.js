import * as THREE from 'three';
import { createEnvironment } from './environment.js';
import { ROBOT_PARTS_CATALOG, PART_CATEGORIES } from './robotParts.js';
import { DragDropSystem } from './dragDropSystem.js';
import { RobotSimulator } from './robotSimulator.js';
import { loadRobotPreset } from './robotPresets.js';
import { initGalleryModal } from './galleryModal.js';
import { TutorialSystem } from './tutorialSystem.js';
import { UIController } from './ui.js';

// =============================================================================
// 1. INITIALIZE 3D VIRTUAL LABORATORY ENVIRONMENT
// =============================================================================
const environment = createEnvironment();
const { scene, camera, renderer, assemblyWorkspace, controls, update, render } = environment;

// Expose environment on window for debugging & inspection
window.__META_ENV__ = environment;

// =============================================================================
// 2. INITIALIZE DRAG-AND-DROP, SIMULATOR, TUTORIAL & UI ENGINES
// =============================================================================
let uiController = null;

const dragDropSystem = new DragDropSystem({
  scene,
  camera,
  renderer,
  assemblyWorkspace,
  controls,
  onAssemblyChanged: (summary) => uiController?.updateDiagnosticsHUD(summary),
  onPartSelected: (selectionInfo) => uiController?.updateSelectedPartUI(selectionInfo),
  onPartAdded: (newMesh) => {
    if (uiController?.currentMode === 'tutorial') {
      tutorialSystem.validatePlacement(newMesh.userData.partId);
    }
  }
});

const robotSimulator = new RobotSimulator({
  scene,
  dragDropSystem
});

const tutorialSystem = new TutorialSystem({
  scene,
  dragDropSystem,
  onSwitchToSim: () => uiController?.setAppMode('sim')
});

uiController = new UIController({
  dragDropSystem,
  robotSimulator,
  tutorialSystem,
  environment
});

// Initialize Gallery & 3D Snapshot tool
initGalleryModal(renderer, scene, camera);

// =============================================================================
// 3. LOAD DEFAULT PRESET ON STARTUP
// =============================================================================
loadRobotPreset('industrial_arm', dragDropSystem);

// =============================================================================
// 9. RENDER & ANIMATION LOOP
// =============================================================================
const clock = new THREE.Clock();

function animate() {
  requestAnimationFrame(animate);

  const delta = Math.min(clock.getDelta(), 0.1);

  // Update controls damping & environment
  update();

  // Update robotics kinematics & simulation mechanics
  robotSimulator.update(delta);

  // Update tutorial beacon animation
  tutorialSystem.update(delta);

  // Keep selection bounding box synchronized
  dragDropSystem.updateSelectionBox();

  // Render frame
  render();
}

animate();
