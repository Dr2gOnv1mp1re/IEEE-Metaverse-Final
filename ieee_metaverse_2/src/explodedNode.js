import * as THREE from 'three';

let explodedGroup = null;
let labelsContainer = null;
let animationFrameId = null;

const layers = [
  { id: 'sensors', name: 'sensors', height: 0.8, color: 0x444444, pcb: 0x1e88e5 }, // top layer
  { id: 'microcontroller', name: 'microcontroller', height: 0.5, color: 0x222222, pcb: 0x2e7d32 },
  { id: 'radio', name: 'radio', height: 0.2, color: 0x222222, pcb: 0x1565c0 },
  { id: 'battery', name: 'battery', height: -0.2, color: 0x222222, block: 0x9e9e9e },
  { id: 'base', name: 'base', height: -0.6, color: 0x000000, stand: 0x1565c0 } // bottom layer
];

const labelElements = [];

export function loadExplodedNode(dragDropSystem) {
  dragDropSystem.clearAssembly();
  
  if (!labelsContainer) {
    labelsContainer = document.createElement('div');
    labelsContainer.id = 'exploded-labels-container';
    document.body.appendChild(labelsContainer);
  }
  labelsContainer.innerHTML = '';
  labelElements.length = 0;
  
  explodedGroup = new THREE.Group();
  explodedGroup.position.set(0, 1.2, 0); // Center on table
  
  const standOffMaterial = new THREE.MeshStandardMaterial({ color: 0xd4af37, roughness: 0.3, metalness: 0.8 });
  const blackPlastic = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.7 });
  
  // Build layers
  layers.forEach((layerData) => {
    const layerGroup = new THREE.Group();
    layerGroup.position.y = layerData.height;
    
    // Main Disc
    if (layerData.id !== 'base') {
      const disc = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 0.02, 32), blackPlastic);
      layerGroup.add(disc);
    }

    // Specific contents
    if (layerData.id === 'base') {
      const baseMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.22, 0.08, 32), new THREE.MeshStandardMaterial({ color: layerData.stand }));
      const baseTop = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 0.02, 32), blackPlastic);
      baseTop.position.y = 0.05;
      layerGroup.add(baseMesh);
      layerGroup.add(baseTop);
      
      // Add legs
      for(let i=0; i<4; i++) {
        const leg = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.1, 0.04), new THREE.MeshStandardMaterial({ color: layerData.stand }));
        leg.position.set(Math.cos(i * Math.PI/2) * 0.18, -0.05, Math.sin(i * Math.PI/2) * 0.18);
        layerGroup.add(leg);
      }
    } 
    else if (layerData.id === 'battery') {
      const bat = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.15, 0.2), new THREE.MeshStandardMaterial({ color: layerData.block, metalness: 0.5, roughness: 0.5 }));
      bat.position.y = 0.08;
      layerGroup.add(bat);
    }
    else if (layerData.id === 'radio') {
      const pcb = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.015, 0.18), new THREE.MeshStandardMaterial({ color: layerData.pcb }));
      pcb.position.y = 0.03;
      layerGroup.add(pcb);
      
      const antenna = new THREE.Mesh(new THREE.CylinderGeometry(0.01, 0.01, 0.15, 8), blackPlastic);
      antenna.position.set(0.12, 0.08, 0);
      antenna.rotation.z = Math.PI / 4;
      
      const goldConnector = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.03, 0.03), standOffMaterial);
      goldConnector.position.set(0.1, 0.03, 0);
      layerGroup.add(antenna);
      layerGroup.add(goldConnector);
    }
    else if (layerData.id === 'microcontroller') {
      const pcb = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.015, 0.2), new THREE.MeshStandardMaterial({ color: layerData.pcb }));
      pcb.position.y = 0.03;
      layerGroup.add(pcb);
      
      // Chips
      const chip1 = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.02, 0.08), blackPlastic);
      chip1.position.set(0, 0.04, 0);
      const chip2 = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.02, 0.04), blackPlastic);
      chip2.position.set(0.06, 0.04, 0.05);
      layerGroup.add(chip1);
      layerGroup.add(chip2);
    }
    else if (layerData.id === 'sensors') {
      const pcb = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.015, 0.2), new THREE.MeshStandardMaterial({ color: layerData.pcb }));
      pcb.position.y = 0.03;
      layerGroup.add(pcb);
      
      const sensorDome = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.04, 0.08), new THREE.MeshStandardMaterial({ color: 0xdddddd }));
      sensorDome.position.set(0, 0.05, 0);
      layerGroup.add(sensorDome);
    }
    
    // Standoffs (up to next layer)
    if (layerData.id !== 'sensors') {
      for (let i = 0; i < 4; i++) {
        const standoff = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.28, 8), standOffMaterial);
        standoff.position.set(Math.cos(i * Math.PI/2 + Math.PI/4) * 0.15, 0.15, Math.sin(i * Math.PI/2 + Math.PI/4) * 0.15);
        layerGroup.add(standoff);
      }
    }
    
    explodedGroup.add(layerGroup);
    
    // Create HTML Label (skip base)
    if (layerData.id !== 'base') {
      const label = document.createElement('div');
      label.className = 'exploded-label';
      label.innerText = layerData.name;
      
      const line = document.createElement('div');
      line.className = 'exploded-line';
      
      labelsContainer.appendChild(line);
      labelsContainer.appendChild(label);
      
      labelElements.push({
        layerData,
        object: layerGroup,
        label,
        line
      });
    }
  });
  
  dragDropSystem.scene.add(explodedGroup);
  
  // Animation/Update Loop
  const camera = dragDropSystem.camera;
  
  function updateLabels() {
    if (!explodedGroup || !explodedGroup.parent) {
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
      if (labelsContainer) labelsContainer.innerHTML = '';
      return;
    }
    
    // Slow rotation
    explodedGroup.rotation.y += 0.002;
    
    labelElements.forEach(item => {
      // Get world position of the layer
      const worldPos = new THREE.Vector3();
      item.object.getWorldPosition(worldPos);
      worldPos.y += 0.05; // Slightly above the disc
      
      // Project to 2D screen space
      worldPos.project(camera);
      
      // Convert to CSS coordinates
      const x = (worldPos.x * .5 + .5) * window.innerWidth;
      const y = (worldPos.y * -.5 + .5) * window.innerHeight;
      
      // Target position for the label text (right side of screen)
      const targetX = window.innerWidth * 0.7;
      const targetY = y;
      
      if (worldPos.z < 1 && x > 0 && x < window.innerWidth && y > 0 && y < window.innerHeight) {
        item.label.style.left = `${targetX}px`;
        item.label.style.top = `${targetY}px`;
        item.label.classList.add('visible');
        
        // Draw line from object to label
        const dx = targetX - x;
        const dy = targetY - y;
        const length = Math.sqrt(dx*dx + dy*dy);
        const angle = Math.atan2(dy, dx) * 180 / Math.PI;
        
        item.line.style.left = `${x}px`;
        item.line.style.top = `${y}px`;
        item.line.style.width = `${length}px`;
        item.line.style.transform = `rotate(${angle}deg)`;
        item.line.classList.add('visible');
      } else {
        item.label.classList.remove('visible');
        item.line.classList.remove('visible');
      }
    });
    
    animationFrameId = requestAnimationFrame(updateLabels);
  }
  
  updateLabels();
  
  dragDropSystem.showToast('Loaded: Interactive Exploded Sensor Node', 'success');
}

export function cleanupExplodedNode() {
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId);
    animationFrameId = null;
  }
  if (labelsContainer) {
    labelsContainer.innerHTML = '';
  }
  if (explodedGroup && explodedGroup.parent) {
    explodedGroup.parent.remove(explodedGroup);
    explodedGroup = null;
  }
}
