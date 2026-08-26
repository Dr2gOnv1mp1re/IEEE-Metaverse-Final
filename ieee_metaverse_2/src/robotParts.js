import * as THREE from 'three';

/**
 * 3D Modular Robotics Parts Library & Precision Kinematics Specification.
 *
 * Decomposed into 12 discrete industrial robot components:
 * Base -> J1 -> Link 1 -> J2 -> Link 2 -> J3 -> Link 3 -> J4 -> J5 -> J6 -> Tool Flange -> End Effector
 *
 * Engineered with realistic factory robot aesthetics:
 * - Harmonic drive gear reducers with gear tooth rims
 * - Industrial AC servo motors with cooling heat-sink fins
 * - Rear optical encoder/resolver caps and cable glands
 * - Preloaded cross-roller bearings with visible outer rings
 * - Bolted inspection covers with recessed socket-head cap screws
 * - External flexible corrugated cable harness (orange/black conduit) and bracket clamps
 * - Standard ISO 9409-1 tool mounting flange
 */

export const PART_CATEGORIES = [
  { id: 'all', name: 'All Modules' },
  { id: 'bases', name: 'Bases & Pedestals' },
  { id: 'joints', name: 'Actuator Joints (J1-J6)' },
  { id: 'limbs', name: 'Structural Links' },
  { id: 'tools', name: 'End Effectors & Flanges' },
  { id: 'sensors', name: 'Sensors & AI' },
  { id: 'power', name: 'Power & Aux' }
];

export const COLOR_THEMES = [
  { id: 'industrial', name: 'KUKA Orange', primary: 0xea580c, secondary: 0x27272a, accent: 0xfacc15, metal: 0.75, rough: 0.3 },
  { id: 'cyber', name: 'Cyber Slate', primary: 0x1e293b, secondary: 0x0f172a, accent: 0x38bdf8, metal: 0.85, rough: 0.25 },
  { id: 'cleanroom', name: 'Cleanroom White', primary: 0xf1f5f9, secondary: 0x334155, accent: 0x06b6d4, metal: 0.4, rough: 0.3 },
  { id: 'stealth', name: 'Stealth Black', primary: 0x09090b, secondary: 0x18181b, accent: 0x22c55e, metal: 0.9, rough: 0.2 },
  { id: 'hazard', name: 'Fanuc Yellow', primary: 0xeab308, secondary: 0x1c1917, accent: 0xef4444, metal: 0.75, rough: 0.3 }
];

const materialCache = new Map();

function getPartMaterials(themeId = 'industrial') {
  if (materialCache.has(themeId)) {
    return materialCache.get(themeId);
  }

  const theme = COLOR_THEMES.find(t => t.id === themeId) || COLOR_THEMES[0];

  const mats = {
    hull: new THREE.MeshStandardMaterial({
      color: theme.primary,
      metalness: theme.metal,
      roughness: theme.rough,
      envMapIntensity: 1.2
    }),
    castDark: new THREE.MeshStandardMaterial({
      color: theme.secondary,
      metalness: 0.85,
      roughness: 0.4
    }),
    castIron: new THREE.MeshStandardMaterial({
      color: 0x27272a,
      metalness: 0.6,
      roughness: 0.6
    }),
    steelChrome: new THREE.MeshStandardMaterial({
      color: 0xd4d4d8,
      metalness: 0.95,
      roughness: 0.15
    }),
    brass: new THREE.MeshStandardMaterial({
      color: 0xd97706,
      metalness: 0.85,
      roughness: 0.25
    }),
    harnessOrange: new THREE.MeshStandardMaterial({
      color: 0xf97316,
      roughness: 0.7,
      metalness: 0.1
    }),
    harnessBlack: new THREE.MeshStandardMaterial({
      color: 0x18181b,
      roughness: 0.85,
      metalness: 0.15
    }),
    accentGlow: new THREE.MeshStandardMaterial({
      color: theme.accent,
      emissive: theme.accent,
      emissiveIntensity: 0.8,
      metalness: 0.2,
      roughness: 0.3
    }),
    statusLedGreen: new THREE.MeshStandardMaterial({
      color: 0x22c55e,
      emissive: 0x22c55e,
      emissiveIntensity: 1.2
    }),
    warningAmber: new THREE.MeshStandardMaterial({
      color: 0xf59e0b,
      emissive: 0xf59e0b,
      emissiveIntensity: 1.0
    }),
    rubberPad: new THREE.MeshStandardMaterial({
      color: 0x27272a,
      roughness: 0.9,
      metalness: 0.05
    }),
    glass: new THREE.MeshPhysicalMaterial({
      color: 0x0284c7,
      transmission: 0.75,
      opacity: 0.9,
      transparent: true,
      roughness: 0.1,
      ior: 1.45
    }),
    laserRed: new THREE.MeshBasicMaterial({
      color: 0xff0044,
      transparent: true,
      opacity: 0.85
    })
  };

  materialCache.set(themeId, mats);
  return mats;
}

/**
 * Registry of all 12 discrete 6-axis robot components plus auxiliary mobile modules.
 */
