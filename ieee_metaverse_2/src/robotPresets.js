import * as THREE from 'three';
import { createPartMesh, ROBOT_PARTS_CATALOG } from './robotParts.js';
import { loadExplodedNode, cleanupExplodedNode } from './explodedNode.js';

/**
 * Pre-assembled Robotics Showcases & Templates.
 */
export function loadRobotPreset(presetId, dragDropSystem) {
  // Clear any existing assembly
  dragDropSystem.clearAssembly();
  cleanupExplodedNode();

  switch (presetId) {
    // -------------------------------------------------------------------------
    // 1. 12-PART DISCRETE 6-AXIS INDUSTRIAL ROBOTIC ARM
    // Base -> J1 -> Link 1 -> J2 -> Link 2 -> J3 -> Link 3 -> J4 -> J5 -> J6 -> ISO Flange -> Gripper
    // -------------------------------------------------------------------------
    case 'industrial_arm': {
      // 1. Rigid Robot Mounting Pedestal at center
      const base = createPartMesh('robot_base', { theme: dragDropSystem.currentTheme });
      base.position.set(0, 1.01, 0);
      dragDropSystem.scene.add(base);
      dragDropSystem.placedParts.push(base);
      dragDropSystem.robotRoots.push(base);

      // 2. J1 Base Rotary Axis
      const j1 = attachChildPart(base, 'base_flange', 'joint_j1', dragDropSystem);

      // 3. Link 1 Shoulder Cast Housing
      const link1 = attachChildPart(j1, 'j1_output', 'link_1', dragDropSystem);

      // 4. J2 Shoulder Servo Actuator
      const j2 = attachChildPart(link1, 'j2_trunnion', 'joint_j2', dragDropSystem);

      // 5. Link 2 Upper-Arm Structural Boom (55cm)
      const link2 = attachChildPart(j2, 'j2_output', 'link_2', dragDropSystem);

      // 6. J3 Elbow Servo Joint
      const j3 = attachChildPart(link2, 'j3_clevis', 'joint_j3', dragDropSystem);

      // 7. Link 3 Forearm Structural Link (42cm)
      const link3 = attachChildPart(j3, 'j3_output', 'link_3', dragDropSystem);

      // 8. J4 Wrist Roll Rotary Axis
      const j4 = attachChildPart(link3, 'j4_flange', 'joint_j4', dragDropSystem);

      // 9. J5 Wrist Pitch/Tilt Axis
      const j5 = attachChildPart(j4, 'j4_output', 'joint_j5', dragDropSystem);

      // 10. J6 Wrist Tool Roll Axis
      const j6 = attachChildPart(j5, 'j5_output', 'joint_j6', dragDropSystem);

      // 11. Standard ISO 9409-1 Tool Mounting Flange
      const flange = attachChildPart(j6, 'j6_output', 'tool_flange', dragDropSystem);

      // 12. Industrial Two-Finger Parallel Gripper
      attachChildPart(flange, 'tool_mount', 'end_effector_gripper', dragDropSystem);

      dragDropSystem.selectPart(base);
      dragDropSystem.showToast('Loaded: 12-Part Discrete 6-Axis Industrial Manipulator', 'success');
      break;
    }

    // -------------------------------------------------------------------------
    // 2. AUTONOMOUS MOBILE INSPECTION ROVER
    // -------------------------------------------------------------------------
    case 'mobile_rover': {
      const rover = createPartMesh('rover_chassis', { theme: dragDropSystem.currentTheme });
      rover.position.set(0, 1.01, 0);
      dragDropSystem.scene.add(rover);
      dragDropSystem.placedParts.push(rover);
      dragDropSystem.robotRoots.push(rover);

      // Center turret J1
      const j1 = attachChildPart(rover, 'center_mount', 'joint_j1', dragDropSystem);
      const link1 = attachChildPart(j1, 'j1_output', 'link_1', dragDropSystem);
      const j2 = attachChildPart(link1, 'j2_trunnion', 'joint_j2', dragDropSystem);
      const link2 = attachChildPart(j2, 'j2_output', 'link_2', dragDropSystem);
      const j3 = attachChildPart(link2, 'j3_clevis', 'joint_j3', dragDropSystem);
      const link3 = attachChildPart(j3, 'j3_output', 'link_3', dragDropSystem);
      const j4 = attachChildPart(link3, 'j4_flange', 'joint_j4', dragDropSystem);
      const j5 = attachChildPart(j4, 'j4_output', 'joint_j5', dragDropSystem);
      const j6 = attachChildPart(j5, 'j5_output', 'joint_j6', dragDropSystem);
      const flange = attachChildPart(j6, 'j6_output', 'tool_flange', dragDropSystem);
      attachChildPart(flange, 'tool_mount', 'end_effector_gripper', dragDropSystem);

      dragDropSystem.selectPart(rover);
      dragDropSystem.showToast('Loaded: Mobile Robot with 6-Axis Manipulator', 'success');
      break;
    }

    // -------------------------------------------------------------------------
    // 3. MOBILE MANIPULATOR WITH LASER WELDER
    // -------------------------------------------------------------------------
    case 'mobile_manipulator': {
      const rover = createPartMesh('rover_chassis', { theme: dragDropSystem.currentTheme });
      rover.position.set(0, 1.01, 0);
      dragDropSystem.scene.add(rover);
      dragDropSystem.placedParts.push(rover);
      dragDropSystem.robotRoots.push(rover);

      const j1 = attachChildPart(rover, 'center_mount', 'joint_j1', dragDropSystem);
      const link1 = attachChildPart(j1, 'j1_output', 'link_1', dragDropSystem);
      const j2 = attachChildPart(link1, 'j2_trunnion', 'joint_j2', dragDropSystem);
      const link2 = attachChildPart(j2, 'j2_output', 'link_2', dragDropSystem);
      const j3 = attachChildPart(link2, 'j3_clevis', 'joint_j3', dragDropSystem);
      const link3 = attachChildPart(j3, 'j3_output', 'link_3', dragDropSystem);
      const j4 = attachChildPart(link3, 'j4_flange', 'joint_j4', dragDropSystem);
      const j5 = attachChildPart(j4, 'j4_output', 'joint_j5', dragDropSystem);
      const j6 = attachChildPart(j5, 'j5_output', 'joint_j6', dragDropSystem);
      const flange = attachChildPart(j6, 'j6_output', 'tool_flange', dragDropSystem);
      attachChildPart(flange, 'tool_mount', 'laser_welder', dragDropSystem);

      dragDropSystem.selectPart(rover);
      dragDropSystem.showToast('Loaded: Mobile Manipulator Laser Workstation', 'success');
      break;
    }

    case 'exploded_node': {
      loadExplodedNode(dragDropSystem);
      break;
    }

    case 'clear':
    default:
      dragDropSystem.clearAssembly();
      break;
  }

  if (dragDropSystem.onAssemblyChanged) {
    dragDropSystem.onAssemblyChanged(dragDropSystem.getRobotSummary());
  }
}

