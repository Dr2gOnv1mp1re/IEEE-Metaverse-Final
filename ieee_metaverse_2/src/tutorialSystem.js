import * as THREE from 'three';
import { createPartMesh, ROBOT_PARTS_CATALOG } from './robotParts.js';

/**
 * Interactive Robotics Tutorial System with 3 Educational Guided Modules.
 *
 * Module 1 now implements the full 12-component industrial sequence:
 * Base -> J1 -> Link 1 -> J2 -> Link 2 -> J3 -> Link 3 -> J4 -> J5 -> J6 -> Tool Flange -> End Effector
 */
export const TUTORIAL_MODULES = [
  {
    id: 'module_arm',
    title: 'Module 1: 12-Part Discrete 6-Axis Industrial Manipulator',
    subtitle: 'Assemble a real factory robot from separate joints, structural links, and ISO flange',
    icon: '🦾',
    steps: [
      {
        stepIndex: 1,
        partId: 'robot_base',
        title: 'Step 1: Mount the Rigid Robot Mounting Pedestal',
        parentSocketId: null,
        targetDesc: 'Place the cast-steel pedestal base with 6 anchor bolts on the workspace center.',
        theoryTitle: 'Robotics Theory: Rigid Inertial Ground Frame',
        theoryText: 'In industrial robotics, a rigid high-mass foundation base minimizes vibrational resonance and provides a stable inertial ground reference frame for high-acceleration maneuvers.',
        specs: 'Mass: 28 kg | Cast Steel | 6 x M20 Anchor Bolt Lugs'
      },
      {
        stepIndex: 2,
        partId: 'joint_j1',
        title: 'Step 2: Install J1 Base Rotary Axis (Harmonic Turntable)',
        parentSocketId: 'base_flange',
        targetDesc: 'Mount the J1 turntable actuator onto the top flange of the pedestal base.',
        theoryTitle: 'Robotics Theory: J1 Harmonic Drive Gearing',
        theoryText: 'Joint 1 provides 360° azimuthal rotation. Factory robots employ strain-wave (harmonic) gearboxes offering high reduction ratios (100:1) with virtually zero backlash in a compact pancake profile.',
        specs: 'Axis: Y (Yaw) | Range: ±180° | Finned AC Servo Motor'
      },
      {
        stepIndex: 3,
        partId: 'link_1',
        title: 'Step 3: Fasten Link 1 Shoulder Cast Housing',
        parentSocketId: 'j1_output',
        targetDesc: 'Bolt the cast-aluminum shoulder turntable bracket onto the J1 output flange.',
        theoryTitle: 'Robotics Theory: Structural Casting & Bearing Trunnions',
        theoryText: 'Link 1 rotates with J1 and provides dual trunnion ears with cross-roller bearing seats to support the orthogonal J2 shoulder pivot axle under massive overturning moments.',
        specs: 'Mass: 11.2 kg | Cast Aluminum A356 | Dual Trunnion Ears'
      },
      {
        stepIndex: 4,
        partId: 'joint_j2',
        title: 'Step 4: Install J2 Shoulder Servo Actuator',
        parentSocketId: 'j2_trunnion',
        targetDesc: 'Mount the J2 shoulder pitch actuator between the Link 1 trunnion ears.',
        theoryTitle: 'Robotics Theory: Shoulder Moment & Gravity Load',
        theoryText: 'The shoulder joint carries the largest dynamic load in a serial arm ($M = F \\times d$). Heavy preloaded bearings and an electromechanical holding brake prevent arm drop during power shutdown.',
        specs: 'Axis: X (Pitch) | Range: -100° to +135° | Holding Brake'
      },
      {
        stepIndex: 5,
        partId: 'link_2',
        title: 'Step 5: Connect Link 2 Upper-Arm Structural Boom (55cm)',
        parentSocketId: 'j2_output',
        targetDesc: 'Snap the slender cast/extruded aluminum boom into the J2 output flange.',
        theoryTitle: 'Robotics Theory: Minimizing Link Inertia ($I = mr^2$)',
        theoryText: 'Slender tapered boom geometry with structural stiffening ribs keeps mass low while resisting torsional bending. External harness clips route cables neatly alongside the arm.',
        specs: 'Length: 550 mm | Stiffening Ribs | External Harness Clips'
      },
      {
        stepIndex: 6,
        partId: 'joint_j3',
        title: 'Step 6: Install J3 Elbow Servo Joint',
        parentSocketId: 'j3_clevis',
        targetDesc: 'Mount the J3 elbow pitch actuator into the clevis at the top of Link 2.',
        theoryTitle: 'Robotics Theory: Elbow Kinematics & Reach Envelope',
        theoryText: 'Joint 3 (Elbow) cooperates with Joint 2 (Shoulder) to position the wrist anywhere within the vertical sagittal plane, defining the primary reachable spherical workspace envelope.',
        specs: 'Axis: X (Pitch) | Range: ±135° | Integrated Planetary Reducer'
      },
      {
        stepIndex: 7,
        partId: 'link_3',
        title: 'Step 7: Attach Link 3 Forearm Structural Link (42cm)',
        parentSocketId: 'j3_output',
        targetDesc: 'Mount the tapered cast aluminum forearm link onto the J3 elbow output flange.',
        theoryTitle: 'Robotics Theory: Forearm Stress Distribution & Cabling',
        theoryText: 'A tapered hollow cross-section distributes bending stresses uniformly along the arm. An inspection service window allows technician access to the internal harness routing.',
        specs: 'Length: 420 mm | Bolted Service Window | Corrugated Conduit'
      },
      {
        stepIndex: 8,
        partId: 'joint_j4',
        title: 'Step 8: Mount J4 Wrist Roll Rotary Axis',
        parentSocketId: 'j4_flange',
        targetDesc: 'Fasten the in-line J4 wrist roll actuator to the distal end of the forearm link.',
        theoryTitle: 'Robotics Theory: Spherical Wrist - First Euler Angle',
        theoryText: 'Joint 4 introduces in-line continuous roll along the forearm axis, representing the first rotational degree of freedom in a traditional 3-axis spherical wrist assembly.',
        specs: 'Axis: Y (Roll) | Range: ±180° | In-line Angular Contact Bearings'
      },
      {
        stepIndex: 9,
        partId: 'joint_j5',
        title: 'Step 9: Fasten J5 Wrist Pitch/Tilt Axis',
        parentSocketId: 'j4_output',
        targetDesc: 'Mount the orthogonal J5 pitch knuckle onto the J4 roll output.',
        theoryTitle: 'Robotics Theory: Orthogonal Knuckle Pitch',
        theoryText: 'Joint 5 pivots orthogonally to J4, providing pitch/tilt articulation to align the tool head with complex 3D surface contours and part normals.',
        specs: 'Axis: X (Pitch) | Range: ±120° | Miniature Harmonic Reducer'
      },
      {
        stepIndex: 10,
        partId: 'joint_j6',
        title: 'Step 10: Mount J6 Wrist Tool Roll Axis',
        parentSocketId: 'j5_output',
        targetDesc: 'Install the J6 tool roll spindle onto the J5 knuckle output.',
        theoryTitle: 'Robotics Theory: Tool Center Point (TCP) Continuous Rotation',
        theoryText: 'Joint 6 provides continuous high-speed rotary spindle motion, allowing the end-effector to rotate screws, dispense adhesive, or orient parts during pick-and-place cycles.',
        specs: 'Axis: Y (Tool Roll) | Range: Continuous (±360°) | High-Res Resolver'
      },
      {
        stepIndex: 11,
        partId: 'tool_flange',
        title: 'Step 11: Install Standard ISO 9409-1 Tool Flange',
        parentSocketId: 'j6_output',
        targetDesc: 'Bolt the precision circular ISO tool mounting flange onto the J6 spindle.',
        theoryTitle: 'Robotics Theory: ISO 9409-1 Standard Mechanical Interface',
        theoryText: 'The ISO 9409-1 standard defines circular tool flanges with standardized bolt circle diameters (PCD), pilot spigots, and locating dowel pins so any gripper or torch can be swapped instantly.',
        specs: 'Standard: ISO 9409-1-50-4-M6 | Pilot Spigot | Dowel Pin Hole'
      },
      {
        stepIndex: 12,
        partId: 'end_effector_gripper',
        title: 'Step 12: Attach Industrial Two-Finger Parallel Gripper',
        parentSocketId: 'tool_mount',
        targetDesc: 'Fasten the pneumatic parallel gripper to the ISO tool mounting flange.',
        theoryTitle: 'Robotics Theory: Parallel Slide Force-Controlled Grasping',
        theoryText: 'Pneumatic parallel grippers utilize ground linear guide rods and dual pistons to synchronize finger closing, distributing clamping pressure evenly across delicate workpieces.',
        specs: 'Stroke: 40 mm | Guide: Ground Chrome Rods | Polyurethane Pads'
      }
    ]
  },
  {
    id: 'module_rover',
    title: 'Module 2: Autonomous Mecanum Mobile Rover',
    subtitle: 'Learn holonomic omnidirectional drive, battery balance, and LiDAR mapping',
    icon: '🚜',
    steps: [
      {
        stepIndex: 1,
        partId: 'rover_chassis',
        title: 'Step 1: Position Low-Profile Mecanum Chassis',
        parentSocketId: null,
        targetDesc: 'Place the CNC aluminum rover platform on the workspace floor.',
        theoryTitle: 'Robotics Theory: Holonomic Kinematics & Low CoG',
        theoryText: 'A low center-of-gravity (CoG) chassis with 4 independent mecanum wheels allows holonomic motion (simultaneous translation in X and Z plus in-place turning) without turning the wheels.',
        specs: 'Wheelbase: 560 mm | Suspension: 4 Independent Struts'
      },
      {
        stepIndex: 2,
        partId: 'joint_j1',
        title: 'Step 2: Mount Turret Swivel Joint',
        parentSocketId: 'center_mount',
        targetDesc: 'Fasten the rotary yaw joint onto the center deck socket.',
        theoryTitle: 'Robotics Theory: Decoupled Active Perception',
        theoryText: 'An independent pan-axis turret allows sensors to track dynamic targets or inspect waypoints while the vehicle navigates along an entirely different heading trajectory.',
        specs: 'Speed: 180°/sec | Slip Ring Power Pass-through'
      },
      {
        stepIndex: 3,
        partId: 'link_1',
        title: 'Step 3: Connect Sensor Mast Bracket',
        parentSocketId: 'j1_output',
        targetDesc: 'Attach the structural bracket to the swivel joint.',
        theoryTitle: 'Robotics Theory: Elevated Sensor Vantage Point',
        theoryText: 'Elevating perception sensors above the vehicle deck prevents wheel occlusion and widens the field of view over obstacles.',
        specs: 'Rigid Bracket | Lightweight'
      },
      {
        stepIndex: 4,
        partId: 'tool_flange',
        title: 'Step 4: Install ISO Sensor Adapter Plate',
        parentSocketId: 'j2_trunnion',
        targetDesc: 'Mount the standard adapter plate.',
        theoryTitle: 'Robotics Theory: Modular Sensor Payloads',
        theoryText: 'Standardized mounting interfaces allow rapid payload reconfiguration between inspection cameras, ultrasonic sensors, and manipulators.',
        specs: 'ISO Circular Interface'
      }
    ]
  },
  {
    id: 'module_welder',
    title: 'Module 3: Mobile Arc Welding Workstation',
    subtitle: 'Combine a mobile base with an articulated laser welder toolpath system',
    icon: '⚡',
    steps: [
      {
        stepIndex: 1,
        partId: 'rover_chassis',
        title: 'Step 1: Place Heavy Mobility Chassis',
        parentSocketId: null,
        targetDesc: 'Place the mobile platform onto the assembly workspace.',
        theoryTitle: 'Robotics Theory: Mobile Manipulator Workspace Expansion',
        theoryText: 'Mounting a robotic arm onto a mobile base expands the reachable operational workspace from a fixed sphere to an essentially infinite factory floor plane.',
        specs: 'Payload Capacity: 50 kg | Floor Tracking'
      },
      {
        stepIndex: 2,
        partId: 'joint_j1',
        title: 'Step 2: Fasten Arm Turntable Swivel',
        parentSocketId: 'center_mount',
        targetDesc: 'Mount the harmonic turntable to the center chassis turret.',
        theoryTitle: 'Robotics Theory: Coordinated Base-Arm Motion',
        theoryText: 'Redundant kinematics algorithms drive the mobile chassis and arm joints simultaneously to optimize laser focal distance and torch angle along complex weld seams.',
        specs: '100:1 Harmonic Reduction | High Overturning Moment'
      },
      {
        stepIndex: 3,
        partId: 'link_1',
        title: 'Step 3: Connect Link 1 Shoulder Bracket',
        parentSocketId: 'j1_output',
        targetDesc: 'Attach the structural shoulder housing.',
        theoryTitle: 'Robotics Theory: Cantilever Acceleration Compensation',
        theoryText: 'When driving over floor seams, vehicle vibrations are actively cancelled by counter-phase arm joint servo adjustments.',
        specs: 'Cast Aluminum A356'
      },
      {
        stepIndex: 4,
        partId: 'joint_j2',
        title: 'Step 4: Install J2 Shoulder Servo Actuator',
        parentSocketId: 'j2_trunnion',
        targetDesc: 'Mount the shoulder pitch joint.',
        theoryTitle: 'Robotics Theory: Shoulder Torque Balancing',
        theoryText: 'High reduction harmonic drives handle heavy tool loads during high-speed mobile maneuvers.',
        specs: 'Axis: X (Pitch) | Preloaded Cross-Roller Bearing'
      },
      {
        stepIndex: 5,
        partId: 'link_2',
        title: 'Step 5: Connect Link 2 Upper-Arm Boom',
        parentSocketId: 'j2_output',
        targetDesc: 'Attach the structural boom to elevate welding reach.',
        theoryTitle: 'Robotics Theory: Thermal Stability in Laser Processing',
        theoryText: 'Stiff aluminium structure maintains torch tip positioning accuracy even when welding generates ambient heat gradients.',
        specs: 'Length: 550 mm | Stiffening Ribs'
      },
      {
        stepIndex: 6,
        partId: 'joint_j3',
        title: 'Step 6: Install J3 Elbow Joint',
        parentSocketId: 'j3_clevis',
        targetDesc: 'Fasten the elbow joint at the end of the boom.',
        theoryTitle: 'Robotics Theory: Singularity Avoidance',
        theoryText: 'Kinematic controllers maintain elbow joint angles away from 0° and 180° boundaries, preventing loss of degrees of freedom.',
        specs: 'Planetary-Harmonic Drive'
      },
      {
        stepIndex: 7,
        partId: 'link_3',
        title: 'Step 7: Attach Link 3 Forearm',
        parentSocketId: 'j3_output',
        targetDesc: 'Mount the forearm link.',
        theoryTitle: 'Robotics Theory: Shielding Gas Routing',
        theoryText: 'Coaxial channels carry shielding gas (argon/CO2) and cooling water lines directly to the torch head.',
        specs: 'Aluminium Alloy 7075-T6'
      },
      {
        stepIndex: 8,
        partId: 'joint_j4',
        title: 'Step 8: Connect J4 Wrist Roll Axis',
        parentSocketId: 'j4_flange',
        targetDesc: 'Mount the in-line wrist roll actuator.',
        theoryTitle: 'Robotics Theory: In-line Tool Roll',
        theoryText: 'J4 aligns the wrist orientation with the seam vector.',
        specs: 'In-line Roll'
      },
      {
        stepIndex: 9,
        partId: 'joint_j5',
        title: 'Step 9: Mount J5 Wrist Pitch Knuckle',
        parentSocketId: 'j4_output',
        targetDesc: 'Install the knuckle pitch joint.',
        theoryTitle: 'Robotics Theory: Torch Lead Angle',
        theoryText: 'Maintains optimal 15° torch push angle along curved seams.',
        specs: 'Orthogonal Pitch'
      },
      {
        stepIndex: 10,
        partId: 'joint_j6',
        title: 'Step 10: Mount J6 Tool Roll Spindle',
        parentSocketId: 'j5_output',
        targetDesc: 'Connect the high-speed spindle.',
        theoryTitle: 'Robotics Theory: Continuous Circular Welds',
        theoryText: 'Continuous 360° rotation enables orbital pipe welding without cable twisting.',
        specs: 'Continuous Roll'
      },
      {
        stepIndex: 11,
        partId: 'tool_flange',
        title: 'Step 11: Install ISO 9409-1 Tool Flange',
        parentSocketId: 'j6_output',
        targetDesc: 'Fasten the ISO adapter plate.',
        theoryTitle: 'Robotics Theory: Standardized Torch Mount',
        theoryText: 'Guarantees repeatable tool center point (TCP) calibration after torch tip replacements.',
        specs: 'ISO Circular Interface'
      },
      {
        stepIndex: 12,
        partId: 'laser_welder',
        title: 'Step 12: Mount Fiber Laser Arc Welder',
        parentSocketId: 'tool_mount',
        targetDesc: 'Install the fiber laser welding torch on the tool plate.',
        theoryTitle: 'Robotics Theory: Laser Material Melting',
        theoryText: 'A high-energy 1070nm fiber laser beam focuses energy to a 0.3mm spot, instantly melting base metals while coaxial argon gas shields the melt pool from oxidation.',
        specs: 'Laser Power: 350W Equivalent | Focal Length: 150 mm | Copper Tip'
      }
    ]
  }
];