export const ROBOT_PARTS_CATALOG = {
  // ---------------------------------------------------------------------------
  // 1. BASE: Rigid Robot Mounting Pedestal
  // ---------------------------------------------------------------------------
  robot_base: {
    id: 'robot_base',
    name: 'Rigid Mounting Pedestal',
    category: 'bases',
    mass: 28.0,
    power: 10,
    dof: 0,
    isRoot: true,
    description: 'Heavy cast-steel foundation pedestal with 6 high-tensile anchor bolt lugs, leveling jackscrew pads, and ground bonding stud.',
    snapSockets: [
      { id: 'base_flange', name: 'J1 Turntable Flange Socket', offset: new THREE.Vector3(0, 0.28, 0), normal: new THREE.Vector3(0, 1, 0), types: ['joints'] }
    ]
  },

  // ---------------------------------------------------------------------------
  // 2. J1: Base Rotary Axis
  // ---------------------------------------------------------------------------
  joint_j1: {
    id: 'joint_j1',
    name: 'J1 Base Rotary Axis',
    category: 'joints',
    mass: 14.5,
    power: 90,
    dof: 1,
    jointType: 'revolute',
    jointAxis: 'y',
    minAngle: -Math.PI,
    maxAngle: Math.PI,
    defaultAngle: 0,
    description: 'Harmonic-drive turntable rotary axis with cross-roller bearing, finned AC servo motor can, and rear optical encoder cover.',
    snapSockets: [
      { id: 'j1_output', name: 'Link 1 Shoulder Socket', offset: new THREE.Vector3(0, 0.22, 0), normal: new THREE.Vector3(0, 1, 0), types: ['limbs'] }
    ]
  },

  // ---------------------------------------------------------------------------
  // 3. LINK 1: Shoulder Cast Housing
  // ---------------------------------------------------------------------------
  link_1: {
    id: 'link_1',
    name: 'Link 1 Shoulder Housing',
    category: 'limbs',
    mass: 11.2,
    power: 0,
    dof: 0,
    description: 'Rigid cast-aluminum shoulder turntable bracket with dual trunnion ears for mounting the J2 shoulder pitch bearing.',
    snapSockets: [
      { id: 'j2_trunnion', name: 'J2 Shoulder Trunnion Socket', offset: new THREE.Vector3(0, 0.20, 0), normal: new THREE.Vector3(0, 1, 0), types: ['joints'] }
    ]
  },

  // ---------------------------------------------------------------------------
  // 4. J2: Shoulder Servo Actuator
  // ---------------------------------------------------------------------------
  joint_j2: {
    id: 'joint_j2',
    name: 'J2 Shoulder Servo Actuator',
    category: 'joints',
    mass: 12.8,
    power: 120,
    dof: 1,
    jointType: 'revolute',
    jointAxis: 'x',
    minAngle: -Math.PI * 0.55,
    maxAngle: Math.PI * 0.75,
    defaultAngle: 0,
    description: 'High-torque shoulder pivot actuator with strain-wave gear reducer, electromechanical holding brake, and counterbalance damper.',
    snapSockets: [
      { id: 'j2_output', name: 'Link 2 Upper-Arm Socket', offset: new THREE.Vector3(0, 0.18, 0), normal: new THREE.Vector3(0, 1, 0), types: ['limbs'] }
    ]
  },

  // ---------------------------------------------------------------------------
  // 5. LINK 2: Upper-Arm Structural Boom
  // ---------------------------------------------------------------------------
  link_2: {
    id: 'link_2',
    name: 'Link 2 Upper-Arm Boom (55cm)',
    category: 'limbs',
    mass: 6.8,
    power: 0,
    dof: 0,
    description: 'Slender cast/extruded aluminum structural boom with stiffening ribs, internal cable routing channel, and external conduit clips.',
    snapSockets: [
      { id: 'j3_clevis', name: 'J3 Elbow Clevis Socket', offset: new THREE.Vector3(0, 0.55, 0), normal: new THREE.Vector3(0, 1, 0), types: ['joints'] }
    ]
  },

  // ---------------------------------------------------------------------------
  // 6. J3: Elbow Servo Joint
  // ---------------------------------------------------------------------------
  joint_j3: {
    id: 'joint_j3',
    name: 'J3 Elbow Servo Joint',
    category: 'joints',
    mass: 9.4,
    power: 95,
    dof: 1,
    jointType: 'revolute',
    jointAxis: 'x',
    minAngle: -Math.PI * 0.75,
    maxAngle: Math.PI * 0.75,
    defaultAngle: 0,
    description: 'Compact elbow pitch joint with precision planetary-harmonic reducer, side-mounted servo motor cylinder, and encoder cap.',
    snapSockets: [
      { id: 'j3_output', name: 'Link 3 Forearm Socket', offset: new THREE.Vector3(0, 0.16, 0), normal: new THREE.Vector3(0, 1, 0), types: ['limbs'] }
    ]
  },

  // ---------------------------------------------------------------------------
  // 7. LINK 3: Forearm Structural Link
  // ---------------------------------------------------------------------------
  link_3: {
    id: 'link_3',
    name: 'Link 3 Forearm Structural Link (42cm)',
    category: 'limbs',
    mass: 4.6,
    power: 5,
    dof: 0,
    description: 'Tapered cast aluminum forearm casing with bolted diagnostic window, external corrugated cable harness, and LED status bar.',
    snapSockets: [
      { id: 'j4_flange', name: 'J4 Wrist Roll Socket', offset: new THREE.Vector3(0, 0.42, 0), normal: new THREE.Vector3(0, 1, 0), types: ['joints'] }
    ]
  },

  // ---------------------------------------------------------------------------
  // 8. J4: Wrist Roll Rotary Axis
  // ---------------------------------------------------------------------------
  joint_j4: {
    id: 'joint_j4',
    name: 'J4 Wrist Roll Rotary Axis',
    category: 'joints',
    mass: 3.2,
    power: 45,
    dof: 1,
    jointType: 'revolute',
    jointAxis: 'y',
    minAngle: -Math.PI,
    maxAngle: Math.PI,
    defaultAngle: 0,
    description: 'Inline axial wrist roll actuator with preloaded angular contact ball bearings and hollow shaft for wrist cables.',
    snapSockets: [
      { id: 'j4_output', name: 'J5 Wrist Pitch Socket', offset: new THREE.Vector3(0, 0.12, 0), normal: new THREE.Vector3(0, 1, 0), types: ['joints'] }
    ]
  },

  // ---------------------------------------------------------------------------
  // 9. J5: Wrist Pitch/Tilt Rotary Axis
  // ---------------------------------------------------------------------------
  joint_j5: {
    id: 'joint_j5',
    name: 'J5 Wrist Pitch/Tilt Axis',
    category: 'joints',
    mass: 2.8,
    power: 40,
    dof: 1,
    jointType: 'revolute',
    jointAxis: 'x',
    minAngle: -Math.PI * 0.65,
    maxAngle: Math.PI * 0.65,
    defaultAngle: 0,
    description: 'Orthogonal pitch knuckle unit with miniature harmonic drive and dual-supported cross-pin trunnion.',
    snapSockets: [
      { id: 'j5_output', name: 'J6 Tool Roll Socket', offset: new THREE.Vector3(0, 0.11, 0), normal: new THREE.Vector3(0, 1, 0), types: ['joints'] }
    ]
  },

  // ---------------------------------------------------------------------------
  // 10. J6: Wrist Tool Roll Rotary Axis
  // ---------------------------------------------------------------------------
  joint_j6: {
    id: 'joint_j6',
    name: 'J6 Wrist Tool Roll Axis',
    category: 'joints',
    mass: 1.9,
    power: 35,
    dof: 1,
    jointType: 'revolute',
    jointAxis: 'y',
    minAngle: -Math.PI * 2,
    maxAngle: Math.PI * 2,
    defaultAngle: 0,
    description: 'High-speed rotary tool spindle axis providing continuous tool rotation with high-accuracy resolver feedback.',
    snapSockets: [
      { id: 'j6_output', name: 'ISO Flange Socket', offset: new THREE.Vector3(0, 0.08, 0), normal: new THREE.Vector3(0, 1, 0), types: ['tools'] }
    ]
  },

  // ---------------------------------------------------------------------------
  // 11. TOOL FLANGE: Standard ISO 9409-1 Flange
  // ---------------------------------------------------------------------------
  tool_flange: {
    id: 'tool_flange',
    name: 'Standard ISO 9409-1 Tool Flange',
    category: 'tools',
    mass: 0.8,
    power: 0,
    dof: 0,
    description: 'Precision ground steel circular adapter plate with standardized PCD bolt circle (4 x M6), center locating spigot, and dowel pin hole.',
    snapSockets: [
      { id: 'tool_mount', name: 'End Effector Socket', offset: new THREE.Vector3(0, 0.04, 0), normal: new THREE.Vector3(0, 1, 0), types: ['tools'] }
    ]
  },

  // ---------------------------------------------------------------------------
  // 12. END EFFECTOR: Industrial Two-Finger Parallel Gripper
  // ---------------------------------------------------------------------------
  end_effector_gripper: {
    id: 'end_effector_gripper',
    name: 'Industrial Two-Finger Parallel Gripper',
    category: 'tools',
    mass: 1.6,
    power: 25,
    dof: 0,
    isActuatedTool: true,
    toolType: 'gripper',
    description: 'Heavy-duty pneumatic parallel clamp with dual linear guide rails, magnetic reed sensor slots, and precision fingers with interchangeable polyurethane pads.',
    snapSockets: []
  },

  // ---------------------------------------------------------------------------
  // AUXILIARY TOOLS & MOBILE CHASSIS (Compatible)
  // ---------------------------------------------------------------------------
  laser_welder: {
    id: 'laser_welder',
    name: 'Fiber Laser Arc Welder Torch',
    category: 'tools',
    mass: 2.2,
    power: 350,
    dof: 0,
    isActuatedTool: true,
    toolType: 'laser',
    description: 'Water-cooled fiber laser welding nozzle with coaxial shielding gas delivery, copper tip, and collimator.',
    snapSockets: []
  },

  rover_chassis: {
    id: 'rover_chassis',
    name: 'Mecanum Mobile Chassis',
    category: 'bases',
    mass: 26.0,
    power: 110,
    dof: 0,
    isRoot: true,
    isMobile: true,
    description: 'CNC-machined aluminum plate chassis with independent suspension struts and 4 mecanum drive pods.',
    snapSockets: [
      { id: 'center_mount', name: 'Center Turret Socket', offset: new THREE.Vector3(0, 0.32, 0), normal: new THREE.Vector3(0, 1, 0), types: ['joints'] }
    ]
  }
};

