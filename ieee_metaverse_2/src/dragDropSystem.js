import * as THREE from 'three';
import { createPartMesh, ROBOT_PARTS_CATALOG } from './robotParts.js';

/**
 * Drag-and-Drop, 3D Raycasting, Magnetic Snapping, and Part Selection Engine.
 */
export class DragDropSystem {
  /**
   * @param {object} params
   * @param {THREE.Scene} params.scene
   * @param {THREE.PerspectiveCamera} params.camera
   * @param {THREE.WebGLRenderer} params.renderer
   * @param {THREE.Group} params.assemblyWorkspace
   * @param {any} params.controls - OrbitControls instance
   * @param {Function} [params.onAssemblyChanged] - Callback triggered when robot structure modifies
   * @param {Function} [params.onPartSelected] - Callback when a part is selected or deselected
   * @param {Function} [params.onPartAdded] - Callback when a new part is placed or snapped
   */
  constructor({ scene, camera, renderer, assemblyWorkspace, controls, onAssemblyChanged, onPartSelected, onPartAdded }) {
    this.scene = scene;
    this.camera = camera;
    this.renderer = renderer;
    this.assemblyWorkspace = assemblyWorkspace;
    this.controls = controls;
    this.onAssemblyChanged = onAssemblyChanged;
    this.onPartSelected = onPartSelected;
    this.onPartAdded = onPartAdded;

    // Raycasting & pointer tracking
    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();

    // Table assembly plane (workspace at Y = 1.01)
    this.tablePlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), -1.01);

    // Active robot roots & placed parts in scene
    this.placedParts = []; // All parts currently in scene
    this.robotRoots = [];  // Root parts (pedestals, rovers, drones)
    this.selectedPart = null;

    // Dragging state
    this.isDragging = false;
    this.draggedPartId = null;
    this.ghostMesh = null;
    this.activeSnapTarget = null;
    this.currentTheme = 'cyber';

    // Selection highlight helper
    this.selectionBox = new THREE.BoxHelper(new THREE.Mesh(), 0x38bdf8);
    this.selectionBox.visible = false;
    this.scene.add(this.selectionBox);

    // Snap distance threshold (meters)
    this.SNAP_DISTANCE = 0.42;

    this.initEvents();
  }

  initEvents() {
    const canvas = this.renderer.domElement;

    // Click to select parts
    canvas.addEventListener('pointerdown', (e) => {
      // Only handle selection if not currently dragging
      if (this.isDragging) return;
      this.handlePointerDown(e);
    });

    // Drag-over Three.js canvas (HTML5 drag-and-drop from sidebar)
    canvas.addEventListener('dragover', (e) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'copy';
      this.updateDragPosition(e.clientX, e.clientY);
    });

    canvas.addEventListener('drop', (e) => {
      e.preventDefault();
      const partId = e.dataTransfer.getData('text/plain') || this.draggedPartId;
      if (partId) {
        this.commitDrop(partId, e.clientX, e.clientY);
      }
    });

    canvas.addEventListener('dragenter', (e) => {
      e.preventDefault();
      const partId = e.dataTransfer.getData('text/plain') || this.draggedPartId;
      if (partId && !this.ghostMesh) {
        this.startDrag(partId);
      }
    });

    canvas.addEventListener('dragleave', (e) => {
      if (e.relatedTarget === null || e.relatedTarget.tagName !== 'CANVAS') {
        this.cancelDrag();
      }
    });
  }

  /**
   * Starts drag operation for a given catalog part ID.
   * @param {string} partId
   */
  startDrag(partId) {
    this.draggedPartId = partId;
    this.isDragging = true;

    // Disable OrbitControls while dragging over canvas
    if (this.controls) this.controls.enabled = false;

    // Show all unoccupied compatible socket markers
    this.showCompatibleSockets(partId);

    // Create ghost mesh preview
    if (this.ghostMesh) {
      this.scene.remove(this.ghostMesh);
    }
    this.ghostMesh = createPartMesh(partId, { isGhost: true, theme: this.currentTheme });
    this.ghostMesh.position.set(0, -999, 0); // Hide until first pointer update
    this.scene.add(this.ghostMesh);
  }

  /**
   * Cancels active drag operation and removes ghost preview.
   */
  cancelDrag() {
    this.isDragging = false;
    this.draggedPartId = null;
    this.activeSnapTarget = null;

    if (this.controls) this.controls.enabled = true;
    if (this.ghostMesh) {
      this.scene.remove(this.ghostMesh);
      this.ghostMesh = null;
    }

    this.hideAllSocketMarkers();
  }

  /**
   * Updates ghost position and calculates magnetic snapping.
   */
  updateDragPosition(clientX, clientY) {
    if (!this.ghostMesh || !this.draggedPartId) return;

    const rect = this.renderer.domElement.getBoundingClientRect();
    this.mouse.x = ((clientX - rect.left) / rect.width) * 2 - 1;
    this.mouse.y = -((clientY - rect.top) / rect.height) * 2 + 1;

    this.raycaster.setFromCamera(this.mouse, this.camera);

    // 1. Check for magnetic snapping to compatible sockets on existing parts
    const snap = this.findNearestSnapSocket();

    // Reset ghost mesh color in case it was red
    this.ghostMesh.traverse((child) => {
      if (child.isMesh && child.userData.originalColor) {
        child.material.color.setHex(child.userData.originalColor);
      }
    });

    if (snap) {
      this.activeSnapTarget = snap;
      // Snap ghost to socket world position
      this.ghostMesh.position.copy(snap.worldPos);
      if (snap.worldQuat) this.ghostMesh.quaternion.copy(snap.worldQuat);

      if (snap.isIncompatible) {
        // Flash red for incompatible socket
        this.ghostMesh.traverse((child) => {
          if (child.isMesh) {
            if (!child.userData.originalColor) child.userData.originalColor = child.material.color.getHex();
            child.material.color.setHex(0xef4444); // red
          }
        });
      } else {
        // Highlight target socket for valid snap
        this.highlightSocket(snap.marker, true);
      }
      return;
    }

    // No snap candidate active
    if (this.activeSnapTarget && !this.activeSnapTarget.isIncompatible) {
      this.highlightSocket(this.activeSnapTarget.marker, false);
    }
    this.activeSnapTarget = null;

    // 2. If part is a ROOT base (pedestal or rover), raycast against workspace table
    const meta = ROBOT_PARTS_CATALOG[this.draggedPartId];
    if (meta && meta.isRoot) {
      const intersectPoint = new THREE.Vector3();
      if (this.raycaster.ray.intersectPlane(this.tablePlane, intersectPoint)) {
        // Constrain to workspace bounds
        intersectPoint.x = THREE.MathUtils.clamp(intersectPoint.x, -1.8, 1.8);
        intersectPoint.z = THREE.MathUtils.clamp(intersectPoint.z, -1.8, 1.8);
        intersectPoint.y = 1.01;

        this.ghostMesh.position.copy(intersectPoint);
        this.ghostMesh.rotation.set(0, 0, 0);
        return;
      }
    }

    // 3. Fallback position along ray if dragging non-root without snap
    const rayPoint = new THREE.Vector3();
    this.raycaster.ray.at(2.5, rayPoint);
    this.ghostMesh.position.copy(rayPoint);
    this.ghostMesh.rotation.set(0, 0, 0);
  }

  /**
   * Commits placement of the dragged part.
   */
  commitDrop(partId, clientX, clientY) {
    if (!this.isDragging && !partId) return;

    this.updateDragPosition(clientX, clientY);

    const meta = ROBOT_PARTS_CATALOG[partId];
    if (!meta) {
      this.cancelDrag();
      return;
    }

    let newMesh = null;

    if (this.activeSnapTarget) {
      if (this.activeSnapTarget.isIncompatible) {
        const allowed = this.activeSnapTarget.socket.types.join(', ');
        this.showToast(`Incompatible connection: Socket only accepts [${allowed}], but tried to attach ${meta.category}`, 'error');
        this.cancelDrag();
        return;
      }

      // Snapped to existing part socket
      const { parentPart, socket } = this.activeSnapTarget;
      newMesh = createPartMesh(partId, { theme: this.currentTheme });

      // Transform part to socket position & orientation
      newMesh.position.copy(this.activeSnapTarget.worldPos);
      newMesh.quaternion.copy(this.activeSnapTarget.worldQuat);

      // Link in hierarchy
      socket.occupiedBy = newMesh;
      newMesh.userData.parentPart = parentPart;
      newMesh.userData.parentSocket = socket;

      if (!parentPart.userData.childrenParts) {
        parentPart.userData.childrenParts = [];
      }
      parentPart.userData.childrenParts.push(newMesh);

      // If parent has a revolute/prismatic node (e.g. turntable, pitch hinge, wrist roll),
      // attach to the rotating node so it moves with the joint!
      const attachNode = parentPart.userData.actuation?.revoluteNode ||
                         parentPart.userData.actuation?.prismaticNode ||
                         parentPart;

      // Attach with proper world transform preservation
      this.scene.add(newMesh);
      attachNode.attach(newMesh);

      this.placedParts.push(newMesh);
    } else if (meta.isRoot) {
      // Placed on workspace table
      newMesh = createPartMesh(partId, { theme: this.currentTheme });
      newMesh.position.copy(this.ghostMesh.position);
      this.scene.add(newMesh);

      this.placedParts.push(newMesh);
      this.robotRoots.push(newMesh);
    } else {
      // Attempted to drop non-root part into thin air without snapping to a base/arm
      this.showToast('Attach this module to an available snap socket!', 'warning');
      this.cancelDrag();
      return;
    }

    this.cancelDrag();

    // Automatically select newly placed part
    if (newMesh) {
      this.selectPart(newMesh);
      if (this.onAssemblyChanged) this.onAssemblyChanged(this.getRobotSummary());
      if (this.onPartAdded) this.onPartAdded(newMesh);
      this.showToast(`Added ${meta.name}`, 'success');
    }
  }

  /**
   * Spawns a part directly onto the first available socket or table.
   * Useful when clicking "Add" on a catalog card.
   */
  spawnPartDirectly(partId) {
    const meta = ROBOT_PARTS_CATALOG[partId];
    if (!meta) return;

    if (meta.isRoot) {
      // Find open table spot
      const offsetCount = this.robotRoots.length;
      const newMesh = createPartMesh(partId, { theme: this.currentTheme });
      newMesh.position.set(offsetCount * 0.8, 1.01, 0);
      this.scene.add(newMesh);

      this.placedParts.push(newMesh);
      this.robotRoots.push(newMesh);
      this.selectPart(newMesh);
      if (this.onAssemblyChanged) this.onAssemblyChanged(this.getRobotSummary());
      if (this.onPartAdded) this.onPartAdded(newMesh);
      this.showToast(`Spawned ${meta.name}`, 'success');
      return;
    }

    // Try finding compatible open socket on selected part first, or any placed part
    const openSocket = this.findFirstOpenSocketFor(partId);
    if (openSocket) {
      const { parentPart, socket, worldPos, worldQuat } = openSocket;
      const newMesh = createPartMesh(partId, { theme: this.currentTheme });
      newMesh.position.copy(worldPos);
      newMesh.quaternion.copy(worldQuat);

      socket.occupiedBy = newMesh;
      newMesh.userData.parentPart = parentPart;
      newMesh.userData.parentSocket = socket;

      if (!parentPart.userData.childrenParts) parentPart.userData.childrenParts = [];
      parentPart.userData.childrenParts.push(newMesh);

      const attachNode = parentPart.userData.actuation?.revoluteNode ||
                         parentPart.userData.actuation?.prismaticNode ||
                         parentPart;

      this.scene.add(newMesh);
      attachNode.attach(newMesh);

      this.placedParts.push(newMesh);
      this.selectPart(newMesh);
      if (this.onAssemblyChanged) this.onAssemblyChanged(this.getRobotSummary());
      if (this.onPartAdded) this.onPartAdded(newMesh);
      this.showToast(`Snapped ${meta.name} to ${socket.name}`, 'success');
    } else {
      this.showToast(`Please place a Base first or drag onto a socket!`, 'warning');
    }
  }

  findFirstOpenSocketFor(partId) {
    const meta = ROBOT_PARTS_CATALOG[partId];
    if (!meta) return null;

    // Check selected part first if one exists
    const searchOrder = this.selectedPart ? [this.selectedPart, ...this.placedParts] : this.placedParts;

    for (const part of searchOrder) {
      const sockets = part.userData.snapSockets || [];
      for (const socket of sockets) {
        if (!socket.occupiedBy && socket.types.includes(meta.category)) {
          const worldPos = new THREE.Vector3();
          const worldQuat = new THREE.Quaternion();
          part.localToWorld(worldPos.copy(socket.offset));
          part.getWorldQuaternion(worldQuat);
          return { parentPart: part, socket, worldPos, worldQuat };
        }
      }
    }
    return null;
  }

  findNearestSnapSocket() {
    if (!this.draggedPartId) return null;
    const meta = ROBOT_PARTS_CATALOG[this.draggedPartId];
    if (!meta) return null;

    let nearest = null;
    let minDistance = this.SNAP_DISTANCE;
    
    let nearestIncompatible = null;
    let minIncompatibleDist = this.SNAP_DISTANCE;

    for (const part of this.placedParts) {
      // Don't snap to itself if re-attaching
      if (part === this.ghostMesh) continue;

      const sockets = part.userData.snapSockets || [];
      for (let i = 0; i < sockets.length; i++) {
        const socket = sockets[i];
        if (socket.occupiedBy) continue; // Already has child

        // Calculate socket world position
        const worldPos = new THREE.Vector3();
        const worldQuat = new THREE.Quaternion();
        part.localToWorld(worldPos.copy(socket.offset));
        part.getWorldQuaternion(worldQuat);

        // Distance from ghost mesh to socket
        const dist = this.raycaster.ray.distanceToPoint(worldPos);

        const isCompatible = socket.types.includes(meta.category);

        if (isCompatible) {
          if (dist < minDistance) {
            minDistance = dist;
            const markerGroup = part.userData.socketMarkers;
            const marker = markerGroup ? markerGroup.children[i] : null;

            nearest = {
              parentPart: part,
              socket,
              marker,
              worldPos,
              worldQuat
            };
          }
        } else {
          if (dist < minIncompatibleDist) {
            minIncompatibleDist = dist;
            nearestIncompatible = {
              isIncompatible: true,
              parentPart: part,
              socket,
              worldPos,
              worldQuat
            };
          }
        }
      }
    }

    return nearest || nearestIncompatible;
  }

  showCompatibleSockets(partId) {
    const meta = ROBOT_PARTS_CATALOG[partId];
    if (!meta) return;

    this.placedParts.forEach(part => {
      if (part.userData.socketMarkers) {
        const sockets = part.userData.snapSockets || [];
        let hasCompatible = false;

        sockets.forEach((s, idx) => {
          const isCompatible = !s.occupiedBy && s.types.includes(meta.category);
          const marker = part.userData.socketMarkers.children[idx];
          if (marker) {
            marker.visible = isCompatible;
            if (isCompatible) hasCompatible = true;
          }
        });

        part.userData.socketMarkers.visible = hasCompatible;
      }
    });
  }

  hideAllSocketMarkers() {
    this.placedParts.forEach(part => {
      if (part.userData.socketMarkers) {
        part.userData.socketMarkers.visible = false;
        part.userData.socketMarkers.children.forEach(m => {
          this.highlightSocket(m, false);
        });
      }
    });
  }

  highlightSocket(marker, isHighlighted) {
    if (!marker) return;
    const ringMesh = marker.children[0];
    if (ringMesh && ringMesh.material) {
      ringMesh.material.color.setHex(isHighlighted ? 0x22c55e : 0x38bdf8);
      ringMesh.scale.setScalar(isHighlighted ? 1.3 : 1.0);
    }
  }

  // ---------------------------------------------------------------------------
  // SELECTION & MANIPULATION
  // ---------------------------------------------------------------------------
  handlePointerDown(e) {
    const rect = this.renderer.domElement.getBoundingClientRect();
    this.mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    this.mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

    this.raycaster.setFromCamera(this.mouse, this.camera);

    // Intersect with placed parts
    const intersects = this.raycaster.intersectObjects(this.placedParts, true);

    if (intersects.length > 0) {
      // Find top-level part group
      let obj = intersects[0].object;
      while (obj && !this.placedParts.includes(obj) && obj.parent) {
        obj = obj.parent;
      }

      if (obj && this.placedParts.includes(obj)) {
        this.selectPart(obj);
        return;
      }
    }

    // Clicked empty space: deselect
    this.deselectPart();
  }

  selectPart(partGroup) {
    this.selectedPart = partGroup;
    this.selectionBox.setFromObject(partGroup);
    this.selectionBox.visible = true;

    if (this.onPartSelected) {
      this.onPartSelected({
        part: partGroup,
        meta: ROBOT_PARTS_CATALOG[partGroup.userData.partId],
        summary: this.getRobotSummary()
      });
    }
  }

  deselectPart() {
    this.selectedPart = null;
    this.selectionBox.visible = false;
    if (this.onPartSelected) {
      this.onPartSelected(null);
    }
  }

  updateSelectionBox() {
    if (this.selectedPart && this.selectionBox.visible) {
      this.selectionBox.setFromObject(this.selectedPart);
    }
  }

  rotateSelected(axis = 'y', angleRad = Math.PI / 2) {
    if (!this.selectedPart) return;
    if (axis === 'x') this.selectedPart.rotateX(angleRad);
    if (axis === 'y') this.selectedPart.rotateY(angleRad);
    if (axis === 'z') this.selectedPart.rotateZ(angleRad);
    this.updateSelectionBox();
    if (this.onAssemblyChanged) this.onAssemblyChanged(this.getRobotSummary());
  }

  deleteSelected() {
    if (!this.selectedPart) return;
    const toDelete = this.selectedPart;
    this.deselectPart();
    this.removePartRecursive(toDelete);
    if (this.onAssemblyChanged) this.onAssemblyChanged(this.getRobotSummary());
    this.showToast('Part removed from assembly', 'info');
  }

  removePartRecursive(part) {
    // Recursively remove children first
    const children = (part.userData.childrenParts || []).slice();
    children.forEach(c => this.removePartRecursive(c));

    // Release parent socket if attached
    if (part.userData.parentSocket) {
      part.userData.parentSocket.occupiedBy = null;
    }

    // Remove from scene and registries
    if (part.parent) {
      part.parent.remove(part);
    }
    this.placedParts = this.placedParts.filter(p => p !== part);
    this.robotRoots = this.robotRoots.filter(p => p !== part);
  }

  clearAssembly() {
    this.deselectPart();
    const roots = [...this.robotRoots];
    roots.forEach(r => this.removePartRecursive(r));
    this.placedParts = [];
    this.robotRoots = [];
    if (this.onAssemblyChanged) this.onAssemblyChanged(this.getRobotSummary());
    this.showToast('Workspace cleared', 'info');
  }

  applyTheme(themeId) {
    this.currentTheme = themeId;
    // Re-apply materials to all existing parts
    this.placedParts.forEach(part => {
      const partId = part.userData.partId;
      const parent = part.parent;
      const pos = part.position.clone();
      const quat = part.quaternion.clone();
      const children = part.userData.childrenParts;
      const parentPart = part.userData.parentPart;
      const parentSocket = part.userData.parentSocket;

      // Recreate mesh with new theme
      const newPart = createPartMesh(partId, { theme: themeId });
      newPart.position.copy(pos);
      newPart.quaternion.copy(quat);
      newPart.userData.childrenParts = children;
      newPart.userData.parentPart = parentPart;
      newPart.userData.parentSocket = parentSocket;

      if (parent) {
        parent.remove(part);
        parent.add(newPart);
      }

      const idx = this.placedParts.indexOf(part);
      if (idx !== -1) this.placedParts[idx] = newPart;
      const rIdx = this.robotRoots.indexOf(part);
      if (rIdx !== -1) this.robotRoots[rIdx] = newPart;
    });

    if (this.selectedPart) {
      this.deselectPart();
    }
  }

  getRobotSummary() {
    let totalMass = 0;
    let totalPower = 0;
    let totalDof = 0;
    const partsCount = this.placedParts.length;

    this.placedParts.forEach(p => {
      totalMass += p.userData.mass || 0;
      totalPower += p.userData.power || 0;
      totalDof += p.userData.dof || 0;
    });

    return {
      partsCount,
      totalMass: Math.round(totalMass * 10) / 10,
      totalPower,
      totalDof,
      rootCount: this.robotRoots.length,
      hasMobileBase: this.placedParts.some(p => p.userData.isMobile)
    };
  }

  showToast(message, type = 'info') {
    const toastContainer = document.getElementById('toast-container');
    if (!toastContainer) return;

    const toast = document.createElement('div');
    toast.className = `hud-toast toast-${type}`;
    toast.textContent = message;
    toastContainer.appendChild(toast);

    setTimeout(() => {
      toast.classList.add('fade-out');
      setTimeout(() => toast.remove(), 400);
    }, 2400);
  }
}