/**
 * Tutorial State Controller & Interactive Guide.
 */
export class TutorialSystem {
  constructor({ scene, dragDropSystem, onSwitchToSim }) {
    this.scene = scene;
    this.dragDropSystem = dragDropSystem;
    this.onSwitchToSim = onSwitchToSim;

    this.currentModule = TUTORIAL_MODULES[0];
    this.currentStepIdx = 0;
    this.isCompleted = false;

    this.initTargetBeacon();
  }

  initTargetBeacon() {
    this.beaconGroup = new THREE.Group();
    this.beaconGroup.name = 'TutorialBeaconGroup';
    this.beaconGroup.visible = false;

    const ringGeo = new THREE.TorusGeometry(0.10, 0.010, 12, 28);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0x22c55e,
      transparent: true,
      opacity: 0.85
    });
    this.beaconRing = new THREE.Mesh(ringGeo, ringMat);
    this.beaconRing.rotation.x = Math.PI / 2;
    this.beaconGroup.add(this.beaconRing);

    const coneGeo = new THREE.ConeGeometry(0.035, 0.10, 16);
    const coneMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });
    this.beaconCone = new THREE.Mesh(coneGeo, coneMat);
    this.beaconCone.rotation.x = Math.PI;
    this.beaconCone.position.y = 0.18;
    this.beaconGroup.add(this.beaconCone);

    this.scene.add(this.beaconGroup);
  }

  loadModule(moduleId) {
    const mod = TUTORIAL_MODULES.find(m => m.id === moduleId) || TUTORIAL_MODULES[0];
    this.currentModule = mod;
    this.currentStepIdx = 0;
    this.isCompleted = false;

    this.dragDropSystem.clearAssembly();
    this.renderCurrentStepUI();
    this.updateTargetBeacon();
    this.dragDropSystem.showToast(`Loaded: ${mod.title}`, 'info');
  }

  getCurrentStep() {
    return this.currentModule.steps[this.currentStepIdx] || null;
  }

  advanceStep() {
    if (this.currentStepIdx + 1 < this.currentModule.steps.length) {
      this.currentStepIdx++;
      this.renderCurrentStepUI();
      this.updateTargetBeacon();
    } else {
      this.isCompleted = true;
      this.beaconGroup.visible = false;
      this.renderCurrentStepUI();
      this.dragDropSystem.showToast('🎉 Module Complete! Test your 6-axis robot in Simulation Mode.', 'success');
    }
  }

  snapCurrentStep() {
    const step = this.getCurrentStep();
    if (!step || this.isCompleted) return;

    const partId = step.partId;
    const meta = ROBOT_PARTS_CATALOG[partId];

    if (step.stepIndex === 1) {
      const baseMesh = createPartMesh(partId, { theme: this.dragDropSystem.currentTheme });
      baseMesh.position.set(0, 1.01, 0);
      this.scene.add(baseMesh);
      this.dragDropSystem.placedParts.push(baseMesh);
      this.dragDropSystem.robotRoots.push(baseMesh);
      this.dragDropSystem.selectPart(baseMesh);
    } else {
      const targetSocketId = step.parentSocketId;
      let targetPart = null;
      let targetSocket = null;

      for (const p of this.dragDropSystem.placedParts) {
        const sockets = p.userData.snapSockets || [];
        const found = sockets.find(s => s.id === targetSocketId && !s.occupiedBy);
        if (found) {
          targetPart = p;
          targetSocket = found;
          break;
        }
      }

      if (!targetPart || !targetSocket) {
        this.dragDropSystem.showToast('Required socket not ready. Resetting lesson...', 'warning');
        this.loadModule(this.currentModule.id);
        return;
      }

      const newMesh = createPartMesh(partId, { theme: this.dragDropSystem.currentTheme });
      const worldPos = new THREE.Vector3();
      const worldQuat = new THREE.Quaternion();
      targetPart.localToWorld(worldPos.copy(targetSocket.offset));
      targetPart.getWorldQuaternion(worldQuat);

      newMesh.position.copy(worldPos);
      newMesh.quaternion.copy(worldQuat);

      targetSocket.occupiedBy = newMesh;
      newMesh.userData.parentPart = targetPart;
      newMesh.userData.parentSocket = targetSocket;

      if (!targetPart.userData.childrenParts) targetPart.userData.childrenParts = [];
      targetPart.userData.childrenParts.push(newMesh);

      const attachNode = targetPart.userData.actuation?.revoluteNode ||
                         targetPart.userData.actuation?.prismaticNode ||
                         targetPart;

      this.scene.add(newMesh);
      attachNode.attach(newMesh);
      this.dragDropSystem.placedParts.push(newMesh);
      this.dragDropSystem.selectPart(newMesh);
    }

    if (this.dragDropSystem.onAssemblyChanged) {
      this.dragDropSystem.onAssemblyChanged(this.dragDropSystem.getRobotSummary());
    }

    this.dragDropSystem.showToast(`Assembled ${meta ? meta.name : partId}!`, 'success');
    this.advanceStep();
  }

  validatePlacement(placedPartId) {
    const step = this.getCurrentStep();
    if (!step || this.isCompleted) return false;

    if (placedPartId === step.partId) {
      this.advanceStep();
      return true;
    }
    return false;
  }

  updateTargetBeacon() {
    const step = this.getCurrentStep();
    if (!step || this.isCompleted) {
      this.beaconGroup.visible = false;
      return;
    }

    if (step.stepIndex === 1) {
      this.beaconGroup.position.set(0, 1.01, 0);
      this.beaconGroup.visible = true;
      return;
    }

    const targetSocketId = step.parentSocketId;
    let foundPos = null;

    for (const p of this.dragDropSystem.placedParts) {
      const sockets = p.userData.snapSockets || [];
      const s = sockets.find(sock => sock.id === targetSocketId);
      if (s) {
        foundPos = new THREE.Vector3();
        p.localToWorld(foundPos.copy(s.offset));
        break;
      }
    }

    if (foundPos) {
      this.beaconGroup.position.copy(foundPos);
      this.beaconGroup.visible = true;
    } else {
      this.beaconGroup.visible = false;
    }
  }

  update(delta) {
    if (this.beaconGroup && this.beaconGroup.visible) {
      this.beaconRing.rotation.z += delta * 2.0;
      this.beaconCone.position.y = 0.16 + Math.sin(Date.now() * 0.005) * 0.03;
    }
  }

  renderCurrentStepUI() {
    const container = document.getElementById('tutorial-inspector-content');
    if (!container) return;

    const totalSteps = this.currentModule.steps.length;
    const currentStep = this.getCurrentStep();

    if (this.isCompleted) {
      container.innerHTML = `
        <div class="inspector-card tutorial-complete-card">
          <div class="tut-badge-row">
            <span class="tut-trophy">🏆</span>
            <span class="tut-complete-title">LESSON COMPLETE</span>
          </div>
          <h3 class="tut-mod-heading">${this.currentModule.title}</h3>
          <p class="tut-complete-desc">
            Outstanding! You have assembled the complete 6-axis industrial robot arm from individual joints, structural links, and ISO tool flange.
          </p>
          <div class="tut-action-grid">
            <button type="button" class="tut-primary-btn" id="btn-tut-test-sim">
              <span>▶️ Test All 6 Axes in Simulation Mode</span>
            </button>
            <button type="button" class="tut-secondary-btn" id="btn-tut-restart">
              <span>🔄 Restart Lesson</span>
            </button>
          </div>
        </div>
      `;

      document.getElementById('btn-tut-test-sim')?.addEventListener('click', () => {
        if (this.onSwitchToSim) this.onSwitchToSim();
      });

      document.getElementById('btn-tut-restart')?.addEventListener('click', () => {
        this.loadModule(this.currentModule.id);
      });
      return;
    }

    const progressPercent = Math.round(((this.currentStepIdx) / totalSteps) * 100);
    const meta = ROBOT_PARTS_CATALOG[currentStep.partId];

    container.innerHTML = `
      <div class="inspector-card">
        <div class="tut-mod-select-wrap">
          <label for="tut-module-picker" class="action-label">Active Lesson</label>
          <select id="tut-module-picker" class="nav-select tut-select">
            ${TUTORIAL_MODULES.map(m => `
              <option value="${m.id}" ${m.id === this.currentModule.id ? 'selected' : ''}>
                ${m.icon} ${m.title}
              </option>
            `).join('')}
          </select>
        </div>

        <div class="tut-progress-wrap">
          <div class="tut-progress-header">
            <span class="tut-step-pill">Step ${currentStep.stepIndex} of ${totalSteps}</span>
            <span class="tut-progress-val">${progressPercent}% Completed</span>
          </div>
          <div class="tut-progress-bar-bg">
            <div class="tut-progress-bar-fill" style="width: ${progressPercent}%;"></div>
          </div>
        </div>
      </div>

      <div class="inspector-card">
        <h3 class="tut-step-title">${currentStep.title}</h3>
        <p class="tut-target-desc">${currentStep.targetDesc}</p>

        <div class="tut-needed-part-card">
          <div class="tut-part-badge">Required Component</div>
          <div class="tut-part-name">
            <span class="tut-part-icon">📦</span>
            <span>${meta ? meta.name : currentStep.partId}</span>
          </div>
          <div class="tut-part-specs">${currentStep.specs}</div>
        </div>

        <div class="tut-step-actions">
          <button type="button" class="tut-snap-btn" id="btn-tut-snap-step">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M5 12h14"></path>
              <path d="M12 5l7 7-7 7"></path>
            </svg>
            <span>Snap Next Component</span>
          </button>
          <button type="button" class="tut-reset-btn" id="btn-tut-reset-mod" title="Restart Lesson">
            <span>Restart</span>
          </button>
        </div>
      </div>

      <div class="inspector-card tut-theory-card">
        <div class="tut-theory-header">
          <span class="tut-theory-badge">ENGINEERING THEORY</span>
        </div>
        <h4 class="tut-theory-title">${currentStep.theoryTitle}</h4>
        <p class="tut-theory-body">${currentStep.theoryText}</p>
      </div>
    `;

    document.getElementById('tut-module-picker')?.addEventListener('change', (e) => {
      this.loadModule(e.target.value);
    });

    document.getElementById('btn-tut-snap-step')?.addEventListener('click', () => {
      this.snapCurrentStep();
    });

    document.getElementById('btn-tut-reset-mod')?.addEventListener('click', () => {
      this.loadModule(this.currentModule.id);
    });
  }
}
