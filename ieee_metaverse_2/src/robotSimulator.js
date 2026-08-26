import * as THREE from 'three';

/**
 * Robotics Simulator & Kinematics Engine.
 *
 * Provides:
 * - Forward Kinematics (FK) joint articulation
 * - Mobile rover driving with WASD & virtual joystick
 * - Actuated tool operations (gripper pinch, laser weld sparks, lidar rotation)
 * - Automated robotic work cycles (pick-and-place, welding, patrol)
 */
export class RobotSimulator {
  /**
   * @param {object} params
   * @param {THREE.Scene} params.scene
   * @param {DragDropSystem} params.dragDropSystem
   */
  constructor({ scene, dragDropSystem }) {
    this.scene = scene;
    this.dragDropSystem = dragDropSystem;

    // Simulation state
    this.isSimulating = false;
    this.activeRoutine = null;
    this.routineTime = 0;

    // Discovered controllable joints & tools
    this.joints = [];
    this.activeTools = [];
    this.mobileBases = [];

    // Driving input state
    this.driveInput = { forward: 0, turn: 0, strafe: 0 };
    this.driveSpeed = 1.4;
    this.turnSpeed = 1.6;

    // Spark particle pool for welding tool
    this.sparksGroup = new THREE.Group();
    this.sparksGroup.name = 'WeldSparksGroup';
    this.scene.add(this.sparksGroup);
    this.initSparks();

    // Payload test object for pick-and-place routine
    this.initTestPayload();

    // Keyboard driving listener
    this.initKeyboardControls();
  }