/**
 * Creates the complete 3D Three.js mesh for any catalog part with realistic industrial details.
 */
export function createPartMesh(partId, options = {}) {
  const meta = ROBOT_PARTS_CATALOG[partId];
  if (!meta) return createGenericPlaceholder(partId);

  const themeId = options.theme || 'industrial';
  const mats = getPartMaterials(themeId);
  const isGhost = Boolean(options.isGhost);

  const group = new THREE.Group();
  group.name = `RobotPart_${partId}`;
  group.userData = {
    partId: meta.id,
    category: meta.category,
    name: meta.name,
    mass: meta.mass,
    power: meta.power,
    dof: meta.dof,
    isRoot: Boolean(meta.isRoot),
    isMobile: Boolean(meta.isMobile),
    jointInfo: meta.jointType ? {
      type: meta.jointType,
      axis: meta.jointAxis,
      min: meta.minAngle ?? 0,
      max: meta.maxAngle ?? 0,
      current: meta.defaultAngle ?? 0
    } : null,
    actuation: {},
    snapSockets: (meta.snapSockets || []).map(s => ({ ...s, occupiedBy: null }))
  };

  const applyMat = (defaultMat) => {
    if (!isGhost) return defaultMat;
    return new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      wireframe: true,
      transparent: true,
      opacity: 0.55
    });
  };

  switch (partId) {
    // -------------------------------------------------------------------------
    // 1. BASE: Rigid Robot Mounting Pedestal
    // -------------------------------------------------------------------------
    case 'robot_base': {
      // Cast steel foundation plate with chamfer
      const plate = new THREE.Mesh(
        new THREE.CylinderGeometry(0.38, 0.42, 0.05, 32),
        applyMat(mats.castDark)
      );
      plate.position.y = 0.025;
      plate.receiveShadow = !isGhost;
      group.add(plate);

      // Pedestal riser column with stiffening gussets
      const column = new THREE.Mesh(
        new THREE.CylinderGeometry(0.24, 0.32, 0.18, 32),
        applyMat(mats.hull)
      );
      column.position.y = 0.14;
      column.castShadow = !isGhost;
      group.add(column);

      // Top machined mounting flange
      const flange = new THREE.Mesh(
        new THREE.CylinderGeometry(0.25, 0.25, 0.05, 32),
        applyMat(mats.steelChrome)
      );
      flange.position.y = 0.255;
      group.add(flange);

      // 6 Anchor bolts with washers
      for (let i = 0; i < 6; i++) {
        const angle = (i * Math.PI * 2) / 6;
        const bolt = new THREE.Mesh(
          new THREE.CylinderGeometry(0.018, 0.018, 0.07, 12),
          applyMat(mats.steelChrome)
        );
        bolt.position.set(Math.cos(angle) * 0.35, 0.04, Math.sin(angle) * 0.35);
        group.add(bolt);
      }

      // Yellow ground grounding lug
      const groundLug = new THREE.Mesh(
        new THREE.BoxGeometry(0.03, 0.02, 0.03),
        applyMat(mats.brass)
      );
      groundLug.position.set(0.26, 0.03, 0);
      group.add(groundLug);
      break;
    }

    // -------------------------------------------------------------------------
    // 2. J1: Base Rotary Axis
    // -------------------------------------------------------------------------
    case 'joint_j1': {
      // Stator bearing housing
      const stator = new THREE.Mesh(
        new THREE.CylinderGeometry(0.24, 0.25, 0.08, 32),
        applyMat(mats.castDark)
      );
      stator.position.y = 0.04;
      group.add(stator);

      // Rotary output node (rotates around Y)
      const rotNode = new THREE.Group();
      rotNode.name = 'JointRotator_J1_Y';
      rotNode.position.y = 0.08;

      // Harmonic drive cup casing
      const casing = new THREE.Mesh(
        new THREE.CylinderGeometry(0.23, 0.23, 0.12, 32),
        applyMat(mats.hull)
      );
      casing.position.y = 0.06;
      casing.castShadow = !isGhost;
      rotNode.add(casing);

      // Finned AC servo motor can attached to side
      const servoMotor = new THREE.Mesh(
        new THREE.CylinderGeometry(0.065, 0.065, 0.18, 20),
        applyMat(mats.castDark)
      );
      servoMotor.rotation.x = Math.PI / 2;
      servoMotor.position.set(0.18, 0.06, 0);
      rotNode.add(servoMotor);

      // Encoder cap (black end cover)
      const encCap = new THREE.Mesh(
        new THREE.CylinderGeometry(0.066, 0.066, 0.03, 20),
        applyMat(mats.harnessBlack)
      );
      encCap.rotation.x = Math.PI / 2;
      encCap.position.set(0.18, 0.06, 0.10);
      rotNode.add(encCap);

      // Top output flange
      const outFlange = new THREE.Mesh(
        new THREE.CylinderGeometry(0.21, 0.21, 0.03, 32),
        applyMat(mats.steelChrome)
      );
      outFlange.position.y = 0.135;
      rotNode.add(outFlange);

      group.add(rotNode);
      group.userData.actuation.revoluteNode = rotNode;
      break;
    }

    // -------------------------------------------------------------------------
    // 3. LINK 1: Shoulder Cast Housing
    // -------------------------------------------------------------------------
    case 'link_1': {
      // Bottom flange plate
      const botPlate = new THREE.Mesh(
        new THREE.CylinderGeometry(0.21, 0.22, 0.04, 28),
        applyMat(mats.castDark)
      );
      botPlate.position.y = 0.02;
      group.add(botPlate);

      // Dual structural trunnion ears
      for (const side of [-0.14, 0.14]) {
        const trunnion = new THREE.Mesh(
          new THREE.BoxGeometry(0.05, 0.16, 0.18),
          applyMat(mats.hull)
        );
        trunnion.position.set(side, 0.11, 0);
        trunnion.castShadow = !isGhost;
        group.add(trunnion);

        // Circular bearing cap on outside of trunnion
        const cap = new THREE.Mesh(
          new THREE.CylinderGeometry(0.06, 0.06, 0.015, 20),
          applyMat(mats.steelChrome)
        );
        cap.rotation.z = Math.PI / 2;
        cap.position.set(side > 0 ? side + 0.03 : side - 0.03, 0.13, 0);
        group.add(cap);
      }

      // Cable pass-through conduit arch
      const arch = new THREE.Mesh(
        new THREE.BoxGeometry(0.12, 0.06, 0.04),
        applyMat(mats.castDark)
      );
      arch.position.set(0, 0.08, -0.07);
      group.add(arch);
      break;
    }

    // -------------------------------------------------------------------------
    // 4. J2: Shoulder Servo Actuator
    // -------------------------------------------------------------------------
    case 'joint_j2': {
      // Center trunnion barrel (rotates around X)
      const pivotNode = new THREE.Group();
      pivotNode.name = 'JointPivot_J2_X';
      pivotNode.position.set(0, 0.09, 0);

      // Heavy cross-roller bearing hub
      const hub = new THREE.Mesh(
        new THREE.CylinderGeometry(0.095, 0.095, 0.24, 28),
        applyMat(mats.steelChrome)
      );
      hub.rotation.z = Math.PI / 2;
      pivotNode.add(hub);

      // Servo motor housing on side
      const motor = new THREE.Mesh(
        new THREE.CylinderGeometry(0.06, 0.06, 0.14, 20),
        applyMat(mats.castDark)
      );
      motor.rotation.z = Math.PI / 2;
      motor.position.set(0.19, 0, 0);
      pivotNode.add(motor);

      // Output bracket for Link 2
      const outBracket = new THREE.Mesh(
        new THREE.BoxGeometry(0.18, 0.10, 0.14),
        applyMat(mats.hull)
      );
      outBracket.position.y = 0.05;
      outBracket.castShadow = !isGhost;
      pivotNode.add(outBracket);

      // Top flange socket
      const outFlange = new THREE.Mesh(
        new THREE.CylinderGeometry(0.15, 0.15, 0.03, 24),
        applyMat(mats.steelChrome)
      );
      outFlange.position.y = 0.105;
      pivotNode.add(outFlange);

      group.add(pivotNode);
      group.userData.actuation.revoluteNode = pivotNode;
      break;
    }

    // -------------------------------------------------------------------------
    // 5. LINK 2: Upper-Arm Structural Boom (Slender cast aluminium with ribs)
    // -------------------------------------------------------------------------
    case 'link_2': {
      // Bottom mounting clevis
      const botClevis = new THREE.Mesh(
        new THREE.CylinderGeometry(0.14, 0.15, 0.04, 24),
        applyMat(mats.castDark)
      );
      botClevis.position.y = 0.02;
      group.add(botClevis);

      // Main structural slender boom (tapered I-beam profile)
      const boom = new THREE.Mesh(
        new THREE.BoxGeometry(0.11, 0.49, 0.15),
        applyMat(mats.hull)
      );
      boom.position.y = 0.28;
      boom.castShadow = !isGhost;
      group.add(boom);

      // Cast stiffening side ribs
      for (const side of [-0.06, 0.06]) {
        const rib = new THREE.Mesh(
          new THREE.BoxGeometry(0.015, 0.45, 0.13),
          applyMat(mats.castDark)
        );
        rib.position.set(side, 0.28, 0);
        group.add(rib);
      }

      // External corrugated cable harness running alongside boom (orange conduit)
      const harness = new THREE.Mesh(
        new THREE.CylinderGeometry(0.018, 0.018, 0.48, 12),
        applyMat(mats.harnessOrange)
      );
      harness.position.set(0.08, 0.28, 0.06);
      group.add(harness);

      // 3 Cable bracket clamps
      for (const y of [0.12, 0.28, 0.44]) {
        const clamp = new THREE.Mesh(
          new THREE.BoxGeometry(0.03, 0.02, 0.03),
          applyMat(mats.harnessBlack)
        );
        clamp.position.set(0.075, y, 0.06);
        group.add(clamp);
      }

      // Top clevis for J3
      const topClevis = new THREE.Mesh(
        new THREE.CylinderGeometry(0.12, 0.12, 0.04, 24),
        applyMat(mats.castDark)
      );
      topClevis.position.y = 0.54;
      group.add(topClevis);
      break;
    }

    // -------------------------------------------------------------------------
    // 6. J3: Elbow Servo Joint
    // -------------------------------------------------------------------------
    case 'joint_j3': {
      const pivotNode = new THREE.Group();
      pivotNode.name = 'JointPivot_J3_X';
      pivotNode.position.set(0, 0.08, 0);

      // Elbow cross trunnion
      const elbowHub = new THREE.Mesh(
        new THREE.CylinderGeometry(0.085, 0.085, 0.20, 24),
        applyMat(mats.steelChrome)
      );
      elbowHub.rotation.z = Math.PI / 2;
      pivotNode.add(elbowHub);

      // Side-mounted J3 servo motor
      const j3Motor = new THREE.Mesh(
        new THREE.CylinderGeometry(0.052, 0.052, 0.13, 16),
        applyMat(mats.castDark)
      );
      j3Motor.rotation.z = Math.PI / 2;
      j3Motor.position.set(-0.16, 0, 0);
      pivotNode.add(j3Motor);

      // Output connector for Link 3
      const outBracket = new THREE.Mesh(
        new THREE.BoxGeometry(0.14, 0.08, 0.12),
        applyMat(mats.hull)
      );
      outBracket.position.y = 0.04;
      pivotNode.add(outBracket);

      const topFlange = new THREE.Mesh(
        new THREE.CylinderGeometry(0.12, 0.12, 0.025, 20),
        applyMat(mats.steelChrome)
      );
      topFlange.position.y = 0.085;
      pivotNode.add(topFlange);

      group.add(pivotNode);
      group.userData.actuation.revoluteNode = pivotNode;
      break;
    }

    // -------------------------------------------------------------------------
    // 7. LINK 3: Forearm Structural Link (Tapered with harness)
    // -------------------------------------------------------------------------
    case 'link_3': {
      const botFlange = new THREE.Mesh(
        new THREE.CylinderGeometry(0.11, 0.12, 0.03, 20),
        applyMat(mats.castDark)
      );
      botFlange.position.y = 0.015;
      group.add(botFlange);

      // Streamlined tapered forearm tube
      const armTube = new THREE.Mesh(
        new THREE.CylinderGeometry(0.075, 0.10, 0.38, 20),
        applyMat(mats.hull)
      );
      armTube.position.y = 0.21;
      armTube.castShadow = !isGhost;
      group.add(armTube);

      // Bolted service window cover
      const windowCover = new THREE.Mesh(
        new THREE.PlaneGeometry(0.05, 0.14),
        applyMat(mats.castDark)
      );
      windowCover.position.set(0, 0.21, 0.088);
      group.add(windowCover);

      // Diagnostic LED strip
      const led = new THREE.Mesh(
        new THREE.BoxGeometry(0.008, 0.12, 0.005),
        applyMat(mats.accentGlow)
      );
      led.position.set(0, 0.21, 0.092);
      group.add(led);

      // External cable conduit along forearm
      const conduit = new THREE.Mesh(
        new THREE.CylinderGeometry(0.012, 0.012, 0.36, 12),
        applyMat(mats.harnessOrange)
      );
      conduit.position.set(0.065, 0.21, 0.05);
      group.add(conduit);

      // Top flange to J4
      const topFlange = new THREE.Mesh(
        new THREE.CylinderGeometry(0.085, 0.09, 0.03, 20),
        applyMat(mats.castDark)
      );
      topFlange.position.y = 0.41;
      group.add(topFlange);
      break;
    }

    // -------------------------------------------------------------------------
    // 8. J4: Wrist Roll Rotary Axis (In-line roll)
    // -------------------------------------------------------------------------
    case 'joint_j4': {
      const baseRing = new THREE.Mesh(
        new THREE.CylinderGeometry(0.085, 0.09, 0.03, 20),
        applyMat(mats.castDark)
      );
      baseRing.position.y = 0.015;
      group.add(baseRing);

      // In-line roll rotator (rotates around Y)
      const rollNode = new THREE.Group();
      rollNode.name = 'JointRotator_J4_Y';
      rollNode.position.y = 0.03;

      const rollCylinder = new THREE.Mesh(
        new THREE.CylinderGeometry(0.08, 0.08, 0.07, 20),
        applyMat(mats.hull)
      );
      rollCylinder.position.y = 0.035;
      rollNode.add(rollCylinder);

      const rollFlange = new THREE.Mesh(
        new THREE.CylinderGeometry(0.075, 0.075, 0.02, 20),
        applyMat(mats.steelChrome)
      );
      rollFlange.position.y = 0.08;
      rollNode.add(rollFlange);

      group.add(rollNode);
      group.userData.actuation.revoluteNode = rollNode;
      break;
    }

    // -------------------------------------------------------------------------
    // 9. J5: Wrist Pitch/Tilt Rotary Axis (Knuckle pivot)
    // -------------------------------------------------------------------------
    case 'joint_j5': {
      const pivotNode = new THREE.Group();
      pivotNode.name = 'JointPivot_J5_X';
      pivotNode.position.set(0, 0.04, 0);

      // Knuckle cross pin
      const pin = new THREE.Mesh(
        new THREE.CylinderGeometry(0.05, 0.05, 0.12, 16),
        applyMat(mats.steelChrome)
      );
      pin.rotation.z = Math.PI / 2;
      pivotNode.add(pin);

      // Center knuckle body
      const knuckle = new THREE.Mesh(
        new THREE.BoxGeometry(0.09, 0.06, 0.08),
        applyMat(mats.hull)
      );
      knuckle.position.y = 0.03;
      pivotNode.add(knuckle);

      const outFlange = new THREE.Mesh(
        new THREE.CylinderGeometry(0.065, 0.065, 0.015, 20),
        applyMat(mats.steelChrome)
      );
      outFlange.position.y = 0.065;
      pivotNode.add(outFlange);

      group.add(pivotNode);
      group.userData.actuation.revoluteNode = pivotNode;
      break;
    }

    // -------------------------------------------------------------------------
    // 10. J6: Wrist Tool Roll Rotary Axis (Tool Spindle)
    // -------------------------------------------------------------------------
    case 'joint_j6': {
      const statorRing = new THREE.Mesh(
        new THREE.CylinderGeometry(0.065, 0.07, 0.02, 20),
        applyMat(mats.castDark)
      );
      statorRing.position.y = 0.01;
      group.add(statorRing);

      // Tool roll spindle (rotates around Y)
      const toolSpindleNode = new THREE.Group();
      toolSpindleNode.name = 'JointRotator_J6_Y';
      toolSpindleNode.position.y = 0.02;

      const spindle = new THREE.Mesh(
        new THREE.CylinderGeometry(0.06, 0.06, 0.05, 20),
        applyMat(mats.hull)
      );
      spindle.position.y = 0.025;
      toolSpindleNode.add(spindle);

      // High-precision output adapter
      const adapter = new THREE.Mesh(
        new THREE.CylinderGeometry(0.058, 0.058, 0.015, 24),
        applyMat(mats.steelChrome)
      );
      adapter.position.y = 0.055;
      toolSpindleNode.add(adapter);

      group.add(toolSpindleNode);
      group.userData.actuation.revoluteNode = toolSpindleNode;
      break;
    }

    // -------------------------------------------------------------------------
    // 11. TOOL FLANGE: Standard ISO 9409-1 Flange
    // -------------------------------------------------------------------------
    case 'tool_flange': {
      // Precision ground circular flange plate
      const flangePlate = new THREE.Mesh(
        new THREE.CylinderGeometry(0.065, 0.065, 0.016, 32),
        applyMat(mats.steelChrome)
      );
      flangePlate.position.y = 0.008;
      group.add(flangePlate);

      // Center pilot spigot (locating cylinder)
      const spigot = new THREE.Mesh(
        new THREE.CylinderGeometry(0.025, 0.025, 0.01, 24),
        applyMat(mats.castDark)
      );
      spigot.position.y = 0.02;
      group.add(spigot);

      // 4 Threaded M6 bolt holes (indicated by dark rivets/pockets)
      for (let i = 0; i < 4; i++) {
        const angle = (i * Math.PI) / 2 + Math.PI / 4;
        const hole = new THREE.Mesh(
          new THREE.CylinderGeometry(0.005, 0.005, 0.018, 10),
          applyMat(mats.castIron)
        );
        hole.position.set(Math.cos(angle) * 0.045, 0.01, Math.sin(angle) * 0.045);
        group.add(hole);
      }

      // Locating dowel pin
      const dowel = new THREE.Mesh(
        new THREE.CylinderGeometry(0.004, 0.004, 0.012, 10),
        applyMat(mats.brass)
      );
      dowel.position.set(0, 0.02, 0.045);
      group.add(dowel);
      break;
    }

    // -------------------------------------------------------------------------
    // 12. END EFFECTOR: Industrial Two-Finger Parallel Gripper
    // -------------------------------------------------------------------------
    case 'end_effector_gripper': {
      // Machined aluminum pneumatic gripper body
      const body = new THREE.Mesh(
        new THREE.BoxGeometry(0.14, 0.055, 0.08),
        applyMat(mats.castDark)
      );
      body.position.y = 0.028;
      body.castShadow = !isGhost;
      group.add(body);

      // Chrome linear guide rods
      for (const z of [-0.02, 0.02]) {
        const guideRod = new THREE.Mesh(
          new THREE.CylinderGeometry(0.006, 0.006, 0.13, 12),
          applyMat(mats.steelChrome)
        );
        guideRod.rotation.z = Math.PI / 2;
        guideRod.position.set(0, 0.035, z);
        group.add(guideRod);
      }

      // Left finger
      const leftFinger = new THREE.Group();
      leftFinger.position.set(-0.035, 0.055, 0);

      const lArm = new THREE.Mesh(
        new THREE.BoxGeometry(0.016, 0.10, 0.035),
        applyMat(mats.steelChrome)
      );
      lArm.position.y = 0.05;
      leftFinger.add(lArm);

      // Polyurethane rubber contact pad
      const lPad = new THREE.Mesh(
        new THREE.BoxGeometry(0.006, 0.07, 0.028),
        applyMat(mats.rubberPad)
      );
      lPad.position.set(0.01, 0.05, 0);
      leftFinger.add(lPad);
      group.add(leftFinger);

      // Right finger
      const rightFinger = new THREE.Group();
      rightFinger.position.set(0.035, 0.055, 0);

      const rArm = new THREE.Mesh(
        new THREE.BoxGeometry(0.016, 0.10, 0.035),
        applyMat(mats.steelChrome)
      );
      rArm.position.y = 0.05;
      rightFinger.add(rArm);

      const rPad = new THREE.Mesh(
        new THREE.BoxGeometry(0.006, 0.07, 0.028),
        applyMat(mats.rubberPad)
      );
      rPad.position.set(-0.01, 0.05, 0);
      rightFinger.add(rPad);
      group.add(rightFinger);

      group.userData.actuation.leftFinger = leftFinger;
      group.userData.actuation.rightFinger = rightFinger;
      group.userData.actuation.gripperState = 0;
      break;
    }

    // -------------------------------------------------------------------------
    // FIBER LASER WELDER (Tool variant)
    // -------------------------------------------------------------------------
    case 'laser_welder': {
      const body = new THREE.Mesh(
        new THREE.CylinderGeometry(0.05, 0.06, 0.12, 20),
        applyMat(mats.castDark)
      );
      body.position.y = 0.06;
      group.add(body);

      const nozzle = new THREE.Mesh(
        new THREE.ConeGeometry(0.038, 0.09, 16),
        applyMat(mats.brass)
      );
      nozzle.position.y = 0.15;
      group.add(nozzle);

      const beam = new THREE.Mesh(
        new THREE.CylinderGeometry(0.005, 0.005, 0.38, 12),
        applyMat(mats.laserRed)
      );
      beam.position.y = 0.38;
      beam.visible = false;
      group.add(beam);

      const sparkLight = new THREE.PointLight(0x38bdf8, 0, 2);
      sparkLight.position.y = 0.55;
      group.add(sparkLight);

      group.userData.actuation.laserBeam = beam;
      group.userData.actuation.sparkLight = sparkLight;
      group.userData.actuation.isWelding = false;
      break;
    }

    // -------------------------------------------------------------------------
    // ROVER CHASSIS (Mobile platform)
    // -------------------------------------------------------------------------
    case 'rover_chassis': {
      const plate = new THREE.Mesh(
        new THREE.BoxGeometry(0.56, 0.10, 0.86),
        applyMat(mats.hull)
      );
      plate.position.y = 0.20;
      plate.castShadow = !isGhost;
      group.add(plate);

      const ring = new THREE.Mesh(
        new THREE.CylinderGeometry(0.19, 0.21, 0.04, 24),
        applyMat(mats.castDark)
      );
      ring.position.set(0, 0.30, 0);
      group.add(ring);

      const wheels = [];
      const wheelPos = [
        [-0.34, 0.15, 0.28],
        [0.34, 0.15, 0.28],
        [-0.34, 0.15, -0.28],
        [0.34, 0.15, -0.28]
      ];

      wheelPos.forEach(pos => {
        const wGroup = new THREE.Group();
        wGroup.position.set(pos[0], pos[1], pos[2]);

        const tire = new THREE.Mesh(
          new THREE.CylinderGeometry(0.14, 0.14, 0.09, 20),
          applyMat(mats.rubberPad)
        );
        tire.rotation.z = Math.PI / 2;
        wGroup.add(tire);

        const hub = new THREE.Mesh(
          new THREE.CylinderGeometry(0.07, 0.07, 0.10, 16),
          applyMat(mats.steelChrome)
        );
        hub.rotation.z = Math.PI / 2;
        wGroup.add(hub);

        group.add(wGroup);
        wheels.push(wGroup);
      });

      group.userData.actuation.wheels = wheels;
      break;
    }

    default:
      return createGenericPlaceholder(partId);
  }

  createSocketVisualizers(group);
  return group;
}