/**
 * Helper to snap and attach a child part to a specific parent socket.
 */
function attachChildPart(parentPart, socketId, childPartId, dragDropSystem) {
  const socket = (parentPart.userData.snapSockets || []).find(s => s.id === socketId);
  if (!socket) {
    console.warn(`Socket "${socketId}" not found on parent "${parentPart.userData.partId}"`);
    return null;
  }

  const childMesh = createPartMesh(childPartId, { theme: dragDropSystem.currentTheme });

  // Calculate socket world transform
  const worldPos = new THREE.Vector3();
  const worldQuat = new THREE.Quaternion();
  parentPart.localToWorld(worldPos.copy(socket.offset));
  parentPart.getWorldQuaternion(worldQuat);

  childMesh.position.copy(worldPos);
  childMesh.quaternion.copy(worldQuat);

  // Link in hierarchy
  socket.occupiedBy = childMesh;
  childMesh.userData.parentPart = parentPart;
  childMesh.userData.parentSocket = socket;

  if (!parentPart.userData.childrenParts) parentPart.userData.childrenParts = [];
  parentPart.userData.childrenParts.push(childMesh);

  const attachNode = parentPart.userData.actuation?.revoluteNode ||
                     parentPart.userData.actuation?.prismaticNode ||
                     parentPart;

  dragDropSystem.scene.add(childMesh);
  attachNode.attach(childMesh);

  dragDropSystem.placedParts.push(childMesh);
  return childMesh;
}
