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
        specs: 'Mass: 28 kg | Cast Steel | 6 x M20 Anchor Bolt Lugs',
        voiceScript: 'This is the Robot base mounting pedestal. It is made of cast steel for maximum rigidity. It is used as the foundational anchor, fixed to the table or floor to prevent vibrational resonance. It contains the main rotational mechanism but the base itself does not move, so no joints are needed. This is usually available readymade. Now, please place the pedestal on the workspace.'
      },
      {
        stepIndex: 2,
        partId: 'joint_j1',
        title: 'Step 2: Install J1 Base Rotary Axis (Harmonic Turntable)',
        parentSocketId: 'base_flange',
        targetDesc: 'Mount the J1 turntable actuator onto the top flange of the pedestal base.',
        theoryTitle: 'Robotics Theory: J1 Harmonic Drive Gearing',
        theoryText: 'Joint 1 provides 360° azimuthal rotation. Factory robots employ strain-wave (harmonic) gearboxes offering high reduction ratios (100:1) with virtually zero backlash in a compact pancake profile.',
        specs: 'Axis: Y (Yaw) | Range: ±180° | Finned AC Servo Motor',
        voiceScript: 'Next is the J1 Base rotary joint. It is made of a high-strength alloy case with internal steel gears. It is used to rotate the entire arm around the vertical axis. It will actively move, as it contains a servo motor and a strain-wave gearbox reducer. This is a readymade precision component. Now, please snap it onto the base.'
      },
      {
        stepIndex: 3,
        partId: 'link_1',
        title: 'Step 3: Fasten Link 1 Shoulder Cast Housing',
        parentSocketId: 'j1_output',
        targetDesc: 'Bolt the cast-aluminum shoulder turntable bracket onto the J1 output flange.',
        theoryTitle: 'Robotics Theory: Structural Casting & Bearing Trunnions',
        theoryText: 'Link 1 rotates with J1 and provides dual trunnion ears with cross-roller bearing seats to support the orthogonal J2 shoulder pivot axle under massive overturning moments.',
        specs: 'Mass: 11.2 kg | Cast Aluminum A356 | Dual Trunnion Ears',
        voiceScript: 'This is the lower arm structural link, often called the shoulder bracket. It is custom cast from aluminum to save weight while maintaining stiffness. It is used to connect the base joint to the shoulder joint. It is a rigid link that does not move on its own and requires no internal joints. Now, please fasten it to the J1 joint.'
      },
      {
        stepIndex: 4,
        partId: 'joint_j2',
        title: 'Step 4: Install J2 Shoulder Servo Actuator',
        parentSocketId: 'j2_trunnion',
        targetDesc: 'Mount the J2 shoulder pitch actuator between the Link 1 trunnion ears.',
        theoryTitle: 'Robotics Theory: Shoulder Moment & Gravity Load',
        theoryText: 'The shoulder joint carries the largest dynamic load in a serial arm ($M = F \\times d$). Heavy preloaded bearings and an electromechanical holding brake prevent arm drop during power shutdown.',
        specs: 'Axis: X (Pitch) | Range: -100° to +135° | Holding Brake',
        voiceScript: 'Here is the J2 Shoulder joint. It features an aluminium housing and steel planetary gears. It is used to move the arm forward and backward vertically, carrying the heaviest dynamic load. It actively moves using a powerful servo motor, precision reducer, and internal motor brake. This is available readymade. Now, mount the shoulder joint.'
      },
      {
        stepIndex: 5,
        partId: 'link_2',
        title: 'Step 5: Connect Link 2 Upper-Arm Structural Boom (55cm)',
        parentSocketId: 'j2_output',
        targetDesc: 'Snap the slender cast/extruded aluminum boom into the J2 output flange.',
        theoryTitle: 'Robotics Theory: Minimizing Link Inertia ($I = mr^2$)',
        theoryText: 'Slender tapered boom geometry with structural stiffening ribs keeps mass low while resisting torsional bending. External harness clips route cables neatly alongside the arm.',
        specs: 'Length: 550 mm | Stiffening Ribs | External Harness Clips',
        voiceScript: 'This is the upper arm link, connecting the shoulder to the elbow. It is made of a custom extruded aluminium boom. It is used to provide reach while minimizing inertia with slender tapered geometry. It is a fixed physical structure that does not move on its own and has no joints. Now, attach the upper arm boom.'
      },
      {
        stepIndex: 6,
        partId: 'joint_j3',
        title: 'Step 6: Install J3 Elbow Servo Joint',
        parentSocketId: 'j3_clevis',
        targetDesc: 'Mount the J3 elbow pitch actuator into the clevis at the top of Link 2.',
        theoryTitle: 'Robotics Theory: Elbow Kinematics & Reach Envelope',
        theoryText: 'Joint 3 (Elbow) cooperates with Joint 2 (Shoulder) to position the wrist anywhere within the vertical sagittal plane, defining the primary reachable spherical workspace envelope.',
        specs: 'Axis: X (Pitch) | Range: ±135° | Integrated Planetary Reducer',
        voiceScript: 'Next is the J3 Elbow joint. Constructed from a durable metallic housing, it contains an integrated servo and gearbox assembly. It is used to bend the arm, defining the primary reachable workspace envelope. It actively moves to lift the forearm. This is a readymade component. Now, please install the elbow joint.'
      },
      {
        stepIndex: 7,
        partId: 'link_3',
        title: 'Step 7: Attach Link 3 Forearm Structural Link (42cm)',
        parentSocketId: 'j3_output',
        targetDesc: 'Mount the tapered cast aluminum forearm link onto the J3 elbow output flange.',
        theoryTitle: 'Robotics Theory: Forearm Stress Distribution & Cabling',
        theoryText: 'A tapered hollow cross-section distributes bending stresses uniformly along the arm. An inspection service window allows technician access to the internal harness routing.',
        specs: 'Length: 420 mm | Bolted Service Window | Corrugated Conduit',
        voiceScript: 'This is the forearm link, the long rigid structure between the elbow and the wrist. It is made of cast aluminum alloy. It is used to extend the reach of the robot and safely route cables internally. It is a fixed, non-moving part that requires no internal joints and is often custom cast for the specific robot. Please mount the forearm.'
      },
      {
        stepIndex: 8,
        partId: 'joint_j4',
        title: 'Step 8: Mount J4 Wrist Roll Rotary Axis',
        parentSocketId: 'j4_flange',
        targetDesc: 'Fasten the in-line J4 wrist roll actuator to the distal end of the forearm link.',
        theoryTitle: 'Robotics Theory: Spherical Wrist - First Euler Angle',
        theoryText: 'Joint 4 introduces in-line continuous roll along the forearm axis, representing the first rotational degree of freedom in a traditional 3-axis spherical wrist assembly.',
        specs: 'Axis: Y (Roll) | Range: ±180° | In-line Angular Contact Bearings',
        voiceScript: 'Here is the J4 Wrist rotation joint. It features steel bearings and a compact servo housing. It is used to rotate the forearm and wrist along its own axis. This is an active joint that provides the first roll movement in the wrist assembly. It is available readymade. Please fasten the wrist roll joint.'
      },
      {
        stepIndex: 9,
        partId: 'joint_j5',
        title: 'Step 9: Fasten J5 Wrist Pitch/Tilt Axis',
        parentSocketId: 'j4_output',
        targetDesc: 'Mount the orthogonal J5 pitch knuckle onto the J4 roll output.',
        theoryTitle: 'Robotics Theory: Orthogonal Knuckle Pitch',
        theoryText: 'Joint 5 pivots orthogonally to J4, providing pitch/tilt articulation to align the tool head with complex 3D surface contours and part normals.',
        specs: 'Axis: X (Pitch) | Range: ±120° | Miniature Harmonic Reducer',
        voiceScript: 'This is the J5 Wrist pitch or bend joint. Made with a miniature harmonic reducer and aluminum knuckle, it is used to tilt the wrist up and down. It actively moves to orient the tool towards the work surface. This is a standard readymade joint. Mount it to the wrist assembly now.'
      },
      {
        stepIndex: 10,
        partId: 'joint_j6',
        title: 'Step 10: Mount J6 Wrist Tool Roll Axis',
        parentSocketId: 'j5_output',
        targetDesc: 'Install the J6 tool roll spindle onto the J5 knuckle output.',
        theoryTitle: 'Robotics Theory: Tool Center Point (TCP) Continuous Rotation',
        theoryText: 'Joint 6 provides continuous high-speed rotary spindle motion, allowing the end-effector to rotate screws, dispense adhesive, or orient parts during pick-and-place cycles.',
        specs: 'Axis: Y (Tool Roll) | Range: Continuous (±360°) | High-Res Resolver',
        voiceScript: 'Next is the J6 Wrist tool roll joint, the final rotational axis. It contains a high-speed servo spindle. It is used for continuous rotation of the tool head, perfect for turning screws or orienting parts. It is a highly active readymade joint. Connect the high-speed spindle to the wrist now.'
      },
      {
        stepIndex: 11,
        partId: 'tool_flange',
        title: 'Step 11: Install Standard ISO 9409-1 Tool Flange',
        parentSocketId: 'j6_output',
        targetDesc: 'Bolt the precision circular ISO tool mounting flange onto the J6 spindle.',
        theoryTitle: 'Robotics Theory: ISO 9409-1 Standard Mechanical Interface',
        theoryText: 'The ISO 9409-1 standard defines circular tool flanges with standardized bolt circle diameters (PCD), pilot spigots, and locating dowel pins so any gripper or torch can be swapped instantly.',
        specs: 'Standard: ISO 9409-1-50-4-M6 | Pilot Spigot | Dowel Pin Hole',
        voiceScript: 'This is the Tool flange, or end-effector mounting plate. It is made of machined precision steel. It is used as the standard interface at the end of the robot to attach tools. It is a fixed, non-moving physical plate with locating dowel pins, and is available readymade following ISO standards. Please install the tool flange.'
      },
      {
        stepIndex: 12,
        partId: 'end_effector_gripper',
        title: 'Step 12: Attach Industrial Two-Finger Parallel Gripper',
        parentSocketId: 'tool_mount',
        targetDesc: 'Fasten the pneumatic parallel gripper to the ISO tool mounting flange.',
        theoryTitle: 'Robotics Theory: Parallel Slide Force-Controlled Grasping',
        theoryText: 'Pneumatic parallel grippers utilize ground linear guide rods and dual pistons to synchronize finger closing, distributing clamping pressure evenly across delicate workpieces.',
        specs: 'Stroke: 40 mm | Guide: Ground Chrome Rods | Polyurethane Pads',
        voiceScript: 'Finally, the End effector. This is a two-finger parallel gripper. It is made of an aluminum body with polyurethane pads. It is used to physically grasp and manipulate objects. It contains a pneumatic slide mechanism to open and close, making it an active component. Grippers are widely available readymade. Please attach the gripper to complete the robot.'
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
        specs: 'Wheelbase: 560 mm | Suspension: 4 Independent Struts',
        voiceScript: 'This is the Mecanum Mobile Chassis. It is made of CNC-machined aluminum. It is used to provide holonomic motion, allowing the robot to move in any direction. This is an active component with four independent drive pods. Please position it on the workspace floor.'
      },
      {
        stepIndex: 2,
        partId: 'joint_j1',
        title: 'Step 2: Mount Turret Swivel Joint',
        parentSocketId: 'center_mount',
        targetDesc: 'Fasten the rotary yaw joint onto the center deck socket.',
        theoryTitle: 'Robotics Theory: Decoupled Active Perception',
        theoryText: 'An independent pan-axis turret allows sensors to track dynamic targets or inspect waypoints while the vehicle navigates along an entirely different heading trajectory.',
        specs: 'Speed: 180°/sec | Slip Ring Power Pass-through',
        voiceScript: 'This is the rotary yaw joint or turret swivel. It allows sensors or arms to track targets independently from the vehicles heading. It is a readymade active servo joint. Fasten it onto the center deck socket.'
      },
      {
        stepIndex: 3,
        partId: 'link_1',
        title: 'Step 3: Connect Sensor Mast Bracket',
        parentSocketId: 'j1_output',
        targetDesc: 'Attach the structural bracket to the swivel joint.',
        theoryTitle: 'Robotics Theory: Elevated Sensor Vantage Point',
        theoryText: 'Elevating perception sensors above the vehicle deck prevents wheel occlusion and widens the field of view over obstacles.',
        specs: 'Rigid Bracket | Lightweight',
        voiceScript: 'This is a structural sensor mast bracket. It is made of lightweight rigid aluminum. It is used to elevate sensors above the vehicle deck to widen the field of view. It is a fixed, non-moving part. Attach it to the swivel joint.'
      },
      {
        stepIndex: 4,
        partId: 'tool_flange',
        title: 'Step 4: Install ISO Sensor Adapter Plate',
        parentSocketId: 'j2_trunnion',
        targetDesc: 'Mount the standard adapter plate.',
        theoryTitle: 'Robotics Theory: Modular Sensor Payloads',
        theoryText: 'Standardized mounting interfaces allow rapid payload reconfiguration between inspection cameras, ultrasonic sensors, and manipulators.',
        specs: 'ISO Circular Interface',
        voiceScript: 'This is the ISO sensor adapter plate. It provides a standardized mounting interface for rapid payload swapping. It is a fixed, readymade interface plate. Mount it to the bracket now.'
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
        specs: 'Payload Capacity: 50 kg | Floor Tracking',
        voiceScript: 'This is the heavy mobility chassis. It is used to expand the robots reachable workspace to the entire factory floor. It is an active mobile base. Place it on the workspace.'
      },
      {
        stepIndex: 2,
        partId: 'joint_j1',
        title: 'Step 2: Fasten Arm Turntable Swivel',
        parentSocketId: 'center_mount',
        targetDesc: 'Mount the harmonic turntable to the center chassis turret.',
        theoryTitle: 'Robotics Theory: Coordinated Base-Arm Motion',
        theoryText: 'Redundant kinematics algorithms drive the mobile chassis and arm joints simultaneously to optimize laser focal distance and torch angle along complex weld seams.',
        specs: '100:1 Harmonic Reduction | High Overturning Moment',
        voiceScript: 'Here is the arm turntable swivel. It coordinates with the mobile base to optimize welding trajectories. It is an active servo joint. Fasten it to the chassis.'
      },
      {
        stepIndex: 3,
        partId: 'link_1',
        title: 'Step 3: Connect Link 1 Shoulder Bracket',
        parentSocketId: 'j1_output',
        targetDesc: 'Attach the structural shoulder housing.',
        theoryTitle: 'Robotics Theory: Cantilever Acceleration Compensation',
        theoryText: 'When driving over floor seams, vehicle vibrations are actively cancelled by counter-phase arm joint servo adjustments.',
        specs: 'Cast Aluminum A356',
        voiceScript: 'This is the shoulder bracket. It is a rigid cast aluminum housing that supports the arm. It does not move on its own. Connect it to the turntable.'
      },
      {
        stepIndex: 4,
        partId: 'joint_j2',
        title: 'Step 4: Install J2 Shoulder Servo Actuator',
        parentSocketId: 'j2_trunnion',
        targetDesc: 'Mount the shoulder pitch joint.',
        theoryTitle: 'Robotics Theory: Shoulder Torque Balancing',
        theoryText: 'High reduction harmonic drives handle heavy tool loads during high-speed mobile maneuvers.',
        specs: 'Axis: X (Pitch) | Preloaded Cross-Roller Bearing',
        voiceScript: 'This is the shoulder pitch joint. It handles heavy tool loads using a preloaded cross-roller bearing. It is an active readymade joint. Install it now.'
      },
      {
        stepIndex: 5,
        partId: 'link_2',
        title: 'Step 5: Connect Link 2 Upper-Arm Boom',
        parentSocketId: 'j2_output',
        targetDesc: 'Attach the structural boom to elevate welding reach.',
        theoryTitle: 'Robotics Theory: Thermal Stability in Laser Processing',
        theoryText: 'Stiff aluminium structure maintains torch tip positioning accuracy even when welding generates ambient heat gradients.',
        specs: 'Length: 550 mm | Stiffening Ribs',
        voiceScript: 'This is the upper arm boom. It provides thermal stability and stiffness during laser processing. It is a fixed structural link. Connect it to the shoulder.'
      },
      {
        stepIndex: 6,
        partId: 'joint_j3',
        title: 'Step 6: Install J3 Elbow Joint',
        parentSocketId: 'j3_clevis',
        targetDesc: 'Fasten the elbow joint at the end of the boom.',
        theoryTitle: 'Robotics Theory: Singularity Avoidance',
        theoryText: 'Kinematic controllers maintain elbow joint angles away from 0° and 180° boundaries, preventing loss of degrees of freedom.',
        specs: 'Planetary-Harmonic Drive',
        voiceScript: 'This is the elbow joint. It is an active planetary-harmonic drive used to adjust the arms reach while avoiding singularities. Install it at the end of the boom.'
      },
      {
        stepIndex: 7,
        partId: 'link_3',
        title: 'Step 7: Attach Link 3 Forearm',
        parentSocketId: 'j3_output',
        targetDesc: 'Mount the forearm link.',
        theoryTitle: 'Robotics Theory: Shielding Gas Routing',
        theoryText: 'Coaxial channels carry shielding gas (argon/CO2) and cooling water lines directly to the torch head.',
        specs: 'Aluminium Alloy 7075-T6',
        voiceScript: 'This is the forearm link. It is an aluminum alloy structure that safely routes shielding gas and cooling lines internally. It is a fixed part. Attach it to the elbow.'
      },
      {
        stepIndex: 8,
        partId: 'joint_j4',
        title: 'Step 8: Connect J4 Wrist Roll Axis',
        parentSocketId: 'j4_flange',
        targetDesc: 'Mount the in-line wrist roll actuator.',
        theoryTitle: 'Robotics Theory: In-line Tool Roll',
        theoryText: 'J4 aligns the wrist orientation with the seam vector.',
        specs: 'In-line Roll',
        voiceScript: 'This is the wrist roll axis. It actively aligns the wrist orientation with the weld seam vector. It is a readymade servo joint. Connect it to the forearm.'
      },
      {
        stepIndex: 9,
        partId: 'joint_j5',
        title: 'Step 9: Mount J5 Wrist Pitch Knuckle',
        parentSocketId: 'j4_output',
        targetDesc: 'Install the knuckle pitch joint.',
        theoryTitle: 'Robotics Theory: Torch Lead Angle',
        theoryText: 'Maintains optimal 15° torch push angle along curved seams.',
        specs: 'Orthogonal Pitch',
        voiceScript: 'Here is the wrist pitch knuckle. It actively maintains the optimal torch lead angle along curved seams. Mount it to the wrist roll axis.'
      },
      {
        stepIndex: 10,
        partId: 'joint_j6',
        title: 'Step 10: Mount J6 Tool Roll Spindle',
        parentSocketId: 'j5_output',
        targetDesc: 'Connect the high-speed spindle.',
        theoryTitle: 'Robotics Theory: Continuous Circular Welds',
        theoryText: 'Continuous 360° rotation enables orbital pipe welding without cable twisting.',
        specs: 'Continuous Roll',
        voiceScript: 'This is the tool roll spindle. It provides continuous 360-degree rotation for orbital pipe welding. It is an active readymade joint. Mount it to the knuckle.'
      },
      {
        stepIndex: 11,
        partId: 'tool_flange',
        title: 'Step 11: Install ISO 9409-1 Tool Flange',
        parentSocketId: 'j6_output',
        targetDesc: 'Fasten the ISO adapter plate.',
        theoryTitle: 'Robotics Theory: Standardized Torch Mount',
        theoryText: 'Guarantees repeatable tool center point (TCP) calibration after torch tip replacements.',
        specs: 'ISO Circular Interface',
        voiceScript: 'This is the standard ISO tool flange. It guarantees repeatable calibration when swapping welding torches. It is a fixed interface plate. Install it now.'
      },
      {
        stepIndex: 12,
        partId: 'laser_welder',
        title: 'Step 12: Mount Fiber Laser Arc Welder',
        parentSocketId: 'tool_mount',
        targetDesc: 'Install the fiber laser welding torch on the tool plate.',
        theoryTitle: 'Robotics Theory: Laser Material Melting',
        theoryText: 'A high-energy 1070nm fiber laser beam focuses energy to a 0.3mm spot, instantly melting base metals while coaxial argon gas shields the melt pool from oxidation.',
        specs: 'Laser Power: 350W Equivalent | Focal Length: 150 mm | Copper Tip',
        voiceScript: 'Finally, the fiber laser arc welder. It uses a high-energy laser to melt metals and provides coaxial shielding gas. It is a highly specialized readymade tool. Mount it to complete the workstation.'
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
    this.isSpeaking = false;
    this.mascotMuted = false;

    this.initTargetBeacon();
    this.initMascot();
  }

  initMascot() {
    this.mascotGroup = new THREE.Group();
    this.mascotGroup.name = 'TutorialMascot';
    this.mascotGroup.position.set(-1.0, 0.91, -1.2); 
    this.mascotGroup.rotation.y = Math.PI / 4; 

    const bodyMat = new THREE.MeshStandardMaterial({ color: 0xe0e0e0, roughness: 0.7 });
    const eyeMat = new THREE.MeshBasicMaterial({ color: 0x111111 });

    // Base
    const base = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.1, 0.4), bodyMat);
    base.position.y = 0.05;
    this.mascotGroup.add(base);

    // Body
    const body = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.4, 0.2), bodyMat);
    body.position.y = 0.3;
    this.mascotGroup.add(body);

    // Head
    const head = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.25, 0.2), bodyMat);
    head.position.y = 0.7;
    this.mascotGroup.add(head);

    // Eyes
    const leftEye = new THREE.Mesh(new THREE.SphereGeometry(0.04, 16, 16), eyeMat);
    leftEye.position.set(-0.06, 0.7, 0.1);
    this.mascotGroup.add(leftEye);

    const rightEye = new THREE.Mesh(new THREE.SphereGeometry(0.04, 16, 16), eyeMat);
    rightEye.position.set(0.06, 0.7, 0.1);
    this.mascotGroup.add(rightEye);

    // Antenna
    const antenna = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.1), bodyMat);
    antenna.position.set(0, 0.85, 0);
    this.mascotGroup.add(antenna);

    this.scene.add(this.mascotGroup);
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
    if (!step || this.isCompleted || this.isSpeaking) {
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

    if (this.mascotGroup) {
      if (this.isSpeaking) {
        // Bob up and down and rotate head slightly
        this.mascotGroup.position.y = 0.91 + Math.sin(Date.now() * 0.01) * 0.02;
        const head = this.mascotGroup.children[2];
        const leftEye = this.mascotGroup.children[3];
        const rightEye = this.mascotGroup.children[4];
        const antenna = this.mascotGroup.children[5];
        
        const headRot = Math.sin(Date.now() * 0.005) * 0.1;
        if (head) head.rotation.y = headRot;
        
        // Eyes and antenna don't automatically rotate with head since they are siblings, 
        // we can just put them in a headGroup to make it easier, but manual rotation is fine for a quick fix.
        // Actually, let's just let the head rotate, it's a robotic look if eyes stay still, or I'll just group them.
        // For simplicity, let's just bob the whole group.
        this.mascotGroup.rotation.y = (Math.PI / 4) + headRot;
      } else {
        this.mascotGroup.position.y = 0.91;
        this.mascotGroup.rotation.y = Math.PI / 4;
      }
    }
  }

  speakScript(scriptText) {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel(); // Stop any ongoing speech

    if (!scriptText || this.mascotMuted) {
      this.isSpeaking = false;
      this.updateUIState();
      return;
    }

    this.isSpeaking = true;
    this.updateUIState();

    const utterance = new SpeechSynthesisUtterance(scriptText);
    utterance.rate = 0.95;
    utterance.pitch = 1.1; 
    
    utterance.onend = () => {
      this.isSpeaking = false;
      this.updateUIState();
    };

    utterance.onerror = () => {
      this.isSpeaking = false;
      this.updateUIState();
    };

    window.speechSynthesis.speak(utterance);
  }

  updateUIState() {
    const snapBtn = document.getElementById('btn-tut-snap-step');
    if (snapBtn) {
      if (this.isSpeaking) {
        snapBtn.disabled = true;
        snapBtn.style.opacity = '0.5';
        snapBtn.style.cursor = 'not-allowed';
        snapBtn.innerHTML = '<span>🔊 Mascot is speaking...</span>';
      } else {
        snapBtn.disabled = false;
        snapBtn.style.opacity = '1.0';
        snapBtn.style.cursor = 'pointer';
        snapBtn.innerHTML = `
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M5 12h14"></path>
            <path d="M12 5l7 7-7 7"></path>
          </svg>
          <span>Snap Next Component</span>
        `;
      }
    }
    this.updateTargetBeacon();
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
        <div class="tut-step-actions" style="margin-top: 8px;">
          <button type="button" class="tut-reset-btn" id="btn-tut-mute-mascot" style="width: 100%; border: 1px solid rgba(255,255,255,0.1);">
            <span>${this.mascotMuted ? '🔊 Enable Mascot Voice' : '🔇 Stop Mascot Voice'}</span>
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

    document.getElementById('btn-tut-mute-mascot')?.addEventListener('click', () => {
      this.mascotMuted = !this.mascotMuted;
      if (this.mascotMuted) {
        window.speechSynthesis.cancel();
        this.isSpeaking = false;
        this.updateUIState();
      } else {
        const currentStep = this.getCurrentStep();
        if (currentStep && currentStep.voiceScript) {
          this.speakScript(currentStep.voiceScript);
        }
      }
      this.renderCurrentStepUI();
    });

    if (currentStep && currentStep.voiceScript) {
      this.speakScript(currentStep.voiceScript);
    } else {
      this.speakScript('');
    }
  }
}