function createSocketVisualizers(partGroup) {
  const sockets = partGroup.userData.snapSockets || [];
  const markersGroup = new THREE.Group();
  markersGroup.name = 'SocketMarkersGroup';
  markersGroup.visible = false;

  sockets.forEach((socket, index) => {
    const marker = new THREE.Group();
    marker.name = `SocketMarker_${socket.id}`;
    marker.position.copy(socket.offset);

    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(0.05, 0.006, 10, 20),
      new THREE.MeshBasicMaterial({ color: 0x22c55e, transparent: true, opacity: 0.85 })
    );
    ring.rotation.x = Math.PI / 2;
    marker.add(ring);

    const dot = new THREE.Mesh(
      new THREE.SphereGeometry(0.014, 10, 10),
      new THREE.MeshBasicMaterial({ color: 0x38bdf8 })
    );
    marker.add(dot);

    marker.userData = { socketId: socket.id, socketIndex: index, socketRef: socket };
    markersGroup.add(marker);
  });

  partGroup.add(markersGroup);
  partGroup.userData.socketMarkers = markersGroup;
}

function createGenericPlaceholder(partId) {
  const group = new THREE.Group();
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.15, 0.15), new THREE.MeshStandardMaterial({ color: 0x64748b }));
  mesh.position.y = 0.075;
  group.add(mesh);
  group.userData = { partId, name: partId, snapSockets: [] };
  return group;
}