  initSparks() {
    this.sparkCount = 35;
    this.sparks = [];
    const sparkGeo = new THREE.SphereGeometry(0.012, 6, 6);
    const sparkMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });

    for (let i = 0; i < this.sparkCount; i++) {
      const spark = new THREE.Mesh(sparkGeo, sparkMat);
      spark.visible = false;
      spark.userData = {
        velocity: new THREE.Vector3(),
        life: 0,
        maxLife: 0.4
      };
      this.sparksGroup.add(spark);
      this.sparks.push(spark);
    }
  }

  initTestPayload() {
    // A small glowing payload cube on the assembly table
    const cubeGeo = new THREE.BoxGeometry(0.12, 0.12, 0.12);
    const cubeMat = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      emissive: 0x0284c7,
      emissiveIntensity: 0.5,
      metalness: 0.7,
      roughness: 0.2
    });
    this.testPayload = new THREE.Mesh(cubeGeo, cubeMat);
    this.testPayload.position.set(0.45, 1.07, 0.25);
    this.testPayload.castShadow = true;
    this.testPayload.name = 'TestPayload_Cube';
    this.scene.add(this.testPayload);
  }

  initKeyboardControls() {
    window.addEventListener('keydown', (e) => {
      if (!this.isSimulating) return;

      switch (e.key.toLowerCase()) {
        case 'w':
        case 'arrowup':
          this.driveInput.forward = 1;
          break;
        case 's':
        case 'arrowdown':
          this.driveInput.forward = -1;
          break;
        case 'a':
        case 'arrowleft':
          this.driveInput.turn = 1;
          break;
        case 'd':
        case 'arrowright':
          this.driveInput.turn = -1;
          break;
        case 'q':
          this.driveInput.strafe = -1;
          break;
        case 'e':
          this.driveInput.strafe = 1;
          break;
      }
    });

    window.addEventListener('keyup', (e) => {
      switch (e.key.toLowerCase()) {
        case 'w':
        case 's':
        case 'arrowup':
        case 'arrowdown':
          this.driveInput.forward = 0;
          break;
        case 'a':
        case 'd':
        case 'arrowleft':
        case 'arrowright':
          this.driveInput.turn = 0;
          break;
        case 'q':
        case 'e':
          this.driveInput.strafe = 0;
          break;
      }
    });
  }

  /**
   * Enters Simulation Mode: scans all parts, builds joint controllers, and starts mechanics.
   */
  startSimulation() {
    this.isSimulating = true;
    this.scanRobotHardware();
    this.buildSimControlsUI();
    this.dragDropSystem.deselectPart();
  }

  /**
   * Stops Simulation Mode and returns to Build Mode.
   */
  stopSimulation() {
    this.isSimulating = false;
    this.activeRoutine = null;
    this.stopAllTools();
    const simPanel = document.getElementById('sim-controls-panel');
    if (simPanel) simPanel.innerHTML = '';
  }

  /**
   * Scans current assembly and catalogues controllable joints, tools, and mobile chassis.
   */
  scanRobotHardware() {
    this.joints = [];
    this.activeTools = [];
    this.mobileBases = [];

    this.dragDropSystem.placedParts.forEach(part => {
      const uData = part.userData;

      // 1. Controllable joints
      if (uData.jointInfo && uData.actuation?.revoluteNode) {
        this.joints.push({
          part,
          name: uData.name,
          axis: uData.jointInfo.axis,
          node: uData.actuation.revoluteNode,
          min: uData.jointInfo.min,
          max: uData.jointInfo.max,
          currentAngle: uData.jointInfo.current || 0,
          targetAngle: uData.jointInfo.current || 0
        });
      }

      // 2. Prismatic linear actuators
      if (uData.jointInfo?.type === 'prismatic' && uData.actuation?.prismaticNode) {
        this.joints.push({
          part,
          name: uData.name,
          axis: 'y',
          isPrismatic: true,
          node: uData.actuation.prismaticNode,
          min: uData.jointInfo.min,
          max: uData.jointInfo.max,
          currentExtension: 0,
          targetExtension: 0
        });
      }

      // 3. Actuated tools
      if (uData.actuation?.leftFinger && uData.actuation?.rightFinger) {
        this.activeTools.push({
          part,
          type: 'gripper',
          name: uData.name,
          state: 0, // 0 = open, 1 = closed
          actuation: uData.actuation
        });
      }

      if (uData.actuation?.laserBeam) {
        this.activeTools.push({
          part,
          type: 'laser',
          name: uData.name,
          isWelding: false,
          actuation: uData.actuation
        });
      }

      if (uData.actuation?.lidarPuck) {
        this.activeTools.push({
          part,
          type: 'lidar',
          name: uData.name,
          isScanning: true,
          actuation: uData.actuation
        });
      }

      // 4. Mobile Base
      if (uData.isMobile) {
        this.mobileBases.push({
          part,
          name: uData.name,
          actuation: uData.actuation
        });
      }
    });
  }

  /**
   * Generates dynamic HUD sliders and buttons for all active hardware.
   */
  buildSimControlsUI() {
    const container = document.getElementById('sim-controls-panel');
    if (!container) return;

    let html = `
      <div class="sim-section-header">
        <span class="sim-badge">ACTIVE ROBOTICS HARDWARE</span>
        <span class="sim-status-dot"></span>
      </div>
    `;

    // 1. Joint Sliders
    if (this.joints.length > 0) {
      html += `<div class="sim-group-title">Actuator Joint Sliders (Forward Kinematics)</div>`;
      this.joints.forEach((joint, idx) => {
        const minDeg = Math.round(THREE.MathUtils.radToDeg(joint.min));
        const maxDeg = Math.round(THREE.MathUtils.radToDeg(joint.max));
        const currentDeg = Math.round(THREE.MathUtils.radToDeg(joint.currentAngle || 0));

        html += `
          <div class="joint-control-card">
            <div class="joint-label-row">
              <span class="joint-name">${joint.name}</span>
              <span class="joint-val" id="val-joint-${idx}">${currentDeg}°</span>
            </div>
            <input type="range" class="hud-slider" id="slider-joint-${idx}"
              min="${joint.min}" max="${joint.max}" step="0.01" value="${joint.currentAngle || 0}">
          </div>
        `;
      });
    } else {
      html += `<div class="sim-empty-tip">No articulated joints detected in this assembly.</div>`;
    }

    // 2. Tool Controllers
    if (this.activeTools.length > 0) {
      html += `<div class="sim-group-title">End Effectors & Sensors</div><div class="tool-btn-grid">`;
      this.activeTools.forEach((tool, idx) => {
        if (tool.type === 'gripper') {
          html += `
            <button class="hud-action-btn" id="btn-tool-${idx}">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M18 11V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v0"></path>
                <path d="M14 10V4a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v2"></path>
                <path d="M10 10.5V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v8"></path>
                <path d="M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15"></path>
              </svg>
              Toggle Gripper Clamp
            </button>
          `;
        } else if (tool.type === 'laser') {
          html += `
            <button class="hud-action-btn" id="btn-tool-${idx}">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
              </svg>
              Activate Welding Arc
            </button>
          `;
        } else if (tool.type === 'lidar') {
          html += `
            <button class="hud-action-btn active" id="btn-tool-${idx}">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="2" x2="12" y2="12"></line>
              </svg>
              LiDAR 360° Scan
            </button>
          `;
        }
      });
      html += `</div>`;
    }

    // 3. Mobile Drive Help
    if (this.mobileBases.length > 0) {
      html += `
        <div class="sim-group-title">Mobile Rover Driving</div>
        <div class="drive-instruction-box">
          <div class="key-pill-row">
            <span class="key-pill">W</span><span class="key-pill">A</span><span class="key-pill">S</span><span class="key-pill">D</span>
            <span>/ Arrow Keys to Drive</span>
          </div>
          <div class="drive-dpad">
            <button class="dpad-btn up" id="dpad-up">▲</button>
            <div class="dpad-mid">
              <button class="dpad-btn left" id="dpad-left">◀</button>
              <button class="dpad-btn down" id="dpad-down">▼</button>
              <button class="dpad-btn right" id="dpad-right">▶</button>
            </div>
          </div>
        </div>
      `;
    }

    // 4. Automated Work Cycles
    html += `
      <div class="sim-group-title">Automated Work Cycles</div>
      <div class="routine-btn-grid">
        <button class="routine-btn" id="btn-routine-pick">
          <span class="routine-icon">📦</span>
          <span>Pick &amp; Place Demo</span>
        </button>
        <button class="routine-btn" id="btn-routine-weld">
          <span class="routine-icon">⚡</span>
          <span>Precision Weld Seam</span>
        </button>
        <button class="routine-btn" id="btn-routine-home">
          <span class="routine-icon">🔄</span>
          <span>Reset Home Pose</span>
        </button>
      </div>
    `;

    container.innerHTML = html;

    // Attach event listeners to sliders
    this.joints.forEach((joint, idx) => {
      const slider = document.getElementById(`slider-joint-${idx}`);
      const valLabel = document.getElementById(`val-joint-${idx}`);

      if (slider) {
        slider.addEventListener('input', (e) => {
          const val = parseFloat(e.target.value);
          joint.targetAngle = val;
          if (valLabel) {
            valLabel.textContent = `${Math.round(THREE.MathUtils.radToDeg(val))}°`;
          }
        });
      }
    });

    // Attach tool toggles
    this.activeTools.forEach((tool, idx) => {
      const btn = document.getElementById(`btn-tool-${idx}`);
      if (!btn) return;

      btn.addEventListener('click', () => {
        if (tool.type === 'gripper') {
          tool.state = tool.state === 0 ? 1 : 0;
          btn.classList.toggle('active', tool.state === 1);
          btn.style.borderColor = tool.state === 1 ? '#22c55e' : '';
        } else if (tool.type === 'laser') {
          tool.isWelding = !tool.isWelding;
          btn.classList.toggle('active', tool.isWelding);
          btn.style.borderColor = tool.isWelding ? '#ef4444' : '';
        } else if (tool.type === 'lidar') {
          tool.isScanning = !tool.isScanning;
          btn.classList.toggle('active', tool.isScanning);
        }
      });
    });

    // Attach D-Pad buttons for touch/mouse driving
    const bindDpad = (id, forward, turn) => {
      const btn = document.getElementById(id);
      if (!btn) return;
      const start = (e) => {
        e.preventDefault();
        this.driveInput.forward = forward;
        this.driveInput.turn = turn;
      };
      const stop = (e) => {
        e.preventDefault();
        this.driveInput.forward = 0;
        this.driveInput.turn = 0;
      };
      btn.addEventListener('pointerdown', start);
      btn.addEventListener('pointerup', stop);
      btn.addEventListener('pointerleave', stop);
    };

    bindDpad('dpad-up', 1, 0);
    bindDpad('dpad-down', -1, 0);
    bindDpad('dpad-left', 0, 1);
    bindDpad('dpad-right', 0, -1);

    // Attach routine buttons
    const pickBtn = document.getElementById('btn-routine-pick');
    if (pickBtn) pickBtn.addEventListener('click', () => this.runRoutine('pick_and_place'));

    const weldBtn = document.getElementById('btn-routine-weld');
    if (weldBtn) weldBtn.addEventListener('click', () => this.runRoutine('weld_seam'));

    const homeBtn = document.getElementById('btn-routine-home');
    if (homeBtn) homeBtn.addEventListener('click', () => this.runRoutine('home_pose'));
  }

  runRoutine(routineName) {
    this.activeRoutine = routineName;
    this.routineTime = 0;
    this.dragDropSystem.showToast(`Starting: ${routineName.replace('_', ' ').toUpperCase()}`, 'info');
  }

  stopAllTools() {
    this.activeTools.forEach(tool => {
      if (tool.actuation?.laserBeam) tool.actuation.laserBeam.visible = false;
      if (tool.actuation?.sparkLight) tool.actuation.sparkLight.intensity = 0;
      tool.isWelding = false;
    });
  }

  /**
   * Main per-frame physics & kinematics update loop.
   * @param {number} delta - Delta time in seconds
   */
  update(delta = 0.016) {
    // 1. Advance automated routines
    if (this.activeRoutine) {
      this.updateRoutine(delta);
    }

    // 2. Smoothly articulate joints toward target angles
    this.joints.forEach((joint, idx) => {
      if (joint.isPrismatic) {
        joint.currentExtension = THREE.MathUtils.lerp(joint.currentExtension, joint.targetExtension, delta * 6);
        joint.node.position.y = 0.32 + joint.currentExtension;
      } else {
        joint.currentAngle = THREE.MathUtils.lerp(joint.currentAngle, joint.targetAngle, delta * 6);
        if (joint.axis === 'y') joint.node.rotation.y = joint.currentAngle;
        if (joint.axis === 'x') joint.node.rotation.x = joint.currentAngle;
        if (joint.axis === 'z') joint.node.rotation.z = joint.currentAngle;
      }
    });

    // 3. Actuate tools (gripper fingers, laser, lidar)
    this.activeTools.forEach(tool => {
      if (tool.type === 'gripper') {
        const left = tool.actuation.leftFinger;
        const right = tool.actuation.rightFinger;
        if (left && right) {
          const targetOffset = tool.state === 1 ? -0.02 : -0.06;
          left.position.x = THREE.MathUtils.lerp(left.position.x, targetOffset, delta * 8);
          right.position.x = THREE.MathUtils.lerp(right.position.x, -targetOffset, delta * 8);
        }
      } else if (tool.type === 'laser') {
        const beam = tool.actuation.laserBeam;
        const light = tool.actuation.sparkLight;
        if (beam && light) {
          beam.visible = tool.isWelding;
          if (tool.isWelding) {
            light.intensity = 1.5 + Math.random() * 2.0;
            // Emit sparks from nozzle tip
            const worldTip = new THREE.Vector3(0, 0.72, 0);
            tool.part.localToWorld(worldTip);
            this.emitSparksAt(worldTip);
          } else {
            light.intensity = 0;
          }
        }
      } else if (tool.type === 'lidar' && tool.isScanning) {
        if (tool.actuation.lidarPuck) {
          tool.actuation.lidarPuck.rotation.y += delta * 7.5;
        }
      }
    });

    // 4. Update sparks physics
    this.updateSparks(delta);

    // 5. Mobile base driving physics
    if (this.isSimulating && this.mobileBases.length > 0) {
      this.updateDriving(delta);
    }
  }

  updateDriving(delta) {
    const { forward, turn } = this.driveInput;
    if (forward === 0 && turn === 0) return;

    this.mobileBases.forEach(base => {
      const mesh = base.part;

      // Turn rover around Y axis
      mesh.rotation.y += turn * this.turnSpeed * delta;

      // Drive forward/backward in heading direction
      const forwardDir = new THREE.Vector3(0, 0, 1).applyAxisAngle(new THREE.Vector3(0, 1, 0), mesh.rotation.y);
      mesh.position.addScaledVector(forwardDir, forward * this.driveSpeed * delta);

      // Keep within workspace floor boundaries
      mesh.position.x = THREE.MathUtils.clamp(mesh.position.x, -3.5, 3.5);
      mesh.position.z = THREE.MathUtils.clamp(mesh.position.z, -3.5, 3.5);

      // Rotate mecanum wheels
      if (base.actuation?.wheels) {
        base.actuation.wheels.forEach(w => {
          w.rotation.x += forward * delta * 12;
        });
      }

      // Rotate drone rotors
      if (base.actuation?.rotors) {
        base.actuation.rotors.forEach(r => {
          r.rotation.y += delta * 35;
        });
      }
    });
  }

  emitSparksAt(position) {
    for (let i = 0; i < 3; i++) {
      const spark = this.sparks.find(s => !s.visible);
      if (!spark) break;

      spark.visible = true;
      spark.position.copy(position);
      spark.userData.life = 0;
      spark.userData.velocity.set(
        (Math.random() - 0.5) * 1.5,
        Math.random() * 1.2 + 0.3,
        (Math.random() - 0.5) * 1.5
      );
    }
  }

  updateSparks(delta) {
    this.sparks.forEach(spark => {
      if (!spark.visible) return;
      spark.userData.life += delta;
      if (spark.userData.life > spark.userData.maxLife) {
        spark.visible = false;
        return;
      }
      spark.position.addScaledVector(spark.userData.velocity, delta);
      spark.userData.velocity.y -= delta * 5.0; // gravity
    });
  }

  updateRoutine(delta) {
    this.routineTime += delta;
    const t = this.routineTime;

    if (this.activeRoutine === 'home_pose') {
      this.joints.forEach(j => { j.targetAngle = 0; });
      const gripper = this.activeTools.find(tool => tool.type === 'gripper');
      if (gripper) gripper.state = 0;
      const laser = this.activeTools.find(tool => tool.type === 'laser');
      if (laser) laser.isWelding = false;

      if (t > 1.2) {
        this.activeRoutine = null;
        this.dragDropSystem.showToast('Home Pose Restored (All 6 Axes Zeroed)', 'success');
      }
    } else if (this.activeRoutine === 'pick_and_place') {
      // 6-Axis Coordinated Pick and Place sequence
      const j0 = this.joints[0]; // J1 Base Yaw
      const j1 = this.joints[1]; // J2 Shoulder Pitch
      const j2 = this.joints[2]; // J3 Elbow Pitch
      const j3 = this.joints[3]; // J4 Wrist Roll
      const j4 = this.joints[4]; // J5 Wrist Pitch
      const j5 = this.joints[5]; // J6 Tool Roll
      const gripper = this.activeTools.find(tool => tool.type === 'gripper');

      if (t < 1.0) {
        // Phase 1: Reach down over payload with vertical wrist alignment
        if (j0) j0.targetAngle = 0.45;
        if (j1) j1.targetAngle = 0.38;
        if (j2) j2.targetAngle = -0.52;
        if (j3) j3.targetAngle = 0;
        if (j4) j4.targetAngle = 0.14; // Level tool to surface
        if (j5) j5.targetAngle = 0;
        if (gripper) gripper.state = 0;
      } else if (t < 2.0) {
        // Phase 2: Close pneumatic clamp
        if (gripper) gripper.state = 1;
      } else if (t < 3.2) {
        // Phase 3: Lift up payload
        if (j1) j1.targetAngle = -0.28;
        if (j2) j2.targetAngle = -0.22;
        if (j4) j4.targetAngle = 0.50; // Compensate pitch while lifting
      } else if (t < 4.5) {
        // Phase 4: Swing to drop destination and reorient tool roll
        if (j0) j0.targetAngle = -0.75;
        if (j5) j5.targetAngle = Math.PI / 2; // Spin J6 by 90 degrees
      } else if (t < 5.6) {
        // Phase 5: Lower and release
        if (j1) j1.targetAngle = 0.32;
        if (j2) j2.targetAngle = -0.45;
        if (j4) j4.targetAngle = 0.13;
        if (gripper) gripper.state = 0;
      } else if (t < 7.0) {
        // Phase 6: Return all 6 joints to Home
        this.joints.forEach(j => { j.targetAngle = 0; });
      } else {
        this.activeRoutine = null;
        this.dragDropSystem.showToast('6-Axis Pick & Place Routine Complete!', 'success');
      }
    } else if (this.activeRoutine === 'weld_seam') {
      // 6-Axis Coordinated Welding trajectory: sinusoidal seam with continuous torch attitude
      const j0 = this.joints[0];
      const j1 = this.joints[1];
      const j2 = this.joints[2];
      const j3 = this.joints[3];
      const j4 = this.joints[4];
      const j5 = this.joints[5];
      const laser = this.activeTools.find(tool => tool.type === 'laser');

      if (laser) laser.isWelding = true;

      if (j0) j0.targetAngle = Math.sin(t * 2.5) * 0.35;
      if (j1) j1.targetAngle = 0.25 + Math.cos(t * 2.5) * 0.12;
      if (j2) j2.targetAngle = -0.35 + Math.sin(t * 2.5) * 0.15;
      if (j3) j3.targetAngle = Math.sin(t * 2.5) * 0.10;
      if (j4) j4.targetAngle = 0.10 + Math.cos(t * 2.5) * 0.08;
      if (j5) j5.targetAngle = t * 1.5; // continuous spin on J6

      if (t > 5.0) {
        if (laser) laser.isWelding = false;
        this.activeRoutine = null;
        this.dragDropSystem.showToast('Precision 6-Axis Weld Seam Finished!', 'success');
      }
    }
  }
}
