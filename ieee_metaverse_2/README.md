# Smart Classroom: Robotics Lab 
**AI-Powered Adaptive Learning Environment**

An interactive, web-based 3D Virtual Robotics Laboratory developed for the **IEEE Educational Metaverse Challenge**. 

This application focuses on "Advanced Learning in an Educational Environment" by simulating AI-driven personalization and adaptive learning systems. It allows students to explore smart classroom concepts and immersive collaboration spaces by assembling, testing, and simulating custom robotic systems in real-time.

---

## 🌟 Key Features

### 1. 🎓 AI-Driven Personalized Instruction (Adaptive Tutorial)
- **Dedicated Tutorial Mode**: Acts as an automated AI instructional tool, guiding students through hands-on robotics assembly curriculums.
- **Adaptive Guidance**: Real-time holographic guide beacons show where components should snap together, preventing invalid connections and providing immediate feedback.
- **In-Depth Theory**: Connects practical assembly with engineering theory, explaining concepts like Degrees of Freedom, SLAM LiDAR point clouds, and kinematics.
- **Mascot Voice Assistant**: Features an animated 3D mascot that provides spoken instructions, including a toggle to mute/stop the voice for learning at your own pace.

### 2. 🛠️ Immersive Smart Workspace (Build Mode)
- **Procedural 3D Models**: All robotic components are highly detailed, industrial-grade 3D meshes procedurally generated in code (`robotParts.js`), eliminating the need for external `.glb` files and drastically improving browser performance for inclusive accessibility.
- **Magnetic Snap Points & Validation**: Drag components from the sidebar catalog onto the 3D workspace. Compatible connection sockets automatically orient and snap to incoming parts. Invalid connection attempts are explicitly rejected with a red visual flash and a detailed error message explaining what component category is expected.
- **Real-Time Diagnostics HUD**: The system tracks the physical properties of the assembled robot (Mass, Power Draw, Degrees of Freedom) as an adaptive learning metric.
- **Dynamic Color Themes**: Real-time material styling including *Cyber Slate*, *KUKA Orange*, *Cleanroom White*, *Stealth Black*, and *Fanuc Yellow*.

### 3. ⚡ Physics & Motion Simulator
- **Seamless Mode Switcher**: Toggle smoothly between **SMART WORKSPACE** and **SIMULATION**.
- **🎤 AI Voice Assistant**: A built-in natural language voice control system (powered by the Web Speech API). Click the microphone in the HUD and speak commands to actuate the robot in real-time.
  - **Automated Work Cycles**: "Pick and place", "Demo", "Weld", "Home", "Reset"
  - **Tool Control**: "Open gripper", "Close", "Release", "Grab", "Pinch"
  - **Manual Joint Jogging**: "Turn left", "Rotate right", "Raise", "Lower", "Extend", "Retract", "Counter"
  - Unrecognized commands provide immediate feedback via yellow warning toasts (e.g. *"Voice command not recognized: 'make a sandwich'"*).
- **Forward Kinematics (FK) Sliders**: Automatically discovers all active joints in the robot and generates interactive angle sliders. Sliders stay perfectly in sync when voice commands are used.
- **⌨️ Keyboard Controls**: Users can manually drive the arm joints using keyboard bindings (`I`, `K`, `J`, `L`, `U`, `O`) or drive mobile bases with `WASD` / Arrow keys.
- **Actuated Tool Operations**: Grippers clamp, LiDAR domes spin, and laser welders emit dynamic sparks.

### 4. 📊 3D Schematics & Blueprint Gallery
- High-tech holographic dialog displaying 3D exploded view blueprints, kinematic chain schematics, and sensor integration diagrams directly in the smart classroom.
- **Snapshot Export**: Captures the current 3D viewport at full resolution and downloads a clean PNG screenshot.

---

## 🎮 Navigation & Controls

| Action | Control |
| :--- | :--- |
| **Orbit / Rotate View** | Left Click + Drag |
| **Pan Camera** | Right Click + Drag |
| **Zoom In / Out** | Mouse Wheel Scroll |
| **Drive Mobile Rover** | `W` (Forward), `S` (Reverse), `A` (Turn Left), `D` (Turn Right) or On-screen D-Pad |
| **Select Component** | Left Click on any placed robotic part |
| **Focus Workspace** | Click **Focus** in the top navigation bar |

---

## 🛠️ Technology Stack

- **Core Rendering**: [Three.js](https://threejs.org/) (r170) with WebGL, PBR materials, ACES Filmic Tone Mapping, and PCF Soft Shadows.
- **Build Tool & Dev Server**: [Vite](https://vitejs.dev/) 5.4.
- **UI & Styling**: Vanilla CSS with glassmorphic aesthetics, cyberpunk accents, and responsive layout.

---

## 📦 Project Structure

```
├── index.html              # Main HTML markup with HUD and modals
├── vite.config.js          # Vite configuration
├── package.json            # Dependencies and npm scripts
├── public/                 # Static assets and icons
│   └── robot-icon.svg
├── src/
│   ├── main.js             # Application bootstrap
│   ├── ui.js               # Clean separation of all UI and DOM manipulation logic
│   ├── environment.js      # 3D laboratory environment, lighting & smart table
│   ├── robotParts.js       # Procedural generation of all 3D robotic components (No GLBs needed)
│   ├── dragDropSystem.js   # 3D raycasting, magnetic snapping & manipulation
│   ├── robotSimulator.js   # Kinematics engine, driving physics & work cycles
│   ├── tutorialSystem.js   # AI adaptive learning tutorials and assembly lessons
│   ├── robotPresets.js     # Pre-assembled showcase robot templates
│   ├── galleryModal.js     # 3D schematics blueprint gallery & snapshot export
│   └── style.css           # Glassmorphic HUD & responsive styles
```

---

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- `npm` or `yarn`

### Installation & Launch

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Start the local development server**:
   ```bash
   npm run dev
   ```
   Open your browser and navigate to `http://localhost:5173/`.

3. **Build for production**:
   ```bash
   npm run build
   ```
   The compiled bundle will be output to the `dist/` directory.
